import { VFSStore } from "./vfs-store";
import type { VFSChangeEvent } from "./types";
import type { FileNode } from "../../App/CodeEditor/ProjectManagementPanel/file.types";

export class VFSBridge {
  private vfsStore: VFSStore;
  private idToPathMap: Map<string, string> = new Map();
  private pathToIdMap: Map<string, string> = new Map();
  private listeners: ((fileTree: FileNode[]) => void)[] = [];
  private isUpdatingFromVFS = false;

  constructor() {
    this.vfsStore = new VFSStore();
    this.setupVFSListener();
  }

  private setupVFSListener() {
    this.vfsStore.on((_: VFSChangeEvent) => {
      if (this.isUpdatingFromVFS) return; // Prevent circular updates

      // Notify listeners about VFS changes
      this.notifyListeners();
    });
  }

  /**
   * Generate path from file tree structure
   */
  private generatePath(node: FileNode, parentPath: string = ""): string {
    if (parentPath === "") return `/${node.name}`;
    return `${parentPath}/${node.name}`;
  }

  //    * Recursively build path mappings from file tree

  private buildPathMappings(nodes: FileNode[], parentPath: string = "") {
    nodes.forEach((node) => {
      const path = this.generatePath(node, parentPath);
      this.idToPathMap.set(node.id, path);
      this.pathToIdMap.set(path, node.id);

      if (node.children) {
        this.buildPathMappings(node.children, path);
      }
    });
  }

  // Sync file tree to VFS

  syncToVFS(fileTree: FileNode[]) {
    this.isUpdatingFromVFS = true;

    // Clear existing mappings
    this.idToPathMap.clear();
    this.pathToIdMap.clear();

    // Build new mappings
    this.buildPathMappings(fileTree);

    // Clear VFS and rebuild
    const currentEntries = this.vfsStore.getAllEntries();
    currentEntries.forEach((_, path) => {
      if (path !== "/") {
        this.vfsStore.deleteEntry(path);
      }
    });

    // Add all nodes to VFS
    this.addNodesToVFS(fileTree);

    this.isUpdatingFromVFS = false;
  }

  private addNodesToVFS(nodes: FileNode[], parentPath: string = "") {
    nodes.forEach((node) => {
      const path = this.generatePath(node, parentPath);

      if (node.type === "folder") {
        this.vfsStore.addFolder(path);
        if (node.children) {
          this.addNodesToVFS(node.children, path);
        }
      } else {
        this.vfsStore.addFile(path, node.content || "");
      }
    });
  }

  /**
   * Handle file tree operations and sync to VFS
   */
  createFile(
    parentId: string | null,
    name: string,
    content: string = ""
  ): string {
    const parentPath = parentId ? this.idToPathMap.get(parentId) || "" : "";
    const path = parentPath === "" ? `/${name}` : `${parentPath}/${name}`;

    this.vfsStore.addFile(path, content);
    return path;
  }

  createFolder(parentId: string | null, name: string): string {
    const parentPath = parentId ? this.idToPathMap.get(parentId) || "" : "";
    const path = parentPath === "" ? `/${name}` : `${parentPath}/${name}`;

    this.vfsStore.addFolder(path);
    return path;
  }

  updateFileContent(id: string, content: string): boolean {
    const path = this.idToPathMap.get(id);
    if (!path) return false;

    this.vfsStore.updateFile(path, content);
    return true;
  }

  renameNode(id: string, newName: string): boolean {
    const oldPath = this.idToPathMap.get(id);
    if (!oldPath) return false;

    const parentPath = oldPath.substring(0, oldPath.lastIndexOf("/")) || "/";
    const newPath =
      parentPath === "/" ? `/${newName}` : `${parentPath}/${newName}`;

    const result = this.vfsStore.renameEntry(oldPath, newPath);
    if (result) {
      // Update mappings for the renamed entry
      this.idToPathMap.set(id, newPath);
      this.pathToIdMap.delete(oldPath);
      this.pathToIdMap.set(newPath, id);

      // If it's a folder, update all child mappings recursively
      const entry = this.vfsStore.getEntry(newPath);
      if (entry && entry.type === "folder") {
        this.updateChildMappingsAfterRename(oldPath, newPath);
      }
    }

    return !!result;
  }

  private updateChildMappingsAfterRename(
    oldParentPath: string,
    newParentPath: string
  ) {
    // Get all mappings that start with the old parent path
    const childMappings: [string, string][] = [];

    for (const [id, path] of this.idToPathMap.entries()) {
      if (path.startsWith(oldParentPath + "/")) {
        childMappings.push([id, path]);
      }
    }

    // Update each child mapping
    for (const [childId, oldChildPath] of childMappings) {
      const relativePath = oldChildPath.substring(oldParentPath.length);
      const newChildPath = newParentPath + relativePath;

      // Update mappings
      this.idToPathMap.set(childId, newChildPath);
      this.pathToIdMap.delete(oldChildPath);
      this.pathToIdMap.set(newChildPath, childId);
    }
  }

  deleteNode(id: string): boolean {
    const path = this.idToPathMap.get(id);
    if (!path) return false;

    // Get entry to check if it's a folder
    const entry = this.vfsStore.getEntry(path);

    const result = this.vfsStore.deleteEntry(path);
    if (result) {
      // Clean up main mapping
      this.idToPathMap.delete(id);
      this.pathToIdMap.delete(path);

      // If it was a folder, clean up all child mappings
      if (entry && entry.type === "folder") {
        this.cleanupChildMappingsAfterDelete(path);
      }
    }

    return result;
  }

  private cleanupChildMappingsAfterDelete(deletedFolderPath: string) {
    // Get all mappings that start with the deleted folder path
    const childMappings: [string, string][] = [];

    for (const [id, path] of this.idToPathMap.entries()) {
      if (path.startsWith(deletedFolderPath + "/")) {
        childMappings.push([id, path]);
      }
    }

    // Remove each child mapping
    for (const [childId, childPath] of childMappings) {
      this.idToPathMap.delete(childId);
      this.pathToIdMap.delete(childPath);
    }
  }

  getFileContent(id: string): string | undefined {
    const path = this.idToPathMap.get(id);
    if (!path) return undefined;

    const file = this.vfsStore.getFile(path);
    return file?.content;
  }

  onVFSChange(listener: (fileTree: FileNode[]) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners() {
    // Convert VFS tree back to FileNode format
    const vfsTree = this.vfsStore.getTree("/");
    if (vfsTree) {
      const fileTree = this.convertVFSToFileTree(vfsTree);
      this.listeners.forEach((listener) =>
        listener(fileTree ? [fileTree] : [])
      );
    }
  }

  private convertVFSToFileTree(vfsEntry: any): FileNode | null {
    const id = this.pathToIdMap.get(vfsEntry.path) || vfsEntry.id;

    if (vfsEntry.type === "folder") {
      return {
        id,
        name: vfsEntry.name,
        type: "folder",
        children:
          vfsEntry.children
            ?.map((child: any) => this.convertVFSToFileTree(child))
            .filter(Boolean) || [],
        isExpanded: vfsEntry.isExpanded,
      };
    } else {
      return {
        id,
        name: vfsEntry.name,
        type: "file",
        content: vfsEntry.content,
      };
    }
  }

  getVFSStore(): VFSStore {
    return this.vfsStore;
  }

  getPathById(id: string): string | undefined {
    return this.idToPathMap.get(id);
  }

  getIdByPath(path: string): string | undefined {
    return this.pathToIdMap.get(path);
  }
}
