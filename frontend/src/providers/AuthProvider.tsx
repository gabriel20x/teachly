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

  const cleanupAuthCache = () => {
    // Clear all authentication-related data
    localStorage.removeItem("user");
    localStorage.removeItem("google_credential");
    setUser(null);
    
    // Disable Google auto-select to prevent automatic re-login attempts
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

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
        login(savedCredential).catch((error) => {
          console.error("Auto-login failed:", error);
          // Clean up cache and show login screen
          cleanupAuthCache();
          setIsLoading(false);
        });
      } else {
        // No credential found, clear user
        cleanupAuthCache();
        setIsLoading(false);
      }
    } else {
      // No user found, show login
      setIsLoading(false);
    }
  };

  const handleCredentialResponse = async (response: { credential: string }) => {
    try {
      await login(response.credential);
    } catch (error) {
      console.error("Credential response login failed:", error);
      // Ensure clean state on failure
      cleanupAuthCache();
      setIsLoading(false);
    }
  };

  const login = async (credential: string) => {
    try {
      setIsLoading(true);
      const res = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (res.ok) {
        const userData: User = await res.json();
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("google_credential", credential);
        setIsLoading(false);
      } else {
        console.error("Login failed with status:", res.status);
        // Clean up any existing cache on server error
        cleanupAuthCache();
        throw new Error(`Login failed: ${res.status} ${res.statusText}`);
      }
    } catch (error) {
      console.error("Login error:", error);
      // Ensure complete cleanup on any error
      cleanupAuthCache();
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    if (user?.google_id && window.google?.accounts?.id) {
      // Revoke Google session
      window.google.accounts.id.disableAutoSelect();
      window.google.accounts.id.revoke(user.google_id, () => {
        // Clear local storage
        cleanupAuthCache();

        // Re-enable auto-select for next session
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: true,
          cancel_on_tap_outside: false,
        });
      });
    } else {
      // Fallback if no google_id or Google API not available
      cleanupAuthCache();
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
