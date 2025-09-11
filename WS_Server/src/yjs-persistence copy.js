// import { config } from "dotenv";
// config();
// import { createClient } from "@supabase/supabase-js";
// import * as Y from "yjs";

// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_ANON_KEY
// );

// export class YjsPersistence {
//   constructor() {
//     this.docs = new Map();
//     this.saveTimeouts = new Map();
//     this.SAVE_DELAY = 3000; // 3 seconds
//   }

//   async bindState(workspaceId, ydoc) {
//     console.log(`Binding state for workspace: ${workspaceId}`);
//     this.docs.set(workspaceId, ydoc);

//     await this.loadFromDatabase(workspaceId, ydoc);
//     this.setupUpdateHandler(workspaceId, ydoc);
//   }

//   async loadFromDatabase(workspaceId, ydoc) {
//     try {
//       const { data: files, error } = await supabase
//         .from("files")
//         .select("id, name, file_type, storage_path, content")
//         .eq("workspace_id", workspaceId);

//       if (error) {
//         console.error(`Error loading files for ${workspaceId}:`, error);
//         return;
//       }

//       console.log(
//         `Loading ${files?.length || 0} files for workspace: ${workspaceId}`
//       );

//       if (files && files.length > 0) {
//         const fileSystemMap = ydoc.getMap("fileSystem");

//         // Convert flat file list to nested structure
//         const createNestedStructure = (filesList) => {
//           const root = [];
//           const pathMap = new Map(); // To track created folders

//           filesList.forEach((file) => {
//             const filePath = file.storage_path || file.name;
//             const pathParts = filePath.split("/").filter(Boolean);
//             const fileName = pathParts.pop() || file.name;

//             let currentLevel = root;
//             let currentPath = "";

//             // Create folders as needed
//             for (const part of pathParts) {
//               currentPath += (currentPath ? "/" : "") + part;

//               // Check if folder already exists at this level
//               let folder = currentLevel.find(
//                 (item) => item.type === "folder" && item.name === part
//               );

//               if (!folder) {
//                 // Create folder if it doesn't exist
//                 const folderId = `folder-${currentPath.replace(
//                   /[\/\\]/g,
//                   "-"
//                 )}`;
//                 folder = {
//                   id: folderId,
//                   name: part,
//                   type: "folder",
//                   children: [],
//                 };
//                 currentLevel.push(folder);
//                 pathMap.set(currentPath, folder);
//               }

//               currentLevel = folder.children;
//             }

//             // Add file to the current level
//             currentLevel.push({
//               id: file.id,
//               name: fileName,
//               type: file.file_type || "file",
//               path: file.storage_path,
//             });
//           });

//           return root;
//         };

//         const nestedFiles = createNestedStructure(files);
//         fileSystemMap.set("files", nestedFiles);

//         files.forEach((file) => {
//           if (file.content) {
//             const fileText = ydoc.getText(`file-${file.id}`);
//             if (fileText.length === 0) {
//               fileText.insert(0, file.content);
//             }
//           }
//         });
//       }
//     } catch (error) {
//       console.error(
//         `Failed to load from database for workspace ${workspaceId}:`,
//         error
//       );
//     }
//   }

//   setupUpdateHandler(workspaceId, ydoc) {
//     ydoc.on("update", (update, origin) => {
//       if (origin !== "persistence") {
//         this.debouncedSave(workspaceId, ydoc);
//       }
//     });
//   }

//   debouncedSave(workspaceId, ydoc) {
//     // Clear existing timeout
//     if (this.saveTimeouts.has(workspaceId)) {
//       clearTimeout(this.saveTimeouts.get(workspaceId));
//     }

//     // Set new timeout
//     const timeoutId = setTimeout(async () => {
//       await this.syncToDatabase(workspaceId, ydoc);
//     }, this.SAVE_DELAY);

//     this.saveTimeouts.set(workspaceId, timeoutId);
//   }

//   async syncToDatabase(workspaceId, ydoc) {
//     try {
//       const fileSystemMap = ydoc.getMap("fileSystem");
//       const files = fileSystemMap.get("files") || [];

//       // Get all files (including nested ones)
//       const getAllFiles = (fileTree) => {
//         const allFiles = [];
//         const traverse = (items) => {
//           for (const item of items) {
//             if (item.type === "file") {
//               allFiles.push(item);
//             } else if (item.type === "folder" && item.children) {
//               traverse(item.children);
//             }
//           }
//         };
//         traverse(fileTree);
//         return allFiles;
//       };

//       // Build file path
//       const buildFilePath = (targetFileId, fileTree, currentPath = "") => {
//         for (const item of fileTree) {
//           if (item.id === targetFileId && item.type === "file") {
//             return currentPath + item.name;
//           }
//           if (item.type === "folder" && item.children) {
//             const foundPath = buildFilePath(
//               targetFileId,
//               item.children,
//               currentPath + item.name + "/"
//             );
//             if (foundPath) return foundPath;
//           }
//         }
//         return null;
//       };

//       const allFiles = getAllFiles(files);
//       console.log(
//         `Syncing ${allFiles.length} files for workspace ${workspaceId}`
//       );

//       // Get current file IDs from document
//       const currentFileIds = new Set(
//         allFiles.map((file) => file.id).filter(Boolean)
//       );

//       // Fetch all files for this workspace from database
//       const { data: dbFiles, error: fetchError } = await supabase
//         .from("files")
//         .select("id")
//         .eq("workspace_id", workspaceId);

//       if (fetchError) {
//         console.error(
//           `Error fetching files for workspace ${workspaceId}:`,
//           fetchError
//         );
//       } else {
//         // Check for files that exist in DB but not in the document - these need to be deleted
//         for (const dbFile of dbFiles) {
//           if (!currentFileIds.has(dbFile.id)) {
//             // This file exists in DB but not in document, so delete it
//             const { error: deleteError } = await supabase
//               .from("files")
//               .delete()
//               .eq("id", dbFile.id);

//             if (deleteError) {
//               console.error(`Error deleting file ${dbFile.id}:`, deleteError);
//             } else {
//               console.log(`🗑️ Deleted file with ID: ${dbFile.id}`);
//             }
//           }
//         }
//       }

//       // Process existing files (add/update)
//       for (const file of allFiles) {
//         if (!file.id) continue;

//         const fileText = ydoc.getText(`file-${file.id}`);
//         const content = fileText.toString();
//         const filePath = buildFilePath(file.id, files) || file.name;

//         const { data: existingFile } = await supabase
//           .from("files")
//           .select("id")
//           .eq("id", file.id)
//           .single();

//         if (!existingFile) {
//           // Insert new file
//           const { error } = await supabase.from("files").insert({

//             workspace_id: workspaceId,
//             name: file.name,
//             file_type: file.type || "file",
//             storage_path: filePath,
//             content: content,
//             created_by: "4e4f8c26-6557-4578-a05c-612d1ebef6ee",
//           });

//           if (error) {
//             console.error(`Error inserting file ${file.id}:`, error);
//           } else {
//             console.log(`✅ Inserted file: ${file.name}`);
//           }
//         } else {
//           // Update existing file
//           const { error } = await supabase
//             .from("files")
//             .update({
//               name: file.name,
//               file_type: file.type || "file",
//               storage_path: filePath,
//               content: content,
//               updated_at: new Date().toISOString(),
//             })
//             .eq("id", file.id);

//           if (error) {
//             console.error(`Error updating file ${file.id}:`, error);
//           } else {
//             console.log(`✅ Updated file: ${file.name}`);
//           }
//         }
//       }
//     } catch (error) {
//       console.error(
//         `Failed to sync to database for workspace ${workspaceId}:`,
//         error
//       );
//     }
//   }

//   async writeState(workspaceId, ydoc) {
//     // Clear any pending save
//     if (this.saveTimeouts.has(workspaceId)) {
//       clearTimeout(this.saveTimeouts.get(workspaceId));
//       this.saveTimeouts.delete(workspaceId);
//     }

//     // Final sync
//     await this.syncToDatabase(workspaceId, ydoc);

//     // Cleanup
//     this.docs.delete(workspaceId);
//   }
// }

// export const yjsPersistence = new YjsPersistence();
