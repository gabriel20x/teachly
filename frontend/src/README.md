# Authentication Wrapper

This authentication wrapper provides a complete solution for Google OAuth authentication in your React application.

## Components

### AuthProvider
The main provider that wraps your application and manages authentication state.

```tsx
import { AuthProvider } from './providers/AuthProvider';

function App() {
  return (
    <AuthProvider>
      <YourAppContent />
    </AuthProvider>
  );
}
```

### useAuth Hook
A custom hook that provides access to authentication state and methods.

```tsx
import { useAuth } from './hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <p>Please sign in</p>
      )}
    </div>
  );
}
```

### ProtectedRoute
A component that protects content from unauthenticated users.

```tsx
import { ProtectedRoute } from './components/ProtectedRoute';

function Dashboard() {
  return (
    <ProtectedRoute>
      <div>
        <h1>Dashboard</h1>
        <p>This content is only visible to authenticated users.</p>
      </div>
    </ProtectedRoute>
  );
}
```

### GoogleSignIn
A component that renders the Google sign-in button.

```tsx
import { GoogleSignIn } from './components/GoogleSignIn';

function LoginPage() {
  return (
    <div>
      <h1>Sign In</h1>
      <GoogleSignIn />
    </div>
  );
}
```

### UserProfile
A component that displays user information and logout functionality.

```tsx
import { UserProfile } from './components/UserProfile';

function Header() {
  return (
    <header>
      <h1>My App</h1>
      <UserProfile />
    </header>
  );
}
```

## Features

- ✅ Google OAuth authentication
- ✅ Automatic session restoration
- ✅ Protected routes
- ✅ User profile management
- ✅ Logout functionality
- ✅ Loading states
- ✅ TypeScript support
- ✅ Local storage persistence

## Environment Variables

Make sure to set up your Google OAuth client ID in your `.env` file:

```
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

## Backend Integration

The authentication wrapper expects your backend to have a login endpoint at `http://localhost:8000/auth/login` that accepts a Google credential and returns user data.

The expected user data structure:
```typescript
type User = {
  id: number;
  name: string;
  avatar_url: string;
  google_id: string;
};
``` 