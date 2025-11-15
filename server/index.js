/**
 * Mount Builder API Server
 * Main server entry point
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config/env');
const { initializeSchema, checkConnection } = require('./config/database');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const sermonRoutes = require('./routes/sermons');
const bibleRoutes = require('./routes/bible');

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors(config.cors));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    error: 'Too many requests, please try again later'
  }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (frontend)
app.use(express.static('.', {
  index: false, // Don't serve index.html for all routes
  extensions: ['html']
}));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const dbOk = await checkConnection();

  res.json({
    success: true,
    data: {
      status: 'ok',
      version: config.app.version,
      database: dbOk ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    }
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/sermons', sermonRoutes);
app.use('/api/v1/bible', bibleRoutes);

// API documentation endpoint
app.get('/api/v1', (req, res) => {
  res.json({
    success: true,
    message: 'Mount Builder API v1',
    endpoints: {
      auth: {
        'POST /api/v1/auth/register': 'Register new user',
        'POST /api/v1/auth/login': 'Login user',
        'POST /api/v1/auth/refresh': 'Refresh access token',
        'GET /api/v1/auth/me': 'Get current user',
        'POST /api/v1/auth/logout': 'Logout user',
        'PUT /api/v1/auth/profile': 'Update profile',
        'POST /api/v1/auth/change-password': 'Change password',
        'DELETE /api/v1/auth/account': 'Delete account'
      },
      sermons: {
        'GET /api/v1/sermons': 'List all sermons',
        'GET /api/v1/sermons/search': 'Search sermons',
        'GET /api/v1/sermons/filter': 'Filter sermons',
        'GET /api/v1/sermons/speakers': 'Get all speakers',
        'GET /api/v1/sermons/series': 'Get all series',
        'GET /api/v1/sermons/tags': 'Get all tags',
        'GET /api/v1/sermons/:id': 'Get sermon by ID',
        'POST /api/v1/sermons': 'Create sermon',
        'POST /api/v1/sermons/bulk': 'Bulk create sermons',
        'PUT /api/v1/sermons/:id': 'Update sermon',
        'DELETE /api/v1/sermons/:id': 'Delete sermon'
      },
      bible: {
        'GET /api/v1/bible/verse': 'Fetch Bible verse',
        'GET /api/v1/bible/chapter': 'Fetch Bible chapter',
        'GET /api/v1/bible/cache/stats': 'Cache statistics',
        'GET /api/v1/bible/cache/popular': 'Popular verses',
        'POST /api/v1/bible/cache/clear': 'Clear old cache'
      }
    }
  });
});

// Serve frontend for all other routes
app.get('*', (req, res, next) => {
  // Only serve HTML files, not API routes
  if (req.path.startsWith('/api/')) {
    return next();
  }

  // Serve appropriate HTML file
  const path = req.path === '/' ? '/home.html' : req.path;
  res.sendFile(path, { root: '.' }, (err) => {
    if (err) next();
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

/**
 * Start server
 */
async function startServer() {
  try {
    // Check database connection
    console.log('Checking database connection...');
    const dbOk = await checkConnection();

    if (!dbOk) {
      console.error('❌ Database connection failed');
      console.log('Please ensure PostgreSQL is running and configured correctly');
      process.exit(1);
    }

    // Initialize database schema
    console.log('Initializing database schema...');
    await initializeSchema();

    // Start listening
    const server = app.listen(config.port, () => {
      console.log('');
      console.log('╔═══════════════════════════════════════════════╗');
      console.log('║      Mount Builder API Server Started        ║');
      console.log('╚═══════════════════════════════════════════════╝');
      console.log('');
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`📚 API Documentation: http://localhost:${config.port}/api/v1`);
      console.log(`🏥 Health Check: http://localhost:${config.port}/api/health`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log('');
      console.log('Press Ctrl+C to stop');
      console.log('');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('\nSIGINT signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = app;
