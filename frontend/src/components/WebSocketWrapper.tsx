import React, { useCallback, useEffect, useState } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import { useAuth } from "../hooks/useAuth";

interface WebSocketWrapperProps {
  children?: React.ReactNode;
}

export const WebSocketWrapper: React.FC<WebSocketWrapperProps> = ({
  children,
}) => {
  const { user } = useAuth();
  const [selectedChatUser, setSelectedChatUser] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<
    Array<{ from: string; message: string; timestamp: string }>
  >([]);
  const [newMessage, setNewMessage] = useState("");

  const webSocketHook = useWebSocket();
  const {
    isConnected,
    isConnecting,
    error,
    connectedUsers,
    connect,
    disconnect,
    sendMessage,
    getConnectedUsers,
  } = webSocketHook;

  // Connect when user is available
  useEffect(() => {
    if (user?.id) {
      connect(user.id.toString());
    }
  }, [user, connect]);

  // Handle incoming messages
  const handleMessage = useCallback(
    (message: { from: string; message: string; timestamp: string }) => {
      console.log("Received message:", message);
      setChatMessages((prev) => [
        ...prev,
        {
          from: message.from,
          message: message.message,
          timestamp: message.timestamp,
        },
      ]);
    },
    []
  );

  // Set up the message handler
  useEffect(() => {
    webSocketHook.onMessage = handleMessage;

    return () => {
      webSocketHook.onMessage = undefined;
    };
  }, [webSocketHook, handleMessage]);

  const handleUserClick = (userId: string) => {
    setSelectedChatUser(userId);
    setChatMessages([]);
  };

  const handleSendMessage = () => {
    if (selectedChatUser && newMessage.trim()) {
      sendMessage(selectedChatUser, newMessage.trim());
      setChatMessages((prev) => [
        ...prev,
        {
          from: user?.id?.toString() || "",
          message: newMessage.trim(),
          timestamp: new Date().toISOString(),
        },
      ]);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const closeChat = () => {
    setSelectedChatUser(null);
    setChatMessages([]);
  };

  if (!user) {
    return <div>Please log in to use the chat</div>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "20px" }}>
        <h2>WebSocket Connection Status</h2>
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: isConnected
                ? "#4CAF50"
                : isConnecting
                ? "#FF9800"
                : "#F44336",
            }}
          />
          <span>
            {isConnecting
              ? "Connecting..."
              : isConnected
              ? "Connected"
              : "Disconnected"}
          </span>
          {error && <span style={{ color: "red" }}>Error: {error}</span>}
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => user && connect(user.id.toString())}
            disabled={isConnected || isConnecting}
            style={{
              padding: "8px 16px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            Connect
          </button>
          <button
            onClick={disconnect}
            disabled={!isConnected}
            style={{
              padding: "8px 16px",
              backgroundColor: "#F44336",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            Disconnect
          </button>
          <button
            onClick={getConnectedUsers}
            disabled={!isConnected}
            style={{
              padding: "8px 16px",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            Refresh Users
          </button>
        </div>
      </div>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "15px",
        }}
      >
        <h3>
          Connected Users (
          {
            connectedUsers.filter((u) => u.user_id !== user.id.toString())
              .length
          }
          )
        </h3>
        {connectedUsers.filter((u) => u.user_id !== user.id.toString())
          .length === 0 ? (
          <p>No other users connected</p>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {connectedUsers
              .filter((u) => u.user_id !== user.id.toString())
              .map((connectedUser) => (
                <div
                  key={connectedUser.user_id}
                  onClick={() => handleUserClick(connectedUser.user_id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px",
                    border: "1px solid #eee",
                    borderRadius: "4px",
                    backgroundColor: "#f9f9f9",
                    cursor: "pointer",
                    transition: "background-color 0.2s ease",
                    color: "black",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#e3f2fd";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#f9f9f9";
                  }}
                >
                  {connectedUser.avatar_url && (
                    <img
                      src={connectedUser.avatar_url}
                      alt={connectedUser.name}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                      }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "bold" }}>
                      {connectedUser.name}
                    </div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      Connected:{" "}
                      {new Date(
                        connectedUser.connected_at
                      ).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Chat Interface */}
      {selectedChatUser && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "400px",
            height: "500px",
            backgroundColor: "white",
            border: "2px solid #ddd",
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            zIndex: 1000,
          }}
        >
          {/* Chat Header */}
          <div
            style={{
              padding: "15px",
              borderBottom: "1px solid #ddd",
              backgroundColor: "#f5f5f5",
              borderRadius: "6px 6px 0 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 style={{ margin: 0 }}>
              Chat with{" "}
              {connectedUsers.find((u) => u.user_id === selectedChatUser)
                ?.name || "User"}
            </h3>
            <button
              onClick={closeChat}
              style={{
                background: "none",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
                color: "#666",
              }}
            >
              ×
            </button>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              padding: "15px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {chatMessages.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  color: "#666",
                  marginTop: "20px",
                }}
              >
                Start a conversation!
              </p>
            ) : (
              chatMessages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    alignSelf:
                      msg.from === user?.id?.toString()
                        ? "flex-end"
                        : "flex-start",
                    maxWidth: "70%",
                  }}
                >
                  <div
                    style={{
                      padding: "10px 15px",
                      borderRadius: "15px",
                      backgroundColor:
                        msg.from === user?.id?.toString()
                          ? "#2196F3"
                          : "#f1f1f1",
                      color:
                        msg.from === user?.id?.toString() ? "white" : "black",
                      wordWrap: "break-word",
                    }}
                  >
                    {msg.message}
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#666",
                      marginTop: "5px",
                      textAlign:
                        msg.from === user?.id?.toString() ? "right" : "left",
                    }}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <div
            style={{
              padding: "15px",
              borderTop: "1px solid #ddd",
              display: "flex",
              gap: "10px",
            }}
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              style={{
                flex: 1,
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              style={{
                padding: "10px 20px",
                backgroundColor: "#2196F3",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: newMessage.trim() ? "pointer" : "not-allowed",
                opacity: newMessage.trim() ? 1 : 0.6,
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Render children if provided */}
      {children}
    </div>
  );
};
