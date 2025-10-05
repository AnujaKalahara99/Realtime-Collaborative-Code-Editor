
import { useTheme } from "../../Contexts/ThemeProvider";

import { useState } from "react";
import { useEditorCollaboration } from "../../Contexts/EditorContext";
import type { FileNode } from "./ProjectManagementPanel/file.types";
import axios from "axios";

type CompilerPanelProps = {
  selectedFile?: FileNode | null;
};

const CompilerPanel = ({ selectedFile }: CompilerPanelProps) => {
  const { theme } = useTheme();
  const [output, setOutput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const { getFileText } = useEditorCollaboration();

  // Get selected file content
  const code = selectedFile?.id ? getFileText(selectedFile.id)?.toString() : "";
  // Determine language from file extension
  const extension = selectedFile?.name?.split(".").pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    js: "javascript",
    jsx: "javascript",
    py: "python",
    java: "java",
   
  };
  const language = languageMap[extension || ""] || "plaintext";
  console.log(code, language);
  const handleRun = async () => {
    setLoading(true);
    setError("");
    setOutput("");
    setIsSuccess(null);
    try {
      const res = await axios.post("http://localhost:4000/run", {
        language,
        code,
        input: ""
      });
      const data = res.data;
      let out = "";
      let success = false;
      if (data?.result?.output !== undefined) {
        out = data.result.output;
        success = data.result.success !== false;
      } else if (data.output !== undefined) {
        out = data.output;
        success = data.success !== false;
      } else {
        out = JSON.stringify(data, null, 2);
      }
      setOutput(out);
      setIsSuccess(success);
    } catch (e: any) {
      setError(e.message || "Unknown error");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`h-full ${theme.surface} ${theme.text} p-4`}>
      <h3 className="text-sm font-medium mb-2">Compiler</h3>
      <button
        className={`mb-2 px-3 py-1 rounded ${theme.surfaceSecondary} ${theme.text}`}
        onClick={handleRun}
        disabled={loading || !code}
      >
        {loading ? "Running..." : "Run Code"}
      </button>
      <div className={`text-xs ${theme.textMuted} mb-2`}>
        {selectedFile?.name ? `File: ${selectedFile.name}` : "No file selected"}
      </div>
      {error && (
        <div className="text-xs font-semibold mb-2" style={{ color: '#ef4444' }}>Error: {error}</div>
      )}
      {output && (
        <div
          className={`text-xs font-mono whitespace-pre-wrap px-3 py-2 rounded mb-2`}
          style={{
            background: isSuccess === true ? '#052e16' : '#7f1d1d',
            color: isSuccess === true ? '#22c55e' : '#f87171',
            border: `1px solid ${isSuccess === true ? '#22c55e' : '#f87171'}`,
            fontWeight: 600,
          }}
        >
          {isSuccess === true ? 'Output: ' : 'Error: '}
          {output}
        </div>
      )}
      {!output && !error && (
        <div className={`text-xs ${theme.textMuted}`}>Output will appear here</div>
      )}
    </div>
  );
};

export default CompilerPanel;
