/**
 * Bible API Module
 * Handles Bible verse/chapter fetching through backend proxy with caching
 */

class BibleAPI {
  constructor(client) {
    this.client = client;
  }

  /**
   * Get verse by reference
   * @param {string} reference - Verse reference (e.g., "John 3:16")
   * @param {string} [translation='KJV'] - Translation code
   * @returns {Promise<object>} Verse data
   */
  async getVerse(reference, translation = 'KJV') {
    const params = {
      ref: reference,
      translation: translation,
    };

    try {
      const response = await this.client.get('/bible/verse', params);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Verse not found');
    } catch (error) {
      // If backend fails, fallback to direct API call
      console.warn('Backend Bible API failed, using fallback:', error);
      return this.fetchVerseDirect(reference, translation);
    }
  }

  /**
   * Get full chapter
   * @param {string} book - Book name
   * @param {number} chapter - Chapter number
   * @param {string} [translation='KJV'] - Translation code
   * @returns {Promise<object>} Chapter data
   */
  async getChapter(book, chapter, translation = 'KJV') {
    const params = {
      book: book,
      chapter: chapter,
      translation: translation,
    };

    try {
      const response = await this.client.get('/bible/chapter', params);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Chapter not found');
    } catch (error) {
      // If backend fails, fallback to direct API call
      console.warn('Backend Bible API failed, using fallback:', error);
      return this.fetchChapterDirect(book, chapter, translation);
    }
  }

  /**
   * Get cache statistics (requires authentication)
   * @returns {Promise<object>} Cache stats
   */
  async getCacheStats() {
    try {
      const response = await this.client.get('/bible/cache/stats');

      if (response.success && response.data) {
        return response.data;
      }

      return null;
    } catch (error) {
      console.warn('Failed to fetch cache stats:', error);
      return null;
    }
  }

  /**
   * Get most popular cached verses (requires authentication)
   * @param {number} [limit=10] - Number of results
   * @returns {Promise<object[]>} Popular verses
   */
  async getPopularVerses(limit = 10) {
    try {
      const response = await this.client.get('/bible/cache/popular', { limit });

      if (response.success && response.data) {
        return response.data;
      }

      return [];
    } catch (error) {
      console.warn('Failed to fetch popular verses:', error);
      return [];
    }
  }

  /**
   * Clear old cache entries (requires authentication)
   * @param {number} [daysOld=30] - Days old threshold
   * @returns {Promise<number>} Number of entries cleared
   */
  async clearOldCache(daysOld = 30) {
    try {
      const response = await this.client.post('/bible/cache/clear', { daysOld });

      if (response.success && response.data) {
        return response.data.cleared;
      }

      return 0;
    } catch (error) {
      console.warn('Failed to clear cache:', error);
      return 0;
    }
  }

  /**
   * Fallback: Fetch verse directly from bible-api.com
   * @private
   */
  async fetchVerseDirect(reference, translation) {
    const query = reference.replace(/\s+/g, '+');
    const url = translation === 'WEB'
      ? `https://bible-api.com/${query}`
      : `https://bible-api.com/${query}?translation=${translation.toLowerCase()}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Verse not found');
    }

    const data = await response.json();

    return {
      reference: data.reference || reference,
      text: data.text,
      translation: data.translation_name || translation,
    };
  }

  /**
   * Fallback: Fetch chapter directly from API
   * @private
   */
  async fetchChapterDirect(book, chapter, translation) {
    // Use existing frontend logic from api.js
    if (window.selectBestAPI && window.parseAPIResponse) {
      const apiInfo = window.selectBestAPI(translation);
      const url = apiInfo.config.formatUrl(book, chapter, translation);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Chapter not found');
      }

      const data = await response.json();
      return window.parseAPIResponse(data, apiInfo.name, translation, book, chapter);
    }

    throw new Error('Bible API fallback not available');
  }
}

// Export
window.BibleAPI = BibleAPI;
window.bibleAPI = new BibleAPI(window.apiClient);
