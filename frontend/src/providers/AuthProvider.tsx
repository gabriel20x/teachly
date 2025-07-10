import React, { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  AuthContext,
  type User,
  type AuthContextType,
} from "../contexts/AuthContext";
import { LoadingScreen } from "../components/LoadingScreen";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google: any;
  }
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Try to restore user from localStorage on mount
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const initializeAuth = () => {
    // Initialize Google Identity Services
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
      skip_prompt_cookie: true,
      auto_select: true,
    });

    // Check if user is already logged in
    if (user) {
      // User exists in localStorage, try to validate with Google
      const savedCredential = localStorage.getItem("google_credential");
      if (savedCredential) {
        login(savedCredential);
      } else {
        // No credential found, clear user
        localStorage.removeItem("user");
        setUser(null);
        setIsLoading(false);
      }
    } else {
      // No user found, show login
      setIsLoading(false);
    }
  };

  const handleCredentialResponse = async (response: { credential: string }) => {
    await login(response.credential);
    setIsLoading(false);
  };

  const login = async (credential: string) => {
    try {
      const res = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });
      console.log("credential", credential);
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (res.ok) {
        const userData: User = await res.json();
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("google_credential", credential);
        setIsLoading(false);
      } else {
        console.error("Login failed");
        throw new Error("Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (user?.google_id) {
      // Revoke Google session
      window.google.accounts.id.disableAutoSelect();
      window.google.accounts.id.revoke(user.google_id, () => {
        // Clear local storage
        localStorage.removeItem("user");
        localStorage.removeItem("google_credential");
        setUser(null);

        // Re-enable auto-select for next session
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: true,
          cancel_on_tap_outside: false,
        });
      });
    } else {
      // Fallback if no google_id
      localStorage.removeItem("user");
      localStorage.removeItem("google_credential");
      setUser(null);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    initializeAuth,
  };

  
  if (isLoading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
