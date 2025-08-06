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
    this.updateCounters = new Map();
    this.saveIntervals = new Map();

    // Configuration
    this.SAVE_INTERVAL = parseInt(process.env.SAVE_INTERVAL || "10000"); // 10 seconds
    this.UPDATES_THRESHOLD = parseInt(process.env.UPDATES_THRESHOLD || "20"); // 20 updates
  }

  async bindState(workspaceId, ydoc) {
    console.log(`Binding state for workspace: ${workspaceId}`);
    this.docs.set(workspaceId, ydoc);
    this.updateCounters.set(workspaceId, 0);

    await this.loadState(workspaceId, ydoc);
    this.setupUpdateHandler(workspaceId, ydoc);
    this.startPeriodicSave(workspaceId, ydoc);
  }

  async loadState(workspaceId, ydoc) {
    console.log(`Loading state for workspace: ${workspaceId}`);
    // Load YJS updates first
    const { data: updates } = await supabase
      .from("yjs_updates")
      .select("update_data")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: true });

    if (updates) {
      updates.forEach(({ update_data }) => {
        const uint8Array = new Uint8Array(update_data);
        Y.applyUpdate(ydoc, uint8Array, "persistence");
      });
    }

    await this.initializeFromDatabase(workspaceId, ydoc);
  }

  async initializeFromDatabase(workspaceId, ydoc) {
    const { data: files } = await supabase
      .from("files")
      .select("id, name, file_type, storage_path, content")
      .eq("workspace_id", workspaceId);

    console.log(`Initializing files for workspace: ${workspaceId}`, files);

    if (files && files.length > 0) {
      const fileSystemMap = ydoc.getMap("fileSystem");

      const filesArray = files.map((file) => ({
        id: file.id,
        name: file.name,
        type: file.file_type,
        path: file.storage_path,
      }));

      fileSystemMap.set("files", filesArray);

      files.forEach((file) => {
        if (file.content) {
          const fileText = ydoc.getText(`file-${file.id}`);
          if (fileText.length === 0) {
            fileText.insert(0, file.content);
          }
        }
      });
    }
  }

  setupUpdateHandler(workspaceId, ydoc) {
    ydoc.on("update", async (update, origin) => {
      if (origin !== "persistence") {
        await this.saveUpdate(workspaceId, update);

        // Increment update counter
        const currentCount = this.updateCounters.get(workspaceId) || 0;
        this.updateCounters.set(workspaceId, currentCount + 1);

        // Check if we should save based on update count
        if (currentCount + 1 >= this.UPDATES_THRESHOLD) {
          await this.syncToDatabase(workspaceId, ydoc);
          this.updateCounters.set(workspaceId, 0); // Reset counter
        }
      }
    });
  }

  startPeriodicSave(workspaceId, ydoc) {
    // Clear existing interval if any
    if (this.saveIntervals.has(workspaceId)) {
      clearInterval(this.saveIntervals.get(workspaceId));
    }

    // Start new interval
    const intervalId = setInterval(async () => {
      try {
        await this.syncToDatabase(workspaceId, ydoc);
        this.updateCounters.set(workspaceId, 0); // Reset counter after periodic save
      } catch (error) {
        console.error(
          `Periodic save failed for workspace ${workspaceId}:`,
          error
        );
      }
    }, this.SAVE_INTERVAL);

    this.saveIntervals.set(workspaceId, intervalId);
  }

  stopPeriodicSave(workspaceId) {
    if (this.saveIntervals.has(workspaceId)) {
      clearInterval(this.saveIntervals.get(workspaceId));
      this.saveIntervals.delete(workspaceId);
    }
  }

  async saveUpdate(workspaceId, update) {
    try {
      const res = await supabase.from("yjs_updates").insert({
        workspace_id: workspaceId,
        update_data: Array.from(update),
      });
      console.log(
        `Saving update for workspace: ${workspaceId} and response :`,
        res
      );
    } catch (error) {
      console.error(
        `Failed to save update for workspace ${workspaceId}:`,
        error
      );
    }
  }

  async syncToDatabase(workspaceId, ydoc) {
    try {
      const fileSystemMap = ydoc.getMap("fileSystem");
      const files = fileSystemMap.get("files") || [];

      // Helper function to build file path from nested file tree
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

      for (const file of files) {
        if (!file.id || file.type == "folder") continue;

        const fileText = ydoc.getText(`file-${file.id}`);
        const content = fileText.toString();

        const filePath = buildFilePath(file.id, files) || file.name;

        console.log(`Syncing file ${file.name} for workspace ${workspaceId}`);
        console.log("fileSystemMap :", fileSystemMap.toJSON());

        console.log(`Syncing file Properties :`, {
          id: file.id,
          name: file.name,
          type: file.type,
          path: filePath,
        });

        const { data: existingFile } = await supabase
          .from("files")
          .select("id")
          .eq("id", file.id)
          .single();

        if (!existingFile) {
          const res = await supabase.from("files").insert({
            id: file.id,
            workspace_id: workspaceId,
            name: file.name,
            file_type: file.type,
            storage_path: filePath,
            content: content,
            created_by: "4e4f8c26-6557-4578-a05c-612d1ebef6ee",
          });

          console.log(
            `Inserted new file ${file.name} for workspace ${workspaceId}:`,
            res
          );
        } else {
          const res = await supabase
            .from("files")
            .update({
              name: file.name,
              file_type: file.type,
              storage_path: file.path,
              content: content,
              updated_at: new Date().toISOString(),
            })
            .eq("id", file.id);

          console.log(
            `Updated file ${file.name} for workspace ${workspaceId}:`,
            res
          );
        }
      }
    } catch (error) {
      console.error(
        `Failed to sync to database for workspace ${workspaceId}:`,
        error
      );
    }
  }

  async writeState(workspaceId, ydoc) {
    // Stop periodic saving
    this.stopPeriodicSave(workspaceId);

    // Final sync to database
    await this.syncToDatabase(workspaceId, ydoc);

    // Cleanup
    this.docs.delete(workspaceId);
    this.updateCounters.delete(workspaceId);
  }

  getDocument(workspaceId) {
    return this.docs.get(workspaceId);
  }
}

export const yjsPersistence = new YjsPersistence();
