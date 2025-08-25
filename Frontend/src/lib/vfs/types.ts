export type VFSEntryType = "file" | "folder";

export interface VFSEntry {
  id: string;
  path: string;
  name: string;
  type: VFSEntryType;
  lastModified: number;
  isExpanded?: boolean;
}

export interface VFSFile extends VFSEntry {
  type: "file";
  content?: string;
}

export interface VFSFolder extends VFSEntry {
  type: "folder";
  children?: VFSFile[]; // Names of children entries;
}

export interface VFSDirectory extends VFSEntry {
  type: "folder";
  children: string[]; // Names of children entries
}

export interface VFSTreeDirectory extends VFSEntry {
  type: "folder";
  children: VFSEntry[]; // Full VFSEntry objects for tree view
}

export interface VFSChangeEvent {
  type: "create" | "update" | "delete" | "rename";
  path: string;
  newPath?: string;
  content?: string;
}
