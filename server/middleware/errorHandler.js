/**
 * Error Handler Middleware
 * Centralized error handling
 */

/**
 * Custom API Error class
 */
class APIError extends Error {
  constructor(message, statusCode = 500, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = 'APIError';
  }
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
}

/**
 * Global error handler
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Handle API errors
  if (err instanceof APIError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      errors: err.errors
    });
  }

  // Handle database errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique constraint violation
        return res.status(409).json({
          success: false,
          error: 'Resource already exists',
          details: err.detail
        });

      case '23503': // Foreign key violation
        return res.status(400).json({
          success: false,
          error: 'Invalid reference'
        });

      case '22P02': // Invalid text representation
        return res.status(400).json({
          success: false,
          error: 'Invalid data format'
        });

      default:
        console.error('Database error:', err.code, err.detail);
    }
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired'
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: err.errors
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

/**
 * Async handler wrapper to catch errors in async routes
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  APIError,
  errorHandler,
  notFoundHandler,
  asyncHandler
};
