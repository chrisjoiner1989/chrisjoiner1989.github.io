# Mount Builder Backend Setup Guide

## Overview

This backend provides a RESTful API for Mount Builder with PostgreSQL database, JWT authentication, and cloud sync capabilities while maintaining offline-first functionality.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ installed and running
- Git (for version control)

## Quick Start

### 1. Install PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows:**
Download and install from https://www.postgresql.org/download/windows/

### 2. Create Database

```bash
# Connect to PostgreSQL
psql postgres

# Create database and user
CREATE DATABASE mount_builder;
CREATE USER mount_builder_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE mount_builder TO mount_builder_user;

# Exit psql
\q
```

### 3. Configure Environment

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your settings:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mount_builder
DB_USER=mount_builder_user
DB_PASSWORD=your_secure_password

# JWT Configuration (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:8080

# Application Settings
MAX_SERMON_SIZE=1048576
MAX_BATCH_SIZE=100
```

**IMPORTANT SECURITY NOTES:**
- Generate a strong JWT secret (at least 32 characters, random)
- Use different secrets for development and production
- Never commit `.env` file to version control

### 4. Install Dependencies

```bash
npm install
```

### 5. Start Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will:
1. Connect to PostgreSQL
2. Initialize database schema automatically
3. Start listening on the configured port (default: 3000)

### 6. Verify Installation

Open browser or use curl:
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "version": "2.0.0",
  "database": "connected",
  "timestamp": "2025-11-15T..."
}
```

## API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication Endpoints

#### Register New User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

#### Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer {accessToken}
```

### Sermon Endpoints

All sermon endpoints require authentication (Bearer token).

#### List Sermons (with pagination)
```http
GET /api/v1/sermons?page=1&limit=20&sortBy=date&sortOrder=DESC
Authorization: Bearer {accessToken}
```

#### Create Sermon
```http
POST /api/v1/sermons
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "The Gospel of Grace",
  "speaker": "Pastor John",
  "date": "2025-11-15",
  "series": "Gospel Series",
  "notes": "Sermon notes here...",
  "verseReference": "Ephesians 2:8-9",
  "verseData": {
    "verses": [...]
  },
  "tags": ["grace", "salvation"]
}
```

#### Search Sermons
```http
GET /api/v1/sermons/search?q=grace&page=1&limit=20
Authorization: Bearer {accessToken}
```

#### Filter Sermons
```http
GET /api/v1/sermons/filter?speaker=Pastor John&series=Gospel Series
Authorization: Bearer {accessToken}
```

#### Bulk Import (for migration)
```http
POST /api/v1/sermons/bulk
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "sermons": [
    {
      "title": "Sermon 1",
      "date": "2025-01-01",
      ...
    },
    ...
  ]
}
```

### Bible Endpoints

Bible endpoints work without authentication but can be used with auth for personalized caching.

#### Get Verse
```http
GET /api/v1/bible/verse?ref=John+3:16&translation=KJV
```

#### Get Chapter
```http
GET /api/v1/bible/chapter?book=John&chapter=3&translation=KJV
```

## Database Schema

The database schema is automatically initialized on first startup. Tables include:

- **users**: User accounts with bcrypt password hashing
- **sermons**: Sermon data with full-text search indexes
- **bible_cache**: Server-side Bible verse caching
- **user_preferences**: User settings and preferences

## Security Features

1. **Password Security**
   - bcrypt hashing with 12 salt rounds
   - Minimum 8 characters with letters and numbers

2. **JWT Authentication**
   - Short-lived access tokens (15 minutes)
   - Long-lived refresh tokens (7 days)
   - Token type validation

3. **Rate Limiting**
   - 100 requests per 15 minutes per IP
   - Prevents brute force attacks

4. **SQL Injection Protection**
   - Parameterized queries throughout
   - No dynamic SQL construction

5. **XSS Protection**
   - Helmet.js security headers
   - Input validation and sanitization

6. **CORS Configuration**
   - Configurable allowed origins
   - Credentials support

## Troubleshooting

### Database Connection Errors

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution**: Ensure PostgreSQL is running:
```bash
# macOS
brew services start postgresql@14

# Linux
sudo systemctl start postgresql
```

### Authentication Errors

```
Error: Invalid token
```

**Solution**: Token may be expired. Use refresh token endpoint or login again.

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution**: Change PORT in `.env` file or kill the process using port 3000:
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## Production Deployment

### Environment Variables

Ensure these are properly set in production:

1. `NODE_ENV=production`
2. Strong `JWT_SECRET` (min 32 chars, cryptographically random)
3. Secure database credentials
4. Proper `CORS_ORIGIN` (your frontend domain)

### Database

1. Enable SSL for PostgreSQL connections
2. Regular backups (pg_dump)
3. Connection pooling properly configured

### Server

1. Use process manager (PM2, systemd)
2. Enable HTTPS/TLS
3. Set up reverse proxy (nginx, Apache)
4. Configure firewall rules
5. Monitor logs and errors

### Example PM2 Configuration

```bash
npm install -g pm2
pm2 start server/index.js --name mount-builder
pm2 startup
pm2 save
```

## API Rate Limits

- Default: 100 requests per 15 minutes per IP
- Bulk imports: Max 100 sermons per request
- Sermon size: Max 1MB per sermon

## Support

For issues or questions:
1. Check this README
2. Review API documentation at `/api/v1`
3. Check server logs
4. Verify environment configuration
