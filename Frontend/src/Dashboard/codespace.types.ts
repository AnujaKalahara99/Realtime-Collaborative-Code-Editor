export interface Codespace {
  id: string;
  name: string;
  lastModified?: string;
  created_at: string;
  owner: string;
}

export type ViewMode = "grid" | "list";
