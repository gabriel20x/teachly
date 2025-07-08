import React from "react";
import type { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { GoogleSignIn } from "./GoogleSignIn";

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isAuthenticated) {
    return (
      <>
        {fallback || (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
              marginTop: "2rem",
            }}
          >
            <h2>Sign in to continue</h2>
            {!isLoading && <GoogleSignIn />}
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
};
