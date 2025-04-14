import React, { useState, useRef } from "react";
import { apiClient } from "@/lib/apiClient"; // Adjust the import based on your project structure

const ChatScreen = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const inputChatRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (!inputChatRef.current) return;
    const message = inputChatRef.current.value;
    if (message.trim()) {
      //   const stream = await apiClient.postMessageStream(message);
      //   console.log("stream", stream);
      inputChatRef.current.value = "";
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
          <div
            key={index}
            style={{
              margin: "5px 0",
              padding: "10px",
              backgroundColor: "#fff",
              borderRadius: "5px",
            }}
          >
            {msg}
          </div>
        ))}
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
        >
          Send
        </button>
      </footer>
    </div>
  );
};

export default ChatScreen;
