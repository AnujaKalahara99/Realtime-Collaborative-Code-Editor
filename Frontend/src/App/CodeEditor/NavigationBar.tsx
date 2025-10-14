import { Sun, Moon, ArrowLeft, Share2 } from "lucide-react";
import { useTheme } from "../../Contexts/ThemeProvider";
import Avatar from "../../components/Avatar";
import { useNavigate } from "react-router";
import { useEditorCollaboration } from "../../Contexts/EditorContext";



import React, { useState } from "react";
import axios from "axios";

type InvitedUser = {
  email: string;
  role: string;
  accepted_at: string | null;
  avatar_url?: string;
};

const NavigationBar = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const { isConnected, connectedUsers, codespace, activeSessionIndex } = useEditorCollaboration();

  const [showShareModal, setShowShareModal] = useState(false);
  const [invitedUsers, setInvitedUsers] = useState<InvitedUser[]>([]);
  const [acceptedUsers, setAcceptedUsers] = useState<InvitedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentBranch = codespace?.sessions?.[activeSessionIndex]?.name || "main";
  const codespaceName = codespace?.name || "Untitled";

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareModal(true);
    fetchInvitedUsers();
  };

  const fetchInvitedUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:4000/codespaces/c476bf03-1608-4483-8d54-3db0d9433a7e/inviteusers");
      const users: InvitedUser[] = res.data.invitedUsers || [];
      setInvitedUsers(users.filter((u) => u.accepted_at === null));
      setAcceptedUsers(users.filter((u) => u.accepted_at !== null));
    } catch {
      setError("Failed to fetch invited users");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => setShowShareModal(false);

  return (
    <>
      <div
        className={`h-10 ${theme.background} ${theme.border} border-b flex items-center px-4`}
      >
        {/* Left section */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackToDashboard}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${theme.textMuted} ${theme.hover} transition-colors border ${theme.border}`}
            title="Back to Dashboard"
          >
            <ArrowLeft size={12} className={`${theme.textSecondary}`} />
            Dashboard
          </button>
        </div>

        {/* Center section - Codespace and Branch Info */}
        <div className="flex items-center gap-2 flex-1 justify-center">
          <div className={`text-sm font-medium ${theme.text}`}>
            {codespaceName}
          </div>
          <div className={`text-xs ${theme.textMuted}`}>•</div>
          <div
            className={`text-xs ${theme.textSecondary} px-2 py-1 rounded border ${theme.border} ${theme.surface}`}
          >
            {currentBranch}
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Connection status */}
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
            title={isConnected ? "Connected" : "Disconnected"}
          />

          {/* Connected users count */}
          {connectedUsers.length > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex -space-x-1">
                {connectedUsers.slice(0, 3).map((user, index) => (
                  <Avatar
                    key={user.name + index}
                    name={user.name}
                    src={user.avatar}
                    color={undefined}
                    size="small"
                  />
                ))}
                {connectedUsers.length > 3 && (
                  <div
                    className={`w-4 h-4 rounded-full ${theme.surface} border ${theme.border} flex items-center justify-center text-xs`}
                  >
                    +{connectedUsers.length - 3}
                  </div>
                )}
              </div>
              <span className={`text-xs ${theme.textMuted}`}>
                {connectedUsers.length} user
                {connectedUsers.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {/* Share button */}
          <button
            onClick={handleShare}
            className={`px-5 rounded ${theme.textSecondary}`}
            title="Share codespace"
          >
            <Share2 size={16} />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={`pr-5 rounded ${theme.textSecondary}`}
            title={`Switch to ${isDark ? "light" : "dark"} theme`}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 min-w-[320px] max-w-[90vw]`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Invited Users</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-800 dark:hover:text-white">✕</button>
            </div>
            {loading ? (
              <div>Loading...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <>
                {invitedUsers.length > 0 && (
                  <div className="mb-4">
                    <div className="font-medium mb-1">Invited (not accepted)</div>
                    <ul>
                      {invitedUsers.map((user, idx) => (
                        <li key={user.email + idx} className="flex items-center gap-2 mb-2">
                          <Avatar name={user.email} src={user.avatar_url} size="small" />
                          <span>{user.email}</span>
                          <span className="text-xs text-gray-500">({user.role})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {acceptedUsers.length > 0 && (
                  <div>
                    <div className="font-medium mb-1">Accepted</div>
                    <ul>
                      {acceptedUsers.map((user, idx) => (
                        <li key={user.email + idx} className="flex items-center gap-2 mb-2">
                          <Avatar name={user.email} src={user.avatar_url} size="small" />
                          <span>{user.email}</span>
                          <span className="text-xs text-gray-500">({user.role})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {invitedUsers.length === 0 && acceptedUsers.length === 0 && (
                  <div>No invited users found.</div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default NavigationBar;
