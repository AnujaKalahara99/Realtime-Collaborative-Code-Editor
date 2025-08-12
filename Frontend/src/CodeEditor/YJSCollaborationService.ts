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

class YjsCollaborationService {
  private doc: Y.Doc | null = null;
  private provider: WebsocketProvider | null = null;
  private fileSystemMap: Y.Map<FileNode[]> | null = null;
  private fileTexts = new Map<string, Y.Text>();
  private chatArray: Y.Array<Message> | null = null;
  private currentCodespaceId: string | null = null;

  private callbacks = new Map<string, Set<(data: any) => void>>();
  private observers = new WeakMap<Y.AbstractType<any>, () => void>();

  private readonly userColors = [
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
    this.setupUrlChangeDetection();
  }

  private getCodespaceId(): string {
    const segments = window.location.pathname.split("/");
    return segments[segments.length - 1];
  }

  private setupUrlChangeDetection(): void {
    const checkUrl = () => {
      const newId = this.getCodespaceId();
      if (newId !== this.currentCodespaceId) {
        this.initialize();
      }
    };

    //This may incur performance costs due to binding multiple times
    window.addEventListener("popstate", checkUrl);
    const originalPushState = history.pushState;
    history.pushState = function (...args) {
      originalPushState.apply(history, args);
      checkUrl();
    };
  }

  private initialize(): void {
    this.cleanup();

    this.currentCodespaceId = this.getCodespaceId();
    this.doc = new Y.Doc();

    this.provider = new WebsocketProvider(
      "ws://localhost:4000/ws",
      this.currentCodespaceId,
      this.doc
    );

    this.fileSystemMap = this.doc.getMap("fileSystem");
    this.chatArray = this.doc.getArray("chat");

    this.setupProviderEvents();
    this.setupObservers();
    this.setupAwareness();
  }

  private setupProviderEvents(): void {
    if (!this.provider) return;

    this.provider.on("status", (event: any) => {
      this.notifyCallbacks("connection", event.status === "connected");
    });

    this.provider.on("sync", () => {
      this.notifyCallbacks(
        "fileSystem",
        this.fileSystemMap?.get("files") || []
      );
      this.notifyCallbacks("chat", this.chatArray?.toArray() || []);
    });
  }

  private setupObservers(): void {
    if (!this.fileSystemMap || !this.chatArray) return;

    const fileSystemObserver = () => {
      this.notifyCallbacks(
        "fileSystem",
        this.fileSystemMap?.get("files") || []
      );
    };

    const chatObserver = () => {
      this.notifyCallbacks("chat", this.chatArray?.toArray() || []);
    };

    this.fileSystemMap.observe(fileSystemObserver);
    this.chatArray.observe(chatObserver);

    this.observers.set(this.fileSystemMap, fileSystemObserver);
    this.observers.set(this.chatArray, chatObserver);
  }

  private async setupAwareness(): Promise<void> {
    if (!this.provider) return;

    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const user = data.session.user;
        this.provider.awareness.setLocalStateField("user", {
          name: user.user_metadata.full_name || user.email,
          color:
            this.userColors[Math.floor(Math.random() * this.userColors.length)],
          avatar: user.user_metadata.avatar_url || "",
        });
      }
    } catch (error) {
      console.warn("Failed to setup user awareness:", error);
    }
  }

  private addCallback(type: string, callback: (data: any) => void): () => void {
    if (!this.callbacks.has(type)) {
      this.callbacks.set(type, new Set());
    }
    this.callbacks.get(type)!.add(callback);

    return () => this.callbacks.get(type)?.delete(callback);
  }

  private notifyCallbacks(type: string, data: any): void {
    this.callbacks.get(type)?.forEach((callback) => callback(data));
  }

  private setupFileObserver(fileId: string, fileText: Y.Text): void {
    if (this.observers.has(fileText)) return;

    const observer = () => {
      this.notifyCallbacks(`file:${fileId}`, fileText.toString());
    };

    fileText.observe(observer);
    this.observers.set(fileText, observer);
  }

  private cleanup(): void {
    this.callbacks.clear();
    this.fileTexts.clear();

    this.provider?.destroy();
    this.doc?.destroy();

    this.doc = null;
    this.provider = null;
    this.fileSystemMap = null;
    this.chatArray = null;
  }

  // Public API
  isConnected(): boolean {
    return this.provider?.wsconnected || false;
  }

  onConnectionChange(callback: (connected: boolean) => void): () => void {
    callback(this.isConnected());
    return this.addCallback("connection", callback);
  }

  getFileSystem(): FileNode[] {
    return this.fileSystemMap?.get("files") || [];
  }

  setFileSystem(files: FileNode[]): void {
    this.fileSystemMap?.set("files", files);
  }

  onFileSystemChange(callback: (files: FileNode[]) => void): () => void {
    callback(this.getFileSystem());
    return this.addCallback("fileSystem", callback);
  }

  getFileText(fileId: string): Y.Text {
    if (!this.doc) throw new Error("YJS not initialized");

    if (!this.fileTexts.has(fileId)) {
      const fileText = this.doc.getText(`file-${fileId}`);
      this.fileTexts.set(fileId, fileText);
      this.setupFileObserver(fileId, fileText);
    }

    return this.fileTexts.get(fileId)!;
  }

  getFileContent(fileId: string): string {
    return this.getFileText(fileId).toString();
  }

  initializeFileContent(fileId: string, content: string): void {
    const fileText = this.getFileText(fileId);
    if (fileText.length === 0 && content) {
      fileText.insert(0, content);
    }
  }

  onFileContentChange(
    fileId: string,
    callback: (content: string) => void
  ): () => void {
    const fileText = this.getFileText(fileId);
    callback(fileText.toString());
    return this.addCallback(`file:${fileId}`, callback);
  }

  deleteFileContent(fileId: string): void {
    const fileText = this.getFileText(fileId);
    if (fileText.length > 0) {
      fileText.delete(0, fileText.length);
    }
    this.fileTexts.delete(fileId);
  }

  getChatMessages(): Message[] {
    return this.chatArray?.toArray() || [];
  }

  sendChatMessage(text: string): void {
    if (!this.chatArray || !text.trim()) return;

    const user = this.provider?.awareness.getLocalState()?.user;
    const message: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user: user?.name || "Anonymous",
      color: user?.color || "#aac25f",
      avatar: user?.avatar,
      text: text.trim(),
      timestamp: Date.now(),
    };

    this.chatArray.push([message]);
  }

  onChatChange(callback: (messages: Message[]) => void): () => void {
    callback(this.getChatMessages());
    return this.addCallback("chat", callback);
  }

  clearChat(): void {
    if (this.chatArray?.length) {
      this.chatArray.delete(0, this.chatArray.length);
    }
  }

  getConnectedUsers(): CollaborationUser[] {
    const awareness = this.provider?.awareness;
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

  getUsersInFile(fileId: string): CollaborationUser[] {
    const awareness = this.provider?.awareness;
    if (!awareness) return [];

    const users: CollaborationUser[] = [];
    awareness.getStates().forEach((state: any, clientId: number) => {
      if (
        state.user &&
        state.cursor?.fileId === fileId &&
        clientId !== awareness.clientID
      ) {
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
    });

    return users;
  }

  onUsersChange(callback: (users: CollaborationUser[]) => void): () => void {
    const awareness = this.provider?.awareness;
    if (!awareness) return () => {};

    const handler = () => callback(this.getConnectedUsers());
    awareness.on("change", handler);
    callback(this.getConnectedUsers());

    return () => awareness.off("change", handler);
  }

  updateCursorPosition(
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
    this.provider?.awareness.setLocalStateField("cursor", {
      fileId,
      ...position,
      timestamp: Date.now(),
    });
  }

  setUserInfo(name: string, color?: string, avatar?: string): void {
    this.provider?.awareness.setLocalStateField("user", {
      name,
      color:
        color ||
        this.userColors[Math.floor(Math.random() * this.userColors.length)],
      avatar,
    });
  }

  destroy(): void {
    this.cleanup();
    this.currentCodespaceId = null;
  }
}

let service: YjsCollaborationService | null = null;

export const useCollaboration = (): YjsCollaborationService => {
  if (!service) {
    service = new YjsCollaborationService();
  }
  return service;
};

export const disconnectCollaboration = (): void => {
  service?.destroy();
  service = null;
};
