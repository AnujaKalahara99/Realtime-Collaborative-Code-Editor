import { Worker } from 'bullmq';
import IORedis from 'ioredis';

const LANGUAGE = 'javascript';
const QUEUE_NAME = 'code-execution';

const connection = new IORedis('redis://redis:6379', {
  maxRetriesPerRequest: null,
});

//HAVE TO THINK ABOUT THIS BECAUSE PYTHON INTEGRATION IS HARD

// Register this worker's language in Redis with TTL expires in 30s, rerun every 20s
// This is used by the producer to know which workers are available for this language

// const registerLanguage = async () => {
//   await connection.set(`lang:${LANGUAGE}`, '1', 'EX', 30);
// };
// setInterval(registerLanguage, 20000);
// await registerLanguage();


new Worker(QUEUE_NAME, async job => {
  if (job.data.language !== LANGUAGE) return;

  return new Promise((resolve) => {
  try {
      const fn = new Function('input', job.data.code);
      const output = fn(job.data.input);
      resolve({success: true, output: output.toString()});
    } catch (err) {
      resolve({ success: false, error: err.message });
    }
  });
}, {connection});