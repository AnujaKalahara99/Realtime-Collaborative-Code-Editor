import { Worker } from "bullmq";
import { config } from "dotenv";
config();
import handleCommit from "./handlers/commit.js";
import handleRollback from "./handlers/rollback.js";
import handleBranch from "./handlers/branch.js";
import handleMerge from "./handlers/merge.js";
import axios from "axios";

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
        console.log("Job result:", result);
        await notifyWSServer(
          job.data.sessionId,
          job.data.type,
          result.success ? "SUCCESS" : "FAILURE"
        );
        resolve(result);
      } catch (err) {
        await notifyWSServer(job.data.sessionId, "ERROR", err.message);
        resolve({ success: false, error: err.message });
      }
    });
  },
  { connection }
);

async function notifyWSServer(sessionId, command, status) {
  try {
    console.log(`Notifying WS server: ${sessionId} ${command} ${status}`);
    console.log(process.env.WS_SERVER_URL + "/notify");

    const response = await axios.post(process.env.WS_SERVER_URL + "/notify", {
      sessionId,
      command,
      status,
    });
    console.log("WS server response:", response.data);
  } catch (error) {
    console.error("Failed to notify WS server:", error.message);
  }
}
