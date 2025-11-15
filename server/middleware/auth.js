/**
 * Authentication Middleware
 * JWT token verification and user authentication
 */

const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');

/**
 * Generate JWT access token
 */
function generateAccessToken(userId, email) {
  return jwt.sign(
    { userId, email },
    config.jwt.secret,
    { expiresIn: config.jwt.accessTokenExpiry }
  );
}

/**
 * Generate JWT refresh token
 */
function generateRefreshToken(userId, email) {
  return jwt.sign(
    { userId, email, type: 'refresh' },
    config.jwt.secret,
    { expiresIn: config.jwt.refreshTokenExpiry }
  );
}

/**
 * Verify JWT token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    return null;
  }
}

/**
 * Authentication middleware - protects routes
 */
async function authenticate(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Check if it's a refresh token (shouldn't be used for API access)
    if (decoded.type === 'refresh') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token type'
      });
    }

    // Get user from database
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
}

/**
 * Optional authentication - doesn't fail if no token
 * Useful for endpoints that work with or without auth
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (decoded && decoded.type !== 'refresh') {
      const user = await User.findById(decoded.userId);
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name
        };
      }
    }

    next();
  } catch (error) {
    // Continue without auth on error
    req.user = null;
    next();
  }
}

module.exports = {
  authenticate,
  optionalAuth,
  generateAccessToken,
  generateRefreshToken,
  verifyToken
};
