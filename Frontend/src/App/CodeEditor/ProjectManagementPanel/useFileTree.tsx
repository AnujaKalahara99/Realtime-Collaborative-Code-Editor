import { useEditorCollaboration } from "../../../Contexts/EditorContext";
import type { FileNode } from "./file.types";
import { v4 as uuidv4 } from "uuid";

export const useFileTree = () => {
  const { isConnected, files, updateFiles, initializeFileContent } =
    useEditorCollaboration();

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
    const newFile: FileNode = {
      id: uuidv4(),
      name,
      type: "file",
      content: "",
    };

    const newFiles = addNode(files, parentId, newFile);
    updateFiles(newFiles);
    initializeFileContent(newFile.id, "");

    return newFile;
  };

  const createFolder = (
    parentId: string | null,
    name: string = "new-folder"
  ) => {
    const newFolder: FileNode = {
      id: uuidv4(),
      name,
      type: "folder",
      children: [],
      isExpanded: false,
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
    // Remove the node from files
    const newFiles = deleteNode(files, id);
    updateFiles(newFiles);
  };

  const updateFileContent = (id: string, content: string) => {
    const newFiles = updateNode(files, id, { content });
    updateFiles(newFiles);
  };

  const moveNode = (nodeId: string, targetId: string | null) => {
    const newFiles = JSON.parse(JSON.stringify(files));

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
      newFiles.push(nodeToMove);
    } else {
      const targetFolder = findNodeById(newFiles, targetId);
      if (targetFolder && targetFolder.type === "folder") {
        if (!targetFolder.children) targetFolder.children = [];
        targetFolder.children.push(nodeToMove);
      }
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
