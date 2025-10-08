# Self-Hosting Guide

## Purpose and Scope

This document provides comprehensive instructions for self-hosting the Real-Time Collaborative Code Editor system. It covers environment configuration, deployment strategies, and production setup for all microservices.

For build tool configurations (Babel, Jest, Vite), see the main [README.md](README.md). For system architecture details, refer to the [Architecture Overview](README.md#architecture-overview).

---

## Table of Contents

- [Environment Architecture](#environment-architecture)
- [Frontend Configuration](#frontend-configuration)
- [API Gateway Configuration](#api-gateway-configuration)
- [Codespace Service Configuration](#codespace-service-configuration)
- [WebSocket Server Configuration](#websocket-server-configuration)
- [Version Engine Configuration](#version-engine-configuration)
- [Service Communication](#service-communication-variables)
- [Configuration Security](#configuration-security)
- [Deployment Options](#deployment-options)
- [Variable Reference Table](#variable-reference-table)

---

## Environment Architecture

The system employs **service-specific environment configuration**, where each microservice maintains its own `.env` file with isolated configuration parameters. Environment variables control service behavior, external integrations, and inter-service communication.

### Configuration Distribution

Each service requires different environment variables:

- **Frontend**: Supabase connection for client-side authentication
- **API Gateway**: JWT validation and routing configuration
- **Codespace Service**: Full Supabase integration, email, and AI capabilities
- **WebSocket Server**: Supabase Storage for YJS persistence
- **Version Engine**: Redis queue and Supabase Storage for Git operations

---

## Frontend Configuration

The Frontend service requires Supabase connection parameters prefixed with `VITE_` for Vite build tool integration. These variables are embedded during build time and exposed to the client browser.

### Required Variables

| Variable                 | Description                               | Example Value           | Required |
| ------------------------ | ----------------------------------------- | ----------------------- | -------- |
| VITE_SUPABASE_PROJECT_ID | Supabase project identifier               | abcdef123456            | Yes      |
| VITE_SUPABASE_URL        | Supabase API endpoint                     | https://xxx.supabase.co | Yes      |
| VITE_SUPABASE_ANON_KEY   | Public anonymous key for client-side auth | eyJhbGciOiJIUzI1...     | Yes      |

### Configuration File

Create `Frontend/.env`:

```env
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

> **Note**: The `VITE_` prefix ensures these variables are processed by Vite during the build phase and made available to the client-side JavaScript bundle. The Frontend uses these to initialize the Supabase client for authentication and database operations.

---

## API Gateway Configuration

The API Gateway requires minimal configuration focused on authentication validation and server binding.

### Required Variables

| Variable            | Description                             | Example Value          | Required |
| ------------------- | --------------------------------------- | ---------------------- | -------- |
| PORT                | HTTP server listening port              | 4000                   | No       |
| SUPABASE_JWT_SECRET | JWT signing secret for token validation | your_jwt_secret        | Yes      |
| NODE_ENV            | Environment mode                        | production/development | Yes      |

### Configuration File

Create `API_Gateway/.env`:

```env
PORT=4000
SUPABASE_JWT_SECRET=your_jwt_secret_from_supabase
NODE_ENV=development
```

### Environment-Based Routing Logic

The `NODE_ENV` variable controls proxy target resolution, switching between:

- **Production** (`NODE_ENV=production`): Uses containerized service names (`codespace-service`, `ws-server`)
- **Development** (`NODE_ENV=development`): Uses localhost addresses (`localhost:5000`, `localhost:4455`)

> **Critical**: The JWT secret must match your Supabase project's JWT secret for authentication to function properly.

---

## Codespace Service Configuration

The Codespace Service requires the most comprehensive configuration due to its integration with Supabase, email services, and AI capabilities.

### Required Variables

| Variable                     | Description                      | Example Value           | Required |
| ---------------------------- | -------------------------------- | ----------------------- | -------- |
| SUPABASE_URL                 | Supabase API endpoint            | https://xxx.supabase.co | Yes      |
| SUPABASE_ANON_KEY            | Supabase anonymous key           | eyJhbGciOiJIUzI1...     | Yes      |
| SUPABASE_PROJECT_ID          | Supabase project identifier      | abcdef123456            | Yes      |
| Email_password               | SMTP app password for Nodemailer | your_app_password       | Yes      |
| Email_user                   | SMTP username/email address      | your_email@gmail.com    | Yes      |
| PORT                         | HTTP server port                 | 5000                    | No       |
| HOST                         | Server bind address              | localhost/0.0.0.0       | No       |
| GOOGLE_GENERATIVE_AI_API_KEY | Google Gemini API key            | AIza...                 | Yes      |

### Configuration File

Create `Codespace_Service/.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_PROJECT_ID=your_project_id
Email_password=your_smtp_app_password
Email_user=your_email@gmail.com
PORT=5000
HOST=localhost
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

### Email Configuration Notes

For Gmail users:

1. Enable 2-Factor Authentication
2. Generate an App Password from Google Account Settings
3. Use the app password as `Email_password`

---

## WebSocket Server Configuration

The WebSocket Server handles real-time collaboration and requires Supabase credentials for YJS persistence.

### Required Variables

| Variable            | Description                 | Example Value           | Required |
| ------------------- | --------------------------- | ----------------------- | -------- |
| SUPABASE_URL        | Supabase API endpoint       | https://xxx.supabase.co | Yes      |
| SUPABASE_ANON_KEY   | Supabase anonymous key      | eyJhbGciOiJIUzI1...     | Yes      |
| SUPABASE_PROJECT_ID | Supabase project identifier | abcdef123456            | Yes      |
| PORT                | WebSocket server port       | 4455                    | No       |

### Configuration File

Create `WS_Server/.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_PROJECT_ID=your_project_id
PORT=4455
```

> **Note**: The WebSocket Server connects to Supabase Storage to persist YJS document updates to the `sessionFiles` bucket and load initial document state during session initialization.

---

## Version Engine Configuration

The Version Engine worker requires both Supabase and Redis configuration for asynchronous Git operations.

### Required Variables

| Variable            | Description                        | Example Value           | Required |
| ------------------- | ---------------------------------- | ----------------------- | -------- |
| SUPABASE_URL        | Supabase API endpoint for metadata | https://xxx.supabase.co | Yes      |
| SUPABASE_ANON_KEY   | Supabase anonymous key             | eyJhbGciOiJIUzI1...     | Yes      |
| SUPABASE_PROJECT_ID | Supabase project identifier        | abcdef123456            | Yes      |
| REDIS_HOST          | Redis server hostname              | localhost/redis         | Yes      |
| REDIS_PORT          | Redis server port                  | 6379                    | Yes      |
| REDIS_PASSWORD      | Redis authentication password      | your_redis_password     | No       |

### Configuration File

Create `Version_Engine/.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_PROJECT_ID=your_project_id
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
```

> **Note**: The Version Engine consumes jobs from the Redis BullMQ queue and performs Git operations on repositories stored in Supabase Storage's `gitFolders` bucket.

---

## Service Communication Variables

### Inter-Service Target Resolution

The `NODE_ENV` variable in the API Gateway controls how services discover and communicate with each other:

```javascript
const CODESPACE_SERVICE_URL =
  process.env.NODE_ENV === "production"
    ? "http://codespace-service:5000"
    : "http://localhost:5000";

const WS_SERVER_URL =
  process.env.NODE_ENV === "production"
    ? "http://ws-server:4455"
    : "http://localhost:4455";
```

**Development Mode** (`NODE_ENV=development`):

- Services communicate via localhost addresses
- Each service runs independently on its configured port

**Production Mode** (`NODE_ENV=production`):

- Services use Docker container names for DNS resolution
- Requires Docker Compose or Kubernetes networking

---

## Configuration Security

### Sensitive Variables

The following variables contain sensitive credentials and must be protected:

| Variable                     | Security Level | Protection Strategy                |
| ---------------------------- | -------------- | ---------------------------------- |
| SUPABASE_JWT_SECRET          | Critical       | Never commit; rotate regularly     |
| SUPABASE_ANON_KEY            | High           | Public but rate-limited            |
| Email_password               | Critical       | Use app-specific passwords         |
| GOOGLE_GENERATIVE_AI_API_KEY | Critical       | Never commit; rotate on exposure   |
| REDIS_PASSWORD               | High           | Use strong passwords in production |

### Gitignore Protection

All services include `.env` in their `.gitignore` files to prevent accidental commits:

```gitignore
# Environment variables
.env
.env.local
.env.production
```

### Environment Variable Validation

The API Gateway validates critical environment variables at startup:

```javascript
if (!process.env.SUPABASE_JWT_SECRET) {
  throw new Error("SUPABASE_JWT_SECRET environment variable is required");
}
```

This fail-fast approach prevents services from starting with incomplete configuration.

---

## Deployment Options

### Local Development Setup

1. **Install Dependencies**

   ```bash
   # Install Node.js dependencies for each service
   cd Frontend && npm install
   cd ../API_Gateway && npm install
   cd ../Codespace_Service && npm install
   cd ../WS_Server && npm install
   cd ../Version_Engine/producer && npm install
   cd ../worker-git && npm install
   ```

2. **Create Environment Files**

   Create `.env` files in each service directory using the templates provided above.

3. **Start Services**

   ```bash
   # Start all services concurrently
   # Frontend
   cd Frontend && npm run dev

   # Backend services
   cd API_Gateway && npm run dev
   cd Codespace_Service && npm run dev
   cd WS_Server && npm run dev

   # Version Engine (requires Redis running)
   cd Version_Engine/producer && npm start
   cd Version_Engine/worker-git && npm start
   ```

### Docker Compose Deployment

1. **Set Environment Variables**

   Set `NODE_ENV=production` in `API_Gateway/.env`

2. **Configure Docker Compose**

   The provided `compose.yaml` files in each service directory handle service orchestration.

3. **Build and Start**

   ```bash
   # From the root directory
   docker-compose up --build
   ```

### Production Deployment Checklist

- [ ] Set `NODE_ENV=production` in API Gateway
- [ ] Use strong passwords for Redis and database
- [ ] Rotate JWT secrets regularly
- [ ] Enable HTTPS/TLS for all services
- [ ] Configure proper CORS policies
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies for Supabase data
- [ ] Implement rate limiting and DDoS protection
- [ ] Use secrets management system (e.g., AWS Secrets Manager, HashiCorp Vault)
- [ ] Configure auto-scaling for high-traffic services

---

## Variable Reference Table

### Consolidated Environment Variables

| Variable                     | Frontend | API Gateway | Codespace Service | WS Server | Version Engine |
| ---------------------------- | -------- | ----------- | ----------------- | --------- | -------------- |
| VITE_SUPABASE_PROJECT_ID     | ✓        | -           | -                 | -         | -              |
| VITE_SUPABASE_URL            | ✓        | -           | -                 | -         | -              |
| VITE_SUPABASE_ANON_KEY       | ✓        | -           | -                 | -         | -              |
| PORT                         | -        | ✓           | ✓                 | ✓         | -              |
| HOST                         | -        | -           | ✓                 | -         | -              |
| SUPABASE_JWT_SECRET          | -        | ✓           | -                 | -         | -              |
| NODE_ENV                     | -        | ✓           | -                 | -         | -              |
| SUPABASE_URL                 | -        | -           | ✓                 | ✓         | ✓              |
| SUPABASE_ANON_KEY            | -        | -           | ✓                 | ✓         | ✓              |
| SUPABASE_PROJECT_ID          | -        | -           | ✓                 | ✓         | ✓              |
| Email_user                   | -        | -           | ✓                 | -         | -              |
| Email_password               | -        | -           | ✓                 | -         | -              |
| GOOGLE_GENERATIVE_AI_API_KEY | -        | -           | ✓                 | -         | -              |
| REDIS_HOST                   | -        | -           | -                 | -         | ✓              |
| REDIS_PORT                   | -        | -           | -                 | -         | ✓              |
| REDIS_PASSWORD               | -        | -           | -                 | -         | ✓ (optional)   |

---

## Getting Help

If you encounter issues during self-hosting:

1. **Check Logs**: Review service logs for error messages
2. **Validate Configuration**: Ensure all required environment variables are set
3. **Network Connectivity**: Verify services can communicate with each other
4. **Supabase Setup**: Confirm Supabase project is properly configured with required buckets and tables
5. **Redis Connection**: Ensure Redis is running and accessible for Version Engine

For additional support, refer to:

- [Main README](README.md)
- [System Architecture Documentation](README.md#architecture-overview)
- [GitHub Issues](https://github.com/AnujaKalahara99/Realtime-Collaborative-Code-Editor/issues)

---

**Happy Self-Hosting! 🚀**
