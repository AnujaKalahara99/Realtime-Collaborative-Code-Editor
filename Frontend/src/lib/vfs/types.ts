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
  id?: string;
}

export interface VFSDirectory extends VFSEntry {
  type: "directory";
  children: string[]; // Names of children entries;
  id?: string;
}

export interface VFSTreeDirectory extends VFSEntry {
  type: "directory";
  children: VFSEntry[]; // Full VFSEntry objects for tree view
  id?: string;
}

export interface VFSChangeEvent {
  type: "create" | "update" | "delete" | "rename";
  path: string;
  newPath?: string;
  content?: string;
}
