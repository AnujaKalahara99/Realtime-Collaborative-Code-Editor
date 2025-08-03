import { FileText, MoreVertical } from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { type Codespace, type ViewMode } from "./codespace.types";

interface Props {
  codespace: Codespace;
  viewMode: ViewMode;
}

function CodespaceCard({ codespace, viewMode }: Props) {
  const { theme } = useTheme();

  return (
    <div
      className={`${theme.surfaceSecondary} rounded-lg ${theme.border} border ${
        theme.hover
      } cursor-pointer transition-all duration-200 hover:shadow-md ${
        viewMode === "grid"
          ? "p-6 min-h-[200px] flex flex-col"
          : "p-4 flex items-center justify-between"
      }`}
    >
      <div
        className={`${
          viewMode === "grid" ? "flex-1" : "flex items-center space-x-4"
        }`}
      >
        <div
          className={`${theme.surfaceSecondary} rounded-lg p-3 w-fit ${
            viewMode === "list" ? "!p-2" : ""
          }`}
        >
          <FileText
            size={viewMode === "grid" ? 32 : 20}
            className="text-blue-500"
          />
        </div>

        <div className={`${viewMode === "grid" ? "mt-4" : ""}`}>
          <h3
            className={`font-medium ${theme.text} ${
              viewMode === "grid" ? "text-lg mb-2" : "text-base"
            }`}
          >
            {codespace.name}
          </h3>
          <div
            className={`text-sm ${theme.textMuted} ${
              viewMode === "grid" ? "space-y-1" : "flex items-center space-x-4"
            }`}
          >
            <p>Modified {codespace.lastModified}</p>
            <p>{codespace.owner}</p>
          </div>
        </div>
      </div>

      <button
        className={`${theme.hover} p-2 rounded-lg transition-colors ${
          viewMode === "grid" ? "self-end mt-4" : ""
        }`}
      >
        <MoreVertical size={16} className={theme.textMuted} />
      </button>
    </div>
  );
}

export default CodespaceCard;
