import { useState, useEffect, useCallback, useRef } from "react";
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
  const fileContentListeners = useRef<Map<string, () => void>>(new Map());

  // Helper function to create VFS-compatible paths
  const createVFSPath = (name: string, parentPath: string = "/"): string => {
    return parentPath === "/" ? `/${name}` : `${parentPath}/${name}`;
  };

  // Helper function to get VFS path for a FileNode
  const getVFSPathForNode = useCallback(
    (nodeId: string, nodes: FileNode[] = files): string | null => {
      const findNodePath = (
        nodes: FileNode[],
        targetId: string,
        currentPath = ""
      ): string | null => {
        for (const node of nodes) {
          const nodePath =
            currentPath === "" ? node.name : `${currentPath}/${node.name}`;

          if (node.id === targetId) {
            return `/${nodePath}`;
          }

          if (node.children) {
            const childPath = findNodePath(node.children, targetId, nodePath);
            if (childPath) return childPath;
          }
        }
        return null;
      };

      return findNodePath(nodes, nodeId);
    },
    [files]
  );

  // Setup file content synchronization between YJS and VFS
  const setupFileContentSync = useCallback(
    (fileNode: FileNode) => {
      if (fileNode.type !== "file") return;

      // Clean up existing listener if any
      const existingUnsubscribe = fileContentListeners.current.get(fileNode.id);
      if (existingUnsubscribe) {
        existingUnsubscribe();
      }

      // Set up new listener for file content changes from YJS
      const unsubscribe = collaborationService.onFileContentChange(
        fileNode.id,
        (content: string) => {
          // Update VFS when content changes in YJS
          const vfsPath = getVFSPathForNode(fileNode.id);
          if (vfsPath) {
            try {
              vfsStore.updateFile(vfsPath, content);
            } catch (error) {
              console.debug("Could not update VFS file content:", error);
            }
          }

          // Update local file tree state
          setFiles((currentFiles) =>
            updateNode(currentFiles, fileNode.id, { content })
          );
        }
      );

      fileContentListeners.current.set(fileNode.id, unsubscribe);
    },
    [collaborationService, getVFSPathForNode, vfsStore]
  );

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
            // Set up content synchronization for files
            setupFileContentSync(node);
          }
        } catch (error) {
          // Ignore if already exists
          console.debug(`VFS sync: ${fullPath} may already exist`);
          // Still set up content sync for existing files
          if (node.type === "file") {
            setupFileContentSync(node);
          }
        }
      });
    },
    [vfsStore, setupFileContentSync]
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

      // Clean up all file content listeners
      fileContentListeners.current.forEach((unsubscribe) => unsubscribe());
      fileContentListeners.current.clear();
    };
  }, [initialFiles, collaborationService, isInitialized, syncToVFS]);

  // Cleanup effect for component unmount
  useEffect(() => {
    return () => {
      // Clean up all file content listeners on unmount
      fileContentListeners.current.forEach((unsubscribe) => unsubscribe());
      fileContentListeners.current.clear();
    };
  }, []);

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
      const parentPath =
        parentNode && parentId ? getVFSPathForNode(parentId) || "/" : "/";
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

    // Set up content synchronization for the new file
    setupFileContentSync(newFile);

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
      const parentPath =
        parentNode && parentId ? getVFSPathForNode(parentId) || "/" : "/";
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
    const node = findNodeById(currentFiles, id);

    if (node) {
      const oldVfsPath = getVFSPathForNode(id);

      // Update the file system first
      const newFiles = updateNode(currentFiles, id, { name: newName });
      collaborationService.setFileSystem(newFiles);

      // Update VFS path if we can find the old one
      if (oldVfsPath) {
        try {
          const newVfsPath = oldVfsPath.replace(`/${node.name}`, `/${newName}`);
          vfsStore.renameEntry(oldVfsPath, newVfsPath);
        } catch (error) {
          console.debug("Could not rename in VFS:", error);
        }
      }
    } else {
      // Fallback to just updating the file system
      const newFiles = updateNode(currentFiles, id, { name: newName });
      collaborationService.setFileSystem(newFiles);
    }
  };

  const removeNode = (id: string) => {
    const currentFiles = collaborationService.getFileSystem();
    const node = findNodeById(currentFiles, id);

    if (node) {
      // Remove from VFS
      const vfsPath = getVFSPathForNode(id);
      if (vfsPath) {
        try {
          vfsStore.deleteEntry(vfsPath);
        } catch (error) {
          console.debug("Could not remove from VFS:", error);
        }
      }

      // Clean up content listeners if it's a file
      if (node.type === "file") {
        const unsubscribe = fileContentListeners.current.get(id);
        if (unsubscribe) {
          unsubscribe();
          fileContentListeners.current.delete(id);
        }
        collaborationService.deleteFileContent(id);
      }

      // If it's a folder, clean up all children listeners recursively
      if (node.type === "folder" && node.children) {
        const cleanupChildren = (children: FileNode[]) => {
          children.forEach((child) => {
            if (child.type === "file") {
              const unsubscribe = fileContentListeners.current.get(child.id);
              if (unsubscribe) {
                unsubscribe();
                fileContentListeners.current.delete(child.id);
              }
            } else if (child.children) {
              cleanupChildren(child.children);
            }
          });
        };
        cleanupChildren(node.children);
      }
    }

    // Remove from file system
    const newFiles = deleteNode(currentFiles, id);
    collaborationService.setFileSystem(newFiles);
  };

  const updateFileContent = (id: string, content: string) => {
    // Update local state for immediate UI feedback
    const newFiles = updateNode(files, id, { content });
    setFiles(newFiles);

    // Update in VFS as well
    const vfsPath = getVFSPathForNode(id);
    if (vfsPath) {
      try {
        vfsStore.updateFile(vfsPath, content);
      } catch (error) {
        console.debug("Could not update file content in VFS:", error);
      }
    }

    // Content sync is handled by YJS automatically through the collaboration service
    // The YJS content changes will be synced back to VFS through our content listeners
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

  // Method to manually sync VFS content to YJS (if needed)
  const syncVFSContentToYJS = (nodeId: string, content: string) => {
    try {
      collaborationService.initializeFileContent(nodeId, content);
      return true;
    } catch (error) {
      console.debug("Could not sync VFS content to YJS:", error);
      return false;
    }
  };

  // Method to get current VFS content for a file
  const getVFSFileContent = (nodeId: string): string | null => {
    const vfsPath = getVFSPathForNode(nodeId);
    if (vfsPath) {
      const file = getFileFromVFS(vfsPath);
      return file?.content || null;
    }
    return null;
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
    syncVFSContentToYJS,
    getVFSFileContent,
    // VFS path utilities
    getVFSPathForNode,
  };
};

export default useFileTree;
