/**
 * Authentication API Module
 * Handles user authentication and account management
 */

class AuthAPI {
  constructor(client) {
    this.client = client;
  }

  /**
   * Register a new user
   * @param {object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.name - User name
   * @returns {Promise<object>} User data and tokens
   */
  async register(userData) {
    const response = await this.client.post('/auth/register', userData, { skipAuth: true });

    if (response.success && response.data) {
      // Save tokens
      this.client.saveTokens(response.data.accessToken, response.data.refreshToken);
      return response.data;
    }

    throw new Error('Registration failed');
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<object>} User data and tokens
   */
  async login(email, password) {
    const response = await this.client.post('/auth/login', { email, password }, { skipAuth: true });

    if (response.success && response.data) {
      // Save tokens
      this.client.saveTokens(response.data.accessToken, response.data.refreshToken);
      return response.data;
    }

    throw new Error('Login failed');
  }

  /**
   * Logout user
   */
  async logout() {
    // Clear tokens locally
    this.client.clearTokens();

    // Optionally notify server (if implementing token blacklist)
    try {
      await this.client.post('/auth/logout');
    } catch (error) {
      // Ignore server errors during logout
      console.warn('Server logout failed:', error);
    }
  }

  /**
   * Get current user profile
   * @returns {Promise<object>} User profile with stats
   */
  async getProfile() {
    const response = await this.client.get('/auth/me');

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error('Failed to fetch profile');
  }

  /**
   * Update user profile
   * @param {object} updates - Profile updates
   * @param {string} [updates.name] - New name
   * @param {string} [updates.email] - New email
   * @returns {Promise<object>} Updated user data
   */
  async updateProfile(updates) {
    const response = await this.client.put('/auth/profile', updates);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error('Failed to update profile');
  }

  /**
   * Change password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   */
  async changePassword(currentPassword, newPassword) {
    const response = await this.client.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });

    if (response.success) {
      return true;
    }

    throw new Error(response.error || 'Failed to change password');
  }

  /**
   * Delete account
   * @param {string} password - User password for confirmation
   */
  async deleteAccount(password) {
    const response = await this.client.delete('/auth/account', {
      body: JSON.stringify({ password }),
    });

    if (response.success) {
      this.client.clearTokens();
      return true;
    }

    throw new Error('Failed to delete account');
  }

  /**
   * Check if user is logged in
   * @returns {boolean}
   */
  isLoggedIn() {
    return this.client.isAuthenticated();
  }
}

// Export
window.AuthAPI = AuthAPI;
window.authAPI = new AuthAPI(window.apiClient);
