const { Worker } = require('bullmq');

new Worker('code-execution', async job => {
  if (job.data.language !== 'javascript') return;

  return new Promise((resolve) => {
    try {
      const fn = new Function('input', job.data.code);
      const output = fn(job.data.input);
      resolve({ success: true, output: output.toString() });
    } catch (err) {
      resolve({ success: false, error: err.message });
    }
  });
}, {
  connection: {
    host: 'redis',
    port: 6379,
    maxRetriesPerRequest: null // ✅ MUST be null
  }
});
