import { Sun, Moon } from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { useEffect, useState } from "react";
import {
  collaborationService,
  type CollaborationUser,
} from "./YJSCollaborationService";

const NavigationBar = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<CollaborationUser[]>([]);

  // Subscribe to connection status and users
  useEffect(() => {
    const unsubscribeConnection =
      collaborationService.onConnectionChange(setIsConnected);
    const unsubscribeUsers =
      collaborationService.onUsersChange(setConnectedUsers);

    return () => {
      unsubscribeConnection();
      unsubscribeUsers();
    };
  }, []);

  return (
    <div
      className={`h-8 ${theme.background} ${theme.border} border-b flex items-center px-4 justify-between`}
    >
      <div className={`text-xs ${theme.textMuted}`}>
        Menu bar and top status will go here
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
                <div
                  key={index}
                  className="w-4 h-4 rounded-full border border-gray-600"
                  style={{ backgroundColor: user.color }}
                  title={user.name}
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
