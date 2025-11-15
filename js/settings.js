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

    // Update Bible cache info
    updateBibleCacheInfo();

    // Update performance info
    updatePerformanceInfo();

    // Clear all data button
    const clearDataBtn = document.getElementById('clear-all-data');
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', handleClearAllData);
    }

    // Clear Bible cache button
    const clearCacheBtn = document.getElementById('clear-bible-cache');
    if (clearCacheBtn) {
        clearCacheBtn.addEventListener('click', handleClearBibleCache);
    }

    // Export performance button
    const exportPerfBtn = document.getElementById('export-performance');
    if (exportPerfBtn) {
        exportPerfBtn.addEventListener('click', handleExportPerformance);
    }

    // Clear performance button
    const clearPerfBtn = document.getElementById('clear-performance');
    if (clearPerfBtn) {
        clearPerfBtn.addEventListener('click', handleClearPerformance);
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
 * Update Bible cache information display
 */
function updateBibleCacheInfo() {
    if (!window.bibleCache) {
        console.log('Bible cache not available');
        return;
    }

    const stats = window.bibleCache.getStats();

    // Update cached chapters count
    const chaptersElement = document.getElementById('cache-chapters');
    if (chaptersElement) {
        chaptersElement.textContent = stats.entries;
    }

    // Update hit rate
    const hitrateElement = document.getElementById('cache-hitrate');
    if (hitrateElement) {
        hitrateElement.textContent = stats.hitRate;
    }

    console.log('Bible cache stats:', stats);
}

/**
 * Handle clear Bible cache action
 */
function handleClearBibleCache() {
    if (!window.bibleCache) {
        alert('Bible cache is not available');
        return;
    }

    const stats = window.bibleCache.getStats();
    const confirmed = confirm(
        `Clear Bible chapter cache?\n\n` +
        `This will remove ${stats.entries} cached chapters.\n` +
        `They will be re-downloaded from the internet when you view them again.\n\n` +
        `Your saved sermons and settings will not be affected.`
    );

    if (!confirmed) {
        return;
    }

    try {
        window.bibleCache.clearCache();
        updateBibleCacheInfo();
        alert('Bible cache cleared successfully!');
    } catch (error) {
        console.error('Error clearing Bible cache:', error);
        alert('An error occurred while clearing the cache. Please try again.');
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

/**
 * Update performance information display
 */
function updatePerformanceInfo() {
    if (!window.performanceMonitor) {
        console.log('Performance monitor not available');
        return;
    }

    const report = window.performanceMonitor.getReport();

    // Update Core Web Vitals
    updateWebVital('lcp', report.coreWebVitals.LCP);
    updateWebVital('fid', report.coreWebVitals.FID);
    updateWebVital('cls', report.coreWebVitals.CLS);

    // Update session stats
    const pageViewsElement = document.getElementById('page-views');
    if (pageViewsElement) {
        pageViewsElement.textContent = report.session.pageViews;
    }

    const errorCountElement = document.getElementById('error-count');
    if (errorCountElement) {
        errorCountElement.textContent = report.session.errors;
    }
}

/**
 * Update a single Web Vital metric
 */
function updateWebVital(name, data) {
    if (!data) return;

    const valueElement = document.getElementById(`${name}-value`);
    const ratingElement = document.getElementById(`${name}-rating`);

    if (valueElement) {
        // Format value based on metric type
        let displayValue;
        if (name === 'cls') {
            displayValue = data.avg.toFixed(3);
        } else {
            displayValue = `${Math.round(data.avg)} ms`;
        }
        valueElement.textContent = displayValue;
    }

    if (ratingElement) {
        ratingElement.textContent = data.rating;
        ratingElement.className = `metric-rating rating-${data.rating}`;
    }
}

/**
 * Handle export performance data
 */
function handleExportPerformance() {
    if (!window.performanceMonitor) {
        alert('Performance monitor is not available');
        return;
    }

    try {
        window.performanceMonitor.exportData();
        alert('Performance data exported successfully!');
    } catch (error) {
        console.error('Error exporting performance data:', error);
        alert('An error occurred while exporting performance data.');
    }
}

/**
 * Handle clear performance data
 */
function handleClearPerformance() {
    if (!window.performanceMonitor) {
        alert('Performance monitor is not available');
        return;
    }

    const confirmed = confirm(
        'Clear all performance data?\n\n' +
        'This will remove all performance metrics and statistics.\n' +
        'Your sermons and settings will not be affected.'
    );

    if (!confirmed) {
        return;
    }

    try {
        window.performanceMonitor.clearData();
        updatePerformanceInfo();
        alert('Performance data cleared successfully!');
    } catch (error) {
        console.error('Error clearing performance data:', error);
        alert('An error occurred while clearing performance data.');
    }
}
