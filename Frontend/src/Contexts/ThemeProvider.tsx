import { useState, createContext, useContext } from "react";
import React from "react";
type Theme = {
  background: string;
  surface: string;
  surfaceSecondary: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  hover: string;
  active: string;
  inactive: string;
  statusBar: string;
  statusText: string;
  monacoTheme: string;
};

type ThemeContextType = {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme Provider Component
export const ThemeProvider: React.FC<React.PropsWithChildren<object>> = ({
  children,
}) => {
  const [isDark, setIsDark] = useState(true);

  const themes = {
    dark: {
      // Main UI
      background: "bg-gray-900",
      surface: "bg-gray-800",
      surfaceSecondary: "bg-gray-700",
      border: "border-gray-600",
      text: "text-white",
      textSecondary: "text-gray-300",
      textMuted: "text-gray-400",

      // Interactive elements
      hover: "hover:bg-gray-600",
      active: "bg-gray-500",
      inactive: "bg-gray-700",

      // Status bar
      statusBar: "bg-blue-600",
      statusText: "text-white",

      // Monaco editor
      monacoTheme: "vs-dark",
    },
    light: {
      // Main UI
      background: "bg-gray-50",
      surface: "bg-white",
      surfaceSecondary: "bg-gray-100",
      border: "border-gray-300",
      text: "text-gray-900",
      textSecondary: "text-gray-700",
      textMuted: "text-gray-500",

      // Interactive elements
      hover: "hover:bg-gray-200",
      active: "bg-gray-200",
      inactive: "bg-gray-100",

      // Status bar
      statusBar: "bg-blue-500",
      statusText: "text-white",

      // Monaco editor
      monacoTheme: "vs",
    },
  };

  const currentTheme = isDark ? themes.dark : themes.light;

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
