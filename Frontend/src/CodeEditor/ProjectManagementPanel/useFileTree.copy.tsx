import { useState, useEffect } from "react";
import { useCollaboration } from "../YJSCollaborationService.copy";
import type { FileNode } from "./file.types";
import { v4 as uuidv4 } from "uuid";

// Simplified File Tree Operations Hook using centralized YJS service
export const useFileTree = (initialFiles: FileNode[]) => {
  const [files, setFiles] = useState<FileNode[]>(initialFiles);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const collaborationService = useCollaboration();

  useEffect(() => {
    // Subscribe to connection changes
    const unsubscribeConnection = collaborationService.onConnectionChange(
      (connected) => {
        setIsConnected(connected);

        if (connected && !isInitialized) {
          // Wait a bit for initial sync, then check files
          setTimeout(() => {
            const currentFiles = collaborationService.getFileSystem();
            console.log("Files after connection:", currentFiles);

            if (currentFiles.length === 0) {
              console.log("No files found, setting initial files");
              collaborationService.setFileSystem(initialFiles);
            } else {
              console.log("Files already exist, using synced files");
              setFiles(currentFiles);
            }
            setIsInitialized(true);
          }, 500); // Wait for initial sync
        }
      }
    );

    // Subscribe to file system changes
    const unsubscribeFileSystem = collaborationService.onFileSystemChange(
      (newFiles) => setFiles(newFiles)
    );

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
  }, [initialFiles, collaborationService, isInitialized]);

  // Helper functions for tree operations
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

  const updateNode = (
    nodes: FileNode[],
    id: string,
    updates: Partial<FileNode>
  ): FileNode[] => {
    return nodes.map((node) => {
      if (node.id === id) {
        return { ...node, ...updates };
      }
      if (node.children) {
        return { ...node, children: updateNode(node.children, id, updates) };
      }
      return node;
    });
  };

  const deleteNode = (nodes: FileNode[], id: string): FileNode[] => {
    return nodes.filter((node) => {
      if (node.id === id) return false;
      if (node.children) {
        node.children = deleteNode(node.children, id);
      }
      return true;
    });
  };

  const addNode = (
    nodes: FileNode[],
    parentId: string | null,
    newNode: FileNode
  ): FileNode[] => {
    if (parentId === null) {
      return [...nodes, newNode];
    }

    return nodes.map((node) => {
      if (node.id === parentId) {
        return {
          ...node,
          children: [...(node.children || []), newNode],
          isExpanded: true,
        };
      }
      if (node.children) {
        return { ...node, children: addNode(node.children, parentId, newNode) };
      }
      return node;
    });
  };

  // Operations that sync with YJS
  const toggleExpanded = (id: string) => {
    const currentFiles = collaborationService.getFileSystem();
    const newFiles = updateNode(currentFiles, id, {
      isExpanded: !findNodeById(currentFiles, id)?.isExpanded,
    });
    collaborationService.setFileSystem(newFiles);
  };

  // Add path property to node creation functions
  const createFile = (
    parentId: string | null,
    name: string = "new-file.txt"
  ) => {
    // Build the path based on parent
    let path = name;
    if (parentId) {
      const parentNode = findNodeById(
        collaborationService.getFileSystem(),
        parentId
      );
      if (parentNode) {
        path = parentNode.path ? `${parentNode.path}/${name}` : name;
      }
    }

    const newFile: FileNode = {
      id: uuidv4(),
      name,
      type: "file",
      content: "",
      path: path, // Store complete path
    };

    const currentFiles = collaborationService.getFileSystem();
    const newFiles = addNode(currentFiles, parentId, newFile);
    collaborationService.setFileSystem(newFiles);

    // Initialize empty content for the new file
    collaborationService.initializeFileContent(newFile.id, "");

    return newFile;
  };

  const createFolder = (
    parentId: string | null,
    name: string = "new-folder"
  ) => {
    // Build the path based on parent
    let path = name;
    if (parentId) {
      const parentNode = findNodeById(
        collaborationService.getFileSystem(),
        parentId
      );
      if (parentNode) {
        path = parentNode.path ? `${parentNode.path}/${name}` : name;
      }
    }

    const newFolder: FileNode = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      type: "folder",
      children: [],
      isExpanded: false,
      path: path, // Store complete path
    };

    const currentFiles = collaborationService.getFileSystem();
    const newFiles = addNode(currentFiles, parentId, newFolder);
    collaborationService.setFileSystem(newFiles);

    return newFolder;
  };

  const renameNode = (id: string, newName: string) => {
    const currentFiles = collaborationService.getFileSystem();
    const newFiles = updateNode(currentFiles, id, { name: newName });
    collaborationService.setFileSystem(newFiles);
  };

  const removeNode = (id: string) => {
    const currentFiles = collaborationService.getFileSystem();
    const node = findNodeById(currentFiles, id);

    // If it's a file, clean up its content
    if (node?.type === "file") {
      collaborationService.deleteFileContent(id);
    }

    // Remove from file system
    const newFiles = deleteNode(currentFiles, id);
    collaborationService.setFileSystem(newFiles);
  };

  const updateFileContent = (id: string, content: string) => {
    // Update local state for immediate UI feedback
    const newFiles = updateNode(files, id, { content });
    setFiles(newFiles);

    // Content sync is handled by YJS automatically through the collaboration service
    // No need to manually sync content changes
  };

  // Update moveNode function to update paths
  const moveNode = (nodeId: string, targetId: string | null) => {
    const currentFiles = collaborationService.getFileSystem();

    // Helper function to find and remove a node from its parent
    const findAndRemoveNode = (nodes: FileNode[]): FileNode | null => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === nodeId) {
          // Remove node from current position
          const [removedNode] = nodes.splice(i, 1);
          return removedNode;
        }

        if (nodes[i].type === "folder" && nodes[i].children) {
          const result = findAndRemoveNode(nodes[i].children ?? []);
          if (result) return result;
        }
      }
      return null;
    };

    // Helper function to find target folder
    const findTargetFolder = (
      nodes: FileNode[],
      id: string
    ): FileNode | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        if (node.type === "folder" && node.children) {
          const found = findTargetFolder(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    // Clone the current files to avoid direct mutation
    const newFiles = JSON.parse(JSON.stringify(currentFiles));

    // Remove node from its current position
    const nodeToMove = findAndRemoveNode(newFiles);

    if (nodeToMove) {
      // Update path based on new parent
      if (targetId === null) {
        // Move to root level - path is just the name
        nodeToMove.path = nodeToMove.name;
        newFiles.push(nodeToMove);
      } else {
        // Find target folder and add node to its children
        const targetFolder = findTargetFolder(newFiles, targetId);
        if (targetFolder && targetFolder.type === "folder") {
          // Update path based on new parent
          nodeToMove.path = targetFolder.path
            ? `${targetFolder.path}/${nodeToMove.name}`
            : nodeToMove.name;

          if (!targetFolder.children) targetFolder.children = [];
          targetFolder.children.push(nodeToMove);
        }
      }

      // Update paths of all child nodes if this is a folder
      if (nodeToMove.type === "folder" && nodeToMove.children) {
        updateChildPaths(nodeToMove);
      }
    }

    // Sync with collaboration service
    collaborationService.setFileSystem(newFiles);
  };

  // New helper to recursively update paths of children
  const updateChildPaths = (node: FileNode) => {
    if (!node.children) return;

    node.children.forEach((child) => {
      // Update child path based on parent
      child.path = node.path ? `${node.path}/${child.name}` : child.name;

      // Recursively update children if this is a folder
      if (child.type === "folder" && child.children) {
        updateChildPaths(child);
      }
    });
  };

  // Add helper to fix paths in the entire tree
  const fixFilePaths = (
    nodes: FileNode[],
    parentPath: string = ""
  ): FileNode[] => {
    return nodes.map((node) => {
      // Update the path
      const nodePath = parentPath ? `${parentPath}/${node.name}` : node.name;

      // Copy the node with updated path
      const updatedNode = { ...node, path: nodePath };

      // Recursively update children if this is a folder
      if (node.type === "folder" && node.children) {
        updatedNode.children = fixFilePaths(node.children, nodePath);
      }

      return updatedNode;
    });
  };

  return {
    files,
    findNodeById,
    toggleExpanded,
    createFile,
    createFolder,
    renameNode,
    removeNode,
    updateFileContent,
    isConnected,
    moveNode,
  };
};

export default useFileTree;
