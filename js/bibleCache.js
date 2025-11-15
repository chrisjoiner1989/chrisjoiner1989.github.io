/**
 * Bible Chapter Cache Module
 * Caches Bible chapters in localStorage to reduce API calls and improve performance
 *
 * Features:
 * - Automatic caching of fetched chapters
 * - Cache expiration (30 days default)
 * - Storage quota management
 * - Cache statistics
 */

class BibleCache {
  constructor(options = {}) {
    this.CACHE_KEY = 'bibleChapterCache';
    this.CACHE_VERSION_KEY = 'bibleCacheVersion';
    this.CACHE_VERSION = '1.0';

    // Cache settings
    this.maxAge = options.maxAge || 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    this.maxCacheSize = options.maxCacheSize || 500; // Maximum number of chapters to cache

    // Initialize cache
    this.cache = this.loadCache();
    this.checkVersion();
    this.stats = {
      hits: 0,
      misses: 0,
      saves: 0
    };
  }

  /**
   * Load cache from localStorage
   */
  loadCache() {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (cached) {
        const parsedCache = JSON.parse(cached);
        console.log(`Bible cache loaded: ${Object.keys(parsedCache).length} chapters`);
        return parsedCache;
      }
    } catch (error) {
      console.warn('Failed to load Bible cache:', error);
      // Clear corrupted cache
      this.clearCache();
    }
    return {};
  }

  /**
   * Save cache to localStorage
   */
  saveCache() {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.cache));
      localStorage.setItem(this.CACHE_VERSION_KEY, this.CACHE_VERSION);
      return true;
    } catch (error) {
      console.error('Failed to save Bible cache:', error);

      // If quota exceeded, try to free up space
      if (error.name === 'QuotaExceededError') {
        console.log('Storage quota exceeded, cleaning old entries...');
        this.cleanOldEntries(0.5); // Remove 50% of old entries

        // Try saving again
        try {
          localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.cache));
          return true;
        } catch (retryError) {
          console.error('Failed to save cache after cleanup:', retryError);
          return false;
        }
      }

      return false;
    }
  }

  /**
   * Check cache version and clear if outdated
   */
  checkVersion() {
    const savedVersion = localStorage.getItem(this.CACHE_VERSION_KEY);
    if (savedVersion !== this.CACHE_VERSION) {
      console.log('Cache version mismatch, clearing cache');
      this.clearCache();
      localStorage.setItem(this.CACHE_VERSION_KEY, this.CACHE_VERSION);
    }
  }

  /**
   * Generate cache key for a chapter
   */
  generateKey(book, chapter, translation) {
    return `${book}|${chapter}|${translation}`.toLowerCase();
  }

  /**
   * Get chapter from cache
   */
  get(book, chapter, translation) {
    const key = this.generateKey(book, chapter, translation);
    const entry = this.cache[key];

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if entry is expired
    const now = Date.now();
    if (now - entry.timestamp > this.maxAge) {
      console.log(`Cache expired for ${key}`);
      delete this.cache[key];
      this.saveCache();
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    console.log(`Cache hit for ${key}`, `(${this.stats.hits} hits, ${this.stats.misses} misses)`);

    // Update access time for LRU tracking
    entry.lastAccessed = now;

    return entry.data;
  }

  /**
   * Save chapter to cache
   */
  set(book, chapter, translation, data) {
    const key = this.generateKey(book, chapter, translation);

    // Check cache size limit
    const currentSize = Object.keys(this.cache).length;
    if (currentSize >= this.maxCacheSize && !this.cache[key]) {
      // Remove least recently used entry
      this.removeLRU();
    }

    this.cache[key] = {
      data: data,
      timestamp: Date.now(),
      lastAccessed: Date.now()
    };

    this.stats.saves++;
    const saved = this.saveCache();

    if (saved) {
      console.log(`Cached ${key}`, `(${Object.keys(this.cache).length} total)`);
    }

    return saved;
  }

  /**
   * Remove least recently used entry
   */
  removeLRU() {
    let oldestKey = null;
    let oldestTime = Infinity;

    for (const [key, entry] of Object.entries(this.cache)) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      console.log(`Removing LRU entry: ${oldestKey}`);
      delete this.cache[oldestKey];
    }
  }

  /**
   * Clean old entries (for quota management)
   */
  cleanOldEntries(percentage = 0.3) {
    const entries = Object.entries(this.cache);
    const removeCount = Math.floor(entries.length * percentage);

    if (removeCount === 0) return;

    // Sort by last accessed time
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

    // Remove oldest entries
    const toRemove = entries.slice(0, removeCount);
    toRemove.forEach(([key]) => {
      delete this.cache[key];
    });

    console.log(`Removed ${removeCount} old cache entries`);
    this.saveCache();
  }

  /**
   * Clear entire cache
   */
  clearCache() {
    this.cache = {};
    localStorage.removeItem(this.CACHE_KEY);
    console.log('Bible cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(1)
      : 0;

    return {
      entries: Object.keys(this.cache).length,
      hits: this.stats.hits,
      misses: this.stats.misses,
      saves: this.stats.saves,
      hitRate: `${hitRate}%`,
      maxSize: this.maxCacheSize,
      maxAge: `${this.maxAge / (24 * 60 * 60 * 1000)} days`
    };
  }

  /**
   * Get cached chapters list (for debugging/management UI)
   */
  getCachedChapters() {
    return Object.keys(this.cache).map(key => {
      const [book, chapter, translation] = key.split('|');
      const entry = this.cache[key];
      const age = Math.floor((Date.now() - entry.timestamp) / (24 * 60 * 60 * 1000));

      return {
        book,
        chapter,
        translation,
        age: `${age} days ago`,
        lastAccessed: new Date(entry.lastAccessed).toLocaleDateString()
      };
    });
  }

  /**
   * Preload commonly accessed chapters (optional feature)
   */
  async preloadChapters(chapterList, loadFunction) {
    console.log(`Preloading ${chapterList.length} chapters...`);

    for (const {book, chapter, translation} of chapterList) {
      // Check if already cached
      if (this.get(book, chapter, translation)) {
        continue;
      }

      try {
        // Load chapter using provided function
        const data = await loadFunction(book, chapter, translation);
        if (data) {
          this.set(book, chapter, translation, data);
        }

        // Add small delay to avoid overwhelming API
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.warn(`Failed to preload ${book} ${chapter}:`, error);
      }
    }

    console.log('Preloading complete');
  }
}

// Create singleton instance
const bibleCache = new BibleCache({
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  maxCacheSize: 500 // 500 chapters max
});

// Make it globally available
window.bibleCache = bibleCache;

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BibleCache;
}
