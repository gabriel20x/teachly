# Create a basic README.md with summary of tech choices and structure
# 🗨️ 1-to-1 Chat App

A production-ready 1-to-1 real-time chat application with Google Sign-In built with FastAPI, React, and PostgreSQL.

## ⚙️ Stack Overview

### 🔙 Backend (Python + FastAPI)
- **FastAPI**: Fast, async, and modern web framework that supports WebSockets natively.
- **SQLAlchemy + PostgreSQL**: Relational schema is ideal for chat systems with structured user/message data, indexing, and integrity.
- **Authlib**: Handles Google OAuth2 validation securely and cleanly.
- **WebSockets**: Enables instant, bi-directional messaging between users.
- **Docker**: Ensures consistent dev and deploy environments.
- **Pytest**: For unit and E2E testing.

### 🌐 Frontend (React)
- **React**: Component-based architecture, easy to manage complex UI states.
- **Google Identity SDK**: Simplifies Google Sign-In on frontend.
- **WebSocket Client**: Realtime updates for chat.
- **Vite/CRA**: Fast bundling and development.

### 🛠 Infrastructure
- **Docker Compose**: Manages services (backend, db, redis) easily.
- **.env Configs**: For sensitive keys and environment-specific variables.

## 📁 Monorepo Structure

- **Frontend**
- **Backend**
