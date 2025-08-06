import { useState, useEffect, useCallback } from "react";
import { collaborationService } from "../YJSCollaborationService";
import type { FileNode } from "./file.types";
import { v4 as uuidv4 } from "uuid";

// Simplified File Tree Operations Hook using centralized YJS service
export const useFileTree = (initialFiles: FileNode[]) => {
  const [files, setFiles] = useState<FileNode[]>(initialFiles);
  const [isConnected, setIsConnected] = useState(false);

  const handleFileSystemChange = useCallback((newFiles: FileNode[]) => {
    setFiles((prevFiles) => {
      // Only update if files actually changed
      if (JSON.stringify(prevFiles) !== JSON.stringify(newFiles)) {
        return newFiles;
      }
      return prevFiles;
    });
  }, []);

  useEffect(() => {
    // Subscribe to connection changes
    const unsubscribeConnection =
      collaborationService.onConnectionChange(setIsConnected);

    // Subscribe to file system changes
    const unsubscribeFileSystem = collaborationService.onFileSystemChange(
      // (newFiles) => {
      //   setFiles(newFiles);
      // }
      handleFileSystemChange
    );

    // Initialize file system if empty
    const currentFiles = collaborationService.getFileSystem();
    if (currentFiles.length === 0) {
      collaborationService.setFileSystem(initialFiles);
    }

    return () => {
      unsubscribeConnection();
      unsubscribeFileSystem();
    };
  }, [initialFiles]);

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

  const createFile = (
    parentId: string | null,
    name: string = "new-file.txt"
  ) => {
    const newFile: FileNode = {
      id: uuidv4(),
      name,
      type: "file",
      content: "",
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
    const newFolder: FileNode = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      type: "folder",
      children: [],
      isExpanded: false,
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
  };
};

export default useFileTree;
