import React, { useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuth } from '../hooks/useAuth';

interface WebSocketWrapperProps {
  children?: React.ReactNode;
}

export const WebSocketWrapper: React.FC<WebSocketWrapperProps> = ({ children }) => {
  const { user } = useAuth();
  
  const {
    isConnected,
    isConnecting,
    error,
    connectedUsers,
    connect,
    disconnect,
    sendMessage,
    getConnectedUsers
  } = useWebSocket();

  // Connect when user is available
  useEffect(() => {
    if (user?.id) {
      connect(user.id.toString());
    }
  }, [user, connect]);

  if (!user) {
    return <div>Please log in to use the chat</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2>WebSocket Connection Status</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            backgroundColor: isConnected ? '#4CAF50' : isConnecting ? '#FF9800' : '#F44336' 
          }} />
          <span>
            {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Disconnected'}
          </span>
          {error && <span style={{ color: 'red' }}>Error: {error}</span>}
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => user && connect(user.id.toString())}
            disabled={isConnected || isConnecting}
            style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Connect
          </button>
          <button 
            onClick={disconnect}
            disabled={!isConnected}
            style={{ padding: '8px 16px', backgroundColor: '#F44336', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Disconnect
          </button>
          <button 
            onClick={getConnectedUsers}
            disabled={!isConnected}
            style={{ padding: '8px 16px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Refresh Users
          </button>
        </div>
      </div>

      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
        <h3>Connected Users ({connectedUsers.filter(u => u.user_id !== user.id.toString()).length})</h3>
        {connectedUsers.filter(u => u.user_id !== user.id.toString()).length === 0 ? (
          <p>No other users connected</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {connectedUsers
              .filter(u => u.user_id !== user.id.toString())
              .map((connectedUser) => (
                <div 
                  key={connectedUser.user_id} 
                  onClick={() => sendMessage(connectedUser.user_id, 'Hello from WebSocket wrapper!')}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    padding: '10px', 
                    border: '1px solid #eee', 
                    borderRadius: '4px',
                    backgroundColor: '#f9f9f9',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    color: 'black'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e3f2fd';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9f9f9';
                  }}
                >
                  {connectedUser.avatar_url && (
                    <img 
                      src={connectedUser.avatar_url} 
                      alt={connectedUser.name} 
                      style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold' }}>{connectedUser.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      Connected: {new Date(connectedUser.connected_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Render children if provided */}
      {children}
    </div>
  );
}; 