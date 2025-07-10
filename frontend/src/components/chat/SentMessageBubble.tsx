import { renderSafeMessage } from "../../utils/messageSecurity";

interface SentMessageBubbleProps {
  message: string;
  time: string;
  status: 'read' | 'delivered' | 'pending';
  onLinkClick?: (url: string, isExternal: boolean) => void;
}

export const SentMessageBubble = ({ message, time, status, onLinkClick }: SentMessageBubbleProps) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
      <div 
        className="rounded-small shadow-medium font-medium"
        style={{ 
          backgroundColor: 'var(--chat-bubble-sent)', 
          color: 'var(--chat-text-sent)',
          padding: '1rem 1.4rem',
          maxWidth: '70%'
        }}
      >
        <div className="text-base">
          {onLinkClick ? renderSafeMessage(message, onLinkClick) : message}
        </div>
        <div style={{ textAlign: 'right', marginTop: '0.4rem' }}>
          <span className={`message-status-${status} text-small`}>
            {status === 'read' ? '✓✓' : status === 'delivered' ? '✓✓' : '✓'} {new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};