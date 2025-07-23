import { Sun, Moon } from "lucide-react";
import { useTheme } from "../ThemeProvider";

const NavigationBar = () => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <div
      className={`h-8 ${theme.background} ${theme.border} border-b flex items-center px-4 justify-between`}
    >
      <div className={`text-xs ${theme.textMuted}`}>
        Menu bar and top status will go here
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
