# Teachly Backend

A real-time chat application backend built with FastAPI, WebSockets, and PostgreSQL. This backend provides authentication via Google OAuth, real-time messaging, and comprehensive security features.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   WebSockets    │
                       │   (Real-time)   │
                       └─────────────────┘
```

### Core Components

- **FastAPI Application**: RESTful API with WebSocket support
- **Authentication**: Google OAuth integration with JWT token validation
- **WebSocket Manager**: Real-time message delivery and connection management
- **Database Layer**: SQLAlchemy ORM with PostgreSQL
- **Security**: Input validation, XSS protection, rate limiting
- **Monitoring**: Prometheus metrics and Grafana dashboards

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Python 3.11+ (for local development)
- PostgreSQL (handled by Docker)

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@db:5432/chatdb

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id

# Optional: Redis for caching (future enhancement)
REDIS_URL=redis://redis:6379
```

### Running with Docker

1. **Start all services:**
   ```bash
   docker-compose up -d
   ```

2. **View logs:**
   ```bash
   docker-compose logs -f backend
   ```

3. **Stop services:**
   ```bash
   docker-compose down
   ```

## 📚 API Documentation

Once running, visit:
- **Interactive API docs**: http://localhost:8000/docs
- **Alternative docs**: http://localhost:8000/redoc
- **Health check**: http://localhost:8000/health

## 🔐 Authentication

The backend uses Google OAuth for authentication:

1. **Login Flow:**
   - Frontend sends Google ID token to `/auth/login`
   - Backend validates token with Google
   - User is created/updated in database
   - Returns user information

2. **Security Features:**
   - Token validation against Google's servers
   - Audience verification
   - Automatic user creation/update

## 💬 Real-time Messaging

### WebSocket Connection

Connect to: `ws://localhost:8000/ws/chat/{user_id}`

### Message Events

- **`message`**: Send a new message
- **`message_seen`**: Mark message as seen
- **`user_connected`**: User joined the chat
- **`message_sent`**: Confirmation of sent message
- **`message_delivered`**: Message delivery confirmation
- **`new_message`**: Incoming message notification

### Message Format

```json
{
  "event": "message",
  "to": "user_id",
  "message": "Hello, world!"
}
```

## 🛡️ Security Features

### Input Validation
- **Message sanitization**: HTML tag filtering with bleach
- **Length limits**: Maximum 1000 characters per message
- **Spam detection**: Pattern-based spam identification
- **URL validation**: Safe URL checking and blocking

### Rate Limiting
- **Global limits**: 10 requests/minute for health checks
- **Chat endpoints**: 30-60 requests/minute based on endpoint
- **WebSocket protection**: Connection limits and validation

### XSS Protection
- **HTML sanitization**: Only allows safe tags (`<b>`, `<i>`, `<em>`, `<strong>`, `<u>`)
- **Entity escaping**: Prevents script injection
- **Content validation**: Comprehensive message validation

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    google_id VARCHAR UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    avatar_url VARCHAR
);
```

### Messages Table
```sql
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    from_id INTEGER REFERENCES users(id),
    to_id INTEGER REFERENCES users(id),
    content VARCHAR NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    seen_at TIMESTAMP WITH TIME ZONE
);
```

## 📊 Monitoring

### Prometheus Metrics
- **Connection metrics**: Active WebSocket connections
- **Message metrics**: Sent/delivered message counts
- **Error rates**: API error monitoring
- **Performance**: Response time tracking

### Grafana Dashboards
- **Chat Dashboard**: Real-time chat metrics
- **System Health**: Application performance
- **User Activity**: Connection and message patterns

Access Grafana at: http://localhost:3000

## 🚀 Deployment

### Production Docker

```bash
# Build production image
docker build -t teachly-backend:latest .

# Run with production settings
docker run -d \
  --name teachly-backend \
  -p 8000:8000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e GOOGLE_CLIENT_ID=your_client_id \
  teachly-backend:latest
```

### Environment Variables (Production)

```bash
# Required
DATABASE_URL=postgresql://user:password@host:5432/database
GOOGLE_CLIENT_ID=your_google_client_id

# Optional
LOG_LEVEL=INFO
CORS_ORIGINS=https://yourdomain.com
RATE_LIMIT_ENABLED=true
```

### Health Checks

The application includes built-in health checks:

```bash
curl http://localhost:8000/health
# Returns: {"status": "ok"}
```

## ⚖️ Trade-offs

### Chosen Approaches

1. **FastAPI + WebSockets**: 
   - ✅ Excellent performance and async support
   - ✅ Built-in API documentation
   - ❌ Less mature WebSocket ecosystem than Socket.IO

2. **PostgreSQL**: 
   - ✅ ACID compliance for message reliability
   - ✅ Rich querying capabilities
   - ❌ Higher resource usage than NoSQL

3. **In-memory Connection Manager**: 
   - ✅ Simple and fast for single-instance
   - ❌ Doesn't scale across multiple instances

4. **Google OAuth**: 
   - ✅ Secure and widely trusted
   - ✅ No password management needed
   - ❌ Dependency on Google's services

### Future Improvements

1. **Scalability**: 
   - Redis for session storage
   - Multiple backend instances
   - Load balancer integration

2. **Performance**: 
   - Message caching
   - Database connection pooling
   - Async database operations

3. **Security**: 
   - JWT token refresh
   - Rate limiting per user
   - Message encryption

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check if PostgreSQL is running
   docker-compose ps
   
   # View database logs
   docker-compose logs db
   ```

2. **WebSocket Connection Issues**
   ```bash
   # Check backend logs
   docker-compose logs backend
   
   # Verify CORS settings
   curl -H "Origin: http://localhost:5173" http://localhost:8000/health
   ```

3. **Google OAuth Errors**
   - Verify `GOOGLE_CLIENT_ID` is correct
   - Check Google Cloud Console settings
   - Ensure authorized origins include your domain
