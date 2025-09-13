import { useRef, useEffect, useState } from "react";
import { Editor } from "@monaco-editor/react";
import loader from "@monaco-editor/loader";
import * as monaco from "monaco-editor";
import { MonacoBinding } from "y-monaco";
import { useTheme } from "../../../Contexts/ThemeProvider";
import type { FileNode } from "../ProjectManagementPanel/file.types";
import CollaborativeCursor from "./CollaborativeCursor";
import { VFSMonacoIntegration } from "../../../lib/integration/vfs-monaco-integration";
import {
  useEditorCollaboration,
  type CollaborationUser,
} from "../../../Contexts/EditorContext";

interface MonacoEditorProps {
  selectedFile?: FileNode | null;
  initialValue?: string;
  onFileContentChange?: (fileId: string, content: string) => void;
}

// Configure Monaco environment for Vite - only if not already configured
if (typeof window !== "undefined" && !(window as any).MonacoEnvironment) {
  (window as any).MonacoEnvironment = {
    getWorker(_: string, label: string) {
      switch (label) {
        case "json":
          return new Worker(
            new URL(
              "monaco-editor/esm/vs/language/json/json.worker.js",
              import.meta.url
            ),
            { type: "module" }
          );
        case "css":
        case "scss":
        case "less":
          return new Worker(
            new URL(
              "monaco-editor/esm/vs/language/css/css.worker.js",
              import.meta.url
            ),
            { type: "module" }
          );
        case "html":
        case "handlebars":
        case "razor":
          return new Worker(
            new URL(
              "monaco-editor/esm/vs/language/html/html.worker.js",
              import.meta.url
            ),
            { type: "module" }
          );
        case "typescript":
        case "javascript":
          return new Worker(
            new URL(
              "monaco-editor/esm/vs/language/typescript/ts.worker.js",
              import.meta.url
            ),
            { type: "module" }
          );
        default:
          return new Worker(
            new URL(
              "monaco-editor/esm/vs/editor/editor.worker.js",
              import.meta.url
            ),
            { type: "module" }
          );
      }
    },
  };
}

// // Configure Monaco loader
loader.config({ monaco });

// Ensure Monaco is ready before using it
loader
  .init()
  .then((monacoInstance) => {
    console.log(
      "Monaco Editor loaded successfully:",
      monacoInstance.editor.getModels().length,
      "models"
    );
  })
  .catch((error) => {
    console.error("Failed to load Monaco Editor:", error);
  });

export default function MonacoEditor({
  selectedFile,
  initialValue = "// Select a file to start editing",
  onFileContentChange,
}: MonacoEditorProps) {
  const { theme } = useTheme();
  // const { vfsBridge } = useFileTree();

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const currentBindingRef = useRef<MonacoBinding | null>(null);
  const currentFileRef = useRef<string | null>(null);
  const contentUnsubscribeRef = useRef<(() => void) | null>(null);
  const integrationRef = useRef<VFSMonacoIntegration | null>(null);
  const diagnosticsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [language, setLanguage] = useState<string>("javascript");
  const [fileUsers, setFileUsers] = useState<CollaborationUser[]>([]);
  // const [isConnected, setIsConnected] = useState(false);
  const [diagnosticsCount, setDiagnosticsCount] = useState({
    errors: 0,
    warnings: 0,
  });
  const {
    vfsBridge,
    isConnected,
    getUsersInFile,
    getFileText,
    // getFileContent,
    initializeFileContent,
    getAwareness,
    onFileContentChange: registerFileContentChange,
  } = useEditorCollaboration();

  useEffect(() => {
    if (vfsBridge) {
      try {
        integrationRef.current = new VFSMonacoIntegration(
          vfsBridge.getVFSStore(),
          {
            enableDiagnostics: true,
            enableAutoCompletion: true,
            enableCodeActions: true,
          }
        );
      } catch (error) {
        console.error("Error creating VFS Monaco integration:", error);
      }
    }

    return () => {
      try {
        if (integrationRef.current) {
          integrationRef.current.dispose();
          integrationRef.current = null;
        }
        if (diagnosticsTimeoutRef.current) {
          clearTimeout(diagnosticsTimeoutRef.current);
          diagnosticsTimeoutRef.current = null;
        }
      } catch (error) {
        console.error("Error disposing VFS integration:", error);
      }
    };
  }, [vfsBridge]);

  // Function to normalize file path
  const normalizePath = (path: string): string => {
    // Remove double slashes and ensure single leading slash
    return "/" + path.replace(/^\/+/, "").replace(/\/+/g, "/");
  };

  // Function to update Monaco diagnostics
  const updateMonacoDiagnostics = (filePath: string, content?: string) => {
    if (!integrationRef.current || !editorRef.current) {
      console.log("Integration or editor not available for diagnostics");
      return;
    }

    const model = editorRef.current.getModel();
    if (!model) {
      console.log("No Monaco model available");
      return;
    }

    console.log("Updating diagnostics for:", filePath);

    // Normalize the file path to prevent double slashes
    const normalizedPath = normalizePath(filePath);
    console.log(
      "Normalized path:",
      normalizedPath,
      "(original:",
      filePath,
      ")"
    );

    // Update VFS content if provided
    if (content !== undefined && vfsBridge) {
      const fileId = vfsBridge.getIdByPath(normalizedPath);
      if (fileId) {
        try {
          vfsBridge.updateFileContent(fileId, content);
          console.log("Updated VFS content for:", normalizedPath);
        } catch (error) {
          console.error("Error updating VFS content:", error);
          // Try to find the file with original path
          const fallbackId = vfsBridge.getIdByPath(filePath);
          if (fallbackId) {
            vfsBridge.updateFileContent(fallbackId, content);
            console.log("Updated VFS content with fallback path:", filePath);
          }
        }
      } else {
        console.warn("File ID not found for path:", normalizedPath);
        console.warn("Original path was:", filePath);
      }
    } else if (vfsBridge) {
      // If no content provided, get current content from Monaco model
      const currentContent = model.getValue();
      const fileId = vfsBridge.getIdByPath(normalizedPath);
      if (fileId && currentContent) {
        try {
          vfsBridge.updateFileContent(fileId, currentContent);
          console.log(
            "Updated VFS with current Monaco content for:",
            normalizedPath
          );
        } catch (error) {
          console.error("Error updating VFS with Monaco content:", error);
        }
      }
    }

    // Force VFS and dependency manager to refresh
    if (integrationRef.current) {
      // Get the VFS store and check if file exists
      const vfsStore = integrationRef.current.getVFSStore();
      const file = vfsStore.getEntry(normalizedPath);
      console.log(
        "VFS file content:",
        file && file.type === "file"
          ? (file as any).content?.substring(0, 200) + "..."
          : "File not found in VFS"
      );

      // Force dependency analysis
      try {
        const dependencyManager = integrationRef.current.getDependencyManager();
        if (dependencyManager) {
          console.log("Forcing dependency analysis...");
          // Clear cache and re-analyze
          const dependencies =
            dependencyManager.getDependencies(normalizedPath);
          console.log("Dependencies found:", dependencies);

          const graph = dependencyManager.getDependencyGraph();
          console.log("Dependency graph errors:", graph.errors);
        }
      } catch (error) {
        console.error("Error during dependency analysis:", error);
      }
    }

    // Get diagnostics from integration
    const diagnostics = integrationRef.current.validateFile(normalizedPath);
    console.log("Got diagnostics:", diagnostics);

    // Add test diagnostics if we have import statements but no diagnostics
    const modelContent = model.getValue();
    const testDiagnostics: Array<{
      line: number;
      column: number;
      message: string;
      severity: "error" | "warning" | "info";
      suggestion?: string;
    }> = [];

    if (diagnostics.length === 0 && modelContent.includes("import")) {
      console.log(
        "No diagnostics found but imports detected - adding test diagnostics"
      );
      const lines = modelContent.split("\n");
      lines.forEach((line, index) => {
        if (line.includes("import") && line.includes('"./')) {
          // Find the import path in quotes
          const match = line.match(/(['"`])([^'"`]+)\1/);
          if (match) {
            const importPath = match[2];
            const startPos = line.indexOf(match[0]) + 1; // +1 to skip the quote
            testDiagnostics.push({
              line: index + 1,
              column: startPos,
              message: `Cannot find module '${importPath}' or its corresponding type declarations.`,
              severity: "error" as const,
              suggestion: `Create the file '${importPath}' or check the import path`,
            });
          }
        }
      });
    }

    const finalDiagnostics =
      diagnostics.length > 0 ? diagnostics : testDiagnostics;
    console.log("Final diagnostics to display:", finalDiagnostics);

    // Convert to Monaco markers with better positioning
    const markers: monaco.editor.IMarkerData[] = finalDiagnostics.map(
      (diag) => {
        // Find the actual import statement in the content to get better positioning
        const modelContent = model.getValue();
        const lines = modelContent.split("\n");
        const targetLine = Math.max(1, diag.line);
        const lineContent = lines[targetLine - 1] || "";

        // Try to find the import path in the line
        const importMatch = lineContent.match(/(['"`])([^'"`]+)\1/);
        let startColumn = diag.column;
        let endColumn = diag.column + 10;

        if (importMatch) {
          const importStart = lineContent.indexOf(importMatch[0]);
          if (importStart >= 0) {
            startColumn = importStart + 1; // +1 for 1-based indexing
            endColumn = importStart + importMatch[0].length + 1;
          }
        }

        return {
          severity:
            diag.severity === "error"
              ? monaco.MarkerSeverity.Error
              : monaco.MarkerSeverity.Warning,
          message: diag.message,
          startLineNumber: targetLine,
          startColumn: startColumn,
          endLineNumber: targetLine,
          endColumn: endColumn,
          source: "vfs-integration",
          code: "import-error",
          tags: diag.severity === "error" ? [monaco.MarkerTag.Unnecessary] : [],
        };
      }
    );

    console.log("Setting Monaco markers:", markers);

    // Clear existing markers first
    monaco.editor.setModelMarkers(model, "vfs-integration", []);

    // Set new markers
    monaco.editor.setModelMarkers(model, "vfs-integration", markers);

    // Verify markers are set
    const currentMarkers = monaco.editor.getModelMarkers({
      resource: model.uri,
    });
    console.log("Markers after setting:", currentMarkers);

    // Force editor to refresh decorations
    // setTimeout(() => {
    //   if (editorRef.current) {
    //     editorRef.current.focus();
    //     editorRef.current.trigger("source", "editor.action.marker.next", {});
    //   }
    // }, 100);

    // Update diagnostics count
    const errors = diagnostics.filter((d) => d.severity === "error").length;
    const warnings = diagnostics.filter((d) => d.severity === "warning").length;
    setDiagnosticsCount({ errors, warnings });

    console.log("Diagnostics count updated:", { errors, warnings });
  };

  // Debounced diagnostics update
  const debouncedUpdateDiagnostics = (filePath: string, content?: string) => {
    if (diagnosticsTimeoutRef.current) {
      clearTimeout(diagnosticsTimeoutRef.current);
    }

    diagnosticsTimeoutRef.current = setTimeout(() => {
      updateMonacoDiagnostics(filePath, content);
    }, 300); // 300ms debounce
  };

  // Expose diagnostics update for testing (development only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).testDiagnostics = {
        updateDiagnostics: updateMonacoDiagnostics,
        debouncedUpdate: debouncedUpdateDiagnostics,
        integration: integrationRef.current,
        vfsBridge,
        editor: editorRef.current,
      };
    }
  }, [integrationRef.current, vfsBridge, editorRef.current]);

  // Update diagnostics count when file changes
  useEffect(() => {
    if (selectedFile?.type === "file" && integrationRef.current) {
      const filePath = vfsBridge?.getPathById(selectedFile.id);
      if (filePath) {
        const diagnostics = integrationRef.current.validateFile(filePath);
        const errors = diagnostics.filter((d) => d.severity === "error").length;
        const warnings = diagnostics.filter(
          (d) => d.severity === "warning"
        ).length;
        setDiagnosticsCount({ errors, warnings });
      }
    } else {
      setDiagnosticsCount({ errors: 0, warnings: 0 });
    }
  }, [selectedFile, vfsBridge, integrationRef.current]);

  useEffect(() => {
    setFileUsers([]);

    if (selectedFile && selectedFile.type === "file" && editorRef.current) {
      try {
        setLanguage(getLanguageFromFileName(selectedFile.name));

        if (currentFileRef.current !== selectedFile.id) {
          bindEditorToFile(selectedFile);
        }

        const users = getUsersInFile(selectedFile.id);
        setFileUsers(users);

        // const updateUsers = () => {
        //   const users = collaborationService.getUsersInFile(selectedFile.id);
        //   setFileUsers(users);
        //   console.log("Connected File users:", users);
        // };

        // const unsubscribeFileUsers =
        //   collaborationService.onUsersChange(updateUsers);
        // updateUsers();

        return () => {
          try {
            // unsubscribeFileUsers();
          } catch (error) {
            console.error("Error unsubscribing from file users:", error);
          }
        };
      } catch (error) {
        console.error("Error setting up file binding:", error);
      }
    } else if (!selectedFile) {
      // No file selected, cleanup
      try {
        if (currentBindingRef.current) {
          currentBindingRef.current.destroy();
          currentBindingRef.current = null;
        }
        if (contentUnsubscribeRef.current) {
          contentUnsubscribeRef.current();
          contentUnsubscribeRef.current = null;
        }
        currentFileRef.current = null;
      } catch (error) {
        console.error("Error cleaning up editor:", error);
      }
    }
  }, [selectedFile]);

  // --- Replace bindEditorToFile with this safer version ---
  const bindEditorToFile = (file: FileNode) => {
    if (!editorRef.current || !vfsBridge) return;

    const editor = editorRef.current;

    // Destroy previous binding and content subscription
    if (currentBindingRef.current) {
      currentBindingRef.current.destroy();
      currentBindingRef.current = null;
    }
    if (contentUnsubscribeRef.current) {
      contentUnsubscribeRef.current();
      contentUnsubscribeRef.current = null;
    }

    try {
      const fileYText = getFileText(file.id);

      if (file.content) {
        initializeFileContent(file.id, file.content);
      }

      if (fileYText === null) return;
      const currentYContent = fileYText.toString();
      const currentModel = editor.getModel();

      if (currentModel) {
        if (currentModel.getValue() !== currentYContent) {
          currentModel.setValue(currentYContent);
        }

        // Set the correct language for this file
        const computedLanguage = getLanguageFromFileName(file.name);
        if (currentModel.getLanguageId() !== computedLanguage) {
          monaco.editor.setModelLanguage(currentModel, computedLanguage);
        }

        // Create MonacoBinding with the existing model
        const awareness = getAwareness();
        if (awareness) {
          currentBindingRef.current = new MonacoBinding(
            fileYText,
            currentModel,
            new Set([editor]),
            awareness
          );
        }
      }

      // Save current file ref
      currentFileRef.current = file.id;

      // Subscribe to content changes (keep VFS up-to-date)
      contentUnsubscribeRef.current = registerFileContentChange(
        file.id,
        (content) => {
          onFileContentChange?.(file.id, content);
          if (vfsBridge) {
            vfsBridge.updateFileContent(file.id, content);
            const filePath = vfsBridge.getPathById(file.id);
            if (filePath) {
              debouncedUpdateDiagnostics(filePath, content);
            }
          }
        }
      );

      // Update diagnostics for the newly opened file
      const filePath = vfsBridge.getPathById(file.id);
      if (filePath) {
        debouncedUpdateDiagnostics(filePath);
      }
    } catch (error) {
      console.error("Error binding editor to file:", error);
    }
  };

  // Set up VFS integration with Monaco TypeScript service
  const setupVFSWithMonacoTypeScript = () => {
    if (!vfsBridge || !integrationRef.current) {
      console.log("VFS bridge or integration not available for Monaco setup");
      return;
    }

    try {
      console.log("Setting up VFS with Monaco TypeScript service...");

      const vfsStore = vfsBridge.getVFSStore();
      const allEntries = vfsStore.getAllEntries();

      console.log("Setting up Monaco models for VFS files:", allEntries.size);

      allEntries.forEach((entry: any, path: string) => {
        if (entry.type === "file") {
          const language = getLanguageFromFileName(path);

          // Create Monaco model for this file if it doesn't exist
          const uri = monaco.Uri.file(path);
          let model = monaco.editor.getModel(uri);

          if (!model) {
            const content = entry.content || "";
            model = monaco.editor.createModel(content, language, uri);
            console.log(`Created Monaco model for ${path} (${language})`);
          } else {
            // Update existing model
            const content = entry.content || "";
            if (model.getValue() !== content) {
              model.setValue(content);
            }
            // Update language if needed
            const currentLanguage = model.getLanguageId();
            if (currentLanguage !== language) {
              monaco.editor.setModelLanguage(model, language);
            }
            console.log(`Updated Monaco model for ${path} (${language})`);
          }
        }
      });

      console.log("VFS Monaco TypeScript setup completed");
    } catch (error) {
      console.error("Error setting up VFS with Monaco TypeScript:", error);
    }
  };

  // Register VFS completion providers
  const registerVFSCompletionProviders = () => {
    if (!integrationRef.current) {
      console.log("Integration not available for completion providers");
      return;
    }

    try {
      console.log("Registering VFS completion providers...");

      // Register completion provider for import statements
      const jsCompletionProvider =
        monaco.languages.registerCompletionItemProvider("javascript", {
          triggerCharacters: ['"', "'", "/", "."],
          provideCompletionItems: (model, position) => {
            const textUntilPosition = model.getValueInRange({
              startLineNumber: position.lineNumber,
              startColumn: 1,
              endLineNumber: position.lineNumber,
              endColumn: position.column,
            });

            // Check if we're in an import statement
            const importMatch = textUntilPosition.match(
              /import\s+.*from\s+['"]([^'"]*$)/
            );
            const requireMatch = textUntilPosition.match(
              /require\s*\(\s*['"]([^'"]*$)/
            );

            if (importMatch || requireMatch) {
              const query = (importMatch || requireMatch)![1];
              const vfsStore = integrationRef.current!.getVFSStore();
              const allEntries = vfsStore.getAllEntries();

              const suggestions: any[] = [];
              allEntries.forEach((entry: any, path: string) => {
                if (
                  entry.type === "file" &&
                  path.includes(query) &&
                  path !== model.uri.path
                ) {
                  const relativePath = path.startsWith("/")
                    ? path.substring(1)
                    : path;

                  suggestions.push({
                    label: relativePath,
                    kind: monaco.languages.CompletionItemKind.File,
                    insertText: relativePath,
                    detail: `File: ${path}`,
                    documentation: `Import from VFS file: ${path}`,
                  });
                }
              });

              return { suggestions };
            }

            return { suggestions: [] };
          },
        });

      // Register the same for TypeScript
      const tsCompletionProvider =
        monaco.languages.registerCompletionItemProvider("typescript", {
          triggerCharacters: ['"', "'", "/", "."],
          provideCompletionItems: (model, position) => {
            const textUntilPosition = model.getValueInRange({
              startLineNumber: position.lineNumber,
              startColumn: 1,
              endLineNumber: position.lineNumber,
              endColumn: position.column,
            });

            // Check if we're in an import statement
            const importMatch = textUntilPosition.match(
              /import\s+.*from\s+['"]([^'"]*$)/
            );
            const requireMatch = textUntilPosition.match(
              /require\s*\(\s*['"]([^'"]*$)/
            );

            if (importMatch || requireMatch) {
              const query = (importMatch || requireMatch)![1];
              const vfsStore = integrationRef.current!.getVFSStore();
              const allEntries = vfsStore.getAllEntries();

              const suggestions: any[] = [];
              allEntries.forEach((entry: any, path: string) => {
                if (
                  entry.type === "file" &&
                  path.includes(query) &&
                  path !== model.uri.path
                ) {
                  const relativePath = path.startsWith("/")
                    ? path.substring(1)
                    : path;

                  suggestions.push({
                    label: relativePath,
                    kind: monaco.languages.CompletionItemKind.File,
                    insertText: relativePath,
                    detail: `File: ${path}`,
                    documentation: `Import from VFS file: ${path}`,
                  });
                }
              });

              return { suggestions };
            }

            return { suggestions: [] };
          },
        });

      console.log("VFS completion providers registered successfully");
    } catch (error) {
      console.error("Error registering VFS completion providers:", error);
    }
  };

  const handleEditorDidMount = (
    editorInstance: monaco.editor.IStandaloneCodeEditor
  ): void => {
    try {
      editorRef.current = editorInstance;
      console.log("Monaco Editor mounted successfully");

      // Configure Monaco language services
      console.log("Configuring Monaco language services...");

      // Configure TypeScript/JavaScript language features
      monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
      monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);

      // Enhanced diagnostics options
      const diagnosticsOptions = {
        noSemanticValidation: false,
        noSyntaxValidation: false,
        noSuggestionDiagnostics: false,
        // Disable module resolution errors - we'll handle these with VFS
        diagnosticCodesToIgnore: [2307, 2345, 2304], // "Cannot find module" errors
      };

      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(
        diagnosticsOptions
      );
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(
        diagnosticsOptions
      );

      // Set compiler options for better IntelliSense
      const compilerOptions = {
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        allowNonTsExtensions: true,
        moduleResolution:
          monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.ESNext,
        noEmit: true,
        esModuleInterop: true,
        allowJs: true,
        checkJs: false,
        lib: ["ES2020", "DOM"],
        allowSyntheticDefaultImports: true,
        resolveJsonModule: true,
        skipLibCheck: true,
        moduleDetection: "force",
      };

      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        ...compilerOptions,
        jsx: monaco.languages.typescript.JsxEmit.React,
        reactNamespace: "React",
        typeRoots: ["node_modules/@types"],
      });

      monaco.languages.typescript.javascriptDefaults.setCompilerOptions(
        compilerOptions
      );

      console.log("Monaco language services configured successfully");

      // Set up VFS integration with Monaco TypeScript service
      setupVFSWithMonacoTypeScript();

      // Register VFS completion providers
      registerVFSCompletionProviders();

      // Set up initial content
      if (selectedFile && selectedFile.type === "file") {
        // Bind to the selected file
        bindEditorToFile(selectedFile);
      } else {
        // Set placeholder content
        const model = editorInstance.getModel();
        if (model) {
          model.setValue(initialValue);
        }
      }
    } catch (error) {
      console.error("Error in handleEditorDidMount:", error);
    }
  };

  const getLanguageFromFileName = (fileName: string): string => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      py: "python",
      java: "java",
      json: "json",
      md: "markdown",
      html: "html",
      css: "css",
      scss: "scss",
      sass: "sass",
      less: "less",
      xml: "xml",
      yaml: "yaml",
      yml: "yaml",
      sql: "sql",
      sh: "shell",
      bash: "shell",
      php: "php",
      rb: "ruby",
      go: "go",
      rs: "rust",
      cpp: "cpp",
      c: "c",
      cs: "csharp",
      kt: "kotlin",
      swift: "swift",
      dart: "dart",
    };
    return languageMap[extension || ""] || "plaintext";
  };

  const getDisplayContent = () => {
    if (selectedFile?.type === "file") {
      // For files, let the binding handle the content
      return "";
    }
    return initialValue;
  };

  return (
    <div className="h-full flex flex-col">
      <CollaborativeCursor
        editor={editorRef.current}
        selectedFile={
          selectedFile ? { id: selectedFile.id, type: selectedFile.type } : null
        }
      />

      {/* File Tab/Header */}
      {selectedFile && selectedFile.type === "file" && (
        <div
          className={`px-4 py-2 ${theme.surfaceSecondary} border-b ${theme.border} flex items-center justify-between`}
        >
          <div className="flex items-center gap-2">
            <span className={`text-sm ${theme.text}`}>{selectedFile.name}</span>
            <span className={`text-xs ${theme.textMuted}`}>({language})</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Connection status */}
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
              title={isConnected ? "Connected" : "Disconnected"}
            />

            {/* Connected users count */}
            {fileUsers.length > 0 && (
              <div className="flex items-center gap-1">
                <div className="flex -space-x-1">
                  {fileUsers.slice(0, 3).map((user, index) => (
                    <div
                      key={index}
                      className="w-4 h-4 rounded-full border border-gray-600"
                      style={{ backgroundColor: user.color }}
                      title={user.name}
                    />
                  ))}
                  {fileUsers.length > 3 && (
                    <div
                      className={`w-4 h-4 rounded-full ${theme.surface} border ${theme.border} flex items-center justify-center text-xs`}
                    >
                      +{fileUsers.length - 3}
                    </div>
                  )}
                </div>
                <span className={`text-xs ${theme.textMuted}`}>
                  {fileUsers.length} user
                  {fileUsers.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1">
        <div style={{ height: "100%" }}>
          <Editor
            height="100%"
            language={language}
            theme={theme.monacoTheme}
            // Use key to force re-render when file changes
            key={selectedFile?.id || "no-file"}
            defaultValue={getDisplayContent()}
            onMount={handleEditorDidMount}
            beforeMount={(monacoInstance) => {
              // This runs before the editor is mounted - good place for global Monaco config
              console.log(
                "Monaco about to mount - configuring global settings"
              );

              // Add extra library definitions for better IntelliSense
              monacoInstance.languages.typescript.typescriptDefaults.addExtraLib(
                `
declare module "*.css" {
  const content: any;
  export default content;
}

declare module "*.json" {
  const content: any;
  export default content;
}

// React types for better JSX support
declare namespace React {
  interface Component<P = {}, S = {}> {}
  interface ComponentClass<P = {}> {}
  interface FunctionComponent<P = {}> {}
  type FC<P = {}> = FunctionComponent<P>;
  type ReactElement = any;
  type ReactNode = any;
}

declare const React: any;
declare const process: { env: Record<string, string> };
                `,
                "ts:extra-libs.d.ts"
              );

              // Configure JavaScript defaults too
              monacoInstance.languages.typescript.javascriptDefaults.addExtraLib(
                `
// Common Node.js globals for JavaScript
declare const process: { env: Record<string, string> };
declare const require: (id: string) => any;
declare const module: { exports: any };
declare const exports: any;
declare const console: Console;
                `,
                "js:extra-libs.d.ts"
              );

              // Enhanced language features
              monacoInstance.languages.typescript.typescriptDefaults.setInlayHintsOptions(
                {
                  includeInlayParameterNameHints: "all",
                  includeInlayParameterNameHintsWhenArgumentMatchesName: true,
                  includeInlayFunctionParameterTypeHints: true,
                  includeInlayVariableTypeHints: true,
                  includeInlayPropertyDeclarationTypeHints: true,
                  includeInlayFunctionLikeReturnTypeHints: true,
                  includeInlayEnumMemberValueHints: true,
                }
              );
            }}
            options={{
              minimap: { enabled: false },
              // Show read-only when no file is selected
              readOnly: !selectedFile || selectedFile.type !== "file",
            }}
          />
        </div>
      </div>

      {/* Placeholder when no file is selected */}
      {(!selectedFile || selectedFile.type !== "file") && (
        <div
          className={`absolute inset-0 flex items-center justify-center ${theme.textMuted} pointer-events-none`}
        >
          <div className="text-center">
            <p className="text-lg mb-2">
              {!selectedFile ? "No file selected" : "Folder selected"}
            </p>
            <p className="text-sm">
              {!selectedFile
                ? "Select a file from the explorer to start editing"
                : "Select a file (not a folder) to edit its contents"}
            </p>

            {/* Connection status in placeholder */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-xs">
                {isConnected
                  ? "Connected to collaboration server"
                  : "Disconnected from server"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
