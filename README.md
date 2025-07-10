# Teachly - Real-time Chat Application

A modern real-time chat application built with React (frontend) and Python FastAPI (backend), featuring Google OAuth authentication, WebSocket communication, and comprehensive monitoring.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Google Cloud Platform account (for OAuth credentials)

### 1. Environment Setup

Copy the environment template and fill in your credentials:

```bash
cp env.template .env
```

Edit the `.env` file with your actual values:

```env
# Frontend Environment Variables
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here

# Backend Environment Variables
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

```

### 2. Running the Application

Start the entire application stack with a single command:

```bash
docker-compose up --build
```

Or run in detached mode:

```bash
docker-compose up -d --build
```

### 3. Access the Application

Once all services are running, you can access:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Database**: localhost:5432
- **Redis**: localhost:6379
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000

### 4. Google OAuth Setup

To enable Google authentication:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials
5. Add `http://localhost:5173` to authorized origins
6. Add your redirect URIs
7. Copy the Client ID and Client Secret to your `.env` file

## 🏗️ Architecture

### Services

- **Frontend**: React + Vite application with TypeScript
- **Backend**: Python FastAPI with WebSocket support
- **Database**: PostgreSQL for persistent data
- **Cache**: Redis for session management
- **Monitoring**: Prometheus + Grafana for metrics and dashboards

### Key Features

- Real-time messaging with WebSocket
- Google OAuth authentication
- Message sanitization and security
- Responsive UI design
- Comprehensive monitoring
- Docker containerization

## 🛠️ Development

### Running Individual Services

```bash
# Frontend only
docker-compose up frontend --build

# Backend only
docker-compose up backend --build

# Database only
docker-compose up db
```

### Frontend Development

For frontend development with hot reloading:

```bash
cd frontend
./docker-helper.sh start
```

### Logs

View logs for all services:

```bash
docker-compose logs -f
```

View logs for specific service:

```bash
docker-compose logs -f frontend
docker-compose logs -f backend
```

## 🔧 Technical Notes

### Project Decisions and Trade-offs

Due to time constraints and to avoid getting blocked early on, I deprioritized some must-have items like automated tests, GitHub Actions, and Terraform deployment. I initially attempted the Terraform path, but later decided to focus on building a smooth UX, stable functionality, and proper sanitization and security handling.

### Authentication & Security

There's no token refreshing implemented, but sessions last for one hour via Google's default token. My plan was to complement it with a JWT strategy and a refresh endpoint.

### Deployment & Configuration

The app runs locally with a single docker-compose.yml. Credentials are required in a .env file—which I didn't commit for security reasons. Additionally, GitHub flagged and blocked the file due to security policy violations. A .env.example is included instead; you only need to fill in the missing values (though setting up the GCP OAuth credentials can be a bit tedious). Because of this, I opted for a manual deployment. I made a few out-of-repo adjustments to get it running over HTTPS on GCP using my personal domain, temporarily.

### Design Inspiration

The UI was inspired by this Figma design:
https://www.figma.com/design/ewsGG9UQQgT2ZjyamiFQpB/Chat-App-UI--Community-?node-id=0-1&p=f&t=vwZWD4PrbyAAxlS7-0

## 📁 Project Structure

```
teachly/
├── frontend/                 # React frontend application
│   ├── src/
│   ├── Dockerfile           # Production build
│   ├── Dockerfile.dev       # Development build
│   └── docker-helper.sh     # Helper script
├── backend/                 # Python FastAPI backend
│   ├── app/
│   └── Dockerfile
├── monitoring/              # Prometheus & Grafana configs
├── terraform/               # Infrastructure as code (unused)
├── docker-compose.yml       # Main orchestration
└── env.template            # Environment variables template
```

## 🚀 Possibles Enhancements

- JWT token refresh mechanism
- Comprehensive test suite
- CI/CD pipeline with GitHub Actions
- Automated Terraform deployment
- Enhanced monitoring and alerting
- Mobile responsiveness improvements

## 📞 Support

Let me know if you'd like me to walk through anything specific about the implementation, architecture, or deployment process.

## 🎨 Design Credits

UI design inspired by the community Figma template linked above. 