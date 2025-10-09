// import { Worker } from 'bullmq';
// import IORedis from 'ioredis';

// const LANGUAGE = 'javascript';
// const QUEUE_NAME = 'code-execution';

// const connection = new IORedis('redis://redis:6379', {
//   maxRetriesPerRequest: null,
// });

// //HAVE TO THINK ABOUT THIS BECAUSE PYTHON INTEGRATION IS HARD

// // Register this worker's language in Redis with TTL expires in 30s, rerun every 20s
// // This is used by the producer to know which workers are available for this language

// // const registerLanguage = async () => {
// //   await connection.set(`lang:${LANGUAGE}`, '1', 'EX', 30);
// // };
// // setInterval(registerLanguage, 20000);
// // await registerLanguage();

// new Worker(
//   QUEUE_NAME,
//   {
//     "runjs": async job => {
//       console.log(`Processing job ${job.data.id} for language: ${job.data.language}`);
//       if (job.data.language !== LANGUAGE) return;

//       return new Promise((resolve) => {
//       try {
//           const fn = new Function('input', job.data.code);
//           const output = fn(job.data.input);
//           resolve({success: true, output: output.toString()});
//         } catch (err) {
//           resolve({ success: false, error: err.message });
//         }
//       });
//     }
//   },
//   { connection }
// );

// import { Worker } from 'bullmq';
// import IORedis from 'ioredis';

// const LANGUAGE = 'javascript,python';
// const QUEUE_NAME = 'code-execution';

// const connection = new IORedis('redis://redis:6379', {
//   maxRetriesPerRequest: null,
// });

// new Worker(
//   QUEUE_NAME,
//   async (job) => {
//     console.log(`Processing job ${job.id} for language: ${job.data.language}`);

//     if (job.data.language !== LANGUAGE) {
//       return { success: false, error: `Unsupported language: ${job.data.language}` };
//     }

//     try {
//       const fn = new Function('input', job.data.code);
//       const output = fn(job.data.input);
//       return { success: true, output: output?.toString() };
//     } catch (err) {
//       return { success: false, error: err.message };
//     }
//   },
//   { connection }
// );


// import { Worker } from 'bullmq';
// import IORedis from 'ioredis';
// import fs from 'fs';
// import { spawnSync } from 'child_process';
// import { randomUUID } from 'crypto';

// const SUPPORTED_LANGUAGES = ['javascript', 'python'];
// const QUEUE_NAME = 'code-execution';

// const connection = new IORedis('redis://redis:6379', {
//   maxRetriesPerRequest: null,
// });

// // Helper: Run Python code
// function runPython(code, input) {
//   const filename = `temp_${randomUUID()}.py`;
//   fs.writeFileSync(filename, code);
//   const result = spawnSync('python3', [filename], {
//     input: input || '',
//     encoding: 'utf-8',
//     timeout: 10000
//   });
//   fs.unlinkSync(filename);

//   if (result.error) return { success: false, error: result.error.message };
//   if (result.status !== 0) return { success: false, error: result.stderr.trim() || 'Non-zero exit code' };
//   return { success: true, output: result.stdout.trim() };
// }

// // Helper: Run JS code
// function runJS(code, input) {
//   try {
//     const fn = new Function('input', code);
//     const output = fn(input);
//     return { success: true, output: output?.toString() };
//   } catch (err) {
//     return { success: false, error: err.message };
//   }
// }

// new Worker(
//   QUEUE_NAME,
//   async (job) => {
//     const { language, code, input } = job.data;
//     console.log(`Processing job ${job.id} for language: ${language}`);

//     if (!SUPPORTED_LANGUAGES.includes(language)) {
//       return { success: false, error: `Unsupported language: ${language}` };
//     }

//     if (language === 'javascript') return runJS(code, input);
//     if (language === 'python') return runPython(code, input);
//   },
//   { connection }
// );


import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import fs from 'fs';
import { spawnSync, spawn } from 'child_process';
import { randomUUID } from 'crypto';

const SUPPORTED_LANGUAGES = ['javascript', 'python'];
const QUEUE_NAME = 'code-execution';

const connection = new IORedis('redis://redis:6379', {
  maxRetriesPerRequest: null,
});

// Helper: Run Python code
function runPython(code, input) {
  const filename = `temp_${randomUUID()}.py`;
  fs.writeFileSync(filename, code);
  const result = spawnSync('python3', [filename], {
    input: input || '',
    encoding: 'utf-8',
    timeout: 10000
  });
  fs.unlinkSync(filename);

  if (result.error) return { success: false, error: result.error.message };
  if (result.status !== 0) return { success: false, error: result.stderr.trim() || 'Non-zero exit code' };

  // Print output to container logs
  if (result.stdout.trim()) console.log(result.stdout.trim());
  return { success: true, output: result.stdout.trim() };
}

// Helper: Run JS code safely and show console.log output
function runJS(code, input) {
  const filename = `temp_${randomUUID()}.js`;
  fs.writeFileSync(filename, code);

  // Use spawnSync to run JS file with Node
  const result = spawnSync('node', [filename], {
    input: input || '',
    encoding: 'utf-8',
    timeout: 10000
  });
  fs.unlinkSync(filename);

  if (result.error) return { success: false, error: result.error.message };
  if (result.status !== 0) return { success: false, error: result.stderr.trim() || 'Non-zero exit code' };

  // Print console output to container logs
  if (result.stdout.trim()) console.log(result.stdout.trim());
  return { success: true, output: result.stdout.trim() };
}

new Worker(
  QUEUE_NAME,
  async (job) => {
    const { language, code, input } = job.data;
    console.log(`Processing job ${job.id} for language: ${language}`);

    if (!SUPPORTED_LANGUAGES.includes(language)) {
      return { success: false, error: `Unsupported language: ${language}` };
    }

    if (language === 'javascript') return runJS(code, input);
    if (language === 'python') return runPython(code, input);
  },
  { connection }
);

console.log('Worker started and waiting for jobs...');
