/**
 * Authentication Routes
 * User registration, login, and token management
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  authenticate
} = require('../middleware/auth');
const {
  validateRegistration,
  validateLogin
} = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
router.post('/register', validateRegistration, asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return res.status(409).json({
      success: false,
      error: 'Email already registered'
    });
  }

  // Create user
  const user = await User.create({ email, password, name });

  // Generate tokens
  const accessToken = generateAccessToken(user.id, user.email);
  const refreshToken = generateRefreshToken(user.id, user.email);

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at
      },
      accessToken,
      refreshToken
    }
  });
}));

/**
 * POST /api/v1/auth/login
 * Login user
 */
router.post('/login', validateLogin, asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = await User.findByEmail(email);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid email or password'
    });
  }

  // Verify password
  const isValid = await User.verifyPassword(password, user.password_hash);
  if (!isValid) {
    return res.status(401).json({
      success: false,
      error: 'Invalid email or password'
    });
  }

  // Update last login
  await User.updateLastLogin(user.id);

  // Generate tokens
  const accessToken = generateAccessToken(user.id, user.email);
  const refreshToken = generateRefreshToken(user.id, user.email);

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        lastLogin: new Date()
      },
      accessToken,
      refreshToken
    }
  });
}));

/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 */
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: 'Refresh token required'
    });
  }

  // Verify refresh token
  const decoded = verifyToken(refreshToken);

  if (!decoded || decoded.type !== 'refresh') {
    return res.status(401).json({
      success: false,
      error: 'Invalid refresh token'
    });
  }

  // Check if user still exists
  const user = await User.findById(decoded.userId);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'User not found'
    });
  }

  // Generate new access token
  const accessToken = generateAccessToken(user.id, user.email);

  res.json({
    success: true,
    data: {
      accessToken
    }
  });
}));

/**
 * GET /api/v1/auth/me
 * Get current user info
 */
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  // Get user statistics
  const stats = await User.getStats(user.id);

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
        lastLogin: user.last_login
      },
      stats
    }
  });
}));

/**
 * POST /api/v1/auth/logout
 * Logout (client-side token removal)
 */
router.post('/logout', authenticate, asyncHandler(async (req, res) => {
  // With JWT, logout is mainly handled client-side by removing the token
  // This endpoint exists for consistency and future token blacklisting
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

/**
 * PUT /api/v1/auth/profile
 * Update user profile
 */
router.put('/profile', authenticate, asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  // Check if email is already taken (if changing email)
  if (email && email !== req.user.email) {
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Email already in use'
      });
    }
  }

  const updatedUser = await User.update(req.user.id, { name, email });

  if (!updatedUser) {
    return res.status(400).json({
      success: false,
      error: 'No changes made'
    });
  }

  res.json({
    success: true,
    data: {
      user: updatedUser
    }
  });
}));

/**
 * POST /api/v1/auth/change-password
 * Change user password
 */
router.post('/change-password', authenticate, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      error: 'Current and new password required'
    });
  }

  // Get user with password hash
  const user = await User.findByEmail(req.user.email);

  // Verify current password
  const isValid = await User.verifyPassword(currentPassword, user.password_hash);
  if (!isValid) {
    return res.status(401).json({
      success: false,
      error: 'Current password is incorrect'
    });
  }

  // Validate new password
  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      error: 'New password must be at least 8 characters'
    });
  }

  // Change password
  await User.changePassword(req.user.id, newPassword);

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

/**
 * DELETE /api/v1/auth/account
 * Delete user account and all data
 */
router.delete('/account', authenticate, asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      error: 'Password required for account deletion'
    });
  }

  // Get user with password hash
  const user = await User.findByEmail(req.user.email);

  // Verify password
  const isValid = await User.verifyPassword(password, user.password_hash);
  if (!isValid) {
    return res.status(401).json({
      success: false,
      error: 'Incorrect password'
    });
  }

  // Delete user (CASCADE will delete all sermons)
  await User.delete(req.user.id);

  res.json({
    success: true,
    message: 'Account deleted successfully'
  });
}));

module.exports = router;
