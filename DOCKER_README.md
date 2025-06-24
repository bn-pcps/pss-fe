# Docker Setup for PSS Frontend

This document explains how to run the PSS Frontend application using Docker.

## Prerequisites

- Docker
- Docker Compose

## Quick Start

1. **Clone the repository and navigate to the project directory**

2. **Set up environment variables**

   Create a `.env` file in the project root with the following variables:

   ```env
   DATABASE_URL=your_database_url
   PUBLIC_FILE_SERVICE_URL=http://localhost:3001
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   POLAR_ACCESS_TOKEN=your_polar_access_token
   ```

3. **Build and run the application**

   ```bash
   docker-compose up --build
   ```

4. **Access the application**

   The application will be available at `http://localhost:3000`

## Docker Commands

### Build the image

```bash
docker-compose build
```

### Run in detached mode

```bash
docker-compose up -d
```

### View logs

```bash
docker-compose logs -f pss-fe
```

### Stop the application

```bash
docker-compose down
```

### Rebuild and restart

```bash
docker-compose down
docker-compose up --build
```

## Environment Variables

The following environment variables can be configured in the `docker-compose.yml` file or passed as environment variables:

- `NODE_ENV`: Set to `production` for production builds
- `PORT`: The port the application runs on (default: 3000)
- `HOSTNAME`: The hostname to bind to (default: 0.0.0.0)
- `DATABASE_URL`: PostgreSQL database connection string
- `PUBLIC_FILE_SERVICE_URL`: URL for the file service
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `POLAR_ACCESS_TOKEN`: Polar access token

## Health Check

The application includes a health check that verifies the application is responding on port 3000. The health check runs every 30 seconds.

## Troubleshooting

### Port already in use

If port 3000 is already in use, you can change the port mapping in `docker-compose.yml`:

```yaml
ports:
  - '3001:3000' # Maps host port 3001 to container port 3000
```

### Build issues

If you encounter build issues, try:

```bash
docker-compose down
docker system prune -f
docker-compose up --build
```

### Database connection issues

Make sure your `DATABASE_URL` is correctly configured and the database is accessible from the Docker container.
