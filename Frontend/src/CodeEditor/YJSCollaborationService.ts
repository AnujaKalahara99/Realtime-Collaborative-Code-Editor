import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import type { FileNode } from "./ProjectManagementPanel/file.types";

export interface CollaborationUser {
  name: string;
  color: string;
  cursor?: {
    line: number;
    column: number;
    selection?: {
      startLine: number;
      startColumn: number;
      endLine: number;
      endColumn: number;
    };
  };
}

// Centralized YJS Collaboration Service
class YjsCollaborationService {
  private projectDoc: Y.Doc | null = null;
  private provider: WebsocketProvider | null = null;
  private fileSystemMap: Y.Map<any> | null = null; // Metadata for file system
  private fileTexts: Map<string, Y.Text> = new Map(); // Actual file contents
  private initialized = false;
  private connectionCallbacks: Set<(connected: boolean) => void> = new Set();
  private fileChangeCallbacks: Map<string, Set<(content: string) => void>> =
    new Map();
  private fileSystemCallbacks: Set<(files: FileNode[]) => void> = new Set();
  private userColors = [
    "#30bced",
    "#6eeb83",
    "#ffbc42",
    "#ecd444",
    "#ee6352",
    "#9ac2c9",
    "#8acb88",
    "#1be7ff",
  ];

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (this.initialized) return;

    this.projectDoc = new Y.Doc();

    // Create WebSocket provider
    this.provider = new WebsocketProvider(
      "ws://144.24.128.44:4455",
      "collaborative-code-editor",
      this.projectDoc
    );

    // Get file system map
    this.fileSystemMap = this.projectDoc.getMap("fileSystem");

    // Set up connection listeners
    this.provider.on("status", (event: any) => {
      const isConnected = event.status === "connected";
      this.connectionCallbacks.forEach((callback) => callback(isConnected));
    });

    // Set up file system change listener
    this.fileSystemMap.observe(() => {
      const files = this.fileSystemMap?.get("files") || [];
      this.fileSystemCallbacks.forEach((callback) => callback(files));
    });

    // Set up awareness for user presence
    this.setupAwareness();

    this.initialized = true;
  }

  private setupAwareness() {
    if (!this.provider) return;

    const awareness = this.provider.awareness;

    // Set local user info
    const userColor =
      this.userColors[Math.floor(Math.random() * this.userColors.length)];
    awareness.setLocalStateField("user", {
      name: `User-${Math.random().toString(36).substr(2, 5)}`,
      color: userColor,
    });
  }

  // Connection Management
  public onConnectionChange(
    callback: (connected: boolean) => void
  ): () => void {
    this.connectionCallbacks.add(callback);

    // Call immediately with current status
    callback(this.isConnected());

    // Return unsubscribe function
    return () => {
      this.connectionCallbacks.delete(callback);
    };
  }

  public isConnected(): boolean {
    return this.provider?.wsconnected || false;
  }

  // File System Management
  public getFileSystem(): FileNode[] {
    return this.fileSystemMap?.get("files") || [];
  }

  public setFileSystem(files: FileNode[]): void {
    this.fileSystemMap?.set("files", files);
  }

  public onFileSystemChange(callback: (files: FileNode[]) => void): () => void {
    this.fileSystemCallbacks.add(callback);

    // Call immediately with current files
    callback(this.getFileSystem());

    // Return unsubscribe function
    return () => {
      this.fileSystemCallbacks.delete(callback);
    };
  }

  // File Content Management
  public getFileText(fileId: string): Y.Text {
    if (!this.projectDoc) {
      throw new Error("YJS not initialized");
    }

    // Return existing Y.Text if we have it
    if (this.fileTexts.has(fileId)) {
      return this.fileTexts.get(fileId)!;
    }

    // Create new Y.Text for this file
    const fileText = this.projectDoc.getText(`file-${fileId}`);
    this.fileTexts.set(fileId, fileText);

    return fileText;
  }

  public initializeFileContent(fileId: string, content: string): void {
    const fileText = this.getFileText(fileId);

    // Only initialize if the Y.Text is empty
    if (fileText.length === 0 && content) {
      fileText.insert(0, content);
    }
  }

  public getFileContent(fileId: string): string {
    const fileText = this.getFileText(fileId);
    return fileText.toString();
  }

  public onFileContentChange(
    fileId: string,
    callback: (content: string) => void
  ): () => void {
    const fileText = this.getFileText(fileId);

    // Add callback to our map
    if (!this.fileChangeCallbacks.has(fileId)) {
      this.fileChangeCallbacks.set(fileId, new Set());
    }
    this.fileChangeCallbacks.get(fileId)!.add(callback);

    // Set up Y.Text observer if this is the first callback for this file
    if (this.fileChangeCallbacks.get(fileId)!.size === 1) {
      const observer = () => {
        const content = fileText.toString();
        this.fileChangeCallbacks.get(fileId)?.forEach((cb) => cb(content));
      };
      fileText.observe(observer);

      // Store observer for cleanup
      (fileText as any)._observer = observer;
    }

    // Call immediately with current content
    callback(fileText.toString());

    // Return unsubscribe function
    return () => {
      const callbacks = this.fileChangeCallbacks.get(fileId);
      if (callbacks) {
        callbacks.delete(callback);

        // If no more callbacks, remove observer
        if (callbacks.size === 0) {
          const observer = (fileText as any)._observer;
          if (observer) {
            fileText.unobserve(observer);
            delete (fileText as any)._observer;
          }
          this.fileChangeCallbacks.delete(fileId);
        }
      }
    };
  }

  public deleteFileContent(fileId: string): void {
    const fileText = this.getFileText(fileId);

    // Clear the content
    if (fileText.length > 0) {
      fileText.delete(0, fileText.length);
    }

    // Clean up callbacks
    this.fileChangeCallbacks.delete(fileId);
    this.fileTexts.delete(fileId);
  }

  // User Awareness
  public getAwareness() {
    return this.provider?.awareness || null;
  }

  public setUserInfo(name: string, color?: string) {
    const awareness = this.getAwareness();
    if (awareness) {
      const userColor =
        color ||
        this.userColors[Math.floor(Math.random() * this.userColors.length)];
      awareness.setLocalStateField("user", { name, color: userColor });
    }
  }

  public getConnectedUsers(): CollaborationUser[] {
    const awareness = this.getAwareness();
    if (!awareness) return [];

    const users: CollaborationUser[] = [];
    awareness.getStates().forEach((state: any) => {
      if (state.user) {
        users.push({
          name: state.user.name,
          color: state.user.color,
          cursor: state.cursor,
        });
      }
    });

    return users;
  }

  public getUsersInFile(fileId: string): CollaborationUser[] {
    const awareness = this.getAwareness();
    if (!awareness) return [];

    const users: CollaborationUser[] = [];
    awareness.getStates().forEach((state: any, clientId: number) => {
      if (state.user && state.cursor && state.cursor.fileId === fileId) {
        // Skip local user
        if (clientId !== awareness.clientID) {
          users.push({
            name: state.user.name,
            color: state.user.color,
            cursor: {
              line: state.cursor.line,
              column: state.cursor.column,
              selection: state.cursor.selection,
            },
          });
        }
      }
    });

    return users;
  }

  public onUsersChange(
    callback: (users: CollaborationUser[]) => void
  ): () => void {
    const awareness = this.getAwareness();
    if (!awareness) return () => {};

    const handler = () => {
      callback(this.getConnectedUsers());
    };

    awareness.on("change", handler);

    // Call immediately with current users
    callback(this.getConnectedUsers());

    return () => {
      awareness.off("change", handler);
    };
  }

  public updateCursorPosition(
    fileId: string,
    position: {
      line: number;
      column: number;
      selection?: {
        startLine: number;
        startColumn: number;
        endLine: number;
        endColumn: number;
      };
    }
  ): void {
    const awareness = this.getAwareness();
    if (awareness) {
      awareness.setLocalStateField("cursor", {
        fileId,
        ...position,
        timestamp: Date.now(),
      });
    }
  }

  // Cleanup
  public destroy(): void {
    // Clean up all callbacks
    this.connectionCallbacks.clear();
    this.fileSystemCallbacks.clear();
    this.fileChangeCallbacks.clear();

    // Clean up file texts
    this.fileTexts.forEach((fileText, fileId) => {
      const observer = (fileText as any)._observer;
      if (observer) {
        fileText.unobserve(observer);
      }
    });
    this.fileTexts.clear();

    // Destroy provider and document
    if (this.provider) {
      this.provider.destroy();
      this.provider = null;
    }

    if (this.projectDoc) {
      this.projectDoc.destroy();
      this.projectDoc = null;
    }

    this.initialized = false;
  }
}

// Create singleton instance
export const collaborationService = new YjsCollaborationService();

// React hook for using the collaboration service
export const useCollaboration = () => {
  return collaborationService;
};
