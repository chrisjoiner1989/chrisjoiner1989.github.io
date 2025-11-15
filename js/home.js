/**
 * Home Dashboard Logic
 * Handles the main dashboard/start page functionality
 */

class HomeDashboard {
  constructor() {
    this.greetingElement = document.getElementById('greeting');
    this.continueEditingBanner = document.getElementById('continue-editing-banner');
    this.recentSermonsContainer = document.getElementById('recent-sermons-container');
    this.createNewBtn = document.getElementById('create-new-btn');
    this.continueEditingBtn = document.getElementById('continue-editing-btn');
    this.dismissEditingBtn = document.getElementById('dismiss-editing-btn');

    this.init();
  }

  init() {
    // Set time-based greeting
    this.updateGreeting();

    // Check if user has a sermon in progress
    this.checkEditingStatus();

    // Load recent sermons
    this.loadRecentSermons();

    // Update statistics badges
    this.updateStatistics();

    // Event listeners
    if (this.createNewBtn) {
      this.createNewBtn.addEventListener('click', (e) => this.handleCreateNew(e));
    }

    if (this.continueEditingBtn) {
      this.continueEditingBtn.addEventListener('click', () => this.handleContinueEditing());
    }

    if (this.dismissEditingBtn) {
      this.dismissEditingBtn.addEventListener('click', () => this.dismissEditingBanner());
    }
  }

  /**
   * Update greeting based on time of day
   */
  updateGreeting() {
    if (!this.greetingElement) return;

    const hour = new Date().getHours();
    let greeting;

    if (hour < 12) {
      greeting = 'Good morning!';
    } else if (hour < 18) {
      greeting = 'Good afternoon!';
    } else {
      greeting = 'Good evening!';
    }

    this.greetingElement.textContent = greeting;
  }

  /**
   * Check if user has a sermon in progress and show banner
   */
  checkEditingStatus() {
    if (!this.continueEditingBanner) return;

    try {
      const editingSermon = localStorage.getItem('editingSermon');

      if (editingSermon) {
        const sermon = JSON.parse(editingSermon);
        const titleElement = this.continueEditingBanner.querySelector('.continue-editing-title');

        if (titleElement && sermon.title) {
          titleElement.textContent = sermon.title || 'Untitled Sermon';
        }

        this.continueEditingBanner.style.display = 'flex';
      } else {
        this.continueEditingBanner.style.display = 'none';
      }
    } catch (error) {
      console.warn('Error checking editing status:', error);
      this.continueEditingBanner.style.display = 'none';
    }
  }

  /**
   * Load and display recent sermons
   */
  loadRecentSermons() {
    if (!this.recentSermonsContainer) return;

    try {
      const sermonsData = localStorage.getItem('mountBuilderSermons');

      if (!sermonsData) {
        this.showEmptyState();
        return;
      }

      const sermons = JSON.parse(sermonsData);

      if (!Array.isArray(sermons) || sermons.length === 0) {
        this.showEmptyState();
        return;
      }

      // Sort by last modified (most recent first) and take top 5
      const recentSermons = sermons
        .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
        .slice(0, 5);

      this.renderRecentSermons(recentSermons);
    } catch (error) {
      console.error('Error loading recent sermons:', error);
      this.showEmptyState();
    }
  }

  /**
   * Render recent sermons list
   */
  renderRecentSermons(sermons) {
    const html = `
      <div class="recent-sermons-section">
        <h2 class="section-title">Recent Sermons</h2>
        <div class="recent-sermons-list">
          ${sermons.map(sermon => this.createSermonCard(sermon)).join('')}
        </div>
      </div>
    `;

    this.recentSermonsContainer.innerHTML = html;

    // Add event listeners to action buttons
    this.attachSermonCardListeners();
  }

  /**
   * Create HTML for a sermon card
   */
  createSermonCard(sermon) {
    const date = new Date(sermon.lastModified);
    const formattedDate = this.formatDate(date);
    const title = sermon.title || 'Untitled Sermon';
    const scripture = sermon.scripture || 'No scripture selected';

    return `
      <div class="sermon-card" data-sermon-id="${sermon.id}">
        <div class="sermon-card-content">
          <h3 class="sermon-card-title">${this.escapeHtml(title)}</h3>
          <p class="sermon-card-scripture">${this.escapeHtml(scripture)}</p>
          <p class="sermon-card-date">${formattedDate}</p>
        </div>
        <div class="sermon-card-actions">
          <button class="sermon-action-btn edit-btn" data-action="edit" data-sermon-id="${sermon.id}" title="Edit sermon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="sermon-action-btn delete-btn" data-action="delete" data-sermon-id="${sermon.id}" title="Delete sermon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners to sermon card buttons
   */
  attachSermonCardListeners() {
    const editButtons = document.querySelectorAll('.sermon-action-btn[data-action="edit"]');
    const deleteButtons = document.querySelectorAll('.sermon-action-btn[data-action="delete"]');

    editButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const sermonId = btn.getAttribute('data-sermon-id');
        this.handleQuickEdit(sermonId);
      });
    });

    deleteButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const sermonId = btn.getAttribute('data-sermon-id');
        this.handleQuickDelete(sermonId);
      });
    });
  }

  /**
   * Show empty state when no sermons exist
   */
  showEmptyState() {
    const html = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="12" y1="18" x2="12" y2="12"></line>
          <line x1="9" y1="15" x2="15" y2="15"></line>
        </svg>
        <h3>No sermons yet</h3>
        <p>Start building your first sermon to see it here</p>
      </div>
    `;

    this.recentSermonsContainer.innerHTML = html;
  }

  /**
   * Update statistics badges
   */
  updateStatistics() {
    try {
      const sermonsData = localStorage.getItem('mountBuilderSermons');

      if (!sermonsData) {
        this.updateBadge('library', 0);
        this.updateBadge('stats', 0);
        return;
      }

      const sermons = JSON.parse(sermonsData);
      const totalSermons = Array.isArray(sermons) ? sermons.length : 0;

      // Update library badge
      this.updateBadge('library', totalSermons);

      // Calculate sermons created this month
      const thisMonth = this.getSermonsThisMonth(sermons);
      this.updateBadge('stats', thisMonth);
    } catch (error) {
      console.warn('Error updating statistics:', error);
    }
  }

  /**
   * Update a count badge
   */
  updateBadge(type, count) {
    const badge = document.querySelector(`.access-card[href*="${type}"] .count-badge`);
    if (badge) {
      badge.textContent = count;
    }
  }

  /**
   * Get count of sermons created this month
   */
  getSermonsThisMonth(sermons) {
    if (!Array.isArray(sermons)) return 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return sermons.filter(sermon => {
      const sermonDate = new Date(sermon.lastModified);
      return sermonDate.getMonth() === currentMonth &&
             sermonDate.getFullYear() === currentYear;
    }).length;
  }

  /**
   * Handle create new sermon
   */
  handleCreateNew(e) {
    try {
      // Clear any editing sermon flag
      localStorage.removeItem('editingSermon');

      // Redirect to sermon builder
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Error creating new sermon:', error);
    }
  }

  /**
   * Handle continue editing
   */
  handleContinueEditing() {
    // Editing sermon is already in localStorage, just redirect
    window.location.href = 'index.html';
  }

  /**
   * Dismiss editing banner
   */
  dismissEditingBanner() {
    try {
      localStorage.removeItem('editingSermon');

      if (this.continueEditingBanner) {
        this.continueEditingBanner.style.display = 'none';
      }
    } catch (error) {
      console.error('Error dismissing editing banner:', error);
    }
  }

  /**
   * Handle quick edit from recent sermons
   */
  handleQuickEdit(sermonId) {
    try {
      const sermonsData = localStorage.getItem('mountBuilderSermons');
      if (!sermonsData) return;

      const sermons = JSON.parse(sermonsData);
      const sermon = sermons.find(s => s.id === sermonId);

      if (sermon) {
        // Set as editing sermon
        localStorage.setItem('editingSermon', JSON.stringify(sermon));

        // Redirect to form
        window.location.href = 'index.html';
      }
    } catch (error) {
      console.error('Error editing sermon:', error);
    }
  }

  /**
   * Handle quick delete from recent sermons
   */
  handleQuickDelete(sermonId) {
    try {
      const sermonsData = localStorage.getItem('mountBuilderSermons');
      if (!sermonsData) return;

      const sermons = JSON.parse(sermonsData);
      const sermon = sermons.find(s => s.id === sermonId);

      if (!sermon) return;

      // Confirm deletion
      const confirmed = confirm(`Delete "${sermon.title || 'Untitled Sermon'}"?\n\nThis action cannot be undone.`);

      if (confirmed) {
        // Remove sermon from array
        const updatedSermons = sermons.filter(s => s.id !== sermonId);

        // Save back to localStorage
        localStorage.setItem('mountBuilderSermons', JSON.stringify(updatedSermons));

        // If this was the editing sermon, clear it
        const editingSermon = localStorage.getItem('editingSermon');
        if (editingSermon) {
          const editing = JSON.parse(editingSermon);
          if (editing.id === sermonId) {
            localStorage.removeItem('editingSermon');
          }
        }

        // Reload the page to refresh the display
        window.location.reload();
      }
    } catch (error) {
      console.error('Error deleting sermon:', error);
      alert('Failed to delete sermon. Please try again.');
    }
  }

  /**
   * Format date for display
   */
  formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      const options = { month: 'short', day: 'numeric', year: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.homeDashboard = new HomeDashboard();
  });
} else {
  window.homeDashboard = new HomeDashboard();
}
