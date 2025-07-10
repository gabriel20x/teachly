import React from "react";
import { useTheme } from "../hooks/useTheme";
import { ChatContainer } from "./chat/ChatContainer";
import { SentMessageBubble } from "./chat/SentMessageBubble";
import { ReceivedMessageBubble } from "./chat/ReceivedMessageBubble";
import { TypingIndicator } from "./chat/TypingIndicator";

export const ThemeExample: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      {/* Header with theme toggle */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1 className="text-large text-accent font-bold">
          ✨ Modern Chat Theme
        </h1>
        <button
          onClick={toggleTheme}
          className="shadow-light transition rounded bg-accent font-medium"
          style={{
            padding: "0.8rem 1.6rem",
            color: "var(--text-inverted)",
            border: "none",
          }}
        >
          {theme === "light" ? "🌑" : "☀️"}{" "}
          {theme === "light" ? "Dark Mode" : "Light Mode"}
        </button>
      </div>

      {/* Typography */}
      <div
        className="rounded border"
        style={{
          padding: "1.5rem",
          marginBottom: "1.5rem",
          backgroundColor: "var(--bg-secondary)",
        }}
      >
        <h3
          className="text-base font-semibold"
          style={{ marginBottom: "1rem" }}
        >
          ✨ Poppins Typography (Base: 10px):
        </h3>

        {/* Font sizes */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h4
            className="text-small font-medium text-secondary"
            style={{ marginBottom: "0.8rem" }}
          >
            Sizes:
          </h4>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span
                className="text-small text-accent-secondary font-medium"
                style={{ minWidth: "5rem" }}
              >
                Small:
              </span>
              <span className="text-small">Small text (1.2rem / 12px)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span
                className="text-base text-accent-secondary font-medium"
                style={{ minWidth: "5rem" }}
              >
                Base:
              </span>
              <span className="text-base">Normal text (1.4rem / 14px)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span
                className="text-large text-accent-secondary font-medium"
                style={{ minWidth: "5rem" }}
              >
                Large:
              </span>
              <span className="text-large">Large text (1.6rem / 16px)</span>
            </div>
          </div>
        </div>

        {/* Font weights */}
        <div>
          <h4
            className="text-small font-medium text-secondary"
            style={{ marginBottom: "0.8rem" }}
          >
            Font weights:
          </h4>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}
          >
            <p className="text-base font-light">Light 300 - For soft text</p>
            <p className="text-base font-normal">Normal 400 - Standard text</p>
            <p className="text-base font-medium">Medium 500 - Subtitles</p>
            <p className="text-base font-semibold">Semibold 600 - Titles</p>
            <p className="text-base font-bold">Bold 700 - Strong emphasis</p>
          </div>
        </div>
      </div>

      {/* Colors */}
      <div
        className="rounded border"
        style={{
          padding: "1.5rem",
          marginBottom: "1.5rem",
          backgroundColor: "var(--bg-secondary)",
        }}
      >
        <h3
          className="text-base font-semibold"
          style={{ marginBottom: "1rem" }}
        >
          Color palette:
        </h3>

        <div style={{ marginBottom: "1rem" }}>
          <h4
            className="text-small text-secondary"
            style={{ marginBottom: "0.5rem" }}
          >
            Accent Colors:
          </h4>
          <p className="text-accent">🏆 Accent Color</p>
          <p className="text-accent-secondary">🔮 Accent Color Secondary</p>
        </div>

        <div>
          <h4
            className="text-small text-secondary"
            style={{ marginBottom: "0.5rem" }}
          >
            Status Colors:
          </h4>
          <p className="text-success">✓ Success - Read message</p>
          <p className="text-warning">⚠ Warning - Warning</p>
          <p className="text-error">✗ Error - Critical error</p>
          <p className="text-info">ℹ Info - Additional information</p>
        </div>
      </div>

      {/* Shadows */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h3
          className="text-base font-semibold"
          style={{ marginBottom: "1rem" }}
        >
          🌫️ Shadows:
        </h3>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <div
            className="shadow-light rounded transition"
            style={{
              padding: "1.5rem",
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-light)",
              flex: "1",
            }}
          >
            <p className="text-small text-accent">Light Shadow</p>
            <p className="text-small text-muted">Subtle and elegant</p>
          </div>
          <div
            className="shadow-medium rounded transition"
            style={{
              padding: "1.5rem",
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-light)",
              flex: "1",
            }}
          >
            <p className="text-small text-accent">Medium Shadow</p>
            <p className="text-small text-muted">For important elements</p>
          </div>
        </div>
      </div>

      {/* Chat bubbles example */}

      <h3 className="text-base font-semibold" style={{ marginBottom: "1rem" }}>
        💬 Bubble Chat:
      </h3>
      
      <ChatContainer>
        <SentMessageBubble
          message="This new palette looks incredible! 🎨"
          time="14:23"
          status="read"
        />

        <ReceivedMessageBubble
          message="Totally agree! It feels like a very premium touch ✨"
          time="14:24"
        />

        {/* Typing indicator */}
        <TypingIndicator name="Ana" />
      </ChatContainer>
    </div>
  );
};
