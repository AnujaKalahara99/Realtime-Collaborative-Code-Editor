export const getLanguageFromFileName = (fileName: string): string => {
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

export const normalizePath = (path: string): string => {
  // Remove double slashes and ensure single leading slash
  return "/" + path.replace(/^\/+/, "").replace(/\/+/g, "/");
};

export const getDisplayValue = (
  content?: string,
  placeholder = "// Select a file to start editing"
): string => {
  return content || placeholder;
};

export const createDebouncer = (delay: number = 300) => {
  let timeoutId: NodeJS.Timeout | null = null;

  return (callback: () => void) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(callback, delay);
  };
};
