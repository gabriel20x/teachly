import React from "react";

interface IconButtonProps {
  children: React.ReactNode;
  onClick: () => void;
}

export const IconButton = ({ children, onClick }: IconButtonProps) => {
  return (
    <div
      onClick={onClick}
      className="transition"
      style={{
        padding: "0.4rem",
        color: "var(--text-inverted)", 
        border: "none",
        cursor: "pointer",
        backgroundColor: "transparent",
        alignSelf: "center",
      }}
    >
      {children}
    </div>
  );
};
