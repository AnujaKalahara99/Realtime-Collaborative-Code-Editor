import { useState } from "react";
import type { ContextMenuData, FileNode } from "./file.types";
import useFileTree from "./useFileTree";
import FileTreeNode from "./FileTreeNode";
import ExplorerHeader from "./ExplorerHeader";
import ContextMenu from "./ContextMenu";
import { useTheme } from "../../../Contexts/ThemeProvider";
import InlineEditor from "./InlineEditor";
import FileIcon from "./FileIcon";

const ProjectManagementPanel = ({
  onFileSelect,
}: {
  onFileSelect?: (file: FileNode) => void;
}) => {
  const { theme } = useTheme();

  const {
    files,
    // findNodeById,
    toggleExpanded,
    createFile,
    createFolder,
    renameNode,
    removeNode,
    moveNode,
  } = useFileTree();

  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuData | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [creatingItem, setCreatingItem] = useState<{
    type: "file" | "folder";
    parentId: string | null;
    level: number;
  } | null>(null);

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
    // Find the level for proper indentation
    const level = parentId ? getNodeLevel(parentId, files) + 1 : 0;
    setCreatingItem({ type: "file", parentId, level });
    setContextMenu(null);
  };

  const handleCreateFolder = (parentId: string | null = null) => {
    // Find the level for proper indentation
    const level = parentId ? getNodeLevel(parentId, files) + 1 : 0;
    setCreatingItem({ type: "folder", parentId, level });
    setContextMenu(null);
  };

  const handleConfirmCreate = (name: string) => {
    if (creatingItem && name.trim()) {
      if (creatingItem.type === "file") {
        console.log("Creating file:", name.trim());

        createFile(creatingItem.parentId, name.trim());
      } else {
        console.log("Creating folder:", name.trim());

        createFolder(creatingItem.parentId, name.trim());
      }
    }
    setCreatingItem(null);
  };

  const handleCancelCreate = () => {
    setCreatingItem(null);
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

  const handleMoveNode = (nodeId: string, targetId: string | null) => {
    moveNode(nodeId, targetId);
  };

  // Add drop handler for root level drops
  const handleRootDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const nodeId = e.dataTransfer.getData("nodeId");
    if (nodeId) {
      moveNode(nodeId, null);
    }
  };

  // Helper function to find node level
  const getNodeLevel = (
    nodeId: string,
    nodes: FileNode[],
    currentLevel: number = 0
  ): number => {
    for (const node of nodes) {
      if (node.id === nodeId) {
        return currentLevel;
      }
      if (node.children) {
        const found = getNodeLevel(nodeId, node.children, currentLevel + 1);
        if (found !== -1) return found;
      }
    }
    return -1;
  };

  // Component for creating new items inline
  const CreateItemInline = ({
    type,
    parentId,
    level,
  }: {
    type: "file" | "folder";
    parentId: string | null;
    level: number;
  }) => {
    const tempNode: FileNode = {
      id: "temp-create",
      name: "",
      type,
      isExpanded: false,
      children: type === "folder" ? [] : undefined,
    };

    return (
      <div
        className={`flex items-center py-1 px-2 text-sm select-none ${theme.hover}`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        <div className="flex items-center flex-1 min-w-0">
          <span className={`mr-2 flex-shrink-0 ${theme.textMuted}`}>
            <FileIcon node={tempNode} />
          </span>
          <InlineEditor
            initialValue=""
            onSave={handleConfirmCreate}
            onCancel={handleCancelCreate}
            // placeholder={`New ${type} name...`}
          />
        </div>
      </div>
    );
  };

  // Render file tree
  const renderFileTree = (
    nodes: FileNode[],
    level: number = 0,
    parentId: string | null = null
  ): React.ReactNode => {
    const elements: React.ReactNode[] = [];

    // Add existing nodes
    nodes
      .sort((a, b) => a.id.localeCompare(b.id))
      .forEach((node) => {
        elements.push(
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
            onMoveNode={handleMoveNode}
          />
        );

        // Add create item inline if it belongs to this expanded folder
        if (
          node.type === "folder" &&
          node.isExpanded &&
          creatingItem &&
          creatingItem.parentId === node.id
        ) {
          elements.push(
            <CreateItemInline
              key="creating-item"
              type={creatingItem.type}
              parentId={creatingItem.parentId}
              level={level + 1}
            />
          );
        }
      });

    // Add create item at root level
    if (creatingItem && creatingItem.parentId === parentId) {
      elements.push(
        <CreateItemInline
          key="creating-item"
          type={creatingItem.type}
          parentId={creatingItem.parentId}
          level={level}
        />
      );
    }

    return elements;
  };

  return (
    <>
      <div className={`h-full ${theme.surface} ${theme.text} flex flex-col`}>
        <ExplorerHeader
          onCreateFile={() => handleCreateFile(null)}
          onCreateFolder={() => handleCreateFolder(null)}
        />

        {/* <div
          className="flex-1 overflow-y-auto"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleRootDrop}
        >
          {renderFileTree(files)}
        </div> */}
        <div
          className="flex-1 overflow-y-auto"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleRootDrop}
        >
          {files.length === 0 ? (
            <div
              className={`flex items-center justify-center py-10 p-4 ${theme.textMuted} text-sm`}
            >
              Give a little time to load
              <br /> Or create a new file or folder.
            </div>
          ) : (
            renderFileTree(files)
          )}
        </div>
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
