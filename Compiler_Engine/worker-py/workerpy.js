import dotenv from "dotenv";
dotenv.config();
import { Worker } from "bullmq";
import IORedis from "ioredis";
import os from "os";
import fs from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";
import { loadSessionFiles } from "./utils/database.js";

const execPromise = promisify(exec);

const LANGUAGE = "python";
const QUEUE_NAME = "py-code-execution";

const REDIS_PORT = process.env.REDIS_PORT || 6379;
const connection = new IORedis(`redis://redis:${REDIS_PORT}`, {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    console.log(`Processing job ${job.id} for language: ${job.data.language}`);

    let execPath;

    try {
      const { sessionId, language, code, input, mainFile } = job.data;

      if (language !== LANGUAGE) {
        return {
          success: false,
          error: `Unsupported language: ${language}`,
        };
      }

      execPath = os.homedir() + `/app/${sessionId}`;
      await fs.mkdir(execPath, { recursive: true });

      if (code) {
        const fileName = mainFile || "main.py";
        await fs.writeFile(`${execPath}/${fileName}`, code, "utf8");
        if (input) {
          await fs.writeFile(`${execPath}/input.txt`, input, "utf8");
        }
      } else {
        await loadSessionFiles(sessionId, execPath);
      }

      const { stdout, stderr } = await execPromise(
        `python3 ${mainFile || "main.py"}`,
        {
          cwd: execPath,
          timeout: 10000,
        }
      );

      // Cleanup
      await fs.rm(execPath, { recursive: true, force: true });

      return {
        success: true,
        output: stdout || stderr,
      };
    } catch (err) {
      // Cleanup on error
      if (execPath) {
        try {
          await fs.rm(execPath, { recursive: true, force: true });
        } catch (cleanupErr) {
          console.error("Cleanup error:", cleanupErr.message);
        }
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

console.log(`Python worker listening on queue: ${QUEUE_NAME}`);
