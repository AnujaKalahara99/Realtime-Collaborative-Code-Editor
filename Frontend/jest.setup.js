globalThis.import = {
  meta: {
    env: {
      VITE_BACKEND_URL: 'http://localhost:4000',
      VITE_BACKEND_WS_URL: 'ws://localhost:1234',
      // Add other VITE_ variables as needed for your tests
    },
  },
  
};


// Robust mock for import.meta.env for Vite variables in Jest
if (!globalThis.import) globalThis.import = {};
if (!globalThis.import.meta) globalThis.import.meta = {};
if (!globalThis.import.meta.env) globalThis.import.meta.env = {};
Object.assign(globalThis.import.meta.env, {
  VITE_BACKEND_URL: 'http://localhost:4000',
  VITE_BACKEND_WS_URL: 'ws://localhost:1234',
  // Add other VITE_ variables as needed for your tests
});
