import express from "express";
import { Queue, QueueEvents } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4455;

// Supported languages
const SUPPORTED_LANGUAGES = ["javascript", "python"];

const connection = new IORedis("redis://redis:6379", {
  maxRetriesPerRequest: null,
});

const jsQueue = new Queue("js-code-execution", { connection });
const jsQueueEvents = new QueueEvents("js-code-execution", { connection });
await jsQueueEvents.waitUntilReady();

const pyQueue = new Queue("py-code-execution", { connection });
const pyQueueEvents = new QueueEvents("py-code-execution", { connection });
await pyQueueEvents.waitUntilReady();

app.post("/run", async (req, res) => {
  const { language, code, input, sessionId, mainFile } = req.body;

  if (!SUPPORTED_LANGUAGES.includes(language)) {
    return res.status(400).json({
      success: false,
      error: `Language "${language}" not supported. Available: ${SUPPORTED_LANGUAGES.join(
        ", "
      )}`,
    });
  }

  const queue = language === "python" ? pyQueue : jsQueue;
  const queueEvents = language === "python" ? pyQueueEvents : jsQueueEvents;

  try {
    const job = await queue.add("run", {
      language,
      code,
      input,
      sessionId,
      mainFile,
    });
    const result = await job.waitUntilFinished(queueEvents, 10000); // 10 sec timeout

    res.send(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || "Job execution failed",
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Producer running on port ${PORT}`);
});
