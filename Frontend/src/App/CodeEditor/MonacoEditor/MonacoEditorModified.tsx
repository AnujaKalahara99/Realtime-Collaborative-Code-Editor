import { useRef, useEffect, useState } from "react";
import { Editor, loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { MonacoBinding } from "y-monaco";
import {
  useEditorCollaboration,
  type CollaborationUser,
} from "../../../Contexts/EditorContext";
import { useTheme } from "../../../Contexts/ThemeProvider";
import type { FileNode } from "../ProjectManagementPanel/file.types";
import CollaborativeCursor from "./CollaborativeCursor";
import { VFSBridge } from "../../../lib/vfs/vfs-bridge";
import { VFSMonacoIntegration } from "../../../lib/integration/vfs-monaco-integration";

interface MonacoEditorProps {
  selectedFile?: FileNode | null;
  initialValue?: string;
  onFileContentChange?: (fileId: string, content: string) => void;
}

loader.config({ monaco });

export default function MonacoEditor({
  selectedFile,
  initialValue = `
╭─────────────────────────────────────────────╮
│                                             │
│         Welcome to RTC Code Editor          │
│                                             │
│      Select a file from the sidebar to      │
│      start your coding journey              │
│                                             │
│       Features:                             │
│      • Real-time collaboration              │
│      • Syntax highlighting                  │
│      • Auto-completion                      │
│      • Multi-language support               │
│      • Chat & AI & Much more                │
│                                             │
│       Happy coding! ❤️❤️                   │
│                                             │
╰─────────────────────────────────────────────╯
`,
  onFileContentChange,
}: MonacoEditorProps) {
  const { theme } = useTheme();

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const currentBindingRef = useRef<MonacoBinding | null>(null);
  const currentFileRef = useRef<string | null>(null);
  const contentUnsubscribeRef = useRef<(() => void) | null>(null);
  const vfsBridgeRef = useRef<VFSBridge | null>(null);
  const integrationRef = useRef<VFSMonacoIntegration | null>(null);
  const [editorReady, setEditorReady] = useState(false);
  const editorDisposedRef = useRef(false);
  const cursorListenerDisposeRef = useRef<monaco.IDisposable | null>(null);

  const [language, setLanguage] = useState<string>("plaintext");
  const [fileUsers, setFileUsers] = useState<CollaborationUser[]>([]);

  const {
    isConnected,
    files,
    getUsersInFile,
    getFileText,
    initializeFileContent,
    onFileContentChange: registerFileContentChange,
    getAwareness,
    updateCursorPosition,
  } = useEditorCollaboration();

  useEffect(() => {
    if (!editorReady) return;

    setFileUsers([]);

    if (selectedFile && selectedFile.type === "file" && editorRef.current) {
      setLanguage(getLanguageFromFileName(selectedFile.name));

      if (currentFileRef.current !== selectedFile.id) {
        bindEditorToFile(selectedFile);
      }

      const users = getUsersInFile(selectedFile.id);
      setFileUsers(users);
    } else if (!selectedFile) {
      if (currentBindingRef.current) {
        currentBindingRef.current.destroy();
        currentBindingRef.current = null;
      }
      if (contentUnsubscribeRef.current) {
        contentUnsubscribeRef.current();
        contentUnsubscribeRef.current = null;
      }
      currentFileRef.current = null;
    }
  }, [editorReady, selectedFile, getUsersInFile]);

  useEffect(() => {
    const handleRollbackComplete = () => {
      console.log("Rollback detected - rebinding editor");

      if (selectedFile && selectedFile.type === "file" && selectedFile.id) {
        setTimeout(() => {
          bindEditorToFile(selectedFile);
        }, 100); // Small delay to ensure server sync is complete
      }
    };

    window.addEventListener("yjs-rollback-complete", handleRollbackComplete);

    return () => {
      window.removeEventListener(
        "yjs-rollback-complete",
        handleRollbackComplete
      );
    };
  }, [selectedFile]);

  useEffect(() => {
    if (!vfsBridgeRef.current) {
      vfsBridgeRef.current = new VFSBridge();
    }
    return () => {
      // Cleanup on unmount
      integrationRef.current?.dispose();
      integrationRef.current = null;
      setEditorReady(false);
      vfsBridgeRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (vfsBridgeRef.current) {
      vfsBridgeRef.current.syncToVFS(files);
      integrationRef.current?.updateDiagnostics?.();
    }
  }, [files]);

  const bindEditorToFile = (file: FileNode) => {
    if (!editorRef.current || editorDisposedRef.current) return;

    const editor = editorRef.current;

    if (currentBindingRef.current) {
      currentBindingRef.current.destroy();
      currentBindingRef.current = null;
    }
    if (contentUnsubscribeRef.current) {
      contentUnsubscribeRef.current();
      contentUnsubscribeRef.current = null;
    }
    cursorListenerDisposeRef.current?.dispose?.();
    cursorListenerDisposeRef.current = null;

    // Remove previous YJS observer if any
    if ((bindEditorToFile as any)._yjsDisposer) {
      (bindEditorToFile as any)._yjsDisposer();
      (bindEditorToFile as any)._yjsDisposer = null;
    }

    let vfsPath = vfsBridgeRef.current?.getPathById(file.id);
    if (!vfsPath) {
      vfsBridgeRef.current?.syncToVFS(files);
      vfsPath = vfsBridgeRef.current?.getPathById(file.id);
      if (!vfsPath) return;
    }
    if (!integrationRef.current) return;

    if (file.content !== undefined) {
      initializeFileContent(file.id, file.content);
    }

    const fileYText = getFileText(file.id);
    const awareness = getAwareness();

    if (!awareness || !fileYText) return;

    const vfsModel = integrationRef.current.ensureMonacoModel(vfsPath);
    if (!vfsModel) return;

    // Sync Monaco model with YJS content only if different
    const yjsContent = fileYText.toString();
    if (vfsModel.getValue() !== yjsContent) {
      vfsModel.setValue(yjsContent);
    }

    if (editor.getModel()?.uri.toString() !== vfsModel.uri.toString()) {
      editor.setModel(vfsModel);
    }

    setTimeout(() => {
      if (editorDisposedRef.current) return;

      currentBindingRef.current = new MonacoBinding(
        fileYText,
        vfsModel,
        new Set([editor]),
        awareness
      );

      cursorListenerDisposeRef.current = editor.onDidChangeCursorPosition(
        () => {
          const position = editor.getPosition();
          if (position) {
            const selection = editor.getSelection();
            updateCursorPosition(file.id, {
              line: position.lineNumber,
              column: position.column,
              selection: selection
                ? {
                    startLine: selection.startLineNumber,
                    startColumn: selection.startColumn,
                    endLine: selection.endLineNumber,
                    endColumn: selection.endColumn,
                  }
                : undefined,
            });
          }
        }
      );

      let isUpdatingFromYJS = false;

      const yjsObserver = () => {
        const content = fileYText.toString();
        // Only update VFS if content changed
        if (vfsModel.getValue() !== content) {
          isUpdatingFromYJS = true;
          vfsModel.setValue(content);
          vfsBridgeRef.current?.updateFileContent(file.id, content);
          integrationRef.current?.updateDiagnostics?.();
          isUpdatingFromYJS = false;
        }
      };

      fileYText.observe(yjsObserver);
      // Store disposer for next bind
      (bindEditorToFile as any)._yjsDisposer = () =>
        fileYText.unobserve(yjsObserver);

      contentUnsubscribeRef.current = registerFileContentChange(
        file.id,
        (content) => {
          if (!isUpdatingFromYJS) {
            onFileContentChange?.(file.id, content);
          }
        }
      );
    }, 0);

    currentFileRef.current = file.id;
  };

  const handleEditorDidMount = (
    editorInstance: monaco.editor.IStandaloneCodeEditor
  ): void => {
    editorRef.current = editorInstance;
    setEditorReady(true);
    editorDisposedRef.current = false;

    try {
      (
        editorInstance as unknown as { onDidDispose?: (cb: () => void) => void }
      ).onDidDispose?.(() => {
        editorDisposedRef.current = true;
        editorRef.current = null;
        setEditorReady(false);
      });
    } catch {
      // no-op
    }

    if (!integrationRef.current && vfsBridgeRef.current) {
      integrationRef.current = new VFSMonacoIntegration(
        vfsBridgeRef.current.getVFSStore(),
        {
          enableDiagnostics: true,
          enableAutoCompletion: true,
          enableCodeActions: true,
        }
      );
    }

    if (selectedFile && selectedFile.type === "file") {
      bindEditorToFile(selectedFile);
    } else {
      // Set placeholder content
      const model = editorInstance.getModel();
      if (model) {
        model.setValue(initialValue);
      }
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
      return "";
    }
    return initialValue;
  };

  return (
    <div className={`h-full flex flex-col ${theme.background}`}>
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
        <Editor
          height="100%"
          language={language}
          theme={theme.monacoTheme}
          defaultValue={getDisplayContent()}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: "on",
            tabSize: 2,
            insertSpaces: true,
            formatOnPaste: true,
            formatOnType: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: "on",
            quickSuggestions: {
              other: true,
              comments: true,
              strings: true,
            },
            // Show read-only when no file is selected
            readOnly: !selectedFile || selectedFile.type !== "file",
          }}
        />
      </div>
    </div>
  );
}
