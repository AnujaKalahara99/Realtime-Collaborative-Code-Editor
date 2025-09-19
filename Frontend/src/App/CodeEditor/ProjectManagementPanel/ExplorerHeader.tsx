import { File, Folder } from "lucide-react";
import { useTheme } from "../../../Contexts/ThemeProvider";

interface ExplorerHeaderProps {
  onCreateFile: () => void;
  onCreateFolder: () => void;
}

const ExplorerHeader = ({
  onCreateFile,
  onCreateFolder,
}: ExplorerHeaderProps) => {
  const { theme } = useTheme();

  return (
    <div
      className={`p-3 ${theme.surfaceSecondary} border-b ${theme.border} flex items-center justify-between`}
    >
      <h3 className="text-sm font-medium">Explorer</h3>
      <div className="flex items-center gap-1">
        <button
          onClick={onCreateFile}
          className={`p-1 rounded ${theme.hover} ${theme.textMuted}`}
          title="New File"
        >
          <File size={14} />
        </button>
        <button
          onClick={onCreateFolder}
          className={`p-1 rounded ${theme.hover} ${theme.textMuted}`}
          title="New Folder"
        >
          <Folder size={14} />
        </button>
      </div>
    </div>
  );
};

export default ExplorerHeader;
