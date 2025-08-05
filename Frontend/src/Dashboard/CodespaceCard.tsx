

import { useNavigate } from "react-router-dom";
import { FileText, MoreVertical, Trash2, Share2, Edit } from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { type Codespace, type ViewMode } from "./codespace.types";
import { useState } from "react";

interface Props {
  codespace: Codespace ;
  viewMode: ViewMode;
  onDelete?: () => void;
  onShare?: (newEmail: string) => void;
  onEdit?: (newName: string) => void;
}

function CodespaceCard({ codespace, viewMode, onDelete, onShare, onEdit }: Props) {
  const { theme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const navigate = useNavigate();

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu((prev) => !prev);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
    setShowMenu(false);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShareModalOpen(true);
    setShowMenu(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = window.prompt("Enter new codespace name:", codespace.name);
    if (newName && newName.trim()) {
      onEdit?.(newName.trim());
    } else {
      alert("Codespace name cannot be empty");
    }
    setShowMenu(false);
  };

  const handleClick = () => {
    navigate(`/codeeditor/${codespace.id}`);
  };

  const handleMouseLeave = () => {
    setShowMenu(false);
  };

  const submitShare = () => {
    if (emailInput.trim()) {
      onShare?.(emailInput.trim());
      setEmailInput("");
      setShareModalOpen(false);
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        onMouseLeave={handleMouseLeave}
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
              <p>{codespace.role}</p>
            </div>
          </div>
        </div>

        {(onDelete || onEdit || onShare) && (
          <button
            onClick={toggleMenu}
            className={`${theme.hover} p-2 rounded-lg transition-colors ${
              viewMode === "grid" ? "self-end mt-4" : ""
            } hover:bg-gray-100 dark:hover:bg-gray-700`}
          >
            <MoreVertical size={16} className={theme.textMuted} />
          </button>
        )}

        {showMenu && (
          <div
            className={`${theme.surface} absolute right-4 ${
              viewMode === "grid" ? "top-[calc(100%+8px)]" : "top-[calc(100%+4px)]"
            } z-50 border ${theme.border} rounded-md shadow-lg p-2 w-48`}
            onClick={(e) => e.stopPropagation()}
          >
            {onEdit && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 w-full px-3 py-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/50"
              >
                <Edit size={14} /> Edit
              </button>
            )}
            {onShare && (
              <button
                onClick={handleShare}
                className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 w-full px-3 py-2 rounded-md hover:bg-green-50 dark:hover:bg-green-900/50"
              >
                <Share2 size={14} /> Share
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 w-full px-3 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/50"
              >
                <Trash2 size={14} /> Delete
              </button>
            )}
          </div>
        )}
      </div>

      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Share Codespace</h2>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
              placeholder="Enter email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShareModalOpen(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-sm rounded hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={submitShare}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CodespaceCard;

