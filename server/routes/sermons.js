/**
 * Sermon API Routes
 * CRUD operations for sermons
 */

const express = require('express');
const router = express.Router();
const Sermon = require('../models/Sermon');
const { authenticate } = require('../middleware/auth');
const {
  validateSermon,
  validateSermonUpdate,
  validatePagination
} = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * GET /api/v1/sermons
 * Get all sermons for authenticated user
 */
router.get('/', authenticate, validatePagination, asyncHandler(async (req, res) => {
  const { page, limit } = req.pagination;
  const { sortBy, sortOrder } = req.query;

  const result = await Sermon.findByUser(req.user.id, {
    page,
    limit,
    sortBy,
    sortOrder
  });

  res.json({
    success: true,
    data: result
  });
}));

/**
 * GET /api/v1/sermons/search
 * Search sermons
 */
router.get('/search', authenticate, validatePagination, asyncHandler(async (req, res) => {
  const { q } = req.query;
  const { page, limit } = req.pagination;

  if (!q) {
    return res.status(400).json({
      success: false,
      error: 'Search query required'
    });
  }

  const result = await Sermon.search(req.user.id, q, { page, limit });

  res.json({
    success: true,
    data: result
  });
}));

/**
 * GET /api/v1/sermons/filter
 * Filter sermons by criteria
 */
router.get('/filter', authenticate, validatePagination, asyncHandler(async (req, res) => {
  const { page, limit } = req.pagination;
  const { speaker, series, tags, dateFrom, dateTo } = req.query;

  // Parse tags if provided
  const parsedTags = tags ? tags.split(',').map(t => t.trim()) : undefined;

  const result = await Sermon.filter(
    req.user.id,
    { speaker, series, tags: parsedTags, dateFrom, dateTo },
    { page, limit }
  );

  res.json({
    success: true,
    data: result
  });
}));

/**
 * GET /api/v1/sermons/speakers
 * Get all unique speakers
 */
router.get('/speakers', authenticate, asyncHandler(async (req, res) => {
  const speakers = await Sermon.getSpeakers(req.user.id);

  res.json({
    success: true,
    data: speakers
  });
}));

/**
 * GET /api/v1/sermons/series
 * Get all unique series
 */
router.get('/series', authenticate, asyncHandler(async (req, res) => {
  const series = await Sermon.getSeries(req.user.id);

  res.json({
    success: true,
    data: series
  });
}));

/**
 * GET /api/v1/sermons/tags
 * Get all tags with usage counts
 */
router.get('/tags', authenticate, asyncHandler(async (req, res) => {
  const tags = await Sermon.getTags(req.user.id);

  res.json({
    success: true,
    data: tags
  });
}));

/**
 * GET /api/v1/sermons/:id
 * Get single sermon by ID
 */
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const sermonId = parseInt(req.params.id);

  if (isNaN(sermonId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid sermon ID'
    });
  }

  const sermon = await Sermon.findById(sermonId, req.user.id);

  if (!sermon) {
    return res.status(404).json({
      success: false,
      error: 'Sermon not found'
    });
  }

  res.json({
    success: true,
    data: sermon
  });
}));

/**
 * POST /api/v1/sermons
 * Create a new sermon
 */
router.post('/', authenticate, validateSermon, asyncHandler(async (req, res) => {
  const sermon = await Sermon.create(req.user.id, req.body);

  res.status(201).json({
    success: true,
    data: sermon
  });
}));

/**
 * POST /api/v1/sermons/bulk
 * Bulk create sermons (for migration)
 */
router.post('/bulk', authenticate, asyncHandler(async (req, res) => {
  const { sermons } = req.body;

  if (!Array.isArray(sermons)) {
    return res.status(400).json({
      success: false,
      error: 'Sermons must be an array'
    });
  }

  if (sermons.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No sermons provided'
    });
  }

  if (sermons.length > 100) {
    return res.status(400).json({
      success: false,
      error: 'Maximum 100 sermons per batch'
    });
  }

  // Validate each sermon
  const errors = [];
  sermons.forEach((sermon, index) => {
    if (!sermon.title) {
      errors.push(`Sermon ${index + 1}: Title is required`);
    }
    if (!sermon.date) {
      errors.push(`Sermon ${index + 1}: Date is required`);
    }
  });

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  const created = await Sermon.bulkCreate(req.user.id, sermons);

  res.status(201).json({
    success: true,
    data: {
      created: created.length,
      sermons: created
    }
  });
}));

/**
 * PUT /api/v1/sermons/:id
 * Update a sermon
 */
router.put('/:id', authenticate, validateSermonUpdate, asyncHandler(async (req, res) => {
  const sermonId = parseInt(req.params.id);

  if (isNaN(sermonId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid sermon ID'
    });
  }

  // Check if sermon exists and belongs to user
  const existing = await Sermon.findById(sermonId, req.user.id);
  if (!existing) {
    return res.status(404).json({
      success: false,
      error: 'Sermon not found'
    });
  }

  const updated = await Sermon.update(sermonId, req.user.id, req.body);

  res.json({
    success: true,
    data: updated
  });
}));

/**
 * PATCH /api/v1/sermons/:id
 * Partial update a sermon
 */
router.patch('/:id', authenticate, validateSermonUpdate, asyncHandler(async (req, res) => {
  const sermonId = parseInt(req.params.id);

  if (isNaN(sermonId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid sermon ID'
    });
  }

  const existing = await Sermon.findById(sermonId, req.user.id);
  if (!existing) {
    return res.status(404).json({
      success: false,
      error: 'Sermon not found'
    });
  }

  const updated = await Sermon.update(sermonId, req.user.id, req.body);

  res.json({
    success: true,
    data: updated
  });
}));

/**
 * DELETE /api/v1/sermons/:id
 * Delete a sermon
 */
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const sermonId = parseInt(req.params.id);

  if (isNaN(sermonId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid sermon ID'
    });
  }

  const deleted = await Sermon.delete(sermonId, req.user.id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: 'Sermon not found'
    });
  }

  res.json({
    success: true,
    message: 'Sermon deleted successfully'
  });
}));

/**
 * GET /api/v1/sermons/stats
 * Get sermon statistics
 */
router.get('/stats/overview', authenticate, asyncHandler(async (req, res) => {
  // This could be expanded to provide more detailed statistics
  const stats = await require('../models/User').getStats(req.user.id);

  res.json({
    success: true,
    data: stats
  });
}));

module.exports = router;
