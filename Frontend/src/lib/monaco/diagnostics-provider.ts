import * as monaco from "monaco-editor";
import type { VFSStore } from "../vfs/vfs-store";
import {
  DependencyManager,
  type DependencyError,
} from "../dependencies/dependency-manager";

/**
 * Monaco Diagnostics Provider
 * Provides real-time error diagnostics for import statements and file dependencies
 */
export class MonacoDiagnosticsProvider {
  private vfs: VFSStore;
  private dependencyManager: DependencyManager;
  private diagnosticsCollections = new Map<string, monaco.IDisposable>();

  constructor(vfs: VFSStore, dependencyManager: DependencyManager) {
    this.vfs = vfs;
    this.dependencyManager = dependencyManager;
    this.setupVFSListener();
  }

  /**
   * Setup VFS listener to update diagnostics when files change
   */
  private setupVFSListener(): void {
    this.vfs.on((event) => {
      switch (event.type) {
        case "update":
        case "create":
          this.updateDiagnostics(event.path);
          // Also update diagnostics for dependents
          const dependents = this.dependencyManager.getDependents(event.path);
          dependents.forEach((dep) => this.updateDiagnostics(dep));
          break;
        case "delete":
          this.clearDiagnostics(event.path);
          break;
        case "rename":
          if (event.newPath) {
            this.clearDiagnostics(event.path);
            this.updateDiagnostics(event.newPath);
          }
          break;
      }
    });
  }

  /**
   * Convert file path to Monaco URI
   */
  private pathToUri(path: string): monaco.Uri {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return monaco.Uri.parse(`file://${normalizedPath}`);
  }

  /**
   * Convert dependency errors to Monaco markers
   */
  private createMarkersFromErrors(
    errors: DependencyError[]
  ): monaco.editor.IMarkerData[] {
    return errors.map((error) => ({
      severity: this.getSeverity(error.severity),
      startLineNumber: error.line,
      startColumn: error.column,
      endLineNumber: error.line,
      endColumn: error.column + error.importPath.length,
      message: error.message,
      source: "VFS Dependency Resolver",
      code: "dependency-error",
      tags:
        error.severity === "error" ? [monaco.MarkerTag.Unnecessary] : undefined,
    }));
  }

  /**
   * Convert error severity to Monaco marker severity
   */
  private getSeverity(
    severity: "error" | "warning" | "info"
  ): monaco.MarkerSeverity {
    switch (severity) {
      case "error":
        return monaco.MarkerSeverity.Error;
      case "warning":
        return monaco.MarkerSeverity.Warning;
      case "info":
        return monaco.MarkerSeverity.Info;
      default:
        return monaco.MarkerSeverity.Error;
    }
  }

  /**
   * Update diagnostics for a specific file
   */
  public updateDiagnostics(filePath: string): void {
    const file = this.vfs.getFile(filePath);
    if (!file) {
      this.clearDiagnostics(filePath);
      return;
    }

    const uri = this.pathToUri(filePath);
    const model = monaco.editor.getModel(uri);

    if (!model) return;

    // Get dependency errors
    const dependencyGraph = this.dependencyManager.getDependencyGraph();
    const fileErrors = dependencyGraph.errors.filter(
      (err) => err.file === filePath
    );

    // Get additional validation errors
    const additionalErrors = this.validateFileContent(filePath, file.content);

    // Combine all errors
    const allErrors = [...fileErrors, ...additionalErrors];

    // Create markers
    const markers = this.createMarkersFromErrors(allErrors);

    // Set markers on the model
    monaco.editor.setModelMarkers(model, "vfs-dependency-resolver", markers);
  }

  /**
   * Clear diagnostics for a file
   */
  public clearDiagnostics(filePath: string): void {
    const uri = this.pathToUri(filePath);
    const model = monaco.editor.getModel(uri);

    if (model) {
      monaco.editor.setModelMarkers(model, "vfs-dependency-resolver", []);
    }

    // Clean up any disposables
    const disposable = this.diagnosticsCollections.get(filePath);
    if (disposable) {
      disposable.dispose();
      this.diagnosticsCollections.delete(filePath);
    }
  }

  /**
   * Validate file content for additional errors
   */
  private validateFileContent(
    filePath: string,
    content: string
  ): DependencyError[] {
    const errors: DependencyError[] = [];
    const lines = content.split("\n");

    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      // Check for duplicate imports
      const importMatches = line.match(
        /import\s+.*?from\s+['"`]([^'"`]+)['"`]/g
      );
      if (importMatches && importMatches.length > 1) {
        const importPaths = importMatches.map((match) => {
          const pathMatch = match.match(/['"`]([^'"`]+)['"`]/);
          return pathMatch ? pathMatch[1] : "";
        });

        const duplicates = importPaths.filter(
          (path, index) => importPaths.indexOf(path) !== index
        );

        if (duplicates.length > 0) {
          errors.push({
            file: filePath,
            line: lineNumber,
            column: 1,
            message: `Duplicate imports found: ${duplicates.join(", ")}`,
            severity: "warning",
            importPath: duplicates[0],
          });
        }
      }

      // Check for unused imports (basic check)
      const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"`]([^'"`]+)['"`]/;
      const importMatch = line.match(importRegex);

      if (importMatch) {
        const importedNames = importMatch[1]
          .split(",")
          .map((name) => name.trim());
        const importPath = importMatch[2];

        // Check if imported names are actually used in the file
        const unusedImports = importedNames.filter((name) => {
          const nameRegex = new RegExp(
            `\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
            "g"
          );
          const matches = content.match(nameRegex) || [];
          return matches.length <= 1; // Only the import statement itself
        });

        if (unusedImports.length > 0) {
          errors.push({
            file: filePath,
            line: lineNumber,
            column: line.indexOf(unusedImports[0]) + 1,
            message: `Unused imports: ${unusedImports.join(", ")}`,
            severity: "warning",
            importPath,
          });
        }
      }

      // Check for imports from the same file
      const importSelfRegex = /import\s+.*?from\s+['"`]\.\/([^'"`]*)\1['"`]/;
      if (importSelfRegex.test(line)) {
        errors.push({
          file: filePath,
          line: lineNumber,
          column: 1,
          message: "Cannot import from the same file",
          severity: "error",
          importPath: line.match(/['"`]([^'"`]+)['"`]/)?.[1] || "",
        });
      }
    });

    return errors;
  }

  /**
   * Get all diagnostics for a file
   */
  public getDiagnostics(filePath: string): DependencyError[] {
    const dependencyGraph = this.dependencyManager.getDependencyGraph();
    const fileErrors = dependencyGraph.errors.filter(
      (err) => err.file === filePath
    );

    const file = this.vfs.getFile(filePath);
    if (!file) return fileErrors;

    const additionalErrors = this.validateFileContent(filePath, file.content);
    return [...fileErrors, ...additionalErrors];
  }

  /**
   * Update diagnostics for all files
   */
  public updateAllDiagnostics(): void {
    const entries = this.vfs.getAllEntries();

    entries.forEach((entry, path) => {
      if (entry.type === "file") {
        this.updateDiagnostics(path);
      }
    });
  }

  /**
   * Clear all diagnostics
   */
  public clearAllDiagnostics(): void {
    const entries = this.vfs.getAllEntries();

    entries.forEach((entry, path) => {
      if (entry.type === "file") {
        this.clearDiagnostics(path);
      }
    });
  }

  /**
   * Setup code actions for fixing import errors
   */
  public setupCodeActions(): monaco.IDisposable {
    return monaco.languages.registerCodeActionProvider(
      ["typescript", "javascript"],
      {
        provideCodeActions: (model, _range, context) => {
          const actions: monaco.languages.CodeAction[] = [];
          const filePath = this.uriToPath(model.uri);

          // Filter markers that are import-related
          const importMarkers = context.markers.filter(
            (marker) =>
              marker.source === "VFS Dependency Resolver" &&
              marker.code === "dependency-error"
          );

          importMarkers.forEach((marker) => {
            // Get the import path from the marker message
            const messageMatch = marker.message.match(
              /Cannot resolve module '([^']+)'/
            );
            if (messageMatch) {
              const importPath = messageMatch[1];
              const suggestion = this.getSuggestionForImport(
                filePath,
                importPath
              );

              if (suggestion) {
                actions.push({
                  title: `Change to '${suggestion}'`,
                  kind: "quickfix",
                  isPreferred: true,
                  edit: {
                    edits: [
                      {
                        resource: model.uri,
                        textEdit: {
                          range: {
                            startLineNumber: marker.startLineNumber,
                            startColumn: marker.startColumn,
                            endLineNumber: marker.endLineNumber,
                            endColumn: marker.endColumn,
                          },
                          text: suggestion,
                        },
                        versionId: model.getVersionId(),
                      },
                    ],
                  },
                });
              }

              // Add action to create the missing file
              if (importPath.startsWith("./") || importPath.startsWith("../")) {
                actions.push({
                  title: `Create file '${importPath}'`,
                  kind: "quickfix",
                  command: {
                    id: "vfs.createFile",
                    title: "Create File",
                    arguments: [filePath, importPath],
                  },
                });
              }
            }
          });

          return {
            actions,
            dispose: () => {},
          };
        },
      }
    );
  }

  /**
   * Get suggestion for import path
   */
  private getSuggestionForImport(
    fromPath: string,
    importPath: string
  ): string | undefined {
    const dependencyGraph = this.dependencyManager.getDependencyGraph();
    const error = dependencyGraph.errors.find(
      (err) => err.file === fromPath && err.importPath === importPath
    );

    return error?.suggestion;
  }

  /**
   * Convert Monaco URI to file path
   */
  private uriToPath(uri: monaco.Uri): string {
    return uri.path;
  }

  /**
   * Setup completion provider for import paths
   */
  public setupCompletionProvider(): monaco.IDisposable {
    return monaco.languages.registerCompletionItemProvider(
      ["typescript", "javascript"],
      {
        triggerCharacters: ['"', "'", "/"],
        provideCompletionItems: (model, position) => {
          const textUntilPosition = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          });

          // Check if we're in an import statement
          const importMatch = textUntilPosition.match(
            /import\s+.*?from\s+['"`]([^'"`]*)$/
          );
          if (!importMatch) return { suggestions: [] };

          const currentPath = importMatch[1];
          const filePath = this.uriToPath(model.uri);
          const suggestions: monaco.languages.CompletionItem[] = [];

          // Get all available files for completion
          const entries = this.vfs.getAllEntries();
          const availableFiles = Array.from(entries.keys()).filter((path) => {
            const entry = entries.get(path);
            return entry?.type === "file" && path !== filePath;
          });

          // Generate relative path suggestions
          availableFiles.forEach((targetPath) => {
            const relativePath = this.getRelativePath(filePath, targetPath);

            if (relativePath.startsWith(currentPath)) {
              const fileName = targetPath.split("/").pop() || "";

              suggestions.push({
                
                label: relativePath,
                kind: monaco.languages.CompletionItemKind.File,
                insertText: relativePath,
                detail: `Import from ${fileName}`,
                documentation: `File: ${targetPath}`,
                sortText: relativePath.length.toString().padStart(3, "0"),
                range: {
                  startLineNumber: position.lineNumber,
                  startColumn: position.column - currentPath.length,
                  endLineNumber: position.lineNumber,
                  endColumn: position.column,
                },
              });
            }
          });

          return { suggestions };
        },
      }
    );
  }

  /**
   * Get relative path from one file to another
   */
  private getRelativePath(fromPath: string, toPath: string): string {
    const fromDir = fromPath.substring(0, fromPath.lastIndexOf("/")) || "/";
    const fromParts = fromDir.split("/").filter(Boolean);
    const toParts = toPath.split("/").filter(Boolean);

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

    // Remove file extension for imports (optional)
    const lastDotIndex = relativePath.lastIndexOf(".");
    if (lastDotIndex > relativePath.lastIndexOf("/")) {
      const ext = relativePath.substring(lastDotIndex);
      if ([".js", ".ts", ".jsx", ".tsx"].includes(ext)) {
        relativePath = relativePath.substring(0, lastDotIndex);
      }
    }

    return relativePath;
  }

  /**
   * Dispose all resources
   */
  public dispose(): void {
    this.diagnosticsCollections.forEach((disposable) => disposable.dispose());
    this.diagnosticsCollections.clear();
    this.clearAllDiagnostics();
  }
}
