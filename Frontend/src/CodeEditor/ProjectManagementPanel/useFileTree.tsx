import { useState } from "react";
import type { FileNode } from "./commonFileTypes";

const useFileTree = (initialFiles: FileNode[]) => {
  const [files, setFiles] = useState<FileNode[]>(initialFiles);

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

  const toggleExpanded = (id: string) => {
    setFiles((prev) =>
      updateNode(prev, id, { isExpanded: !findNodeById(prev, id)?.isExpanded })
    );
  };

  const createFile = (
    parentId: string | null,
    name: string = "new-file.txt"
  ) => {
    const newFile: FileNode = {
      id: Date.now().toString(),
      name,
      type: "file",
      content: "",
    };
    setFiles((prev) => addNode(prev, parentId, newFile));
    return newFile;
  };

  const createFolder = (
    parentId: string | null,
    name: string = "new-folder"
  ) => {
    const newFolder: FileNode = {
      id: Date.now().toString(),
      name,
      type: "folder",
      children: [],
      isExpanded: false,
    };
    setFiles((prev) => addNode(prev, parentId, newFolder));
    return newFolder;
  };

  const renameNode = (id: string, newName: string) => {
    setFiles((prev) => updateNode(prev, id, { name: newName }));
  };

  const removeNode = (id: string) => {
    setFiles((prev) => deleteNode(prev, id));
  };

  return {
    files,
    findNodeById,
    toggleExpanded,
    createFile,
    createFolder,
    renameNode,
    removeNode,
  };
};

export default useFileTree;
