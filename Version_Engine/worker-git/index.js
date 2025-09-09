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
        let msg = "Unknown job type";
        switch (job.data.type) {
          case "COMMIT":
            msg = await handleCommit(
              job.data.sessionId,
              job.data.message,
              job.data.branchId
            );
            break;
          case "ROLLBACK":
            msg = await handleRollback(job.data);
            break;
          case "BRANCH":
            msg = await handleBranch(job.data);
            break;
          case "MERGE":
            msg = await handleMerge(job.data);
            break;
        }
        resolve({ success: true, output: msg.toString() });
      } catch (err) {
        resolve({ success: false, error: err.message });
      }
    });
  },
  { connection }
);
