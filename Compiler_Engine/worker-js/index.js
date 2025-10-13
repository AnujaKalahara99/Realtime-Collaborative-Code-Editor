import { Worker } from "bullmq";
import IORedis from "ioredis";
import os from "os";
import fs from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";
import { loadSessionFiles } from "./utils/database.js";

const execPromise = promisify(exec);

const LANGUAGE = "javascript";
const QUEUE_NAME = "js-code-execution";

const connection = new IORedis("redis://redis:6379", {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    console.log(`Processing job ${job.id} for language: ${job.data.language}`);

    try {
      const { sessionId, language, code, input, mainFile } = job.data; // Get mainFile

      if (language !== LANGUAGE) {
        return {
          success: false,
          error: `Unsupported language: ${language}`,
        };
      }

      const execPath = os.homedir() + `/app/${sessionId}`;

      await fs.mkdir(execPath, { recursive: true });

      await loadSessionFiles(sessionId, execPath);

      const { stdout, stderr } = await execPromise(
        `node ${mainFile || "index.js"}`,
        {
          cwd: execPath,
          timeout: 10000,
        }
      );

      await fs.rm(execPath, { recursive: true, force: true });

      return {
        success: true,
        output: stdout || stderr,
      };
    } catch (err) {
      try {
        await fs.rm(execPath, { recursive: true, force: true });
      } catch (cleanupErr) {
        console.error("Cleanup error:", cleanupErr.message);
      }

      return {
        success: false,
        error: err.message,
        stderr: err.stderr,
      };
    }
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

console.log(`JavaScript worker listening on queue: ${QUEUE_NAME}`);
