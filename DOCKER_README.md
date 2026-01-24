# Docker Setup Guide

This project has been fully Dockerized for easy deployment and development.

## Prerequisites

- Docker Desktop (for Windows/Mac) or Docker Engine (for Linux)
- Docker Compose

## Quick Start

1. **Clone the repository** (if not already done)

2. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` file with your actual configuration values.

3. **Build and start all services**

   ```bash
   docker-compose up --build
   ```

4. **Access the services**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - ML API: http://localhost:8000
   - PostgreSQL: localhost:5432

## Docker Services

### Frontend (React)

- **Container**: `ecommerce-frontend`
- **Port**: 3000
- **Built with**: Multi-stage build (Node.js + Nginx)

### Backend (Node.js/Express)

- **Container**: `ecommerce-backend`
- **Port**: 4000
- **Dependencies**: PostgreSQL, ML Service

### ML Service (FastAPI)

- **Container**: `ecommerce-ml`
- **Port**: 8000
- **Purpose**: AI-based SQLi/XSS detection

### Database (PostgreSQL)

- **Container**: `ecommerce-db`
- **Port**: 5432
- **Data**: Persisted in Docker volume `postgres_data`

## Common Commands

### Start services (detached mode)

```bash
docker-compose up -d
```

### Stop services

```bash
docker-compose down
```

### Stop services and remove volumes

```bash
docker-compose down -v
```

### View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f ml-service
```

### Rebuild a specific service

```bash
docker-compose up -d --build backend
```

### Run database migrations

```bash
docker-compose exec backend npx sequelize-cli db:migrate
```

### Access a container shell

```bash
# Backend
docker-compose exec backend sh

# Database
docker-compose exec postgres psql -U postgres -d ecommerce
```

## Development Mode

For development with hot-reload, you can modify the backend service in docker-compose.yml to use nodemon:

```yaml
backend:
  command: npm run start:dev
```

## Production Deployment

1. Update environment variables in `.env` for production
2. Set `NODE_ENV=production`
3. Consider using Docker Swarm or Kubernetes for orchestration
4. Set up proper secrets management
5. Configure reverse proxy (nginx/traefik) for SSL termination

## Troubleshooting

### Port already in use

If ports are already in use, modify the port mappings in `docker-compose.yml`:

```yaml
ports:
  - "3001:80" # Change host port
```

### Database connection issues

Ensure the database service is healthy before backend starts:

```bash
docker-compose ps
```

### Rebuilding from scratch

```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

## Architecture

```
┌─────────────────┐
│   Frontend      │
│   (React)       │
│   Port: 3000    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│   Backend       │────▶│   ML Service    │
│   (Express)     │     │   (FastAPI)     │
│   Port: 4000    │     │   Port: 8000    │
└────────┬────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │
│   Port: 5432    │
└─────────────────┘
```

## Notes

- All services are connected via the `app-network` Docker network
- PostgreSQL data is persisted in a Docker volume
- Frontend is served via Nginx in production mode
- Backend hot-reloading is disabled by default (enable for development)
