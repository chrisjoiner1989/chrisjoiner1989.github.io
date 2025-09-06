// Theme Manager for Light/Dark Mode
class ThemeManager {
  constructor() {
    this.currentTheme = this.getStoredTheme() || this.getSystemTheme();
    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.createThemeToggle();
    this.listenForSystemThemeChanges();
    this.addThemeTransition();
  }

  getStoredTheme() {
    return localStorage.getItem("mount-builder-theme");
  }

  setStoredTheme(theme) {
    localStorage.setItem("mount-builder-theme", theme);
  }

  getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    this.currentTheme = theme;
    this.setStoredTheme(theme);
    this.updateMetaThemeColor(theme);
  }

  updateMetaThemeColor(theme) {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.content = theme === "dark" ? "#1c1c1e" : "#722f37";
    }
  }

  toggleTheme() {
    const newTheme = this.currentTheme === "light" ? "dark" : "light";
    this.applyTheme(newTheme);
    this.triggerHapticFeedback();
    this.updateThemeToggle();
  }

  createThemeToggle() {
    // Check if toggle already exists
    if (document.querySelector(".theme-toggle")) {
      return;
    }

    try {
      const toggle = document.createElement("button");
      toggle.className = "theme-toggle";
      toggle.setAttribute("aria-label", "Toggle dark mode");
      toggle.setAttribute("title", "Toggle dark mode");

      const slider = document.createElement("div");
      slider.className = "theme-toggle-slider";
      toggle.appendChild(slider);

      toggle.addEventListener("click", () => {
        this.toggleTheme();
      });

      // Add to header
      const header = document.querySelector(".main-header");
      if (header) {
        // Create a container for the theme toggle
        const themeContainer = document.createElement("div");
        themeContainer.className = "header-theme-container";
        themeContainer.appendChild(toggle);
        header.appendChild(themeContainer);
      } else {
        console.warn("Main header not found, skipping theme toggle creation");
      }

      // Also add to bottom nav for mobile
      this.addBottomNavThemeToggle();

      this.updateThemeToggle();
    } catch (error) {
      console.error("Error creating theme toggle:", error);
    }
  }

  addBottomNavThemeToggle() {
    try {
      const bottomNav = document.querySelector(".bottom-nav");
      if (bottomNav) {
        // Check if bottom nav toggle already exists
        if (bottomNav.querySelector(".theme-toggle")) {
          return;
        }

        // Don't add theme toggle to bottom nav since we have it in header
        if (false) {
          const toggle = document.createElement("button");
          toggle.className = "theme-toggle";
          toggle.setAttribute("aria-label", "Toggle dark mode");
          toggle.setAttribute("title", "Toggle dark mode");

          const slider = document.createElement("div");
          slider.className = "theme-toggle-slider";
          toggle.appendChild(slider);

          toggle.addEventListener("click", () => {
            this.toggleTheme();
          });

          // Insert before the last item (Calendar)
          const lastItem = bottomNav.lastElementChild;
          if (lastItem) {
            bottomNav.insertBefore(toggle, lastItem);
          } else {
            bottomNav.appendChild(toggle);
          }
        }
      } else {
        console.warn(
          "Bottom nav not found, skipping bottom nav theme toggle creation"
        );
      }
    } catch (error) {
      console.error("Error creating bottom nav theme toggle:", error);
    }
  }

  updateThemeToggle() {
    try {
      const toggles = document.querySelectorAll(".theme-toggle");
      toggles.forEach((toggle) => {
        const slider = toggle.querySelector(".theme-toggle-slider");
        if (slider) {
          if (this.currentTheme === "dark") {
            slider.style.transform = "translateX(22px)";
          } else {
            slider.style.transform = "translateX(0)";
          }
        }
      });
    } catch (error) {
      console.error("Error updating theme toggle:", error);
    }
  }

  listenForSystemThemeChanges() {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    mediaQuery.addEventListener("change", (e) => {
      // Only apply system theme if user hasn't manually set a preference
      if (!this.getStoredTheme()) {
        const systemTheme = e.matches ? "dark" : "light";
        this.applyTheme(systemTheme);
        this.updateThemeToggle();
      }
    });
  }

  addThemeTransition() {
    // Add smooth transition for theme changes
    const style = document.createElement("style");
    style.textContent = `
      * {
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
      }
      
      /* Disable transitions during initial load */
      .no-transition * {
        transition: none !important;
      }
    `;
    document.head.appendChild(style);

    // Remove no-transition class after a short delay
    setTimeout(() => {
      document.documentElement.classList.remove("no-transition");
    }, 100);
  }

  triggerHapticFeedback() {
    if ("vibrate" in navigator) {
      navigator.vibrate([10]);
    }
  }

  // Method to get current theme (for external use)
  getCurrentTheme() {
    return this.currentTheme;
  }

  // Method to set theme programmatically
  setTheme(theme) {
    if (theme === "light" || theme === "dark") {
      this.applyTheme(theme);
      this.updateThemeToggle();
    }
  }

  // Method to reset to system theme
  resetToSystemTheme() {
    localStorage.removeItem("mount-builder-theme");
    const systemTheme = this.getSystemTheme();
    this.applyTheme(systemTheme);
    this.updateThemeToggle();
  }
}

// Initialize theme manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Add no-transition class during initial load
  document.documentElement.classList.add("no-transition");

  // Initialize theme manager with a small delay to ensure DOM is fully ready
  setTimeout(() => {
    try {
      window.themeManager = new ThemeManager();
    } catch (error) {
      console.error("Error initializing theme manager:", error);
    }
  }, 100);
});

// Export for use in other modules
window.ThemeManager = ThemeManager;
