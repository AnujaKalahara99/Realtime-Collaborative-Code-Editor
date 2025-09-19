import express from "express";
import { Queue, QueueEvents } from "bullmq";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

// Configure Redis connection
const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
};

// Create a Bull queue
const versionQueue = new Queue("version_jobs", { connection });
const queueEvents = new QueueEvents("version_jobs", { connection });
await queueEvents.waitUntilReady();

// API routes
app.post("/versioning", async (req, res) => {
  try {
    const jobData = req.body;

    // Add job to the queue
    const job = await versionQueue.add(jobData.type, jobData, {
      removeOnComplete: false,
      removeOnFail: false,
    });

    try {
      const result = await job.waitUntilFinished(queueEvents, 15000);
      res.send(result);
    } catch (error) {
      res
        .status(500)
        .json({ success: false, error: error.message || "Job failed" });
    }
  } catch (error) {
    console.error("Error sending job:", error);
    res
      .status(500)
      .json({ success: false, error: error.message || "Error adding job" });
  }
});

// Start the server
const PORT = process.env.PORT || 6000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Producer API server running on port ${PORT}`);
});
