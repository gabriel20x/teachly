import { useWebSocketContext } from "../hooks/useWebSocketContext";
import { useAuth } from "../hooks/useAuth";
import { useRef } from "react";
import { SentMessageBubble } from "./chat/SentMessageBubble";
import { ReceivedMessageBubble } from "./chat/ReceivedMessageBubble";
import { Avatar } from "./Avatar";

export const ChatBox = () => {
  const { user } = useAuth();
  const {
    selectedChatUser,
    chatMessages,
    newMessage,
    setNewMessage,
    sendMessage,
    isConnected,
    connectedUsers,
    isLoadingHistory,
    usersTyping,
  } = useWebSocketContext();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedChatUser && newMessage.trim()) {
      sendMessage(selectedChatUser.user_id, newMessage);
    }
  };

  return (
    <div
      className="rounded border"
      style={{
        height: "100%",
        display: "flex",
        flex: 1,
        flexDirection: "column",
        backgroundColor: "var(--bg-primary)",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "var(--bg-secondary)",
          padding: "1.5rem",
          borderBottom: "1px solid var(--border-light)",
          display: "flex",
          alignItems: "center",
          gap: "2.4rem",
        }}
      >
        <Avatar src={selectedChatUser?.avatar_url || ""} alt={selectedChatUser?.name || ""} size={48} />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <h1 className="text-large font-bold text-accent">{selectedChatUser?.name}</h1>
          <p className="text-small text-success">
            {isConnected ? "Online" : "Connecting..."}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {isLoadingHistory && (
          <div className="text-center text-muted">Loading chat history...</div>
        )}

        {!selectedChatUser && (
          <div className="text-center text-muted">
            Select a user to start chatting
          </div>
        )}

        {selectedChatUser &&
          chatMessages.map((message) =>
            message.from === user?.id ? (
              <SentMessageBubble
                key={message.id}
                message={message.message}
                time={message.timestamp}
                status={
                  message.seen_at
                    ? "read"
                    : message.delivered_at
                    ? "delivered"
                    : "pending"
                }
              />
            ) : (
              <ReceivedMessageBubble
                key={message.id}
                message={message.message}
                time={message.timestamp}
              />
            )
          )}

        {selectedChatUser && usersTyping.has(selectedChatUser.user_id) && (
          <div className="text-small text-muted italic">
            {connectedUsers.find((u) => u.user_id === selectedChatUser.user_id)?.name}{" "}
            is typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div
        style={{
          backgroundColor: "var(--bg-secondary)",
          padding: "1.5rem",
          borderTop: "1px solid var(--border-light)",
        }}
      >
        <form
          onSubmit={handleSendMessage}
          style={{ display: "flex", gap: "1rem" }}
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="rounded text-base"
            style={{
              flex: 1,
              padding: "1rem",
              backgroundColor: "var(--bg-tertiary)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              outline: "none",
            }}
            placeholder={
              selectedChatUser
                ? "Type your message..."
                : "Select a user to chat"
            }
            disabled={!selectedChatUser}
          />
          <button
            type="submit"
            className="rounded text-base font-medium shadow-light transition"
            style={{
              padding: "1rem 2rem",
              backgroundColor: selectedChatUser
                ? "var(--accent-primary)"
                : "var(--bg-tertiary)",
              color: selectedChatUser
                ? "var(--text-inverted)"
                : "var(--text-muted)",
              border: "none",
              cursor: selectedChatUser ? "pointer" : "not-allowed",
            }}
            disabled={!selectedChatUser}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
