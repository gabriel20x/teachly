import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SentMessageBubble } from '../components/chat/SentMessageBubble';
import { ReceivedMessageBubble } from '../components/chat/ReceivedMessageBubble';

interface Message {
  id: string;
  text: string;
  time: string;
  isSent: boolean;
  status?: 'read' | 'delivered' | 'pending';
}

export const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Welcome to Teachly Chat! 👋',
      time: '14:00',
      isSent: false
    },
    {
      id: '2',
      text: 'Thanks! This looks great!',
      time: '14:01',
      isSent: true,
      status: 'read'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const navigate = useNavigate();

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      time: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      isSent: true,
      status: 'delivered'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate received message
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Thanks for your message! I\'ll get back to you soon.',
        time: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        isSent: false
      };
      setMessages(prev => [...prev, reply]);
    }, 1000);
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: 'var(--bg-primary)'
    }}>
      {/* Header */}
      <div className="shadow-light" style={{
        backgroundColor: 'var(--bg-secondary)',
        padding: '1.5rem',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 className="text-large font-bold text-accent">💬 Teachly Chat</h1>
          <p className="text-small text-muted">Online</p>
        </div>
        <button
          onClick={() => navigate('/theme')}
          className="rounded text-small font-medium shadow-light transition"
          style={{
            padding: '0.8rem 1.6rem',
            backgroundColor: 'var(--accent-secondary)',
            color: 'var(--text-inverted)',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Theme Preview
        </button>
      </div>

      {/* Messages */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {messages.map((message) => (
          message.isSent ? (
            <SentMessageBubble
              key={message.id}
              message={message.text}
              time={message.time}
              status={message.status || 'pending'}
            />
          ) : (
            <ReceivedMessageBubble
              key={message.id}
              message={message.text}
              time={message.time}
            />
          )
        ))}
      </div>

      {/* Message Input */}
      <div className="shadow-light" style={{
        backgroundColor: 'var(--bg-secondary)',
        padding: '1.5rem',
        borderTop: '1px solid var(--border-light)'
      }}>
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="rounded text-base"
            style={{
              flex: 1,
              padding: '1rem',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
            placeholder="Type your message..."
          />
          <button
            type="submit"
            className="rounded text-base font-medium shadow-light transition"
            style={{
              padding: '1rem 2rem',
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--text-inverted)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}; 