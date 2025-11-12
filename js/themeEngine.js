/**
 * Theme Engine for Mount Builder App
 * Centralized theming system that manages themes across all pages and components
 */

class ThemeEngine {
    constructor() {
        // Theme definitions with color schemes
        this.themes = {
            light: {
                name: 'Light',
                colors: {
                    '--bg-primary': '#ffffff',
                    '--bg-secondary': '#f5f5f7',
                    '--text-primary': '#1c1c1e',
                    '--text-secondary': '#86868b',
                    '--accent-primary': '#cc3333',
                    '--accent-secondary': '#b22929',
                    '--border-color': '#e5e5e7',
                    '--hover-bg': '#f5f5f7',
                    '--shadow': 'rgba(0, 0, 0, 0.1)',
                    '--card-bg': '#ffffff'
                }
            },
            sepia: {
                name: 'Sepia',
                colors: {
                    '--bg-primary': '#f4ecd8',
                    '--bg-secondary': '#e8dcc4',
                    '--text-primary': '#5c4a3a',
                    '--text-secondary': '#8b7355',
                    '--accent-primary': '#8b4513',
                    '--accent-secondary': '#6b3410',
                    '--border-color': '#d4c4a8',
                    '--hover-bg': '#e8dcc4',
                    '--shadow': 'rgba(92, 74, 58, 0.15)',
                    '--card-bg': '#f9f3e3'
                }
            },
            dark: {
                name: 'Dark',
                colors: {
                    '--bg-primary': '#1c1c1e',
                    '--bg-secondary': '#2c2c2e',
                    '--text-primary': '#e5e5e7',
                    '--text-secondary': '#98989d',
                    '--accent-primary': '#ff6b6b',
                    '--accent-secondary': '#ff5252',
                    '--border-color': '#3a3a3c',
                    '--hover-bg': '#2c2c2e',
                    '--shadow': 'rgba(0, 0, 0, 0.3)',
                    '--card-bg': '#2c2c2e'
                }
            }
        };

        // Font size definitions
        this.fontSizes = {
            small: {
                '--font-base': '14px',
                '--font-heading': '18px',
                '--font-large': '20px'
            },
            medium: {
                '--font-base': '16px',
                '--font-heading': '20px',
                '--font-large': '24px'
            },
            large: {
                '--font-base': '18px',
                '--font-heading': '24px',
                '--font-large': '28px'
            },
            xlarge: {
                '--font-base': '20px',
                '--font-heading': '28px',
                '--font-large': '32px'
            }
        };

        // Local storage keys
        this.STORAGE_KEYS = {
            THEME: 'appTheme',
            FONT_SIZE: 'appFontSize'
        };

        // Registered components that should be notified of theme changes
        this.themeChangeListeners = [];

        // Initialize theme
        this.currentTheme = this.loadTheme();
        this.currentFontSize = this.loadFontSize();
    }

    /**
     * Initialize the theme engine
     */
    init() {
        this.applyTheme(this.currentTheme);
        this.applyFontSize(this.currentFontSize);

        // Migrate old bible theme preferences if they exist
        this.migrateLegacyPreferences();
    }

    /**
     * Migrate old bible-specific theme preferences to app-wide preferences
     */
    migrateLegacyPreferences() {
        const oldTheme = localStorage.getItem('bibleTheme');
        const oldFontSize = localStorage.getItem('bibleFontSize');

        if (oldTheme && !localStorage.getItem(this.STORAGE_KEYS.THEME)) {
            this.saveTheme(oldTheme);
            console.log('Migrated bibleTheme to appTheme:', oldTheme);
        }

        if (oldFontSize && !localStorage.getItem(this.STORAGE_KEYS.FONT_SIZE)) {
            this.saveFontSize(oldFontSize);
            console.log('Migrated bibleFontSize to appFontSize:', oldFontSize);
        }
    }

    /**
     * Load theme from localStorage
     */
    loadTheme() {
        const saved = localStorage.getItem(this.STORAGE_KEYS.THEME);
        return (saved && this.themes[saved]) ? saved : 'light';
    }

    /**
     * Load font size from localStorage
     */
    loadFontSize() {
        const saved = localStorage.getItem(this.STORAGE_KEYS.FONT_SIZE);
        return (saved && this.fontSizes[saved]) ? saved : 'medium';
    }

    /**
     * Save theme to localStorage
     */
    saveTheme(theme) {
        if (this.themes[theme]) {
            localStorage.setItem(this.STORAGE_KEYS.THEME, theme);
            this.currentTheme = theme;
        }
    }

    /**
     * Save font size to localStorage
     */
    saveFontSize(size) {
        if (this.fontSizes[size]) {
            localStorage.setItem(this.STORAGE_KEYS.FONT_SIZE, size);
            this.currentFontSize = size;
        }
    }

    /**
     * Apply theme to the document
     */
    applyTheme(themeName) {
        if (!this.themes[themeName]) {
            console.warn(`Theme "${themeName}" not found. Using default.`);
            themeName = 'light';
        }

        const theme = this.themes[themeName];
        const root = document.documentElement;

        // Apply CSS custom properties
        Object.entries(theme.colors).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });

        // Set theme attribute for CSS selectors
        root.setAttribute('data-theme', themeName);

        // Update current theme
        this.currentTheme = themeName;
        this.saveTheme(themeName);

        // Notify listeners
        this.notifyThemeChange(themeName);

        console.log(`Theme applied: ${themeName}`);
    }

    /**
     * Apply font size to the document
     */
    applyFontSize(sizeName) {
        if (!this.fontSizes[sizeName]) {
            console.warn(`Font size "${sizeName}" not found. Using default.`);
            sizeName = 'medium';
        }

        const size = this.fontSizes[sizeName];
        const root = document.documentElement;

        // Apply CSS custom properties
        Object.entries(size).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });

        // Set font size attribute for CSS selectors
        root.setAttribute('data-font-size', sizeName);

        // Update current font size
        this.currentFontSize = sizeName;
        this.saveFontSize(sizeName);

        // Notify listeners
        this.notifyFontSizeChange(sizeName);

        console.log(`Font size applied: ${sizeName}`);
    }

    /**
     * Get current theme
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Get current font size
     */
    getCurrentFontSize() {
        return this.currentFontSize;
    }

    /**
     * Get all available themes
     */
    getAvailableThemes() {
        return Object.keys(this.themes);
    }

    /**
     * Get all available font sizes
     */
    getAvailableFontSizes() {
        return Object.keys(this.fontSizes);
    }

    /**
     * Register a callback for theme changes
     */
    onThemeChange(callback) {
        if (typeof callback === 'function') {
            this.themeChangeListeners.push({
                type: 'theme',
                callback: callback
            });
        }
    }

    /**
     * Register a callback for font size changes
     */
    onFontSizeChange(callback) {
        if (typeof callback === 'function') {
            this.themeChangeListeners.push({
                type: 'fontSize',
                callback: callback
            });
        }
    }

    /**
     * Notify all registered listeners of theme change
     */
    notifyThemeChange(themeName) {
        this.themeChangeListeners
            .filter(listener => listener.type === 'theme')
            .forEach(listener => {
                try {
                    listener.callback(themeName);
                } catch (error) {
                    console.error('Error in theme change listener:', error);
                }
            });
    }

    /**
     * Notify all registered listeners of font size change
     */
    notifyFontSizeChange(sizeName) {
        this.themeChangeListeners
            .filter(listener => listener.type === 'fontSize')
            .forEach(listener => {
                try {
                    listener.callback(sizeName);
                } catch (error) {
                    console.error('Error in font size change listener:', error);
                }
            });
    }

    /**
     * Toggle between themes (light -> sepia -> dark -> light)
     */
    toggleTheme() {
        const themes = this.getAvailableThemes();
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.applyTheme(themes[nextIndex]);
    }

    /**
     * Cycle font size (small -> medium -> large -> xlarge -> small)
     */
    cycleFontSize() {
        const sizes = this.getAvailableFontSizes();
        const currentIndex = sizes.indexOf(this.currentFontSize);
        const nextIndex = (currentIndex + 1) % sizes.length;
        this.applyFontSize(sizes[nextIndex]);
    }
}

// Create singleton instance
const themeEngine = new ThemeEngine();

// Make it globally available
window.themeEngine = themeEngine;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => themeEngine.init());
} else {
    themeEngine.init();
}

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeEngine;
}
