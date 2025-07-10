import { createContext } from 'react';
import type { 
  ConnectedUser, 
  ChatMessage, 
  TypingEvent, 
  UserConnectionEvent, 
  MessageSentEvent, 
  MessageDeliveredEvent, 
  MessageSeenEvent 
} from '../hooks/useWebSocket';

export interface WebSocketContextType {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  
  // Connected users
  connectedUsers: ConnectedUser[];
  connectedUsersCount: number;
  
  // Chat state
  selectedChatUser: ConnectedUser | null;
  chatMessages: Array<{
    id: number;
    from: number;
    to: number;
    message: string;
    timestamp: string;
    delivered_at?: string | null;
    seen_at?: string | null;
  }>;
  newMessage: string;
  isLoadingHistory: boolean;
  usersTyping: Set<string>;
  isCurrentlyTyping: boolean;
  
  // Connection methods
  connect: (userId: string) => void;
  disconnect: () => void;
  
  // Message methods
  sendMessage: (toId: string, message: string) => void;
  sendTyping: (toId: string, isTyping: boolean) => void;
  getConnectedUsers: () => void;
  markMessagesSeen: (fromUserId: string) => void;
  
  // Chat management
  selectChatUser: (connectedUser: ConnectedUser) => Promise<void>;
  setNewMessage: (message: string) => void;
  closeChat: () => void;
  
  // Event handlers
  onMessage?: (message: ChatMessage) => void;
  onTyping?: (event: TypingEvent) => void;
  onUserConnect?: (event: UserConnectionEvent) => void;
  onUserDisconnect?: (event: UserConnectionEvent) => void;
  onConnectedUsersUpdate?: (users: ConnectedUser[]) => void;
  onMessageSent?: (event: MessageSentEvent) => void;
  onMessageDelivered?: (event: MessageDeliveredEvent) => void;
  onMessageSeen?: (event: MessageSeenEvent) => void;
}

export const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined); 