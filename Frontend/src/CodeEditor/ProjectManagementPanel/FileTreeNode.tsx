import { ChevronDown, ChevronRight } from "lucide-react";
import { useTheme } from "../../ThemeProvider";
import type { FileNode } from "./file.types";
import type { VFSEntry, VFSFolder, VFSFile } from "../../lib/vfs/types";
import FileIcon from "./FileIcon";
import InlineEditor from "./InlineEditor";

interface FileTreeNodeProps {
  node: VFSFolder | VFSFile | FileNode;
  level: number;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: (node: VFSFolder | VFSFile | FileNode) => void;
  onToggleExpand: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, nodeId: string) => void;
  onRename: (id: string, newName: string) => void;
  onCancelEdit: () => void;
}

const FileTreeNode = ({
  node,
  level,
  isSelected,
  isEditing,
  onSelect,
  onToggleExpand,
  onContextMenu,
  onRename,
  onCancelEdit,
}: FileTreeNodeProps) => {
  const { theme } = useTheme();

  const handleClick = () => {
    if (node.type === "folder") {
      onToggleExpand(node.id);
    } else {
      onSelect(node);
    }
  };

  const handleRename = (newName: string) => {
    onRename(node.id, newName);
  };

  return (
    <div>
      <div
        className={`flex items-center py-1 px-2 cursor-pointer text-sm select-none ${
          isSelected ? theme.active : theme.hover
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
        onContextMenu={(e) => onContextMenu(e, node.id)}
      >
        <div className="flex items-center flex-1 min-w-0">
          {node.type === "folder" && (
            <span className="mr-1 flex-shrink-0">
              {node.isExpanded ? (
                <ChevronDown size={12} />
              ) : (
                <ChevronRight size={12} />
              )}
            </span>
          )}
          <span className={`mr-2 flex-shrink-0 ${theme.textMuted}`}>
            <FileIcon node={node} />
          </span>
          {isEditing ? (
            <InlineEditor
              initialValue={node.name}
              onSave={handleRename}
              onCancel={onCancelEdit}
            />
          ) : (
            <span className={`truncate ${theme.text}`}>{node.name}</span>
          )}
        </div>
      </div>

      {node.type === "folder" && node.isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              isSelected={isSelected}
              isEditing={isEditing}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
              onContextMenu={onContextMenu}
              onRename={onRename}
              onCancelEdit={onCancelEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FileTreeNode;
