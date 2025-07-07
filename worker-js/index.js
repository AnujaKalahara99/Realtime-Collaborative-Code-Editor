const { Worker } = require('bullmq');
const Redis = require('ioredis');

const connection = new Redis('redis://redis:6379');

new Worker('code-execution', async job => {
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
}, { connection });