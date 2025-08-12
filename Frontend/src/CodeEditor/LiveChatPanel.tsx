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
} from "./YJSCollaborationService.duplicate";
import { useTheme } from "../ThemeProvider";
import { ChevronRight } from "lucide-react";
import Avatar from "../components/Avatar";

export function ChatSpace() {
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<CollaborationUser | null>(
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

  const handleSendMessage = useCallback(() => {
    if (inputMessage.trim()) {
      collaboration.sendChatMessage(inputMessage);
      setInputMessage("");
    }
  }, [inputMessage, collaboration]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  return (
    <div className={`flex flex-col ${theme.border} border ${theme.surface}`}>
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

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    isCurrentUser
                      ? "justify-start flex-row-reverse"
                      : "justify-start"
                  }`}
                >
                  <Avatar
                    name={msg.user}
                    src={msg.avatar}
                    color={isCurrentUser ? "#3B82F6" : undefined} // Blue for current user
                    size="medium"
                  />

                  {/* Message bubble */}
                  <div
                    className={`flex flex-col max-w-[75%] ${
                      isCurrentUser ? "items-end" : "items-start"
                    }`}
                  >
                    {/* Username (only for other users) */}
                    {!isCurrentUser && (
                      <span
                        className={`text-xs font-medium ${theme.textSecondary} mb-1 px-1`}
                      >
                        {msg.user}
                      </span>
                    )}

                    {/* Message content */}
                    <div
                      className={`px-4 py-2 text-sm shadow-sm ${
                        isCurrentUser
                          ? "bg-blue-500 text-white rounded-br-md"
                          : `${theme.surfaceSecondary} ${theme.text} rounded-bl-md`
                      }`}
                    >
                      <p className="break-words">{msg.text}</p>
                    </div>

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
        className={`flex-shrink-0 h-20 flex items-center gap-2 pt-4 p-4 ${theme.border} border-t`}
      >
        <input
          type="text"
          placeholder="Type a message..."
          value={inputMessage}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className={`flex-1 px-4 py-2 ${theme.border} border ${theme.input} focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme.text} transition-all`}
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
