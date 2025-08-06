import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import type { FileNode } from "./ProjectManagementPanel/file.types";
import { type Session } from "@supabase/supabase-js";
import { supabase } from "../database/superbase";

export interface CollaborationUser {
  name: string;
  color: string;
  avatar?: string;
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

export interface Message {
  id: string;
  user: string;
  text: string;
  color: string;
  avatar?: string;
  timestamp: number;
}

// Centralized YJS Collaboration Service
class YjsCollaborationService {
  private projectDoc: Y.Doc | null = null;
  private provider: WebsocketProvider | null = null;
  private fileSystemMap: Y.Map<any> | null = null; // Metadata for file system
  private fileTexts: Map<string, Y.Text> = new Map(); // Actual file contents
  private chatArray: Y.Array<Message> | null = null;

  private initialized = false;

  private connectionCallbacks: Set<(connected: boolean) => void> = new Set();
  private fileChangeCallbacks: Map<string, Set<(content: string) => void>> =
    new Map();
  private fileSystemCallbacks: Set<(files: FileNode[]) => void> = new Set();
  private chatCallbacks: Set<(messages: Message[]) => void> = new Set();

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

  // If URL is like /codeeditor/a780e619-7c04-45cf-a030-702b20441649
  private getCodespaceIdFromUrl(): string {
    const pathSegments = window.location.pathname.split("/");
    const codespaceId = pathSegments[pathSegments.length - 1];
    console.log("Extracted codespace ID from URL:", codespaceId);

    return codespaceId;
  }

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (this.initialized) return;

    this.projectDoc = new Y.Doc();

    // Create WebSocket provider
    this.provider = new WebsocketProvider(
      "ws://144.24.128.44:4455",
      // "ws://localhost:4455",
      this.getCodespaceIdFromUrl(),
      this.projectDoc
    );

    this.fileSystemMap = this.projectDoc.getMap("fileSystem");
    this.chatArray = this.projectDoc.getArray("chat");

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
    supabase.auth
      .getSession()
      .then(({ data }: { data: { session: Session | null } }) => {
        const session = data.session;
        if (session) {
          const user = session.user;
          const name = user.user_metadata.full_name || user.email;
          const avatar = user.user_metadata.avatar_url || "";

          awareness.setLocalStateField("user", {
            name,
            color:
              this.userColors[
                Math.floor(Math.random() * this.userColors.length)
              ],
            avatar,
          });
        }
      });
    // Set local user info
    // const userColor =
    //   this.userColors[Math.floor(Math.random() * this.userColors.length)];
    // awareness.setLocalStateField("user", {
    //   name: `User-${Math.random().toString(36).substr(2, 5)}`,
    //   color: userColor,
    // });
  }

  // Connection Management
  public onConnectionChange(
    callback: (connected: boolean) => void
  ): () => void {
    this.connectionCallbacks.add(callback);

    callback(this.isConnected());

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

  // Chat Management
  public getChatArray(): Y.Array<Message> {
    if (!this.projectDoc) {
      throw new Error("YJS not initialized");
    }
    return this.chatArray!;
  }

  public getChatMessages(): Message[] {
    return this.chatArray?.toArray() || [];
  }

  public sendChatMessage(text: string): void {
    if (!this.chatArray || !text.trim()) return;

    const awareness = this.getAwareness();
    const currentUser = awareness?.getLocalState()?.user;
    const username = currentUser?.name || "Anonymous";

    const newMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user: username,
      color: currentUser?.color || "#aac25f",
      avatar: currentUser?.avatar,
      text: text.trim(),
      timestamp: Date.now(),
    };

    this.chatArray.push([newMessage]);
  }

  public onChatChange(callback: (messages: Message[]) => void): () => void {
    if (!this.chatArray) {
      throw new Error("Chat not initialized");
    }

    this.chatCallbacks.add(callback);

    if (this.chatCallbacks.size === 1) {
      const observer = () => {
        const messages = this.chatArray?.toArray() || [];
        this.chatCallbacks.forEach((cb) => cb(messages));
      };
      this.chatArray.observe(observer);

      (this.chatArray as any)._observer = observer;
    }

    callback(this.getChatMessages());

    return () => {
      this.chatCallbacks.delete(callback);

      if (this.chatCallbacks.size === 0) {
        const observer = (this.chatArray as any)._observer;
        if (observer) {
          this.chatArray?.unobserve(observer);
          delete (this.chatArray as any)._observer;
        }
      }
    };
  }

  public clearChat(): void {
    if (this.chatArray && this.chatArray.length > 0) {
      this.chatArray.delete(0, this.chatArray.length);
    }
  }

  // User Awareness
  public getAwareness() {
    return this.provider?.awareness || null;
  }

  public setUserInfo(name: string, color?: string, avatar?: string): void {
    const awareness = this.getAwareness();
    if (awareness) {
      const userColor =
        color ||
        this.userColors[Math.floor(Math.random() * this.userColors.length)];
      awareness.setLocalStateField("user", { name, color: userColor, avatar });
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
          avatar: state.user.avatar,
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
      console.log(
        "Awareness changed, updating connected users",
        this.getConnectedUsers()
      );

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
