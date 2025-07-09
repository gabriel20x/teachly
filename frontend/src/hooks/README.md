# WebSocket Wrapper Hook

This WebSocket wrapper provides a comprehensive solution for managing real-time connections and tracking connected users in your React application.

## Features

- ✅ **Connection Management**: Easy connect/disconnect functionality
- ✅ **Connected Users Tracking**: Real-time list of connected users with details
- ✅ **Message Sending**: Send messages to specific users
- ✅ **Typing Indicators**: Support for typing status
- ✅ **Event Handling**: Comprehensive event system for all WebSocket events
- ✅ **Error Handling**: Built-in error handling and connection status
- ✅ **TypeScript Support**: Full TypeScript support with proper types

## Basic Usage

```tsx
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { user } = useAuth();
  const {
    isConnected,
    connectedUsers,
    connectedUsersCount,
    connect,
    disconnect,
    sendMessage,
    getConnectedUsers
  } = useWebSocket();

  useEffect(() => {
    if (user?.id) {
      connect(user.id.toString());
    }
  }, [user, connect]);

  return (
    <div>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <p>Connected Users: {connectedUsersCount}</p>
      
      {connectedUsers.map(user => (
        <div key={user.user_id}>
          {user.name} - {user.user_id}
        </div>
      ))}
    </div>
  );
}
```

## Hook API

### Connection State
- `isConnected`: Boolean indicating if WebSocket is connected
- `isConnecting`: Boolean indicating if connection is in progress
- `error`: String containing any connection errors

### Connected Users
- `connectedUsers`: Array of connected users with full details
- `connectedUsersCount`: Number of connected users

### Connection Methods
- `connect(userId: string)`: Connect to WebSocket with user ID
- `disconnect()`: Disconnect from WebSocket

### Message Methods
- `sendMessage(toId: string, message: string)`: Send message to specific user
- `sendTyping(toId: string, isTyping: boolean)`: Send typing indicator
- `getConnectedUsers()`: Request updated list of connected users

### Event Handlers
You can set up event handlers to respond to WebSocket events:

```tsx
const ws = useWebSocket();

// Handle incoming messages
ws.onMessage = (message) => {
  console.log('New message:', message);
};

// Handle typing events
ws.onTyping = (event) => {
  console.log(`${event.from} is typing: ${event.is_typing}`);
};

// Handle user connections
ws.onUserConnect = (event) => {
  console.log(`User ${event.user_id} connected`);
};

// Handle user disconnections
ws.onUserDisconnect = (event) => {
  console.log(`User ${event.user_id} disconnected`);
};

// Handle connected users updates
ws.onConnectedUsersUpdate = (users) => {
  console.log('Connected users updated:', users);
};
```

## Connected User Interface

```typescript
interface ConnectedUser {
  user_id: string;
  id: number;
  name: string;
  avatar_url?: string;
  google_id: string;
  connected_at: string;
  status: string;
  last_updated?: string;
}
```

## Backend Integration

The hook expects your backend to provide:

1. **WebSocket endpoint**: `ws://localhost:8000/ws/chat/{user_id}`
2. **User info**: User details are fetched from the database when connecting
3. **Event system**: Backend broadcasts user connection/disconnection events
4. **Message handling**: Backend routes messages to appropriate users

## Example Components

### WebSocketExample
A simple example showing basic connection and user listing.

### WebSocketWrapper
A more comprehensive component with UI for managing connections and sending messages.

## Error Handling

The hook automatically handles:
- Connection errors
- Disconnection cleanup
- Invalid message formats
- Network timeouts

## Best Practices

1. **Always check connection status** before sending messages
2. **Clean up event handlers** when component unmounts
3. **Handle errors gracefully** in your UI
4. **Use the user ID from auth context** for connections
5. **Implement reconnection logic** for production apps

## Backend Requirements

Your backend should implement:

```python
# Enhanced ConnectionManager with user tracking
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_info: Dict[str, dict] = {}

    async def connect(self, user_id: str, websocket: WebSocket, user_info: dict):
        # Connect and store user info
        pass

    def get_connected_users(self) -> List[dict]:
        # Return list of connected users
        pass

    async def broadcast_json(self, data: dict):
        # Broadcast to all connected users
        pass
```

## API Endpoints

The backend should provide these endpoints:

- `GET /connected-users` - Get list of connected users
- `GET /connected-users/{user_id}` - Check if specific user is connected
- `WebSocket /ws/chat/{user_id}` - WebSocket connection endpoint

This wrapper provides a complete solution for real-time chat applications with user presence tracking. 