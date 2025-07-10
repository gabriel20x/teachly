interface ChatContainerProps {
  children: React.ReactNode;
}

export const ChatContainer = ({ children }: ChatContainerProps) => {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        height: "100vh",
        display: "flex",
        flexDirection: "row",
        gap: "2.4rem",
        padding: "1.5rem",
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  );
};
