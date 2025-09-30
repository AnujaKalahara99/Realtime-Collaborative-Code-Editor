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

// Ensure the React wrapper uses the same Monaco instance we import via ESM
loader.config({ monaco });

export default function MonacoEditor({
  selectedFile,
  initialValue = "// Select a file to start editing",
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

  // Keep VFS in sync with the collaborative file tree so diagnostics stay up to date
  useEffect(() => {
    if (vfsBridgeRef.current) {
      vfsBridgeRef.current.syncToVFS(files);
      // Re-run diagnostics after tree changes
      integrationRef.current?.updateDiagnostics?.();
    }
  }, [files]);

  // Removed early selectedFile effect to avoid binding on disposed editors

  const bindEditorToFile = (file: FileNode) => {
    if (!editorRef.current || editorDisposedRef.current) return;

    const editor = editorRef.current;
    // Ensure Monaco model is created with a stable file:// URI so markers attach correctly
    let vfsPath = vfsBridgeRef.current?.getPathById(file.id);
    if (!vfsPath) {
      // Attempt to sync then retry path resolution if not yet available
      vfsBridgeRef.current?.syncToVFS(files);
      vfsPath = vfsBridgeRef.current?.getPathById(file.id);
      if (!vfsPath) return;
    }
    // Ensure integration is initialized
    if (!integrationRef.current) return;
    const model =
      integrationRef.current.ensureMonacoModel(vfsPath) || editor.getModel();
    if (!model) return;
    // Switch editor to the proper model if needed
    if (
      !editorDisposedRef.current &&
      editor.getModel()?.uri.toString() !== model.uri.toString()
    ) {
      editor.setModel(model);
    }

    // Destroy previous binding and content subscription
    if (currentBindingRef.current) {
      currentBindingRef.current.destroy();
      currentBindingRef.current = null;
    }
    if (contentUnsubscribeRef.current) {
      contentUnsubscribeRef.current();
      contentUnsubscribeRef.current = null;
    }

    if (file.content) {
      initializeFileContent(file.id, file.content);
    }

    const fileYText = getFileText(file.id);

    const awareness = getAwareness();
    if (awareness && fileYText) {
      // Defer binding to the next tick to ensure the editor view is fully attached
      setTimeout(() => {
        if (editorDisposedRef.current) return;
        // Create Yjs binding
        currentBindingRef.current = new MonacoBinding(
          fileYText,
          model,
          new Set([editor]),
          awareness
        );

        // Dispose previous cursor listener if any
        cursorListenerDisposeRef.current?.dispose?.();
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
      }, 0);
    }

    contentUnsubscribeRef.current = registerFileContentChange(
      file.id,
      (content) => {
        onFileContentChange?.(file.id, content);
        // Reflect content changes into VFS so dependency/diagnostic engine can react
        vfsBridgeRef.current?.updateFileContent(file.id, content);
        // Nudge diagnostics for the current file
        integrationRef.current?.updateDiagnostics?.();
      }
    );

    currentFileRef.current = file.id;
  };

  const handleEditorDidMount = (
    editorInstance: monaco.editor.IStandaloneCodeEditor
  ): void => {
    editorRef.current = editorInstance;
    setEditorReady(true);
    editorDisposedRef.current = false;

    // When editor is disposed (e.g., key changes), clear refs to prevent setModel on disposed instance
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

    // Initialize Monaco integration after editor mounts to avoid worker loader issues
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

  // Rebind when selection changes, but only after editor is ready
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
          </div>
        </div>
      )}
    </div>
  );
}
