export interface Codespace {
  id: string;
  name: string;
  lastModified: string;
  created_at: string;
  owner: string;
  role: string;
}

export interface CodespaceDetails extends Codespace {
  sessions?: {
    sessionId: string;
    branchId: string;
    name: string;
  }[];
  gitHubRepo?: string;
  repoId?: string;
}

export type ViewMode = "grid" | "list";
