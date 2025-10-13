import { useTheme } from "../../Contexts/ThemeProvider";
import { useState } from "react";
import { useEditorCollaboration } from "../../Contexts/EditorContext";
import type { FileNode } from "./ProjectManagementPanel/file.types";
import axios from "axios";

type CompilerPanelProps = {
  selectedFile?: FileNode | null;
};

type CompilationMode = "single" | "project";

const CompilerPanel = ({ selectedFile }: CompilerPanelProps) => {
  const { theme } = useTheme();
  const [output, setOutput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [mainFile, setMainFile] = useState<string>("index.js");
  const [input, setInput] = useState<string>("");
  const [compilationMode, setCompilationMode] =
    useState<CompilationMode>("single");
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

  const handleRun = async () => {
    setLoading(true);
    setError("");
    setOutput("");
    setIsSuccess(null);

    try {
      const requestData = {
        sessionId:
          compilationMode === "project" ? `project-${Date.now()}` : undefined,
        language,
        code: compilationMode === "single" ? code : undefined,
        input,
        mainFile: mainFile || selectedFile?.name || "index.js",
        compilationMode,
      };

      console.log("Sending request:", requestData);

      const res = await axios.post("http://localhost:4000/run", requestData);
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
    <div className={`h-full ${theme.surface} ${theme.text}`}>
      {/* Header */}
      <div
        className={`${theme.surfaceSecondary} px-4 py-3 border-b ${theme.border}`}
      >
        <h3 className="text-sm font-semibold">Code Compiler</h3>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Compilation Mode Section */}
        <div className="space-y-3">
          <label
            className={`block text-xs font-medium ${theme.textMuted} mb-2`}
          >
            Compilation Mode
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setCompilationMode("single")}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded border transition-colors ${
                compilationMode === "single"
                  ? `${theme.active} text-white`
                  : `${theme.surface} ${theme.text} ${theme.border} hover:${theme.surfaceSecondary}`
              }`}
            >
              Single File
            </button>
            <button
              onClick={() => setCompilationMode("project")}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded border transition-colors ${
                compilationMode === "project"
                  ? `${theme.active} text-white`
                  : `${theme.surface} ${theme.text} ${theme.border} hover:${theme.surfaceSecondary}`
              }`}
            >
              Whole Project
            </button>
          </div>
        </div>

        {/* Configuration Section */}
        <div className="space-y-3">
          {compilationMode === "project" && (
            <div>
              <label
                className={`block text-xs font-medium ${theme.textMuted} mb-2`}
              >
                Main File
              </label>
              <input
                type="text"
                value={mainFile}
                onChange={(e) => setMainFile(e.target.value)}
                placeholder="index.js"
                className={`w-full px-3 py-2 text-xs border rounded ${theme.surface} ${theme.text} ${theme.border} focus:outline-none focus:ring-1 focus:ring-blue-500`}
              />
            </div>
          )}

          <div>
            <label
              className={`block text-xs font-medium ${theme.textMuted} mb-2`}
            >
              Input (optional)
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Program input..."
              rows={3}
              className={`w-full px-3 py-2 text-xs border rounded ${theme.surface} ${theme.text} ${theme.border} focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none`}
            />
          </div>
        </div>

        {/* File Info */}
        <div
          className={`px-3 py-2 rounded ${theme.surfaceSecondary} border ${theme.border}`}
        >
          <div className={`text-xs ${theme.textMuted} mb-1`}>
            {compilationMode === "single" ? "Current File:" : "Entry Point:"}
          </div>
          <div className="text-xs font-medium">
            {compilationMode === "single"
              ? selectedFile?.name
                ? `${selectedFile.name} (${language})`
                : "No file selected"
              : `${mainFile} (${language})`}
          </div>
        </div>

        {/* Run Button */}
        <button
          onClick={handleRun}
          disabled={loading || (compilationMode === "single" && !code)}
          className={`w-full px-4 py-3 text-sm font-medium rounded border transition-colors ${
            loading || (compilationMode === "single" && !code)
              ? `${theme.surfaceSecondary} ${theme.textMuted} cursor-not-allowed`
              : `${theme.active} text-white hover:opacity-90 active:scale-[0.98]`
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Running...
            </span>
          ) : (
            `Run ${compilationMode === "single" ? "File" : "Project"}`
          )}
        </button>

        {/* Output Section */}
        <div className="space-y-3">
          {error && (
            <div className="border border-red-500 rounded">
              <div className="bg-red-900 text-red-100 px-3 py-2 text-xs font-medium border-b border-red-500">
                Error
              </div>
              <div className="bg-red-950 text-red-200 px-3 py-3 text-xs font-mono whitespace-pre-wrap">
                {error}
              </div>
            </div>
          )}

          {output && (
            <div
              className={`border rounded ${
                isSuccess ? "border-green-500" : "border-red-500"
              }`}
            >
              <div
                className={`px-3 py-2 text-xs font-medium border-b ${
                  isSuccess
                    ? "bg-green-900 text-green-100 border-green-500"
                    : "bg-red-900 text-red-100 border-red-500"
                }`}
              >
                {isSuccess ? "Output" : "Error"}
              </div>
              <div
                className={`px-3 py-3 text-xs font-mono whitespace-pre-wrap ${
                  isSuccess
                    ? "bg-green-950 text-green-200"
                    : "bg-red-950 text-red-200"
                }`}
              >
                {output}
              </div>
            </div>
          )}

          {!output && !error && (
            <div className={`border rounded ${theme.border}`}>
              <div
                className={`${theme.surfaceSecondary} px-3 py-2 text-xs font-medium border-b ${theme.border}`}
              >
                Output
              </div>
              <div
                className={`${theme.surface} px-3 py-8 text-xs ${theme.textMuted} text-center`}
              >
                Output will appear here after running code
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompilerPanel;
