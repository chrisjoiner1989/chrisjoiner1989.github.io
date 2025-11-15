/**
 * API Client for Mount Builder Backend
 * Handles all HTTP requests to the backend API with authentication
 */

class APIClient {
  constructor() {
    // Use environment variable or default to localhost for development
    this.baseURL = window.API_BASE_URL || 'http://localhost:3000/api/v1';
    this.accessToken = null;
    this.refreshToken = null;

    // Load tokens from localStorage on initialization
    this.loadTokens();
  }

  /**
   * Load tokens from localStorage
   */
  loadTokens() {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  /**
   * Save tokens to localStorage
   */
  saveTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;

    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  /**
   * Clear tokens from memory and localStorage
   */
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.accessToken;
  }

  /**
   * Make HTTP request to API
   * @param {string} endpoint - API endpoint (e.g., '/sermons')
   * @param {object} options - Fetch options
   * @returns {Promise<object>} Response data
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authentication header if token exists
    if (this.accessToken && !options.skipAuth) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && this.refreshToken && !options.isRetry) {
        const refreshed = await this.refreshAccessToken();

        if (refreshed) {
          // Retry the original request with new token
          return this.request(endpoint, { ...options, isRetry: true });
        } else {
          // Refresh failed - clear tokens and throw error
          this.clearTokens();
          throw new APIError('Session expired. Please login again.', 401);
        }
      }

      // Parse response
      const data = await response.json();

      // Handle non-2xx responses
      if (!response.ok) {
        throw new APIError(
          data.error || data.message || 'Request failed',
          response.status,
          data.errors || []
        );
      }

      return data;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }

      // Network or other errors
      throw new APIError(
        error.message || 'Network error occurred',
        0,
        []
      );
    }
  }

  /**
   * Refresh access token using refresh token
   * @returns {Promise<boolean>} Success status
   */
  async refreshAccessToken() {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const data = await this.request('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: this.refreshToken }),
        skipAuth: true,
      });

      if (data.success && data.data.accessToken) {
        this.saveTokens(data.data.accessToken, this.refreshToken);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  /**
   * GET request
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    return this.request(url, {
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post(endpoint, body = {}, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options,
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  /**
   * PATCH request
   */
  async patch(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  /**
   * Check API health
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api/v1', '')}/api/health`);
      return await response.json();
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}

/**
 * Custom API Error class
 */
class APIError extends Error {
  constructor(message, statusCode = 0, errors = []) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.errors = errors;
  }

  /**
   * Check if error is due to network issues
   */
  isNetworkError() {
    return this.statusCode === 0;
  }

  /**
   * Check if error is authentication related
   */
  isAuthError() {
    return this.statusCode === 401 || this.statusCode === 403;
  }

  /**
   * Check if error is validation related
   */
  isValidationError() {
    return this.statusCode === 400 && this.errors.length > 0;
  }
}

// Export as global singleton
window.APIClient = APIClient;
window.APIError = APIError;
window.apiClient = new APIClient();
