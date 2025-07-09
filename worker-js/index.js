import { Worker } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis({ maxRetriesPerRequest: null });

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