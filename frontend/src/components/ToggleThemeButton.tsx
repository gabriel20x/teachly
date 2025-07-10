import React from "react";
import { useTheme } from "../hooks/useTheme";

export const ToggleThemeButton: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="rounded font-medium"
      style={{
        padding: "0.4rem",
        color: "var(--text-inverted)", 
        border: "none",
        cursor: "pointer",
        backgroundColor: "transparent",
      }}
    >
      {theme === "light" ? "🌑" : "☀️"}
    </button>
  );
};
