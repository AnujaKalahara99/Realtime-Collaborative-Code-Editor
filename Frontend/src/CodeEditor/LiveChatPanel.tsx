import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";
import { useYjsChat } from "../yjs/chatProvide";

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: number;
}

interface ChatSpaceProps {
  roomName: string;
  username: string;
  wsUrl: string;
}

export function ChatSpace({ roomName, username, wsUrl }: ChatSpaceProps) {
  const [inputMessage, setInputMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage } = useYjsChat({ roomName, username, wsUrl });

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = useCallback(() => {
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage("");
    }
  }, [inputMessage, sendMessage]);

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
    <div className="w-full max-w-md flex flex-col h-[500px] border rounded-lg bg-white shadow-sm">
      <div className="pb-3 p-4 border-b">
        <h2 className="text-lg font-semibold">Chat Room: {roomName}</h2>
        <p className="text-sm text-gray-500">Logged in as: {username}</p>
      </div>

      <div className="flex-1 overflow-hidden p-0">
        <div className="h-full w-full p-4 overflow-y-auto" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((msg: Message) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  msg.user === username ? "justify-end" : "justify-start"
                }`}
              >
                {msg.user !== username && (
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium">
                    {msg.user.substring(0, 2).toUpperCase()}
                  </div>
                )}

                <div
                  className={`flex flex-col max-w-[70%] ${
                    msg.user === username ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 text-sm ${
                      msg.user === username
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p>{msg.text}</p>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {msg.user === username ? "You" : msg.user} •{" "}
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                {msg.user === username && (
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-medium text-white">
                    {msg.user.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-4 p-4 border-t">
        <input
          type="text"
          placeholder="Type your message..."
          value={inputMessage}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="flex-1 px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSendMessage}
          className="px-4 py-2 bg-blue-500 text-black rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatSpace;
