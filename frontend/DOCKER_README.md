# Frontend Docker Setup

This directory contains Docker configuration for the React/Vite frontend application.

## Files Overview

- `Dockerfile` - Production build with nginx
- `Dockerfile.dev` - Development build with hot reloading
- `docker-compose.yml` - Container orchestration
- `nginx.conf` - Nginx configuration for serving the SPA
- `.dockerignore` - Excludes unnecessary files from Docker builds

## Quick Start

### Production Build

```bash
# Build and run production container
docker-compose up --build

# Or using the helper script
./docker-helper.sh start

# Or using Docker directly
docker build -t teachly-frontend .
docker run -p 5173:80 teachly-frontend
```

**Access:** http://localhost:5173

## Container Details

### Production Container
- **Base Image:** `node:18` (build stage) + `nginx:alpine` (runtime)
- **Port:** 80 (mapped to 5173 on host)
- **Features:**
  - Multi-stage build for optimal size
  - Nginx with SPA routing support
  - Static asset caching
  - Security headers
  - Gzip compression
  - Health checks
  - Environment variables support

## Docker Compose Services

### `frontend` (Production)
- Builds using `Dockerfile`
- Runs on port 5173
- Optimized for production deployment
- Includes environment variables for Google OAuth and API URL

## Configuration

### Environment Variables
You can set environment variables for the containers:

```bash
# For development
docker-compose --profile dev up --build -e NODE_ENV=development

# Using .env file
echo "NODE_ENV=development" > .env
docker-compose --profile dev up --build
```

### API Proxy
If you need to proxy API requests, uncomment and configure the API proxy section in `nginx.conf`:

```nginx
location /api/ {
    proxy_pass http://your-backend-server:port;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Usage Commands

### Docker Compose Commands

```bash
docker-compose up --build              # Build and run
docker-compose up -d --build           # Run in background
docker-compose down                     # Stop and remove
docker-compose logs -f                  # View logs
```

### Helper Script Commands

```bash
./docker-helper.sh start               # Build and run container
./docker-helper.sh build               # Build image only
./docker-helper.sh stop                # Stop container
./docker-helper.sh logs                # View logs
./docker-helper.sh health              # Check health
./docker-helper.sh clean               # Clean up
```

### Direct Docker Commands

```bash
docker build -t teachly-frontend .
docker run -p 5173:80 teachly-frontend
docker run -p 5173:80 -d teachly-frontend  # Run in background
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   netstat -tulpn | grep :3000
   # or
   lsof -i :3000
   ```

2. **Hot Reloading Not Working**
   - Ensure volumes are properly mounted
   - Check that the container has write permissions
   - Verify that `dev:host` script exists in package.json

3. **Build Failures**
   - Check that all dependencies are in package.json
   - Ensure TypeScript configuration is correct
   - Verify that the build command works locally

4. **Static Assets Not Loading**
   - Check nginx configuration
   - Verify that files are in the correct location
   - Check browser console for errors

### Useful Commands

```bash
# Enter running container
docker exec -it teachly-frontend-dev /bin/bash

# View container logs
docker logs teachly-frontend-dev

# Inspect container
docker inspect teachly-frontend-dev

# Remove all containers and images
docker system prune -a
```

## Performance Optimizations

### Production Build
- Multi-stage build reduces final image size
- Static assets are cached for 1 year
- Gzip compression enabled
- Security headers included

### Development Build
- Volume mounting for instant code changes
- Node modules volume to prevent reinstallation
- Hot module replacement enabled

## Security Features

The nginx configuration includes several security headers:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Deployment

### Local Development
Use the development setup for local development with hot reloading.

### Production Deployment
Use the production setup for deploying to servers, cloud platforms, or container orchestration systems like Kubernetes.

### Cloud Deployment
The production image can be deployed to:
- AWS ECS/EKS
- Google Cloud Run
- Azure Container Instances
- DigitalOcean App Platform
- Heroku (with heroku.yml)

## Next Steps

1. **Configure API Backend:** Update the nginx proxy configuration to point to your backend API
2. **Environment Variables:** Set up environment-specific configurations
3. **CI/CD:** Integrate with your CI/CD pipeline for automated builds
4. **Monitoring:** Add health checks and monitoring
5. **HTTPS:** Configure SSL/TLS for production deployment 