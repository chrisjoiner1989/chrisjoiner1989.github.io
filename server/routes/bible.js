/**
 * Bible API Routes
 * Proxy for Bible APIs with server-side caching
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const BibleCache = require('../models/BibleCache');
const { optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Parse Bible reference
 */
function parseReference(ref) {
  // Example: "John 3:16" or "Matthew 5:1-10"
  const match = ref.match(/^(\d?\s?[A-Za-z]+)\s+(\d+):?(\d+)?-?(\d+)?$/);

  if (!match) {
    return null;
  }

  return {
    book: match[1].trim(),
    chapter: parseInt(match[2]),
    verseStart: match[3] ? parseInt(match[3]) : null,
    verseEnd: match[4] ? parseInt(match[4]) : null
  };
}

/**
 * Fetch from bible-api.com
 */
async function fetchFromBibleAPI(reference, translation = 'web') {
  try {
    const url = `https://bible-api.com/${encodeURIComponent(reference)}?translation=${translation}`;
    const response = await axios.get(url, { timeout: 5000 });

    return {
      reference: response.data.reference,
      text: response.data.text,
      translation: response.data.translation_name || translation.toUpperCase(),
      verses: response.data.verses
    };
  } catch (error) {
    console.error('Bible API error:', error.message);
    return null;
  }
}

/**
 * Fetch from bolls.life
 */
async function fetchFromBolls(book, chapter, translation = 'NKJV') {
  try {
    // Map book names to IDs (simplified)
    const bookMap = {
      'Genesis': 1, 'Exodus': 2, 'Leviticus': 3, 'Numbers': 4, 'Deuteronomy': 5,
      'Joshua': 6, 'Judges': 7, 'Ruth': 8, '1 Samuel': 9, '2 Samuel': 10,
      '1 Kings': 11, '2 Kings': 12, '1 Chronicles': 13, '2 Chronicles': 14,
      'Ezra': 15, 'Nehemiah': 16, 'Esther': 17, 'Job': 18, 'Psalms': 19,
      'Proverbs': 20, 'Ecclesiastes': 21, 'Song of Solomon': 22, 'Isaiah': 23,
      'Jeremiah': 24, 'Lamentations': 25, 'Ezekiel': 26, 'Daniel': 27,
      'Hosea': 28, 'Joel': 29, 'Amos': 30, 'Obadiah': 31, 'Jonah': 32,
      'Micah': 33, 'Nahum': 34, 'Habakkuk': 35, 'Zephaniah': 36, 'Haggai': 37,
      'Zechariah': 38, 'Malachi': 39, 'Matthew': 40, 'Mark': 41, 'Luke': 42,
      'John': 43, 'Acts': 44, 'Romans': 45, '1 Corinthians': 46, '2 Corinthians': 47,
      'Galatians': 48, 'Ephesians': 49, 'Philippians': 50, 'Colossians': 51,
      '1 Thessalonians': 52, '2 Thessalonians': 53, '1 Timothy': 54, '2 Timothy': 55,
      'Titus': 56, 'Philemon': 57, 'Hebrews': 58, 'James': 59, '1 Peter': 60,
      '2 Peter': 61, '1 John': 62, '2 John': 63, '3 John': 64, 'Jude': 65,
      'Revelation': 66
    };

    const bookId = bookMap[book];
    if (!bookId) {
      return null;
    }

    const url = `https://bolls.life/get-text/${translation}/${bookId}/${chapter}/`;
    const response = await axios.get(url, { timeout: 5000 });

    if (!Array.isArray(response.data)) {
      return null;
    }

    const text = response.data.map(v => v.text).join(' ');

    return {
      reference: `${book} ${chapter}`,
      text,
      translation,
      verses: response.data
    };
  } catch (error) {
    console.error('Bolls API error:', error.message);
    return null;
  }
}

/**
 * GET /api/v1/bible/verse
 * Fetch a Bible verse
 */
router.get('/verse', optionalAuth, asyncHandler(async (req, res) => {
  const { ref, translation = 'web' } = req.query;

  if (!ref) {
    return res.status(400).json({
      success: false,
      error: 'Verse reference required'
    });
  }

  const parsed = parseReference(ref);
  if (!parsed) {
    return res.status(400).json({
      success: false,
      error: 'Invalid verse reference format'
    });
  }

  // Try to get from cache
  let data = await BibleCache.get(parsed.book, parsed.chapter, translation.toUpperCase());

  if (!data) {
    // Fetch from API
    if (['web', 'kjv', 'asv', 'bbe'].includes(translation.toLowerCase())) {
      data = await fetchFromBibleAPI(ref, translation);
    } else if (['nkjv', 'esv', 'nlt'].includes(translation.toUpperCase())) {
      data = await fetchFromBolls(parsed.book, parsed.chapter, translation.toUpperCase());
    }

    if (!data) {
      return res.status(502).json({
        success: false,
        error: 'Failed to fetch verse from Bible API'
      });
    }

    // Cache the result
    await BibleCache.set(parsed.book, parsed.chapter, translation.toUpperCase(), data);
  }

  res.json({
    success: true,
    data
  });
}));

/**
 * GET /api/v1/bible/chapter
 * Fetch a Bible chapter
 */
router.get('/chapter', optionalAuth, asyncHandler(async (req, res) => {
  const { book, chapter, translation = 'web' } = req.query;

  if (!book || !chapter) {
    return res.status(400).json({
      success: false,
      error: 'Book and chapter required'
    });
  }

  const chapterNum = parseInt(chapter);
  if (isNaN(chapterNum)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid chapter number'
    });
  }

  // Try to get from cache
  let data = await BibleCache.get(book, chapterNum, translation.toUpperCase());

  if (!data) {
    // Fetch from API
    const reference = `${book} ${chapter}`;

    if (['web', 'kjv', 'asv', 'bbe'].includes(translation.toLowerCase())) {
      data = await fetchFromBibleAPI(reference, translation);
    } else if (['nkjv', 'esv', 'nlt'].includes(translation.toUpperCase())) {
      data = await fetchFromBolls(book, chapterNum, translation.toUpperCase());
    }

    if (!data) {
      return res.status(502).json({
        success: false,
        error: 'Failed to fetch chapter from Bible API'
      });
    }

    // Cache the result
    await BibleCache.set(book, chapterNum, translation.toUpperCase(), data);
  }

  res.json({
    success: true,
    data
  });
}));

/**
 * GET /api/v1/bible/cache/stats
 * Get Bible cache statistics
 */
router.get('/cache/stats', asyncHandler(async (req, res) => {
  const stats = await BibleCache.getStats();

  res.json({
    success: true,
    data: stats
  });
}));

/**
 * GET /api/v1/bible/cache/popular
 * Get most popular cached chapters
 */
router.get('/cache/popular', asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const popular = await BibleCache.getMostPopular(limit);

  res.json({
    success: true,
    data: popular
  });
}));

/**
 * POST /api/v1/bible/cache/clear
 * Clear old cache entries
 */
router.post('/cache/clear', asyncHandler(async (req, res) => {
  const daysOld = parseInt(req.query.days) || 30;
  const cleared = await BibleCache.clearOld(daysOld);

  res.json({
    success: true,
    message: `Cleared ${cleared} old cache entries`
  });
}));

module.exports = router;
