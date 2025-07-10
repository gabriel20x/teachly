interface ReceivedMessageBubbleProps {
  message: string;
  time: string;
}

export const ReceivedMessageBubble = ({
  message,
  time,
}: ReceivedMessageBubbleProps) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-start",
        marginBottom: "1rem",
      }}
    >
      <div
        className="rounded-small shadow-light border-light"
        style={{
          backgroundColor: "var(--chat-bubble-received)",
          color: "var(--chat-text-received)",
          padding: "1rem 1.4rem",
          maxWidth: "70%",
          border: "1px solid var(--border-light)",
        }}
      >
        <p className="text-base">{message}</p>
        <div style={{ marginTop: "0.4rem" }}>
          <span
            className="text-small text-muted"
            style={{ textAlign: "right", width: "100%", paddingLeft: "3rem" }}
          >
            {new Date(time).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    </div>
  );
};
