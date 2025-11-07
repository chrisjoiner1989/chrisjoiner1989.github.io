/**
 * Sermon Builder Module
 * Handles sermon outline creation with dynamic sections
 */

class SermonBuilder {
  constructor() {
    this.sections = [];
    this.currentSermon = null;
    this.init();
  }

  /**
   * Initialize the sermon builder
   */
  init() {
    this.setupEventListeners();
    this.loadLastSermon();
  }

  /**
   * Set up all event listeners for the builder
   */
  setupEventListeners() {
    // Add section button
    const addSectionBtn = document.getElementById('add-section-btn');
    if (addSectionBtn) {
      addSectionBtn.addEventListener('click', () => this.addSection());
    }

    // Save sermon button
    const saveSermonBtn = document.getElementById('save-sermon-btn');
    if (saveSermonBtn) {
      saveSermonBtn.addEventListener('click', () => this.saveSermon());
    }

    // Start preaching mode button
    const startPreachingBtn = document.getElementById('start-preaching-btn');
    if (startPreachingBtn) {
      startPreachingBtn.addEventListener('click', () => this.startPreachingMode());
    }
  }

  /**
   * Add a new section to the sermon outline
   * @param {Object} sectionData - Optional data to populate the section
   */
  addSection(sectionData = null) {
    const sectionsContainer = document.getElementById('sermon-sections');
    if (!sectionsContainer) return;

    // Create unique ID for this section
    const sectionId = sectionData?.id || `section-${Date.now()}`;

    // Create section element
    const sectionElement = document.createElement('div');
    sectionElement.className = 'sermon-section';
    sectionElement.setAttribute('data-section-id', sectionId);
    sectionElement.setAttribute('role', 'region');
    sectionElement.setAttribute('aria-label', 'Sermon section');

    // Build section HTML
    sectionElement.innerHTML = `
      <div class="section-header">
        <span class="section-number">${this.sections.length + 1}</span>
        <button type="button" class="delete-section-btn" aria-label="Delete section" title="Delete section">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>

      <div class="section-content">
        <div class="input-group">
          <label for="section-heading-${sectionId}">Section Heading:</label>
          <input
            type="text"
            id="section-heading-${sectionId}"
            class="section-heading"
            placeholder="e.g., Introduction, Main Point 1, Conclusion"
            value="${sectionData?.heading || ''}"
            required
            aria-required="true"
          />
        </div>

        <div class="input-group">
          <label for="section-scripture-${sectionId}">Scripture Reference:</label>
          <input
            type="text"
            id="section-scripture-${sectionId}"
            class="section-scripture"
            placeholder="e.g., Matthew 5:1-12"
            value="${sectionData?.scripture || ''}"
          />
        </div>

        <div class="input-group">
          <label for="section-notes-${sectionId}">Notes:</label>
          <textarea
            id="section-notes-${sectionId}"
            class="section-notes"
            rows="6"
            placeholder="Add your sermon notes for this section..."
            aria-label="Section notes"
          >${sectionData?.notes || ''}</textarea>
        </div>
      </div>
    `;

    // Add to container
    sectionsContainer.appendChild(sectionElement);

    // Add to sections array
    this.sections.push({
      id: sectionId,
      element: sectionElement
    });

    // Set up delete button
    const deleteBtn = sectionElement.querySelector('.delete-section-btn');
    deleteBtn.addEventListener('click', () => this.deleteSection(sectionId));

    // Focus on the heading input for better UX
    const headingInput = sectionElement.querySelector('.section-heading');
    headingInput.focus();

    // Update section numbers
    this.updateSectionNumbers();

    // Auto-save on input
    this.setupAutoSave(sectionElement);
  }

  /**
   * Delete a section from the outline
   * @param {string} sectionId - ID of the section to delete
   */
  deleteSection(sectionId) {
    const sectionIndex = this.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) return;

    // Confirm deletion
    if (!confirm('Are you sure you want to delete this section?')) return;

    // Remove from DOM
    const section = this.sections[sectionIndex];
    section.element.remove();

    // Remove from array
    this.sections.splice(sectionIndex, 1);

    // Update section numbers
    this.updateSectionNumbers();

    // Auto-save
    this.saveSermon(true);
  }

  /**
   * Update section numbers after add/delete
   */
  updateSectionNumbers() {
    const numberElements = document.querySelectorAll('.section-number');
    numberElements.forEach((el, index) => {
      el.textContent = index + 1;
    });
  }

  /**
   * Set up auto-save for a section
   * @param {HTMLElement} sectionElement - The section element
   */
  setupAutoSave(sectionElement) {
    const inputs = sectionElement.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        // Debounce auto-save
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
          this.saveSermon(true);
        }, 1000);
      });
    });
  }

  /**
   * Collect all sermon data from the form
   * @returns {Object} Sermon data object
   */
  collectSermonData() {
    const titleInput = document.getElementById('title');
    const dateInput = document.getElementById('date');
    const speakerInput = document.getElementById('speaker');
    const seriesInput = document.getElementById('series');
    const referenceInput = document.getElementById('reference');
    const notesInput = document.getElementById('notes');

    // Collect sections data
    const sectionsData = [];
    const sectionElements = document.querySelectorAll('.sermon-section');

    sectionElements.forEach(section => {
      const sectionId = section.getAttribute('data-section-id');
      const heading = section.querySelector('.section-heading')?.value || '';
      const scripture = section.querySelector('.section-scripture')?.value || '';
      const notes = section.querySelector('.section-notes')?.value || '';

      sectionsData.push({
        id: sectionId,
        heading,
        scripture,
        notes
      });
    });

    return {
      title: titleInput?.value || '',
      date: dateInput?.value || '',
      speaker: speakerInput?.value || '',
      series: seriesInput?.value || '',
      reference: referenceInput?.value || '',
      notes: notesInput?.value || '',
      sections: sectionsData,
      lastModified: new Date().toISOString()
    };
  }

  /**
   * Save sermon to localStorage
   * @param {boolean} silent - If true, don't show success message
   */
  saveSermon(silent = false) {
    const sermonData = this.collectSermonData();

    // Validate required fields
    if (!sermonData.title) {
      alert('Please enter a sermon title before saving.');
      return;
    }

    // Save to localStorage
    try {
      localStorage.setItem('currentSermon', JSON.stringify(sermonData));

      // Also save to sermons list
      this.saveToSermonsList(sermonData);

      this.currentSermon = sermonData;

      if (!silent) {
        this.showNotification('Sermon saved successfully!');
      }
    } catch (error) {
      console.error('Error saving sermon:', error);
      alert('Failed to save sermon. Please try again.');
    }
  }

  /**
   * Save sermon to the sermons list
   * @param {Object} sermonData - Sermon data to save
   */
  saveToSermonsList(sermonData) {
    let sermonsList = [];
    try {
      const stored = localStorage.getItem('sermonsList');
      if (stored) {
        sermonsList = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading sermons list:', error);
    }

    // Check if sermon already exists (by title and date)
    const existingIndex = sermonsList.findIndex(
      s => s.title === sermonData.title && s.date === sermonData.date
    );

    if (existingIndex !== -1) {
      // Update existing sermon
      sermonsList[existingIndex] = sermonData;
    } else {
      // Add new sermon
      sermonsList.unshift(sermonData);
    }

    // Keep only last 50 sermons
    if (sermonsList.length > 50) {
      sermonsList = sermonsList.slice(0, 50);
    }

    localStorage.setItem('sermonsList', JSON.stringify(sermonsList));
  }

  /**
   * Load the last saved sermon
   */
  loadLastSermon() {
    try {
      const stored = localStorage.getItem('currentSermon');
      if (!stored) return;

      const sermonData = JSON.parse(stored);
      this.currentSermon = sermonData;

      // Populate form fields
      const titleInput = document.getElementById('title');
      const dateInput = document.getElementById('date');
      const speakerInput = document.getElementById('speaker');
      const seriesInput = document.getElementById('series');
      const referenceInput = document.getElementById('reference');
      const notesInput = document.getElementById('notes');

      if (titleInput) titleInput.value = sermonData.title || '';
      if (dateInput) dateInput.value = sermonData.date || '';
      if (speakerInput) speakerInput.value = sermonData.speaker || '';
      if (seriesInput) seriesInput.value = sermonData.series || '';
      if (referenceInput) referenceInput.value = sermonData.reference || '';
      if (notesInput) notesInput.value = sermonData.notes || '';

      // Load sections
      if (sermonData.sections && sermonData.sections.length > 0) {
        sermonData.sections.forEach(sectionData => {
          this.addSection(sectionData);
        });
      }
    } catch (error) {
      console.error('Error loading sermon:', error);
    }
  }

  /**
   * Start preaching mode with current sermon
   */
  startPreachingMode() {
    // Save current state first
    this.saveSermon(true);

    if (!this.currentSermon) {
      alert('Please save your sermon before starting preaching mode.');
      return;
    }

    // Navigate to preaching mode
    window.location.href = 'preaching-mode.html';
  }

  /**
   * Show notification message
   * @param {string} message - Message to display
   */
  showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.textContent = message;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Initialize sermon builder when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.sermonBuilder = new SermonBuilder();
});
