import { AuthProvider } from "./providers/AuthProvider";
import { UserProfile } from "./components/UserProfile";
import { ProtectedRoute } from "./components/ProtectedRoute";

function AppContent() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Teachly Chat App</h1>
      <ProtectedRoute>
        <div style={{ marginTop: '2rem' }}>
          <UserProfile />
          <div style={{ marginTop: '2rem' }}>
            <h2>Welcome to your dashboard!</h2>
            <p>This content is only visible to authenticated users.</p>
          </div>
        </div>
      </ProtectedRoute>
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
