import { useTheme } from "../ThemeProvider";

const LiveChatPanel = () => {
  const { theme } = useTheme();

  return (
    <div className={`h-full ${theme.surface} ${theme.text} p-4`}>
      <h3 className="text-sm font-medium mb-2">Live Chat</h3>
      <div className={`text-xs ${theme.textMuted}`}>
        Chat interface will go here
      </div>
    </div>
  );
};

export default LiveChatPanel;
