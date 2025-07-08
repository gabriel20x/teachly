import React, { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  AuthContext,
  type User,
  type AuthContextType,
} from "../contexts/AuthContext";

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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initializeAuth = async () => {
    // Initialize Google Identity Services
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
      skip_prompt_cookie: true,
      auto_select: true,
    });

    // Try to restore session automatically
    window.google.accounts.id.prompt(
      (notification: {
        isNotDisplayed: () => boolean;
        isSkippedMoment: () => boolean;
      }) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // No session found, user will need to sign in manually
          console.log("No existing session found");
          setIsLoading(false);
        }
      }
    );
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

      if (res.ok) {
        const userData: User = await res.json();
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("google_credential", credential);
      } else {
        console.error("Login failed");
        throw new Error("Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
