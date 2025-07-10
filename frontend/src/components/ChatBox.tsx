import { useWebSocketContext } from "../hooks/useWebSocketContext";
import { useAuth } from "../hooks/useAuth";
import { useRef, useEffect, useCallback, useState } from "react";
import { SentMessageBubble } from "./chat/SentMessageBubble";
import { ReceivedMessageBubble } from "./chat/ReceivedMessageBubble";
import { Avatar } from "./Avatar";
import { LinkWarningModal } from "./LinkWarningModal";
import { TypingIndicator } from "./chat/TypingIndicator";

export const ChatBox = () => {
  const { user } = useAuth();
  const {
    selectedChatUser,
    chatMessages,
    newMessage,
    setNewMessage,
    sendMessage,
    sendTyping,
    markMessagesSeen,
    isConnected,
    connectedUsers,
    isLoadingHistory,
    usersTyping,
    isCurrentlyTyping,
    setIsCurrentlyTyping,
  } = useWebSocketContext();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [linkWarningModal, setLinkWarningModal] = useState<{
    isOpen: boolean;
    url: string;
  }>({ isOpen: false, url: "" });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedChatUser && newMessage.trim()) {
      // Send typing stop when message is sent (only if currently typing)
      if (isCurrentlyTyping) {
        sendTyping(selectedChatUser.user_id, false);
        setIsCurrentlyTyping(false);
      }

      sendMessage(selectedChatUser.user_id, newMessage);
    }
  };

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setNewMessage(value);

      // Send typing indicator only when state changes (like WebSocketWrapper)
      if (selectedChatUser) {
        const shouldBeTyping = value.trim().length > 0;

        // Only send event if the typing state has changed
        if (shouldBeTyping !== isCurrentlyTyping) {
          sendTyping(selectedChatUser.user_id, shouldBeTyping);
          setIsCurrentlyTyping(shouldBeTyping);
        }
      }
    },
    [selectedChatUser, setNewMessage, sendTyping, isCurrentlyTyping]
  );

  const handleLinkClick = (url: string, isExternal: boolean) => {
    if (isExternal) {
      // Show warning modal for external links
      setLinkWarningModal({ isOpen: true, url });
    } else {
      // Direct navigation for internal links
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleLinkWarningClose = () => {
    setLinkWarningModal({ isOpen: false, url: "" });
  };

  const handleLinkWarningConfirm = () => {
    window.open(linkWarningModal.url, "_blank", "noopener,noreferrer");
    setLinkWarningModal({ isOpen: false, url: "" });
  };

  // Mark messages as seen when chat is opened or new messages arrive
  useEffect(() => {
    if (selectedChatUser && chatMessages.length > 0) {
      const unreadMessages = chatMessages.filter(
        (msg) => msg.from !== user?.id && !msg.seen_at
      );
      if (unreadMessages.length > 0) {
        markMessagesSeen(selectedChatUser.user_id);
      }
    }
  }, [selectedChatUser, chatMessages, user?.id, markMessagesSeen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

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
        <Avatar
          src={selectedChatUser?.avatar_url || ""}
          alt={selectedChatUser?.name || ""}
          size={48}
        />
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <h1 className="text-large font-bold text-accent">
            {selectedChatUser?.name}
          </h1>
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
                onLinkClick={handleLinkClick}
              />
            ) : (
              <ReceivedMessageBubble
                key={message.id}
                message={message.message}
                time={message.timestamp}
                onLinkClick={handleLinkClick}
              />
            )
          )}

        {selectedChatUser && usersTyping.has(selectedChatUser.user_id) && (
          <TypingIndicator
            name={
              connectedUsers.find((u) => u.user_id === selectedChatUser.user_id)
                ?.name || ""
            }
          />
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
            onChange={handleInputChange}
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

      {/* Link Warning Modal */}
      <LinkWarningModal
        isOpen={linkWarningModal.isOpen}
        url={linkWarningModal.url}
        onClose={handleLinkWarningClose}
        onConfirm={handleLinkWarningConfirm}
      />
    </div>
  );
};
