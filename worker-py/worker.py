import redis
import json
import time
import traceback

r = redis.Redis(host='redis', port=6379, decode_responses=True)
QUEUE_KEY = 'bull:code-execution'

def complete_job(job_id, result):
    result_key = f'bull:code-execution:{job_id}:returnvalue'
    r.set(result_key, json.dumps(result))
    r.xadd('bull:code-execution:events', {
        'event': 'completed',
        'jobId': job_id,
        'data': json.dumps(result)
    })

def fail_job(job_id, result):
    r.xadd('bull:code-execution:events', {
        'event': 'failed',
        'jobId': job_id,
        'failedReason': result['output']
    })
    result_key = f'bull:code-execution:{job_id}:returnvalue'
    r.set(result_key, json.dumps(result))

def build_success(output):
    return { "success": True, "output": str(output) }

def build_failure(error):
    return { "success": False, "output": str(error) }

print("🐍 Python worker started, waiting for jobs...")

while True:
    job_data = r.lpop(QUEUE_KEY)
    if job_data:
        job = json.loads(job_data)
        job_id = job.get('id')
        data = job.get('data', {})

        if data.get('language') != 'python':
            continue

        code = data.get('code')
        input_data = data.get('input')

        try:
            exec_globals = {}
            exec_locals = {'input': input_data, 'output': None}
            exec(code, exec_globals, exec_locals)
            output = exec_locals.get('output', 'No output')
            complete_job(job_id, build_success(output))
        except Exception as e:
            error_trace = traceback.format_exc()
            fail_job(job_id, build_failure(error_trace))
    else:
        time.sleep(0.1)
