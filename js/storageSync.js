/**
 * Storage Sync Manager
 * Manages hybrid storage mode: localStorage (offline-first) + cloud sync (optional)
 */

class StorageSync {
  constructor() {
    this.syncEnabled = false;
    this.lastSyncTime = null;
    this.syncInProgress = false;
    this.conflictResolution = 'local-first'; // 'local-first' or 'cloud-first'

    this.loadSyncPreferences();
  }

  /**
   * Load sync preferences from localStorage
   */
  loadSyncPreferences() {
    try {
      const prefs = localStorage.getItem('syncPreferences');
      if (prefs) {
        const parsed = JSON.parse(prefs);
        this.syncEnabled = parsed.syncEnabled || false;
        this.lastSyncTime = parsed.lastSyncTime || null;
        this.conflictResolution = parsed.conflictResolution || 'local-first';
      }
    } catch (error) {
      console.warn('Failed to load sync preferences:', error);
    }
  }

  /**
   * Save sync preferences to localStorage
   */
  saveSyncPreferences() {
    const prefs = {
      syncEnabled: this.syncEnabled,
      lastSyncTime: this.lastSyncTime,
      conflictResolution: this.conflictResolution,
    };

    localStorage.setItem('syncPreferences', JSON.stringify(prefs));
  }

  /**
   * Enable cloud sync
   */
  async enableSync() {
    // Check if user is authenticated
    if (!window.authAPI || !window.authAPI.isLoggedIn()) {
      throw new Error('Please login to enable cloud sync');
    }

    this.syncEnabled = true;
    this.saveSyncPreferences();

    // Perform initial sync
    await this.performFullSync();
  }

  /**
   * Disable cloud sync
   */
  disableSync() {
    this.syncEnabled = false;
    this.lastSyncTime = null;
    this.saveSyncPreferences();
  }

  /**
   * Check if sync is enabled
   */
  isSyncEnabled() {
    return this.syncEnabled && window.authAPI && window.authAPI.isLoggedIn();
  }

  /**
   * Save sermon (localStorage + cloud if enabled)
   * @param {object} sermon - Sermon data
   * @returns {Promise<object>} Saved sermon
   */
  async saveSermon(sermon) {
    // Always save to localStorage first (offline-first)
    const localSermon = this.saveSermonLocal(sermon);

    // If sync is enabled, also save to cloud
    if (this.isSyncEnabled()) {
      try {
        const cloudSermon = await this.saveSermonCloud(localSermon);

        // Update local sermon with cloud ID if new
        if (cloudSermon && cloudSermon.id && !localSermon.cloudId) {
          localSermon.cloudId = cloudSermon.id;
          localSermon.lastSynced = new Date().toISOString();
          this.updateSermonLocal(localSermon);
        }

        return cloudSermon;
      } catch (error) {
        console.warn('Cloud save failed, data saved locally:', error);
        // Mark sermon as needing sync
        localSermon.needsSync = true;
        this.updateSermonLocal(localSermon);
      }
    }

    return localSermon;
  }

  /**
   * Save sermon to localStorage only
   * @private
   */
  saveSermonLocal(sermon) {
    const sermons = this.getLocalSermons();

    // Add metadata
    sermon.savedAt = sermon.savedAt || new Date().toISOString();
    sermon.lastModified = new Date().toISOString();

    sermons.push(sermon);
    localStorage.setItem('mountBuilderSermons', JSON.stringify(sermons));

    return sermon;
  }

  /**
   * Update existing sermon in localStorage
   * @private
   */
  updateSermonLocal(sermon) {
    const sermons = this.getLocalSermons();
    const index = sermons.findIndex(s => s.id === sermon.id);

    if (index !== -1) {
      sermon.lastModified = new Date().toISOString();
      sermons[index] = sermon;
      localStorage.setItem('mountBuilderSermons', JSON.stringify(sermons));
    }
  }

  /**
   * Save sermon to cloud
   * @private
   */
  async saveSermonCloud(sermon) {
    if (!window.sermonsAPI) {
      throw new Error('Sermons API not available');
    }

    // If sermon has cloudId, update existing
    if (sermon.cloudId) {
      return await window.sermonsAPI.update(sermon.cloudId, sermon);
    }

    // Otherwise create new
    return await window.sermonsAPI.create(sermon);
  }

  /**
   * Update sermon (localStorage + cloud if enabled)
   * @param {number} id - Local sermon ID
   * @param {object} updates - Updates to apply
   * @returns {Promise<object>} Updated sermon
   */
  async updateSermon(id, updates) {
    const sermons = this.getLocalSermons();
    const index = sermons.findIndex(s => s.id === id);

    if (index === -1) {
      throw new Error('Sermon not found');
    }

    // Update locally first
    const sermon = { ...sermons[index], ...updates };
    sermon.lastModified = new Date().toISOString();
    sermons[index] = sermon;
    localStorage.setItem('mountBuilderSermons', JSON.stringify(sermons));

    // If sync enabled, update cloud
    if (this.isSyncEnabled() && sermon.cloudId) {
      try {
        const cloudSermon = await window.sermonsAPI.update(sermon.cloudId, sermon);
        sermon.lastSynced = new Date().toISOString();
        sermon.needsSync = false;
        sermons[index] = sermon;
        localStorage.setItem('mountBuilderSermons', JSON.stringify(sermons));
        return cloudSermon;
      } catch (error) {
        console.warn('Cloud update failed:', error);
        sermon.needsSync = true;
        sermons[index] = sermon;
        localStorage.setItem('mountBuilderSermons', JSON.stringify(sermons));
      }
    }

    return sermon;
  }

  /**
   * Delete sermon (localStorage + cloud if enabled)
   * @param {number} id - Local sermon ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteSermon(id) {
    const sermons = this.getLocalSermons();
    const sermon = sermons.find(s => s.id === id);

    if (!sermon) {
      return false;
    }

    // Delete from cloud first if synced
    if (this.isSyncEnabled() && sermon.cloudId) {
      try {
        await window.sermonsAPI.delete(sermon.cloudId);
      } catch (error) {
        console.warn('Cloud delete failed:', error);
      }
    }

    // Delete locally
    const filtered = sermons.filter(s => s.id !== id);
    localStorage.setItem('mountBuilderSermons', JSON.stringify(filtered));

    return true;
  }

  /**
   * Get all sermons from localStorage
   */
  getLocalSermons() {
    try {
      const saved = localStorage.getItem('mountBuilderSermons');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load sermons:', error);
      return [];
    }
  }

  /**
   * Perform full sync between local and cloud
   * @returns {Promise<object>} Sync results
   */
  async performFullSync() {
    if (!this.isSyncEnabled()) {
      throw new Error('Sync is not enabled');
    }

    if (this.syncInProgress) {
      throw new Error('Sync already in progress');
    }

    this.syncInProgress = true;

    try {
      const results = {
        uploaded: 0,
        downloaded: 0,
        conflicts: 0,
        errors: 0,
      };

      // Get local sermons
      const localSermons = this.getLocalSermons();

      // Get cloud sermons (all pages)
      const cloudSermons = await this.getAllCloudSermons();

      // Create maps for easier lookup
      const localMap = new Map(localSermons.map(s => [s.cloudId, s]).filter(([id]) => id));
      const cloudMap = new Map(cloudSermons.map(s => [s.id, s]));

      // Upload sermons that don't exist in cloud or need sync
      for (const localSermon of localSermons) {
        if (!localSermon.cloudId || localSermon.needsSync) {
          try {
            const cloudSermon = await this.saveSermonCloud(localSermon);
            localSermon.cloudId = cloudSermon.id;
            localSermon.lastSynced = new Date().toISOString();
            localSermon.needsSync = false;
            this.updateSermonLocal(localSermon);
            results.uploaded++;
          } catch (error) {
            console.error('Failed to upload sermon:', error);
            results.errors++;
          }
        }
      }

      // Download sermons from cloud that don't exist locally
      for (const cloudSermon of cloudSermons) {
        const localSermon = localMap.get(cloudSermon.id);

        if (!localSermon) {
          // New sermon from cloud - download it
          const newSermon = {
            id: Date.now() + Math.random(), // Generate local ID
            cloudId: cloudSermon.id,
            ...cloudSermon,
            lastSynced: new Date().toISOString(),
            needsSync: false,
          };

          this.saveSermonLocal(newSermon);
          results.downloaded++;
        } else {
          // Sermon exists both locally and in cloud - check for conflicts
          const cloudModified = new Date(cloudSermon.updated_at || cloudSermon.created_at);
          const localModified = new Date(localSermon.lastModified || localSermon.savedAt);

          if (cloudModified > localModified) {
            // Cloud is newer - download if conflict resolution allows
            if (this.conflictResolution === 'cloud-first') {
              Object.assign(localSermon, cloudSermon);
              localSermon.lastSynced = new Date().toISOString();
              this.updateSermonLocal(localSermon);
              results.conflicts++;
            }
          }
        }
      }

      this.lastSyncTime = new Date().toISOString();
      this.saveSyncPreferences();

      return results;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Get all cloud sermons (handles pagination)
   * @private
   */
  async getAllCloudSermons() {
    const allSermons = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await window.sermonsAPI.getAll({ page, limit: 100 });
      allSermons.push(...response.sermons);

      hasMore = page < response.totalPages;
      page++;
    }

    return allSermons;
  }

  /**
   * Migrate local sermons to cloud (bulk import)
   * @returns {Promise<object>} Migration results
   */
  async migrateToCloud() {
    if (!this.isSyncEnabled()) {
      throw new Error('Please login and enable sync first');
    }

    const localSermons = this.getLocalSermons();

    // Filter sermons that aren't synced yet
    const unsyncedSermons = localSermons.filter(s => !s.cloudId);

    if (unsyncedSermons.length === 0) {
      return { migrated: 0, message: 'All sermons already synced' };
    }

    try {
      // Use bulk import API
      const cloudSermons = await window.sermonsAPI.bulkImport(unsyncedSermons);

      // Update local sermons with cloud IDs
      cloudSermons.forEach((cloudSermon, index) => {
        const localSermon = unsyncedSermons[index];
        localSermon.cloudId = cloudSermon.id;
        localSermon.lastSynced = new Date().toISOString();
        localSermon.needsSync = false;
        this.updateSermonLocal(localSermon);
      });

      this.lastSyncTime = new Date().toISOString();
      this.saveSyncPreferences();

      return {
        migrated: cloudSermons.length,
        message: `Successfully migrated ${cloudSermons.length} sermons to cloud`,
      };
    } catch (error) {
      throw new Error(`Migration failed: ${error.message}`);
    }
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    const localSermons = this.getLocalSermons();
    const needsSync = localSermons.filter(s => s.needsSync).length;
    const synced = localSermons.filter(s => s.cloudId && !s.needsSync).length;

    return {
      enabled: this.syncEnabled,
      authenticated: window.authAPI && window.authAPI.isLoggedIn(),
      lastSync: this.lastSyncTime,
      totalSermons: localSermons.length,
      synced,
      needsSync,
      inProgress: this.syncInProgress,
    };
  }
}

// Export as global singleton
window.StorageSync = StorageSync;
window.storageSync = new StorageSync();
