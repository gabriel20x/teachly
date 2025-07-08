import { AuthProvider } from "./providers/AuthProvider";
import { UserProfile } from "./components/UserProfile";
import { ProtectedRoute } from "./components/ProtectedRoute";
import ChatTest from "./components/ChatTest";

function AppContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div>
        <h1>Teachly Chat App</h1>
      <ProtectedRoute>
        <div style={{ marginTop: '2rem' }}>
          <UserProfile />
          <div style={{ marginTop: '2rem' }}>
            <h2>Welcome to your dashboard!</h2>
            <p>This content is only visible to authenticated users.</p>
          </div>
        </div>
        <ChatTest
          userId={"1"}
          toId={"2"}
        />
        <ChatTest
          userId={"2"}
          toId={"1"}
        />
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
