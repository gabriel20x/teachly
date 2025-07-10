import React from 'react';
import { useAuth } from '../hooks/useAuth';

export const UserProfile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div style={{ 
      display: 'flex', 
      flex:1,
      gap: '1rem',
      alignItems: 'center',
    }}>
      <img 
        src={user.avatar_url} 
        alt={`${user.name}'s avatar`} 
        style={{ 
          width: '4rem', 
          height: '4rem', 
          borderRadius: '50%',
          objectFit: 'cover'
        }} 
      />
      <div>
        <h4>{user.name}</h4>
      </div>
    </div>
  );
}; 