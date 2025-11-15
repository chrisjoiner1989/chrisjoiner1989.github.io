/**
 * User Model
 * Handles user database operations
 */

const bcrypt = require('bcrypt');
const { query } = require('../config/database');

const SALT_ROUNDS = 12;

class User {
  /**
   * Create a new user
   */
  static async create({ email, password, name }) {
    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await query(
      `INSERT INTO users (email, password_hash, name, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING id, email, name, created_at`,
      [email.toLowerCase(), passwordHash, name]
    );

    return result.rows[0];
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    return result.rows[0];
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    const result = await query(
      'SELECT id, email, name, created_at, updated_at, last_login FROM users WHERE id = $1',
      [id]
    );

    return result.rows[0];
  }

  /**
   * Verify password
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Update last login time
   */
  static async updateLastLogin(userId) {
    await query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [userId]
    );
  }

  /**
   * Update user information
   */
  static async update(userId, { name, email }) {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }

    if (email !== undefined) {
      updates.push(`email = $${paramCount}`);
      values.push(email.toLowerCase());
      paramCount++;
    }

    if (updates.length === 0) {
      return null;
    }

    updates.push(`updated_at = NOW()`);
    values.push(userId);

    const result = await query(
      `UPDATE users SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING id, email, name, updated_at`,
      values
    );

    return result.rows[0];
  }

  /**
   * Change password
   */
  static async changePassword(userId, newPassword) {
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [passwordHash, userId]
    );
  }

  /**
   * Delete user and all associated data
   */
  static async delete(userId) {
    // Due to CASCADE, this will delete all user's sermons and preferences
    await query('DELETE FROM users WHERE id = $1', [userId]);
  }

  /**
   * Get user statistics
   */
  static async getStats(userId) {
    const result = await query(
      `SELECT
        COUNT(*) as total_sermons,
        COUNT(DISTINCT series) as total_series,
        MIN(date) as first_sermon_date,
        MAX(date) as last_sermon_date
       FROM sermons
       WHERE user_id = $1`,
      [userId]
    );

    return result.rows[0];
  }

  /**
   * Check if email is already registered
   */
  static async emailExists(email) {
    const result = await query(
      'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)',
      [email.toLowerCase()]
    );

    return result.rows[0].exists;
  }
}

module.exports = User;
