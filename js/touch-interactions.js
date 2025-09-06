// Enhanced Touch Interactions for Native App Feel
class TouchInteractions {
  constructor() {
    this.init();
  }

  init() {
    this.addTouchFeedback();
    this.addSwipeGestures();
    this.addHapticFeedback();
    this.addPullToRefresh();
  }

  // Add visual feedback for touch interactions
  addTouchFeedback() {
    const touchElements = document.querySelectorAll(
      "button, .nav-btn, .bottom-nav-item, input, textarea, .theme-toggle"
    );

    touchElements.forEach((element) => {
      element.addEventListener("touchstart", (e) => {
        element.style.transform = "scale(0.95)";
        element.style.transition = "transform 0.1s ease";
      });

      element.addEventListener("touchend", (e) => {
        element.style.transform = "scale(1)";
        this.triggerHapticFeedback("light");
      });

      element.addEventListener("touchcancel", (e) => {
        element.style.transform = "scale(1)";
      });
    });
  }

  // Add swipe gestures for navigation
  addSwipeGestures() {
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;

    document.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });

    document.addEventListener("touchend", (e) => {
      endX = e.changedTouches[0].clientX;
      endY = e.changedTouches[0].clientY;

      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const minSwipeDistance = 50;

      // Horizontal swipe
      if (
        Math.abs(deltaX) > Math.abs(deltaY) &&
        Math.abs(deltaX) > minSwipeDistance
      ) {
        if (deltaX > 0) {
          // Swipe right - go to previous page
          this.handleSwipeRight();
        } else {
          // Swipe left - go to next page
          this.handleSwipeLeft();
        }
      }
    });
  }

  handleSwipeRight() {
    const currentPage = this.getCurrentPage();
    const pages = ["index.html", "library.html", "bible.html", "calendar.html"];
    const currentIndex = pages.indexOf(currentPage);

    if (currentIndex > 0) {
      this.triggerHapticFeedback("medium");
      window.location.href = pages[currentIndex - 1];
    }
  }

  handleSwipeLeft() {
    const currentPage = this.getCurrentPage();
    const pages = ["index.html", "library.html", "bible.html", "calendar.html"];
    const currentIndex = pages.indexOf(currentPage);

    if (currentIndex < pages.length - 1) {
      this.triggerHapticFeedback("medium");
      window.location.href = pages[currentIndex + 1];
    }
  }

  getCurrentPage() {
    const path = window.location.pathname;
    return path.split("/").pop() || "index.html";
  }

  // Add haptic feedback simulation
  addHapticFeedback() {
    // Check if device supports haptic feedback
    this.supportsHaptics = "vibrate" in navigator;
  }

  triggerHapticFeedback(type = "light") {
    if (!this.supportsHaptics) return;

    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
      success: [10, 50, 10],
      error: [50, 50, 50],
      warning: [20, 20, 20],
    };

    navigator.vibrate(patterns[type] || patterns.light);
  }

  // Add pull-to-refresh functionality
  addPullToRefresh() {
    let startY = 0;
    let currentY = 0;
    let isPulling = false;
    const pullThreshold = 100;

    document.addEventListener("touchstart", (e) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        isPulling = true;
      }
    });

    document.addEventListener("touchmove", (e) => {
      if (!isPulling) return;

      currentY = e.touches[0].clientY;
      const pullDistance = currentY - startY;

      if (pullDistance > 0) {
        e.preventDefault();
        // Add visual feedback for pull-to-refresh
        this.updatePullToRefreshIndicator(pullDistance);
      }
    });

    document.addEventListener("touchend", (e) => {
      if (!isPulling) return;

      const pullDistance = currentY - startY;
      isPulling = false;

      if (pullDistance > pullThreshold) {
        this.triggerHapticFeedback("success");
        this.refreshPage();
      }

      this.resetPullToRefreshIndicator();
    });
  }

  updatePullToRefreshIndicator(distance) {
    // Create or update pull-to-refresh indicator
    let indicator = document.getElementById("pull-to-refresh-indicator");
    if (!indicator) {
      indicator = document.createElement("div");
      indicator.id = "pull-to-refresh-indicator";
      indicator.style.cssText = `
        position: fixed;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        background: var(--primary-color);
        color: white;
        padding: 10px 20px;
        border-radius: 0 0 12px 12px;
        font-size: 14px;
        z-index: 1000;
        transition: all 0.3s ease;
      `;
      document.body.appendChild(indicator);
    }

    const opacity = Math.min(distance / 100, 1);
    indicator.style.opacity = opacity;
    indicator.textContent =
      distance > 100 ? "Release to refresh" : "Pull to refresh";
  }

  resetPullToRefreshIndicator() {
    const indicator = document.getElementById("pull-to-refresh-indicator");
    if (indicator) {
      indicator.style.opacity = "0";
      setTimeout(() => {
        if (indicator.parentNode) {
          indicator.parentNode.removeChild(indicator);
        }
      }, 300);
    }
  }

  refreshPage() {
    // Add loading state
    const loadingIndicator = document.createElement("div");
    loadingIndicator.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--primary-color), var(--primary-hover));
      z-index: 1001;
      animation: loading 1s ease-in-out;
    `;

    // Add loading animation
    const style = document.createElement("style");
    style.textContent = `
      @keyframes loading {
        0% { width: 0%; }
        100% { width: 100%; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(loadingIndicator);

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  // Add keyboard shortcuts for better accessibility
  addKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      // Alt + Arrow keys for navigation
      if (e.altKey) {
        switch (e.key) {
          case "ArrowLeft":
            e.preventDefault();
            this.handleSwipeRight();
            break;
          case "ArrowRight":
            e.preventDefault();
            this.handleSwipeLeft();
            break;
        }
      }
    });
  }
}

// Initialize touch interactions when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  try {
    new TouchInteractions();
  } catch (error) {
    console.error("Error initializing touch interactions:", error);
  }
});

// Export for use in other modules
window.TouchInteractions = TouchInteractions;
