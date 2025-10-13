import fs from "fs/promises";
import path from "path";
import supabase from "./supabaseClient.js";

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

    console.log(
      `Successfully loaded ${savedFiles.length} files for session: ${sessionId}`
    );
    return savedFiles;
  } catch (error) {
    console.error("Error in loadSessionFiles:", error);
    throw error;
  }
}
