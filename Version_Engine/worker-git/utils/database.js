import fs from "fs/promises";
import path from "path";
import os from "os";
import supabase from "./supabaseClient.js";
import {
  createTempDir,
  zipDirectory,
  unzipFile,
  cleanupTempDir,
  collectFiles,
} from "./fileSystem.js";

// In-memory file mappings store
const fileMappingsStore = new Map();

/**
 * Downloads a zipped .git folder from Supabase storage and extracts it to the specified directory
 */
export async function getGitFolderFromStorage(
  sessionId,
  finalDestination = os.homedir()
) {
  try {
    console.log(`Fetching git repository for session: ${sessionId}`);

    const tempDir = await createTempDir(`git-${sessionId}`);
    const zipPath = path.join(tempDir, `git-${sessionId}.zip`);

    const { data, error } = await supabase.storage
      .from("gitFolders")
      .download(`${sessionId}.zip`);

    if (error) {
      console.error(
        `Error downloading git zip for session ${sessionId}:`,
        error
      );
      throw new Error(`Failed to download git zip: ${error.message}`);
    }

    if (!data) {
      console.warn(`No git zip found for session: ${sessionId}`);
      return null;
    }

    const buffer = Buffer.from(await data.arrayBuffer());
    await fs.writeFile(zipPath, buffer);

    await fs.mkdir(finalDestination, { recursive: true });
    await unzipFile(zipPath, finalDestination);

    await cleanupTempDir(tempDir);

    return finalDestination;
  } catch (error) {
    console.error("Error getting git folder from storage:", error);
    throw error;
  }
}

/**
 * Saves a .git folder as a zip file to Supabase storage
 *
 * @param {string} sessionId - The session ID to associate with the Git repository
 * @param {string} [sourcePath=os.homedir()] - The source path where the .git folder is located
 * @returns {Promise<boolean>} - Returns true if successful
 */
export async function saveGitFolderToStorage(
  sessionId,
  sourcePath = os.homedir()
) {
  try {
    console.log(`Saving git repository for session: ${sessionId}`);

    const tempDir = await createTempDir(`git-${sessionId}`);
    const zipPath = path.join(tempDir, `git-${sessionId}.zip`);

    await zipDirectory(sourcePath, zipPath);

    const fileBuffer = await fs.readFile(zipPath);

    const { error } = await supabase.storage
      .from("gitFolders")
      .upload(`${sessionId}.zip`, fileBuffer, {
        contentType: "application/zip",
        upsert: true,
      });

    if (error) {
      console.error(`Error uploading git zip for session ${sessionId}:`, error);
      throw new Error(`Failed to upload git zip: ${error.message}`);
    }

    console.log(
      `Successfully uploaded git repository for session: ${sessionId}`
    );
    await cleanupTempDir(tempDir);

    return true;
  } catch (error) {
    console.error("Error saving git folder to storage:", error);
    throw error;
  }
}

/**
 * Checks if a git repository exists in storage for the given session
 */
export async function checkGitFolderExists(sessionId) {
  try {
    const { data, error } = await supabase.storage.from("gitFolders").list("", {
      search: `${sessionId}`,
    });

    if (error) {
      console.error("Error checking git folder existence:", error);
      return false;
    }

    return data && data.some((file) => file.name === `${sessionId}.zip`);
  } catch (error) {
    console.error("Error in checkGitFolderExists:", error);
    return false;
  }
}

/**
 * Saves a commit to the database
 */
export async function saveCommitToDatabase(
  branchId,
  parentCommitId,
  commitHash,
  message
) {
  try {
    console.log(`Saving commit: ${commitHash} for branch: ${branchId}`);

    const commitData = {
      branch_id: branchId,
      commit_hash: commitHash,
      message: message,
    };

    if (parentCommitId) {
      commitData.parent_commit_id = parentCommitId;
    }

    const { data, error } = await supabase
      .from("commits")
      .insert(commitData)
      .select()
      .single();

    if (error) {
      console.error("Error saving commit to database:", error);
      throw new Error(`Failed to save commit: ${error.message}`);
    }

    console.log(`Successfully saved commit: ${data.id}`);
    return data;
  } catch (error) {
    console.error("Error in saveCommitToDatabase:", error);
    throw error;
  }
}

/**
 * Loads files from a session and saves them to the current working directory
 */
export async function loadSessionFiles(
  sessionId,
  targetDirectory = process.cwd()
) {
  try {
    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    console.log(`Loading session files for session: ${sessionId}`);

    const { data: filesMeta, error: metaError } = await supabase
      .from("session_files")
      .select("id, file_path, storage_path")
      .eq("session_id", sessionId);

    if (metaError) {
      console.error(`Error loading session_files for ${sessionId}:`, metaError);
      throw new Error(
        `Failed to load session files metadata: ${metaError.message}`
      );
    }

    if (!filesMeta || filesMeta.length === 0) {
      console.log(`No files found for session: ${sessionId}`);
      return [];
    }

    const savedFiles = [];
    const fileMappings = {};

    // Download files in batches
    const BATCH_SIZE = 5;
    for (let i = 0; i < filesMeta.length; i += BATCH_SIZE) {
      const batch = filesMeta.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async (meta) => {
          try {
            if (!meta.storage_path) {
              console.warn(`Missing storage_path for file: ${meta.file_path}`);
              return;
            }

            const { data: fileData, error: storageError } =
              await supabase.storage
                .from("sessionFiles")
                .download(meta.storage_path);

            if (storageError || !fileData) {
              console.error(
                `Error downloading file ${meta.storage_path}:`,
                storageError
              );
              return;
            }

            const filePath = path.join(targetDirectory, meta.file_path);
            const fileDir = path.dirname(filePath);
            await fs.mkdir(fileDir, { recursive: true });

            const buffer = Buffer.from(await fileData.arrayBuffer());
            await fs.writeFile(filePath, buffer);

            fileMappings[meta.file_path] = {
              name: meta.file_path.split("/").pop(),
              id: meta.id,
              storage_path: meta.storage_path,
            };

            savedFiles.push(filePath);
          } catch (fileError) {
            console.error(
              `Error processing file ${meta.file_path}:`,
              fileError
            );
          }
        })
      );
    }

    fileMappingsStore.set(sessionId, {
      sessionId,
      targetDirectory,
      files: fileMappings,
    });

    console.log(
      `Successfully loaded ${savedFiles.length} files for session: ${sessionId}`
    );
    return savedFiles;
  } catch (error) {
    console.error("Error in loadSessionFiles:", error);
    throw error;
  }
}

/**
 * Saves files from a directory to the session storage using RPC
 */
export async function saveSessionFiles(
  sessionId,
  sourceDirectory = process.cwd()
) {
  try {
    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    const existingMappings = fileMappingsStore.get(sessionId);
    const fileMappings = existingMappings?.files || {};
    const userId = "4e4f8c26-6557-4578-a05c-612d1ebef6ee";

    const currentFiles = new Set();
    const filesForSync = [];
    const savedFiles = [];

    const filePaths = await collectFiles(sourceDirectory, [
      ".git",
      "node_modules",
    ]);

    const BATCH_SIZE = 10;
    const chunks = [];

    for (let i = 0; i < filePaths.length; i += BATCH_SIZE) {
      chunks.push(filePaths.slice(i, i + BATCH_SIZE));
    }

    for (const chunk of chunks) {
      await Promise.all(
        chunk.map(async ({ fullPath, normalizedPath }) => {
          try {
            currentFiles.add(normalizedPath);

            const existingMapping = fileMappings[normalizedPath];
            let storagePath;

            if (existingMapping?.storage_path) {
              storagePath = existingMapping.storage_path;
            } else {
              storagePath = null; // Will be generated by the database function
            }

            filesForSync.push({
              id: existingMapping?.id || null,
              file_path: normalizedPath,
              storage_path: storagePath,
            });
          } catch (error) {
            console.error(`Error processing ${fullPath}:`, error);
          }
        })
      );
    }

    if (filesForSync.length > 0) {
      console.log(`Syncing ${filesForSync.length} files with the database`);

      const { data, error } = await supabase.rpc(
        "sync_session_files_version_engine",
        {
          p_session_id: sessionId,
          p_files: filesForSync,
          p_created_by: userId,
        }
      );

      if (error) {
        console.error("Error syncing files with database:", error);
        throw new Error(`Failed to sync files: ${error.message}`);
      }

      if (data && data.length > 0) {
        for (const fileRecord of data) {
          if (fileRecord.deleted_storage_paths?.length) {
            console.log(
              `Removing ${fileRecord.deleted_storage_paths.length} orphaned files from storage`
            );
            await supabase.storage
              .from("sessionFiles")
              .remove(fileRecord.deleted_storage_paths);
          }

          // Upload the file with the correct storage path
          const filePath = path.join(sourceDirectory, fileRecord.file_path);
          const content = await fs.readFile(filePath);

          console.log(
            `Uploading file: ${fileRecord.file_path} to storage path: ${fileRecord.storage_path}`
          );

          const { error: uploadError } = await supabase.storage
            .from("sessionFiles")
            .upload(fileRecord.storage_path, content, {
              contentType: "application/octet-stream",
              upsert: true,
            });

          if (uploadError) {
            console.error(
              `Error uploading ${fileRecord.file_path}:`,
              uploadError
            );
          } else {
            savedFiles.push(fileRecord.file_path);
          }
        }

        const updatedMappings = {};
        data.forEach((fileRecord) => {
          updatedMappings[fileRecord.file_path] = {
            id: fileRecord.file_id,
            storage_path: fileRecord.storage_path,
            name: fileRecord.file_path.split("/").pop(),
          };
        });

        fileMappingsStore.set(sessionId, {
          sessionId,
          targetDirectory: sourceDirectory,
          files: updatedMappings,
        });
      }
    }

    return savedFiles;
  } catch (error) {
    console.error("Error in saveSessionFiles:", error);
    throw error;
  }
}

/**
 * Gets the latest commit for a branch
 */
export async function getLatestCommit(branchId) {
  try {
    const { data, error } = await supabase
      .from("commits")
      .select("*")
      .eq("branch_id", branchId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error(
        `Error fetching latest commit for branch ${branchId}:`,
        error
      );
      throw new Error(`Failed to fetch latest commit: ${error.message}`);
    }

    return data || null;
  } catch (error) {
    console.error("Error in getLatestCommit:", error);
    throw error;
  }
}

/**
 * Get file mappings for a session
 */
export function getFileMappings(sessionId) {
  return fileMappingsStore.get(sessionId);
}

/**
 * Clear file mappings for a session
 */
export function clearFileMappings(sessionId) {
  fileMappingsStore.delete(sessionId);
}

/**
 * Gets branch name from branch ID
 */
export const getBranchById = async (branchId) => {
  try {
    const { data, error } = await supabase
      .from("branches")
      .select("name")
      .eq("id", branchId)
      .single();

    if (error) {
      console.error(`Error fetching branch ${branchId}:`, error);
      throw new Error(`Failed to fetch branch: ${error.message}`);
    }

    return data?.name || null;
  } catch (error) {
    console.error("Error in getBranchById:", error);
    throw error;
  }
};

/**
 * Creates a new branch in the database
 */
export const createBranch = async (name, workspaceId) => {
  try {
    const { data, error } = await supabase
      .from("branches")
      .insert({ name, workspace_id: workspaceId })
      .select()
      .single();

    if (error) {
      console.error("Error creating branch:", error);
      throw new Error(`Failed to create branch: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error in createBranch:", error);
    throw error;
  }
};

/**
 * Creates a new session for a branch
 */
export const createSession = async (branchId) => {
  try {
    const { data, error } = await supabase
      .from("sessions")
      .insert({ branch_id: branchId })
      .select()
      .single();

    if (error) {
      console.error("Error creating session:", error);
      throw new Error(`Failed to create session: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error in createSession:", error);
    throw error;
  }
};

/**
 * Gets session by ID with workspace info
 */
export const getSessionById = async (sessionId) => {
  try {
    const { data, error } = await supabase
      .from("sessions")
      .select(
        `
        *,
        branches!inner(
          id,
          name,
          workspace_id
        )
      `
      )
      .eq("id", sessionId)
      .single();

    if (error) {
      console.error(`Error fetching session ${sessionId}:`, error);
      throw new Error(`Failed to fetch session: ${error.message}`);
    }

    return {
      ...data,
      workspace_id: data.branches.workspace_id,
      branch_name: data.branches.name,
    };
  } catch (error) {
    console.error("Error in getSessionById:", error);
    throw error;
  }
};
