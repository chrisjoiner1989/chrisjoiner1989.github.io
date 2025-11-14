/* ========================================
   Jesus's Words - Red Letter Edition
   Comprehensive verse mappings for all books
   where Jesus speaks
   ======================================== */

/**
 * JESUS_WORDS dataset contains verse references where Jesus speaks
 * Structure: { "BookName": { "chapter": [verses] or { start: X, end: Y } } }
 *
 * Sources: Cross-referenced from multiple red-letter Bible editions
 * Coverage: Matthew, Mark, Luke, John, Acts, Revelation
 */

const JESUS_WORDS = {
  // ========== MATTHEW ==========
  "Matthew": {
    "3": [15, 17],
    "4": [4, 7, 10, 17, 19],
    "5": { start: 3, end: 48 },  // Sermon on the Mount
    "6": { start: 1, end: 34 },  // Sermon on the Mount continued
    "7": { start: 1, end: 29 },  // Sermon on the Mount continued
    "8": [3, 4, 7, 10, 11, 13, 20, 22, 26, 32],
    "9": [2, 4, 5, 6, 9, 12, 13, 15, 22, 24, 28, 29, 30, 37, 38],
    "10": { start: 5, end: 42 },  // Sending out the Twelve
    "11": [4, 5, 6, 7, 9, 11, 21, 22, 23, 24, 25, 26, 27, 28, 29],
    "12": [3, 4, 5, 6, 7, 11, 12, 13, 25, 27, 28, 31, 32, 34, 36, 37, 39, 43, 44, 45, 48, 49, 50],
    "13": [11, 12, 13, 16, 17, 18, 28, 29, 30, 31, 32, 33, 34, 37, 38, 39, 40, 41, 43, 44, 45, 46, 51, 52, 57, 58],
    "14": [16, 18, 27, 29, 31],
    "15": [3, 4, 7, 10, 11, 13, 14, 16, 17, 18, 24, 26, 28, 32, 34],
    "16": [2, 3, 4, 6, 8, 11, 15, 17, 18, 23, 24, 25, 26, 27, 28],
    "17": [7, 9, 11, 12, 17, 20, 22, 25, 26, 27],
    "18": [3, 4, 7, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 32, 33, 34, 35],
    "19": [4, 5, 6, 8, 9, 11, 12, 14, 17, 18, 19, 21, 23, 24, 26, 28, 29],
    "20": [4, 7, 13, 14, 16, 18, 19, 21, 22, 23, 25, 26, 27, 28, 32, 34],
    "21": [2, 3, 13, 16, 19, 21, 22, 24, 27, 28, 29, 31, 32, 42, 43, 44],
    "22": [4, 8, 12, 14, 16, 18, 20, 21, 29, 31, 32, 37, 39, 40, 42, 43, 44],
    "23": { start: 2, end: 39 },  // Woes to scribes and Pharisees
    "24": { start: 2, end: 51 },  // Olivet Discourse
    "25": { start: 1, end: 46 },  // Olivet Discourse continued
    "26": [2, 10, 11, 13, 18, 21, 23, 25, 26, 27, 29, 31, 32, 34, 36, 38, 39, 40, 41, 45, 46, 50, 52, 53, 55, 64],
    "27": [11, 43],
    "28": [6, 7, 9, 10, 18, 19, 20]
  },

  // ========== MARK ==========
  "Mark": {
    "1": [8, 11, 15, 17, 25, 38, 39, 41, 44],
    "2": [5, 8, 9, 10, 11, 14, 17, 19, 20, 25, 27, 28],
    "3": [3, 4, 5, 23, 24, 25, 27, 28, 29, 33, 34, 35],
    "4": [2, 3, 4, 9, 11, 12, 13, 21, 22, 24, 26, 30, 31, 32, 35, 39, 40],
    "5": [8, 9, 19, 30, 34, 36, 39, 41],
    "6": [4, 10, 11, 31, 37, 38, 50],
    "7": [6, 7, 8, 9, 14, 15, 18, 19, 20, 27, 29, 34],
    "8": [2, 3, 5, 6, 12, 15, 17, 19, 21, 27, 29, 33, 34, 35, 36, 38],
    "9": [1, 12, 16, 19, 23, 25, 29, 35, 37, 39, 41, 42, 43, 47, 50],
    "10": [3, 5, 6, 7, 9, 11, 12, 14, 15, 18, 19, 21, 23, 24, 25, 27, 29, 30, 31, 33, 34, 36, 38, 39, 42, 43, 44, 45, 49, 51, 52],
    "11": [2, 3, 14, 17, 22, 23, 24, 25, 29, 30, 33],
    "12": [9, 11, 15, 16, 17, 24, 25, 26, 27, 29, 30, 31, 34, 35, 36, 37, 38, 39, 40, 41, 43, 44],
    "13": { start: 2, end: 37 },  // Olivet Discourse
    "14": [6, 7, 8, 9, 13, 14, 18, 20, 22, 24, 25, 27, 28, 30, 32, 34, 36, 37, 38, 41, 42, 48, 49, 62],
    "15": [2, 34],
    "16": [6, 7, 15, 16, 17, 18]
  },

  // ========== LUKE ==========
  "Luke": {
    "3": [16, 22],
    "4": [4, 8, 12, 18, 19, 21, 23, 24, 25, 26, 27, 35, 43],
    "5": [4, 5, 8, 10, 13, 14, 20, 22, 23, 24, 27, 31, 32, 34, 35, 36, 37, 38, 39],
    "6": [3, 4, 5, 8, 9, 10, 20, 21, 22, 24, 25, 26, 27, 31, 32, 35, 36, 37, 39, 41, 42, 43, 44, 45, 46, 47, 48, 49],
    "7": [9, 13, 14, 22, 24, 26, 28, 31, 32, 33, 34, 40, 43, 44, 45, 46, 47, 48, 50],
    "8": [10, 11, 12, 16, 17, 18, 21, 25, 30, 39, 45, 46, 48, 50, 52, 54],
    "9": [3, 5, 13, 14, 18, 20, 22, 23, 25, 26, 27, 33, 38, 41, 42, 43, 44, 48, 50, 56, 58, 60, 62],
    "10": [2, 3, 5, 9, 10, 11, 12, 16, 18, 19, 20, 21, 22, 23, 24, 25, 26, 28, 37, 41, 42],
    "11": { start: 2, end: 52 },
    "12": { start: 1, end: 59 },
    "13": { start: 2, end: 35 },
    "14": { start: 3, end: 35 },
    "15": { start: 4, end: 32 },
    "16": { start: 1, end: 31 },
    "17": { start: 1, end: 37 },
    "18": { start: 8, end: 43 },
    "19": { start: 5, end: 46 },
    "20": { start: 3, end: 44 },
    "21": { start: 3, end: 36 },
    "22": { start: 8, end: 71 },
    "23": [3, 28, 34, 40, 43, 46],
    "24": [17, 19, 25, 26, 27, 32, 36, 38, 39, 41, 44, 45, 46, 47, 49]
  },

  // ========== JOHN ==========
  "John": {
    "1": [38, 39, 42, 43, 47, 48, 50, 51],
    "2": [4, 7, 8, 16, 19],
    "3": [3, 5, 7, 10, 11, 12, 16, 17, 18, 19, 20, 21],
    "4": [7, 10, 13, 14, 16, 17, 18, 21, 23, 24, 26, 32, 34, 35, 48, 50],
    "5": { start: 6, end: 47 },
    "6": { start: 5, end: 71 },
    "7": { start: 6, end: 53 },
    "8": { start: 7, end: 58 },
    "9": [3, 4, 5, 7, 11, 35, 37, 39, 41],
    "10": { start: 1, end: 38 },
    "11": [4, 7, 9, 11, 14, 15, 23, 25, 26, 34, 39, 40, 41, 43, 44],
    "12": { start: 7, end: 50 },
    "13": { start: 7, end: 38 },
    "14": { start: 1, end: 31 },
    "15": { start: 1, end: 27 },
    "16": { start: 1, end: 33 },
    "17": { start: 1, end: 26 },  // High Priestly Prayer
    "18": [4, 5, 6, 7, 8, 11, 20, 21, 23, 34, 36, 37],
    "19": [11, 26, 27, 28, 30],
    "20": [15, 16, 17, 19, 21, 22, 23, 26, 27, 29],
    "21": [5, 6, 10, 12, 15, 16, 17, 18, 19, 22, 23]
  },

  // ========== ACTS ==========
  "Acts": {
    "1": [4, 5, 7, 8],
    "7": [56],
    "9": [4, 5, 6, 10, 11, 15, 16],
    "10": [13, 14, 15, 19, 20],
    "18": [9, 10],
    "20": [35],
    "22": [7, 8, 10, 18, 19, 20, 21],
    "23": [11],
    "26": [14, 15, 16, 17, 18]
  },

  // ========== REVELATION ==========
  "Revelation": {
    "1": [8, 11, 17, 18, 19, 20],
    "2": { start: 1, end: 29 },  // Messages to churches
    "3": { start: 1, end: 22 },  // Messages to churches
    "16": [15],
    "21": [5, 6, 7, 8],
    "22": [7, 9, 10, 12, 13, 16, 20]
  }
};

/**
 * Check if a specific verse contains Jesus's words
 * @param {string} book - Book name (e.g., "Matthew", "John")
 * @param {number} chapter - Chapter number
 * @param {number} verse - Verse number
 * @returns {boolean} - True if verse contains Jesus's words
 */
function isJesusWords(book, chapter, verse) {
  // Normalize book name (handle variations)
  const normalizedBook = normalizeBookName(book);

  const bookData = JESUS_WORDS[normalizedBook];
  if (!bookData) return false;

  const chapterData = bookData[String(chapter)];
  if (!chapterData) return false;

  // Handle array format [1, 2, 3, ...]
  if (Array.isArray(chapterData)) {
    return chapterData.includes(verse);
  }

  // Handle range format { start: 1, end: 10 }
  if (chapterData.start !== undefined && chapterData.end !== undefined) {
    return verse >= chapterData.start && verse <= chapterData.end;
  }

  return false;
}

/**
 * Normalize book name to handle variations
 * @param {string} book - Book name
 * @returns {string} - Normalized book name
 */
function normalizeBookName(book) {
  // Remove extra whitespace
  book = book.trim();

  // Handle common variations
  const variations = {
    "Matt": "Matthew",
    "Mt": "Matthew",
    "Mk": "Mark",
    "Lk": "Luke",
    "Jn": "John",
    "Jhn": "John",
    "Rev": "Revelation",
    "Revelations": "Revelation"
  };

  return variations[book] || book;
}

/**
 * Get all verses with Jesus's words for a chapter
 * @param {string} book - Book name
 * @param {number} chapter - Chapter number
 * @returns {Array<number>|null} - Array of verse numbers or null
 */
function getJesusVersesInChapter(book, chapter) {
  const normalizedBook = normalizeBookName(book);
  const bookData = JESUS_WORDS[normalizedBook];

  if (!bookData) return null;

  const chapterData = bookData[String(chapter)];
  if (!chapterData) return null;

  // Handle array format
  if (Array.isArray(chapterData)) {
    return chapterData;
  }

  // Handle range format - expand to array
  if (chapterData.start !== undefined && chapterData.end !== undefined) {
    const verses = [];
    for (let v = chapterData.start; v <= chapterData.end; v++) {
      verses.push(v);
    }
    return verses;
  }

  return null;
}

// Make functions available globally
if (typeof window !== 'undefined') {
  window.isJesusWords = isJesusWords;
  window.getJesusVersesInChapter = getJesusVersesInChapter;
  window.JESUS_WORDS = JESUS_WORDS;
}
