import { Plus } from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { type ViewMode } from "./codespace.types";

interface Props {
  viewMode: ViewMode;
  onClick: () => void;
}

function CreateCodespaceCard({ viewMode, onClick }: Props) {
  const { theme } = useTheme();

  return (
    <div
      onClick={onClick}
      className={`${theme.surface} ${
        theme.border
      } border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer ${
        theme.hover
      } transition-colors min-h-[200px] ${
        viewMode === "list" ? "!min-h-[80px] flex-row justify-start" : ""
      }`}
    >
      <Plus
        size={viewMode === "grid" ? 48 : 24}
        className={`${theme.textMuted} ${
          viewMode === "list" ? "mr-4" : "mb-4"
        }`}
      />
      <span
        className={`${theme.textSecondary} font-medium text-center ${
          viewMode === "list" ? "text-base" : "text-lg"
        }`}
      >
        Create New Codespace
      </span>
    </div>
  );
}

export default CreateCodespaceCard;
