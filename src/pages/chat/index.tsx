import React, { useState, useRef } from "react";
import { apiClient } from "@/lib/apiClient"; // Adjust the import based on your project structure
import { handleStream } from '@/lib/utils/handleStream';
import { MessageResponse, MessageRole } from "@/lib/apiClient/schemas/message";
import { v4 as uuidv4 } from 'uuid';
import LoadingContaner from "./_components/LoadingContainer";
import ChatBubble from "@/components/ChatBubble";

const ChatScreen = () => {
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const inputChatRef = useRef<HTMLInputElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const handleSend = async () => {
    if (!inputChatRef.current) return;
    const message = inputChatRef.current.value.trim();

    if (!message || isStreaming) return;

    try {
      setIsStreaming(true);
      const userMessage: MessageResponse = { id: uuidv4(), role: MessageRole.Values.user, content: message };
      setMessages(prev => [...prev, userMessage]);

      const response = await apiClient.postMessageAPI({ message });
      inputChatRef.current.value = "";

      // Initialize assistant's response
      // setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      handleStream(response, {
        onMessage: (data) => {
          setMessages(prev => {
            const _messages = [...prev];
            const lastMessage = _messages[_messages.length - 1];
            if (lastMessage.id === data.id) {
              lastMessage.content += data.content;
            }
            else {
              _messages.push(data)
            }
            return _messages;
          });
        },
        onError: (error) => {
          console.error('Stream error:', error);
          // Handle error in UI
        },
        onClose: () => {
          setIsStreaming(false);
          // Handle stream completion
        },
        onOpen: () => {
          console.log('Stream started');
        }
      });

    } catch (error) {
      console.error('Failed to send message:', error);
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <header
        style={{ padding: "10px", backgroundColor: "#007bff", color: "#fff" }}
      >
        <h1>Chat</h1>
      </header>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "10px",
          backgroundColor: "#f1f1f1",
        }}
      >
        {messages.map((msg, index) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
        <LoadingContaner />
      </div>
      <footer
        style={{ display: "flex", padding: "10px", backgroundColor: "#fff" }}
      >
        <input
          type="text"
          ref={inputChatRef}
          style={{
            flex: 1,
            padding: "20px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            backgroundColor: "#f1f1f1",
            color: "#333",
            fontSize: "16px",
          }}
          placeholder="Type a message..."
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
        />
        <button
          onClick={handleSend}
          style={{
            marginLeft: "10px",
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          disabled={isStreaming}
        >
          Send
        </button>
      </footer>
    </div>
  );
};

export default ChatScreen;
