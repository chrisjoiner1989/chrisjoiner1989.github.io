/**
 * Floating Bible Panel
 * Provides side-by-side Bible lookup during sermon preparation
 */

class FloatingBiblePanel {
  constructor() {
    this.isOpen = false;
    this.currentVerse = null;
    this.currentTranslation = 'web';
    this.contextRange = 3;
    this.searchMode = 'reference'; // reference, keyword, topic
    this.recentSearches = [];
    this.init();
  }

  /**
   * Initialize the floating Bible panel
   */
  init() {
    this.loadPreferences();
    this.createPanelStructure();
    this.setupEventListeners();
    this.loadRecentSearches();
  }

  /**
   * Load user preferences from localStorage
   */
  loadPreferences() {
    try {
      const prefs = localStorage.getItem('biblePanelPreferences');
      if (prefs) {
        const parsed = JSON.parse(prefs);
        this.currentTranslation = parsed.translation || 'web';
        this.contextRange = parsed.contextRange || 3;
      }
    } catch (error) {
      console.error('Error loading Bible panel preferences:', error);
    }
  }

  /**
   * Save preferences to localStorage
   */
  savePreferences() {
    try {
      localStorage.setItem('biblePanelPreferences', JSON.stringify({
        translation: this.currentTranslation,
        contextRange: this.contextRange
      }));
    } catch (error) {
      console.error('Error saving Bible panel preferences:', error);
    }
  }

  /**
   * Create the HTML structure for the floating panel
   */
  createPanelStructure() {
    // Create toggle button (always visible)
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'bible-panel-toggle';
    toggleBtn.className = 'bible-toggle-btn';
    toggleBtn.title = 'Open Bible Panel (Ctrl+B)';
    toggleBtn.setAttribute('aria-label', 'Toggle Bible panel');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        <line x1="12" y1="6" x2="12" y2="18"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
      </svg>
    `;

    // Create the floating panel
    const panel = document.createElement('div');
    panel.id = 'floating-bible-panel';
    panel.className = 'floating-bible-panel';
    panel.setAttribute('role', 'complementary');
    panel.setAttribute('aria-label', 'Bible reference panel');

    panel.innerHTML = `
      <div class="bible-panel-header">
        <h3 class="bible-panel-title">Bible</h3>
        <button class="bible-panel-close" aria-label="Close Bible panel" title="Close">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="bible-panel-content">
        <!-- Search Mode Tabs -->
        <div class="search-mode-tabs" role="tablist">
          <button class="search-tab active" data-mode="reference" role="tab" aria-selected="true">Reference</button>
          <button class="search-tab" data-mode="keyword" role="tab" aria-selected="false">Keyword</button>
          <button class="search-tab" data-mode="topic" role="tab" aria-selected="false">Topics</button>
        </div>

        <!-- Search Interface -->
        <div class="bible-search-container">
          <div class="bible-search-input-wrapper">
            <input
              type="text"
              id="bible-search-input"
              class="bible-search-input"
              placeholder="e.g., John 3:16"
              aria-label="Bible search"
            />
            <button class="bible-search-btn" aria-label="Search">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>

          <!-- Controls -->
          <div class="bible-controls">
            <div class="bible-control-group">
              <label for="bible-translation-select">Translation:</label>
              <select id="bible-translation-select" class="bible-select">
                <option value="web">WEB</option>
                <option value="kjv">KJV</option>
                <option value="nkjv">NKJV</option>
                <option value="esv">ESV</option>
                <option value="nlt">NLT</option>
                <option value="asv">ASV</option>
                <option value="bbe">BBE</option>
              </select>
            </div>

            <div class="bible-control-group">
              <label for="context-range-select">Context:</label>
              <select id="context-range-select" class="bible-select">
                <option value="0">None</option>
                <option value="1">±1 verse</option>
                <option value="3" selected>±3 verses</option>
                <option value="5">±5 verses</option>
                <option value="10">±10 verses</option>
              </select>
            </div>
          </div>

          <!-- Quick Topics (shown in topic mode) -->
          <div class="quick-topics" style="display: none;">
            <p class="quick-topics-label">Popular Topics:</p>
            <div class="quick-topics-grid" id="quick-topics-grid">
              <!-- Populated by bibleTopics.js -->
            </div>
          </div>
        </div>

        <!-- Results Area -->
        <div class="bible-results" id="bible-results">
          <div class="bible-welcome">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="welcome-icon">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              <line x1="12" y1="6" x2="12" y2="18"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            <p>Search for a Bible verse to get started</p>
          </div>
        </div>
      </div>
    `;

    // Add to DOM
    document.body.appendChild(toggleBtn);
    document.body.appendChild(panel);
  }

  /**
   * Set up all event listeners
   */
  setupEventListeners() {
    // Toggle button
    const toggleBtn = document.getElementById('bible-panel-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggle());
    }

    // Close button
    const closeBtn = document.querySelector('.bible-panel-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Search mode tabs
    const tabs = document.querySelectorAll('.search-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => this.switchSearchMode(tab.dataset.mode));
    });

    // Search button
    const searchBtn = document.querySelector('.bible-search-btn');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => this.performSearch());
    }

    // Search input (Enter key)
    const searchInput = document.getElementById('bible-search-input');
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.performSearch();
        }
      });
    }

    // Translation selector
    const translationSelect = document.getElementById('bible-translation-select');
    if (translationSelect) {
      translationSelect.value = this.currentTranslation;
      translationSelect.addEventListener('change', (e) => {
        this.currentTranslation = e.target.value;
        this.savePreferences();
        // Re-search if there's a current verse
        if (this.currentVerse) {
          this.performSearch();
        }
      });
    }

    // Context range selector
    const contextSelect = document.getElementById('context-range-select');
    if (contextSelect) {
      contextSelect.value = this.contextRange;
      contextSelect.addEventListener('change', (e) => {
        this.contextRange = parseInt(e.target.value);
        this.savePreferences();
        // Re-display with new context if there's a current verse
        if (this.currentVerse) {
          this.performSearch();
        }
      });
    }

    // Click outside to close (desktop only)
    document.addEventListener('click', (e) => {
      const panel = document.getElementById('floating-bible-panel');
      const toggleBtn = document.getElementById('bible-panel-toggle');

      if (this.isOpen && panel &&
          !panel.contains(e.target) &&
          !toggleBtn.contains(e.target) &&
          window.innerWidth >= 768) {
        // Don't close on mobile (where it's a modal)
        // this.close();
      }
    });

    // Keyboard shortcut (Ctrl/Cmd + B)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  /**
   * Switch between search modes
   */
  switchSearchMode(mode) {
    this.searchMode = mode;

    // Update tabs
    const tabs = document.querySelectorAll('.search-tab');
    tabs.forEach(tab => {
      const isActive = tab.dataset.mode === mode;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive.toString());
    });

    // Update search input placeholder
    const searchInput = document.getElementById('bible-search-input');
    if (searchInput) {
      switch (mode) {
        case 'reference':
          searchInput.placeholder = 'e.g., John 3:16';
          break;
        case 'keyword':
          searchInput.placeholder = 'e.g., faith, love, hope';
          break;
        case 'topic':
          searchInput.placeholder = 'e.g., salvation, grace';
          break;
      }
    }

    // Show/hide quick topics
    const quickTopics = document.querySelector('.quick-topics');
    if (quickTopics) {
      quickTopics.style.display = mode === 'topic' ? 'block' : 'none';
    }

    // Populate topics if needed
    if (mode === 'topic' && typeof window.bibleTopics !== 'undefined') {
      this.populateQuickTopics();
    }
  }

  /**
   * Populate quick topic buttons
   */
  populateQuickTopics() {
    const grid = document.getElementById('quick-topics-grid');
    if (!grid || !window.bibleTopics) return;

    const popularTopics = window.bibleTopics.getPopularTopics();

    grid.innerHTML = popularTopics.map(topic => `
      <button class="topic-btn" data-topic="${topic.id}">
        ${topic.name}
      </button>
    `).join('');

    // Add click handlers
    grid.querySelectorAll('.topic-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.searchTopic(btn.dataset.topic);
      });
    });
  }

  /**
   * Perform search based on current mode
   */
  async performSearch() {
    const searchInput = document.getElementById('bible-search-input');
    const query = searchInput?.value.trim();

    if (!query) return;

    this.showLoading();

    try {
      switch (this.searchMode) {
        case 'reference':
          await this.searchReference(query);
          break;
        case 'keyword':
          await this.searchKeyword(query);
          break;
        case 'topic':
          await this.searchTopic(query);
          break;
      }

      // Save to recent searches
      this.addToRecentSearches(query, this.searchMode);
    } catch (error) {
      console.error('Search error:', error);
      this.showError('Failed to fetch Bible passage. Please try again.');
    }
  }

  /**
   * Search by reference (e.g., John 3:16)
   */
  async searchReference(reference) {
    try {
      // Use existing API function from api.js
      if (typeof window.fetchVerse === 'function') {
        const result = await window.fetchVerse(reference, this.currentTranslation);

        if (result && result.text) {
          this.currentVerse = {
            reference: result.reference || reference,
            text: result.text,
            translation: this.currentTranslation
          };

          this.displayVerseWithContext();
        } else {
          this.showError('Verse not found. Please check the reference and try again.');
        }
      } else {
        this.showError('Bible API not available. Please refresh the page.');
      }
    } catch (error) {
      console.error('Reference search error:', error);
      this.showError('Failed to fetch verse. Please try again.');
    }
  }

  /**
   * Search by keyword
   */
  async searchKeyword(keyword) {
    // This will be enhanced when api.js is updated with keyword search
    this.showError('Keyword search coming soon! Use reference search (e.g., "John 3:16") for now.');
  }

  /**
   * Search by topic
   */
  async searchTopic(topicId) {
    if (!window.bibleTopics) {
      this.showError('Topic data not loaded.');
      return;
    }

    const topic = window.bibleTopics.getTopic(topicId);
    if (!topic) {
      this.showError('Topic not found.');
      return;
    }

    // Display topic verses
    this.displayTopicResults(topic);
  }

  /**
   * Display verse with context
   */
  displayVerseWithContext() {
    if (!this.currentVerse) return;

    const resultsDiv = document.getElementById('bible-results');
    if (!resultsDiv) return;

    resultsDiv.innerHTML = `
      <div class="verse-display-container">
        <div class="verse-header">
          <h4 class="verse-reference">${this.currentVerse.reference}</h4>
          <span class="verse-translation">${this.currentTranslation.toUpperCase()}</span>
        </div>

        <div class="verse-text-container">
          <div class="verse-text highlighted">
            ${this.currentVerse.text}
          </div>
        </div>

        <div class="verse-actions">
          <button class="verse-action-btn" onclick="window.floatingBible.copyToClipboard()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copy
          </button>
          <button class="verse-action-btn primary" onclick="window.floatingBible.addToNotes()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add to Notes
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Display topic search results
   */
  displayTopicResults(topic) {
    const resultsDiv = document.getElementById('bible-results');
    if (!resultsDiv) return;

    resultsDiv.innerHTML = `
      <div class="topic-results-container">
        <div class="topic-header">
          <h4>${topic.name}</h4>
          <p class="topic-description">${topic.description || ''}</p>
        </div>

        <div class="topic-verses-list">
          ${topic.verses.map((verse, index) => `
            <div class="topic-verse-item" data-reference="${verse}">
              <span class="verse-number">${index + 1}</span>
              <button class="topic-verse-link" onclick="window.floatingBible.loadTopicVerse('${verse}')">
                ${verse}
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Load a specific verse from topic results
   */
  async loadTopicVerse(reference) {
    const searchInput = document.getElementById('bible-search-input');
    if (searchInput) {
      searchInput.value = reference;
    }
    this.switchSearchMode('reference');
    await this.searchReference(reference);
  }

  /**
   * Copy current verse to clipboard
   */
  copyToClipboard() {
    if (!this.currentVerse) return;

    const text = `${this.currentVerse.reference}\n"${this.currentVerse.text}"\n(${this.currentTranslation.toUpperCase()})`;

    navigator.clipboard.writeText(text).then(() => {
      this.showNotification('Verse copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
      this.showNotification('Failed to copy verse', 'error');
    });
  }

  /**
   * Add current verse to sermon notes
   */
  addToNotes() {
    if (!this.currentVerse) return;

    // Try to add to the currently focused section, or main notes
    const focusedSection = document.querySelector('.sermon-section:focus-within .section-notes');
    const mainNotes = document.getElementById('notes');

    const verseText = `\n\n${this.currentVerse.reference}\n"${this.currentVerse.text}"\n`;

    if (focusedSection) {
      // Get section number for specific feedback
      const sectionElement = focusedSection.closest('.sermon-section');
      const sectionNumber = sectionElement?.querySelector('.section-number')?.textContent || '';
      const sectionHeading = sectionElement?.querySelector('.section-heading')?.value || '';

      focusedSection.value += verseText;
      focusedSection.dispatchEvent(new Event('input', { bubbles: true }));

      // Show specific section info in notification
      let message = `${this.currentVerse.reference} added to Section ${sectionNumber}`;
      if (sectionHeading) {
        message += ` (${sectionHeading})`;
      }
      this.showNotification(message);
    } else if (mainNotes) {
      mainNotes.value += verseText;
      mainNotes.dispatchEvent(new Event('input', { bubbles: true }));
      this.showNotification(`${this.currentVerse.reference} added to Sermon Notes`);
    } else {
      this.showNotification('Could not find notes field', 'error');
    }
  }

  /**
   * Show loading state
   */
  showLoading() {
    const resultsDiv = document.getElementById('bible-results');
    if (resultsDiv) {
      resultsDiv.innerHTML = `
        <div class="bible-loading">
          <div class="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      `;
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    const resultsDiv = document.getElementById('bible-results');
    if (resultsDiv) {
      resultsDiv.innerHTML = `
        <div class="bible-error">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>${message}</p>
        </div>
      `;
    }
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');

    // Add icon based on type
    const icon = type === 'success'
      ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';

    notification.innerHTML = `
      <span class="notification-icon">${icon}</span>
      <span class="notification-message">${message}</span>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Add search to recent searches
   */
  addToRecentSearches(query, mode) {
    this.recentSearches.unshift({ query, mode, timestamp: Date.now() });
    this.recentSearches = this.recentSearches.slice(0, 10); // Keep last 10

    try {
      localStorage.setItem('bibleRecentSearches', JSON.stringify(this.recentSearches));
    } catch (error) {
      console.error('Error saving recent searches:', error);
    }
  }

  /**
   * Load recent searches
   */
  loadRecentSearches() {
    try {
      const stored = localStorage.getItem('bibleRecentSearches');
      if (stored) {
        this.recentSearches = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  }

  /**
   * Toggle panel open/closed
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Open the panel
   */
  open() {
    const panel = document.getElementById('floating-bible-panel');
    const toggleBtn = document.getElementById('bible-panel-toggle');

    if (panel) {
      panel.classList.add('open');
      this.isOpen = true;

      // Focus search input
      setTimeout(() => {
        const searchInput = document.getElementById('bible-search-input');
        if (searchInput) searchInput.focus();
      }, 300);
    }

    if (toggleBtn) {
      toggleBtn.setAttribute('title', 'Close Bible Panel (Ctrl+B)');
      toggleBtn.setAttribute('aria-expanded', 'true');
    }
  }

  /**
   * Close the panel
   */
  close() {
    const panel = document.getElementById('floating-bible-panel');
    const toggleBtn = document.getElementById('bible-panel-toggle');

    if (panel) {
      panel.classList.remove('open');
      this.isOpen = false;
    }

    if (toggleBtn) {
      toggleBtn.setAttribute('title', 'Open Bible Panel (Ctrl+B)');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.floatingBible = new FloatingBiblePanel();
});
