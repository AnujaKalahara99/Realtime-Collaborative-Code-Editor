import { useTheme } from "../../../Contexts/ThemeProvider";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export default function CodeBlock({
  code,
  language = "typescript",
  filename,
}: CodeBlockProps) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`${theme.surface} ${theme.border} border rounded-lg overflow-hidden my-4`}
    >
      {filename && (
        <div
          className={`${theme.surfaceSecondary} ${theme.border} border-b px-4 py-2 flex items-center justify-between`}
        >
          <span className={`text-sm font-mono ${theme.textSecondary}`}>
            {filename}
          </span>
          <button
            onClick={handleCopy}
            className={`${theme.textSecondary} ${theme.hover} p-1 rounded`}
            title="Copy code"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      )}
      <div className="relative">
        {!filename && (
          <button
            onClick={handleCopy}
            className={`absolute top-2 right-2 ${theme.textSecondary} ${theme.hover} p-2 rounded z-10`}
            title="Copy code"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        )}
        <pre className={`p-4 overflow-x-auto ${theme.textSecondary}`}>
          <code className={`language-${language} text-sm font-mono`}>
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}
