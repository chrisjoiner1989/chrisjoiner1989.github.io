/**
 * Sermons API Module
 * Handles sermon CRUD operations and queries
 */

class SermonsAPI {
  constructor(client) {
    this.client = client;
  }

  /**
   * Get all sermons with pagination
   * @param {object} options - Query options
   * @param {number} [options.page=1] - Page number
   * @param {number} [options.limit=20] - Items per page
   * @param {string} [options.sortBy='date'] - Sort field
   * @param {string} [options.sortOrder='DESC'] - Sort order
   * @returns {Promise<object>} Sermons list with pagination
   */
  async getAll(options = {}) {
    const params = {
      page: options.page || 1,
      limit: options.limit || 20,
      sortBy: options.sortBy || 'date',
      sortOrder: options.sortOrder || 'DESC',
    };

    const response = await this.client.get('/sermons', params);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error('Failed to fetch sermons');
  }

  /**
   * Get single sermon by ID
   * @param {number} id - Sermon ID
   * @returns {Promise<object>} Sermon data
   */
  async getById(id) {
    const response = await this.client.get(`/sermons/${id}`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error('Sermon not found');
  }

  /**
   * Create new sermon
   * @param {object} sermonData - Sermon data
   * @returns {Promise<object>} Created sermon
   */
  async create(sermonData) {
    const response = await this.client.post('/sermons', sermonData);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error('Failed to create sermon');
  }

  /**
   * Update sermon
   * @param {number} id - Sermon ID
   * @param {object} updates - Sermon updates
   * @returns {Promise<object>} Updated sermon
   */
  async update(id, updates) {
    const response = await this.client.put(`/sermons/${id}`, updates);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error('Failed to update sermon');
  }

  /**
   * Partially update sermon
   * @param {number} id - Sermon ID
   * @param {object} updates - Partial updates
   * @returns {Promise<object>} Updated sermon
   */
  async patch(id, updates) {
    const response = await this.client.patch(`/sermons/${id}`, updates);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error('Failed to update sermon');
  }

  /**
   * Delete sermon
   * @param {number} id - Sermon ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    const response = await this.client.delete(`/sermons/${id}`);

    if (response.success) {
      return true;
    }

    throw new Error('Failed to delete sermon');
  }

  /**
   * Search sermons
   * @param {string} query - Search query
   * @param {object} options - Pagination options
   * @returns {Promise<object>} Search results with pagination
   */
  async search(query, options = {}) {
    const params = {
      q: query,
      page: options.page || 1,
      limit: options.limit || 20,
    };

    const response = await this.client.get('/sermons/search', params);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error('Search failed');
  }

  /**
   * Filter sermons by criteria
   * @param {object} filters - Filter criteria
   * @param {string} [filters.speaker] - Filter by speaker
   * @param {string} [filters.series] - Filter by series
   * @param {string[]} [filters.tags] - Filter by tags
   * @param {string} [filters.dateFrom] - Filter from date
   * @param {string} [filters.dateTo] - Filter to date
   * @param {object} options - Pagination options
   * @returns {Promise<object>} Filtered sermons with pagination
   */
  async filter(filters, options = {}) {
    const params = {
      ...filters,
      page: options.page || 1,
      limit: options.limit || 20,
    };

    const response = await this.client.get('/sermons/filter', params);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error('Filter failed');
  }

  /**
   * Get all unique speakers
   * @returns {Promise<string[]>} List of speakers
   */
  async getSpeakers() {
    const response = await this.client.get('/sermons/speakers');

    if (response.success && response.data) {
      return response.data;
    }

    return [];
  }

  /**
   * Get all unique series
   * @returns {Promise<string[]>} List of series
   */
  async getSeries() {
    const response = await this.client.get('/sermons/series');

    if (response.success && response.data) {
      return response.data;
    }

    return [];
  }

  /**
   * Get all tags with counts
   * @returns {Promise<object[]>} List of tags with counts
   */
  async getTags() {
    const response = await this.client.get('/sermons/tags');

    if (response.success && response.data) {
      return response.data;
    }

    return [];
  }

  /**
   * Bulk import sermons (for migration)
   * @param {object[]} sermons - Array of sermon objects
   * @returns {Promise<object[]>} Created sermons
   */
  async bulkImport(sermons) {
    // Split into batches of 100 (API limit)
    const batchSize = 100;
    const batches = [];

    for (let i = 0; i < sermons.length; i += batchSize) {
      batches.push(sermons.slice(i, i + batchSize));
    }

    const results = [];

    for (const batch of batches) {
      const response = await this.client.post('/sermons/bulk', { sermons: batch });

      if (response.success && response.data) {
        results.push(...response.data);
      } else {
        throw new Error(`Bulk import failed at batch ${batches.indexOf(batch) + 1}`);
      }
    }

    return results;
  }
}

// Export
window.SermonsAPI = SermonsAPI;
window.sermonsAPI = new SermonsAPI(window.apiClient);
