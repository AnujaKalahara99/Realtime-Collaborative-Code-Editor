import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useTheme } from "../../ThemeProvider";
import type { FileNode } from "./file.types";
import FileIcon from "./FileIcon";
import InlineEditor from "./InlineEditor";

interface FileTreeNodeProps {
  node: FileNode;
  level: number;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: (node: FileNode) => void;
  onToggleExpand: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, nodeId: string) => void;
  onRename: (id: string, newName: string) => void;
  onCancelEdit: () => void;
  onMoveNode: (nodeId: string, targetId: string | null) => void;
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
  onMoveNode,
}: FileTreeNodeProps) => {
  const { theme } = useTheme();
  const [isDragOver, setIsDragOver] = useState(false);

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

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.setData("nodeId", node.id);
    e.dataTransfer.effectAllowed = "move";

    // Create an invisible clone for the drag image
    const dragElement = e.currentTarget.cloneNode(true) as HTMLElement;
    dragElement.style.position = "absolute";
    dragElement.style.top = "-1000px";
    dragElement.style.opacity = "1";
    dragElement.style.background = "#aaaaaa55";
    document.body.appendChild(dragElement);

    e.dataTransfer.setDragImage(dragElement, 0, 0);

    requestAnimationFrame(() => {
      document.body.removeChild(dragElement);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only allow dropping on folders or the root
    if (node.type === "folder") {
      e.dataTransfer.dropEffect = "move";
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (node.type === "folder") {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const nodeId = e.dataTransfer.getData("nodeId");

    // Don't allow dropping onto itself
    if (nodeId === node.id) {
      return;
    }

    // Move the node to the target folder
    if (node.type === "folder") {
      onMoveNode(nodeId, node.id);

      // Auto-expand folder when dropping into it
      if (!node.isExpanded) {
        onToggleExpand(node.id);
      }
    }
  };

  return (
    <div>
      <div
        className={`flex items-center py-1 px-2 cursor-pointer text-sm select-none ${
          isSelected ? theme.active : isDragOver ? theme.hover : theme.hover
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
        onContextMenu={(e) => onContextMenu(e, node.id)}
        draggable={!isEditing}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
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
              onMoveNode={onMoveNode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FileTreeNode;
