import { Sun, Moon, ArrowLeft, Share2 } from "lucide-react";
import { useTheme } from "../../Contexts/ThemeProvider";
import Avatar from "../../components/Avatar";
import { useNavigate } from "react-router";
import { useEditorCollaboration } from "../../Contexts/EditorContext";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useToast } from "../../Contexts/ToastContext";

const getToken = () => {
  const storageKey = `sb-${
    import.meta.env.VITE_SUPABASE_PROJECT_ID
  }-auth-token`;
  const sessionDataString = localStorage.getItem(storageKey);
  const sessionData = JSON.parse(sessionDataString || "null");
  return sessionData?.access_token || "";
};

type InvitedUser = {
  email: string;
  role: string;
  accepted_at: string | null;
  avatar_url?: string;
};

const NavigationBar = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const { isConnected, connectedUsers, codespace, activeSessionIndex } =
    useEditorCollaboration();
  const { showToast } = useToast();

  const [showShareModal, setShowShareModal] = useState(false);
  const [invitedUsers, setInvitedUsers] = useState<InvitedUser[]>([]);
  const [acceptedUsers, setAcceptedUsers] = useState<InvitedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Developer");

  // const handleInviteUser = async () => {
  //   if (!inviteEmail) return;
  //   // TODO: Implement invite user API call here
  //   // Example: await axios.post(...)
  //   alert(`Invite sent to ${inviteEmail} as ${inviteRole}`);
  //   setInviteEmail("");
  //   setInviteRole("Developer");
  // };

  const currentBranch =
    codespace?.sessions?.[activeSessionIndex]?.name || "main";
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
      const match = window.location.pathname.match(/codeeditor\/(.*?)(\/|$)/);
      const codespaceId = match ? match[1] : null;
      if (!codespaceId) {
        setError("Could not determine codespace ID from URL");
        setLoading(false);
        return;
      }
      const apiUrl = `${
        import.meta.env.VITE_BACKEND_URL
      }/codespaces/${codespaceId}/inviteusers`;
      const res = await axios.get(apiUrl, {
        headers: {
          "Content-Type": "application/json",
          Authorization: getToken(),
        },
      });
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
        >
          <div
            className={`rounded-lg shadow-lg p-0 min-w-[380px] max-w-[95vw] w-full max-w-md border-2 ${theme.surface} ${theme.border} ${theme.text}`}
            style={{
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)",
              filter: "brightness(1.04)",
              fontSize: "1.75rem",
            }}
          >
            {/* Header */}
            <div
              className={`flex justify-between items-center border-b px-6 py-4 ${theme.border}`}
            >
              <h2 className="text-xl font-bold">Share Codespace</h2>
              <button
                onClick={closeModal}
                className={`text-2xl ${theme.textSecondary} hover:${theme.text}`}
              >
                ✕
              </button>
            </div>
            {/* Email and role form */}
            <div className="px-6 pt-4 pb-2">
              <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end mt-4">
                <input
                  type="email"
                  placeholder="Enter email address"
                  className={`flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme.surface} ${theme.text} placeholder-gray-400 ${theme.border}`}
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
                <select
                  className={`border rounded px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme.surface} ${theme.text} ${theme.border}`}
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="Developer">Developer</option>
                  <option value="Admin">Admin</option>
                </select>
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-sm shadow"
                  onClick={async () => {
                    const match = window.location.pathname.match(
                      /codeeditor\/(.*?)(\/|$)/
                    );
                    const codespaceId = match ? match[1] : null;
                    if (!codespaceId) {
                      setError("Could not determine codespace ID from URL");
                      return;
                    }
                    if (!inviteEmail) {
                      setError("Please enter an email address");
                      return;
                    }
                    const currentUserRole = codespace?.role || "Developer"; // Default to Developer if role is undefined

                    if (currentUserRole === "Developer") {
                      showToast({
                        type: "error",
                        title: "Permission Denied",
                        message: "Developers are not allowed to share codespaces.",
                      });
                      setLoading(false);
                      return;
                    }

                    setError(null);
                    setLoading(true);
                    try {
                      const CODESPACE_API_URL = `${
                        import.meta.env.VITE_BACKEND_URL
                      }/codespaces`;
                      const token = getToken();
                      const response = await fetch(
                        `${CODESPACE_API_URL}/${codespaceId}/sharebyemail`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: token,
                          },
                          body: JSON.stringify({
                            email: inviteEmail.trim(),
                            role: inviteRole.trim(),
                          }),
                        }
                      );
                      if (!response.ok) {
                        const errorData = await response
                          .json()
                          .catch(() => ({}));
                        setError(
                          `Server error: ${
                            errorData.message || response.status
                          }`
                        );
                      } else {
                        setInviteEmail("");
                        setInviteRole("Developer");
                        fetchInvitedUsers();
                      }
                    } catch {
                      setError("Failed to share codespace");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  type="button"
                >
                  <Share2 size={16} /> Share
                </button>
              </div>
            </div>
            {/* People with access */}
            <div className="px-6 pb-2">
              <div className="text-sm font-medium mb-2 mt-2">
                People with access
              </div>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="flex items-center justify-center mb-2">
                    <div className="flex justify-center items-center">
                      <div
                        role="status"
                        className={`${theme.text} animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary`}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : error ? (
                <div className="text-red-500">{error}</div>
              ) : (
                <ul>
                  {[...acceptedUsers, ...invitedUsers].map((user, idx) => (
                    <li
                      key={user.email + idx}
                      className="flex items-center gap-3 py-2 border-b last:border-b-0"
                    >
                      <Avatar
                        name={user.email}
                        src={user.avatar_url}
                        size="small"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {user.email}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {user.role === "Owner" ? "Owner" : user.role}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-gray-500">
                          {user.accepted_at ? (
                            <span>
                              {user.role === "Owner" ? "Owner" : user.role}
                            </span>
                          ) : (
                            <span className="italic text-yellow-600">
                              Invited
                            </span>
                          )}
                        </div>
                        {/* Remove button, not shown for Owner */}
                        {user.role !== "Owner" && (
                          <button
                            className={`ml-2 px-2 py-1 text-xs ${theme.surfaceSecondary} ${theme.text} rounded ${theme.hover}`}
                            title="Remove user"
                            onClick={async () => {
                              setLoading(true);
                              setError(null);
                              try {
                                // Extract codespaceId from the current URL (pattern: /codeeditor/:codespaceId)
                                const match = window.location.pathname.match(
                                  /codeeditor\/(.*?)(\/|$)/
                                );
                                const codespaceId = match ? match[1] : null;
                                if (!codespaceId) {
                                  setError(
                                    "Could not determine codespace ID from URL"
                                  );
                                  setLoading(false);
                                  return;
                                }
                                const CODESPACE_API_URL = `${
                                  import.meta.env.VITE_BACKEND_URL
                                }/codespaces`;
                                const token = getToken();
                                const currentUserRole = codespace?.role || "Developer"; // Default to Developer if role is undefined

                                if (currentUserRole !== "owner") {
                                  showToast({
                                    type: "error",
                                    title: "Permission Denied",
                                    message: "Only the owner can remove members from the codespace.",
                                  });
                                  setLoading(false);
                                  return;
                                }

                                const response = await fetch(
                                  `${CODESPACE_API_URL}/${codespaceId}/remove-member/${encodeURIComponent(
                                    user.email
                                  )}`,
                                  {
                                    method: "DELETE",
                                    headers: {
                                      "Content-Type": "application/json",
                                      Authorization: token,
                                    },
                                  }
                                );
                                if (!response.ok) {
                                  const errorData = await response
                                    .json()
                                    .catch(() => ({}));
                                  setError(
                                    `Remove failed: ${
                                      errorData.message || response.status
                                    }`
                                  );
                                } else {
                                  fetchInvitedUsers();
                                }
                              } catch {
                                setError("Failed to remove user");
                              } finally {
                                setLoading(false);
                              }
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                  {acceptedUsers.length === 0 && invitedUsers.length === 0 && (
                    <li className="text-gray-500 text-sm py-2">
                      No invited users found.
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavigationBar;
