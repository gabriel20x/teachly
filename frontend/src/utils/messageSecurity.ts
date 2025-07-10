import React from 'react';
import DOMPurify from 'dompurify';
import LinkifyIt from 'linkify-it';

const linkify = new LinkifyIt();

interface LinkifyMatch {
  url: string;
  text: string;
  index: number;
  lastIndex: number;
}

// Configure DOMPurify to be more restrictive
const purifyConfig = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'span'],
  ALLOWED_ATTR: ['class'],
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM_IMPORT: false,
  SANITIZE_DOM: true,
  WHOLE_DOCUMENT: false,
  SAFE_FOR_TEMPLATES: true,
};

export interface DetectedLink {
  url: string;
  text: string;
  index: number;
  lastIndex: number;
}

export interface SanitizedMessage {
  sanitizedText: string;
  detectedLinks: DetectedLink[];
  hasExternalLinks: boolean;
}

/**
 * Sanitizes message content and detects links
 */
export function sanitizeMessage(message: string): SanitizedMessage {
  // First, sanitize the message to prevent XSS
  const sanitizedText = DOMPurify.sanitize(message, purifyConfig);
  
  // Detect links in the sanitized text
  const detectedLinks = linkify.match(sanitizedText) || [];
  
  const links: DetectedLink[] = detectedLinks.map((link: LinkifyMatch) => ({
    url: link.url,
    text: link.text,
    index: link.index,
    lastIndex: link.lastIndex,
  }));

  // Check if any links are external (not localhost or relative)
  const hasExternalLinks = links.some(link => isExternalLink(link.url));

  return {
    sanitizedText,
    detectedLinks: links,
    hasExternalLinks,
  };
}

/**
 * Checks if a URL is external (not localhost or relative)
 */
export function isExternalLink(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    // Consider localhost, 127.0.0.1, and relative URLs as internal
    return !(
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.') ||
      hostname === window.location.hostname
    );
  } catch {
    // If URL parsing fails, assume it's internal (relative URL)
    return false;
  }
}

/**
 * Escapes HTML entities to prevent XSS
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Converts message text to safe HTML with clickable links
 */
export function renderSafeMessage(
  message: string,
  onLinkClick: (url: string, isExternal: boolean) => void
): React.ReactElement {
  const { sanitizedText, detectedLinks } = sanitizeMessage(message);
  
  if (detectedLinks.length === 0) {
    return React.createElement('span', { 
      dangerouslySetInnerHTML: { __html: sanitizedText } 
    });
  }

  // Split text and create elements with safe links
  const elements: React.ReactElement[] = [];
  let lastIndex = 0;

  detectedLinks.forEach((link, index) => {
    // Add text before link
    if (link.index > lastIndex) {
      const textBefore = sanitizedText.slice(lastIndex, link.index);
      elements.push(
        React.createElement('span', { 
          key: `text-${index}`,
          dangerouslySetInnerHTML: { __html: textBefore }
        })
      );
    }

    // Add clickable link
    const isExternal = isExternalLink(link.url);
    elements.push(
      React.createElement(
        'button',
        {
          key: `link-${index}`,
          onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            onLinkClick(link.url, isExternal);
          },
          style: {
            background: 'none',
            border: 'none',
            color: '#2196F3',
            textDecoration: 'underline',
            cursor: 'pointer',
            padding: 0,
            font: 'inherit',
          },
          title: `Click to visit: ${link.url}`,
        },
        link.text
      )
    );

    lastIndex = link.lastIndex;
  });

  // Add remaining text after last link
  if (lastIndex < sanitizedText.length) {
    const textAfter = sanitizedText.slice(lastIndex);
    elements.push(
      React.createElement('span', { 
        key: 'text-final',
        dangerouslySetInnerHTML: { __html: textAfter }
      })
    );
  }

  return React.createElement('span', { key: 'message-container' }, ...elements);
}

/**
 * Validates message input before sending
 */
export function validateMessageInput(message: string): {
  isValid: boolean;
  sanitizedMessage: string;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Check for empty message
  if (!message.trim()) {
    errors.push('Message cannot be empty');
  }

  // Check message length
  if (message.length > 1000) {
    errors.push('Message is too long (max 1000 characters)');
  }

  // Sanitize the message
  const sanitizedMessage = DOMPurify.sanitize(message, purifyConfig);
  
  // Check for potentially dangerous content
  if (sanitizedMessage !== message) {
    console.warn('Message was sanitized:', { original: message, sanitized: sanitizedMessage });
  }

  return {
    isValid: errors.length === 0,
    sanitizedMessage,
    errors,
  };
} 