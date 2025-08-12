import { vfsPlugin } from "./esbuildPlugin";
import type { VFSStore } from "../vfs/vfs-store";
import * as esbuild from "esbuild-wasm";
import type { Plugin } from "esbuild-wasm";

let esbuildInitializationPromise: Promise<void> | null = null;

export class Bundler {
  private vfs: VFSStore;

  constructor(vfs: VFSStore) {
    this.vfs = vfs;
  }

  async initialize() {
    // If initialization has already started or completed, return the existing promise
    if (esbuildInitializationPromise) {
      return esbuildInitializationPromise;
    }

    // Otherwise, create and store the initialization promise
    esbuildInitializationPromise = (async () => {
      try {
        console.log("Attempting to initialize esbuild-wasm...");
        await esbuild.initialize({
          wasmURL: "https://unpkg.com/esbuild-wasm@0.20.2/esbuild.wasm",
          worker: true,
        });
        console.log("esbuild-wasm initialized successfully.");
      } catch (error) {
        console.error("Failed to initialize esbuild-wasm:", error);
        // Clear the promise on failure so it can be retried
        esbuildInitializationPromise = null;
        throw error;
      }
    })();

    return esbuildInitializationPromise;
  }

  async bundle(
    entryPoint: string
  ): Promise<{ code: string; error: string | null }> {
    // Ensure esbuild is initialized before attempting to bundle
    try {
      await this.initialize();
    } catch (initError) {
      return {
        code: "",
        error: `Bundler initialization failed: ${
          initError instanceof Error ? initError.message : String(initError)
        }`,
      };
    }

    try {
      const result = await esbuild.build({
        entryPoints: [entryPoint],
        bundle: true,
        write: false,
        plugins: [vfsPlugin(this.vfs) as Plugin], // Cast to Plugin type for type safety
        define: {
          "process.env.NODE_ENV": '"production"', // Define environment for React/Next.js
        },
        jsxFactory: "React.createElement",
        jsxFragment: "React.Fragment",
        target: "es2020",
        format: "esm",
        sourcemap: "inline",
      });

      return {
        code: result.outputFiles[0].text,
        error: null,
      };
    } catch (err: any) {
      console.error("Bundling error:", err);
      return {
        code: "",
        error: err.message || "An unknown bundling error occurred.",
      };
    }
  }
}
