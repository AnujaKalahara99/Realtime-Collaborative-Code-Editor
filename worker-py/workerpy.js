import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import fs from 'fs';
import { spawnSync } from 'child_process';
import { randomUUID } from 'crypto';

const LANGUAGE = 'python';
const QUEUE_NAME = 'code-execution';

const connection = new IORedis('redis://redis:6379', {
  maxRetriesPerRequest: null,
});

new Worker(
  QUEUE_NAME,
  async job => {
    const { language, code, input } = job.data;

    if (language === LANGUAGE) {
      return runPython(code, input);
    }
  },
  { connection }
);

export function runPython(code, input) {
  const filename = `temp_${randomUUID()}.py`;

  try {
    fs.writeFileSync(filename, code);
  } catch (err) {
    return { success: false, output: 'File write error: ' + err.message };
  }

  const result = spawnSync('python3', [filename], {
    input: input || '',
    encoding: 'utf-8',
    timeout: 10000 // 10 seconds timeout
  });

  fs.unlinkSync(filename); // Cleanup

  if (result.error) {
    return { success: false, output: result.error.message };
  }

  if (result.status !== 0) {
    return { success: false, output: result.stderr.trim() || 'Non-zero exit code' };
  }

  return { success: true, output: result.stdout.trim() };
}