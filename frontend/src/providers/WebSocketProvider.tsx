import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { useWebSocket } from "../hooks/useWebSocket";
import type { ChatMessage, MessageSentEvent, MessageDeliveredEvent, MessageSeenEvent, ConnectedUser } from "../hooks/useWebSocket";
import { validateMessageInput } from "../utils/messageSecurity";
import { WebSocketContext } from "../contexts/WebSocketContext";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
}) => {
  const { user } = useAuth();
  const webSocketHook = useWebSocket();
  const [selectedChatUser, setSelectedChatUser] = useState<ConnectedUser | null>(null);
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

  const {
    isConnected,
    isConnecting,
    error,
    connectedUsers,
    connect,
    disconnect,
    sendMessage: wsSendMessage,
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
  const handleMessage = useCallback((message: ChatMessage) => {
    console.log("Received message:", message);
    if (message.from === selectedChatUser?.user_id || message.from === user?.id.toString()) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: message.message_id,
          from: parseInt(message.from),
          to: parseInt(selectedChatUser?.user_id || "0"),
          message: message.message,
          timestamp: message.timestamp,
          delivered_at: null,
          seen_at: null,
        },
      ]);
      
      // Don't automatically mark messages as seen - let the UI component handle this
      // This allows for proper unread message functionality
    }
  }, [selectedChatUser, user?.id, markMessagesSeen]);

  const handleMessageSent = useCallback((event: MessageSentEvent) => {
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

  const selectChatUser = async (connectedUser: ConnectedUser) => {
    // Send typing stop to previous user if currently typing
    if (selectedChatUser?.user_id === connectedUser.user_id) {
      setSelectedChatUser(null);
      setChatMessages([]);
      setIsLoadingHistory(false);
      setIsCurrentlyTyping(false);
      return;
    }

    if (selectedChatUser && isCurrentlyTyping && selectedChatUser.user_id !== connectedUser.user_id) {
      webSocketHook.sendTyping(selectedChatUser.user_id, false);
    }

    
    setSelectedChatUser(connectedUser);
    setChatMessages([]);
    setIsLoadingHistory(true);
    setIsCurrentlyTyping(false);
    
    // Load chat history
    if (user?.id) {
      try {
        const response = await fetch(
          `${API_URL}/history/${user.id}/${connectedUser.user_id}`
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

  const sendMessage = (toId: string, message: string) => {
    if (toId && message.trim()) {
      // Validate and sanitize the message
      const validation = validateMessageInput(message);
      
      if (!validation.isValid) {
        console.error("Message validation failed:", validation.errors);
        return;
      }
      
      wsSendMessage(toId, message);
      setNewMessage("");
    }
  };

  const closeChat = () => {
    // Send typing stop to current user if typing
    if (selectedChatUser && isCurrentlyTyping) {
      webSocketHook.sendTyping(selectedChatUser.user_id, false);
    }
    
    setSelectedChatUser(null);
    setChatMessages([]);
    setIsCurrentlyTyping(false);
    setNewMessage("");
  };

  const contextValue = {
    // Connection state
    isConnected,
    isConnecting,
    error,
    
    // Connected users
    connectedUsers,
    connectedUsersCount: connectedUsers.length,
    
    // Chat state
    selectedChatUser,
    chatMessages,
    newMessage,
    isLoadingHistory,
    usersTyping,
    isCurrentlyTyping,
    
    // Connection methods
    connect,
    disconnect,
    
    // Message methods
    sendMessage,
    sendTyping: webSocketHook.sendTyping,
    getConnectedUsers,
    markMessagesSeen,
    
    // Chat management
    selectChatUser,
    setNewMessage,
    setIsCurrentlyTyping,
    closeChat,
    
    // Event handlers (exposed for external use)
    onMessage: webSocketHook.onMessage,
    onTyping: webSocketHook.onTyping,
    onUserConnect: webSocketHook.onUserConnect,
    onUserDisconnect: webSocketHook.onUserDisconnect,
    onConnectedUsersUpdate: webSocketHook.onConnectedUsersUpdate,
    onMessageSent: webSocketHook.onMessageSent,
    onMessageDelivered: webSocketHook.onMessageDelivered,
    onMessageSeen: webSocketHook.onMessageSeen,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}; 