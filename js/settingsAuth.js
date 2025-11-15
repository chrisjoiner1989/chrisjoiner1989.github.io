/**
 * Settings Page - Authentication & Sync UI
 * Handles login, registration, and cloud sync management
 */

class SettingsAuth {
  constructor() {
    this.init();
  }

  async init() {
    // Check authentication status and update UI
    await this.updateAuthUI();

    // Setup event listeners
    this.setupEventListeners();

    // Auto-update sync status if logged in
    if (window.authAPI && window.authAPI.isLoggedIn()) {
      this.startSyncStatusUpdates();
    }
  }

  setupEventListeners() {
    // Auth tabs
    const authTabs = document.querySelectorAll('.auth-tab');
    authTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const targetTab = e.target.dataset.tab;
        this.switchAuthTab(targetTab);
      });
    });

    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    // Register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    }

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    // Sync now button
    const syncNowBtn = document.getElementById('sync-now-btn');
    if (syncNowBtn) {
      syncNowBtn.addEventListener('click', () => this.handleSyncNow());
    }

    // Migrate to cloud button
    const migrateBtn = document.getElementById('migrate-to-cloud-btn');
    if (migrateBtn) {
      migrateBtn.addEventListener('click', () => this.handleMigration());
    }
  }

  switchAuthTab(tab) {
    // Update tab buttons
    const authTabs = document.querySelectorAll('.auth-tab');
    authTabs.forEach(t => {
      if (t.dataset.tab === tab) {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    });

    // Show/hide forms
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (tab === 'login') {
      loginForm.style.display = 'block';
      registerForm.style.display = 'none';
    } else {
      loginForm.style.display = 'none';
      registerForm.style.display = 'block';
    }

    // Clear error messages
    this.clearErrors();
  }

  async handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    const submitBtn = e.target.querySelector('button[type="submit"]');

    // Clear previous errors
    errorDiv.style.display = 'none';

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';

    try {
      const result = await window.authAPI.login(email, password);

      // Enable cloud sync
      await window.storageSync.enableSync();

      // Show success and update UI
      this.showNotification('Login successful! Cloud sync enabled.', 'success');
      await this.updateAuthUI();

      // Clear form
      e.target.reset();
    } catch (error) {
      errorDiv.textContent = error.message || 'Login failed. Please check your credentials.';
      errorDiv.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
          <polyline points="10 17 15 12 10 7"></polyline>
          <line x1="15" y1="12" x2="3" y2="12"></line>
        </svg>
        Login
      `;
    }
  }

  async handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const errorDiv = document.getElementById('register-error');
    const submitBtn = e.target.querySelector('button[type="submit"]');

    // Clear previous errors
    errorDiv.style.display = 'none';

    // Client-side validation
    if (password.length < 8 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
      errorDiv.textContent = 'Password must be at least 8 characters with letters and numbers';
      errorDiv.style.display = 'block';
      return;
    }

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    try {
      const result = await window.authAPI.register({ name, email, password });

      // Enable cloud sync
      await window.storageSync.enableSync();

      // Show success and update UI
      this.showNotification('Account created successfully! Cloud sync enabled.', 'success');
      await this.updateAuthUI();

      // Clear form
      e.target.reset();
    } catch (error) {
      errorDiv.textContent = error.message || 'Registration failed. Please try again.';
      errorDiv.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="8.5" cy="7" r="4"></circle>
          <line x1="20" y1="8" x2="20" y2="14"></line>
          <line x1="23" y1="11" x2="17" y2="11"></line>
        </svg>
        Create Account
      `;
    }
  }

  async handleLogout() {
    if (!confirm('Are you sure you want to logout? Your local sermons will remain on this device.')) {
      return;
    }

    try {
      await window.authAPI.logout();
      window.storageSync.disableSync();

      this.showNotification('Logged out successfully', 'success');
      await this.updateAuthUI();

      // Stop sync status updates
      if (this.syncStatusInterval) {
        clearInterval(this.syncStatusInterval);
      }
    } catch (error) {
      this.showNotification('Logout failed: ' + error.message, 'error');
    }
  }

  async handleSyncNow() {
    const syncBtn = document.getElementById('sync-now-btn');
    const originalHTML = syncBtn.innerHTML;

    syncBtn.disabled = true;
    syncBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spinning">
        <polyline points="23 4 23 10 17 10"></polyline>
        <polyline points="1 20 1 14 7 14"></polyline>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
      </svg>
      Syncing...
    `;

    try {
      const results = await window.storageSync.performFullSync();

      this.showNotification(
        `Sync complete! Uploaded: ${results.uploaded}, Downloaded: ${results.downloaded}`,
        'success'
      );

      await this.updateSyncStatus();
    } catch (error) {
      this.showNotification('Sync failed: ' + error.message, 'error');
    } finally {
      syncBtn.disabled = false;
      syncBtn.innerHTML = originalHTML;
    }
  }

  async handleMigration() {
    const status = window.storageSync.getSyncStatus();

    if (status.needsSync === 0) {
      this.showNotification('All sermons are already synced!', 'info');
      return;
    }

    if (!confirm(`Upload ${status.needsSync} local sermon(s) to cloud backup?`)) {
      return;
    }

    const migrateBtn = document.getElementById('migrate-to-cloud-btn');
    const originalHTML = migrateBtn.innerHTML;

    migrateBtn.disabled = true;
    migrateBtn.textContent = 'Uploading...';

    try {
      const result = await window.storageSync.migrateToCloud();

      this.showNotification(result.message, 'success');
      await this.updateSyncStatus();
    } catch (error) {
      this.showNotification('Migration failed: ' + error.message, 'error');
    } finally {
      migrateBtn.disabled = false;
      migrateBtn.innerHTML = originalHTML;
    }
  }

  async updateAuthUI() {
    const loggedOutSection = document.getElementById('auth-logged-out');
    const loggedInSection = document.getElementById('auth-logged-in');

    if (window.authAPI && window.authAPI.isLoggedIn()) {
      // Show logged in section
      loggedOutSection.style.display = 'none';
      loggedInSection.style.display = 'block';

      // Load user profile
      try {
        const profile = await window.authAPI.getProfile();

        document.getElementById('user-name').textContent = profile.user.name || 'User';
        document.getElementById('user-email').textContent = profile.user.email;

        await this.updateSyncStatus();
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    } else {
      // Show logged out section
      loggedOutSection.style.display = 'block';
      loggedInSection.style.display = 'none';
    }
  }

  async updateSyncStatus() {
    const status = window.storageSync.getSyncStatus();

    // Update sync counts
    document.getElementById('synced-count').textContent = status.synced;
    document.getElementById('needs-sync-count').textContent = status.needsSync;

    // Update last sync time
    const lastSyncElem = document.getElementById('last-sync-time');
    if (status.lastSync) {
      const lastSyncDate = new Date(status.lastSync);
      const now = new Date();
      const diffMs = now - lastSyncDate;
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) {
        lastSyncElem.textContent = 'Just now';
      } else if (diffMins < 60) {
        lastSyncElem.textContent = `${diffMins} min ago`;
      } else if (diffMins < 1440) {
        lastSyncElem.textContent = `${Math.floor(diffMins / 60)}h ago`;
      } else {
        lastSyncElem.textContent = lastSyncDate.toLocaleDateString();
      }
    } else {
      lastSyncElem.textContent = 'Never';
    }

    // Update sync indicator
    const syncIcon = document.getElementById('sync-icon');
    const syncText = document.getElementById('sync-text');

    if (status.inProgress) {
      syncIcon.textContent = '🔄';
      syncText.textContent = 'Syncing...';
    } else if (status.needsSync > 0) {
      syncIcon.textContent = '⚠️';
      syncText.textContent = `${status.needsSync} sermon(s) need sync`;
    } else {
      syncIcon.textContent = '✅';
      syncText.textContent = 'All synced';
    }
  }

  startSyncStatusUpdates() {
    // Update sync status every 30 seconds
    this.syncStatusInterval = setInterval(() => {
      if (window.authAPI && window.authAPI.isLoggedIn()) {
        this.updateSyncStatus();
      } else {
        clearInterval(this.syncStatusInterval);
      }
    }, 30000);
  }

  clearErrors() {
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');

    if (loginError) loginError.style.display = 'none';
    if (registerError) registerError.style.display = 'none';
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `settings-notification ${type}`;
    notification.textContent = message;

    // Add to page
    document.body.appendChild(notification);

    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.settingsAuth = new SettingsAuth();
  });
} else {
  window.settingsAuth = new SettingsAuth();
}
