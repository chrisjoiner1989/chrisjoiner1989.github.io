/**
 * Tag UI Handler
 * Manages the tag input interface and interactions
 */

// Current sermon tags (temp storage before save)
let currentSermonTags = [];

/**
 * Initialize tag input functionality
 */
function initializeTagUI() {
  const tagsInput = document.getElementById('tags-input');
  const tagsSuggestions = document.getElementById('tag-suggestions');
  const presetTagsBtn = document.getElementById('show-preset-tags');

  if (!tagsInput) return;

  // Handle tag input
  tagsInput.addEventListener('keydown', handleTagInput);
  tagsInput.addEventListener('input', handleTagAutocomplete);
  tagsInput.addEventListener('blur', () => {
    // Hide suggestions after a delay to allow click events
    setTimeout(() => {
      if (tagsSuggestions) tagsSuggestions.style.display = 'none';
    }, 200);
  });

  // Handle preset tags button
  if (presetTagsBtn) {
    presetTagsBtn.addEventListener('click', showPresetTagsModal);
  }

  // Load existing tags if editing sermon
  loadExistingTags();
}

/**
 * Handle tag input - add tags on Enter or comma
 */
function handleTagInput(e) {
  const input = e.target;
  const value = input.value.trim();

  // Add tag on Enter or comma
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();

    if (value && value !== ',') {
      addTag(value.replace(',', ''));
      input.value = '';

      // Hide suggestions
      const tagsSuggestions = document.getElementById('tag-suggestions');
      if (tagsSuggestions) tagsSuggestions.style.display = 'none';
    }
  }

  // Remove last tag on Backspace if input is empty
  if (e.key === 'Backspace' && !value && currentSermonTags.length > 0) {
    removeTag(currentSermonTags[currentSermonTags.length - 1]);
  }
}

/**
 * Handle tag autocomplete suggestions
 */
function handleTagAutocomplete(e) {
  const input = e.target;
  const value = input.value.trim();
  const tagsSuggestions = document.getElementById('tag-suggestions');

  if (!tagsSuggestions || !window.tagSystem) return;

  if (value.length < 2) {
    tagsSuggestions.style.display = 'none';
    return;
  }

  // Get suggestions
  const suggestions = window.tagSystem.getSuggestions(sermons || [], value);

  if (suggestions.length === 0) {
    tagsSuggestions.style.display = 'none';
    return;
  }

  // Display suggestions
  tagsSuggestions.innerHTML = suggestions
    .map(tag => `<div class="tag-suggestion-item" data-tag="${tag}">${tag}</div>`)
    .join('');

  tagsSuggestions.style.display = 'block';

  // Add click handlers to suggestions
  tagsSuggestions.querySelectorAll('.tag-suggestion-item').forEach(item => {
    item.addEventListener('click', function() {
      const tag = this.getAttribute('data-tag');
      addTag(tag);
      input.value = '';
      tagsSuggestions.style.display = 'none';
      input.focus();
    });
  });
}

/**
 * Add a tag to the current sermon
 */
function addTag(tagText) {
  if (!window.tagSystem) return;

  const normalized = window.tagSystem.normalizeTag(tagText);

  // Don't add duplicates or empty tags
  if (!normalized || currentSermonTags.includes(normalized)) {
    return;
  }

  currentSermonTags.push(normalized);
  renderTags();
}

/**
 * Remove a tag from the current sermon
 */
function removeTag(tagText) {
  currentSermonTags = currentSermonTags.filter(tag => tag !== tagText);
  renderTags();
}

/**
 * Render tags in the display area
 */
function renderTags() {
  const tagsDisplay = document.getElementById('tags-display');
  if (!tagsDisplay) return;

  if (currentSermonTags.length === 0) {
    tagsDisplay.innerHTML = '<span class="no-tags-message">No tags added yet</span>';
    return;
  }

  tagsDisplay.innerHTML = currentSermonTags
    .map((tag, index) => {
      const color = window.tagSystem ? window.tagSystem.getTagColor(tag, index) : '#722f37';
      return `
        <span class="tag-chip" style="background-color: ${color}">
          ${tag}
          <button type="button" class="tag-remove" data-tag="${tag}" aria-label="Remove tag ${tag}">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </span>
      `;
    })
    .join('');

  // Add click handlers to remove buttons
  tagsDisplay.querySelectorAll('.tag-remove').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const tag = this.getAttribute('data-tag');
      removeTag(tag);
    });
  });
}

/**
 * Show preset tags modal
 */
function showPresetTagsModal() {
  if (!window.tagSystem) return;

  const modal = document.createElement('div');
  modal.className = 'tag-preset-modal';
  modal.innerHTML = `
    <div class="tag-preset-content">
      <div class="tag-preset-header">
        <h3>Browse Preset Tags</h3>
        <button class="close-modal" aria-label="Close">&times;</button>
      </div>
      <div class="tag-preset-body">
        ${renderPresetCategories()}
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Close button
  modal.querySelector('.close-modal').addEventListener('click', () => {
    modal.remove();
  });

  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });

  // Add tag click handlers
  modal.querySelectorAll('.preset-tag').forEach(btn => {
    btn.addEventListener('click', function() {
      const tag = this.getAttribute('data-tag');
      addTag(tag);
    });
  });
}

/**
 * Render preset tag categories
 */
function renderPresetCategories() {
  if (!window.tagSystem) return '';

  const presets = window.tagSystem.presetTags;
  const categories = [
    { key: 'topics', label: 'Topics', icon: '📖' },
    { key: 'audience', label: 'Audience', icon: '👥' },
    { key: 'format', label: 'Format', icon: '🎤' },
    { key: 'seasons', label: 'Seasons', icon: '📅' },
    { key: 'themes', label: 'Themes', icon: '✨' }
  ];

  return categories.map(({ key, label, icon }) => `
    <div class="preset-category">
      <h4>${icon} ${label}</h4>
      <div class="preset-tags-grid">
        ${presets[key].map(tag => `
          <button type="button" class="preset-tag" data-tag="${tag}">${tag}</button>
        `).join('')}
      </div>
    </div>
  `).join('');
}

/**
 * Load existing tags when editing a sermon
 */
function loadExistingTags() {
  const editingSermon = localStorage.getItem('editingSermon');
  if (editingSermon) {
    try {
      const sermon = JSON.parse(editingSermon);
      if (sermon.tags && Array.isArray(sermon.tags)) {
        currentSermonTags = [...sermon.tags];
        renderTags();
      }
    } catch (e) {
      console.error('Error loading existing tags:', e);
    }
  }
}

/**
 * Get current tags for saving
 */
function getCurrentTags() {
  return currentSermonTags;
}

/**
 * Clear all tags
 */
function clearTags() {
  currentSermonTags = [];
  renderTags();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeTagUI);

// Make functions available globally
window.getCurrentTags = getCurrentTags;
window.clearTags = clearTags;
window.addTag = addTag;
