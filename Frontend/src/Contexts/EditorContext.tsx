import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { useParams } from "react-router";
import { type FileNode } from "../App/CodeEditor/ProjectManagementPanel/file.types";
import { type CodespaceDetails } from "../App/Dashboard/codespace.types";
import { type Awareness } from "y-protocols/awareness";
import { formatDateTime, getTokenFromStorage } from "../utility/utility";
import { type Session } from "@supabase/supabase-js";

// Types
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

export type CursorPosition = {
  line: number;
  column: number;
  selection?: {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  };
};

interface EditorCollaborationContextType {
  // Codespace
  codespace: CodespaceDetails | null;
  loading: boolean;
  error: string | null;
  activeSessionIndex: number;
  setActiveSessionIndex: (index: number) => void;

  // Connection
  isConnected: boolean;
  connectedUsers: CollaborationUser[];

  // File system
  files: FileNode[];
  updateFiles: (files: FileNode[]) => void;
  getFileContent: (fileId: string) => string;
  initializeFileContent: (fileId: string, content: string) => void;
  onFileContentChange: (
    fileId: string,
    callback: (content: string) => void
  ) => () => void;

  // Chat
  messages: Message[];
  sendChatMessage: (text: string) => void;

  // Collaboration
  updateCursorPosition: (fileId: string, position: CursorPosition) => void;
  getUsersInFile: (fileId: string) => CollaborationUser[];
  setUserInfo: (name: string, color?: string, avatar?: string) => void;
  getAwareness: () => Awareness | null;

  // Lifecycle
  destroy: () => void;
}

const initialContext: EditorCollaborationContextType = {
  codespace: null,
  loading: true,
  error: null,
  activeSessionIndex: 0,
  setActiveSessionIndex: () => {},
  isConnected: false,
  connectedUsers: [],
  files: [],
  updateFiles: () => {},
  getFileContent: () => "",
  initializeFileContent: () => {},
  onFileContentChange: () => () => {},
  messages: [],
  sendChatMessage: () => {},
  updateCursorPosition: () => {},
  getUsersInFile: () => [],
  setUserInfo: () => {},
  getAwareness: () => null,
  destroy: () => {},
};

const EditorCollaborationContext =
  createContext<EditorCollaborationContextType>(initialContext);

const WS_URL = `${import.meta.env.VITE_BACKEND_WS_URL}/ws`;
const CODESPACE_API_URL = `${import.meta.env.VITE_BACKEND_URL}/codespaces`;

export const EditorCollaborationProvider: React.FC<{
  children: React.ReactNode;
  AuthSession: Session | null;
}> = ({ children, AuthSession }) => {
  const { codespaceId } = useParams<{ codespaceId: string }>();
  const docRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const [fileSystemMap, setFileSystemMap] = useState<Y.Map<FileNode[]> | null>(
    null
  );
  const [chatArray, setChatArray] = useState<Y.Array<Message> | null>(null);
  const [fileTexts] = useState<Map<string, Y.Text>>(new Map());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [observers] = useState<WeakMap<Y.AbstractType<any>, () => void>>(
    new WeakMap()
  );
  const [callbacks] = useState<Map<string, Set<(data: string) => void>>>(
    new Map()
  );

  // State
  const [codespace, setCodespace] = useState<CodespaceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSessionIndex, setActiveSessionIndex] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<CollaborationUser[]>([]);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const userColors = useMemo(
    () => [
      "#30bced",
      "#6eeb83",
      "#ffbc42",
      "#ecd444",
      "#ee6352",
      "#9ac2c9",
      "#8acb88",
      "#1be7ff",
    ],
    []
  );

  const userName =
    AuthSession?.user?.user_metadata?.full_name ||
    AuthSession?.user?.email ||
    "Anonymous";

  const getAuthHeader = useCallback(() => {
    return AuthSession?.access_token
      ? { Authorization: AuthSession.access_token }
      : { Authorization: getTokenFromStorage() };
  }, [AuthSession]);

  useEffect(() => {
    if (!AuthSession) {
      setError("No active session. Please log in.");
      return;
    }

    if (!codespaceId) return;

    const fetchCodespaceDetails = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${CODESPACE_API_URL}/${codespaceId}`, {
          headers: getAuthHeader(),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch codespace details");
        }

        const data = await response.json();

        const codespaceDetails: CodespaceDetails = {
          id: data.codespace.id,
          name: data.codespace.name,
          lastModified: formatDateTime(data.codespace.lastModified),
          created_at: formatDateTime(data.codespace.created_at),
          owner: userName,
          role: data.codespace.role,
          sessions: data.codespace.sessions || [],
          gitHubRepo: data.codespace.gitHubRepo || "",
        };

        setCodespace(codespaceDetails);

        // Initialize YJS with session ID
        initializeYJS(codespaceDetails.sessions?.[0]?.sessionId || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCodespaceDetails();

    return () => {
      cleanupYJS();
    };
  }, [codespaceId, AuthSession]);

  // YJS Initialization
  const initializeYJS = (roomId: string) => {
    cleanupYJS();
    console.log("Initializing YJS with room ID:", roomId);

    const newDoc = new Y.Doc();
    const newProvider = new WebsocketProvider(WS_URL, roomId, newDoc);
    const newFileSystemMap: Y.Map<FileNode[]> = newDoc.getMap("fileSystem");
    const newChatArray: Y.Array<Message> = newDoc.getArray("chat");

    docRef.current = newDoc;
    providerRef.current = newProvider;
    console.log("YJS provider status:", newProvider);

    setFileSystemMap(newFileSystemMap);
    setChatArray(newChatArray);

    // Setup events
    newProvider.on("status", (event: { status: string }) => {
      setIsConnected(event.status === "connected");
    });

    newProvider.on("sync", () => {
      setFiles(newFileSystemMap.get("files") || []);
      setMessages(newChatArray.toArray() || []);
    });

    // Setup observers
    const fileSystemObserver = () => {
      setFiles(newFileSystemMap.get("files") || []);
    };

    const chatObserver = () => {
      setMessages(newChatArray.toArray() || []);
    };

    newFileSystemMap.observe(fileSystemObserver);
    newChatArray.observe(chatObserver);

    observers.set(newFileSystemMap, fileSystemObserver);
    observers.set(newChatArray, chatObserver);

    // Setup awareness
    setupAwareness(newProvider);

    // Set initial data
    setFiles(newFileSystemMap.get("files") || []);
    setMessages(newChatArray.toArray() || []);
  };

  const setupAwareness = async (newProvider: WebsocketProvider) => {
    try {
      console.log("Setting up user awareness");

      if (AuthSession?.user) {
        console.log("User found:", AuthSession.user);
        const user = AuthSession.user;
        newProvider.awareness.setLocalStateField("user", {
          name: user.user_metadata.full_name || user.email,
          color: userColors[Math.floor(Math.random() * userColors.length)],
          avatar: user.user_metadata.avatar_url || "",
        });

        const awarenessHandler = () => {
          const users: CollaborationUser[] = [];
          const seenUserNames = new Map<string, CollaborationUser>();

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          newProvider.awareness.getStates().forEach((state: any) => {
            if (state.user) {
              const userName = state.user.name;
              if (!seenUserNames.has(userName)) {
                const user = {
                  name: userName,
                  color: state.user.color,
                  cursor: state.cursor,
                  avatar: state.user.avatar,
                };
                users.push(user);
                seenUserNames.set(userName, user);
              }
            }
          });
          console.log("Awareness changed. Connected users:", users);
          setConnectedUsers(users);
        };

        newProvider.awareness.on("change", awarenessHandler);
        awarenessHandler();
      }
    } catch (error) {
      console.warn("Failed to setup user awareness:", error);
    }
  };

  const cleanupYJS = useCallback(() => {
    callbacks.clear();
    fileTexts.clear();

    if (providerRef.current?.awareness) {
      providerRef.current.awareness.setLocalState(null);
    }

    providerRef.current?.destroy();
    docRef.current?.destroy();
    providerRef.current = null;
  }, [callbacks, fileTexts]);

  const addCallback = useCallback(
    (type: string, callback: (data: string) => void): (() => void) => {
      if (!callbacks.has(type)) {
        callbacks.set(type, new Set());
      }
      callbacks.get(type)!.add(callback);

      return () => callbacks.get(type)?.delete(callback);
    },
    [callbacks]
  );

  // File handling
  const getFileText = useCallback(
    (fileId: string): Y.Text => {
      if (!docRef.current) throw new Error("YJS not initialized");

      if (!fileTexts.has(fileId)) {
        const fileText = docRef.current.getText(`file-${fileId}`);
        fileTexts.set(fileId, fileText);

        // Setup observer
        if (!observers.has(fileText)) {
          const observer = () => {
            callbacks
              .get(`file:${fileId}`)
              ?.forEach((callback) => callback(fileText.toString()));
          };

          fileText.observe(observer);
          observers.set(fileText, observer);
        }
      }

      return fileTexts.get(fileId)!;
    },
    [fileTexts, observers, callbacks]
  );

  // Public API
  const updateFiles = useCallback(
    (newFiles: FileNode[]) => {
      if (!fileSystemMap) return;
      fileSystemMap.set("files", newFiles);
      setFiles(newFiles);
    },
    [fileSystemMap]
  );

  const getFileContent = useCallback(
    (fileId: string): string => {
      try {
        return getFileText(fileId).toString();
      } catch (e) {
        console.error("Failed to get file content:", e);
        return "";
      }
    },
    [getFileText]
  );

  const initializeFileContent = useCallback(
    (fileId: string, content: string) => {
      try {
        const fileText = getFileText(fileId);
        if (fileText.length === 0 && content) {
          fileText.insert(0, content);
        }
      } catch (e) {
        console.error("Failed to initialize file content:", e);
      }
    },
    [getFileText]
  );

  const onFileContentChange = useCallback(
    (fileId: string, callback: (content: string) => void) => {
      try {
        const fileText = getFileText(fileId);
        callback(fileText.toString());
        return addCallback(`file:${fileId}`, callback);
      } catch (e) {
        console.error("Failed to setup file content change handler:", e);
        return () => {};
      }
    },
    [getFileText, addCallback]
  );

  const sendChatMessage = useCallback(
    (text: string) => {
      if (!chatArray || !text.trim()) return;

      const user = providerRef.current?.awareness.getLocalState()?.user;
      const message: Message = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user: user?.name || "Anonymous",
        color: user?.color || "#aac25f",
        avatar: user?.avatar,
        text: text.trim(),
        timestamp: Date.now(),
      };

      chatArray.push([message]);
    },
    [chatArray]
  );

  const updateCursorPosition = useCallback(
    (fileId: string, position: CursorPosition) => {
      providerRef.current?.awareness.setLocalStateField("cursor", {
        fileId,
        ...position,
        timestamp: Date.now(),
      });
    },
    []
  );

  const getUsersInFile = useCallback((fileId: string): CollaborationUser[] => {
    const awareness = providerRef.current?.awareness;
    if (!awareness) return [];

    const users: CollaborationUser[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  }, []);

  const setUserInfo = useCallback(
    (name: string, color?: string, avatar?: string) => {
      providerRef.current?.awareness.setLocalStateField("user", {
        name,
        color:
          color || userColors[Math.floor(Math.random() * userColors.length)],
        avatar,
      });
    },
    [userColors]
  );

  const getAwareness = useCallback((): Awareness | null => {
    return providerRef.current?.awareness || null;
  }, []);

  const destroy = useCallback(() => {
    if (providerRef.current?.awareness) {
      providerRef.current.awareness.setLocalState(null);
    }
    setTimeout(() => {
      cleanupYJS();
    }, 100);
  }, [cleanupYJS]);

  const contextValue: EditorCollaborationContextType = {
    codespace,
    loading,
    error,
    activeSessionIndex,
    setActiveSessionIndex,
    isConnected,
    connectedUsers,
    files,
    updateFiles,
    getFileContent,
    initializeFileContent,
    onFileContentChange,
    messages,
    sendChatMessage,
    updateCursorPosition,
    getUsersInFile,
    setUserInfo,
    getAwareness,
    destroy,
  };

  return (
    <EditorCollaborationContext.Provider value={contextValue}>
      {children}
    </EditorCollaborationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useEditorCollaboration = () => {
  const context = useContext(EditorCollaborationContext);
  if (context === undefined) {
    throw new Error(
      "useEditorCollaboration must be used within an EditorCollaborationProvider"
    );
  }
  return context;
};
