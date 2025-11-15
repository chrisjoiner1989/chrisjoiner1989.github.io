/**
 * Contextual Action Bar
 * Provides toggle button interaction for quick actions
 */

class ActionBar {
  constructor() {
    this.actionBar = document.getElementById('action-bar');
    this.toggleBtn = document.getElementById('action-toggle-btn');
    this.saveBtn = document.getElementById('action-save-btn');
    this.themeBtn = document.getElementById('action-theme-btn');
    this.bibleBtn = document.getElementById('action-bible-btn');

    this.isExpanded = false;

    this.init();
  }

  init() {
    if (!this.actionBar || !this.toggleBtn) return;

    // Click event for toggle button
    this.toggleBtn.addEventListener('click', this.toggle.bind(this));

    // Keyboard support
    this.toggleBtn.addEventListener('keydown', this.handleKeyboard.bind(this));

    // Button event listeners
    if (this.saveBtn) {
      this.saveBtn.addEventListener('click', this.handleSave.bind(this));
    }

    if (this.themeBtn) {
      this.themeBtn.addEventListener('click', this.handleTheme.bind(this));
    }

    if (this.bibleBtn) {
      this.bibleBtn.addEventListener('click', this.handleBible.bind(this));
    }

    // Close action bar when clicking outside
    document.addEventListener('click', this.handleOutsideClick.bind(this));

    // Close when navigating
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        if (this.isExpanded) {
          this.collapse();
        }
      });
    });
  }

  handleKeyboard(e) {
    // Enter or Space to toggle
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.toggle();
    }
    // Escape to collapse
    if (e.key === 'Escape' && this.isExpanded) {
      this.collapse();
    }
  }

  handleOutsideClick(e) {
    if (!this.isExpanded) return;

    // Check if click is outside action bar
    if (!this.actionBar.contains(e.target)) {
      this.collapse();
    }
  }

  toggle() {
    if (this.isExpanded) {
      this.collapse();
    } else {
      this.expand();
    }
  }

  expand() {
    this.actionBar.classList.add('expanded');
    this.actionBar.setAttribute('aria-hidden', 'false');
    this.toggleBtn.classList.add('expanded');
    this.toggleBtn.setAttribute('aria-expanded', 'true');
    this.isExpanded = true;

    // Announce to screen readers
    this.announceToScreenReader('Quick actions expanded');
  }

  collapse() {
    this.actionBar.classList.remove('expanded');
    this.actionBar.setAttribute('aria-hidden', 'true');
    this.toggleBtn.classList.remove('expanded');
    this.toggleBtn.setAttribute('aria-expanded', 'false');
    this.isExpanded = false;

    // Announce to screen readers
    this.announceToScreenReader('Quick actions collapsed');
  }

  announceToScreenReader(message) {
    // Create a live region announcement
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  // Action handlers
  handleSave(e) {
    // Trigger existing save functionality
    if (window.saveSermon && typeof window.saveSermon === 'function') {
      // Create a synthetic event if needed
      const event = e || new Event('click');
      try {
        window.saveSermon(event);
        // Visual feedback only on success
        this.showFeedback(this.saveBtn, 'Saved!');
      } catch (error) {
        console.error('Error saving sermon:', error);
        this.showFeedback(this.saveBtn, 'Save failed');
      }
    }

    // Collapse after action
    this.collapse();
  }

  handleTheme() {
    // Trigger theme toggle
    if (window.themeEngine && window.themeEngine.toggleTheme) {
      window.themeEngine.toggleTheme();
    }

    // Collapse after action
    this.collapse();

    // Visual feedback
    this.showFeedback(this.themeBtn, 'Theme changed');
  }

  handleBible() {
    // Trigger Bible panel
    if (window.floatingBiblePanel && window.floatingBiblePanel.togglePanel) {
      window.floatingBiblePanel.togglePanel();
    } else {
      // Fallback: trigger existing bible toggle button
      const existingBibleBtn = document.querySelector('.bible-toggle-btn');
      if (existingBibleBtn) {
        existingBibleBtn.click();
      }
    }

    // Collapse after action
    this.collapse();

    // Visual feedback
    this.showFeedback(this.bibleBtn, 'Bible panel toggled');
  }

  showFeedback(button, message) {
    // Create temporary feedback indicator
    const feedback = document.createElement('div');
    feedback.className = 'action-feedback';
    feedback.textContent = message;
    feedback.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--card-bg);
      color: var(--text-primary);
      padding: 12px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px var(--shadow);
      z-index: 10000;
      font-size: 14px;
      font-weight: 500;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s ease;
    `;

    document.body.appendChild(feedback);

    // Animate in
    requestAnimationFrame(() => {
      feedback.style.opacity = '1';
    });

    // Remove after 1.5 seconds
    setTimeout(() => {
      feedback.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(feedback);
      }, 200);
    }, 1500);
  }
}

/**
 * Tutorial Manager
 * Shows first-time tutorial for action bar
 */
class TutorialManager {
  constructor() {
    this.tutorialOverlay = document.getElementById('tutorial-overlay');
    this.skipBtn = document.getElementById('tutorial-skip');
    this.gotItBtn = document.getElementById('tutorial-got-it');
    this.storageKey = 'actionBarTutorialCompleted';

    this.init();
  }

  init() {
    if (!this.tutorialOverlay) return;

    // Check if tutorial has been completed
    if (this.hasCompletedTutorial()) {
      return;
    }

    // Show tutorial after a short delay (let page load first)
    setTimeout(() => {
      this.showTutorial();
    }, 1000);

    // Event listeners
    if (this.skipBtn) {
      this.skipBtn.addEventListener('click', () => this.closeTutorial());
    }

    if (this.gotItBtn) {
      this.gotItBtn.addEventListener('click', () => {
        this.closeTutorial();
        // Optionally expand action bar to demonstrate
        if (window.actionBar) {
          setTimeout(() => {
            window.actionBar.expand();
          }, 300);
        }
      });
    }

    // Close on backdrop click
    const backdrop = this.tutorialOverlay.querySelector('.tutorial-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => this.closeTutorial());
    }

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.tutorialOverlay.classList.contains('active')) {
        this.closeTutorial();
      }
    });
  }

  hasCompletedTutorial() {
    try {
      return localStorage.getItem(this.storageKey) === 'true';
    } catch (error) {
      console.warn('localStorage not available:', error);
      return false;
    }
  }

  showTutorial() {
    // Only show on mobile devices
    if (window.innerWidth > 768) {
      return;
    }

    this.tutorialOverlay.classList.add('active');
    this.tutorialOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Prevent scroll
  }

  closeTutorial() {
    this.tutorialOverlay.classList.remove('active');
    this.tutorialOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Restore scroll

    // Mark as completed
    try {
      localStorage.setItem(this.storageKey, 'true');
    } catch (error) {
      console.warn('Could not save tutorial state:', error);
    }
  }

  // Public method to reset tutorial (for debugging or settings)
  resetTutorial() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.warn('Could not reset tutorial:', error);
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.actionBar = new ActionBar();
    window.tutorialManager = new TutorialManager();
  });
} else {
  window.actionBar = new ActionBar();
  window.tutorialManager = new TutorialManager();
}
