import type { Plugin } from "esbuild-wasm";
import type { VFSStore } from "../vfs/vfs-store";

export const vfsPlugin = (vfs: VFSStore): Plugin => ({
  name: "vfs-resolver",
  setup(build: import("esbuild-wasm").PluginBuild) {
    // Types for onResolve and onLoad return values
    interface VFSOnResolveResult {
      path: string;
      namespace: string;
    }

    interface VFSOnLoadResult {
      contents: string;
      loader: "js" | "jsx" | "ts" | "json" | "css" | "text";
    }

    // Intercept import paths to resolve them against the VFS
    build.onResolve(
      { filter: /^\.?\/?.*$/ },
      async (
        args: import("esbuild-wasm").OnResolveArgs
      ): Promise<VFSOnResolveResult | null> => {
        const importerPath: string =
          args.importer === "<stdin>" ? "/" : args.importer;
        let resolvedPath: string;

        if (args.path.startsWith("./") || args.path.startsWith("../")) {
          // Relative path
          const importerDir: string =
            importerPath.substring(0, importerPath.lastIndexOf("/")) || "/";
          resolvedPath = new URL(args.path, `file://${importerDir}/`).pathname;
        } else if (args.path.startsWith("/")) {
          // Absolute path
          resolvedPath = args.path;
        } else {
          // Node module or bare import (not handled by VFS directly, let esbuild handle it)
          return null;
        }

        // Normalize path (remove double slashes, etc.)
        resolvedPath = resolvedPath.replace(/\/\/+/g, "/");

        // Check if it's a directory and try to resolve to index.js/ts/jsx/tsx
        if (vfs.getDirectory(resolvedPath)) {
          const indexJs = `${resolvedPath}/index.js`;
          const indexTs = `${resolvedPath}/index.ts`;
          const indexJsx = `${resolvedPath}/index.jsx`;
          const indexTsx = `${resolvedPath}/index.tsx`;
          const indexPy = `${resolvedPath}/index.py`;

          if (vfs.getFile(indexJs)) return { path: indexJs, namespace: "vfs" };
          if (vfs.getFile(indexTs)) return { path: indexTs, namespace: "vfs" };
          if (vfs.getFile(indexJsx))
            return { path: indexJsx, namespace: "vfs" };
          if (vfs.getFile(indexTsx))
            return { path: indexTsx, namespace: "vfs" };
          if (vfs.getFile(indexPy)) return { path: indexPy, namespace: "vfs" };
        }

        // Try to resolve with common extensions
        const extensions: string[] = [
          "",
          ".js",
          ".jsx",
          ".ts",
          ".tsx",
          ".json",
          ".css",
          ".py",
        ];
        for (const ext of extensions) {
          const pathWithExt: string = resolvedPath + ext;
          if (vfs.getFile(pathWithExt)) {
            return { path: pathWithExt, namespace: "vfs" };
          }
        }

        // If still not found, return null to let esbuild try other resolvers
        return null;
      }
    );

    // Load file contents from the VFS
    build.onLoad(
      { filter: /.*/, namespace: "vfs" },
      async (
        args: import("esbuild-wasm").OnLoadArgs
      ): Promise<VFSOnLoadResult | null> => {
        const file = vfs.getFile(args.path);
        if (file) {
          return {
            contents: file.content ?? "",
            loader:
              args.path.endsWith(".tsx") || args.path.endsWith(".jsx")
                ? "jsx"
                : args.path.endsWith(".ts")
                ? "ts"
                : args.path.endsWith(".json")
                ? "json"
                : args.path.endsWith(".css")
                ? "css"
                : args.path.endsWith(".py")
                ? "text"
                : "js",
          };
        }
        return null; // File not found in VFS
      }
    );
  },
});
