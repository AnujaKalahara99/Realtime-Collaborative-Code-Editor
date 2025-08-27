import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Send, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTheme } from "../../Contexts/ThemeProvider";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AskAIPanel() {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    // Use setTimeout to ensure DOM has updated
    setTimeout(() => {
      // Try scrolling the container first
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop =
          scrollContainerRef.current.scrollHeight;
      }
      // Fallback to scrollIntoView
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]); // Also scroll when loading state changes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Failed to get reader from response body.");
      }

      let assistantResponseContent = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]); // Add empty assistant message

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        assistantResponseContent += chunk;
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage.role === "assistant") {
            const updated = [
              ...prev.slice(0, -1),
              { ...lastMessage, content: assistantResponseContent },
            ];
            // Trigger scroll after state update
            setTimeout(() => scrollToBottom(), 50);
            return updated;
          }
          return prev; // Should not happen if logic is correct
        });
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Error: Could not get a response from the AI.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    // Allow Shift+Enter to create new line (default textarea behavior)
  };

  return (
    <div
      className={`w-full h-full flex flex-col ${theme.surface} ${theme.text}`}
    >
      {/* CardHeader */}
      <div className={`flex-shrink-0 p-4 border-b ${theme.border}`}>
        <h3
          className={`flex items-center gap-2 text-lg font-semibold leading-none tracking-tight ${theme.text}`}
        >
          <Bot className="w-6 h-6" /> Ask AI Assistant
        </h3>
      </div>

      {/* CardContent */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* ScrollArea - Using the LiveChatPanel approach */}
        <div
          ref={scrollContainerRef}
          className="flex-1 w-full max-h-[calc(100vh-230px)] overflow-y-auto p-4 Simple-Scrollbar"
        >
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className={`text-center ${theme.textMuted} py-8`}>
                Start a conversation with your coding AI assistant!
              </div>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div
                    className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${theme.surfaceSecondary} flex items-center justify-center text-sm font-medium ${theme.text}`}
                  >
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : `${theme.surfaceSecondary} ${theme.text}`
                  }`}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ className, children }) {
                        const isCodeBlock =
                          className && className.startsWith("language-");
                        if (!isCodeBlock) {
                          return (
                            <code
                              className={`relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold ${theme.surfaceSecondary} ${theme.text}`}
                            >
                              {children}
                            </code>
                          );
                        }

                        return (
                          <pre
                            className={`relative overflow-x-auto rounded-lg p-4 text-sm ${theme.surface} ${theme.text}`}
                          >
                            <code className="block whitespace-pre-wrap">
                              {children}
                            </code>
                          </pre>
                        );
                      },
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
                {msg.role === "user" && (
                  <div
                    className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${theme.surfaceSecondary} flex items-center justify-center text-sm font-medium ${theme.text}`}
                  >
                    You
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3 justify-start">
                <div
                  className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${theme.surfaceSecondary} flex items-center justify-center text-sm font-medium ${theme.text}`}
                >
                  AI
                </div>
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${theme.surfaceSecondary} ${theme.text} animate-pulse`}
                >
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <form
          onSubmit={handleSubmit}
          className={`flex-shrink-0 flex gap-2 p-4 border-t ${theme.border}`}
        >
          <input
            type="text"
            placeholder="Ask a coding question or paste code for correction..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className={`flex-1 h-10 rounded-md border ${theme.border} ${theme.surface} px-3 py-2 text-sm ${theme.text} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50`}
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2`}
          >
            <Send className="w-4 h-4" />
            <span className="sr-only">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
