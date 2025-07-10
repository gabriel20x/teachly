export const ChatContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className="rounded border"
      style={{
        padding: "1.5rem",
        boxSizing: "border-box",
        backgroundColor: "var(--bg-secondary)",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        flex: 1,
      }}
    >
      {children}
    </div>
  );
};
