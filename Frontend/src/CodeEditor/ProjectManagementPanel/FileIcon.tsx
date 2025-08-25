import { File, Folder, FolderOpen } from "lucide-react";
import type { FileNode } from "./file.types";
import type { VFSEntry } from "../../lib/vfs/types";

const FileIcon = ({ node }: { node: VFSEntry | FileNode }) => {
  if (node.type === "folder") {
    return node.isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />;
  }
  return <File size={16} />;
};

export default FileIcon;
