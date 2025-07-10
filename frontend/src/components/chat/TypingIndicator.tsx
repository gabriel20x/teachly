interface TypingIndicatorProps {
  name: string;
}

export const TypingIndicator = ({ name }: TypingIndicatorProps) => {
  return (
    <div style={{ display: "flex", justifyContent: "flex-start" }}>
      <div
        className="rounded-small"
        style={{
          backgroundColor: "var(--bg-tertiary)",
          color: "var(--text-secondary)",
          padding: "0.8rem 1.2rem",
          fontStyle: "italic",
          animation: "pulse 2s infinite",
        }}
      >
        <span className="text-small">{name} is typing...</span>
      </div>
    </div>
  );
};