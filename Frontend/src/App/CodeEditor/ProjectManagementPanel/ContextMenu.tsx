import { Edit3, File, Folder, Trash2 } from "lucide-react";
import { useTheme } from "../../../Contexts/ThemeProvider";
import type { ContextMenuData } from "./file.types";

interface ContextMenuProps {
  contextMenu: ContextMenuData;
  onClose: () => void;
  onCreateFile: () => void;
  onCreateFolder: () => void;
  onRename: () => void;
  onDelete: () => void;
}

const ContextMenu = ({
  contextMenu,
  onClose,
  onCreateFile,
  onCreateFolder,
  onRename,
  onDelete,
}: ContextMenuProps) => {
  const { theme } = useTheme();

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className={`fixed z-50 ${theme.surface} border ${theme.border} rounded shadow-lg py-1 min-w-32`}
        style={{ left: contextMenu.x, top: contextMenu.y }}
      >
        <button
          onClick={onCreateFile}
          className={`w-full text-left px-3 py-1 text-sm ${theme.hover} ${theme.text} flex items-center gap-2`}
        >
          <File size={14} />
          New File
        </button>
        <button
          onClick={onCreateFolder}
          className={`w-full text-left px-3 py-1 text-sm ${theme.hover} ${theme.text} flex items-center gap-2`}
        >
          <Folder size={14} />
          New Folder
        </button>
        <hr className={`my-1 ${theme.border}`} />
        <button
          onClick={onRename}
          className={`w-full text-left px-3 py-1 text-sm ${theme.hover} ${theme.text} flex items-center gap-2`}
        >
          <Edit3 size={14} />
          Rename
        </button>
        <button
          onClick={onDelete}
          className={`w-full text-left px-3 py-1 text-sm ${theme.hover} text-red-400 flex items-center gap-2`}
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    </>
  );
};

export default ContextMenu;
