/**
 * Bible Cache Model
 * Handles server-side Bible caching
 */

const { query } = require('../config/database');

class BibleCache {
  /**
   * Get cached Bible chapter
   */
  static async get(book, chapter, translation) {
    const result = await query(
      `SELECT data, created_at, last_accessed
       FROM bible_cache
       WHERE book = $1 AND chapter = $2 AND translation = $3`,
      [book, chapter, translation]
    );

    if (result.rows.length === 0) {
      return null;
    }

    // Update last accessed time and access count
    await query(
      `UPDATE bible_cache
       SET last_accessed = NOW(), access_count = access_count + 1
       WHERE book = $1 AND chapter = $2 AND translation = $3`,
      [book, chapter, translation]
    );

    return result.rows[0].data;
  }

  /**
   * Store Bible chapter in cache
   */
  static async set(book, chapter, translation, data) {
    await query(
      `INSERT INTO bible_cache (book, chapter, translation, data, created_at, last_accessed)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (book, chapter, translation)
       DO UPDATE SET data = $4, last_accessed = NOW(), access_count = bible_cache.access_count + 1`,
      [book, chapter, translation, JSON.stringify(data)]
    );
  }

  /**
   * Get cache statistics
   */
  static async getStats() {
    const result = await query(
      `SELECT
        COUNT(*) as total_entries,
        SUM(access_count) as total_accesses,
        AVG(access_count)::INTEGER as avg_accesses,
        MAX(last_accessed) as most_recent_access
       FROM bible_cache`
    );

    return result.rows[0];
  }

  /**
   * Clear old cache entries (older than 30 days)
   */
  static async clearOld(daysOld = 30) {
    // Validate input to prevent SQL injection
    const days = parseInt(daysOld, 10);
    if (isNaN(days) || days < 0 || days > 365) {
      throw new Error('Invalid daysOld parameter');
    }

    const result = await query(
      `DELETE FROM bible_cache
       WHERE created_at < NOW() - make_interval(days => $1)
       RETURNING id`,
      [days]
    );

    return result.rowCount;
  }

  /**
   * Get most popular cached chapters
   */
  static async getMostPopular(limit = 10) {
    const result = await query(
      `SELECT book, chapter, translation, access_count, last_accessed
       FROM bible_cache
       ORDER BY access_count DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows;
  }

  /**
   * Clear all cache
   */
  static async clearAll() {
    const result = await query('DELETE FROM bible_cache RETURNING id');
    return result.rowCount;
  }
}

module.exports = BibleCache;
