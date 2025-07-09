import { AuthProvider } from "./providers/AuthProvider";
import { UserProfile } from "./components/UserProfile";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { WebSocketWrapper } from "./components/WebSocketWrapper";

function AppContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '1200px' }}>
        <h1>Teachly Chat App</h1>
        <ProtectedRoute>
          <div style={{ marginTop: '2rem' }}>
            <UserProfile />
            <div style={{ marginTop: '2rem' }}>
              <h2>Welcome to your dashboard!</h2>
              <p>This content is only visible to authenticated users.</p>
            </div>
          </div>
          
          {/* WebSocket Wrapper with Connected Users */}
          <div style={{ marginTop: '2rem' }}>
            <WebSocketWrapper />
          </div>
        </ProtectedRoute>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
