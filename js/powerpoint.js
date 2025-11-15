// PowerPoint generation functionality for Mount Builder
// Converts pastor notes into beautiful faith-based presentations

// Faith-based color schemes
const FAITH_THEMES = {
  classic: {
    primary: '#722f37',      // Deep burgundy
    secondary: '#d4af37',    // Gold
    accent: '#ffffff',       // White
    text: '#333333',         // Dark gray
    background: '#f8f8f8'    // Light gray
  },
  peaceful: {
    primary: '#4a6741',      // Forest green
    secondary: '#8fbc8f',    // Light sea green
    accent: '#ffffff',       // White
    text: '#2f4f2f',         // Dark green
    background: '#f0fff0'    // Honeydew
  },
  hope: {
    primary: '#8B4049',      // Biblical red
    secondary: '#D4A574',    // Biblical gold
    accent: '#ffffff',       // White
    text: '#2C1810',         // Dark brown
    background: '#FAF8F5'    // Parchment
  }
};

// Initialize PowerPoint generation when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const powerpointBtn = document.querySelector('.powerpoint-btn');
  if (powerpointBtn) {
    powerpointBtn.addEventListener('click', generatePowerPoint);
  }
});

// Main function to generate PowerPoint presentation
function generatePowerPoint() {
  try {
    // Get sermon data from form
    const sermonData = getSermonData();
    
    if (!sermonData.notes || sermonData.notes.trim() === '') {
      alert('Please enter sermon notes before generating PowerPoint.');
      return;
    }
    
    // Show loading state
    showLoadingState(true);
    
    // Process notes and create presentation
    const processedNotes = processSermonNotes(sermonData.notes);
    createPowerPointPresentation(sermonData, processedNotes);
    
  } catch (error) {
    console.error('Error generating PowerPoint:', error);
    alert('An error occurred while generating the PowerPoint. Please try again.');
  } finally {
    showLoadingState(false);
  }
}

// Get sermon data from form
function getSermonData() {
  return {
    title: document.getElementById('title')?.value || 'Untitled Sermon',
    speaker: document.getElementById('speaker')?.value || 'Pastor',
    date: document.getElementById('date')?.value || new Date().toISOString().split('T')[0],
    series: document.getElementById('series')?.value || '',
    reference: document.getElementById('reference')?.value || '',
    notes: document.getElementById('notes')?.value || ''
  };
}

// Process sermon notes into structured content
function processSermonNotes(notes) {
  const lines = notes.split('\n').filter(line => line.trim() !== '');
  const slides = [];
  let currentSlide = null;
  
  for (let line of lines) {
    const trimmedLine = line.trim();
    
    // Check if line is a main point (starts with number, letter, or special markers)
    if (isMainPoint(trimmedLine)) {
      // Save previous slide if exists
      if (currentSlide) {
        slides.push(currentSlide);
      }
      
      // Start new slide
      currentSlide = {
        title: cleanMainPoint(trimmedLine),
        content: [],
        type: 'point'
      };
    } else if (isSubPoint(trimmedLine)) {
      // Add as sub-point
      if (currentSlide) {
        currentSlide.content.push({
          type: 'bullet',
          text: cleanSubPoint(trimmedLine)
        });
      }
    } else if (isScriptureReference(trimmedLine)) {
      // Add as scripture
      if (currentSlide) {
        currentSlide.content.push({
          type: 'scripture',
          text: trimmedLine
        });
      }
    } else if (trimmedLine.length > 0) {
      // Regular content
      if (currentSlide) {
        currentSlide.content.push({
          type: 'text',
          text: trimmedLine
        });
      } else {
        // Create intro slide if no current slide
        currentSlide = {
          title: 'Introduction',
          content: [{
            type: 'text',
            text: trimmedLine
          }],
          type: 'intro'
        };
      }
    }
  }
  
  // Add final slide
  if (currentSlide) {
    slides.push(currentSlide);
  }
  
  return slides;
}

// Check if line is a main point
function isMainPoint(line) {
  // Patterns for main points
  const patterns = [
    /^\d+\./,           // "1.", "2.", etc.
    /^[A-Z]\./,         // "A.", "B.", etc.
    /^[IVX]+\./,        // Roman numerals
    /^-\s*[A-Z]/,       // "- Main point"
    /^\*\s*[A-Z]/,      // "* Main point"
    /^#{1,3}\s/,        // Markdown headers
    /^[A-Z][^a-z]*:/    // "MAIN POINT:"
  ];
  
  return patterns.some(pattern => pattern.test(line));
}

// Check if line is a sub-point
function isSubPoint(line) {
  const patterns = [
    /^\s*-\s/,          // Indented dash
    /^\s*\*\s/,         // Indented asterisk
    /^\s*•\s/,          // Bullet point
    /^\s*[a-z]\./,      // "a.", "b.", etc.
    /^\s*\d+\)/         // "1)", "2)", etc.
  ];
  
  return patterns.some(pattern => pattern.test(line));
}

// Check if line contains scripture reference
function isScriptureReference(line) {
  const bibleBooks = [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
    'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
    'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', 'Corinthians',
    'Galatians', 'Ephesians', 'Philippians', 'Colossians', 'Thessalonians',
    'Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', 'Peter', 'Jude', 'Revelation'
  ];
  
  return bibleBooks.some(book => 
    line.includes(book) && /\d+:\d+/.test(line)
  );
}

// Clean main point text
function cleanMainPoint(text) {
  return text.replace(/^[\d\w\.\-\*#\s]+/, '').trim();
}

// Clean sub-point text
function cleanSubPoint(text) {
  return text.replace(/^\s*[\-\*•\w\.\)]+\s*/, '').trim();
}

// Create the PowerPoint presentation
function createPowerPointPresentation(sermonData, slides) {
  // Initialize PptxGenJS - try different approaches for compatibility
  let pptx;
  if (typeof PptxGenJS !== 'undefined') {
    pptx = new PptxGenJS();
  } else if (typeof window.PptxGenJS !== 'undefined') {
    pptx = new window.PptxGenJS();
  } else if (typeof pptxgen !== 'undefined') {
    pptx = new pptxgen();
  } else {
    throw new Error('PptxGenJS library not loaded properly');
  }
  const theme = FAITH_THEMES.classic; // Default theme
  
  // Set presentation properties
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = sermonData.speaker;
  pptx.company = 'Mount Builder';
  pptx.title = sermonData.title;
  
  // Create title slide
  createTitleSlide(pptx, sermonData, theme);
  
  // Create content slides
  slides.forEach((slide, slideIndex) => {
    createContentSlide(pptx, slide, theme, slideIndex + 2);
  });
  
  // Create closing slide
  createClosingSlide(pptx, theme);
  
  // Generate filename
  const filename = `${sermonData.title.replace(/[^a-zA-Z0-9]/g, '_')}_Presentation.pptx`;
  
  // Save the presentation
  pptx.writeFile(filename);
  
  // Show success message
  setTimeout(() => {
    alert(`PowerPoint presentation "${filename}" has been generated and downloaded!`);
  }, 1000);
}

// Create title slide
function createTitleSlide(pptx, sermonData, theme) {
  const slide = pptx.addSlide();
  
  // Background
  slide.background = { color: theme.background };
  
  // Title
  slide.addText(sermonData.title, {
    x: 0.5,
    y: 2,
    w: 8.5,
    h: 1.5,
    fontSize: 36,
    fontFace: 'Georgia, Times New Roman, serif',
    color: theme.primary,
    bold: true,
    align: 'center'
  });
  
  // Scripture reference (if provided)
  if (sermonData.reference) {
    slide.addText(sermonData.reference, {
      x: 0.5,
      y: 3.8,
      w: 8.5,
      h: 0.8,
      fontSize: 20,
      fontFace: 'Georgia, Times New Roman, serif',
      color: theme.secondary,
      italic: true,
      align: 'center'
    });
  }
  
  // Speaker and date
  const speakerDate = `${sermonData.speaker} • ${formatDateForSlide(sermonData.date)}`;
  slide.addText(speakerDate, {
    x: 0.5,
    y: 6,
    w: 8.5,
    h: 0.6,
    fontSize: 16,
    color: theme.text,
    align: 'center'
  });
  
  // Series (if provided)
  if (sermonData.series) {
    slide.addText(`Part of the "${sermonData.series}" series`, {
      x: 0.5,
      y: 6.8,
      w: 8.5,
      h: 0.5,
      fontSize: 14,
      color: theme.text,
      italic: true,
      align: 'center'
    });
  }
  
  // Decorative cross symbol
  slide.addText('✝', {
    x: 4.25,
    y: 1,
    w: 0.5,
    h: 0.5,
    fontSize: 28,
    color: theme.secondary,
    align: 'center'
  });
}

// Create content slide
function createContentSlide(pptx, slideContent, theme, slideNumber) {
  const slide = pptx.addSlide();
  
  // Background
  slide.background = { color: theme.background };
  
  // Title
  slide.addText(slideContent.title, {
    x: 0.5,
    y: 0.5,
    w: 8.5,
    h: 1,
    fontSize: 28,
    fontFace: 'Georgia, Times New Roman, serif',
    color: theme.primary,
    bold: true
  });
  
  // Content
  let yPosition = 1.8;
  const lineHeight = 0.6;
  
  slideContent.content.forEach((item) => {
    if (yPosition > 6.5) return; // Don't overflow slide
    
    switch (item.type) {
      case 'bullet':
        slide.addText(`• ${item.text}`, {
          x: 1,
          y: yPosition,
          w: 7.5,
          h: lineHeight,
          fontSize: 18,
          color: theme.text
        });
        break;
        
      case 'scripture':
        slide.addText(item.text, {
          x: 1,
          y: yPosition,
          w: 7.5,
          h: lineHeight,
          fontSize: 16,
          color: theme.secondary,
          italic: true,
          fontFace: 'Georgia, Times New Roman, serif'
        });
        break;
        
      case 'text':
      default:
        slide.addText(item.text, {
          x: 1,
          y: yPosition,
          w: 7.5,
          h: lineHeight,
          fontSize: 16,
          color: theme.text
        });
        break;
    }
    
    yPosition += lineHeight + 0.1;
  });
  
  // Slide number
  slide.addText(`${slideNumber}`, {
    x: 8.5,
    y: 7,
    w: 0.5,
    h: 0.3,
    fontSize: 12,
    color: theme.text,
    align: 'center'
  });
}

// Create closing slide
function createClosingSlide(pptx, theme) {
  const slide = pptx.addSlide();
  
  // Background
  slide.background = { color: theme.background };
  
  // Thank you message
  slide.addText('Thank You', {
    x: 0.5,
    y: 2.5,
    w: 8.5,
    h: 1.2,
    fontSize: 40,
    fontFace: 'Georgia, Times New Roman, serif',
    color: theme.primary,
    bold: true,
    align: 'center'
  });
  
  // Blessing
  slide.addText('May God bless you and keep you', {
    x: 0.5,
    y: 4,
    w: 8.5,
    h: 0.8,
    fontSize: 20,
    fontFace: 'Georgia, Times New Roman, serif',
    color: theme.secondary,
    italic: true,
    align: 'center'
  });
  
  // Cross symbol
  slide.addText('✝', {
    x: 4.25,
    y: 5.5,
    w: 0.5,
    h: 0.5,
    fontSize: 32,
    color: theme.secondary,
    align: 'center'
  });
}

// Format date for slide display
function formatDateForSlide(dateStr) {
  if (!dateStr) return new Date().toLocaleDateString();
  
  const date = new Date(dateStr);
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return date.toLocaleDateString('en-US', options);
}

// Show/hide loading state
function showLoadingState(show) {
  const btn = document.querySelector('.powerpoint-btn');
  if (!btn) return;
  
  if (show) {
    btn.textContent = 'Generating...';
    btn.disabled = true;
    btn.style.opacity = '0.6';
  } else {
    btn.textContent = 'Generate PowerPoint';
    btn.disabled = false;
    btn.style.opacity = '1';
  }
}