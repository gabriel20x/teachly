import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { useWebSocket } from "../hooks/useWebSocket";
import type { ChatMessage, MessageSentEvent, MessageDeliveredEvent, MessageSeenEvent } from "../hooks/useWebSocket";
import { LinkWarningModal } from "./LinkWarningModal";
import { validateMessageInput, renderSafeMessage } from "../utils/messageSecurity";

interface WebSocketWrapperProps {
  children?: React.ReactNode;
}

export const WebSocketWrapper: React.FC<WebSocketWrapperProps> = ({
  children,
}) => {
  const { user } = useAuth();
  const webSocketHook = useWebSocket();
  const [selectedChatUser, setSelectedChatUser] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<
    Array<{
      id: number;
      from: number;
      to: number;
      message: string;
      timestamp: string;
      delivered_at?: string | null;
      seen_at?: string | null;
    }>
  >([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [usersTyping, setUsersTyping] = useState<Set<string>>(new Set());
  const [isCurrentlyTyping, setIsCurrentlyTyping] = useState(false);
  const [linkWarningModal, setLinkWarningModal] = useState<{
    isOpen: boolean;
    url: string;
  }>({ isOpen: false, url: "" });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMarkedChatRef = useRef<string | null>(null);

  const {
    isConnected,
    isConnecting,
    error,
    connectedUsers,
    connect,
    disconnect,
    sendMessage,
    getConnectedUsers,
    markMessagesSeen,
  } = webSocketHook;

  // Connect when user is available
  useEffect(() => {
    if (user?.id) {
      connect(user.id.toString());
    }
  }, [user, connect]);

  // Handle incoming messages
  const handleMessage = useCallback( (message: ChatMessage) => {
    console.log("Received message:", message);
    if (message.from === selectedChatUser || message.from === user?.id.toString()) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: message.message_id,
          from: parseInt(message.from),
          to: parseInt(selectedChatUser || "0"),
          message: message.message,
          timestamp: message.timestamp,
          delivered_at: null,
          seen_at: null,
        },
      ]);
      
      // If the message is from the selected chat user and chat is open, mark as seen
      if (message.from === selectedChatUser && selectedChatUser) {
        console.log(`Auto-marking new message as seen from user ${selectedChatUser}`);
        // Small delay to ensure message is added to state
        setTimeout(() => {
          markMessagesSeen(selectedChatUser);
        }, 100);
      }
    }
  }, [selectedChatUser, user?.id, markMessagesSeen]);

  const handleMessageSent = useCallback( (event: MessageSentEvent) => {
    console.log("Message sent confirmed:", event);
    // Add the sent message to chat with server timestamp
    setChatMessages((prev) => [
      ...prev,
      {
        id: event.message_id,
        from: user?.id || 0,
        to: parseInt(event.to),
        message: event.message,
        timestamp: event.timestamp,
        delivered_at: null,
        seen_at: null,
      },
    ]);
  }, [user?.id]);

  const handleMessageDelivered = useCallback((event: MessageDeliveredEvent) => {
    console.log("Message delivered:", event);
    setChatMessages((prev) => 
      prev.map((msg) => 
        msg.id === event.message_id 
          ? { ...msg, delivered_at: event.delivered_at }
          : msg
      )
    );
  }, []);

  const handleMessageSeen = useCallback((event: MessageSeenEvent) => {
    console.log("Message seen:", event);
    setChatMessages((prev) => 
      prev.map((msg) => 
        msg.id === event.message_id 
          ? { ...msg, seen_at: event.seen_at }
          : msg
      )
    );
  }, []);

  const handleTyping = useCallback((event: { from: string; is_typing: boolean }) => {
    console.log("Typing event:", event);
    setUsersTyping((prev) => {
      const newTyping = new Set(prev);
      if (event.is_typing) {
        newTyping.add(event.from);
      } else {
        newTyping.delete(event.from);
      }
      return newTyping;
    });
  }, []);

  // Set up the message handlers
  useEffect(() => {
    webSocketHook.onMessage = handleMessage;
    webSocketHook.onMessageSent = handleMessageSent;
    webSocketHook.onMessageDelivered = handleMessageDelivered;
    webSocketHook.onMessageSeen = handleMessageSeen;
    webSocketHook.onTyping = handleTyping;

    return () => {
      webSocketHook.onMessage = undefined;
      webSocketHook.onMessageSent = undefined;
      webSocketHook.onMessageDelivered = undefined;
      webSocketHook.onMessageSeen = undefined;
      webSocketHook.onTyping = undefined;
    };
  }, [webSocketHook, handleMessage, handleMessageSent, handleMessageDelivered, handleMessageSeen, handleTyping]);

  const handleUserClick = async (userId: string) => {
    // Send typing stop to previous user if currently typing
    if (selectedChatUser && isCurrentlyTyping && selectedChatUser !== userId) {
      webSocketHook.sendTyping(selectedChatUser, false);
    }
    
    setSelectedChatUser(userId);
    setChatMessages([]);
    setIsLoadingHistory(true);
    setIsCurrentlyTyping(false);
    
    // Load chat history
    if (user?.id) {
      try {
        const response = await fetch(
          `http://localhost:8000/history/${user.id}/${userId}`
        );
        if (response.ok) {
          const history = await response.json();
          setChatMessages(history.map((msg: {id: number, from: number, to: number, message: string, timestamp: string, delivered_at?: string | null, seen_at?: string | null}) => ({
            id: msg.id,
            from: msg.from,
            to: msg.to,
            message: msg.message,
            timestamp: msg.timestamp,
            delivered_at: msg.delivered_at,
            seen_at: msg.seen_at,
          })));
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    }
  };

  const handleSendMessage = () => {
    if (selectedChatUser && newMessage.trim()) {
      // Validate and sanitize the message
      const validation = validateMessageInput(newMessage);
      
      if (!validation.isValid) {
        console.error("Message validation failed:", validation.errors);
        // You could show an error toast here
        return;
      }

      // Send typing stop when message is sent (only if currently typing)
      if (isCurrentlyTyping) {
        webSocketHook.sendTyping(selectedChatUser, false);
        setIsCurrentlyTyping(false);
      }
      
      sendMessage(selectedChatUser, validation.sanitizedMessage);
      console.log("time", new Date().toISOString());
      setNewMessage("");
    }
  };

  const handleLinkClick = (url: string, isExternal: boolean) => {
    if (isExternal) {
      // Show warning modal for external links
      setLinkWarningModal({ isOpen: true, url });
    } else {
      // Direct navigation for internal links
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleLinkWarningClose = () => {
    setLinkWarningModal({ isOpen: false, url: "" });
  };

  const handleLinkWarningConfirm = () => {
    window.open(linkWarningModal.url, '_blank', 'noopener,noreferrer');
    setLinkWarningModal({ isOpen: false, url: "" });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);
    
    // Send typing indicator only when state changes
    if (selectedChatUser) {
      const shouldBeTyping = value.trim().length > 0;
      
      // Only send event if the typing state has changed
      if (shouldBeTyping !== isCurrentlyTyping) {
        webSocketHook.sendTyping(selectedChatUser, shouldBeTyping);
        setIsCurrentlyTyping(shouldBeTyping);
      }
    }
  };





  const closeChat = () => {
    // Send typing stop when closing chat (only if currently typing)
    if (selectedChatUser && isCurrentlyTyping) {
      webSocketHook.sendTyping(selectedChatUser, false);
    }
    
    setSelectedChatUser(null);
    setChatMessages([]);
    setUsersTyping(new Set());
    setIsCurrentlyTyping(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Generate message status indicator
  const getMessageStatusIcon = (message: typeof chatMessages[0]) => {
    if (message.from !== user?.id) {
      return null; // Don't show status for received messages
    }
    
    if (message.seen_at) {
      return (
        <span style={{ color: "#2196F3", fontSize: "12px", marginLeft: "5px" }}>
          ✓✓
        </span>
      );
    } else if (message.delivered_at) {
      return (
        <span style={{ color: "#666", fontSize: "12px", marginLeft: "5px" }}>
          ✓✓
        </span>
      );
    } else {
      return (
        <span style={{ color: "#666", fontSize: "12px", marginLeft: "5px" }}>
          ✓
        </span>
      );
    }
  };

  // Mark messages as seen only when opening a new chat (simplified)
  useEffect(() => {
    if (selectedChatUser && selectedChatUser !== lastMarkedChatRef.current) {
      lastMarkedChatRef.current = selectedChatUser;
      
      // Delay to ensure messages are loaded from history
      const timeoutId = setTimeout(() => {
        console.log(`Marking messages as seen for user ${selectedChatUser}`);
        markMessagesSeen(selectedChatUser);
      }, 1000); // Increased delay to ensure history is fully loaded

      return () => clearTimeout(timeoutId);
    }
  }, [selectedChatUser]); // Only selectedChatUser as dependency

  // Reset the ref when chat is closed
  useEffect(() => {
    if (!selectedChatUser) {
      lastMarkedChatRef.current = null;
    }
  }, [selectedChatUser]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

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
                         {isLoadingHistory ? (
               <p
                 style={{
                   textAlign: "center",
                   color: "#666",
                   marginTop: "20px",
                 }}
               >
                 Loading chat history...
               </p>
             ) : chatMessages.length === 0 ? (
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
                      msg.from === user?.id
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
                        msg.from === user?.id
                          ? "#2196F3"
                          : "#f1f1f1",
                      color:
                        msg.from === user?.id ? "white" : "black",
                      wordWrap: "break-word",
                    }}
                  >
                    {renderSafeMessage(msg.message, handleLinkClick)}
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#666",
                      marginTop: "5px",
                      textAlign:
                        msg.from === user?.id ? "right" : "left",
                    }}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {getMessageStatusIcon(msg)}
                  </div>
                </div>
               ))
             )}
             <div ref={messagesEndRef} />
           </div>

          {/* Typing Indicator */}
          {selectedChatUser && usersTyping.has(selectedChatUser) && (
            <div
              style={{
                padding: "8px 15px",
                fontSize: "12px",
                color: "#666",
                fontStyle: "italic",
                borderTop: "1px solid #f0f0f0",
                backgroundColor: "#f9f9f9",
              }}
            >
              {connectedUsers.find((u) => u.user_id === selectedChatUser)?.name || "User"} is typing...
            </div>
          )}

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
              onChange={handleInputChange}
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

      {/* Link Warning Modal */}
      <LinkWarningModal
        isOpen={linkWarningModal.isOpen}
        url={linkWarningModal.url}
        onClose={handleLinkWarningClose}
        onConfirm={handleLinkWarningConfirm}
      />

      {/* Render children if provided */}
      {children}
    </div>
  );
};
