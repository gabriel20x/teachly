import { Button } from "./Button";
import { IconButton } from "./IconButton";
import { UserProfile } from "./UserProfile";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { ConnectedUsers } from "./ConnectedUsers";

export const Dashboard = () => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  return (
    <div
      className="rounded border"
      style={{
        backgroundColor: "var(--bg-primary)",
        maxWidth: "400px",
        minWidth: "250px",
        height: "100%",
        overflowY: "auto",
        flexDirection: "column",
        display: "flex",
        gap: "1rem",
      }}
    >
      <div style={{ display: "flex", gap: "1rem", justifyContent: "space-between", padding: "1.5rem" }}>
        <UserProfile />
        <div role="actions" style={{ display: "flex", gap: "1rem" }}>
          <IconButton onClick={toggleTheme}>{theme === "light" ? "🌑" : "☀️"}</IconButton>
          <Button onClick={logout}>Logout</Button>
        </div>
      </div>
      <ConnectedUsers />
    </div>
  );
};
