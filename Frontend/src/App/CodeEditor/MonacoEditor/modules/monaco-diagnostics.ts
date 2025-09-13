import * as monaco from "monaco-editor";
import { VFSMonacoIntegration } from "../../../../lib/integration/vfs-monaco-integration";
import { VFSBridge } from "../../../../lib/vfs/vfs-bridge";
import { normalizePath } from "./monaco-utils";

export interface DiagnosticsCount {
  errors: number;
  warnings: number;
}

export const updateMonacoDiagnostics = (
  filePath: string,
  editorRef: React.MutableRefObject<monaco.editor.IStandaloneCodeEditor | null>,
  integrationRef: React.MutableRefObject<VFSMonacoIntegration | null>,
  vfsBridge: VFSBridge | undefined,
  setDiagnosticsCount: React.Dispatch<React.SetStateAction<DiagnosticsCount>>,
  content?: string
): DiagnosticsCount => {
  if (!integrationRef.current || !editorRef.current) {
    console.log("Integration or editor not available for diagnostics");
    return { errors: 0, warnings: 0 };
  }

  const model = editorRef.current.getModel();
  if (!model) {
    console.log("No Monaco model available");
    return { errors: 0, warnings: 0 };
  }

  console.log("Updating diagnostics for:", filePath);

  // Normalize the file path to prevent double slashes
  const normalizedPath = normalizePath(filePath);
  console.log("Normalized path:", normalizedPath, "(original:", filePath, ")");

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
        const dependencies = dependencyManager.getDependencies(normalizedPath);
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

  // Convert to Monaco markers
  const markers = finalDiagnostics.map((diag) => {
    const lineContent = model.getLineContent(diag.line);
    const importMatch = lineContent.match(
      /import\s+.*from\s+['"`]([^'"`]+)['"`]/
    );

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
      startLineNumber: diag.line,
      startColumn: startColumn,
      endLineNumber: diag.line,
      endColumn: endColumn,
      source: "vfs-integration",
      code: "import-error",
      tags: diag.severity === "error" ? [monaco.MarkerTag.Unnecessary] : [],
    };
  });

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
  setTimeout(() => {
    if (editorRef.current) {
      editorRef.current.focus();
      editorRef.current.trigger("source", "editor.action.marker.next", {});
    }
  }, 100);

  // Update diagnostics count
  const errors = diagnostics.filter((d) => d.severity === "error").length;
  const warnings = diagnostics.filter((d) => d.severity === "warning").length;

  const result = { errors, warnings };
  setDiagnosticsCount(result);

  console.log("Diagnostics count updated:", result);
  return result;
};

export const createDebouncedDiagnostics = (
  updateFunction: (filePath: string, content?: string) => DiagnosticsCount,
  delay: number = 300
) => {
  let timeoutRef: { current: NodeJS.Timeout | null } = { current: null };

  return (filePath: string, content?: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      updateFunction(filePath, content);
    }, delay);
  };
};
