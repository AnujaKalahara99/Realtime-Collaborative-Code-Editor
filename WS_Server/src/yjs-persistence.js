import { config } from "dotenv";
config();
import { createClient } from "@supabase/supabase-js";
import * as Y from "yjs";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export class YjsPersistence {
  constructor() {
    this.docs = new Map();
    this.saveTimeouts = new Map();
    this.SAVE_DELAY = 3000; // 3 seconds
  }

  async bindState(sessionId, ydoc) {
    console.log(`Binding state for session: ${sessionId}`);
    this.docs.set(sessionId, ydoc);

    await this.loadFromDatabase(sessionId, ydoc);
    this.setupUpdateHandler(sessionId, ydoc);
  }

  async loadFromDatabase(sessionId, ydoc) {
    try {
        const { data: filesMeta, error: metaError } = await supabase
          .from("session_files")
          .select("id, file_path, storage_path")
          .eq("session_id", sessionId);

        if (metaError) {
          console.error(
            `Error loading session_files for ${sessionId}:`,
            metaError
          );
          return;
        }

        const files = [];
        if (filesMeta && filesMeta.length > 0) {
          for (const meta of filesMeta) {
            let content = "";
            if (meta.storage_path) {
              const { data: fileData, error: storageError } =
                await supabase.storage
                  .from("sessionFiles")
                  .download(meta.storage_path);

              if (storageError) {
                console.error(
                  `Error downloading file ${meta.storage_path}:`,
                  storageError
                );
            } else if (fileData) {
              content = new TextDecoder().decode(await fileData.arrayBuffer());
            }
          }
          files.push({
            id: meta.id,
            file_type: "file",
            file_path: meta.file_path,
            storage_path: meta.storage_path,
            content,
          });
        }
      }

      console.log(
        `Loading ${files?.length || 0} files for session: ${sessionId}`
      );

      if (files && files.length > 0) {
        const fileSystemMap = ydoc.getMap("fileSystem");

        const createNestedStructure = (filesList) => {
          const root = [];
          const pathMap = new Map();

          filesList.forEach((file) => {
            const filePath = file.file_path;
            const pathParts = filePath.split("/").filter(Boolean);
            const fileName = pathParts.pop();

            let currentLevel = root;
            let currentPath = "";

            // Create folders as needed
            for (const part of pathParts) {
              currentPath += (currentPath ? "/" : "") + part;

              // Check if folder already exists at this level
              let folder = currentLevel.find(
                (item) => item.type === "folder" && item.name === part
              );

              if (!folder) {
                // Create folder if it doesn't exist
                const folderId = `folder-${currentPath.replace(
                  /[\/\\]/g,
                  "-"
                )}`;
                folder = {
                  id: folderId,
                  name: part,
                  type: "folder",
                  children: [],
                };
                currentLevel.push(folder);
                pathMap.set(currentPath, folder);
              }

              currentLevel = folder.children;
            }

            // Add file to the current level
            currentLevel.push({
              id: file.id,
              name: fileName,
              type: file.file_type || "file",
              path: file.storage_path,
            });
          });

          return root;
        };

        const nestedFiles = createNestedStructure(files);
        fileSystemMap.set("files", nestedFiles);

        files.forEach((file) => {
          if (file.content) {
            const fileText = ydoc.getText(`file-${file.id}`);
            if (fileText.length === 0) {
              fileText.insert(0, file.content);
            }
          }
        });
      }
    } catch (error) {
      console.error(
        `Failed to load from database for session ${sessionId}:`,
        error
      );
    }
  }

  setupUpdateHandler(sessionId, ydoc) {
    ydoc.on("update", (update, origin) => {
      if (origin !== "persistence") {
        this.debouncedSave(sessionId, ydoc);
      }
    });
  }

  debouncedSave(sessionId, ydoc) {
    // Clear existing timeout
    if (this.saveTimeouts.has(sessionId)) {
      clearTimeout(this.saveTimeouts.get(sessionId));
    }

    // Set new timeout
    const timeoutId = setTimeout(async () => {
      await this.syncToDatabase(sessionId, ydoc);
    }, this.SAVE_DELAY);

    this.saveTimeouts.set(sessionId, timeoutId);
  }

  async syncToDatabase(sessionId, ydoc) {
    try {
      const fileSystemMap = ydoc.getMap("fileSystem");
      const files = fileSystemMap.get("files") || [];

      // Get all files (including nested ones)
      const getAllFiles = (fileTree) => {
        const allFiles = [];
        const traverse = (items) => {
          for (const item of items) {
            if (item.type === "file") {
              allFiles.push(item);
            } else if (item.type === "folder" && item.children) {
              traverse(item.children);
            }
          }
        };
        traverse(fileTree);
        return allFiles;
      };

      // Build file path
      const buildFilePath = (targetFileId, fileTree, currentPath = "") => {
        for (const item of fileTree) {
          if (item.id === targetFileId && item.type === "file") {
            return currentPath + item.name;
          }
          if (item.type === "folder" && item.children) {
            const foundPath = buildFilePath(
              targetFileId,
              item.children,
              currentPath + item.name + "/"
            );
            if (foundPath) return foundPath;
          }
        }
        return null;
      };

      const allFiles = getAllFiles(files);
      console.log(`Syncing ${allFiles.length} files for session ${sessionId}`);

      const currentFileIds = new Set(
        allFiles.map((file) => file.id).filter(Boolean)
      );

      const { data: dbFiles, error: fetchError } = await supabase
        .from("session_files")
        .select("id, storage_path")
        .eq("session_id", sessionId);

      if (fetchError) {
        console.error(
          `Error fetching files for session ${sessionId}:`,
          fetchError
        );
        return;
      }

      const idsToDelete = dbFiles
        .map((dbFile) => dbFile.id)
        .filter((id) => !currentFileIds.has(id));

      if (idsToDelete.length > 0) {
        const pathsToDelete = dbFiles
          .filter((dbFile) => idsToDelete.includes(dbFile.id))
          .map((dbFile) => dbFile.storage_path)
          .filter(Boolean);

        const { error: deleteError } = await supabase
          .from("session_files")
          .delete()
          .in("id", idsToDelete);

        if (deleteError) {
          console.error(`Error deleting files:`, deleteError);
        } else {
          console.log(`🗑️ Deleted files with IDs: ${idsToDelete.join(", ")}`);
        }

        if (pathsToDelete.length > 0) {
          const { error: storageError } = await supabase.storage
            .from("sessionFiles")
            .remove(pathsToDelete);

          if (storageError) {
            console.error(`Error deleting files from storage:`, storageError);
          } else {
            console.log(
              `🗑️ Deleted files from storage: ${pathsToDelete.join(", ")}`
            );
          }
        }
      }

      const filesToUpsert = [];
      const storageUploads = [];

      for (const file of allFiles) {
        if (!file.id) continue;

        const fileText = ydoc.getText(`file-${file.id}`);
        const content = fileText.toString();
        const filePath = buildFilePath(file.id, files) || file.name;
        const storagePath = `${sessionId}/${file.name}_${file.id}`;

        filesToUpsert.push({
          id: file.id,
          session_id: sessionId,
          file_path: filePath,
          storage_path: storagePath,
          created_by: "4e4f8c26-6557-4578-a05c-612d1ebef6ee",
          updated_at: new Date().toISOString(),
        });

        storageUploads.push({
          path: storagePath,
          content: content,
        });
      }

      if (filesToUpsert.length > 0) {
        const { error: upsertError } = await supabase
          .from("session_files")
          .upsert(filesToUpsert, { onConflict: ["id"] });

        if (upsertError) {
          console.error(`Error upserting files:`, upsertError);
        } else {
          console.log(`✅ Upserted ${filesToUpsert.length} files`);
        }
      }

      for (const upload of storageUploads) {
        const { error: storageError } = await supabase.storage
          .from("sessionFiles")
          .upload(upload.path, upload.content, {
            upsert: true,
            contentType: "text/plain",
          });

        if (storageError) {
          // Ignore "The resource already exists" error if upsert is true
          if (storageError.message !== "The resource already exists") {
            console.error(
              `Error uploading file to storage (${upload.path}):`,
              storageError
            );
          }
        } else {
          console.log(`✅ Uploaded file to storage: ${upload.path}`);
        }
      }
    } catch (error) {
      console.error(
        `Failed to sync to database for session ${sessionId}:`,
        error
      );
    }
  }

  async writeState(sessionId, ydoc) {
    // Clear any pending save
    if (this.saveTimeouts.has(sessionId)) {
      clearTimeout(this.saveTimeouts.get(sessionId));
      this.saveTimeouts.delete(sessionId);
    }

    // Final sync
    await this.syncToDatabase(sessionId, ydoc);

    // Cleanup
    this.docs.delete(sessionId);
  }
}

export const yjsPersistence = new YjsPersistence();
