// import express from 'express';
// import bodyParser from 'body-parser';
// import { Queue, QueueEvents } from 'bullmq';
// import IORedis from 'ioredis';
// import dotenv from 'dotenv';

// dotenv.config();

// const PORT = process.env.PORT | 4000;
// const SUPPORTED_LANGUAGES = ['javascript', 'python'];

// const app = express();
// app.use(bodyParser.json());


// const redisHost = process.env.REDIS_HOST || 'redis';
// const redisPort = process.env.REDIS_PORT || 6379;
// const connection = new IORedis(`redis://${redisHost}:${redisPort}`, {
//   maxRetriesPerRequest: null
// });

// const queue = new Queue('code-execution', { connection });
// const queueEvents = new QueueEvents('code-execution', { connection });
// await queueEvents.waitUntilReady();

// //HAVE TO THINK ABOUT THIS BECAUSE PYTHON INTEGRATION IS HARD

// // Dynamically get supported languges from Redis
// // const keys = await connection.keys('lang:*');
// // const activeLanguages = keys.map(k => k.split(':')[1]);

// app.post('/run', async (req, res) => {
//   const { language, code, input } = req.body;

//   if (!SUPPORTED_LANGUAGES.includes(language)) {
//     return res.status(400).json({
//       success: false,
//       error: `Language "${language}" not supported currently. Available: ${SUPPORTED_LANGUAGES.join(', ')}`
//     });
//   }

//   let jobName;
//   switch (language) {
//     case 'python':
//       jobName = 'runpy';
//       break;
//     case 'javascript':
//       jobName = 'runjs';
//       break;
//     default:
//       break;
//   }

//   const job = await queue.add(jobName, { language, code, input });

//   try {
//     const result = await job.waitUntilFinished(queueEvents, 10000);
//     res.send(result);
//   } 
//   catch (error) {
//     res.status(500).json({ success: false, error: error.message || 'Job failed' });
//   }
// });

// app.listen(PORT, () => console.log(`Producer running on port ${PORT}`));



// import express from 'express';
// import { Queue, QueueEvents } from 'bullmq';
// import IORedis from 'ioredis';
// import dotenv from 'dotenv';
// dotenv.config();

// const app = express();
// app.use(express.json());

// // Redis connection for BullMQ (maxRetriesPerRequest must be null)
// const connection = new IORedis('redis://redis:6379', {
//   maxRetriesPerRequest: null
// });

// const queue = new Queue('code-execution', { connection });
// const queueEvents = new QueueEvents('code-execution', { connection });

// // API endpoint
// app.post('/run', async (req, res) => {
//   const { code, input, language } = req.body;
//   try {
//     const job = await queue.add('runjs', { code, input, language });
//     const result = await job.waitUntilFinished(queueEvents);
//     res.json({ jobId: job.id, result });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.listen(process.env.PORT || 4000, () => {
//   console.log('Producer running on port 4000');
// });


import express from 'express';
import { Queue, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;

// Supported languages
const SUPPORTED_LANGUAGES = ['javascript', 'python'];

// Redis connection
const connection = new IORedis('redis://redis:6379', {
  maxRetriesPerRequest: null
});

// BullMQ queue & events
const queue = new Queue('code-execution', { connection });
const queueEvents = new QueueEvents('code-execution', { connection });
await queueEvents.waitUntilReady();

// POST /run endpoint
app.post('/run', async (req, res) => {
  const { language, code, input } = req.body;

  // Validate language
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    return res.status(400).json({
      success: false,
      error: `Language "${language}" not supported. Available: ${SUPPORTED_LANGUAGES.join(', ')}`
    });
  }

  // Determine job name based on language
  const jobName = language === 'python' ? 'runpy' : 'runjs';

  try {
    // Add job to queue
    const job = await queue.add(jobName, { language, code, input });

    // Wait for worker to finish job
    const result = await job.waitUntilFinished(queueEvents, 10000); // 10 sec timeout

    res.json({
      success: true,
      jobId: job.id,
      result
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || 'Job execution failed'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Producer running on port ${PORT}`);
});
