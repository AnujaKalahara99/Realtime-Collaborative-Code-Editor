import type {
  VFSEntry,
  VFSFile,
  VFSFolder,
  VFSTreeFolder,
  VFSChangeEvent,
} from "./types";
const EXCLUDED_FILES = [".env", ".gitignore", ".ssh", "node_modules"];

export class VFSStore {
  private entries: Map<string, VFSEntry> = new Map();
  private listeners: ((event: VFSChangeEvent) => void)[] = [];

  constructor() {
    // start with root folder
    this.addFolder("/");
  }

  private isExcluded(path: string): boolean {
    const parts = path.split("/").filter(Boolean);
    return parts.some((part) => EXCLUDED_FILES.includes(part));
  }

  on(listener: (event: VFSChangeEvent) => void) {
    this.listeners.push(listener);
  }

  off(listener: (event: VFSChangeEvent) => void) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private emitChange(event: VFSChangeEvent) {
    this.listeners.forEach((listener) => listener(event));
  }

  addFile(path: string, content: string): VFSFile | null {
    if (this.isExcluded(path)) {
      console.warn(`Attempted to add excluded file: ${path}`);
      return null;
    }
    if (this.entries.has(path)) {
      console.warn(`File already exists: ${path}. Use updateFile instead.`);
      return this.updateFile(path, content);
    }

    const name = path.split("/").pop() || "";
    const parentPath = path.substring(0, path.lastIndexOf("/")) || "/";
    const parent = this.entries.get(parentPath) as VFSFolder;

    if (!parent || parent.type !== "folder") {
      console.error(
        `Parent folder not found or not a folder for path: ${path}`
      );
      return null;
    }

    const file: VFSFile = {
      id: path, //any other suggestion???
      path,
      name,
      type: "file",
      content,
      lastModified: Date.now(),
    };
    this.entries.set(path, file);
    parent.children.push(name);
    this.emitChange({ type: "create", path, content });
    return file;
  }

  addFolder(path: string): VFSFolder | null {
    if (this.isExcluded(path)) {
      console.warn(`Attempted to add excluded directory: ${path}`);
      return null;
    }
    if (this.entries.has(path)) {
      console.warn(`Directory already exists: ${path}`);
      return this.entries.get(path) as VFSFolder;
    }

    const name = path.split("/").pop() || "";
    const parentPath = path.substring(0, path.lastIndexOf("/")) || "/";
    const parent = this.entries.get(parentPath) as VFSFolder;

    if (path !== "/" && (!parent || parent.type !== "folder")) {
      console.error(
        `Parent folder not found or not a folder for path: ${path}`
      );
      return null;
    }

    const folder: VFSFolder = {
      id: path,
      path,
      name,
      type: "folder",
      children: [],
      lastModified: Date.now(),
    };
    this.entries.set(path, folder);
    if (parent && parent.type === "folder") {
      parent.children.push(name);
    }
    this.emitChange({ type: "create", path });
    return folder;
  }

  getFile(path: string): VFSFile | undefined {
    const entry = this.entries.get(path);
    return entry && entry.type === "file" ? (entry as VFSFile) : undefined;
  }

  getDirectory(path: string): VFSFolder | undefined {
    const entry = this.entries.get(path);
    return entry && entry.type === "folder" ? (entry as VFSFolder) : undefined;
  }

  getEntry(path: string): VFSEntry | undefined {
    return this.entries.get(path);
  }

  updateFile(path: string, newContent: string): VFSFile | null {
    const file = this.getFile(path);
    if (!file) {
      console.error(`File not found for update: ${path}`);
      return null;
    }
    file.content = newContent;
    file.lastModified = Date.now();
    this.emitChange({ type: "update", path, content: newContent });
    return file;
  }

  deleteEntry(path: string): boolean {
    const entry = this.entries.get(path);
    if (!entry) {
      console.warn(`Entry not found for deletion: ${path}`);
      return false;
    }

    // Remove from parent's children list
    const parentPath = path.substring(0, path.lastIndexOf("/")) || "/";
    const parent = this.entries.get(parentPath) as VFSFolder;
    if (parent && parent.type === "folder") {
      parent.children = parent.children.filter(
        (childName) => childName !== entry.name
      );
    }

    //  delete children if it's a folder
    if (entry.type === "folder") {
      const childrenPaths = Array.from(this.entries.keys()).filter(
        (key) => key.startsWith(path + "/") && key !== path
      );
      childrenPaths.forEach((childPath) => this.entries.delete(childPath));
    }

    this.entries.delete(path);
    this.emitChange({ type: "delete", path });
    return true;
  }

  renameEntry(oldPath: string, newPath: string): VFSEntry | null {
    if (this.isExcluded(newPath)) {
      console.warn(`Attempted to rename to an excluded path: ${newPath}`);
      return null;
    }
    if (this.entries.has(newPath)) {
      console.error(`New path already exists: ${newPath}`);
      return null;
    }

    const entry = this.entries.get(oldPath);
    if (!entry) {
      console.error(`Entry not found for rename: ${oldPath}`);
      return null;
    }

    // Update parent's children list
    const oldParentPath = oldPath.substring(0, oldPath.lastIndexOf("/")) || "/";
    const oldParent = this.entries.get(oldParentPath) as VFSFolder;
    if (oldParent && oldParent.type === "folder") {
      oldParent.children = oldParent.children.filter(
        (childName) => childName !== entry.name
      );
    }

    const newName = newPath.split("/").pop() || "";
    const newParentPath = newPath.substring(0, newPath.lastIndexOf("/")) || "/";
    const newParent = this.entries.get(newParentPath) as VFSFolder;
    if (!newParent || newParent.type !== "folder") {
      console.error(
        `New parent folder not found or not a folder for path: ${newPath}`
      );
      return null;
    }
    newParent.children.push(newName);

    // Update the entry itself
    entry.path = newPath;
    entry.name = newName;
    entry.lastModified = Date.now();
    this.entries.delete(oldPath);
    this.entries.set(newPath, entry);

    // If it's a folder, update all children paths recursively
    if (entry.type === "folder") {
      const childrenToUpdate: [string, VFSEntry][] = [];
      this.entries.forEach((childEntry, childPath) => {
        if (childPath.startsWith(oldPath + "/") && childPath !== oldPath) {
          childrenToUpdate.push([childPath, childEntry]);
        }
      });

      childrenToUpdate.forEach(([childOldPath, childEntry]) => {
        const relativePath = childOldPath.substring(oldPath.length);
        const childNewPath = newPath + relativePath;
        childEntry.path = childNewPath;
        childEntry.lastModified = Date.now();
        this.entries.delete(childOldPath);
        this.entries.set(childNewPath, childEntry);
      });
    }

    this.emitChange({ type: "rename", path: oldPath, newPath });
    return entry;
  }

  getAllEntries(): Map<string, VFSEntry> {
    return new Map(this.entries);
  }

  getTree(path = "/"): VFSEntry | undefined {
    const root = this.getEntry(path);
    if (!root) return undefined;

    const buildNode = (entry: VFSEntry): VFSEntry => {
      if (entry.type === "folder") {
        const dir = entry as VFSFolder;
        const treeDir: VFSTreeFolder = {
          ...dir,
          children: dir.children
            .map((childName) => {
              const childPath = `${
                dir.path === "/" ? "" : dir.path
              }/${childName}`;
              const childEntry = this.getEntry(childPath);
              return childEntry ? buildNode(childEntry) : null;
            })
            .filter((child): child is VFSEntry => child !== null), // Ensure children is VFSEntry[]
        };
        return treeDir;
      }
      return entry;
    };

    return buildNode(root);
  }
}
