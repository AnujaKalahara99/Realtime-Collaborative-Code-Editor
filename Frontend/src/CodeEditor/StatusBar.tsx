import { useTheme } from "../ThemeProvider";

const StatusBar = () => {
  const { theme } = useTheme();

  return (
    <div
      className={`h-6 ${theme.statusBar} flex items-center px-4 justify-between`}
    >
      <div className="flex items-center gap-4">
        <span className={`text-xs ${theme.statusText}`}>Ready</span>
        <span className={`text-xs ${theme.statusText}`}>TypeScript</span>
      </div>
      <div className="flex items-center gap-4">
        <span className={`text-xs ${theme.statusText}`}>Line 1, Col 1</span>
        <span className={`text-xs ${theme.statusText}`}>Spaces: 2</span>
      </div>
    </div>
  );
};

export default StatusBar;
