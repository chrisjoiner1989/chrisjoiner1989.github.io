/**
 * Sermon Templates
 * Pre-built sermon structures for common sermon types
 */

const SERMON_TEMPLATES = {
  expository: {
    id: 'expository',
    name: 'Expository (Verse-by-Verse)',
    description: 'Walk through a passage systematically, explaining each verse in context',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',
    color: '#722f37',
    bestFor: 'Deep Bible study, teaching series, systematic theology',
    sections: [
      {
        heading: 'Introduction',
        scripture: '',
        notes: 'Hook: Start with a question, story, or observation that connects to daily life.\n\nContext: Briefly explain the historical and literary context of the passage.\n\nPurpose: State what you\'ll be teaching and why it matters today.'
      },
      {
        heading: 'Historical & Cultural Context',
        scripture: '',
        notes: 'Who wrote this passage and to whom?\n\nWhat was happening historically when this was written?\n\nWhat cultural factors should we understand?\n\nHow does this fit in the larger narrative of Scripture?'
      },
      {
        heading: 'Point 1: [First Section of Passage]',
        scripture: '',
        notes: 'What does the text say? (Observation)\n\nWhat does it mean? (Interpretation)\n\nKey words or phrases to examine\n\nCross-references that illuminate meaning\n\nTheological implications'
      },
      {
        heading: 'Point 2: [Second Section of Passage]',
        scripture: '',
        notes: 'What does the text say? (Observation)\n\nWhat does it mean? (Interpretation)\n\nKey words or phrases to examine\n\nCross-references that illuminate meaning\n\nTheological implications'
      },
      {
        heading: 'Point 3: [Third Section of Passage]',
        scripture: '',
        notes: 'What does the text say? (Observation)\n\nWhat does it mean? (Interpretation)\n\nKey words or phrases to examine\n\nCross-references that illuminate meaning\n\nTheological implications'
      },
      {
        heading: 'Application: How We Live This Out',
        scripture: '',
        notes: 'What does this passage teach us about God?\n\nWhat does it teach us about ourselves?\n\nHow should we respond to this truth?\n\nWhat specific actions can we take this week?\n\nWhat behaviors or attitudes need to change?'
      },
      {
        heading: 'Conclusion & Call to Action',
        scripture: '',
        notes: 'Summarize the main points\n\nRestate the big idea in memorable terms\n\nSpecific challenge or invitation\n\nEncouragement and hope\n\nClosure with prayer or benediction'
      }
    ]
  },

  topical: {
    id: 'topical',
    name: 'Topical (Theme-Based)',
    description: 'Explore a biblical theme or topic using multiple Scripture passages',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>',
    color: '#808000',
    bestFor: 'Addressing specific issues, practical Christian living, apologetics',
    sections: [
      {
        heading: 'Introduction: Why This Topic Matters',
        scripture: '',
        notes: 'Real-life scenario or news event that highlights the topic\n\nWhy people struggle with this issue\n\nWhat\'s at stake if we ignore this?\n\nPreview: Here\'s what Scripture teaches us about this'
      },
      {
        heading: 'Biblical Foundation: What Does Scripture Say?',
        scripture: '',
        notes: 'Key passage #1: [Reference and brief explanation]\n\nKey passage #2: [Reference and brief explanation]\n\nKey passage #3: [Reference and brief explanation]\n\nSynthesis: What\'s the consistent biblical teaching?'
      },
      {
        heading: 'Truth 1: [First Biblical Principle]',
        scripture: '',
        notes: 'State the principle clearly\n\nSupporting Scripture references\n\nIllustration or example\n\nCommon misconceptions to address\n\nWhy this truth is important'
      },
      {
        heading: 'Truth 2: [Second Biblical Principle]',
        scripture: '',
        notes: 'State the principle clearly\n\nSupporting Scripture references\n\nIllustration or example\n\nCommon misconceptions to address\n\nWhy this truth is important'
      },
      {
        heading: 'Truth 3: [Third Biblical Principle]',
        scripture: '',
        notes: 'State the principle clearly\n\nSupporting Scripture references\n\nIllustration or example\n\nCommon misconceptions to address\n\nWhy this truth is important'
      },
      {
        heading: 'Application: Living It Out',
        scripture: '',
        notes: 'At home: How does this apply to family life?\n\nAt work: How does this shape our professional conduct?\n\nIn relationships: How should this affect how we treat others?\n\nIn private: What personal habits or thoughts need to change?'
      },
      {
        heading: 'Conclusion: Take Action',
        scripture: '',
        notes: 'Recap the main truths\n\nOne clear action step everyone can take\n\nAddress potential obstacles\n\nEncouragement: God gives grace to obey\n\nInvitation to respond (prayer, commitment, next steps)'
      }
    ]
  },

  narrative: {
    id: 'narrative',
    name: 'Narrative (Story-Based)',
    description: 'Tell a biblical story and draw out timeless truths and applications',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
    color: '#2c5f2d',
    bestFor: 'Gospel stories, Old Testament narratives, evangelistic messages',
    sections: [
      {
        heading: 'Introduction: Setting the Scene',
        scripture: '',
        notes: 'Paint the picture: Where are we? When is this happening?\n\nIntroduce the characters: Who are the main people in this story?\n\nSet up the tension: What problem or conflict exists?\n\nConnect to us: How is this like situations we face today?'
      },
      {
        heading: 'The Story Begins: Initial Situation',
        scripture: '',
        notes: 'What\'s the status quo at the start?\n\nWhat are the characters thinking/feeling?\n\nWhat expectations do they have?\n\nWhat cultural/historical details help us understand this?\n\nHow does this mirror our own experience?'
      },
      {
        heading: 'The Conflict: Rising Tension',
        scripture: '',
        notes: 'What challenge or crisis emerges?\n\nHow do the characters respond (faith, doubt, fear)?\n\nWhat choices do they face?\n\nWhere is God in this situation?\n\nWhat spiritual truths are being revealed?'
      },
      {
        heading: 'The Turning Point: God\'s Intervention',
        scripture: '',
        notes: 'How does God show up in the story?\n\nWhat surprising thing happens?\n\nHow do characters respond to God\'s action?\n\nWhat does this reveal about God\'s character?\n\nWhat does this reveal about human nature?'
      },
      {
        heading: 'The Resolution: Outcome and Transformation',
        scripture: '',
        notes: 'How is the conflict resolved?\n\nHow are the characters changed?\n\nWhat do they learn about God?\n\nWhat do they learn about themselves?\n\nWhat new reality emerges from this story?'
      },
      {
        heading: 'Our Story Today: Making It Personal',
        scripture: '',
        notes: 'Where are you in this story right now?\n\nWhich character do you identify with most?\n\nWhat similar challenges do we face?\n\nHow is God inviting you to trust Him?\n\nWhat would faith look like in your situation?'
      },
      {
        heading: 'Conclusion: Living in God\'s Story',
        scripture: '',
        notes: 'The big truth this story teaches us\n\nHow this fits into the larger story of Scripture\n\nHow Jesus fulfills or completes this story\n\nSpecific ways to respond in faith this week\n\nHope and encouragement from this truth'
      }
    ]
  },

  basicThreePoint: {
    id: 'basicThreePoint',
    name: 'Classic Three-Point',
    description: 'Traditional three-point sermon structure - simple and effective',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>',
    color: '#4a5568',
    bestFor: 'First-time preachers, short messages, clear communication',
    sections: [
      {
        heading: 'Introduction',
        scripture: '',
        notes: 'Attention-getter (story, question, statistic)\n\nIntroduce the topic\n\nRead the main Scripture passage\n\nTransition: Today we\'re going to see three things...'
      },
      {
        heading: 'Point 1: [First Main Idea]',
        scripture: '',
        notes: 'State the point clearly and memorably\n\nSupporting Scripture\n\nExplanation: What does this mean?\n\nIllustration: Story or example\n\nApplication: So what? How should we respond?'
      },
      {
        heading: 'Point 2: [Second Main Idea]',
        scripture: '',
        notes: 'State the point clearly and memorably\n\nSupporting Scripture\n\nExplanation: What does this mean?\n\nIllustration: Story or example\n\nApplication: So what? How should we respond?'
      },
      {
        heading: 'Point 3: [Third Main Idea]',
        scripture: '',
        notes: 'State the point clearly and memorably\n\nSupporting Scripture\n\nExplanation: What does this mean?\n\nIllustration: Story or example\n\nApplication: So what? How should we respond?'
      },
      {
        heading: 'Conclusion',
        scripture: '',
        notes: 'Review the three main points\n\nRestate the big idea\n\nFinal illustration or challenge\n\nCall to action\n\nClosing prayer or invitation'
      }
    ]
  }
};

/**
 * Get all available templates
 */
function getSermonTemplates() {
  return Object.values(SERMON_TEMPLATES);
}

/**
 * Get specific template by ID
 */
function getTemplateById(templateId) {
  return SERMON_TEMPLATES[templateId] || null;
}

/**
 * Apply template to sermon builder
 */
function applyTemplate(templateId) {
  const template = getTemplateById(templateId);

  if (!template) {
    console.error('Template not found:', templateId);
    return false;
  }

  // Check if sermon builder is available
  if (!window.sermonBuilder) {
    console.error('Sermon builder not initialized');
    return false;
  }

  // Clear existing sections
  window.sermonBuilder.clearAllSections();

  // Add template sections
  template.sections.forEach((section, index) => {
    // Create section
    const sectionData = {
      heading: section.heading,
      scripture: section.scripture,
      notes: section.notes
    };

    // Add to sermon builder
    window.sermonBuilder.addSection(sectionData);
  });

  // Show success message
  if (window.sermonBuilder.showNotification) {
    window.sermonBuilder.showNotification(`${template.name} template applied!`);
  } else {
    console.log(`✓ ${template.name} template applied with ${template.sections.length} sections`);
  }

  // Track template usage
  if (window.performanceMonitor) {
    window.performanceMonitor.trackEvent('template_applied', {
      templateId: template.id,
      templateName: template.name,
      sectionCount: template.sections.length
    });
  }

  return true;
}

/**
 * Show template picker modal
 */
function showTemplatePicker() {
  const modal = document.getElementById('template-picker-modal');

  if (!modal) {
    console.error('Template picker modal not found');
    return;
  }

  // Populate template cards if not already done
  const container = modal.querySelector('.template-cards');
  if (container && container.children.length === 0) {
    populateTemplateCards();
  }

  // Show modal
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

/**
 * Hide template picker modal
 */
function hideTemplatePicker() {
  const modal = document.getElementById('template-picker-modal');

  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

/**
 * Populate template cards in modal
 */
function populateTemplateCards() {
  const container = document.querySelector('.template-cards');

  if (!container) return;

  const templates = getSermonTemplates();

  container.innerHTML = templates.map(template => `
    <div class="template-card" data-template-id="${template.id}" style="border-color: ${template.color}">
      <div class="template-icon" style="background-color: ${template.color}">${template.icon}</div>
      <h3 class="template-name">${template.name}</h3>
      <p class="template-description">${template.description}</p>
      <div class="template-meta">
        <span class="template-sections">${template.sections.length} sections</span>
        <span class="template-best-for">Best for: ${template.bestFor}</span>
      </div>
      <button class="template-select-btn" onclick="selectTemplate('${template.id}')">
        Use This Template
      </button>
      <button class="template-preview-btn" onclick="previewTemplate('${template.id}')">
        Preview Structure
      </button>
    </div>
  `).join('');
}

/**
 * Select and apply template
 */
function selectTemplate(templateId) {
  // Confirm if there's existing content
  const existingSections = document.querySelectorAll('.sermon-section');

  if (existingSections.length > 0) {
    if (!confirm('This will replace your current sermon outline. Continue?')) {
      return;
    }
  }

  // Apply template
  const success = applyTemplate(templateId);

  if (success) {
    hideTemplatePicker();

    // Scroll to first section
    setTimeout(() => {
      const firstSection = document.querySelector('.sermon-section');
      if (firstSection) {
        firstSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  }
}

/**
 * Preview template structure
 */
function previewTemplate(templateId) {
  const template = getTemplateById(templateId);

  if (!template) return;

  const previewHTML = `
    <div class="template-preview">
      <div class="template-preview-header">
        <h2>${template.icon} ${template.name}</h2>
        <p>${template.description}</p>
      </div>
      <div class="template-preview-sections">
        ${template.sections.map((section, index) => `
          <div class="preview-section">
            <div class="preview-section-number">${index + 1}</div>
            <div class="preview-section-content">
              <h4>${section.heading}</h4>
              <p>${section.notes.split('\n')[0]}</p>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="template-preview-actions">
        <button onclick="closePreview()" class="btn-secondary">Close</button>
        <button onclick="selectTemplate('${templateId}')" class="btn-primary">Use This Template</button>
      </div>
    </div>
  `;

  // Create preview overlay
  const overlay = document.createElement('div');
  overlay.id = 'template-preview-overlay';
  overlay.className = 'template-preview-overlay';
  overlay.innerHTML = previewHTML;

  document.body.appendChild(overlay);

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closePreview();
    }
  });
}

/**
 * Close template preview
 */
function closePreview() {
  const overlay = document.getElementById('template-preview-overlay');
  if (overlay) {
    overlay.remove();
  }
}

// Initialize template picker when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeTemplatePicker);
} else {
  initializeTemplatePicker();
}

function initializeTemplatePicker() {
  // Add event listener to "Use Template" button if it exists
  const useTemplateBtn = document.getElementById('use-template-btn');
  if (useTemplateBtn) {
    useTemplateBtn.addEventListener('click', showTemplatePicker);
  }

  // Close modal on backdrop click
  const modal = document.getElementById('template-picker-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        hideTemplatePicker();
      }
    });
  }

  // Close modal on close button
  const closeBtn = document.querySelector('.template-modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', hideTemplatePicker);
  }

  // Escape key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideTemplatePicker();
      closePreview();
    }
  });
}

// Export for global use
window.sermonTemplates = {
  getTemplates: getSermonTemplates,
  getTemplate: getTemplateById,
  applyTemplate: applyTemplate,
  showPicker: showTemplatePicker,
  hidePicker: hideTemplatePicker
};
