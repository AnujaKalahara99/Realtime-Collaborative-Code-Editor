import { useState, useEffect } from "react";
import { useCollaboration } from "../YJSCollaborationService";
import type { FileNode } from "./file.types";
import { v4 as uuidv4 } from "uuid";

export const useFileTree = (initialFiles: FileNode[]) => {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const collaborationService = useCollaboration();

  // Initialize and subscribe to collaboration service
  useEffect(() => {
    const unsubscribeConnection = collaborationService.onConnectionChange(
      (connected) => {
        setIsConnected(connected);

        if (connected && !isInitialized) {
          const currentFiles = collaborationService.getFileSystem();
          setFiles(currentFiles);
          setIsInitialized(true);
        }
      }
    );

    const unsubscribeFileSystem =
      collaborationService.onFileSystemChange(setFiles);

    // Check if already connected
    if (collaborationService.isConnected()) {
      const currentFiles = collaborationService.getFileSystem();
      if (currentFiles.length > 0) {
        setFiles(currentFiles);
        setIsInitialized(true);
      }
    }

    return () => {
      unsubscribeConnection();
      unsubscribeFileSystem();
    };
  }, [collaborationService]);

  // Helper to update both local state and collaboration service
  const updateFiles = (newFiles: FileNode[]) => {
    console.log("Updating files:", newFiles);
    setFiles(newFiles);
    collaborationService.setFileSystem(newFiles);
  };

  // Tree traversal helpers
  const findNodeById = (nodes: FileNode[], id: string): FileNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Tree modification helpers
  const updateNode = (
    nodes: FileNode[],
    id: string,
    updates: Partial<FileNode>
  ): FileNode[] => {
    return nodes.map((node) => {
      if (node.id === id) return { ...node, ...updates };
      if (node.children)
        return { ...node, children: updateNode(node.children, id, updates) };
      return node;
    });
  };

  const deleteNode = (nodes: FileNode[], id: string): FileNode[] => {
    return nodes.filter((node) => {
      if (node.id === id) return false;
      if (node.children) node.children = deleteNode(node.children, id);
      return true;
    });
  };

  const addNode = (
    nodes: FileNode[],
    parentId: string | null,
    newNode: FileNode
  ): FileNode[] => {
    console.log("Adding node:", newNode);
    if (parentId === null) return [...nodes, newNode];

    return nodes.map((node) => {
      if (node.id === parentId) {
        return {
          ...node,
          children: [...(node.children || []), newNode],
          isExpanded: true,
        };
      }
      if (node.children)
        return { ...node, children: addNode(node.children, parentId, newNode) };
      return node;
    });
  };

  // Path management
  const getNodePath = (parentId: string | null, name: string): string => {
    if (!parentId) return name;

    const parentNode = findNodeById(
      collaborationService.getFileSystem(),
      parentId
    );
    return parentNode?.path ? `${parentNode.path}/${name}` : name;
  };

  const updateChildPaths = (node: FileNode) => {
    if (!node.children) return;

    node.children.forEach((child) => {
      child.path = node.path ? `${node.path}/${child.name}` : child.name;
      if (child.type === "folder" && child.children) updateChildPaths(child);
    });
  };

  // File tree operations
  const toggleExpanded = (id: string) => {
    const node = findNodeById(files, id);
    if (!node) return;

    const newFiles = updateNode(files, id, {
      isExpanded: !node.isExpanded,
    });
    updateFiles(newFiles);
  };

  const createFile = (
    parentId: string | null,
    name: string = "new-file.txt"
  ) => {
    const path = getNodePath(parentId, name);
    const newFile: FileNode = {
      id: uuidv4(),
      name,
      type: "file",
      content: "",
      path,
    };

    const newFiles = addNode(files, parentId, newFile);
    updateFiles(newFiles);
    collaborationService.initializeFileContent(newFile.id, "");

    return newFile;
  };

  const createFolder = (
    parentId: string | null,
    name: string = "new-folder"
  ) => {
    const path = getNodePath(parentId, name);
    const newFolder: FileNode = {
      id: uuidv4(),
      name,
      type: "folder",
      children: [],
      isExpanded: false,
      path,
    };

    const newFiles = addNode(files, parentId, newFolder);
    updateFiles(newFiles);

    return newFolder;
  };

  const renameNode = (id: string, newName: string) => {
    const newFiles = updateNode(files, id, { name: newName });
    updateFiles(newFiles);
  };

  const removeNode = (id: string) => {
    const node = findNodeById(files, id);

    if (node?.type === "file") {
      collaborationService.deleteFileContent(id);
    }

    const newFiles = deleteNode(files, id);
    updateFiles(newFiles);
  };

  const updateFileContent = (id: string, content: string) => {
    const newFiles = updateNode(files, id, { content });
    updateFiles(newFiles);
  };

  const moveNode = (nodeId: string, targetId: string | null) => {
    const newFiles = JSON.parse(JSON.stringify(files));

    // Find and remove node from current position
    const findAndRemoveNode = (nodes: FileNode[]): FileNode | null => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === nodeId) {
          return nodes.splice(i, 1)[0];
        }
        if (nodes[i].children) {
          const result = findAndRemoveNode(nodes[i].children || []);
          if (result) return result;
        }
      }
      return null;
    };

    const nodeToMove = findAndRemoveNode(newFiles);
    if (!nodeToMove) return;

    if (targetId === null) {
      // Move to root
      nodeToMove.path = nodeToMove.name;
      newFiles.push(nodeToMove);
    } else {
      // Move to target folder
      const targetFolder = findNodeById(newFiles, targetId);
      if (targetFolder && targetFolder.type === "folder") {
        nodeToMove.path = targetFolder.path
          ? `${targetFolder.path}/${nodeToMove.name}`
          : nodeToMove.name;

        if (!targetFolder.children) targetFolder.children = [];
        targetFolder.children.push(nodeToMove);
      }
    }

    // Update child paths recursively
    if (nodeToMove.type === "folder" && nodeToMove.children) {
      updateChildPaths(nodeToMove);
    }

    updateFiles(newFiles);
  };

  return {
    files,
    isConnected,
    findNodeById,
    toggleExpanded,
    createFile,
    createFolder,
    renameNode,
    removeNode,
    updateFileContent,
    moveNode,
  };
};

export default useFileTree;
