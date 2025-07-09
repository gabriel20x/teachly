import React from 'react';
import { useAuth } from '../hooks/useAuth';

export const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '1rem',
      padding: '1rem',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9',
      color: 'black'
    }}>
      <img 
        src={user.avatar_url} 
        alt={`${user.name}'s avatar`} 
        style={{ 
          width: '50px', 
          height: '50px', 
          borderRadius: '50%',
          objectFit: 'cover'
        }} 
      />
      <div>
        <h3 style={{ margin: '0 0 0.5rem 0' }}>Welcome, {user.name}!</h3>
        <button 
          onClick={logout}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}; 