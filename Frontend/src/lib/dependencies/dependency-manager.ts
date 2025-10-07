import type { VFSStore } from "../vfs/vfs-store";

export interface Dependency {
  from: string;
  to: string;
  importStatement: string;
  line: number;
  column: number;
  resolved: boolean;
}

export interface DependencyError {
  file: string;
  line: number;
  column: number;
  message: string;
  severity: "error" | "warning" | "info";
  importPath: string;
  suggestion?: string;
}

export interface DependencyGraph {
  dependencies: Map<string, string[]>; // file -> dependencies
  dependents: Map<string, string[]>; // file -> dependents
  errors: DependencyError[];
}

/**
 * Dependency Manager
 * Tracks file dependencies, validates imports, and provides suggestions
 */
export class DependencyManager {
  private vfs: VFSStore;
  private dependencyCache = new Map<string, Dependency[]>();
  private lastModified = new Map<string, number>();

  constructor(vfs: VFSStore) {
    this.vfs = vfs;
    this.setupVFSListener();
  }

  /**
   * Setup VFS listener to invalidate cache on file changes
   */
  private setupVFSListener(): void {
    this.vfs.on((event) => {
      switch (event.type) {
        case "update":
        case "create":
          this.invalidateCache(event.path);
          break;
        case "delete":
          this.invalidateCache(event.path);
          this.removeFromCache(event.path);
          break;
        case "rename":
          if (event.newPath) {
            this.invalidateCache(event.path);
            this.invalidateCache(event.newPath);
            this.removeFromCache(event.path);
          }
          break;
      }
    });
  }

  /**
   * Invalidate cache for a file and its dependents
   */
  private invalidateCache(filePath: string): void {
    // Clear cache for the file itself
    this.dependencyCache.delete(filePath);
    this.lastModified.delete(filePath);

    // Clear cache for files that depend on this file
    this.dependencyCache.forEach((_, path) => {
      const dependencies = this.getDependencies(path);
      if (dependencies.some((dep) => dep.to === filePath)) {
        this.dependencyCache.delete(path);
        this.lastModified.delete(path);
      }
    });
  }

  /**
   * Remove file from cache completely
   */
  private removeFromCache(filePath: string): void {
    this.dependencyCache.delete(filePath);
    this.lastModified.delete(filePath);
  }

  /**
   * Check if cache is valid for a file
   */
  private isCacheValid(filePath: string): boolean {
    const file = this.vfs.getFile(filePath);
    if (!file) return false;

    const cachedTime = this.lastModified.get(filePath);
    return cachedTime !== undefined && cachedTime >= file.lastModified;
  }

  /**
   * Parse import/require statements from file content
   */
  private parseImports(filePath: string, content: string): Dependency[] {
    const dependencies: Dependency[] = [];
    const lines = content.split("\n");

    lines.forEach((line, lineIndex) => {
      // ES6 imports
      const importRegex =
        /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"`]([^'"`]+)['"`]/g;

      // CommonJS requires
      const requireRegex = /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;

      // Dynamic imports
      const dynamicImportRegex = /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;

      let match;

      // Parse ES6 imports
      while ((match = importRegex.exec(line)) !== null) {
        const importPath = match[1];
        const resolvedPath = this.resolveImport(filePath, importPath);

        dependencies.push({
          from: filePath,
          to: resolvedPath || importPath,
          importStatement: match[0],
          line: lineIndex + 1,
          column: match.index + 1,
          resolved: resolvedPath !== null,
        });
      }

      // Reset regex lastIndex for next iteration
      importRegex.lastIndex = 0;

      // Parse CommonJS requires
      while ((match = requireRegex.exec(line)) !== null) {
        const importPath = match[1];
        const resolvedPath = this.resolveImport(filePath, importPath);

        dependencies.push({
          from: filePath,
          to: resolvedPath || importPath,
          importStatement: match[0],
          line: lineIndex + 1,
          column: match.index + 1,
          resolved: resolvedPath !== null,
        });
      }

      requireRegex.lastIndex = 0;

      // Parse dynamic imports
      while ((match = dynamicImportRegex.exec(line)) !== null) {
        const importPath = match[1];
        const resolvedPath = this.resolveImport(filePath, importPath);

        dependencies.push({
          from: filePath,
          to: resolvedPath || importPath,
          importStatement: match[0],
          line: lineIndex + 1,
          column: match.index + 1,
          resolved: resolvedPath !== null,
        });
      }

      dynamicImportRegex.lastIndex = 0;
    });

    return dependencies;
  }

  /**
   * Resolve import path relative to the importing file
   */
  private resolveImport(fromPath: string, importPath: string): string | null {
    // Skip external modules (npm packages)
    if (
      !importPath.startsWith("./") &&
      !importPath.startsWith("../") &&
      !importPath.startsWith("/")
    ) {
      return null; // External module, not resolvable in VFS
    }

    if (importPath.startsWith("./") || importPath.startsWith("../")) {
      // Relative import
      const fromDir = fromPath.substring(0, fromPath.lastIndexOf("/")) || "/";

      try {
        const resolved = new URL(importPath, `file://${fromDir}/`).pathname;
        return this.findFileWithExtensions(resolved);
      } catch {
        return null;
      }
    } else if (importPath.startsWith("/")) {
      // Absolute import
      return this.findFileWithExtensions(importPath);
    }

    return null;
  }

  /**
   * Find file with common extensions
   */
  private findFileWithExtensions(basePath: string): string | null {
    // Try with original path first
    if (this.vfs.getFile(basePath)) {
      return basePath;
    }

    // Case-insensitive lookup helper
    const ciLookup = (candidate: string): string | null => {
      const entries = this.vfs.getAllEntries();
      const candLower = candidate.toLowerCase();
      for (const key of entries.keys()) {
        const entry = entries.get(key);
        if (entry?.type === "file" && key.toLowerCase() === candLower) {
          return key; // return actual cased path in VFS
        }
      }
      return null;
    };

    // Try with common extensions
    const extensions = [".ts", ".tsx", ".js", ".jsx", ".json", ".css", ".scss"];

    for (const ext of extensions) {
      const pathWithExt = basePath + ext;
      if (this.vfs.getFile(pathWithExt)) {
        return pathWithExt;
      }
      const ci = ciLookup(pathWithExt);
      if (ci) return ci;
    }

    // Try index files in directory
    if (this.vfs.getDirectory(basePath)) {
      for (const ext of extensions) {
        const indexPath = `${basePath}/index${ext}`;
        if (this.vfs.getFile(indexPath)) {
          return indexPath;
        }
        const ci = ciLookup(indexPath);
        if (ci) return ci;
      }
    }

    return null;
  }

  /**
   * Public helper for other components to validate/resolve an import path.
   */
  public resolvePath(fromPath: string, importPath: string): string | null {
    return this.resolveImport(fromPath, importPath);
  }

  /**
   * Get dependencies for a file
   */
  public getDependencies(filePath: string): Dependency[] {
    const file = this.vfs.getFile(filePath);
    if (!file) return [];

    // Check cache validity
    if (this.isCacheValid(filePath)) {
      return this.dependencyCache.get(filePath) || [];
    }

    // Parse dependencies
    const dependencies = this.parseImports(filePath, file.content);

    // Update cache
    this.dependencyCache.set(filePath, dependencies);
    this.lastModified.set(filePath, file.lastModified);

    return dependencies;
  }

  /**
   * Get files that depend on the given file
   */
  public getDependents(filePath: string): string[] {
    const dependents: string[] = [];
    const entries = this.vfs.getAllEntries();

    entries.forEach((entry, path) => {
      if (entry.type === "file" && path !== filePath) {
        const dependencies = this.getDependencies(path);
        if (dependencies.some((dep) => dep.to === filePath && dep.resolved)) {
          dependents.push(path);
        }
      }
    });

    return dependents;
  }

  /**
   * Get complete dependency graph
   */
  public getDependencyGraph(): DependencyGraph {
    const dependencies = new Map<string, string[]>();
    const dependents = new Map<string, string[]>();
    const errors: DependencyError[] = [];
    const entries = this.vfs.getAllEntries();

    // Build dependency graph
    entries.forEach((entry, path) => {
      if (entry.type === "file") {
        const fileDependencies = this.getDependencies(path);
        const resolvedDeps = fileDependencies
          .filter((dep) => dep.resolved)
          .map((dep) => dep.to);

        dependencies.set(path, resolvedDeps);

        // Collect errors
        fileDependencies.forEach((dep) => {
          if (!dep.resolved && this.isLocalImport(dep.to)) {
            const suggestion = this.suggestAlternative(path, dep.to);
            errors.push({
              file: path,
              line: dep.line,
              column: dep.column,
              message: `Cannot resolve module '${dep.to}'`,
              severity: "error",
              importPath: dep.to,
              suggestion,
            });
          }
        });
      }
    });

    // Build reverse dependencies (dependents)
    dependencies.forEach((deps, file) => {
      deps.forEach((dep) => {
        if (!dependents.has(dep)) {
          dependents.set(dep, []);
        }
        dependents.get(dep)!.push(file);
      });
    });

    return { dependencies, dependents, errors };
  }

  /**
   * Check if import path is local (not external module)
   */
  private isLocalImport(importPath: string): boolean {
    return (
      importPath.startsWith("./") ||
      importPath.startsWith("../") ||
      importPath.startsWith("/")
    );
  }

  /**
   * Suggest alternative import path for unresolved imports
   */
  private suggestAlternative(
    fromPath: string,
    importPath: string
  ): string | undefined {
    const entries = this.vfs.getAllEntries();
    const allFiles = Array.from(entries.keys()).filter((path) => {
      const entry = entries.get(path);
      return entry?.type === "file";
    });

    // Extract the filename from the import path
    const importedFileName = importPath.split("/").pop() || "";
    const baseFileName = importedFileName.split(".")[0];

    // Find files with similar names
    const similarFiles = allFiles.filter((filePath) => {
      const fileName = filePath.split("/").pop() || "";
      const baseFileNameInVfs = fileName.split(".")[0];
      return (
        baseFileNameInVfs.toLowerCase().includes(baseFileName.toLowerCase()) ||
        baseFileName.toLowerCase().includes(baseFileNameInVfs.toLowerCase())
      );
    });

    if (similarFiles.length > 0) {
      // Find the closest match based on path similarity
      const fromDir = fromPath.substring(0, fromPath.lastIndexOf("/")) || "/";

      // Rank by shortest relative path first
      const ranked = similarFiles
        .map((file) => ({ file, rel: this.getRelativePath(fromDir, file) }))
        .sort((a, b) => a.rel.length - b.rel.length);

      // Return the first candidate that actually resolves via the same resolver
      for (const { file, rel } of ranked) {
        // 1) Try with the computed relative (keeps extension)
        if (this.resolveImport(fromPath, rel)) return rel;

        // 2) Try extensionless variant as some users prefer './module'
        const lastDot = rel.lastIndexOf(".");
        if (lastDot > rel.lastIndexOf("/")) {
          const withoutExt = rel.substring(0, lastDot);
          if (this.resolveImport(fromPath, withoutExt)) return withoutExt;
        }

        // 3) If the matched file is an index file, try the folder path
        const fileName = file.split("/").pop() || "";
        if (fileName.startsWith("index.")) {
          const folderRel = this.getRelativePath(
            fromDir,
            file.substring(0, file.lastIndexOf("/"))
          );
          if (this.resolveImport(fromPath, folderRel)) return folderRel;
        }
      }
    }

    return undefined;
  }

  /**
   * Get relative path from one directory to a file
   */
  private getRelativePath(fromDir: string, toFile: string): string {
    const fromParts = fromDir.split("/").filter(Boolean);
    const toParts = toFile.split("/").filter(Boolean);

    // Find common base
    let commonLength = 0;
    while (
      commonLength < fromParts.length &&
      commonLength < toParts.length &&
      fromParts[commonLength] === toParts[commonLength]
    ) {
      commonLength++;
    }

    // Build relative path
    const upLevels = fromParts.length - commonLength;
    const downPath = toParts.slice(commonLength);

    let relativePath = "";
    if (upLevels === 0 && downPath.length > 0) {
      relativePath = "./" + downPath.join("/");
    } else if (upLevels > 0) {
      relativePath = "../".repeat(upLevels) + downPath.join("/");
    } else {
      relativePath = "./";
    }

    return relativePath;
  }

  /**
   * Check for circular dependencies
   */
  public findCircularDependencies(): string[][] {
    const graph = this.getDependencyGraph();
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const cycles: string[][] = [];

    const dfs = (node: string, path: string[]): void => {
      if (recursionStack.has(node)) {
        // Found a cycle
        const cycleStart = path.indexOf(node);
        if (cycleStart >= 0) {
          cycles.push([...path.slice(cycleStart), node]);
        }
        return;
      }

      if (visited.has(node)) return;

      visited.add(node);
      recursionStack.add(node);

      const dependencies = graph.dependencies.get(node) || [];
      for (const dep of dependencies) {
        dfs(dep, [...path, node]);
      }

      recursionStack.delete(node);
    };

    // Check all files
    graph.dependencies.forEach((_, file) => {
      if (!visited.has(file)) {
        dfs(file, []);
      }
    });

    return cycles;
  }

  /**
   * Get unused files (files with no dependents)
   */
  public getUnusedFiles(entryPoints: string[] = []): string[] {
    const graph = this.getDependencyGraph();
    const unused: string[] = [];

    graph.dependencies.forEach((_, file) => {
      const dependents = graph.dependents.get(file) || [];
      const isEntryPoint = entryPoints.includes(file);

      if (dependents.length === 0 && !isEntryPoint) {
        unused.push(file);
      }
    });

    return unused;
  }

  /**
   * Clear all caches
   */
  public clearCache(): void {
    this.dependencyCache.clear();
    this.lastModified.clear();
  }
}
