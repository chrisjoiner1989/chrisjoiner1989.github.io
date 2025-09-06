/**
 * Modern Toast Notification System
 * Replaces traditional alerts with beautiful, non-blocking toast notifications
 */

class ToastManager {
  constructor() {
    this.toasts = [];
    this.container = null;
    this.init();
  }

  init() {
    // Create toast container if it doesn't exist
    if (!document.querySelector('.toast-container')) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    } else {
      this.container = document.querySelector('.toast-container');
    }
  }

  /**
   * Show a toast notification
   * @param {string} message - The message to display
   * @param {string} type - Type of toast: 'success', 'error', 'warning', 'info'
   * @param {number} duration - Duration in milliseconds (default: 4000)
   */
  show(message, type = 'info', duration = 4000) {
    const toast = this.createToast(message, type, duration);
    this.container.appendChild(toast);
    this.toasts.push(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('toast-show');
    });

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.remove(toast);
      }, duration);
    }

    return toast;
  }

  /**
   * Create a toast element
   */
  createToast(message, type, duration) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = this.getIcon(type);
    const closeBtn = duration > 0 ? '<button class="toast-close" aria-label="Close">&times;</button>' : '';
    
    toast.innerHTML = `
      <div class="toast-content">
        <div class="toast-icon">${icon}</div>
        <div class="toast-message">${message}</div>
        ${closeBtn}
      </div>
    `;

    // Add close functionality
    const closeButton = toast.querySelector('.toast-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.remove(toast);
      });
    }

    // Add click to dismiss
    toast.addEventListener('click', () => {
      this.remove(toast);
    });

    return toast;
  }

  /**
   * Get icon for toast type
   */
  getIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  }

  /**
   * Remove a toast
   */
  remove(toast) {
    if (!toast || !toast.parentNode) return;

    toast.classList.add('toast-hide');
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      this.toasts = this.toasts.filter(t => t !== toast);
    }, 300);
  }

  /**
   * Clear all toasts
   */
  clear() {
    this.toasts.forEach(toast => this.remove(toast));
  }

  // Convenience methods
  success(message, duration = 4000) {
    return this.show(message, 'success', duration);
  }

  error(message, duration = 6000) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration = 5000) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration = 4000) {
    return this.show(message, 'info', duration);
  }
}

// Create global instance
window.toastManager = new ToastManager();

// Convenience functions
window.toast = {
  success: (message, duration) => window.toastManager.success(message, duration),
  error: (message, duration) => window.toastManager.error(message, duration),
  warning: (message, duration) => window.toastManager.warning(message, duration),
  info: (message, duration) => window.toastManager.info(message, duration),
  show: (message, type, duration) => window.toastManager.show(message, type, duration)
};
