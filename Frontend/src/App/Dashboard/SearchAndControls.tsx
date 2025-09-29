import React from "react";
import { Search, Grid, Menu } from "lucide-react";
import { useTheme } from "../../Contexts/ThemeProvider";
import { type ViewMode } from "./codespace.types";

interface Props {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

function SearchAndControls({
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
}: Props) {
  const { theme } = useTheme();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div className="relative flex-1 max-w-md">
        <Search
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme.textMuted}`}
          size={20}
        />
        <input
          type="text"
          placeholder="Search Codespaces..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full pl-10 pr-4 py-2 ${theme.border} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme.text}`}
        />
      </div>

      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "grid"
                ? `${theme.active} ${theme.text}`
                : `${theme.hover} ${theme.textSecondary}`
            }`}
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "list"
                ? `${theme.active} ${theme.text}`
                : `${theme.hover} ${theme.textSecondary}`
            }`}
          >
            <Menu size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default SearchAndControls;
