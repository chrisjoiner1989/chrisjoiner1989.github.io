/* ========================================
   YouVersion-Style Bible Reader UI
   Interactive features for verse selection,
   highlighting, copying, and sharing
   ======================================== */

// State management
let selectedVerse = null;
let highlightedVerses = new Set();

// Initialize Bible Reader UI
function initializeBibleReaderUI() {
  console.log("Initializing YouVersion-style Bible Reader UI...");

  // Modal controls
  setupModalControls();

  // Book/Chapter selector
  setupBookChapterSelector();

  // Settings modal
  setupSettingsModal();

  // Search button (placeholder for future implementation)
  setupSearchButton();

  // Menu button (placeholder for future implementation)
  setupMenuButton();

  // Verse interaction (will be set up after verses load)
  setupVerseInteractions();

  // Auto-hide navigation on scroll
  setupAutoHideNavigation();

  // Load highlighted verses from storage
  loadHighlightedVerses();

  console.log("Bible Reader UI initialized");
}

// Setup modal controls
function setupModalControls() {
  // Book/Chapter Modal
  const bookChapterBtn = document.getElementById("book-chapter-selector");
  const bookChapterModal = document.getElementById("book-chapter-modal");
  const closeBookChapterModal = document.getElementById("close-selector-modal");

  if (bookChapterBtn && bookChapterModal) {
    bookChapterBtn.addEventListener("click", () => {
      openModal(bookChapterModal);
    });
  }

  if (closeBookChapterModal && bookChapterModal) {
    closeBookChapterModal.addEventListener("click", () => {
      closeModal(bookChapterModal);
    });
  }

  // Settings Modal
  const settingsBtn = document.getElementById("bible-settings-btn");
  const settingsModal = document.getElementById("bible-settings-modal");
  const closeSettingsModal = document.getElementById("close-settings-modal");

  if (settingsBtn && settingsModal) {
    settingsBtn.addEventListener("click", () => {
      openModal(settingsModal);
    });
  }

  if (closeSettingsModal && settingsModal) {
    closeSettingsModal.addEventListener("click", () => {
      closeModal(settingsModal);
    });
  }

  // Close modal on backdrop click
  document.querySelectorAll(".bible-modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });
}

// Open modal
function openModal(modal) {
  if (modal) {
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    // Focus first focusable element in modal
    setTimeout(() => {
      const focusable = modal.querySelector('select, button:not([aria-label="Close"]), input');
      if (focusable) {
        focusable.focus();
      }
    }, 100);
  }
}

// Close modal
function closeModal(modal) {
  if (modal) {
    // Remove focus from any focused element inside the modal
    const focusedElement = modal.querySelector(':focus');
    if (focusedElement) {
      focusedElement.blur();
    }

    // Small delay to ensure blur completes before hiding
    setTimeout(() => {
      modal.style.display = "none";
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }, 10);
  }
}

// Setup book/chapter selector
function setupBookChapterSelector() {
  const bookSelect = document.getElementById("bible-book");
  const chapterSelect = document.getElementById("bible-chapter");
  const translationSelect = document.getElementById("bible-translation");
  const modal = document.getElementById("book-chapter-modal");

  // When book changes, update chapter list
  if (bookSelect) {
    bookSelect.addEventListener("change", function () {
      if (typeof updateChapterSelect === "function") {
        updateChapterSelect();
      }
    });
  }

  // When chapter changes, load the chapter and close modal
  if (chapterSelect) {
    chapterSelect.addEventListener("change", function () {
      if (bookSelect.value && chapterSelect.value) {
        if (typeof loadBibleChapter === "function") {
          loadBibleChapter();
        }
        updateCurrentReference();
        closeModal(modal);
      }
    });
  }

  // When translation changes, reload if chapter is loaded
  if (translationSelect) {
    translationSelect.addEventListener("change", function () {
      if (window.currentBook && window.currentChapter) {
        if (typeof loadBibleChapter === "function") {
          loadBibleChapter();
        }
      }
    });
  }
}

// Update current reference display
function updateCurrentReference() {
  const bookSelect = document.getElementById("bible-book");
  const chapterSelect = document.getElementById("bible-chapter");
  const referenceDisplay = document.getElementById("current-reference");

  if (bookSelect && chapterSelect && referenceDisplay) {
    const book = bookSelect.value;
    const chapter = chapterSelect.value;

    if (book && chapter) {
      referenceDisplay.textContent = `${book} ${chapter}`;
    } else {
      referenceDisplay.textContent = "Select Book";
    }
  }
}

// Setup settings modal
function setupSettingsModal() {
  // Font size controls
  const fontSizeBtns = document.querySelectorAll(".font-size-btn");
  fontSizeBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const size = this.getAttribute("data-size");

      // Remove active class from all buttons
      fontSizeBtns.forEach((b) => b.classList.remove("active"));

      // Add active class to clicked button
      this.classList.add("active");

      // Apply font size
      document.documentElement.setAttribute("data-font-size", size);

      // Save to localStorage
      localStorage.setItem("bible-font-size", size);
    });
  });

  // Theme controls
  const themeBtns = document.querySelectorAll(".theme-btn");
  themeBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const theme = this.getAttribute("data-theme");

      // Remove active class from all buttons
      themeBtns.forEach((b) => b.classList.remove("active"));

      // Add active class to clicked button
      this.classList.add("active");

      // Apply theme
      document.documentElement.setAttribute("data-theme", theme);

      // Save to localStorage
      localStorage.setItem("bible-theme", theme);
    });
  });

  // Load saved preferences
  const savedFontSize = localStorage.getItem("bible-font-size") || "medium";
  const savedTheme = localStorage.getItem("bible-theme") || "dark";

  document.documentElement.setAttribute("data-font-size", savedFontSize);
  document.documentElement.setAttribute("data-theme", savedTheme);

  // Update active states
  fontSizeBtns.forEach((btn) => {
    if (btn.getAttribute("data-size") === savedFontSize) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  themeBtns.forEach((btn) => {
    if (btn.getAttribute("data-theme") === savedTheme) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

// Setup search button (placeholder)
function setupSearchButton() {
  const searchBtn = document.getElementById("bible-search-btn");
  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      alert(
        "Search feature coming soon! This will allow you to search for specific verses or keywords."
      );
    });
  }
}

// Setup menu button (placeholder)
function setupMenuButton() {
  const menuBtn = document.getElementById("bible-menu-btn");
  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      alert(
        "Menu feature coming soon! This will provide additional reading tools and options."
      );
    });
  }
}

// Setup auto-hide navigation on scroll
function setupAutoHideNavigation() {
  const bibleContent = document.getElementById("bible-content");
  const bottomNav = document.querySelector(".bottom-nav");
  const headerNav = document.querySelector(".main-header");
  const bibleTopNav = document.querySelector(".bible-top-nav");
  const chapterNav = document.getElementById("chapter-navigation");
  const verseToolbar = document.getElementById("verse-action-toolbar");
  const bibleReader = document.querySelector(".youversion-bible-reader");

  if (!bibleContent || !bottomNav) return;

  let localLastScrollTop = 0;
  let localScrollTimeout = null;

  bibleContent.addEventListener("scroll", function () {
    const currentScrollTop = bibleContent.scrollTop;

    // Clear existing timeout
    if (localScrollTimeout) {
      clearTimeout(localScrollTimeout);
    }

    // Scrolling down - hide navigation
    if (currentScrollTop > localLastScrollTop && currentScrollTop > 50) {
      // Hide bottom nav
      bottomNav.style.transform = "translateY(100%)";
      bottomNav.style.transition = "transform 0.3s ease";

      // Hide top header
      if (headerNav) {
        headerNav.style.transform = "translateY(-100%)";
        headerNav.style.transition = "transform 0.3s ease";
      }

      // Adjust Bible reader to expand to full screen
      if (bibleReader) {
        bibleReader.style.top = "0";
        bibleReader.style.transition = "top 0.3s ease";
      }

      // Adjust Bible top nav
      if (bibleTopNav) {
        bibleTopNav.style.top = "0";
        bibleTopNav.style.transition = "top 0.3s ease";
      }

      // Adjust chapter navigation
      if (chapterNav) {
        chapterNav.style.bottom = "0";
        chapterNav.style.transition = "bottom 0.3s ease";
      }

      // Adjust verse toolbar
      if (verseToolbar && verseToolbar.style.display !== "none") {
        verseToolbar.style.bottom = "16px";
      }
    }
    // Scrolling up - show navigation
    else if (currentScrollTop < localLastScrollTop) {
      // Show bottom nav
      bottomNav.style.transform = "translateY(0)";

      // Show top header
      if (headerNav) {
        headerNav.style.transform = "translateY(0)";
      }

      // Restore Bible reader position
      if (bibleReader) {
        bibleReader.style.top = "80px";
      }

      // Restore Bible top nav (it's inside bible reader, so relative to reader)
      if (bibleTopNav) {
        bibleTopNav.style.top = "";
      }

      // Restore chapter navigation
      if (chapterNav) {
        chapterNav.style.bottom = "70px";
      }

      // Restore verse toolbar
      if (verseToolbar && verseToolbar.style.display !== "none") {
        verseToolbar.style.bottom = "70px";
      }
    }

    localLastScrollTop = currentScrollTop;

    // Show navigation after 2 seconds of no scrolling
    localScrollTimeout = setTimeout(() => {
      bottomNav.style.transform = "translateY(0)";

      if (headerNav) {
        headerNav.style.transform = "translateY(0)";
      }

      if (bibleReader) {
        bibleReader.style.top = "80px";
      }

      if (bibleTopNav) {
        bibleTopNav.style.top = "";
      }

      if (chapterNav) {
        chapterNav.style.bottom = "70px";
      }

      if (verseToolbar && verseToolbar.style.display !== "none") {
        verseToolbar.style.bottom = "70px";
      }
    }, 2000);
  });
}

// Setup verse interactions
function setupVerseInteractions() {
  // Copy verse button
  const copyBtn = document.getElementById("copy-verse-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", copySelectedVerse);
  }

  // Highlight verse button
  const highlightBtn = document.getElementById("highlight-verse-btn");
  if (highlightBtn) {
    highlightBtn.addEventListener("click", highlightSelectedVerse);
  }

  // Share verse button
  const shareBtn = document.getElementById("share-verse-btn");
  if (shareBtn) {
    shareBtn.addEventListener("click", shareSelectedVerse);
  }

  // Add note button
  const noteBtn = document.getElementById("add-note-btn");
  if (noteBtn) {
    noteBtn.addEventListener("click", addNoteToVerse);
  }

  // Play button
  const playBtn = document.getElementById("play-chapter-btn");
  if (playBtn) {
    playBtn.addEventListener("click", playChapter);
  }

  // Click outside to deselect verse
  document.addEventListener("click", (e) => {
    if (
      !e.target.closest(".verse") &&
      !e.target.closest(".verse-action-toolbar")
    ) {
      deselectVerse();
    }
  });
}

// Add verse click handlers after verses are loaded
function addVerseClickHandlers() {
  const verses = document.querySelectorAll(".verse");

  verses.forEach((verse) => {
    verse.addEventListener("click", function (e) {
      e.stopPropagation();
      selectVerse(this);
    });

    // Restore highlighted state if saved
    const verseId = verse.getAttribute("data-verse-id");
    if (highlightedVerses.has(verseId)) {
      verse.classList.add("highlighted");
    }
  });
}

// Select a verse
function selectVerse(verseElement) {
  // Deselect previous verse
  if (selectedVerse) {
    selectedVerse.classList.remove("selected");
  }

  // Select new verse
  selectedVerse = verseElement;
  verseElement.classList.add("selected");

  // Show action toolbar
  showActionToolbar();
}

// Deselect verse
function deselectVerse() {
  if (selectedVerse) {
    selectedVerse.classList.remove("selected");
    selectedVerse = null;
  }
  hideActionToolbar();
}

// Show action toolbar
function showActionToolbar() {
  const toolbar = document.getElementById("verse-action-toolbar");
  if (toolbar) {
    toolbar.style.display = "flex";
  }
}

// Hide action toolbar
function hideActionToolbar() {
  const toolbar = document.getElementById("verse-action-toolbar");
  if (toolbar) {
    toolbar.style.display = "none";
  }
}

// Copy selected verse
async function copySelectedVerse() {
  if (!selectedVerse) return;

  const verseNumber = selectedVerse.querySelector(".verse-number").textContent;
  const verseText = selectedVerse.querySelector(".verse-text").textContent;
  const reference = document.getElementById("current-reference").textContent;

  const textToCopy = `${reference}:${verseNumber} - ${verseText}`;

  try {
    await navigator.clipboard.writeText(textToCopy);
    showNotification("Verse copied to clipboard!");
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = textToCopy;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    showNotification("Verse copied!");
  }

  deselectVerse();
}

// Highlight selected verse
function highlightSelectedVerse() {
  if (!selectedVerse) return;

  const verseId = selectedVerse.getAttribute("data-verse-id");

  if (selectedVerse.classList.contains("highlighted")) {
    // Remove highlight
    selectedVerse.classList.remove("highlighted");
    highlightedVerses.delete(verseId);
    showNotification("Highlight removed");
  } else {
    // Add highlight
    selectedVerse.classList.add("highlighted");
    highlightedVerses.add(verseId);
    showNotification("Verse highlighted!");
  }

  // Save to localStorage
  saveHighlightedVerses();

  deselectVerse();
}

// Share selected verse
async function shareSelectedVerse() {
  if (!selectedVerse) return;

  const verseNumber = selectedVerse.querySelector(".verse-number").textContent;
  const verseText = selectedVerse.querySelector(".verse-text").textContent;
  const reference = document.getElementById("current-reference").textContent;

  const shareText = `"${verseText}"\n\n${reference}:${verseNumber}`;

  // Check if Web Share API is available
  if (navigator.share) {
    try {
      await navigator.share({
        title: `${reference}:${verseNumber}`,
        text: shareText,
      });
      showNotification("Verse shared!");
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Share failed:", err);
      }
    }
  } else {
    // Fallback: copy to clipboard
    await copySelectedVerse();
  }

  deselectVerse();
}

// Add note to verse
function addNoteToVerse() {
  if (!selectedVerse) return;

  const verseNumber = selectedVerse.querySelector(".verse-number").textContent;
  const reference = document.getElementById("current-reference").textContent;

  alert(
    `Note feature coming soon!\n\nYou'll be able to add personal notes and reflections for ${reference}:${verseNumber}`
  );

  deselectVerse();
}

// Play chapter audio
function playChapter() {
  alert(
    "Audio playback coming soon!\n\nThis feature will allow you to listen to the chapter being read aloud."
  );
}

// Show notification
function showNotification(message) {
  // Create notification element
  const notification = document.createElement("div");
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--youversion-text);
    color: var(--youversion-bg);
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    z-index: 2000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    animation: slideDown 0.3s ease;
  `;

  document.body.appendChild(notification);

  // Remove after 2 seconds
  setTimeout(() => {
    notification.style.animation = "slideUp 0.3s ease";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 2000);
}

// Save highlighted verses to localStorage
function saveHighlightedVerses() {
  localStorage.setItem(
    "bible-highlighted-verses",
    JSON.stringify([...highlightedVerses])
  );
}

// Load highlighted verses from localStorage
function loadHighlightedVerses() {
  const saved = localStorage.getItem("bible-highlighted-verses");
  if (saved) {
    try {
      highlightedVerses = new Set(JSON.parse(saved));
    } catch (err) {
      console.error("Failed to load highlighted verses:", err);
      highlightedVerses = new Set();
    }
  }
}

// Show chapter navigation
function showChapterNavigation() {
  const chapterNav = document.getElementById("chapter-navigation");
  if (chapterNav) {
    chapterNav.style.display = "flex";
  }
}

// Hide chapter navigation
function hideChapterNavigation() {
  const chapterNav = document.getElementById("chapter-navigation");
  if (chapterNav) {
    chapterNav.style.display = "none";
  }
}

// Update chapter display with YouVersion-style formatting
function updateChapterDisplayYouVersion(data) {
  const bibleContent = document.getElementById("bible-content");
  if (!bibleContent) return;

  console.log("updateChapterDisplayYouVersion received:", data);

  // Show chapter navigation
  showChapterNavigation();

  // Parse verses from the API response
  let verses = [];

  // The data object has this structure: { reference, text, translation }
  // The text field contains verse numbers like "1. Text 2. Text 3. Text"
  if (data.text) {
    const text = data.text;

    // Split by verse numbers (format: "1. text 2. text 3. text")
    // This regex matches: number followed by period and space, then text until next number
    const versePattern = /(\d+)\.\s+([^]*?)(?=\s+\d+\.\s+|$)/g;
    let match;

    while ((match = versePattern.exec(text)) !== null) {
      const verseNum = match[1];
      const verseText = match[2].trim();

      if (verseText) {
        verses.push({
          number: verseNum,
          text: verseText,
        });
      }
    }

    // Fallback: If no verses parsed, try splitting by just numbers
    if (verses.length === 0) {
      const parts = text.split(/(\d+)\./);
      for (let i = 1; i < parts.length; i += 2) {
        const number = parts[i];
        const text = parts[i + 1]?.trim();
        if (number && text) {
          verses.push({ number, text });
        }
      }
    }
  }

  console.log("Parsed verses:", verses.length);

  // Get reference info
  const reference = data.reference || document.getElementById("current-reference").textContent;
  const translation = data.translation || data.translation_name || "WEB";

  // Save current book/chapter for navigation
  const bookSelect = document.getElementById("bible-book");
  const chapterSelect = document.getElementById("bible-chapter");
  if (bookSelect && chapterSelect) {
    window.currentBook = bookSelect.value;
    window.currentChapter = parseInt(chapterSelect.value);
  }

  // Extract passage title if available (placeholder for now)
  const passageTitle = getPassageTitle(reference);

  // Build HTML
  let html = `
    <div class="scripture-chapter">
      <div class="scripture-header">
        <h2>${reference} &nbsp; ${translation}</h2>
        ${passageTitle ? `<h1 class="passage-title">${passageTitle}</h1>` : ''}
      </div>
      <div class="scripture-verses">
  `;

  if (verses.length > 0) {
    verses.forEach((verse) => {
      const verseId = `${reference}:${verse.number}`.replace(/\s+/g, "-");

      // Extract book name from reference (e.g., "Matthew 5" -> "Matthew")
      const bookName = reference.split(' ')[0];

      // Check if this verse contains Jesus's words
      const isJesus = typeof isJesusWords === 'function'
        ? isJesusWords(bookName, window.currentChapter, parseInt(verse.number))
        : false;

      const jesusClass = isJesus ? ' jesus-words' : '';

      html += `
        <div class="verse${jesusClass}" data-verse-id="${verseId}" data-verse-number="${verse.number}">
          <span class="verse-number">${verse.number}</span>
          <span class="verse-text">${verse.text}</span>
        </div>
      `;
    });
  } else {
    // Fallback: display raw text if parsing failed
    html += `<div class="verse"><span class="verse-text">${data.text}</span></div>`;
  }

  html += `
      </div>
    </div>
  `;

  bibleContent.innerHTML = html;

  // Add verse click handlers
  setTimeout(() => {
    addVerseClickHandlers();
  }, 100);

  // Scroll to top
  bibleContent.scrollTop = 0;
}

// Get passage title for a chapter (placeholder - could be enhanced with actual data)
function getPassageTitle(reference) {
  // Simple mapping of common passages to titles
  const titleMap = {
    "Luke 16": "Parable of the Shrewd Manager",
    "John 3": "Jesus and Nicodemus",
    "Matthew 5": "The Sermon on the Mount",
    "Psalm 23": "The LORD is My Shepherd",
    "Genesis 1": "The Creation",
    "Exodus 20": "The Ten Commandments",
    "1 Corinthians 13": "The Way of Love",
    "Romans 8": "Life Through the Spirit",
  };

  // Check if we have a title for this reference
  for (const [key, title] of Object.entries(titleMap)) {
    if (reference.includes(key)) {
      return title;
    }
  }

  return null;
}

// Add CSS animation for notifications
const style = document.createElement("style");
style.textContent = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  @keyframes slideUp {
    from {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    to {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
  }
`;
document.head.appendChild(style);

// Initialize on DOM load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeBibleReaderUI);
} else {
  initializeBibleReaderUI();
}
