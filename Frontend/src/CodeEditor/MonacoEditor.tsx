import { useRef, useEffect, useState } from "react";
import { Editor } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";

import { useTheme } from "../ThemeProvider";
import type { FileNode } from "./ProjectManagementPanel/commonFileTypes";

interface MonacoEditorProps {
  selectedFile?: FileNode | null;
  initialValue?: string;
}

export default function MonacoEditor({
  selectedFile,
  initialValue = "Select a file to start editing",
}: MonacoEditorProps) {
  const { theme } = useTheme();

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const ydocumentRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);
  const currentFileRef = useRef<string | null>(null);

  const [language, setLanguage] = useState<string>("plaintext");

  // Initialize Yjs objects only once
  useEffect(() => {
    if (!ydocumentRef.current) {
      ydocumentRef.current = new Y.Doc();
      providerRef.current = new WebsocketProvider(
        `ws://144.24.128.44:4455`,
        "monaco",
        ydocumentRef.current
      );
    }

    // Cleanup on unmount
    return () => {
      if (bindingRef.current) {
        bindingRef.current.destroy();
        bindingRef.current = null;
      }
      if (providerRef.current) {
        providerRef.current.destroy();
        providerRef.current = null;
      }
      if (ydocumentRef.current) {
        ydocumentRef.current.destroy();
        ydocumentRef.current = null;
      }
    };
  }, []);

  // Handle file changes
  useEffect(() => {
    setLanguage(getLanguageFromName(selectedFile?.name || "plaintext"));

    if (selectedFile && editorRef.current) {
      const editor = editorRef.current;
      const model = editor.getModel();

      // If we're switching to a different file
      if (currentFileRef.current !== selectedFile.id) {
        currentFileRef.current = selectedFile.id;

        // Destroy previous binding
        if (bindingRef.current) {
          bindingRef.current.destroy();
          bindingRef.current = null;
        }

        // Set the content for the new file
        if (model) {
          const content = selectedFile.content || "";
          model.setValue(content);

          // Create new Yjs binding for collaborative editing
          if (ydocumentRef.current && providerRef.current) {
            const type = ydocumentRef.current.getText(
              `file-${selectedFile.id}`
            );
            bindingRef.current = new MonacoBinding(
              type,
              model,
              new Set([editor]),
              providerRef.current.awareness
            );
          }
        }
      }
    }
  }, [selectedFile]);

  const handleEditorDidMount = (
    editorInstance: monaco.editor.IStandaloneCodeEditor
  ): void => {
    editorRef.current = editorInstance;

    // Set initial content
    const model = editorInstance.getModel();
    if (model) {
      const content = selectedFile?.content || initialValue;
      model.setValue(content);

      // Set up initial Yjs binding if we have a selected file
      if (selectedFile && ydocumentRef.current && providerRef.current) {
        currentFileRef.current = selectedFile.id;
        const type = ydocumentRef.current.getText(`file-${selectedFile.id}`);
        bindingRef.current = new MonacoBinding(
          type,
          model,
          new Set([editorInstance]),
          providerRef.current.awareness
        );
      }
    }
  };

  // Get the current content to display
  const getCurrentContent = () => {
    if (selectedFile?.content !== undefined) {
      return selectedFile.content;
    }
    return initialValue;
  };

  const getFileExtension = (filename: string) => {
    const parts = filename.split(".");
    return parts.length > 1 ? parts.pop()?.toLowerCase() : "";
  };

  const getLanguageFromName = (name: string) => {
    const extension = getFileExtension(name);
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
    };
    return extension ? languageMap[extension] || "plaintext" : "plaintext";
  };

  return (
    <div className="h-full flex flex-col">
      {/* File Tab/Header */}
      {selectedFile && (
        <div
          className={`px-4 py-2 ${theme.surfaceSecondary} border-b ${theme.border} flex items-center gap-2`}
        >
          <span className={`text-sm ${theme.text}`}>{selectedFile.name}</span>
          <span className={`text-xs ${theme.textMuted}`}>({language})</span>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          theme={theme.monacoTheme}
          // Use key to force re-render when file changes
          key={selectedFile?.id || "no-file"}
          defaultValue={getCurrentContent()}
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
            // Show placeholder when no file is selected
            readOnly: !selectedFile,
          }}
        />
      </div>

      {/* Placeholder when no file is selected */}
      {!selectedFile && (
        <div
          className={`absolute inset-0 flex items-center justify-center ${theme.textMuted} pointer-events-none`}
        >
          <div className="text-center">
            <p className="text-lg mb-2">No file selected</p>
            <p className="text-sm">
              Select a file from the explorer to start editing
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
