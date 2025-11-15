/**
 * Tag System for Sermon Categorization
 * Provides flexible tagging beyond series for better organization
 *
 * Features:
 * - Add/remove tags to sermons
 * - Filter sermons by tags
 * - Autocomplete from existing tags
 * - Tag analytics and insights
 * - Preset tag categories (topics, audience, format, etc.)
 */

class TagSystem {
  constructor() {
    this.STORAGE_KEY = 'mountBuilderTags';
    this.presetTags = this.initializePresetTags();
  }

  /**
   * Initialize preset tag categories for common sermon categorization
   */
  initializePresetTags() {
    return {
      topics: [
        'Faith', 'Hope', 'Love', 'Prayer', 'Worship',
        'Grace', 'Salvation', 'Forgiveness', 'Redemption',
        'Holy Spirit', 'Trinity', 'Jesus Christ', 'God the Father',
        'Kingdom of God', 'End Times', 'Second Coming',
        'Discipleship', 'Evangelism', 'Mission', 'Service',
        'Family', 'Marriage', 'Parenting', 'Children',
        'Youth', 'Wisdom', 'Stewardship', 'Giving',
        'Suffering', 'Trials', 'Perseverance', 'Victory'
      ],
      audience: [
        'Youth', 'Young Adults', 'Adults', 'Seniors',
        'Men', 'Women', 'Couples', 'Singles',
        'Parents', 'New Believers', 'Seekers', 'All Ages'
      ],
      format: [
        'Expository', 'Topical', 'Narrative', 'Biographical',
        'Devotional', 'Apologetic', 'Evangelistic', 'Pastoral',
        'Teaching Series', 'One-off', 'Guest Speaker', 'Panel Discussion'
      ],
      seasons: [
        'Advent', 'Christmas', 'Lent', 'Easter', 'Pentecost',
        'Thanksgiving', 'New Year', 'Summer', 'Back to School',
        'Mission Month', 'Stewardship Season'
      ],
      themes: [
        'Revival', 'Breakthrough', 'Renewal', 'Transformation',
        'Vision', 'Purpose', 'Identity', 'Calling',
        'Unity', 'Community', 'Leadership', 'Character',
        'Spiritual Warfare', 'Healing', 'Deliverance', 'Prophetic'
      ]
    };
  }

  /**
   * Get all unique tags from all sermons
   */
  getAllTags(sermons) {
    const tagSet = new Set();

    sermons.forEach(sermon => {
      if (sermon.tags && Array.isArray(sermon.tags)) {
        sermon.tags.forEach(tag => tagSet.add(tag));
      }
    });

    return Array.from(tagSet).sort();
  }

  /**
   * Get tag usage statistics
   */
  getTagStats(sermons) {
    const tagCounts = {};

    sermons.forEach(sermon => {
      if (sermon.tags && Array.isArray(sermon.tags)) {
        sermon.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    // Convert to array and sort by usage
    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Add tags to a sermon
   */
  addTagsToSermon(sermon, newTags) {
    if (!sermon.tags) {
      sermon.tags = [];
    }

    // Normalize and filter tags
    const normalizedTags = newTags
      .map(tag => this.normalizeTag(tag))
      .filter(tag => tag.length > 0)
      .filter(tag => !sermon.tags.includes(tag)); // Avoid duplicates

    sermon.tags.push(...normalizedTags);
    return sermon;
  }

  /**
   * Remove a tag from a sermon
   */
  removeTagFromSermon(sermon, tagToRemove) {
    if (!sermon.tags) return sermon;

    sermon.tags = sermon.tags.filter(tag => tag !== tagToRemove);
    return sermon;
  }

  /**
   * Normalize tag (trim, capitalize first letter)
   */
  normalizeTag(tag) {
    if (typeof tag !== 'string') return '';

    const trimmed = tag.trim();
    if (trimmed.length === 0) return '';

    // Capitalize first letter of each word
    return trimmed
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Filter sermons by tags
   */
  filterByTags(sermons, selectedTags, matchMode = 'any') {
    if (!selectedTags || selectedTags.length === 0) {
      return sermons;
    }

    return sermons.filter(sermon => {
      if (!sermon.tags || sermon.tags.length === 0) {
        return false;
      }

      if (matchMode === 'any') {
        // Match if sermon has ANY of the selected tags
        return selectedTags.some(tag => sermon.tags.includes(tag));
      } else {
        // Match if sermon has ALL of the selected tags
        return selectedTags.every(tag => sermon.tags.includes(tag));
      }
    });
  }

  /**
   * Get tag suggestions based on partial input
   */
  getSuggestions(sermons, partialTag) {
    const allTags = this.getAllTags(sermons);
    const normalizedInput = partialTag.toLowerCase();

    // Combine existing tags with preset tags
    const allAvailableTags = new Set([
      ...allTags,
      ...this.presetTags.topics,
      ...this.presetTags.audience,
      ...this.presetTags.format,
      ...this.presetTags.seasons,
      ...this.presetTags.themes
    ]);

    return Array.from(allAvailableTags)
      .filter(tag => tag.toLowerCase().includes(normalizedInput))
      .slice(0, 10); // Limit to 10 suggestions
  }

  /**
   * Get related tags (tags that commonly appear together)
   */
  getRelatedTags(sermons, targetTag) {
    const relatedCounts = {};

    sermons.forEach(sermon => {
      if (sermon.tags && sermon.tags.includes(targetTag)) {
        sermon.tags.forEach(tag => {
          if (tag !== targetTag) {
            relatedCounts[tag] = (relatedCounts[tag] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(relatedCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 related tags
  }

  /**
   * Export tags as a formatted list
   */
  exportTagsList(sermons) {
    const stats = this.getTagStats(sermons);

    let output = 'Mount Builder - Tag Statistics\n';
    output += '================================\n\n';

    stats.forEach(({ tag, count }) => {
      const percentage = ((count / sermons.length) * 100).toFixed(1);
      output += `${tag}: ${count} sermon${count !== 1 ? 's' : ''} (${percentage}%)\n`;
    });

    return output;
  }

  /**
   * Get tag color for visual distinction
   */
  getTagColor(tag, index) {
    const colors = [
      '#722f37', // Primary red
      '#808000', // Olive
      '#5C6BC0', // Indigo
      '#26A69A', // Teal
      '#7E57C2', // Deep Purple
      '#EC407A', // Pink
      '#AB47BC', // Purple
      '#42A5F5', // Blue
      '#66BB6A', // Green
      '#FFA726', // Orange
      '#8D6E63', // Brown
      '#78909C'  // Blue Grey
    ];

    // Use tag name to generate consistent color
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  }

  /**
   * Bulk add tags to multiple sermons
   */
  bulkAddTags(sermons, sermonIds, tags) {
    sermons.forEach(sermon => {
      if (sermonIds.includes(sermon.id)) {
        this.addTagsToSermon(sermon, tags);
      }
    });
    return sermons;
  }

  /**
   * Get sermons without any tags
   */
  getUntaggedSermons(sermons) {
    return sermons.filter(sermon => !sermon.tags || sermon.tags.length === 0);
  }

  /**
   * Rename a tag across all sermons
   */
  renameTag(sermons, oldTag, newTag) {
    const normalized = this.normalizeTag(newTag);

    sermons.forEach(sermon => {
      if (sermon.tags && sermon.tags.includes(oldTag)) {
        const index = sermon.tags.indexOf(oldTag);
        sermon.tags[index] = normalized;
      }
    });

    return sermons;
  }

  /**
   * Merge multiple tags into one
   */
  mergeTags(sermons, tagsToMerge, newTag) {
    const normalized = this.normalizeTag(newTag);

    sermons.forEach(sermon => {
      if (sermon.tags) {
        const hasMergeTags = sermon.tags.some(tag => tagsToMerge.includes(tag));

        if (hasMergeTags) {
          // Remove all merge tags
          sermon.tags = sermon.tags.filter(tag => !tagsToMerge.includes(tag));

          // Add new tag if not already present
          if (!sermon.tags.includes(normalized)) {
            sermon.tags.push(normalized);
          }
        }
      }
    });

    return sermons;
  }
}

// Create singleton instance
const tagSystem = new TagSystem();

// Make it globally available
window.tagSystem = tagSystem;

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TagSystem;
}
