/**
 * Welcome Screen Logic
 * Handles the initial welcome/onboarding experience
 */

class WelcomeScreen {
  constructor() {
    this.getStartedBtn = document.getElementById('get-started-btn');
    this.skipLink = document.getElementById('skip-link');
    this.storageKey = 'hasSeenWelcome';

    this.init();
  }

  init() {
    if (!this.getStartedBtn) return;

    // Check if user has already seen welcome (shouldn't happen, but just in case)
    if (this.hasSeenWelcome()) {
      this.redirectToApp();
      return;
    }

    // Event listeners
    this.getStartedBtn.addEventListener('click', () => this.handleGetStarted());

    if (this.skipLink) {
      this.skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleGetStarted();
      });
    }

    // Keyboard support - Enter or Space on the button
    this.getStartedBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.handleGetStarted();
      }
    });
  }

  hasSeenWelcome() {
    try {
      return localStorage.getItem(this.storageKey) === 'true';
    } catch (error) {
      console.warn('localStorage not available:', error);
      return false;
    }
  }

  handleGetStarted() {
    // Mark welcome as seen
    try {
      localStorage.setItem(this.storageKey, 'true');
    } catch (error) {
      console.warn('Could not save welcome state:', error);
    }

    // Add fade-out animation to welcome screen
    const container = document.querySelector('.welcome-container');
    if (container) {
      container.style.transition = 'opacity 0.4s ease';
      container.style.opacity = '0';
    }

    // Redirect to main app after fade-out
    setTimeout(() => {
      this.redirectToApp();
    }, 400);
  }

  redirectToApp() {
    window.location.href = 'home.html';
  }

  // Public method to reset welcome (for debugging/testing)
  static resetWelcome() {
    try {
      localStorage.removeItem('hasSeenWelcome');
      console.log('Welcome screen reset. Refresh to see it again.');
    } catch (error) {
      console.warn('Could not reset welcome:', error);
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.welcomeScreen = new WelcomeScreen();
  });
} else {
  window.welcomeScreen = new WelcomeScreen();
}

// Expose reset function for debugging
window.resetWelcome = WelcomeScreen.resetWelcome;
