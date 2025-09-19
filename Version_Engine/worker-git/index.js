import { Worker } from "bullmq";
import { config } from "dotenv";
config();
import handleCommit from "./handlers/commit.js";
import handleRollback from "./handlers/rollback.js";
import handleBranch from "./handlers/branch.js";
import handleMerge from "./handlers/merge.js";

// Configure Redis connection
const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
};

const QUEUE_NAME = "version_jobs";

new Worker(
  QUEUE_NAME,

  async (job) => {
    console.log("Received job:", job.data);
    return new Promise(async (resolve) => {
      try {
        let result;
        switch (job.data.type) {
          case "COMMIT":
            result = await handleCommit(
              job.data.sessionId,
              job.data.message,
              job.data.branchId
            );
            break;
          case "ROLLBACK":
            result = await handleRollback(
              job.data.sessionId,
              job.data.commitHash
            );
            break;
          case "BRANCH":
            result = await handleBranch(job.data);
            break;
          case "MERGE":
            result = await handleMerge(job.data);
            break;
          default:
            result = { success: false, error: "Unknown job type" };
        }
        resolve(result);
      } catch (err) {
        resolve({ success: false, error: err.message });
      }
    });
  },
  { connection }
);
