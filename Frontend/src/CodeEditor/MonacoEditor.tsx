import { useState, useRef } from "react";
import { Editor } from "@monaco-editor/react";
import * as monaco from "monaco-editor"; // For type information
import { useTheme } from "../ThemeProvider";

export default function MonacoEditor() {
  const { theme } = useTheme();

  // const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");

  // const LANGUAGES = ["javascript", "typescript", "python", "java"];

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount = (
    editor: monaco.editor.IStandaloneCodeEditor
  ): void => {
    editorRef.current = editor;
  };

  const handleEditorChange = (value: string | undefined): void => {
    setCode(value || "");
  };

  return (
    <>
      <Editor
        height="100%"
        language="javascript"
        theme={theme.monacoTheme}
        value={code}
        onChange={handleEditorChange}
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
        }}
      />
    </>
  );
}
