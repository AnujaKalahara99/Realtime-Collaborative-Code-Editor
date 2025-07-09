import { Worker, RedisConnection } from 'bullmq';
import IORedis from 'ioredis';

const redis = new IORedis('redis://redis:6379', {
  maxRetriesPerRequest: null,
});

// Wrap in BullMQ's RedisConnection (REQUIRED)
const connection = new RedisConnection(redis);

new Worker('WorkerJs', async job => {
  if (job.data.language !== 'javascript') return;

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