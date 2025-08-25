import { useState, useEffect, useCallback } from "react";
import { useCollaboration } from "../YJSCollaborationService.duplicate";
import type { FileNode } from "./file.types";
import { VFSStore } from "../../lib/vfs/vfs-store";
import { v4 as uuidv4 } from "uuid";

// Simplified File Tree Operations Hook with VFS integration
export const useFileTree = (initialFiles: FileNode[]) => {
  const [files, setFiles] = useState<FileNode[]>(initialFiles);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [vfsStore] = useState(() => new VFSStore());
  const collaborationService = useCollaboration();

  // Helper function to create VFS-compatible paths
  const createVFSPath = (name: string, parentPath: string = "/"): string => {
    return parentPath === "/" ? `/${name}` : `${parentPath}/${name}`;
  };

  // Sync FileNode structure to VFS
  const syncToVFS = useCallback(
    (nodes: FileNode[], parentPath = "/") => {
      nodes.forEach((node) => {
        const fullPath = createVFSPath(node.name, parentPath);

        try {
          if (node.type === "folder") {
            vfsStore.addDirectory(fullPath);
            if (node.children && node.children.length > 0) {
              syncToVFS(node.children, fullPath);
            }
          } else {
            vfsStore.addFile(fullPath, node.content || "");
          }
        } catch (error) {
          // Ignore if already exists
          console.debug(`VFS sync: ${fullPath} may already exist`);
        }
      });
    },
    [vfsStore]
  );

  // Initialize VFS with initial files
  useEffect(() => {
    if (initialFiles.length > 0 && !isInitialized) {
      syncToVFS(initialFiles);
    }
  }, [initialFiles, syncToVFS, isInitialized]);

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
              syncToVFS(initialFiles);
            } else {
              console.log("Files already exist, using synced files");
              setFiles(currentFiles);
              syncToVFS(currentFiles);
            }
            setIsInitialized(true);
          }, 500); // Wait for initial sync
        }
      }
    );

    // Subscribe to file system changes
    const unsubscribeFileSystem = collaborationService.onFileSystemChange(
      (newFiles) => {
        setFiles(newFiles);
        // Optionally sync changes back to VFS
        syncToVFS(newFiles);
      }
    );

    // Check if already connected
    if (collaborationService.isConnected()) {
      const currentFiles = collaborationService.getFileSystem();
      if (currentFiles.length > 0) {
        setFiles(currentFiles);
        syncToVFS(currentFiles);
        setIsInitialized(true);
      }
    }

    return () => {
      unsubscribeConnection();
      unsubscribeFileSystem();
    };
  }, [initialFiles, collaborationService, isInitialized, syncToVFS]);

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

  // Operations that sync with both VFS and YJS
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

    // Try to add to VFS as well
    try {
      const parentNode = parentId ? findNodeById(files, parentId) : null;
      const parentPath = parentNode ? "/" : "/"; // Simplified path logic
      const fullPath = createVFSPath(name, parentPath);
      vfsStore.addFile(fullPath, "");
    } catch (error) {
      console.debug("Could not add file to VFS:", error);
    }

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

    // Try to add to VFS as well
    try {
      const parentNode = parentId ? findNodeById(files, parentId) : null;
      const parentPath = parentNode ? "/" : "/"; // Simplified path logic
      const fullPath = createVFSPath(name, parentPath);
      vfsStore.addDirectory(fullPath);
    } catch (error) {
      console.debug("Could not add folder to VFS:", error);
    }

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

    // Try to update in VFS as well
    try {
      // This is a simplified approach - in a real implementation you'd need
      // to maintain a mapping between FileNode IDs and VFS paths
      const node = findNodeById(files, id);
      if (node) {
        // For now, we'll skip VFS content updates since path mapping is complex
        console.debug("File content updated:", id, content.length);
      }
    } catch (error) {
      console.debug("Could not update file content in VFS:", error);
    }

    // Content sync is handled by YJS automatically through the collaboration service
    // No need to manually sync content changes
  };

  // VFS-specific methods
  const getVFSStore = () => vfsStore;

  const getFileFromVFS = (path: string) => {
    try {
      return vfsStore.getFile(path);
    } catch (error) {
      console.debug("Could not get file from VFS:", error);
      return null;
    }
  };

  const addFileToVFS = (path: string, content: string) => {
    try {
      return vfsStore.addFile(path, content);
    } catch (error) {
      console.debug("Could not add file to VFS:", error);
      return null;
    }
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
    // VFS integration methods
    getVFSStore,
    getFileFromVFS,
    addFileToVFS,
  };
};

export default useFileTree;
