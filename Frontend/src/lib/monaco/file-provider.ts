import * as monaco from "monaco-editor";
import type { VFSStore } from "../vfs/vfs-store";
import type { VFSFile } from "../vfs/types";

/**
 * Monaco Editor File Provider
 * Connects VFS to Monaco Editor for proper file resolution and IntelliSense
 */
export class MonacoFileProvider {
  private vfs: VFSStore;
  private models = new Map<string, monaco.editor.ITextModel>();
  private disposables: monaco.IDisposable[] = [];

  constructor(vfs: VFSStore) {
    this.vfs = vfs;
    this.setupFileWatcher();
    this.configureTypescriptDefaults();
  }

  /**
   * Configure TypeScript compiler options for better IntelliSense
   */
  private configureTypescriptDefaults(): void {
    const compilerOptions: monaco.languages.typescript.CompilerOptions = {
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      allowImportingTsExtensions: true,
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
      allowJs: true,
      checkJs: false,
      declaration: false,
      declarationMap: false,
      sourceMap: false,
      typeRoots: ["node_modules/@types"],
    };

    // Configure TypeScript worker
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
      compilerOptions
    );
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions(
      compilerOptions
    );

    // Set diagnostics options
    const diagnosticsOptions: monaco.languages.typescript.DiagnosticsOptions = {
      noSemanticValidation: false,
      noSyntaxValidation: false,
      noSuggestionDiagnostics: false,
    };

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(
      diagnosticsOptions
    );
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(
      diagnosticsOptions
    );
  }

  /**
   * Watch for VFS changes and update Monaco models accordingly
   */
  private setupFileWatcher(): void {
    this.vfs.on((event) => {
      switch (event.type) {
        case "create":
          this.createOrUpdateModel(event.path, event.content || "");
          break;
        case "update":
          this.createOrUpdateModel(event.path, event.content || "");
          break;
        case "delete":
          this.deleteModel(event.path);
          break;
        case "rename":
          if (event.newPath) {
            this.renameModel(event.path, event.newPath);
          }
          break;
      }
    });
  }

  /**
   * Create or update a Monaco model for a file
   */
  private createOrUpdateModel(
    path: string,
    content: string
  ): monaco.editor.ITextModel | null {
    const file = this.vfs.getFile(path);
    if (!file) return null;

    const uri = this.pathToUri(path);
    let model = monaco.editor.getModel(uri);

    if (model) {
      // Update existing model
      if (model.getValue() !== content) {
        model.setValue(content);
      }
    } else {
      // Create new model
      const language = this.getLanguageFromPath(path);
      model = monaco.editor.createModel(content, language, uri);
      this.models.set(path, model);

      // Add to TypeScript worker if it's a TS/JS file
      if (language === "typescript" || language === "javascript") {
        this.addLibraryFile(path, content);
      }
    }

    return model;
  }

  /**
   * Delete a Monaco model
   */
  private deleteModel(path: string): void {
    const uri = this.pathToUri(path);
    const model = monaco.editor.getModel(uri);

    if (model) {
      model.dispose();
    }

    this.models.delete(path);
    this.removeLibraryFile(path);
  }

  /**
   * Rename a Monaco model
   */
  private renameModel(oldPath: string, newPath: string): void {
    const model = this.models.get(oldPath);
    if (model) {
      const file = this.vfs.getFile(newPath);
      if (file) {
        // Create new model with new path
        this.createOrUpdateModel(newPath, file.content);
        // Delete old model
        this.deleteModel(oldPath);
      }
    }
  }

  /**
   * Convert file path to Monaco URI
   */
  private pathToUri(path: string): monaco.Uri {
    // Ensure path starts with /
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return monaco.Uri.parse(`file://${normalizedPath}`);
  }

  /**
   * Get Monaco language ID from file path
   */
  private getLanguageFromPath(path: string): string {
    const ext = path.split(".").pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      json: "json",
      css: "css",
      scss: "scss",
      less: "less",
      html: "html",
      md: "markdown",
      xml: "xml",
      yaml: "yaml",
      yml: "yaml",
      py: "python",
      java: "java",
      c: "c",
      cpp: "cpp",
      cs: "csharp",
      php: "php",
      rb: "ruby",
      go: "go",
      rs: "rust",
      kt: "kotlin",
      swift: "swift",
      dart: "dart",
    };
    return languageMap[ext || ""] || "plaintext";
  }

  /**
   * Add file to TypeScript extra libs for IntelliSense
   */
  private addLibraryFile(path: string, content: string): void {
    const uri = this.pathToUri(path);

    // Add to TypeScript extra libs
    const disposable =
      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        content,
        uri.toString()
      );

    this.disposables.push(disposable);
  }

  /**
   * Remove file from TypeScript extra libs
   */
  private removeLibraryFile(_path: string): void {
    // TypeScript extra libs are managed by disposables
    // The disposable cleanup happens when the class is disposed
  }

  /**
   * Initialize all existing VFS files as Monaco models
   */
  public initializeModels(): void {
    const entries = this.vfs.getAllEntries();

    entries.forEach((entry, path) => {
      if (entry.type === "file") {
        const file = entry as VFSFile;
        this.createOrUpdateModel(path, file.content);
      }
    });
  }

  /**
   * Get a Monaco model for a file path
   */
  public getModel(path: string): monaco.editor.ITextModel | null {
    const uri = this.pathToUri(path);
    return monaco.editor.getModel(uri);
  }

  /**
   * Create a model for a file if it doesn't exist
   */
  public ensureModel(path: string): monaco.editor.ITextModel | null {
    const file = this.vfs.getFile(path);
    if (!file) return null;

    let model = this.getModel(path);
    if (!model) {
      model = this.createOrUpdateModel(path, file.content);
    }

    return model;
  }

  /**
   * Get all available file paths for autocomplete
   */
  public getAllFilePaths(): string[] {
    const entries = this.vfs.getAllEntries();
    return Array.from(entries.keys()).filter((path) => {
      const entry = entries.get(path);
      return entry?.type === "file";
    });
  }

  /**
   * Resolve relative import path
   */
  public resolveImportPath(
    fromPath: string,
    importPath: string
  ): string | null {
    if (importPath.startsWith("./") || importPath.startsWith("../")) {
      // Relative import
      const fromDir = fromPath.substring(0, fromPath.lastIndexOf("/")) || "/";
      const resolved = new URL(importPath, `file://${fromDir}/`).pathname;

      // Try different extensions
      const extensions = ["", ".ts", ".tsx", ".js", ".jsx", ".json"];
      for (const ext of extensions) {
        const pathWithExt = resolved + ext;
        if (this.vfs.getFile(pathWithExt)) {
          return pathWithExt;
        }
      }

      // Try index files
      if (this.vfs.getDirectory(resolved)) {
        for (const ext of extensions.slice(1)) {
          // Skip empty extension
          const indexPath = `${resolved}/index${ext}`;
          if (this.vfs.getFile(indexPath)) {
            return indexPath;
          }
        }
      }
    } else if (importPath.startsWith("/")) {
      // Absolute import
      return this.resolveImportPath("/", "." + importPath);
    }

    return null;
  }

  /**
   * Get file dependencies (imports)
   */
  public getFileDependencies(path: string): string[] {
    const file = this.vfs.getFile(path);
    if (!file) return [];

    const dependencies: string[] = [];
    const content = file.content;

    // Match import statements
    const importRegex =
      /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"`]([^'"`]+)['"`]/g;
    const requireRegex = /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;

    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const resolved = this.resolveImportPath(path, match[1]);
      if (resolved) {
        dependencies.push(resolved);
      }
    }

    while ((match = requireRegex.exec(content)) !== null) {
      const resolved = this.resolveImportPath(path, match[1]);
      if (resolved) {
        dependencies.push(resolved);
      }
    }

    return dependencies;
  }

  /**
   * Get files that depend on the given file
   */
  public getFileDependents(path: string): string[] {
    const dependents: string[] = [];
    const entries = this.vfs.getAllEntries();

    entries.forEach((entry, entryPath) => {
      if (entry.type === "file" && entryPath !== path) {
        const deps = this.getFileDependencies(entryPath);
        if (deps.includes(path)) {
          dependents.push(entryPath);
        }
      }
    });

    return dependents;
  }

  /**
   * Validate imports in a file and return errors
   */
  public validateImports(path: string): Array<{
    line: number;
    column: number;
    message: string;
    severity: "error" | "warning";
    importPath: string;
  }> {
    const file = this.vfs.getFile(path);
    if (!file) return [];

    const errors: Array<{
      line: number;
      column: number;
      message: string;
      severity: "error" | "warning";
      importPath: string;
    }> = [];

    const lines = file.content.split("\n");

    lines.forEach((line, lineIndex) => {
      const importRegex =
        /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"`]([^'"`]+)['"`]/g;
      const requireRegex = /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;

      let match;
      while ((match = importRegex.exec(line)) !== null) {
        const importPath = match[1];
        const resolved = this.resolveImportPath(path, importPath);

        if (
          !resolved &&
          (importPath.startsWith("./") ||
            importPath.startsWith("../") ||
            importPath.startsWith("/"))
        ) {
          errors.push({
            line: lineIndex + 1,
            column: match.index + 1,
            message: `Cannot resolve module '${importPath}'`,
            severity: "error",
            importPath,
          });
        }
      }

      while ((match = requireRegex.exec(line)) !== null) {
        const importPath = match[1];
        const resolved = this.resolveImportPath(path, importPath);

        if (
          !resolved &&
          (importPath.startsWith("./") ||
            importPath.startsWith("../") ||
            importPath.startsWith("/"))
        ) {
          errors.push({
            line: lineIndex + 1,
            column: match.index + 1,
            message: `Cannot resolve module '${importPath}'`,
            severity: "error",
            importPath,
          });
        }
      }
    });

    return errors;
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    // Dispose all Monaco models
    this.models.forEach((model) => model.dispose());
    this.models.clear();

    // Dispose all extra libs
    this.disposables.forEach((disposable) => disposable.dispose());
    this.disposables = [];
  }
}
