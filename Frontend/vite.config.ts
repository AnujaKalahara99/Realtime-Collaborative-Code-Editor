import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // or "0.0.0.0"
    port: 5173,
  },
  base: "./", //Workers are loaded as separate files.If you use plain new Worker("worker.js"), that path may break.: "./" tells Vite to emit relative URLs for all built assets
});
