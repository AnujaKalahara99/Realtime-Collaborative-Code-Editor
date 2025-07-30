import { useTheme } from "../ThemeProvider";

const GitPanel = () => {
  const { theme } = useTheme();

  return (
    <div className={`h-full ${theme.surface} ${theme.text} p-4`}>
      <h3 className="text-sm font-medium mb-2">Git</h3>
      <div className={`text-xs ${theme.textMuted}`}>
        Git status and controls will go here
      </div>
    </div>
  );
};

export default GitPanel;
