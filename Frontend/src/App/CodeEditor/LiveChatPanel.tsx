import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";
import {
  useCollaboration,
  type CollaborationUser,
  type Message,
} from "./YJSCollaborationService";
import { useTheme } from "../../Contexts/ThemeProvider";
import { ChevronRight, Trash2 } from "lucide-react";
import Avatar from "../../components/Avatar";

export function ChatSpace() {
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<CollaborationUser | null>(
    null
  );
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const collaboration = useCollaboration();

  useEffect(() => {
    const awareness = collaboration.getAwareness();
    if (awareness) {
      const user = awareness.getLocalState()?.user;
      setCurrentUser(user);

      // Listen for awareness changes to catch when user is set asynchronously
      const handleAwarenessChange = () => {
        const updatedUser = awareness.getLocalState()?.user;
        if (updatedUser) {
          setCurrentUser(updatedUser);
        }
      };

      awareness.on("change", handleAwarenessChange);
      return () => {
        awareness.off("change", handleAwarenessChange);
      };
    }
  }, [collaboration]);

  // Subscribe to chat messages
  useEffect(() => {
    const unsubscribe = collaboration.onChatChange(setMessages);
    return unsubscribe;
  }, [collaboration]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Close delete confirmation when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showDeleteConfirm &&
        !(event.target as Element).closest(".delete-confirmation")
      ) {
        setShowDeleteConfirm(null);
      }
    };

    if (showDeleteConfirm) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDeleteConfirm]);

  const handleSendMessage = useCallback(() => {
    if (inputMessage.trim()) {
      collaboration.sendChatMessage(inputMessage);
      setInputMessage("");
    }
  }, [inputMessage, collaboration]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
      // Allow Shift+Enter to create new line (default textarea behavior)
    },
    [handleSendMessage]
  );

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
  };

  const handleDeleteMessage = useCallback(
    (messageId: string) => {
      const success = collaboration.deleteChatMessage(messageId);
      if (success) {
        setShowDeleteConfirm(null);
      }
    },
    [collaboration]
  );

  const confirmDelete = (messageId: string) => {
    setShowDeleteConfirm(messageId);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  return (
    <div className={`flex flex-col ${theme.surface}`}>
      {/* Header */}
      <div className={`flex-shrink-0 h-20 pb-3 p-4 ${theme.border} border-b`}>
        <h2 className={`text-lg font-semibold ${theme.text}`}>Team Chat</h2>
        <p className={`text-sm ${theme.textSecondary}`}>
          You: {currentUser?.name || "Anonymous"}
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1">
        <div
          className="w-full h-[calc(100vh-250px)] p-4 overflow-y-auto Simple-Scrollbar"
          ref={scrollAreaRef}
        >
          <div className="space-y-3">
            {messages.map((msg: Message) => {
              const isCurrentUser = msg.user === currentUser?.name;
              const isDeleteConfirmOpen = showDeleteConfirm === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    isCurrentUser
                      ? "justify-start flex-row-reverse"
                      : "justify-start"
                  }`}
                  onMouseEnter={() => setHoveredMessageId(msg.id)}
                  onMouseLeave={() => setHoveredMessageId(null)}
                >
                  <Avatar
                    name={msg.user}
                    src={msg.avatar}
                    color={undefined}
                    size="medium"
                  />

                  {/* Message bubble */}
                  <div
                    className={`flex flex-col max-w-[75%] ${
                      isCurrentUser ? "items-end" : "items-start"
                    } relative group`}
                  >
                    {/* Username (only for other users) */}
                    {!isCurrentUser && (
                      <span
                        className={`text-xs font-medium ${theme.textSecondary} mb-1 px-1`}
                      >
                        {msg.user}
                      </span>
                    )}

                    {/* Message content with delete button */}
                    <div className="relative">
                      <div
                        className={`px-4 py-2 text-sm shadow-sm ${
                          isCurrentUser
                            ? "bg-blue-500 text-white rounded-br-md"
                            : `${theme.surfaceSecondary} ${theme.text} rounded-bl-md`
                        }`}
                      >
                        <p className="break-words">{msg.text}</p>
                      </div>

                      {/* Delete button (only for current user's messages) */}
                      {isCurrentUser && hoveredMessageId === msg.id && (
                        <button
                          onClick={() => confirmDelete(msg.id)}
                          className={`absolute -top-2 ${
                            isCurrentUser ? "-left-8" : "-right-8"
                          } p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all duration-200 shadow-lg`}
                          title="Delete message"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Delete confirmation dialog */}
                    {isDeleteConfirmOpen && (
                      <div
                        className={`delete-confirmation absolute z-10 mt-1 p-3 ${
                          theme.surface
                        } ${theme.border} border rounded-lg shadow-lg ${
                          isCurrentUser ? "right-0" : "left-0"
                        }`}
                        style={{ top: "100%" }}
                      >
                        <p className={`text-xs ${theme.text} mb-2`}>
                          Delete this message?
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                          >
                            Delete
                          </button>
                          <button
                            onClick={cancelDelete}
                            className={`px-2 py-1 text-xs ${theme.surfaceSecondary} ${theme.text} rounded hover:${theme.hover} transition-colors`}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Timestamp */}
                    <span className={`text-xs ${theme.textMuted} mt-1 px-1`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div
        className={`flex-shrink-0 min-h-20 flex items-end gap-2 pt-4 p-4 ${theme.border} border-t`}
      >
        <textarea
          placeholder="Type a message... "
          value={inputMessage}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          rows={1}
          className={`flex-1 px-4 py-2 ${theme.border} border ${theme.surface} focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme.text} transition-all resize-none min-h-[40px] max-h-[120px]`}
          style={{
            height: "auto",
            minHeight: "40px",
            maxHeight: "120px",
            overflowY: inputMessage.split("\n").length > 3 ? "auto" : "hidden",
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = Math.min(target.scrollHeight, 120) + "px";
          }}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim()}
          className={`p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${theme.hover}`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default ChatSpace;
