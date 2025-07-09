import express from 'express';
import bodyParser from 'body-parser';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT | 4000;

const connection = new IORedis('redis://redis:6379', {
  maxRetriesPerRequest: null
});

const app = express();
const queue = new Queue('code-execution', { connection });

app.use(bodyParser.json());

app.post('/run', async (req, res) => {
  const { language, code, input } = req.body;

  const job = await queue.add('run-code', { language, code, input });

  try {
    const result = await job.waitUntilFinished();
    res.send(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || 'Job failed' });
  }
});

app.listen(PORT, () => console.log(`Producer running on port ${PORT}`));