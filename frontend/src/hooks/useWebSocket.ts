import { useEffect, useRef, useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_URL = API_URL.replace(/^https?:\/\//, '');

export interface ConnectedUser {
  user_id: string;
  id: number;
  name: string;
  avatar_url?: string;
  google_id: string;
  connected_at: string;
  status: string;
  last_updated?: string;
}

export interface WebSocketMessage {
  event: string;
  [key: string]: unknown;
}

export interface ChatMessage {
  event: 'new_message';
  from: string;
  message_id: number;
  message: string;
  timestamp: string;
}

export interface TypingEvent {
  event: 'typing';
  from: string;
  is_typing: boolean;
}

export interface ConnectedUsersEvent {
  event: 'connected_users';
  users: ConnectedUser[];
}

export interface UserConnectionEvent {
  event: 'user_connected' | 'user_disconnected';
  user_id: string;
  user_info?: ConnectedUser;
  connected_users: ConnectedUser[];
}

export interface MessageSentEvent {
  event: 'message_sent';
  message_id: number;
  to: string;
  message: string;
  timestamp: string;
}

export interface MessageDeliveredEvent {
  event: 'message_delivered';
  message_id: number;
  timestamp: string;
  delivered_at: string;
}

export interface MessageSeenEvent {
  event: 'message_seen';
  message_id: number;
  seen_at: string;
}

export interface UseWebSocketReturn {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  
  // Connected users
  connectedUsers: ConnectedUser[];
  connectedUsersCount: number;
  
  // Connection methods
  connect: (userId: string) => void;
  disconnect: () => void;
  
  // Message methods
  sendMessage: (toId: string, message: string) => void;
  sendTyping: (toId: string, isTyping: boolean) => void;
  getConnectedUsers: () => void;
  
  // Event handlers
  onMessage?: (message: ChatMessage) => void;
  onTyping?: (event: TypingEvent) => void;
  onUserConnect?: (event: UserConnectionEvent) => void;
  onUserDisconnect?: (event: UserConnectionEvent) => void;
  onConnectedUsersUpdate?: (users: ConnectedUser[]) => void;
  onMessageSent?: (event: MessageSentEvent) => void;
  onMessageDelivered?: (event: MessageDeliveredEvent) => void;
  onMessageSeen?: (event: MessageSeenEvent) => void;
  
  // Methods for message status
  markMessagesSeen: (fromUserId: string) => void;
}

export const useWebSocket = (): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const [connectedUsersCount, setConnectedUsersCount] = useState(0);
  
  const wsRef = useRef<WebSocket | null>(null);
  const currentUserId = useRef<string | null>(null);
  
  // Event handlers
  const onMessageRef = useRef<((message: ChatMessage) => void) | undefined>(undefined);
  const onTypingRef = useRef<((event: TypingEvent) => void) | undefined>(undefined);
  const onUserConnectRef = useRef<((event: UserConnectionEvent) => void) | undefined>(undefined);
  const onUserDisconnectRef = useRef<((event: UserConnectionEvent) => void) | undefined>(undefined);
  const onConnectedUsersUpdateRef = useRef<((users: ConnectedUser[]) => void) | undefined>(undefined);
  const onMessageSentRef = useRef<((event: MessageSentEvent) => void) | undefined>(undefined);
  const onMessageDeliveredRef = useRef<((event: MessageDeliveredEvent) => void) | undefined>(undefined);
  const onMessageSeenRef = useRef<((event: MessageSeenEvent) => void) | undefined>(undefined);

  const connect = useCallback((userId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    setIsConnecting(true);
    setError(null);
    currentUserId.current = userId;

    const ws = new WebSocket(`ws://${WS_URL}/ws/chat/${userId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        
        switch (data.event) {
          case 'new_message':
            console.log('New message:', data);
            onMessageRef.current?.(data as unknown as ChatMessage);
            break;
            
          case 'message_sent':
            console.log('Message sent:', data);
            onMessageSentRef.current?.(data as unknown as MessageSentEvent);
            break;
            
          case 'message_delivered':
            console.log('Message delivered:', data);
            onMessageDeliveredRef.current?.(data as unknown as MessageDeliveredEvent);
            break;
            
          case 'message_seen':
            console.log('Message seen:', data);
            onMessageSeenRef.current?.(data as unknown as MessageSeenEvent);
            break;
            
          case 'typing':
            onTypingRef.current?.(data as unknown as TypingEvent);
            break;
            
          case 'user_connected':
            onUserConnectRef.current?.(data as unknown as UserConnectionEvent);
            setConnectedUsers((data as unknown as UserConnectionEvent).connected_users);
            setConnectedUsersCount((data as unknown as UserConnectionEvent).connected_users.length);
            onConnectedUsersUpdateRef.current?.((data as unknown as UserConnectionEvent).connected_users);
            break;
            
          case 'user_disconnected':
            onUserDisconnectRef.current?.(data as unknown as UserConnectionEvent);
            setConnectedUsers((data as unknown as UserConnectionEvent).connected_users);
            setConnectedUsersCount((data as unknown as UserConnectionEvent).connected_users.length);
            onConnectedUsersUpdateRef.current?.((data as unknown as UserConnectionEvent).connected_users);
            break;
            
          case 'connected_users':
            setConnectedUsers((data as unknown as ConnectedUsersEvent).users);
            setConnectedUsersCount((data as unknown as ConnectedUsersEvent).users.length);
            onConnectedUsersUpdateRef.current?.((data as unknown as ConnectedUsersEvent).users);
            break;
            
          case 'users_updated':
            setConnectedUsers((data as unknown as { connected_users: ConnectedUser[] }).connected_users);
            setConnectedUsersCount((data as unknown as { connected_users: ConnectedUser[] }).connected_users.length);
            onConnectedUsersUpdateRef.current?.((data as unknown as { connected_users: ConnectedUser[] }).connected_users);
            break;
            
          default:
            console.log('Unknown WebSocket event:', data.event);
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      setIsConnecting(false);
      if (event.code !== 1000) { // Not a normal closure
        setError(`Connection closed: ${event.reason || 'Unknown error'}`);
      }
      console.log('WebSocket disconnected');
    };

    ws.onerror = (error) => {
      setIsConnecting(false);
      setError('WebSocket connection error');
      console.error('WebSocket error:', error);
    };
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    setConnectedUsers([]);
    setConnectedUsersCount(0);
    currentUserId.current = null;
  }, []);

  const sendMessage = useCallback((toId: string, message: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        event: 'message',
        to: toId,
        message: message
      }));
    } else {
      setError('WebSocket is not connected');
    }
  }, []);

  const sendTyping = useCallback((toId: string, isTyping: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        event: 'typing',
        to: toId,
        is_typing: isTyping
      }));
    }
  }, []);

  const getConnectedUsers = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        event: 'get_connected_users'
      }));
    }
  }, []);

  const markMessagesSeen = useCallback((fromUserId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        event: 'mark_messages_seen',
        from_user_id: fromUserId
      }));
    } else {
      setError('WebSocket is not connected');
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    // Connection state
    isConnected,
    isConnecting,
    error,
    
    // Connected users
    connectedUsers,
    connectedUsersCount,
    
    // Connection methods
    connect,
    disconnect,
    
    // Message methods
    sendMessage,
    sendTyping,
    getConnectedUsers,
    markMessagesSeen,
    
    // Event handlers (these will be set by the component using the hook)
    get onMessage() { return onMessageRef.current; },
    set onMessage(handler) { onMessageRef.current = handler; },
    
    get onTyping() { return onTypingRef.current; },
    set onTyping(handler) { onTypingRef.current = handler; },
    
    get onUserConnect() { return onUserConnectRef.current; },
    set onUserConnect(handler) { onUserConnectRef.current = handler; },
    
    get onUserDisconnect() { return onUserDisconnectRef.current; },
    set onUserDisconnect(handler) { onUserDisconnectRef.current = handler; },
    
    get onConnectedUsersUpdate() { return onConnectedUsersUpdateRef.current; },
    set onConnectedUsersUpdate(handler) { onConnectedUsersUpdateRef.current = handler; },
    
    get onMessageSent() { return onMessageSentRef.current; },
    set onMessageSent(handler) { onMessageSentRef.current = handler; },
    
    get onMessageDelivered() { return onMessageDeliveredRef.current; },
    set onMessageDelivered(handler) { onMessageDeliveredRef.current = handler; },
    
    get onMessageSeen() { return onMessageSeenRef.current; },
    set onMessageSeen(handler) { onMessageSeenRef.current = handler; }
  };
}; 