export type VFSEntryType = "file" | "directory";

export interface VFSEntry {
  path: string;
  name: string;
  type: VFSEntryType;
  lastModified: number;
}

export interface VFSFile extends VFSEntry {
  type: "file";
  content: string;
}

export interface VFSDirectory extends VFSEntry {
  type: "directory";
  children: string[];
}

export interface VFSFile extends VFSEntry {
  type: "file";
  content: string;
}
export interface VFSTreeDirectory extends VFSEntry {
  type: "directory";
  children: VFSEntry[]; // Full VFSEntry objects for tree view
}

export interface VFSChangeEvent {
  type: "create" | "update" | "delete" | "rename";
  path: string;
  newPath?: string;
  content?: string;
}
