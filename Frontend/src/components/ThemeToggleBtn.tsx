import { Sun, Moon } from "lucide-react";
import { useTheme } from "../Contexts/ThemeProvider";
type ThemeToggleButtonProps = {
  size?: "small" | "medium" | "large";
};

const iconSizes = {
  small: 14,
  medium: 20,
  large: 28,
};

const ThemeToggleButton = ({ size = "medium" }: ThemeToggleButtonProps) => {
  const { theme, toggleTheme, isDark } = useTheme();
  const iconSize = iconSizes[size];

  return (
    <div>
      <button
        onClick={toggleTheme}
        className={`p-1 rounded ${theme.hover} ${theme.textSecondary} transition-colors`}
        title={`Switch to ${isDark ? "light" : "dark"} theme`}
      >
        {isDark ? <Sun size={iconSize} /> : <Moon size={iconSize} />}
      </button>
    </div>
  );
};

export default ThemeToggleButton;
