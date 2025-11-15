/**
 * Environment Configuration
 * Centralized configuration management
 */

require('dotenv').config();

const config = {
  // Server
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'mount_builder',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },

  // JWT - NO DEFAULT SECRET FOR SECURITY
  jwt: {
    secret: process.env.JWT_SECRET,
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || '',
    ttl: 604800, // 1 week in seconds
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
    credentials: true,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
  },

  // Bible API
  bibleAPI: {
    primary: 'https://bible-api.com',
    fallback: 'https://bolls.life',
    cacheTTL: 2592000, // 30 days in seconds
  },

  // Application
  app: {
    name: 'Mount Builder',
    version: '2.0.0',
    maxSermonSize: 1024 * 1024, // 1MB max sermon size
    maxBatchSize: 100, // Max sermons per batch operation
  },
};

// Validation - JWT secret is REQUIRED in ALL environments
if (!config.jwt.secret) {
  console.error('❌ FATAL ERROR: JWT_SECRET environment variable is required!');
  console.error('Generate a secure secret with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  process.exit(1);
}

if (config.jwt.secret.length < 32) {
  console.error('❌ FATAL ERROR: JWT_SECRET must be at least 32 characters long for security!');
  process.exit(1);
}

// Additional production validations
if (config.nodeEnv === 'production') {
  if (!process.env.DB_PASSWORD) {
    console.error('⚠️  WARNING: No database password set in production!');
  }

  if (config.cors.origin === 'http://localhost:8080') {
    console.error('❌ FATAL ERROR: CORS_ORIGIN must be set to your production domain!');
    process.exit(1);
  }
}

module.exports = config;
