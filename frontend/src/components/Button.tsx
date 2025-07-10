import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button = ({ children, onClick, ...rest }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="shadow-light transition rounded bg-accent font-medium"
      style={{
        padding: "0.8rem 1.6rem",
        backgroundColor: "var(--accent-secondary)",
        color: "var(--text-inverted)",
        border: "none",
        cursor: "pointer",
        height: "fit-content",
        alignSelf: "center",
      }}
      {...rest}
    >
      {children}
    </button>
  );
};
