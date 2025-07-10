import React from 'react';
import { createPortal } from 'react-dom';

interface LinkWarningModalProps {
  isOpen: boolean;
  url: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const LinkWarningModal: React.FC<LinkWarningModalProps> = ({
  isOpen,
  url,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return 'unknown domain';
    }
  };

  const modal = (
    <div
      className="link-warning-backdrop"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="link-warning-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        className="link-warning-modal"
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFA726',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px',
            }}
          >
            <span style={{ color: 'white', fontSize: '20px' }}>⚠️</span>
          </div>
          <h2
            id="link-warning-title"
            style={{
              margin: 0,
              color: '#333',
              fontSize: '18px',
              fontWeight: '600',
            }}
          >
            External Link Warning
          </h2>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <p style={{ margin: '0 0 12px 0', color: '#666', lineHeight: '1.5' }}>
            You are about to visit an external website. This link will take you away from the secure chat environment.
          </p>
          <div
            style={{
              backgroundColor: '#f5f5f5',
              padding: '12px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              marginBottom: '12px',
            }}
          >
            <p style={{ margin: '0 0 8px 0', fontWeight: '500', color: '#333' }}>
              Destination:
            </p>
            <p
              style={{
                margin: '0',
                color: '#2196F3',
                wordBreak: 'break-all',
                fontSize: '14px',
                fontFamily: 'monospace',
              }}
            >
              {url}
            </p>
            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>
              Domain: {getDomain(url)}
            </p>
          </div>
          <div
            style={{
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '4px',
              padding: '12px',
            }}
          >
            <p style={{ margin: 0, fontSize: '14px', color: '#856404' }}>
              <strong>Security Notice:</strong> Be cautious when visiting external links. 
              Make sure you trust the source and the destination website.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: 'white',
              color: '#333',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#f5f5f5';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#2196F3',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#1976D2';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#2196F3';
            }}
          >
            Continue to Link
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}; 