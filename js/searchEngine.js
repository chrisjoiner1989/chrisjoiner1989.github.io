/**
 * Search Engine Module
 * Provides full-text search with fuzzy matching for sermon library
 *
 * Features:
 * - Full-text search across all sermon fields
 * - Fuzzy matching for typo tolerance
 * - Relevance scoring
 * - Search result highlighting
 */

class SearchEngine {
  constructor() {
    this.searchHistory = this.loadSearchHistory();
    this.maxHistorySize = 10;
  }

  /**
   * Calculate Levenshtein distance for fuzzy matching
   * Returns the minimum number of edits needed to transform one string into another
   */
  levenshteinDistance(str1, str2) {
    str1 = str1.toLowerCase();
    str2 = str2.toLowerCase();

    const matrix = [];

    // Initialize matrix
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Check if two strings match with fuzzy tolerance
   * Allows for typos based on string length
   */
  fuzzyMatch(searchTerm, target, threshold = 0.8) {
    searchTerm = searchTerm.toLowerCase();
    target = target.toLowerCase();

    // Exact match
    if (target.includes(searchTerm)) {
      return true;
    }

    // For short strings, require exact match
    if (searchTerm.length < 3) {
      return false;
    }

    // Calculate allowed distance based on search term length
    const maxDistance = Math.floor(searchTerm.length * (1 - threshold));

    // Split target into words and check each
    const words = target.split(/\s+/);

    for (const word of words) {
      if (word.length < searchTerm.length - 2) continue;

      const distance = this.levenshteinDistance(searchTerm, word);
      if (distance <= maxDistance) {
        return true;
      }

      // Also check if search term is a substring with small distance
      for (let i = 0; i <= word.length - searchTerm.length; i++) {
        const substring = word.substring(i, i + searchTerm.length);
        const substringDistance = this.levenshteinDistance(searchTerm, substring);
        if (substringDistance <= maxDistance) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Calculate relevance score for a sermon based on search query
   * Higher score = more relevant
   */
  calculateRelevance(sermon, searchTerms) {
    let score = 0;
    const searchableText = {
      title: { text: sermon.title || '', weight: 10 },
      speaker: { text: sermon.speaker || '', weight: 5 },
      series: { text: sermon.series || '', weight: 7 },
      verseReference: { text: sermon.verseReference || '', weight: 8 },
      notes: { text: sermon.notes || '', weight: 3 }
    };

    searchTerms.forEach(term => {
      term = term.toLowerCase();

      Object.entries(searchableText).forEach(([field, data]) => {
        const text = data.text.toLowerCase();

        // Exact phrase match (highest score)
        if (text.includes(term)) {
          const occurrences = (text.match(new RegExp(term, 'gi')) || []).length;
          score += occurrences * data.weight * 2;
        }
        // Fuzzy match (lower score)
        else if (this.fuzzyMatch(term, text, 0.8)) {
          score += data.weight;
        }

        // Bonus for match at start of field
        if (text.startsWith(term)) {
          score += data.weight;
        }
      });
    });

    return score;
  }

  /**
   * Perform full-text search across all sermons
   * @param {Array} sermons - Array of sermon objects
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Array} - Filtered and sorted sermon results with relevance scores
   */
  search(sermons, query, options = {}) {
    const {
      fuzzy = true,              // Enable fuzzy matching
      minRelevance = 0,          // Minimum relevance score
      fields = null,             // Specific fields to search (null = all)
      caseSensitive = false      // Case-sensitive search
    } = options;

    // Handle empty query
    if (!query || query.trim() === '') {
      return sermons.map(sermon => ({
        sermon,
        relevance: 0,
        matches: []
      }));
    }

    // Split query into individual search terms
    const searchTerms = query
      .trim()
      .split(/\s+/)
      .filter(term => term.length > 0);

    // Save to search history
    this.saveToHistory(query);

    // Search and score each sermon
    const results = sermons
      .map(sermon => {
        const relevance = this.calculateRelevance(sermon, searchTerms);
        const matches = this.findMatches(sermon, searchTerms, fuzzy);

        return {
          sermon,
          relevance,
          matches
        };
      })
      .filter(result => result.relevance > minRelevance)
      .sort((a, b) => b.relevance - a.relevance);

    console.log(`Search for "${query}" found ${results.length} results`);

    return results;
  }

  /**
   * Find specific matching fields for highlighting
   */
  findMatches(sermon, searchTerms, fuzzy = true) {
    const matches = [];
    const searchableFields = ['title', 'speaker', 'series', 'verseReference', 'notes'];

    searchableFields.forEach(field => {
      const text = sermon[field] || '';

      searchTerms.forEach(term => {
        if (text.toLowerCase().includes(term.toLowerCase())) {
          matches.push({
            field,
            term,
            type: 'exact'
          });
        } else if (fuzzy && this.fuzzyMatch(term, text, 0.8)) {
          matches.push({
            field,
            term,
            type: 'fuzzy'
          });
        }
      });
    });

    return matches;
  }

  /**
   * Highlight search terms in text
   * @param {string} text - Original text
   * @param {string} query - Search query
   * @returns {string} - HTML with highlighted matches
   */
  highlight(text, query) {
    if (!text || !query) return text;

    const terms = query.trim().split(/\s+/);
    let result = text;

    terms.forEach(term => {
      // Escape special regex characters
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedTerm})`, 'gi');
      result = result.replace(regex, '<mark class="search-highlight">$1</mark>');
    });

    return result;
  }

  /**
   * Advanced search with multiple filters
   */
  advancedSearch(sermons, filters) {
    const {
      query = '',
      speaker = '',
      series = '',
      dateRange = null,
      hasVerse = null,
      sortBy = 'relevance'
    } = filters;

    let results = sermons;

    // Apply filters
    if (speaker) {
      results = results.filter(s => s.speaker === speaker);
    }

    if (series) {
      results = results.filter(s => s.series === series);
    }

    if (dateRange) {
      results = results.filter(s => {
        const date = new Date(s.date);
        return date >= dateRange.start && date <= dateRange.end;
      });
    }

    if (hasVerse !== null) {
      results = results.filter(s => hasVerse ? s.verseReference : !s.verseReference);
    }

    // Perform text search
    if (query) {
      const searchResults = this.search(results, query);
      return searchResults.map(r => r.sermon);
    }

    // Sort results
    switch (sortBy) {
      case 'date-desc':
        results.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'date-asc':
        results.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'title':
        results.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        // relevance - already sorted
        break;
    }

    return results;
  }

  /**
   * Save search query to history
   */
  saveToHistory(query) {
    const trimmed = query.trim();
    if (!trimmed) return;

    // Remove if already exists
    this.searchHistory = this.searchHistory.filter(q => q !== trimmed);

    // Add to beginning
    this.searchHistory.unshift(trimmed);

    // Limit size
    if (this.searchHistory.length > this.maxHistorySize) {
      this.searchHistory = this.searchHistory.slice(0, this.maxHistorySize);
    }

    // Save to localStorage
    try {
      localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
    } catch (e) {
      console.warn('Could not save search history:', e);
    }
  }

  /**
   * Load search history from localStorage
   */
  loadSearchHistory() {
    try {
      const saved = localStorage.getItem('searchHistory');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Could not load search history:', e);
      return [];
    }
  }

  /**
   * Get search history
   */
  getHistory() {
    return [...this.searchHistory];
  }

  /**
   * Clear search history
   */
  clearHistory() {
    this.searchHistory = [];
    localStorage.removeItem('searchHistory');
  }

  /**
   * Get search suggestions based on sermon data
   */
  getSuggestions(sermons, query, limit = 5) {
    if (!query || query.length < 2) {
      return this.searchHistory.slice(0, limit);
    }

    const suggestions = new Set();
    const lowerQuery = query.toLowerCase();

    sermons.forEach(sermon => {
      // Add matching speakers
      if (sermon.speaker && sermon.speaker.toLowerCase().includes(lowerQuery)) {
        suggestions.add(sermon.speaker);
      }

      // Add matching series
      if (sermon.series && sermon.series.toLowerCase().includes(lowerQuery)) {
        suggestions.add(sermon.series);
      }

      // Add matching title words
      if (sermon.title) {
        const words = sermon.title.split(/\s+/);
        words.forEach(word => {
          if (word.toLowerCase().startsWith(lowerQuery) && word.length > 2) {
            suggestions.add(word);
          }
        });
      }
    });

    return Array.from(suggestions).slice(0, limit);
  }
}

// Create singleton instance
const searchEngine = new SearchEngine();

// Make it globally available
window.searchEngine = searchEngine;

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SearchEngine;
}
