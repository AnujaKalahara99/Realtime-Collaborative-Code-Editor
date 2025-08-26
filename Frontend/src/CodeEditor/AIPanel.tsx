import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Send, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTheme } from "../ThemeProvider";

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    // Allow Shift+Enter to create new line (default textarea behavior)
  };

  return (
    <div className={`h-full ${theme.surface} ${theme.text} p-4`}>
      {/* CardHeader */}
      <div className={`flex flex-col space-y-1.5 p-6 border-b ${theme.border}`}>
        <h3
          className={`flex items-center gap-2 text-lg font-semibold leading-none tracking-tight ${theme.text}`}
        >
          <Bot className="w-6 h-6" /> Ask AI Assistant
        </h3>
      </div>

      {/* CardContent */}
      <div className="flex-1 ">
        {/* flex flex-col h-[calc(100vh-250px)] p-4 pt-0 min-h-0 */}
        {/* ScrollArea - Fixed height and proper overflow */}
        <div
          ref={scrollContainerRef}
          className="w-full h-[calc(100vh-250px)] p-4 overflow-y-auto Simple-Scrollbar"
        >
          <div className="space-y-4 py-2">
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
                    {/* <img src="/placeholder.svg?height=32&width=32" alt="AI Avatar" className="aspect-square h-full w-full" /> */}
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
                    {/* <img src="/placeholder.svg?height=32&width=32" alt="User Avatar" className="aspect-square h-full w-full" /> */}
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
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 flex-shrink-0 items-end"
        >
          <textarea
            placeholder="Ask your problem.... "
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={1}
            className={`flex-1 min-h-[40px] max-h-[120px] w-full rounded-md border ${theme.border} ${theme.surface} px-3 py-2 text-sm ${theme.textMuted} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${theme.text} resize-none`}
            style={{
              height: "auto",
              minHeight: "40px",
              maxHeight: "120px",
              overflowY: input.split("\n").length > 3 ? "auto" : "hidden",
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = Math.min(target.scrollHeight, 120) + "px";
            }}
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2`}
          >
            <Send className="w-4 h-4" />
            <span className="sr-only">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
