import { Sun, Moon, ArrowLeft } from "lucide-react";
import { useTheme } from "../../Contexts/ThemeProvider";
import Avatar from "../../components/Avatar";
import { useNavigate } from "react-router";
import { useEditorCollaboration } from "../../Contexts/EditorContext";

const NavigationBar = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const { isConnected, connectedUsers } = useEditorCollaboration();

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div
      className={`h-10 ${theme.background} ${theme.border} border-b flex items-center px-4 justify-between`}
    >
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
      <div className="flex items-center gap-2">
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
      </div>
      <button
        onClick={toggleTheme}
        className={`p-1 rounded ${theme.hover} ${theme.textSecondary} transition-colors`}
        title={`Switch to ${isDark ? "light" : "dark"} theme`}
      >
        {isDark ? <Sun size={14} /> : <Moon size={14} />}
      </button>
    </div>
  );
};

export default NavigationBar;
