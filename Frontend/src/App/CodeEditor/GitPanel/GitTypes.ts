export interface Commit {
  id: string;
  message: string;
  author: string;
  date: Date;
  isCurrent: boolean;
}

export interface Branch {
  name: string;
  isActive: boolean;
}

export interface GitState {
  branches: Branch[];
  commits: Commit[];
  currentBranch: string;
}
