import { useTheme } from "../../Contexts/ThemeProvider";
import { useState } from "react";
import { useEditorCollaboration } from "../../Contexts/EditorContext";
import type { FileNode } from "./ProjectManagementPanel/file.types";

type CompilerPanelProps = {
  selectedFile?: FileNode | null;
};

type CompilationMode = "single" | "project";

const CompilerPanel = ({ selectedFile }: CompilerPanelProps) => {
  const { theme } = useTheme();
  const { compilerLoading, compilerResult, runCode } = useEditorCollaboration();

  const [mainFile, setMainFile] = useState<string>("index.js");
  const [input, setInput] = useState<string>("");
  const [compilationMode, setCompilationMode] =
    useState<CompilationMode>("single");

  const extension = selectedFile?.name?.split(".").pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    js: "javascript",
    jsx: "javascript",
    py: "python",
    java: "java",
  };
  const language = languageMap[extension || ""] || "plaintext";

  const handleRun = () => {
    runCode({
      compilationMode,
      mainFile,
      input,
      selectedFile,
    });
  };

  const canRun =
    compilationMode === "project" ||
    (compilationMode === "single" && selectedFile);

  return (
    <div className={`h-full flex flex-col ${theme.surface} ${theme.text}`}>
      {/* Header */}
      <div
        className={`${theme.surfaceSecondary} px-4 py-3 border-b ${theme.border}`}
      >
        <h3 className="text-sm font-semibold">Code Compiler</h3>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 overflow-x-clip overflow-y-auto Simple-Scrollbar flex-1">
        {/* Compilation Mode Section */}
        <div className="space-y-3">
          <label
            className={`block text-xs font-medium ${theme.textMuted} mb-2`}
          >
            Compilation Mode
          </label>
          <div className="flex gap-2">
            {(["single", "project"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setCompilationMode(mode)}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded border transition-colors ${
                  compilationMode === mode
                    ? `${theme.active} ${theme.text}`
                    : `${theme.surface} ${theme.text} ${theme.border}`
                }`}
              >
                {mode === "single" ? "Single File" : "Whole Project"}
              </button>
            ))}
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
          disabled={compilerLoading || !canRun}
          className={`w-full px-4 py-3 text-sm font-medium rounded border transition-colors ${
            compilerLoading || !canRun
              ? `${theme.surface} ${theme.text} ${theme.border}`
              : `$${theme.active} ${theme.text}`
          }`}
        >
          {compilerLoading ? (
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
          {compilerResult && (
            <div
              className={`border rounded ${
                compilerResult.success ? "border-green-500" : "border-red-500"
              }`}
            >
              <div
                className={`px-3 py-2 text-xs font-medium border-b ${
                  compilerResult.success
                    ? "bg-green-900 text-green-100 border-green-500"
                    : "bg-red-900 text-red-100 border-red-500"
                }`}
              >
                {compilerResult.success ? "Output" : "Error"}
              </div>
              <div
                className={`px-3 py-3 text-xs font-mono whitespace-pre-wrap ${
                  compilerResult.success
                    ? "bg-green-950 text-green-200"
                    : "bg-red-950 text-red-200"
                }`}
              >
                {compilerResult.output}
              </div>
            </div>
          )}

          {!compilerResult && (
            <div className={`border rounded ${theme.border}`}>
              <div
                className={`${theme.surfaceSecondary} px-3 py-2 text-xs font-medium border-b ${theme.border}`}
              >
                Output
              </div>
              <div
                className={`${theme.surface} px-3 py-3 text-xs ${theme.textMuted} text-center`}
              >
                {compilerLoading
                  ? "Running code..."
                  : "Output will appear here after running code"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompilerPanel;
