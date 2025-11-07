/**
 * Preaching Mode Module
 * Provides a distraction-free delivery interface with timer and navigation
 */

class PreachingMode {
  constructor() {
    this.sermon = null;
    this.currentSectionIndex = 0;
    this.timerInterval = null;
    this.timerSeconds = 0;
    this.timerRunning = false;
    this.darkMode = false;

    this.init();
  }

  /**
   * Initialize preaching mode
   */
  init() {
    this.loadSermon();
    this.setupEventListeners();
    this.loadPreferences();
    this.renderCurrentSection();
    this.updateNavigationButtons();
  }

  /**
   * Load sermon from localStorage
   */
  loadSermon() {
    try {
      const stored = localStorage.getItem('currentSermon');
      if (!stored) {
        this.showError('No sermon found. Please create a sermon first.');
        return;
      }

      this.sermon = JSON.parse(stored);

      // Validate sermon has sections
      if (!this.sermon.sections || this.sermon.sections.length === 0) {
        this.showError('This sermon has no sections. Please add sections to your sermon.');
        return;
      }

      // Display sermon title
      const titleElement = document.getElementById('sermon-title');
      if (titleElement) {
        titleElement.textContent = this.sermon.title;
      }
    } catch (error) {
      console.error('Error loading sermon:', error);
      this.showError('Failed to load sermon data.');
    }
  }

  /**
   * Set up all event listeners
   */
  setupEventListeners() {
    // Navigation buttons
    const prevBtn = document.getElementById('prev-section-btn');
    const nextBtn = document.getElementById('next-section-btn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.previousSection());
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextSection());
    }

    // Timer controls
    const startTimerBtn = document.getElementById('start-timer-btn');
    const pauseTimerBtn = document.getElementById('pause-timer-btn');
    const resetTimerBtn = document.getElementById('reset-timer-btn');

    if (startTimerBtn) {
      startTimerBtn.addEventListener('click', () => this.startTimer());
    }

    if (pauseTimerBtn) {
      pauseTimerBtn.addEventListener('click', () => this.pauseTimer());
    }

    if (resetTimerBtn) {
      resetTimerBtn.addEventListener('click', () => this.resetTimer());
    }

    // Dark mode toggle
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
      darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
    }

    // Exit button
    const exitBtn = document.getElementById('exit-preaching-btn');
    if (exitBtn) {
      exitBtn.addEventListener('click', () => this.exitPreachingMode());
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  /**
   * Handle keyboard shortcuts
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeyboard(event) {
    // Arrow keys for navigation
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.previousSection();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.nextSection();
    }
    // Space bar to start/pause timer
    else if (event.key === ' ' && event.target.tagName !== 'TEXTAREA') {
      event.preventDefault();
      if (this.timerRunning) {
        this.pauseTimer();
      } else {
        this.startTimer();
      }
    }
    // Escape to exit
    else if (event.key === 'Escape') {
      event.preventDefault();
      this.exitPreachingMode();
    }
  }

  /**
   * Render the current section
   */
  renderCurrentSection() {
    if (!this.sermon || !this.sermon.sections) return;

    const section = this.sermon.sections[this.currentSectionIndex];
    if (!section) return;

    const container = document.getElementById('section-content');
    if (!container) return;

    // Build section HTML with fade-in effect
    container.classList.remove('fade-in');

    setTimeout(() => {
      container.innerHTML = `
        <div class="section-heading" role="heading" aria-level="1">
          ${this.escapeHtml(section.heading || 'Untitled Section')}
        </div>

        ${section.scripture ? `
          <div class="section-scripture" aria-label="Scripture reference">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              <line x1="12" y1="6" x2="12" y2="18"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            ${this.escapeHtml(section.scripture)}
          </div>
        ` : ''}

        ${section.notes ? `
          <div class="section-notes">
            ${this.formatNotes(section.notes)}
          </div>
        ` : ''}
      `;

      container.classList.add('fade-in');
    }, 50);

    // Update progress indicator
    this.updateProgressIndicator();
  }

  /**
   * Format notes with line breaks preserved
   * @param {string} notes - Raw notes text
   * @returns {string} Formatted HTML
   */
  formatNotes(notes) {
    return this.escapeHtml(notes)
      .split('\n')
      .map(line => `<p>${line || '&nbsp;'}</p>`)
      .join('');
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Navigate to previous section
   */
  previousSection() {
    if (this.currentSectionIndex > 0) {
      this.currentSectionIndex--;
      this.renderCurrentSection();
      this.updateNavigationButtons();
    }
  }

  /**
   * Navigate to next section
   */
  nextSection() {
    if (this.sermon && this.currentSectionIndex < this.sermon.sections.length - 1) {
      this.currentSectionIndex++;
      this.renderCurrentSection();
      this.updateNavigationButtons();
    }
  }

  /**
   * Update navigation button states
   */
  updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-section-btn');
    const nextBtn = document.getElementById('next-section-btn');

    if (prevBtn) {
      prevBtn.disabled = this.currentSectionIndex === 0;
    }

    if (nextBtn && this.sermon) {
      nextBtn.disabled = this.currentSectionIndex === this.sermon.sections.length - 1;
    }
  }

  /**
   * Update progress indicator
   */
  updateProgressIndicator() {
    const indicator = document.getElementById('progress-indicator');
    if (!indicator || !this.sermon) return;

    const current = this.currentSectionIndex + 1;
    const total = this.sermon.sections.length;

    indicator.innerHTML = `
      <span class="progress-text">Section ${current} of ${total}</span>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${(current / total) * 100}%"></div>
      </div>
    `;
  }

  /**
   * Start the timer
   */
  startTimer() {
    if (this.timerRunning) return;

    this.timerRunning = true;
    this.updateTimerDisplay();

    this.timerInterval = setInterval(() => {
      this.timerSeconds++;
      this.updateTimerDisplay();
    }, 1000);

    // Update button states
    const startBtn = document.getElementById('start-timer-btn');
    const pauseBtn = document.getElementById('pause-timer-btn');

    if (startBtn) startBtn.style.display = 'none';
    if (pauseBtn) pauseBtn.style.display = 'inline-flex';
  }

  /**
   * Pause the timer
   */
  pauseTimer() {
    if (!this.timerRunning) return;

    this.timerRunning = false;
    clearInterval(this.timerInterval);

    // Update button states
    const startBtn = document.getElementById('start-timer-btn');
    const pauseBtn = document.getElementById('pause-timer-btn');

    if (startBtn) startBtn.style.display = 'inline-flex';
    if (pauseBtn) pauseBtn.style.display = 'none';
  }

  /**
   * Reset the timer
   */
  resetTimer() {
    this.pauseTimer();
    this.timerSeconds = 0;
    this.updateTimerDisplay();
  }

  /**
   * Update timer display
   */
  updateTimerDisplay() {
    const timerDisplay = document.getElementById('timer-display');
    if (!timerDisplay) return;

    const hours = Math.floor(this.timerSeconds / 3600);
    const minutes = Math.floor((this.timerSeconds % 3600) / 60);
    const seconds = this.timerSeconds % 60;

    const formatted = [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');

    timerDisplay.textContent = formatted;
  }

  /**
   * Toggle dark mode
   */
  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    document.body.classList.toggle('dark-mode', this.darkMode);

    // Save preference
    localStorage.setItem('preachingModeDarkMode', this.darkMode.toString());

    // Update button icon or text
    const toggle = document.getElementById('dark-mode-toggle');
    if (toggle) {
      const icon = toggle.querySelector('svg');
      if (icon) {
        // Update icon based on mode
        if (this.darkMode) {
          icon.innerHTML = `
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          `;
        } else {
          icon.innerHTML = `
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          `;
        }
      }
    }
  }

  /**
   * Load user preferences
   */
  loadPreferences() {
    // Load dark mode preference
    const darkModeStored = localStorage.getItem('preachingModeDarkMode');
    if (darkModeStored === 'true') {
      this.toggleDarkMode();
    }
  }

  /**
   * Exit preaching mode and return to builder
   */
  exitPreachingMode() {
    if (confirm('Exit preaching mode and return to sermon builder?')) {
      window.location.href = 'index.html';
    }
  }

  /**
   * Show error message
   * @param {string} message - Error message to display
   */
  showError(message) {
    const container = document.getElementById('section-content');
    if (container) {
      container.innerHTML = `
        <div class="error-message" role="alert">
          <h2>Error</h2>
          <p>${this.escapeHtml(message)}</p>
          <button onclick="window.location.href='index.html'" class="btn-primary">
            Return to Sermon Builder
          </button>
        </div>
      `;
    }
  }
}

// Initialize preaching mode when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.preachingMode = new PreachingMode();
});
