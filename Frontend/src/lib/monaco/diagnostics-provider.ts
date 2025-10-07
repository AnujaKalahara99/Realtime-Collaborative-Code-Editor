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
      endColumn: Math.max(
        error.column + 1,
        error.column + error.importPath.length
      ),
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

    // Create markers and adjust ranges to underline the actual import string
    const markers = this.createMarkersFromErrors(allErrors).map((m) => {
      const lineContent = model.getLineContent(m.startLineNumber);
      // Try to find the quoted import path on this line to improve underline accuracy
      const pathMatch = lineContent.match(/['"][^'"]+['"]/g);
      if (pathMatch) {
        const first = pathMatch.find((s) =>
          m.message.includes(s.replace(/['"]/g, ""))
        );
        if (first) {
          const startIdx = lineContent.indexOf(first);
          if (startIdx >= 0) {
            return {
              ...m,
              startColumn: startIdx + 1,
              endColumn: startIdx + first.length + 1,
            } as monaco.editor.IMarkerData;
          }
        }
      }
      return m;
    });

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
                          // Replace keeping quotes intact if range includes them; otherwise insert quoted
                          text: /['"`]/.test(
                            model.getValueInRange({
                              startLineNumber: marker.startLineNumber,
                              startColumn: marker.startColumn,
                              endLineNumber: marker.endLineNumber,
                              endColumn: marker.endColumn,
                            })
                          )
                            ? suggestion
                            : `'${suggestion}'`,
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
   * Setup hover provider to show detailed info for unresolved imports
   */
  public setupHoverProvider(): monaco.IDisposable {
    return monaco.languages.registerHoverProvider(
      ["typescript", "javascript"],
      {
        provideHover: (model, position) => {
          const textUntilPosition = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: model.getLineMaxColumn(position.lineNumber),
          });

          // Detect import path under cursor
          const importLineMatch = textUntilPosition.match(
            /import\s+.*?from\s+(["'`])([^"'`]+)\1|require\(\s*(["'`])([^"'`]+)\3\s*\)/
          );
          if (!importLineMatch) return { contents: [] };

          const importPath = (importLineMatch[2] || importLineMatch[4]) ?? "";
          if (!importPath) return { contents: [] };

          const filePath = this.uriToPath(model.uri);
          const depGraph = this.dependencyManager.getDependencyGraph();
          const err = depGraph.errors.find(
            (e) => e.file === filePath && e.importPath === importPath
          );

          if (!err) return { contents: [] };

          const md: monaco.IMarkdownString = {
            value:
              `$(error) ${err.message}\n\n` +
              (err.suggestion ? `Suggestion: \`${err.suggestion}\`\n\n` : "") +
              `Source: VFS Dependency Resolver`,
            isTrusted: true,
            supportThemeIcons: true,
          };

          // Compute range roughly over the import path
          const lineContent = model.getLineContent(position.lineNumber);
          const quoted = lineContent.match(/(["'`])([^"'`]+)\1/);
          let startColumn = 1;
          let endColumn = 1;
          if (quoted) {
            const idx = lineContent.indexOf(quoted[0]);
            if (idx >= 0) {
              startColumn = idx + 1;
              endColumn = idx + quoted[0].length + 1;
            }
          }

          return {
            range: new monaco.Range(
              position.lineNumber,
              startColumn,
              position.lineNumber,
              endColumn
            ),
            contents: [md],
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

          // Check if we're in an import or require string
          const importMatch = textUntilPosition.match(
            /import\s+.*?from\s+['"`]([^'"`]*)$|require\(\s*['"`]([^'"`]*)$/
          );
          if (!importMatch) return { suggestions: [] };

          const currentPath = (importMatch[1] || importMatch[2] || "").trim();
          const filePath = this.uriToPath(model.uri);

          // Get all available files for completion
          const entries = this.vfs.getAllEntries();
          const availableFiles = Array.from(entries.keys()).filter((path) => {
            const entry = entries.get(path);
            return entry?.type === "file" && path !== filePath;
          });

          type Candidate = { display: string; target: string; score: number };
          const candidates: Candidate[] = [];

          const addIfResolvable = (proposed: string, targetPath: string) => {
            try {
              const fromDir =
                filePath.substring(0, filePath.lastIndexOf("/")) || "/";
              const resolved = new URL(proposed, `file://${fromDir}/`).pathname;
              const exists =
                this.vfs.getFile(resolved) ||
                this.vfs.getFile(resolved + ".ts") ||
                this.vfs.getFile(resolved + ".tsx") ||
                this.vfs.getFile(resolved + ".js") ||
                this.vfs.getFile(resolved + ".jsx") ||
                this.vfs.getFile(resolved + ".json") ||
                this.vfs.getFile(`${resolved}/index.ts`) ||
                this.vfs.getFile(`${resolved}/index.tsx`) ||
                this.vfs.getFile(`${resolved}/index.js`) ||
                this.vfs.getFile(`${resolved}/index.jsx`) ||
                this.vfs.getFile(`${resolved}/index.json`);
              if (exists) {
                candidates.push({
                  display: proposed,
                  target: targetPath,
                  score: proposed.length,
                });
              }
            } catch {
              // ignore invalid URLs
            }
          };

          for (const targetPath of availableFiles) {
            const relativePath = this.getRelativePath(filePath, targetPath);
            if (!relativePath.startsWith(currentPath)) continue;

            // Primary: propose extensionless relative paths for TS/JS
            let proposed = relativePath;
            const lastDot = proposed.lastIndexOf(".");
            if (lastDot > proposed.lastIndexOf("/")) {
              const ext = proposed.substring(lastDot);
              if ([".ts", ".tsx", ".js", ".jsx"].includes(ext)) {
                proposed = proposed.substring(0, lastDot);
              }
            }
            addIfResolvable(proposed, targetPath);

            // Secondary: folder path for index.*
            const baseName = targetPath.split("/").pop() || "";
            if (baseName.startsWith("index.")) {
              const folderProposed = this.getRelativePath(
                filePath,
                targetPath.substring(0, targetPath.lastIndexOf("/"))
              );
              if (folderProposed.startsWith(currentPath)) {
                addIfResolvable(folderProposed, targetPath);
              }
            }
          }

          candidates.sort((a, b) => a.score - b.score);
          const suggestions = candidates.map((c, i) => ({
            label: c.display,
            kind: monaco.languages.CompletionItemKind.File,
            insertText: c.display,
            detail: `File: ${c.target}`,
            sortText: String(i).padStart(3, "0"),
            range: {
              startLineNumber: position.lineNumber,
              startColumn: position.column - currentPath.length,
              endLineNumber: position.lineNumber,
              endColumn: position.column,
            },
          }));

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
