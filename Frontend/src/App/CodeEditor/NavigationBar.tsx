import { Sun, Moon, ArrowLeft, Share2 } from "lucide-react";
import { useTheme } from "../../Contexts/ThemeProvider";
import Avatar from "../../components/Avatar";
import { useNavigate } from "react-router";
import { useEditorCollaboration } from "../../Contexts/EditorContext";

const NavigationBar = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const { isConnected, connectedUsers, codespace, activeSessionIndex } =
    useEditorCollaboration();

  const currentBranch =
    codespace?.sessions?.[activeSessionIndex]?.name || "main";
  const codespaceName = codespace?.name || "Untitled";

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
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
  );
};

export default NavigationBar;
