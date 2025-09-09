import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import os from "os";
import supabase from "./supabaseClient.js";

const execPromise = promisify(exec);

/**
 * Downloads a zipped .git folder from Supabase storage and extracts it to the specified directory
 *
 * @param {string} sessionId - The session ID associated with the Git repository
 * @param {boolean} [useUserHome=true] - Whether to use the user's home directory as the base path
 * @returns {Promise<string>} - Returns the path where the .git folder was extracted
 */
export async function getGitFolderFromStorage(sessionId, useUserHome = true) {
  try {
    console.log(`Fetching git repository for session: ${sessionId}`);

    const basePath = useUserHome ? os.homedir() : "";
    const finalDestination = basePath;

    const tempDir = path.join(os.tmpdir(), `git-${sessionId}-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });
    const zipPath = path.join(tempDir, `git-${sessionId}.zip`);

    const { data, error } = await supabase.storage
      .from("gitFiles")
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

    const buffer = await data.arrayBuffer();
    await fs.writeFile(zipPath, Buffer.from(buffer));
    console.log(`Downloaded git zip to: ${zipPath}`);

    await fs.mkdir(finalDestination, { recursive: true });

    console.log(`Extracting git zip to: ${finalDestination}`);
    if (process.platform === "win32") {
      await execPromise(
        `powershell -command "Expand-Archive -Path '${zipPath}' -DestinationPath '${finalDestination}' -Force"`
      );
    } else {
      await execPromise(`unzip -o "${zipPath}" -d "${finalDestination}"`);
    }

    console.log(
      `Successfully extracted git repository to: ${finalDestination}`
    );

    await fs.rm(tempDir, { recursive: true, force: true });

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
 * @returns {Promise<boolean>} - Returns true if successful
 */
export async function saveGitFolderToStorage(sessionId, useUserHome = true) {
  try {
    console.log(`Saving git repository for session: ${sessionId}`);

    const basePath = useUserHome ? os.homedir() : "";
    const sourcePath = basePath;
    const tempDir = path.join(os.tmpdir(), `git-${sessionId}-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });
    const zipPath = path.join(tempDir, `git-${sessionId}.zip`);

    console.log(`Zipping .git folder from: ${sourcePath}`);
    if (process.platform === "win32") {
      await execPromise(
        `powershell -command "Compress-Archive -Path '${sourcePath}\\*' -DestinationPath '${zipPath}' -Force"`
      );
    } else {
      await execPromise(`cd "${sourcePath}" && zip -r "${zipPath}" .`);
    }

    const fileStream = fsSync.createReadStream(zipPath);
    const { error } = await supabase.storage
      .from("gitZips")
      .upload(`${sessionId}.zip`, fileStream, {
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

    await fs.rm(tempDir, { recursive: true, force: true });

    return true;
  } catch (error) {
    console.error("Error saving git folder to storage:", error);
    throw error;
  }
}

/**
 * Checks if a git repository exists in storage for the given session
 *
 * @param {string} sessionId - The session ID to check
 * @returns {Promise<boolean>} - Returns true if the repository exists
 */
export async function checkGitFolderExists(sessionId) {
  try {
    const { data, error } = await supabase.storage.from("gitFiles").list("", {
      search: `${sessionId}.zip`,
    });

    if (error) {
      console.error("Error checking git zip existence:", error);
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
 *
 * @param {string} branchId - The branch ID for this commit
 * @param {string|null} parentCommitId - The parent commit ID (null for initial commit)
 * @param {string} commitHash - The Git commit hash
 * @param {string} message - The commit message
 * @returns {Promise<Object>} - The created commit object
 */
export async function saveCommitToDatabase(
  branchId,
  parentCommitId,
  commitHash,
  message
) {
  try {
    console.log(
      `Saving commit to database: ${commitHash} for branch: ${branchId}`
    );

    const commitData = {
      branch_id: branchId,
      commit_hash: commitHash,
      message: message,
    };

    // Only add parent_commit_id if it exists
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
 * Gets the latest commit for a branch
 *
 * @param {string} branchId - The branch ID
 * @returns {Promise<Object|null>} - The latest commit object or null if none exists
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
      // PGRST116 is the "no rows returned" error
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
