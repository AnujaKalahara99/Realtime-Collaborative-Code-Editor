import { useState } from "react";
import type { ContextMenuData, FileNode } from "./file.types";
import useFileTree from "./useFileTree";
import FileTreeNode from "./FileTreeNode";
import ExplorerHeader from "./ExplorerHeader";
import ContextMenu from "./ContextMenu";
import { useTheme } from "../../ThemeProvider";

const ProjectManagementPanel = ({
  onFileSelect,
}: {
  onFileSelect?: (file: FileNode) => void;
}) => {
  console.log("ProjectManagementPanel rendered");

  const { theme } = useTheme();

  // Initial mock data
  const initialFiles: FileNode[] = [];

  // File tree operations
  const {
    files,
    findNodeById,
    toggleExpanded,
    createFile,
    createFolder,
    renameNode,
    removeNode,
  } = useFileTree(initialFiles);

  // UI state - Initialize selectedFile from sessionStorage
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuData | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);

  // Event handlers
  const handleFileSelect = (node: FileNode) => {
    if (node.type === "file") {
      setSelectedFile(node.id);
      onFileSelect?.(node);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, nodeId });
  };

  const handleCreateFile = (parentId: string | null = null) => {
    const newFile = createFile(parentId);
    setEditingNode(newFile.id);
    setContextMenu(null);
  };

  const handleCreateFolder = (parentId: string | null = null) => {
    const newFolder = createFolder(parentId);
    setEditingNode(newFolder.id);
    setContextMenu(null);
  };

  const handleRename = (nodeId: string) => {
    setEditingNode(nodeId);
    setContextMenu(null);
  };

  const handleDelete = (nodeId: string) => {
    removeNode(nodeId);
    if (selectedFile === nodeId) {
      setSelectedFile(null);
    }
    setContextMenu(null);
  };

  const handleNodeRename = (id: string, newName: string) => {
    renameNode(id, newName);
    setEditingNode(null);
  };

  const handleCancelEdit = () => {
    setEditingNode(null);
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  // Render file tree
  const renderFileTree = (
    nodes: FileNode[],
    level: number = 0
  ): React.ReactNode => {
    return nodes.map((node) => (
      <FileTreeNode
        key={node.id}
        node={node}
        level={level}
        isSelected={selectedFile === node.id}
        isEditing={editingNode === node.id}
        onSelect={handleFileSelect}
        onToggleExpand={toggleExpanded}
        onContextMenu={handleContextMenu}
        onRename={handleNodeRename}
        onCancelEdit={handleCancelEdit}
      />
    ));
  };

  return (
    <>
      <div className={`h-full ${theme.surface} ${theme.text} flex flex-col`}>
        <ExplorerHeader
          onCreateFile={() => handleCreateFile(null)}
          onCreateFolder={() => handleCreateFolder(null)}
        />

        <div className="flex-1 overflow-y-auto">{renderFileTree(files)}</div>
      </div>

      {contextMenu && (
        <ContextMenu
          contextMenu={contextMenu}
          onClose={closeContextMenu}
          onCreateFile={() => handleCreateFile(contextMenu.nodeId)}
          onCreateFolder={() => handleCreateFolder(contextMenu.nodeId)}
          onRename={() => handleRename(contextMenu.nodeId)}
          onDelete={() => handleDelete(contextMenu.nodeId)}
        />
      )}
    </>
  );
};

export default ProjectManagementPanel;
