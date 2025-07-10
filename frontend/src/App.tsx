import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './providers/AuthProvider';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { ChatPage } from './pages/ChatPage';
import { ThemePreviewPage } from './pages/ThemePreviewPage';
import { WebSocketProvider } from './providers/WebSocketProvider';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return null; // Loading is handled by AuthProvider
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Public Route Component (redirects to chat if already authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return null; // Loading is handled by AuthProvider
  }
  
  if (isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }
  
  return <>{children}</>;
};

// App Routes Component
const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute>
            <WebSocketProvider>
              <ChatPage />
            </WebSocketProvider>
          </ProtectedRoute>
        } />
        <Route path="/theme" element={<ThemePreviewPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default function App() {
  return (
    <AuthProvider>
        <AppRoutes />
    </AuthProvider>
  );
}
