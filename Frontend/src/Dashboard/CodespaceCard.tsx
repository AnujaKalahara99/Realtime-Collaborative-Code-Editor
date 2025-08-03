
import { useNavigate } from "react-router-dom";
import { FileText, MoreVertical, Trash2 } from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { type Codespace, type ViewMode } from "./codespace.types";
import { useState } from "react";

interface Props {
  codespace: Codespace;
  viewMode: ViewMode;
  onDelete?: () => void;
}

function CodespaceCard({ codespace, viewMode, onDelete }: Props) {
  const { theme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    setShowMenu((prev) => !prev);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete();
    setShowMenu(false);
  };

  const handleClick = () => {
    navigate("/codeeditor", { state: { codespaceId: codespace.id } });
  };

  return (
    <div
      onClick={handleClick}
      className={`${theme.surfaceSecondary} rounded-lg ${theme.border} border ${
        theme.hover
      } cursor-pointer transition-all duration-200 hover:shadow-md relative ${
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
        onClick={toggleMenu}
        className={`${theme.hover} p-2 rounded-lg transition-colors ${
          viewMode === "grid" ? "self-end mt-4" : ""
        }`}
      >
        <MoreVertical size={16} className={theme.textMuted} />
      </button>

      {showMenu && (
        <div
          className={`${theme.surface} absolute right-4 top-12 z-50 border ${theme.border} rounded-md shadow-lg p-2 w-36`}
          onClick={(e) => e.stopPropagation()} 
        >
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 w-full px-2 py-1 rounded-md hover:bg-red-50"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default CodespaceCard;
