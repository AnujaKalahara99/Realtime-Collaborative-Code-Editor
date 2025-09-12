import { useRef, useEffect, useState } from "react";
import { Editor } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import {
  useCollaboration,
  type CollaborationUser,
} from "../YJSCollaborationService";
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
  const integrationRef = useRef<VFSMonacoIntegration | null>(null);
  const diagnosticsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Collaboration refs
  const collaborationRefs: CollaborationRefs = {
    currentBindingRef: useRef(null),
    currentFileRef: useRef(null),
    contentUnsubscribeRef: useRef(null),
  };

  // State
  const [language, setLanguage] = useState<string>("javascript");
  const [isConnected, setIsConnected] = useState(false);
  const [fileUsers, setFileUsers] = useState<CollaborationUser[]>([]);
  const [diagnosticsCount, setDiagnosticsCount] = useState<DiagnosticsCount>({
    errors: 0,
    warnings: 0,
  });

  const collaborationService = useCollaboration();

  // Initialize VFS integration
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

  // Create debounced diagnostics function
  const debouncedUpdateDiagnostics = createDebouncedDiagnostics(
    (filePath: string, content?: string) => {
      return updateMonacoDiagnostics(
        filePath,
        editorRef,
        integrationRef,
        vfsBridge,
        setDiagnosticsCount,
        content
      );
    },
    300
  );

  // Subscribe to connection status
  useEffect(() => {
    const unsubscribeConnection =
      collaborationService.onConnectionChange(setIsConnected);
    return unsubscribeConnection;
  }, [collaborationService]);

  // Handle file changes
  useEffect(() => {
    setFileUsers([]); // Clear prev file users

    if (selectedFile && selectedFile.type === "file") {
      // Update language first
      setLanguage(getLanguageFromFileName(selectedFile.name));

      if (editorRef.current) {
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

      // Setup collaboration listeners
      const cleanupUsers = setupCollaborationListeners(
        selectedFile.id,
        collaborationService,
        setFileUsers
      );

      return cleanupUsers;
    } else {
      // Clear users when no file is selected
      setFileUsers([]);
      cleanupCollaboration(collaborationRefs);
    }
  }, [selectedFile, collaborationService, vfsBridge, onFileContentChange]);

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
