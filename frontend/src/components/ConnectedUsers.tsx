import { useAuth } from "../hooks/useAuth";
import { useWebSocketContext } from "../hooks/useWebSocketContext";
import { Avatar } from "./Avatar";

export const ConnectedUsers = () => {
  const { connectedUsers, selectChatUser } = useWebSocketContext();
  const { user } = useAuth();
  return (
    connectedUsers.length > 0 && (
      <div
        style={{
          backgroundColor: "var(--bg-secondary)",
          padding: "1rem",
          paddingTop: "3rem",
          borderBottom: "1px solid var(--border-light)",
          flex:1,
          borderTopLeftRadius: "3rem",
          borderTopRightRadius: "3rem",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem", flexDirection: "column" }}>
          {connectedUsers.filter((connectedUser) => connectedUser.user_id !== user?.id.toString()).map((connectedUser) => (
            <div
              key={connectedUser.user_id}
              onClick={() => selectChatUser(connectedUser)}
              className="rounded text-small font-medium transition hover-bg-accent"
              style={{
                color: "var(--text-primary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                flex:1,
                padding: "0.5rem 1rem",
              }}
            >
              <Avatar src={connectedUser.avatar_url || ""} alt={connectedUser.name || ""} size={24} />
              {connectedUser.name}
            </div>
          ))}
        </div>
      </div>
    )
  );
};