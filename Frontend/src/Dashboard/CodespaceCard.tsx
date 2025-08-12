import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  FileText,
  MoreVertical,
  Trash2,
  Share2,
  Edit,
  SettingsIcon,
} from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { type Codespace, type ViewMode } from "./codespace.types";

interface Props {
  codespace: Codespace;
  viewMode: ViewMode;
  onDelete?: () => void;
  onShare?: (email: string, role: "Developer" | "Admin") => void;
  onEdit?: (newName: string) => void;
}

function CodespaceCard({
  codespace,
  viewMode,
  onDelete,
  onShare,
  onEdit,
}: Props) {
  const { theme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [roleInput, setRoleInput] = useState<"Developer" | "Admin">(
    "Developer"
  );
  const [nameInput, setNameInput] = useState(codespace.name);
  const [displayName, setDisplayName] = useState(codespace.name);
  const [linkCopied, setLinkCopied] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

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
    setNameInput(displayName);
    setEditModalOpen(true);
    setShowMenu(false);
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareLink = `http://localhost:5173/viewonly/${codespace.id}`;

    try {
      await navigator.clipboard.writeText(shareLink);
      setLinkCopied(true);

      setTimeout(() => {
        setLinkCopied(false);
      }, 2000);
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = shareLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      setLinkCopied(true);
      setTimeout(() => {
        setLinkCopied(false);
      }, 2000);
    }

    setShowMenu(false);
  };

  const submitEdit = () => {
    if (nameInput.trim()) {
      setDisplayName(nameInput.trim());
      onEdit?.(nameInput.trim());
      setEditModalOpen(false);
    } else {
      alert("Codespace name cannot be empty");
    }
  };

  const handleClick = () => {
    if (!showMenu) {
      navigate(`/codeeditor/${codespace.id}`);
    }
  };

  const submitShare = () => {
    if (emailInput.trim()) {
      onShare?.(emailInput.trim(), roleInput);
      onShare?.(emailInput.trim(), roleInput);
      setEmailInput("");
      setRoleInput("Developer");
      setRoleInput("Developer");
      setShareModalOpen(false);
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        className={`${theme.surface} rounded-lg ${theme.border} border ${
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
            className={`relative rounded-lg p-3 ${
              viewMode === "list" ? "!p-2" : ""
            }`}
          >
            <FileText
              size={viewMode === "grid" ? 32 : 20}
              className={`${theme.textSecondary}`}
            />
            <div className="absolute inset-0 rounded-lg"></div>
          </div>

          <div className={`${viewMode === "grid" ? "mt-4" : ""}`}>
            <h3
              className={`font-semibold ${
                theme.text
              } transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400 ${
                viewMode === "grid" ? "text-lg mb-3" : "text-base"
              }`}
            >
              {displayName}
            </h3>
            <div
              className={`text-sm ${theme.textMuted} ${
                viewMode === "grid"
                  ? "space-y-2"
                  : "flex items-center space-x-6"
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Created at {codespace.lastModified}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    codespace.role === "Admin"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  }`}
                >
                  {codespace.role}
                </div>
              </div>
            </div>
          </div>
        </div>

        {(onDelete || onEdit || onShare) && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={toggleMenu}
              className={`${
                theme.hover
              } cursor-pointer p-2 rounded-lg transition-colors ${
                viewMode === "grid" ? " mt-4" : ""
              } z-10`}
            >
              <SettingsIcon size={24} className={theme.textSecondary} />
            </button>

            {showMenu && (
              <div
                className={`${theme.surface} absolute right-0 ${
                  viewMode === "grid"
                    ? "top-[calc(100%+4px)]"
                    : "top-[calc(100%+4px)]"
                } z-50 border ${theme.border} rounded-md shadow-lg p-2 w-48`}
              >
                {onEdit && (
                  <button
                    onClick={handleEdit}
                    className={`flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 w-full px-3 py-2 rounded-md ${theme.hover}`}
                  >
                    <Edit size={14} /> Edit
                  </button>
                )}
                {onShare && (
                  <button
                    onClick={handleShare}
                    className={`flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 w-full px-3 py-2 rounded-md ${theme.hover}`}
                  >
                    <Share2 size={14} /> Share
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={handleDelete}
                    className={`flex items-center gap-2 text-sm text-red-600 hover:text-red-700 w-full px-3 py-2 rounded-md ${theme.hover}`}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tooltip for double-click hint */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded shadow-lg">
            Double-click to open
          </div>
        </div>
      </div>

      {/* Enhanced Share Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className={`${theme.surface} p-6 rounded-lg shadow-lg w-full max-w-sm`}
          >
            <h2 className={`text-lg font-semibold mb-4 ${theme.text}`}>
              Share Codespace
            </h2>
            <input
              type="email"
              className={`w-full px-3 py-2 border ${theme.border} rounded-md ${theme.surface} ${theme.text} mb-4`}
              placeholder="Enter email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
            />
            <select
              className={`w-full px-3 py-2 border ${theme.border} rounded-md ${theme.surface} ${theme.text}`}
              value={roleInput}
              onChange={(e) =>
                setRoleInput(e.target.value as "Developer" | "Admin")
              }
            >
              <option value="Developer">Developer</option>
              <option value="Admin">Admin</option>
            </select>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShareModalOpen(false)}
                className={`px-4 py-2 ${theme.surfaceSecondary} ${theme.text} text-sm rounded ${theme.hover}`}
              >
                Cancel
              </button>
              <button
                onClick={submitShare}
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className={`${theme.surface} p-6 rounded-lg shadow-lg w-full max-w-sm`}
          >
            <h2 className={`text-lg font-semibold mb-4 ${theme.text}`}>
              Edit Codespace Name
            </h2>
            <input
              type="text"
              className={`w-full px-3 py-2 border ${theme.border} rounded-md ${theme.surface} ${theme.text}`}
              placeholder="Enter new name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setEditModalOpen(false)}
                className={`px-4 py-2 ${theme.surfaceSecondary} ${theme.text} text-sm rounded ${theme.hover}`}
              >
                Cancel
              </button>
              <button
                onClick={submitEdit}
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CodespaceCard;
