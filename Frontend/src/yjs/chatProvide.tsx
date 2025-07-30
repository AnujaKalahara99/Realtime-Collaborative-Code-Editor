// import * as Y from "yjs";
// import { WebsocketProvider } from "y-websocket";

// const ydoc = new Y.Doc();
// const provider = new WebsocketProvider(
//   "http://144.24.128.44:4455/",
//   "chat-room",
//   ydoc
// );
// const chatArray = ydoc.getArray("chat");

// export const chatProvider = { chatArray, provider };

import { useEffect, useState, useRef, useCallback } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: number;
}

export interface UseYjsChatProps {
  roomName: string;
  username: string;
  wsUrl: string;
}

interface UseYjsChatReturn {
  messages: Message[];
  sendMessage: (text: string) => void;
}

export function useYjsChat({
  roomName,
  username,
  wsUrl,
}: UseYjsChatProps): UseYjsChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const yArrayRef = useRef<Y.Array<Message> | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);

  useEffect(() => {
    const ydoc = new Y.Doc();
    const yarray = ydoc.getArray<Message>("messages");
    yArrayRef.current = yarray;

    // Initialize the WebSocket provider
    const provider = new WebsocketProvider(
      "http://144.24.128.44:4455",
      roomName,
      ydoc
    );
    providerRef.current = provider;

    const updateMessages = () => {
      setMessages(yarray.toArray());
    };

    yarray.observe(updateMessages);

    updateMessages();

    return () => {
      yarray.unobserve(updateMessages);
      provider.destroy();
      ydoc.destroy(); //**** */
      console.log("Yjs document and provider destroyed.");
    };
  }, [roomName, username, wsUrl]);

  const sendMessage = useCallback(
    (text: string) => {
      if (text.trim() && yArrayRef.current) {
        const newMessage: Message = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          user: username,
          text: text.trim(),
          timestamp: Date.now(),
        };

        yArrayRef.current.push([newMessage]);
      }
    },
    [username]
  );

  return { messages, sendMessage };
}
