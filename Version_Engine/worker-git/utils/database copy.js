// import fs from "fs/promises";
// import fsSync from "fs";
// import path from "path";
// import { exec } from "child_process";
// import { promisify } from "util";
// import os from "os";
// import supabase from "./supabaseClient.js";

// const execPromise = promisify(exec);

// const fileMappingsStore = new Map();

// /**
//  * Downloads a zipped .git folder from Supabase storage and extracts it to the specified directory
//  *
//  * @param {string} sessionId - The session ID associated with the Git repository
//  * @param {string} [finalDestination=os.homedir()] - The final destination path for the extracted .git folder
//  * @returns {Promise<string>} - Returns the path where the .git folder was extracted
//  */
// export async function getGitFolderFromStorage(
//   sessionId,
//   finalDestination = os.homedir()
// ) {
//   try {
//     console.log(`Fetching git repository for session: ${sessionId}`);

//     const tempDir = path.join(os.tmpdir(), `git-${sessionId}-${Date.now()}`);
//     await fs.mkdir(tempDir, { recursive: true });
//     const zipPath = path.join(tempDir, `git-${sessionId}.zip`);

//     const { data, error } = await supabase.storage
//       .from("gitFolders")
//       .download(`${sessionId}.zip`);

//     if (error) {
//       console.error(
//         `Error downloading git zip for session ${sessionId}:`,
//         error
//       );
//       throw new Error(`Failed to download git zip: ${error.message}`);
//     }

//     if (!data) {
//       console.warn(`No git zip found for session: ${sessionId}`);
//       return null;
//     }

//     const buffer = await data.arrayBuffer();
//     await fs.writeFile(zipPath, Buffer.from(buffer));
//     console.log(`Downloaded git zip to: ${zipPath}`);

//     await fs.mkdir(finalDestination, { recursive: true });

//     console.log(`Extracting git zip to: ${finalDestination}`);
//     if (process.platform === "win32") {
//       await execPromise(
//         `powershell -command "Expand-Archive -Path '${zipPath}' -DestinationPath '${finalDestination}' -Force"`
//       );
//     } else {
//       await execPromise(`unzip -o "${zipPath}" -d "${finalDestination}/.git"`);
//     }

//     console.log(
//       `Successfully extracted git repository to: ${finalDestination}`
//     );

//     await fs.rm(tempDir, { recursive: true, force: true });

//     return finalDestination;
//   } catch (error) {
//     console.error("Error getting git folder from storage:", error);
//     throw error;
//   }
// }

// /**
//  * Saves a .git folder as a zip file to Supabase storage
//  *
//  * @param {string} sessionId - The session ID to associate with the Git repository
//  * @param {string} [sourcePath=os.homedir()] - The source path where the .git folder is located
//  * @returns {Promise<boolean>} - Returns true if successful
//  */
// export async function saveGitFolderToStorage(
//   sessionId,
//   sourcePath = os.homedir()
// ) {
//   try {
//     console.log(`Saving git repository for session: ${sessionId}`);

//     const tempDir = path.join(os.tmpdir(), `git-${sessionId}-${Date.now()}`);
//     await fs.mkdir(tempDir, { recursive: true });
//     const zipPath = path.join(tempDir, `git-${sessionId}.zip`);

//     console.log(`Zipping .git folder from: ${sourcePath}`);
//     if (process.platform === "win32") {
//       await execPromise(
//         `powershell -command "Compress-Archive -Path '${sourcePath}\\*' -DestinationPath '${zipPath}' -Force"`
//       );
//     } else {
//       await execPromise(`cd "${sourcePath}"/.git && zip -r "${zipPath}" .`);
//     }

//     const fileBuffer = await fs.readFile(zipPath);

//     const { error } = await supabase.storage
//       .from("gitFolders")
//       .upload(`${sessionId}.zip`, fileBuffer, {
//         contentType: "application/zip",
//         upsert: true,
//         duplex: "half",
//       });

//     if (error) {
//       console.error(`Error uploading git zip for session ${sessionId}:`, error);
//       throw new Error(`Failed to upload git zip: ${error.message}`);
//     }

//     console.log(
//       `Successfully uploaded git repository for session: ${sessionId}`
//     );

//     await fs.rm(tempDir, { recursive: true, force: true });

//     return true;
//   } catch (error) {
//     console.error("Error saving git folder to storage:", error);
//     throw error;
//   }
// }

// /**
//  * Checks if a git repository exists in storage for the given session
//  *
//  * @param {string} sessionId - The session ID to check
//  * @returns {Promise<boolean>} - Returns true if the repository exists
//  */
// export async function checkGitFolderExists(sessionId) {
//   try {
//     const { data, error } = await supabase.storage.from("gitFolders").list("", {
//       search: `${sessionId}`,
//     });

//     if (error) {
//       console.error("Error checking git folder existence:", error);
//       return false;
//     }

//     return data && data.some((file) => file.name === `${sessionId}.zip`);
//   } catch (error) {
//     console.error("Error in checkGitFolderExists:", error);
//     return false;
//   }
// }

// /**
//  * Saves a commit to the database
//  *
//  * @param {string} branchId - The branch ID for this commit
//  * @param {string|null} parentCommitId - The parent commit ID (null for initial commit)
//  * @param {string} commitHash - The Git commit hash
//  * @param {string} message - The commit message
//  * @returns {Promise<Object>} - The created commit object
//  */
// export async function saveCommitToDatabase(
//   branchId,
//   parentCommitId,
//   commitHash,
//   message
// ) {
//   try {
//     console.log(
//       `Saving commit to database: ${commitHash} for branch: ${branchId}`
//     );

//     const commitData = {
//       branch_id: branchId,
//       commit_hash: commitHash,
//       message: message,
//     };

//     // Only add parent_commit_id if it exists
//     if (parentCommitId) {
//       commitData.parent_commit_id = parentCommitId;
//     }

//     const { data, error } = await supabase
//       .from("commits")
//       .insert(commitData)
//       .select()
//       .single();

//     if (error) {
//       console.error("Error saving commit to database:", error);
//       throw new Error(`Failed to save commit: ${error.message}`);
//     }

//     console.log(`Successfully saved commit: ${data.id}`);
//     return data;
//   } catch (error) {
//     console.error("Error in saveCommitToDatabase:", error);
//     throw error;
//   }
// }

// /**
//  * Loads files from a session and saves them to the current working directory
//  *
//  * @param {string} sessionId - The session ID to load files from
//  * @param {string} [targetDirectory=process.cwd()] - The directory where files should be saved
//  * @returns {Promise<string[]>} - Returns an array of saved file paths
//  */
// export async function loadSessionFiles(
//   sessionId,
//   targetDirectory = process.cwd()
// ) {
//   try {
//     console.log(`Loading session files for session: ${sessionId}`);

//     const { data: filesMeta, error: metaError } = await supabase
//       .from("session_files")
//       .select("id, file_path, storage_path")
//       .eq("session_id", sessionId);

//     if (metaError) {
//       console.error(`Error loading session_files for ${sessionId}:`, metaError);
//       throw new Error(
//         `Failed to load session files metadata: ${metaError.message}`
//       );
//     }

//     if (!filesMeta || filesMeta.length === 0) {
//       console.log(`No files found for session: ${sessionId}`);
//       return [];
//     }

//     const savedFiles = [];
//     const fileMappings = {};

//     for (const meta of filesMeta) {
//       try {
//         if (!meta.storage_path) {
//           console.warn(`Missing storage_path for file: ${meta.file_path}`);
//           continue;
//         }

//         const { data: fileData, error: storageError } = await supabase.storage
//           .from("sessionFiles")
//           .download(meta.storage_path);

//         if (storageError) {
//           console.error(
//             `Error downloading file ${meta.storage_path}:`,
//             storageError
//           );
//           continue;
//         }

//         if (!fileData) {
//           console.warn(`No data found for file: ${meta.storage_path}`);
//           continue;
//         }

//         const filePath = path.join(targetDirectory, meta.file_path);
//         const fileDir = path.dirname(filePath);
//         await fs.mkdir(fileDir, { recursive: true });

//         const buffer = Buffer.from(await fileData.arrayBuffer());
//         await fs.writeFile(filePath, buffer);

//         fileMappings[meta.file_path] = {
//           name: meta.file_path.split("/").pop(),
//           id: meta.id,
//           storage_path: meta.storage_path,
//         };

//         console.log(`Saved file: ${filePath}`);
//         savedFiles.push(filePath);
//       } catch (fileError) {
//         console.error(`Error processing file ${meta.file_path}:`, fileError);
//       }
//     }

//     fileMappingsStore.set(sessionId, {
//       sessionId,
//       targetDirectory,
//       files: fileMappings,
//     });
//     +console.log(
//       `Successfully loaded ${savedFiles.length} files for session: ${sessionId}`
//     );
//     return savedFiles;
//   } catch (error) {
//     console.error("Error in loadSessionFiles:", error);
//     throw error;
//   }
// }

// /**
//  * Saves files from a directory to the session storage
//  *
//  * @param {string} sessionId - The session ID to associate with the files
//  * @param {string} [sourceDirectory=process.cwd()] - The directory containing files to save
//  * @returns {Promise<string[]>} - Returns an array of saved file paths
//  */
// export async function saveSessionFiles(
//   sessionId,
//   sourceDirectory = process.cwd()
// ) {
//   try {
//     const savedFiles = [];
//     const ignorePatterns = [".git", "node_modules"];

//     const existingMappings = fileMappingsStore.get(sessionId);
//     const fileMappings = existingMappings?.files || {};

//     async function processDirectory(dirPath, relativePath = "") {
//       const entries = await fs.readdir(dirPath, { withFileTypes: true });
//       const filesToProcess = [];

//       for (const entry of entries) {
//         const fullPath = path.join(dirPath, entry.name);
//         const relativeFsPath = path.join(relativePath, entry.name);
//         const normalizedPath = relativeFsPath.replace(/\\/g, "/");

//         if (ignorePatterns.some((pattern) => entry.name.includes(pattern))) {
//           continue;
//         }

//         if (entry.isDirectory()) {
//           await processDirectory(fullPath, relativeFsPath);
//         } else if (entry.isFile()) {
//           filesToProcess.push({
//             fullPath,
//             relativeFsPath,
//             normalizedPath,
//           });
//         }
//       }

//       if (filesToProcess.length > 0) {
//         const fileContents = await Promise.all(
//           filesToProcess.map(async (file) => {
//             const content = await fs.readFile(file.fullPath);
//             return {
//               ...file,
//               content,
//             };
//           })
//         );

//         const storageOps = fileContents.map((file) => {
//           const existingMapping = fileMappings[file.normalizedPath];
//           const storagePath =
//             existingMapping?.storage_path ||
//             `${sessionId}/${file.normalizedPath}`;

//           return {
//             file,
//             storagePath,
//             fileId: existingMapping?.id || null,
//           };
//         });

//         const BATCH_SIZE = 5; // Adjust based on your needs
//         for (let i = 0; i < storageOps.length; i += BATCH_SIZE) {
//           const batch = storageOps.slice(i, i + BATCH_SIZE);
//           await Promise.all(
//             batch.map(async (op) => {
//               const { error } = await supabase.storage
//                 .from("sessionFiles")
//                 .upload(op.storagePath, op.file.content, {
//                   contentType: "application/octet-stream",
//                   upsert: true,
//                 });

//               if (error) {
//                 console.error(
//                   `Error uploading file ${op.file.normalizedPath}:`,
//                   error
//                 );
//                 op.failed = true;
//               }
//             })
//           );
//         }

//         const successfulUploads = storageOps.filter((op) => !op.failed);

//         const dbOperations = successfulUploads.map((op) => ({
//           id: op.fileId,
//           session_id: sessionId,
//           file_path: op.file.normalizedPath,
//           storage_path: op.storagePath,
//           updated_at: new Date().toISOString(),
//           created_by: "4e4f8c26-6557-4578-a05c-612d1ebef6ee",
//         }));

//         if (dbOperations.length > 0) {
//           const { data, error } = await supabase
//             .from("session_files")
//             .upsert(dbOperations, { onConflict: "id" })
//             .select();

//           if (error) {
//             console.error("Error batch updating file metadata:", error);
//           } else {
//             data.forEach((fileData) => {
//               const filePath = fileData.file_path;
//               fileMappings[filePath] = {
//                 id: fileData.id,
//                 storage_path: fileData.storage_path,
//               };
//               savedFiles.push(filePath);
//             });
//           }
//         }
//       }
//     }

//     await processDirectory(sourceDirectory);
//     return savedFiles;
//   } catch (error) {
//     console.error("Error in saveSessionFiles:", error);
//     throw error;
//   }
// }

// /**
//  * Gets the latest commit for a branch
//  *
//  * @param {string} branchId - The branch ID
//  * @returns {Promise<Object|null>} - The latest commit object or null if none exists
//  */
// export async function getLatestCommit(branchId) {
//   try {
//     const { data, error } = await supabase
//       .from("commits")
//       .select("*")
//       .eq("branch_id", branchId)
//       .order("created_at", { ascending: false })
//       .limit(1)
//       .single();

//     if (error && error.code !== "PGRST116") {
//       // PGRST116 is the "no rows returned" error
//       console.error(
//         `Error fetching latest commit for branch ${branchId}:`,
//         error
//       );
//       throw new Error(`Failed to fetch latest commit: ${error.message}`);
//     }

//     return data || null;
//   } catch (error) {
//     console.error("Error in getLatestCommit:", error);
//     throw error;
//   }
// }
