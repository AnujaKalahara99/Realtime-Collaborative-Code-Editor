import { useRef, useEffect, useState } from "react";
import { Editor } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import {
  useEditorCollaboration,
  type CollaborationUser,
} from "../../../Contexts/EditorContext";
import { useTheme } from "../../../Contexts/ThemeProvider";
import type { FileNode } from "../ProjectManagementPanel/file.types";
import CollaborativeCursor from "./CollaborativeCursor";
import { VFSMonacoIntegration } from "../../../lib/integration/vfs-monaco-integration";
import { useFileTree } from "../ProjectManagementPanel/useFileTree";

// Import our modular functions
import {
  configureMonacoBeforeMount,
  configureMonacoLanguageServices,
} from "./modules/monaco-config";
import {
  setupVFSWithMonacoTypeScript,
  registerVFSCompletionProviders,
} from "./modules/monaco-vfs-setup";
import {
  updateMonacoDiagnostics,
  createDebouncedDiagnostics,
  type DiagnosticsCount,
} from "./modules/monaco-diagnostics";
import {
  bindEditorToFile,
  setupCollaborationListeners,
  cleanupCollaboration,
  type CollaborationRefs,
} from "./modules/monaco-collaboration";
import { getLanguageFromFileName } from "./modules/monaco-utils";

interface MonacoEditorProps {
  selectedFile?: FileNode | null;
  initialValue?: string;
  onFileContentChange?: (fileId: string, content: string) => void;
}

export default function MonacoEditor({
  selectedFile,
  initialValue = "// Select a file to start editing",
  onFileContentChange,
}: MonacoEditorProps) {
  const { theme } = useTheme();
  const { vfsBridge } = useFileTree();

  // Refs
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const currentBindingRef = useRef<MonacoBinding | null>(null);
  const currentFileRef = useRef<string | null>(null);
  const contentUnsubscribeRef = useRef<(() => void) | null>(null);

  const [language, setLanguage] = useState<string>("plaintext");
  const [fileUsers, setFileUsers] = useState<CollaborationUser[]>([]);

  const {
    isConnected,
    getUsersInFile,
    getFileText,
    initializeFileContent,
    onFileContentChange: registerFileContentChange,
    getAwareness,
    updateCursorPosition,
  } = useEditorCollaboration();

  // Handle file changes
  useEffect(() => {
    setFileUsers([]);

    if (selectedFile && selectedFile.type === "file") {
      // Update language first
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
  }, [selectedFile, getUsersInFile]);

  const bindEditorToFile = (file: FileNode) => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    const model = editor.getModel();
    if (!model) return;

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
    if (model.getValue() !== fileYText?.toString()) {
      model.setValue(fileYText?.toString() || "");
    }

    const awareness = getAwareness();
    if (awareness) {
      if (fileYText) {
        currentBindingRef.current = new MonacoBinding(
          fileYText,
          model,
          new Set([editor]),
          awareness
        );

        editor.onDidChangeCursorPosition(() => {
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
        });
      }
    }

    contentUnsubscribeRef.current = registerFileContentChange(
      file.id,
      (content) => {
        onFileContentChange?.(file.id, content);
      }
    );

    currentFileRef.current = file.id;
  };

  const handleEditorDidMount = (
    editorInstance: monaco.editor.IStandaloneCodeEditor
  ): void => {
    try {
      editorRef.current = editorInstance;
      console.log("Monaco Editor mounted successfully");

      // Configure Monaco language services
      configureMonacoLanguageServices();

      // Set up VFS integration with Monaco TypeScript service
      setupVFSWithMonacoTypeScript(vfsBridge, integrationRef);

      // Register VFS completion providers
      registerVFSCompletionProviders(integrationRef);

      // Set up initial content
      if (selectedFile && selectedFile.type === "file") {
        // Bind to the selected file
        bindEditorToFile(
          selectedFile,
          editorRef,
          collaborationRefs,
          collaborationService,
          vfsBridge,
          onFileContentChange,
          debouncedUpdateDiagnostics
        );
      }
    } catch (error) {
      console.error("Error in handleEditorDidMount:", error);
    }
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
            {diagnosticsCount.errors > 0 && (
              <span className="text-red-500 text-xs">
                {diagnosticsCount.errors} error
                {diagnosticsCount.errors !== 1 ? "s" : ""}
              </span>
            )}
            {diagnosticsCount.warnings > 0 && (
              <span className="text-yellow-500 text-xs">
                {diagnosticsCount.warnings} warning
                {diagnosticsCount.warnings !== 1 ? "s" : ""}
              </span>
            )}
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
            beforeMount={configureMonacoBeforeMount}
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
              autoClosingBrackets: "always",
              autoClosingQuotes: "always",
              autoIndent: "full",
              bracketPairColorization: { enabled: true },
              codeLens: true,
              colorDecorators: true,
              cursorBlinking: "blink",
              cursorSmoothCaretAnimation: "on",
              definitionLinkOpensInPeek: false,
              dragAndDrop: true,
              folding: true,
              foldingHighlight: true,
              foldingStrategy: "auto",
              fontLigatures: true,
              guides: {
                bracketPairs: "active",
                highlightActiveIndentation: true,
                indentation: true,
              },
              hover: { enabled: true },
              inlineSuggest: { enabled: true },
              lightbulb: { enabled: "on" as any },
              links: true,
              mouseWheelZoom: true,
              occurrencesHighlight: "singleFile",
              overviewRulerBorder: true,
              parameterHints: { enabled: true },
              peekWidgetDefaultFocus: "editor",
              renderLineHighlight: "line",
              renderWhitespace: "selection",
              showFoldingControls: "mouseover",
              smoothScrolling: true,
              snippetSuggestions: "top",
              suggest: {
                showWords: false,
                showMethods: true,
                showFunctions: true,
                showConstructors: true,
                showFields: true,
                showVariables: true,
                showClasses: true,
                showStructs: true,
                showInterfaces: true,
                showModules: true,
                showProperties: true,
                showEvents: true,
                showOperators: true,
                showUnits: true,
                showValues: true,
                showConstants: true,
                showEnums: true,
                showEnumMembers: true,
                showKeywords: true,
                showColors: true,
                showFiles: true,
                showReferences: true,
                showFolders: true,
                showTypeParameters: true,
                showIssues: true,
                showUsers: true,
                showSnippets: true,
              },
              renderValidationDecorations: "on",
              useTabStops: true,
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
          </div>
        </div>
      )}
    </div>
  );
}
