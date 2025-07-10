import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeExample } from '../components/ThemeExample';

export const ThemePreviewPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'var(--bg-primary)',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Navigation Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem',
          padding: '1.5rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border-light)'
        }}>
          <h1 className="text-large font-bold text-accent">🎨 Theme Preview</h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => navigate('/login')}
              className="rounded text-small font-medium shadow-light transition"
              style={{
                padding: '0.8rem 1.6rem',
                backgroundColor: 'var(--accent-secondary)',
                color: 'var(--text-inverted)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Login
            </button>
            <button
              onClick={() => navigate('/chat')}
              className="rounded text-small font-medium shadow-light transition"
              style={{
                padding: '0.8rem 1.6rem',
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--text-inverted)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Chat Demo
            </button>
          </div>
        </div>

        {/* Theme Example */}
        <ThemeExample />
      </div>
    </div>
  );
}; 