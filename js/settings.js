/**
 * Settings Page JavaScript
 * Handles theme, font size, and data management settings
 */

// Initialize settings page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Settings page initializing...');

    // Wait for theme engine to be ready
    if (window.themeEngine) {
        initializeSettings();
    } else {
        // Wait a bit for theme engine to load
        setTimeout(initializeSettings, 100);
    }
});

function initializeSettings() {
    if (!window.themeEngine) {
        console.error('Theme engine not available');
        return;
    }

    // Initialize theme options
    initializeThemeOptions();

    // Initialize font size options
    initializeFontSizeOptions();

    // Initialize data management
    initializeDataManagement();

    console.log('Settings page initialized');
}

/**
 * Initialize theme selection
 */
function initializeThemeOptions() {
    const currentTheme = window.themeEngine.getCurrentTheme();
    const themeButtons = document.querySelectorAll('.theme-option');

    // Set active theme
    themeButtons.forEach(button => {
        const theme = button.getAttribute('data-theme');
        if (theme === currentTheme) {
            button.classList.add('active');
        }

        // Add click handler
        button.addEventListener('click', function() {
            const selectedTheme = this.getAttribute('data-theme');

            // Apply theme
            window.themeEngine.applyTheme(selectedTheme);

            // Update active state
            themeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            console.log('Theme changed to:', selectedTheme);
        });
    });
}

/**
 * Initialize font size selection
 */
function initializeFontSizeOptions() {
    const currentSize = window.themeEngine.getCurrentFontSize();
    const sizeButtons = document.querySelectorAll('.font-size-option');

    // Set active size
    sizeButtons.forEach(button => {
        const size = button.getAttribute('data-size');
        if (size === currentSize) {
            button.classList.add('active');
        }

        // Add click handler
        button.addEventListener('click', function() {
            const selectedSize = this.getAttribute('data-size');

            // Apply font size
            window.themeEngine.applyFontSize(selectedSize);

            // Update active state
            sizeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            console.log('Font size changed to:', selectedSize);
        });
    });
}

/**
 * Initialize data management section
 */
function initializeDataManagement() {
    // Update storage info
    updateStorageInfo();

    // Clear all data button
    const clearDataBtn = document.getElementById('clear-all-data');
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', handleClearAllData);
    }
}

/**
 * Update storage information display
 */
function updateStorageInfo() {
    // Count sermons
    const sermons = loadSermons ? loadSermons() : [];
    const sermonCount = document.getElementById('sermon-count');
    if (sermonCount) {
        sermonCount.textContent = Array.isArray(sermons) ? sermons.length : 0;
    }

    // Calculate approximate storage size
    let totalSize = 0;
    try {
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length + key.length;
            }
        }
    } catch (e) {
        console.error('Error calculating storage size:', e);
    }

    const storageSizeElement = document.getElementById('storage-size');
    if (storageSizeElement) {
        const sizeInKB = (totalSize / 1024).toFixed(2);
        storageSizeElement.textContent = `${sizeInKB} KB`;
    }
}

/**
 * Handle clear all data action
 */
function handleClearAllData() {
    const confirmed = confirm(
        'Are you sure you want to delete ALL data?\n\n' +
        'This will remove:\n' +
        '• All saved sermons\n' +
        '• All preferences and settings\n' +
        '• Bible search history\n\n' +
        'This action cannot be undone!'
    );

    if (!confirmed) {
        return;
    }

    // Double confirmation for safety
    const doubleConfirm = confirm(
        'FINAL WARNING!\n\n' +
        'This will permanently delete all your data.\n\n' +
        'Are you absolutely sure?'
    );

    if (!doubleConfirm) {
        return;
    }

    try {
        // Clear all localStorage
        localStorage.clear();

        // Show success message
        alert('All data has been cleared successfully.\n\nThe page will now reload with default settings.');

        // Reload page to reset everything
        window.location.reload();
    } catch (error) {
        console.error('Error clearing data:', error);
        alert('An error occurred while clearing data. Please try again.');
    }
}

/**
 * Listen for theme changes from other sources
 */
if (window.themeEngine) {
    window.themeEngine.onThemeChange(function(theme) {
        // Update active button if theme changed externally
        const themeButtons = document.querySelectorAll('.theme-option');
        themeButtons.forEach(button => {
            const btnTheme = button.getAttribute('data-theme');
            if (btnTheme === theme) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    });

    window.themeEngine.onFontSizeChange(function(size) {
        // Update active button if size changed externally
        const sizeButtons = document.querySelectorAll('.font-size-option');
        sizeButtons.forEach(button => {
            const btnSize = button.getAttribute('data-size');
            if (btnSize === size) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    });
}
