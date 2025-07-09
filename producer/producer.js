import express from 'express';
import bodyParser from 'body-parser';
import { Queue, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT | 4000;
const SUPPORTED_LANGUAGES = ['javascript', 'python'];

const app = express();
app.use(bodyParser.json());

const connection = new IORedis('redis://redis:6379', {
  maxRetriesPerRequest: null
});

const queue = new Queue('code-execution', { connection });
const queueEvents = new QueueEvents('code-execution', { connection });
await queueEvents.waitUntilReady();

//HAVE TO THINK ABOUT THIS BECAUSE PYTHON INTEGRATION IS HARD

// Dynamically get supported languges from Redis
// const keys = await connection.keys('lang:*');
// const activeLanguages = keys.map(k => k.split(':')[1]);

app.post('/run', async (req, res) => {
  const { language, code, input } = req.body;

  if (!SUPPORTED_LANGUAGES.includes(language)) {
    return res.status(400).json({
      success: false,
      error: `Language "${language}" not supported currently. Available: ${SUPPORTED_LANGUAGES.join(', ')}`
    });
  }

  const job = await queue.add('run-code', { language, code, input });

  try {
    const result = await job.waitUntilFinished(queueEvents, 10000);
    res.send(result);
  } 
  catch (error) {
    res.status(500).json({ success: false, error: error.message || 'Job failed' });
  }
});

app.listen(PORT, () => console.log(`Producer running on port ${PORT}`));