

import React, { useState } from "react";
import { FileText, MoreVertical, Trash2, Share2, Edit, Link, Check } from "lucide-react";
import { useNavigate } from "react-router";
const useTheme = () => ({
  theme: {
    surfaceSecondary: "bg-white dark:bg-gray-800",
    surface: "bg-white dark:bg-gray-800",
    border: "border-gray-200 dark:border-gray-700",
    hover: "hover:bg-gray-50 dark:hover:bg-gray-700",
    text: "text-gray-900 dark:text-white",
    textMuted: "text-gray-600 dark:text-gray-400"
  }
});


// Types
interface Codespace {
  id: string;
  name: string;
  lastModified: string;
  role: string;
}

type ViewMode = "grid" | "list";

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
  const [roleInput, setRoleInput] = useState<"Developer" | "Admin">("Developer");
  const [nameInput, setNameInput] = useState(codespace.name);
  const [displayName, setDisplayName] = useState(codespace.name);
  const [linkCopied, setLinkCopied] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null);
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
      const textArea = document.createElement('textarea');
      textArea.value = shareLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
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

  const handleCardClick = () => {
    setClickCount(prev => prev + 1);
    
    if (clickTimer) {
      clearTimeout(clickTimer);
    }
    
    const timer = setTimeout(() => {
      if (clickCount === 0) {
        console.log('Single click - card selected');
      }
      setClickCount(0);
    }, 300);
    
    setClickTimer(timer);
    
    if (clickCount === 1) {
      clearTimeout(timer);
      setClickCount(0);
      navigate(`/codeeditor/${codespace.id}`);
    }
  };

  const handleMouseLeave = () => {
    setShowMenu(false);
  };

  const submitShare = () => {
    if (emailInput.trim()) {
      onShare?.(emailInput.trim(), roleInput);
      setEmailInput("");
      setRoleInput("Developer");
      setShareModalOpen(false);
    }
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        onMouseLeave={handleMouseLeave}
        className={`group relative rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-300 dark:hover:border-blue-600 hover:-translate-y-1 ${
          viewMode === "grid" ? "p-6 min-h-[220px] flex flex-col" : "p-4 flex items-center justify-between"
        }`}
      >
        <div className={`${viewMode === "grid" ? "flex-1" : "flex items-center space-x-4"}`}>
          <div
            className={`relative rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-3 shadow-md ${
              viewMode === "list" ? "!p-2" : ""
            }`}
          >
            <FileText 
              size={viewMode === "grid" ? 32 : 20} 
              className="text-white drop-shadow-sm" 
            />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 to-transparent"></div>
          </div>

          <div className={`${viewMode === "grid" ? "mt-4" : ""}`}>
            <h3
              className={`font-semibold ${theme.text} transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400 ${
                viewMode === "grid" ? "text-lg mb-3" : "text-base"
              }`}
            >
              {displayName}
            </h3>
            <div
              className={`text-sm ${theme.textMuted} ${
                viewMode === "grid" ? "space-y-2" : "flex items-center space-x-6"
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Created at {codespace.lastModified}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  codespace.role === "Admin" 
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                }`}>
                  {codespace.role}
                </div>
              </div>
            </div>
          </div>
        </div>

        {(onDelete || onEdit || onShare) && (
          <div className={`flex items-center gap-2 ${viewMode === "grid" ? "self-end mt-4" : ""}`}>
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(e);
                }}
                className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 text-gray-600 dark:text-gray-400"
                title="Edit"
              >
                <Edit size={16} />
              </button>
            )}
            {onShare && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare(e);
                }}
                className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 text-gray-600 dark:text-gray-400"
                title="Share"
              >
                <Share2 size={16} />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopyLink(e);
              }}
              className={`opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 rounded-lg ${
                linkCopied
                  ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
                  : "hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 text-gray-600 dark:text-gray-400"
              }`}
              title={linkCopied ? "Link Copied!" : "Copy Link"}
            >
              {linkCopied ? <Check size={16} /> : <Link size={16} />}
            </button>
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(e);
                }}
                className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 text-gray-600 dark:text-gray-400"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Share2 size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Share Codespace
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="colleague@company.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Access Level
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value as "Developer" | "Admin")}
                >
                  <option value="Developer">Developer - Can edit code</option>
                  <option value="Admin">Admin - Full access</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShareModalOpen(false)}
                className="px-6 py-2.5 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Edit size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Rename Codespace
              </h2>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Codespace Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Enter codespace name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitEdit()}
                autoFocus
              />
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-6 py-2.5 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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