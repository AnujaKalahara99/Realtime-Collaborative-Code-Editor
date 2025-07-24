import { File, Folder, FolderOpen } from "lucide-react";
import type { FileNode } from "./commonFileTypes";

const FileIcon = ({ node }: { node: FileNode }) => {
  if (node.type === "folder") {
    return node.isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />;
  }
  return <File size={16} />;
};

export default FileIcon;
