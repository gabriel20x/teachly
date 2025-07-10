# Teachly Frontend

A modern, real-time chat application built with React 19, TypeScript, and WebSockets. Features Google OAuth authentication, real-time messaging, and a beautiful responsive design with dark/light theme support.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Components    │    │   Contexts      │    │   Hooks         │
│   (UI Layer)    │◄──►│   (State Mgmt)  │◄──►│   (Logic)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Pages         │    │   Providers     │    │   Utils         │
│   (Routing)     │    │   (App State)   │    │   (Helpers)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Core Technologies

- **React 19**: Latest React with concurrent features
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **React Router**: Client-side routing
- **WebSockets**: Real-time communication
- **CSS Variables**: Dynamic theming system

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend server running (see backend README)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   ```
   http://localhost:5173
   ```

### Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run dev:host     # Start with host access

# Build
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

## 🎨 Design System

### Theme Support

The application features a comprehensive design system with:

- **Light Theme**: Clean, modern interface with soft colors
- **Dark Theme**: Elegant dark mode with proper contrast
- **CSS Variables**: Dynamic theming with CSS custom properties
- **Responsive Design**: Mobile-first approach

### Color Palette

```css
/* Light Theme */
--bg-primary: #F7F7FA      
--bg-secondary: #FFFFFF    
--text-primary: #1B202D    
--accent-primary: #1B202D  
--accent-secondary: #3A44DB 

/* Dark Theme */
--bg-primary: #1B202D      
--bg-secondary: #292F3F    
--text-primary: #F1F1F3    
--accent-primary: #ffffff  
--accent-secondary: #5DDDDD 
```

### Typography

- **Font Family**: Poppins (Google Fonts)
- **Font Weights**: 300, 400, 500, 600, 700
- **Responsive Sizes**: 12px, 14px, 16px base sizes

## 🔐 Authentication

### Google OAuth Integration

The frontend uses Google's Identity Services for authentication:

1. **Setup**: Configure Google OAuth in Google Cloud Console
2. **Integration**: Uses Google's One Tap sign-in
3. **Security**: Token validation on backend
4. **User Management**: Automatic user creation/update

### Authentication Flow

```typescript
// 1. User clicks Google Sign-In
// 2. Google returns ID token
// 3. Frontend sends token to backend
// 4. Backend validates and creates/updates user
// 5. User is authenticated and redirected to chat
```

## 💬 Real-time Chat

### WebSocket Integration

- **Connection**: Automatic WebSocket connection on chat page
- **Real-time Updates**: Instant message delivery
- **Status Indicators**: Online/offline, typing, read receipts
- **Message History**: Persistent chat history

### Chat Features

- **Real-time Messaging**: Instant message delivery
- **Typing Indicators**: Show when users are typing
- **Message Status**: Sent, delivered, read indicators
- **User Presence**: Online/offline status
- **Message History**: Load previous conversations
- **Link Detection**: Automatic URL detection and validation

### Message Security

```typescript
// Message sanitization with DOMPurify
const sanitizedMessage = DOMPurify.sanitize(message, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'span'],
  ALLOWED_ATTR: ['class']
});

// Link detection and validation
const detectedLinks = linkify.match(message);
const hasExternalLinks = links.some(link => isExternalLink(link.url));
```

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── chat/            # Chat-specific components
│   │   ├── ChatBox.tsx
│   │   ├── ChatContainer.tsx
│   │   ├── ReceivedMessageBubble.tsx
│   │   ├── SentMessageBubble.tsx
│   │   └── TypingIndicator.tsx
│   ├── Avatar.tsx       # User avatar component
│   ├── Button.tsx       # Reusable button
│   ├── Dashboard.tsx    # Main chat dashboard
│   ├── GoogleSignIn.tsx # Google OAuth component
│   └── UserProfile.tsx  # User profile component
├── contexts/            # React contexts
│   ├── AuthContext.ts   # Authentication state
│   ├── ThemeContext.ts  # Theme management
│   └── WebSocketContext.ts # WebSocket state
├── hooks/               # Custom React hooks
│   ├── useAuth.ts       # Authentication logic
│   ├── useTheme.ts      # Theme management
│   ├── useWebSocket.ts  # WebSocket logic
│   └── useWebSocketContext.ts # WebSocket context
├── pages/               # Page components
│   ├── ChatPage.tsx     # Main chat interface
│   ├── LoginPage.tsx    # Authentication page
│   └── ThemePreviewPage.tsx # Theme showcase
├── providers/           # Context providers
│   ├── AuthProvider.tsx
│   ├── ThemeProvider.tsx
│   └── WebSocketProvider.tsx
├── styles/              # Global styles
│   └── globals.css      # CSS variables and base styles
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
│   └── messageSecurity.ts # Message sanitization
└── assets/              # Static assets
    └── lotties/         # Lottie animations
```

## 🛡️ Security Features

### Frontend Security

1. **Input Sanitization**: DOMPurify for XSS prevention
2. **Link Validation**: External link detection and warnings
3. **Message Validation**: Length and content validation
4. **Secure Authentication**: Google OAuth with token validation

### Security Measures

```typescript
// XSS Prevention
const sanitizedText = DOMPurify.sanitize(message, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'span'],
  ALLOWED_ATTR: ['class']
});

// Link Safety
const isExternalLink = (url: string) => {
  const urlObj = new URL(url);
  return !['localhost', '127.0.0.1'].includes(urlObj.hostname);
};

// Message Validation
const validateMessage = (message: string) => {
  return message.trim().length > 0 && message.length <= 1000;
};
```

## 🚀 Deployment

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```
### Environment Variables

```bash
# Development
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Production
VITE_API_URL=https://api.yourdomain.com
VITE_GOOGLE_CLIENT_ID=your_production_client_id
```

### Deployment Platforms

1. **Vercel**: Zero-config deployment
2. **Netlify**: Drag-and-drop deployment
3. **AWS S3 + CloudFront**: Static hosting
4. **Docker**: Containerized deployment

## ⚖️ Trade-offs

### Chosen Approaches

1. **React 19 + TypeScript**: 
   - ✅ Latest features and type safety
   - ✅ Excellent developer experience
   - ❌ Learning curve for new developers

2. **Vite**: 
   - ✅ Extremely fast development
   - ✅ Modern build tooling
   - ❌ Less mature than webpack

3. **CSS Variables for Theming**: 
   - ✅ Dynamic theme switching
   - ✅ No runtime overhead
   - ❌ Limited browser support (IE11-)

4. **WebSocket for Real-time**: 
   - ✅ Low latency communication
   - ✅ Bidirectional data flow
   - ❌ Connection management complexity

5. **Google OAuth**: 
   - ✅ Secure and trusted
   - ✅ No password management
   - ❌ Dependency on Google services

### Future Improvements

1. **Performance**: 
   - React.memo for component optimization
   - Code splitting with React.lazy
   - Service Worker for offline support

2. **User Experience**: 
   - Push notifications
   - Offline message queuing
   - Progressive Web App features

3. **Accessibility**: 
   - ARIA labels and roles
   - Keyboard navigation
   - Screen reader support
   
### Development Tips

```bash
# Enable React DevTools
npm install -g react-devtools

# Check bundle size
npm install -g webpack-bundle-analyzer

# Debug WebSocket
# Open browser DevTools → Network → WS
```

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Automatic code formatting
- **Conventional Commits**: Standard commit messages