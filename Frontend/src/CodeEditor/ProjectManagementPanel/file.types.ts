type FileType = "file" | "folder";

export interface FileNode {
  id: string;
  name: string;
  type: FileType;
  content?: string;
  children?: FileNode[];
  isExpanded?: boolean;
  path?: string;
}

export interface ContextMenuData {
  x: number;
  y: number;
  nodeId: string;
}
