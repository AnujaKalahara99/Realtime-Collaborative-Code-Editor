import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";
import { useCollaboration, type Message } from "./YJSCollaborationService";
import { useTheme } from "../ThemeProvider";
import { ChevronRight } from "lucide-react";

export function ChatSpace() {
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<string>("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const collaboration = useCollaboration();

  // Get current user from awareness
  useEffect(() => {
    const awareness = collaboration.getAwareness();
    if (awareness) {
      const user = awareness.getLocalState()?.user;
      setCurrentUser(user?.name || "Anonymous");
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

  const getAvatarColor = (username: string) => {
    // Generate consistent color based on username
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className={`flex flex-col ${theme.border} border ${theme.surface}`}>
      {/* Header */}
      <div className={`flex-shrink-0 h-20 pb-3 p-4 ${theme.border} border-b`}>
        <h2 className={`text-lg font-semibold ${theme.text}`}>Team Chat</h2>
        <p className={`text-sm ${theme.textSecondary}`}>You: {currentUser}</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1">
        <div
          className="w-full h-[calc(100vh-250px)] p-4 overflow-y-auto Simple-Scrollbar"
          ref={scrollAreaRef}
        >
          <div className="space-y-3">
            {messages.map((msg: Message) => {
              const isCurrentUser = msg.user === currentUser;

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    isCurrentUser
                      ? "justify-start flex-row-reverse"
                      : "justify-start"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium text-white flex-shrink-0 ${
                      isCurrentUser ? "bg-blue-500" : getAvatarColor(msg.user)
                    }`}
                  >
                    {msg.user.substring(0, 2).toUpperCase()}
                  </div>

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
