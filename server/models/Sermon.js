/**
 * Sermon Model
 * Handles sermon database operations
 */

const { query } = require('../config/database');

class Sermon {
  /**
   * Create a new sermon
   */
  static async create(userId, sermonData) {
    const {
      title,
      speaker = 'Guest Speaker',
      date,
      series = 'General',
      notes = '',
      verseReference = '',
      verseData = null,
      tags = []
    } = sermonData;

    const result = await query(
      `INSERT INTO sermons (
        user_id, title, speaker, date, series, notes,
        verse_reference, verse_data, tags, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *`,
      [userId, title, speaker, date, series, notes, verseReference, JSON.stringify(verseData), tags]
    );

    return result.rows[0];
  }

  /**
   * Find all sermons for a user with pagination
   */
  static async findByUser(userId, { page = 1, limit = 20, sortBy = 'date', sortOrder = 'DESC' }) {
    const offset = (page - 1) * limit;

    // Validate sort parameters
    const allowedSortColumns = ['date', 'title', 'created_at', 'updated_at'];
    const sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'date';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const result = await query(
      `SELECT * FROM sermons
       WHERE user_id = $1
       ORDER BY ${sortColumn} ${order}
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) FROM sermons WHERE user_id = $1',
      [userId]
    );

    return {
      sermons: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
    };
  }

  /**
   * Find sermon by ID
   */
  static async findById(sermonId, userId) {
    const result = await query(
      'SELECT * FROM sermons WHERE id = $1 AND user_id = $2',
      [sermonId, userId]
    );

    return result.rows[0];
  }

  /**
   * Update a sermon
   */
  static async update(sermonId, userId, updates) {
    const allowedFields = [
      'title', 'speaker', 'date', 'series', 'notes',
      'verse_reference', 'verse_data', 'tags'
    ];

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        const dbKey = key === 'verseReference' ? 'verse_reference' :
                      key === 'verseData' ? 'verse_data' : key;

        updateFields.push(`${dbKey} = $${paramCount}`);

        // Handle JSON fields
        if (key === 'verseData') {
          values.push(JSON.stringify(updates[key]));
        } else {
          values.push(updates[key]);
        }

        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      return null;
    }

    updateFields.push(`updated_at = NOW()`);
    values.push(sermonId, userId);

    const result = await query(
      `UPDATE sermons
       SET ${updateFields.join(', ')}
       WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
       RETURNING *`,
      values
    );

    return result.rows[0];
  }

  /**
   * Delete a sermon
   */
  static async delete(sermonId, userId) {
    const result = await query(
      'DELETE FROM sermons WHERE id = $1 AND user_id = $2 RETURNING id',
      [sermonId, userId]
    );

    return result.rowCount > 0;
  }

  /**
   * Search sermons using full-text search
   */
  static async search(userId, searchQuery, { page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT *,
        ts_rank(
          to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(notes, '')),
          plainto_tsquery('english', $2)
        ) as rank
       FROM sermons
       WHERE user_id = $1
         AND (
           to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(notes, ''))
           @@ plainto_tsquery('english', $2)
         )
       ORDER BY rank DESC
       LIMIT $3 OFFSET $4`,
      [userId, searchQuery, limit, offset]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM sermons
       WHERE user_id = $1
         AND to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(notes, ''))
         @@ plainto_tsquery('english', $2)`,
      [userId, searchQuery]
    );

    return {
      sermons: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
    };
  }

  /**
   * Filter sermons by criteria
   */
  static async filter(userId, filters = {}, { page = 1, limit = 20 }) {
    const { speaker, series, tags, dateFrom, dateTo } = filters;

    const conditions = ['user_id = $1'];
    const values = [userId];
    let paramCount = 2;

    if (speaker) {
      conditions.push(`speaker = $${paramCount}`);
      values.push(speaker);
      paramCount++;
    }

    if (series) {
      conditions.push(`series = $${paramCount}`);
      values.push(series);
      paramCount++;
    }

    if (tags && tags.length > 0) {
      conditions.push(`tags && $${paramCount}`);
      values.push(tags);
      paramCount++;
    }

    if (dateFrom) {
      conditions.push(`date >= $${paramCount}`);
      values.push(dateFrom);
      paramCount++;
    }

    if (dateTo) {
      conditions.push(`date <= $${paramCount}`);
      values.push(dateTo);
      paramCount++;
    }

    const offset = (page - 1) * limit;
    values.push(limit, offset);

    const result = await query(
      `SELECT * FROM sermons
       WHERE ${conditions.join(' AND ')}
       ORDER BY date DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      values
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM sermons WHERE ${conditions.join(' AND ')}`,
      values.slice(0, -2) // Remove limit and offset
    );

    return {
      sermons: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
    };
  }

  /**
   * Get all unique speakers for a user
   */
  static async getSpeakers(userId) {
    const result = await query(
      `SELECT DISTINCT speaker FROM sermons
       WHERE user_id = $1 AND speaker IS NOT NULL
       ORDER BY speaker`,
      [userId]
    );

    return result.rows.map(row => row.speaker);
  }

  /**
   * Get all unique series for a user
   */
  static async getSeries(userId) {
    const result = await query(
      `SELECT DISTINCT series FROM sermons
       WHERE user_id = $1 AND series IS NOT NULL
       ORDER BY series`,
      [userId]
    );

    return result.rows.map(row => row.series);
  }

  /**
   * Get all tags used by a user with counts
   */
  static async getTags(userId) {
    const result = await query(
      `SELECT UNNEST(tags) as tag, COUNT(*) as count
       FROM sermons
       WHERE user_id = $1
       GROUP BY tag
       ORDER BY count DESC, tag`,
      [userId]
    );

    return result.rows;
  }

  /**
   * Bulk create sermons (for migration)
   */
  static async bulkCreate(userId, sermons) {
    const client = await require('../config/database').getClient();

    try {
      await client.query('BEGIN');

      const created = [];

      for (const sermon of sermons) {
        const result = await client.query(
          `INSERT INTO sermons (
            user_id, title, speaker, date, series, notes,
            verse_reference, verse_data, tags, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
          RETURNING *`,
          [
            userId,
            sermon.title,
            sermon.speaker || 'Guest Speaker',
            sermon.date,
            sermon.series || 'General',
            sermon.notes || '',
            sermon.verseReference || '',
            JSON.stringify(sermon.verseData || null),
            sermon.tags || []
          ]
        );

        created.push(result.rows[0]);
      }

      await client.query('COMMIT');
      return created;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = Sermon;
