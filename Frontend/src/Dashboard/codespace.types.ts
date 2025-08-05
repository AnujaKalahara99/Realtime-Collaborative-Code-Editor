export interface Codespace {
  id: string;
  name: string;
  lastModified: string;
  created_at: string;
  owner: string;
  role?: string; // Optional field for role
}

export type ViewMode = "grid" | "list";
