import type { Plugin } from "esbuild-wasm";
import type { VFSStore } from "../vfs/vfs-store";
import { DependencyManager } from "../dependencies/dependency-manager";

export interface PluginOptions {
  enableDetailedErrors?: boolean;
  enableDependencyTracking?: boolean;
  allowedExtensions?: string[];
}

export const vfsPlugin = (
  vfs: VFSStore,
  options: PluginOptions = {}
): Plugin => {
  const {
    enableDetailedErrors = true,
    enableDependencyTracking = true,
    allowedExtensions = [".js", ".jsx", ".ts", ".tsx", ".json", ".css", ".py"],
  } = options;

  const dependencyManager = enableDependencyTracking
    ? new DependencyManager(vfs)
    : null;
  const resolvedFiles = new Set<string>();
  const errors: Array<{
    file: string;
    message: string;
    line?: number;
    column?: number;
  }> = [];

  return {
    name: "vfs-resolver-enhanced",
    setup(build: import("esbuild-wasm").PluginBuild) {
      // Types for onResolve and onLoad return values
      interface VFSOnResolveResult {
        path: string;
        namespace: string;
        errors?: Array<{
          text: string;
          location?: { line: number; column: number };
        }>;
      }

      interface VFSOnLoadResult {
        contents: string;
        loader: "js" | "jsx" | "ts" | "tsx" | "json" | "css" | "text";
        resolveDir?: string;
        errors?: Array<{
          text: string;
          location?: { line: number; column: number };
        }>;
      }

      // Enhanced path resolution with detailed error reporting
      build.onResolve(
        { filter: /^\.?\/?.*$/ },
        async (
          args: import("esbuild-wasm").OnResolveArgs
        ): Promise<VFSOnResolveResult | null> => {
          const importerPath: string =
            args.importer === "<stdin>" ? "/" : args.importer;
          let resolvedPath: string;

          // Skip external modules (npm packages)
          if (
            !args.path.startsWith("./") &&
            !args.path.startsWith("../") &&
            !args.path.startsWith("/")
          ) {
            return null;
          }

          try {
            if (args.path.startsWith("./") || args.path.startsWith("../")) {
              // Relative path resolution
              const importerDir: string =
                importerPath.substring(0, importerPath.lastIndexOf("/")) || "/";
              resolvedPath = new URL(args.path, `file://${importerDir}/`)
                .pathname;
            } else if (args.path.startsWith("/")) {
              // Absolute path resolution
              resolvedPath = args.path;
            } else {
              return null;
            }

            // Normalize path (remove double slashes, etc.)
            resolvedPath = resolvedPath.replace(/\/\/+/g, "/");

            // Track dependency if enabled
            if (dependencyManager && importerPath !== "/") {
              const dependencies =
                dependencyManager.getDependencies(importerPath);
              const hasUnresolvedDep = dependencies.some(
                (dep) => dep.to === args.path && !dep.resolved
              );

              if (hasUnresolvedDep && enableDetailedErrors) {
                const suggestion = dependencyManager
                  .getDependencyGraph()
                  .errors.find(
                    (err) =>
                      err.file === importerPath && err.importPath === args.path
                  )?.suggestion;

                let errorMessage = `Cannot resolve module '${args.path}'`;
                if (suggestion) {
                  errorMessage += `. Did you mean '${suggestion}'?`;
                }

                errors.push({
                  file: importerPath,
                  message: errorMessage,
                });
              }
            }

            // Check if it's a directory and try to resolve to index files
            if (vfs.getDirectory(resolvedPath)) {
              const indexFiles = [
                "index.js",
                "index.ts",
                "index.jsx",
                "index.tsx",
                "index.json",
              ];

              for (const indexFile of indexFiles) {
                const indexPath = `${resolvedPath}/${indexFile}`;
                if (vfs.getFile(indexPath)) {
                  resolvedFiles.add(indexPath);
                  return { path: indexPath, namespace: "vfs" };
                }
              }

              if (enableDetailedErrors) {
                errors.push({
                  file: importerPath,
                  message: `Directory '${
                    args.path
                  }' has no index file. Expected one of: ${indexFiles.join(
                    ", "
                  )}`,
                });
              }
              return null;
            }

            // Try to resolve with common extensions
            for (const ext of allowedExtensions) {
              const pathWithExt: string = resolvedPath + ext;
              if (vfs.getFile(pathWithExt)) {
                resolvedFiles.add(pathWithExt);
                return { path: pathWithExt, namespace: "vfs" };
              }
            }

            // Try without extension (exact match)
            if (vfs.getFile(resolvedPath)) {
              resolvedFiles.add(resolvedPath);
              return { path: resolvedPath, namespace: "vfs" };
            }

            // File not found - provide detailed error
            if (enableDetailedErrors) {
              const availableFiles = Array.from(vfs.getAllEntries().keys())
                .filter((path) => {
                  const entry = vfs.getAllEntries().get(path);
                  return entry?.type === "file";
                })
                .map((path) => path.split("/").pop())
                .filter(Boolean);

              const requestedFile = args.path.split("/").pop();
              const similarFiles = availableFiles.filter(
                (file) =>
                  file &&
                  requestedFile &&
                  (file.toLowerCase().includes(requestedFile.toLowerCase()) ||
                    requestedFile.toLowerCase().includes(file.toLowerCase()))
              );

              let errorMessage = `Module '${args.path}' not found`;
              if (similarFiles.length > 0) {
                errorMessage += `. Similar files: ${similarFiles
                  .slice(0, 3)
                  .join(", ")}`;
              }

              errors.push({
                file: importerPath,
                message: errorMessage,
              });
            }

            return null;
          } catch (error) {
            if (enableDetailedErrors) {
              errors.push({
                file: importerPath,
                message: `Failed to resolve '${args.path}': ${
                  error instanceof Error ? error.message : String(error)
                }`,
              });
            }
            return null;
          }
        }
      );

      // Enhanced file loading with proper loader detection
      build.onLoad(
        { filter: /.*/, namespace: "vfs" },
        async (
          args: import("esbuild-wasm").OnLoadArgs
        ): Promise<VFSOnLoadResult | null> => {
          try {
            const file = vfs.getFile(args.path);
            if (!file) {
              if (enableDetailedErrors) {
                errors.push({
                  file: args.path,
                  message: `File not found in VFS: ${args.path}`,
                });
              }
              return null;
            }

            // Determine the loader based on file extension
            const loader = getLoaderForFile(args.path);

            // Validate file content for common issues
            const contentErrors = validateFileContent(args.path, file.content);

            const result: VFSOnLoadResult = {
              contents: file.content,
              loader,
              resolveDir:
                args.path.substring(0, args.path.lastIndexOf("/")) || "/",
            };

            if (enableDetailedErrors && contentErrors.length > 0) {
              result.errors = contentErrors.map((err) => ({
                text: err.message,
                location: { line: err.line || 1, column: err.column || 1 },
              }));
            }

            return result;
          } catch (error) {
            if (enableDetailedErrors) {
              errors.push({
                file: args.path,
                message: `Failed to load file: ${
                  error instanceof Error ? error.message : String(error)
                }`,
              });
            }
            return null;
          }
        }
      );

      // Add build end hook to report dependency information
      build.onEnd(() => {
        if (enableDependencyTracking && dependencyManager) {
          const depGraph = dependencyManager.getDependencyGraph();
          const circularDeps = dependencyManager.findCircularDependencies();

          // Add dependency errors to build result as console warnings (simplified approach)
          if (depGraph.errors.length > 0) {
            console.warn("Dependency errors found:");
            depGraph.errors.forEach((err) => {
              console.warn(
                `- ${err.file}:${err.line}:${err.column} - ${err.message}${
                  err.suggestion ? ` (suggestion: ${err.suggestion})` : ""
                }`
              );
            });
          }

          // Add circular dependency warnings
          if (circularDeps.length > 0) {
            console.warn("Circular dependencies found:");
            circularDeps.forEach((cycle) => {
              console.warn(`- ${cycle.join(" -> ")}`);
            });
          }

          console.log("Build completed with dependency analysis:");
          console.log(`- Files processed: ${resolvedFiles.size}`);
          console.log(
            `- Dependencies found: ${
              Array.from(depGraph.dependencies.values()).flat().length
            }`
          );
          console.log(`- Dependency errors: ${depGraph.errors.length}`);
          console.log(`- Circular dependencies: ${circularDeps.length}`);
        }
      });
    },
  };
};

/**
 * Determine the appropriate loader for a file based on its extension
 */
function getLoaderForFile(
  filePath: string
): "js" | "jsx" | "ts" | "tsx" | "json" | "css" | "text" {
  const ext = filePath.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "tsx":
      return "tsx";
    case "jsx":
      return "jsx";
    case "ts":
      return "ts";
    case "js":
      return "js";
    case "json":
      return "json";
    case "css":
    case "scss":
    case "sass":
    case "less":
      return "css";
    default:
      return "text";
  }
}

/**
 * Validate file content for common issues
 */
function validateFileContent(
  filePath: string,
  content: string
): Array<{
  message: string;
  line?: number;
  column?: number;
}> {
  const errors: Array<{ message: string; line?: number; column?: number }> = [];
  const lines = content.split("\n");

  // Check for common syntax issues
  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    // Check for unmatched brackets/braces
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;
    const openBrackets = (line.match(/\[/g) || []).length;
    const closeBrackets = (line.match(/\]/g) || []).length;
    const openParens = (line.match(/\(/g) || []).length;
    const closeParens = (line.match(/\)/g) || []).length;

    if (openBraces !== closeBraces && (openBraces > 0 || closeBraces > 0)) {
      errors.push({
        message: "Unmatched braces on this line",
        line: lineNumber,
        column: 1,
      });
    }

    if (
      openBrackets !== closeBrackets &&
      (openBrackets > 0 || closeBrackets > 0)
    ) {
      errors.push({
        message: "Unmatched brackets on this line",
        line: lineNumber,
        column: 1,
      });
    }

    if (openParens !== closeParens && (openParens > 0 || closeParens > 0)) {
      errors.push({
        message: "Unmatched parentheses on this line",
        line: lineNumber,
        column: 1,
      });
    }

    // Check for missing semicolons in JS/TS files (basic check)
    if (
      (filePath.endsWith(".js") || filePath.endsWith(".ts")) &&
      line.trim() &&
      !line.trim().endsWith(";") &&
      !line.trim().endsWith("{") &&
      !line.trim().endsWith("}") &&
      !line.trim().startsWith("//") &&
      !line.trim().startsWith("/*") &&
      !/^(if|else|for|while|function|class|import|export|const|let|var)\s/.test(
        line.trim()
      )
    ) {
      errors.push({
        message: "Missing semicolon",
        line: lineNumber,
        column: line.length,
      });
    }
  });

  return errors;
}
