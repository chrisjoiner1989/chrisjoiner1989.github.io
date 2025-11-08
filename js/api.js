// bible API setup - free APIs don't have all translations so using multiple
const BIBLE_APIS = {
  // bible-api.com for public domain translations
  primary: {
    base: "https://bible-api.com/",
    supportedTranslations: ["WEB", "KJV", "ASV", "BBE"],
    formatUrl: (book, chapter, translation) => {
      const query = `${book.replace(/\s+/g, "+")}+${chapter}`;
      if (translation === "WEB") {
        return `${BIBLE_APIS.primary.base}${query}`;
      } else {
        return `${
          BIBLE_APIS.primary.base
        }${query}?translation=${translation.toLowerCase()}`;
      }
    },
  },

  // bolls.life for modern translations like NKJV, ESV, NLT
  bolls: {
    base: "https://bolls.life/",
    supportedTranslations: ["NKJV", "ESV", "NLT"],
    formatUrl: (book, chapter, translation) => {
      // bolls API needs book number instead of name - annoying but whatever
      const bookNumber = getBookNumber(book);
      return `${BIBLE_APIS.bolls.base}get-text/${translation}/${bookNumber}/${chapter}/`;
    },
  },
};

// helper function to get book number for bolls API
function getBookNumber(bookName) {
  console.log("Looking for book:", bookName);
  const bookIndex = BIBLE_BOOKS.findIndex((book) => book.name === bookName);
  console.log("Book index found:", bookIndex);
  const bookNumber = bookIndex + 1; // bolls uses 1-based indexing
  console.log("Book number for API:", bookNumber);
  return bookNumber;
}

// searches for bible verses - validates format first then hits API
async function searchForVerse() {
  const referenceInput = document.getElementById("reference");
  const verseDisplay = document.getElementById("verse-display");
  const searchBtn = document.querySelector(".search-btn");

  if (!referenceInput) {
    alert("Reference input not found on this page");
    return;
  }

  const reference = referenceInput.value.trim();

  if (!reference) {
    alert("Please enter a verse reference first");
    return;
  }

  // checks if valid format before making API call
  if (!validateVerseFormat()) {
    if (verseDisplay) {
      verseDisplay.innerHTML = '<p class="error">Please check verse format</p>';
    }
    return;
  }

  // shows loading
  if (searchBtn) {
    searchBtn.disabled = true;
    searchBtn.textContent = "Searching...";
  }
  if (verseDisplay) {
    verseDisplay.innerHTML = '<p class="loading">Looking up verse...</p>';
  }

  try {
    // use primary API for verse search (WEB translation)
    const query = reference.replace(/\s+/g, "+");
    const response = await fetch(BIBLE_APIS.primary.base + query);

    if (!response.ok) {
      throw new Error("Verse not found");
    }

    const data = await response.json();

    // saves verse data
    currentVerseData = {
      reference: data.reference || reference,
      text: data.text,
      translation: data.translation_name || "WEB",
    };

    // displays the verse
    displayVerse();
  } catch (error) {
    console.error("API Error:", error);
    if (verseDisplay) {
      verseDisplay.innerHTML = `<p class="error">Could not find verse. Please try again.</p>`;
    }
    currentVerseData = null;

    const addVerseBtn = document.querySelector(".addverse-btn");
    if (addVerseBtn) addVerseBtn.classList.remove("show");
  } finally {
    // reset button
    if (searchBtn) {
      searchBtn.disabled = false;
      searchBtn.textContent = "Search verse";
    }
  }
}

// shows the verse result with add to notes button
function displayVerse() {
  if (!currentVerseData) return;

  const verseDisplay = document.getElementById("verse-display");
  if (!verseDisplay) return;

  verseDisplay.innerHTML = `
      <div class="verse-content">
        <h4>${currentVerseData.reference}</h4>
        <p>"${currentVerseData.text}"</p>
        <small>- ${currentVerseData.translation}</small>
      </div>
    `;

  const addVerseBtn = document.querySelector(".addverse-btn");
  if (addVerseBtn) addVerseBtn.style.display = "block";
}

// adds verse text to sermon notes - saves copy/paste time
function addVerseToNotes() {
  if (!currentVerseData) {
    alert("Please search for a verse first");
    return;
  }

  const verseText = `\n\n${currentVerseData.reference}\n"${currentVerseData.text}"\n`;
  const notesInput = document.getElementById("notes");
  if (notesInput) {
    notesInput.value += verseText;
    notesInput.focus();
  }
}

// all 66 bible books with chapter counts - saves API calls
const BIBLE_BOOKS = [
  { name: "Genesis", chapters: 50 },
  { name: "Exodus", chapters: 40 },
  { name: "Leviticus", chapters: 27 },
  { name: "Numbers", chapters: 36 },
  { name: "Deuteronomy", chapters: 34 },
  { name: "Joshua", chapters: 24 },
  { name: "Judges", chapters: 21 },
  { name: "Ruth", chapters: 4 },
  { name: "1 Samuel", chapters: 31 },
  { name: "2 Samuel", chapters: 24 },
  { name: "1 Kings", chapters: 22 },
  { name: "2 Kings", chapters: 25 },
  { name: "1 Chronicles", chapters: 29 },
  { name: "2 Chronicles", chapters: 36 },
  { name: "Ezra", chapters: 10 },
  { name: "Nehemiah", chapters: 13 },
  { name: "Esther", chapters: 10 },
  { name: "Job", chapters: 42 },
  { name: "Psalms", chapters: 150 },
  { name: "Proverbs", chapters: 31 },
  { name: "Ecclesiastes", chapters: 12 },
  { name: "Song of Solomon", chapters: 8 },
  { name: "Isaiah", chapters: 66 },
  { name: "Jeremiah", chapters: 52 },
  { name: "Lamentations", chapters: 5 },
  { name: "Ezekiel", chapters: 48 },
  { name: "Daniel", chapters: 12 },
  { name: "Hosea", chapters: 14 },
  { name: "Joel", chapters: 3 },
  { name: "Amos", chapters: 9 },
  { name: "Obadiah", chapters: 1 },
  { name: "Jonah", chapters: 4 },
  { name: "Micah", chapters: 7 },
  { name: "Nahum", chapters: 3 },
  { name: "Habakkuk", chapters: 3 },
  { name: "Zephaniah", chapters: 3 },
  { name: "Haggai", chapters: 2 },
  { name: "Zechariah", chapters: 14 },
  { name: "Malachi", chapters: 4 },
  { name: "Matthew", chapters: 28 },
  { name: "Mark", chapters: 16 },
  { name: "Luke", chapters: 24 },
  { name: "John", chapters: 21 },
  { name: "Acts", chapters: 28 },
  { name: "Romans", chapters: 16 },
  { name: "1 Corinthians", chapters: 16 },
  { name: "2 Corinthians", chapters: 13 },
  { name: "Galatians", chapters: 6 },
  { name: "Ephesians", chapters: 6 },
  { name: "Philippians", chapters: 4 },
  { name: "Colossians", chapters: 4 },
  { name: "1 Thessalonians", chapters: 5 },
  { name: "2 Thessalonians", chapters: 3 },
  { name: "1 Timothy", chapters: 6 },
  { name: "2 Timothy", chapters: 4 },
  { name: "Titus", chapters: 3 },
  { name: "Philemon", chapters: 1 },
  { name: "Hebrews", chapters: 13 },
  { name: "James", chapters: 5 },
  { name: "1 Peter", chapters: 5 },
  { name: "2 Peter", chapters: 3 },
  { name: "1 John", chapters: 5 },
  { name: "2 John", chapters: 1 },
  { name: "3 John", chapters: 1 },
  { name: "Jude", chapters: 1 },
  { name: "Revelation", chapters: 22 },
];
let currentBook = null;
let currentChapter = null;

// function to pick which API to use based on translation
function selectBestAPI(translation) {
  console.log("Selecting API for translation:", translation);

  // check bolls first for modern translations
  if (BIBLE_APIS.bolls.supportedTranslations.includes(translation)) {
    console.log("Using Bolls API for", translation);
    return { name: "bolls", config: BIBLE_APIS.bolls };
  }

  // check primary API for public domain translations
  if (BIBLE_APIS.primary.supportedTranslations.includes(translation)) {
    console.log("Using primary API for", translation);
    return { name: "primary", config: BIBLE_APIS.primary };
  }

  // fallback to primary API with WEB
  console.log("Translation not found, using WEB fallback");
  return {
    name: "primary",
    config: BIBLE_APIS.primary,
    fallbackTranslation: "WEB",
  };
}

// function to parse different API response formats
function parseAPIResponse(
  data,
  apiName,
  requestedTranslation,
  bookName,
  chapterNum
) {
  console.log("API Response:", data);
  console.log("API Name:", apiName);
  console.log("Requested translation:", requestedTranslation);
  console.log("Book name from user selection:", bookName);
  console.log("Chapter from user selection:", chapterNum);

  switch (apiName) {
    case "primary":
      // bible-api.com format
      let translationName = requestedTranslation || "WEB";
      if (data.translation_name) {
        translationName = data.translation_name;
      } else if (data.translation_id) {
        translationName = data.translation_id;
      } else if (data.translation) {
        translationName = data.translation;
      }

      if (data.verses && Array.isArray(data.verses)) {
        const text = data.verses.map((v) => `${v.verse}. ${v.text}`).join(" ");
        return {
          reference: data.reference,
          text: text,
          translation: translationName,
        };
      } else if (data.text) {
        return {
          reference: data.reference,
          text: data.text,
          translation: translationName,
        };
      }
      break;

    case "bolls":
      // bolls.life format - returns array of verse objects
      console.log(
        "Bolls API data type:",
        Array.isArray(data) ? "array" : typeof data
      );
      console.log("Bolls API data length:", data?.length);
      if (data && data.length > 0) {
        console.log("First verse data:", data[0]);
        console.log("Available fields in first verse:", Object.keys(data[0]));
      }

      if (Array.isArray(data) && data.length > 0) {
        const text = data
          .map((verse) => `${verse.verse}. ${verse.text}`)
          .join(" ");
        const firstVerse = data[0];

        // debug the book and chapter fields
        console.log("Book field:", firstVerse.book);
        console.log("Chapter field:", firstVerse.chapter);
        console.log("Book index would be:", firstVerse.book - 1);

        // use the book and chapter we already know from user selection
        // this is more reliable than trying to parse it from API response
        const finalBookName = bookName || "Unknown Book";
        const finalChapterNum = chapterNum || "?";

        console.log("Using book from user selection:", finalBookName);
        console.log("Using chapter from user selection:", finalChapterNum);

        return {
          reference: `${finalBookName} ${finalChapterNum}`,
          text: text,
          translation: requestedTranslation,
        };
      }

      // maybe its not an array - try object format
      if (data && data.text) {
        console.log("Bolls API returned single object format");
        return {
          reference: `${bookName || "Unknown"} ${chapterNum || "?"}`,
          text: data.text,
          translation: requestedTranslation,
        };
      }
      break;
  }

  console.log("Could not parse API response");
  return null;
}
function initializeBibleReader() {
  const bookSelect = document.getElementById("bible-book");
  const chapterSelect = document.getElementById("bible-chapter");
  const translationSelect = document.getElementById("bible-translation");

  BIBLE_BOOKS.forEach((book) => {
    const option = document.createElement("option");
    option.value = book.name;
    option.textContent = book.name;
    bookSelect.appendChild(option);
  });

  // Auto-load chapter when selection changes
  if (chapterSelect) {
    chapterSelect.addEventListener("change", function() {
      if (bookSelect.value && chapterSelect.value) {
        loadBibleChapter();
      }
    });
  }

  // Also reload if translation changes (only if chapter is already loaded)
  if (translationSelect) {
    translationSelect.addEventListener("change", function() {
      if (currentBook && currentChapter) {
        loadBibleChapter();
      }
    });
  }

  // Initialize reading preferences
  initializeReadingPreferences();
}

// Initialize font size and theme controls
function initializeReadingPreferences() {
  const bibleSection = document.querySelector(".bible-section");
  const bibleContent = document.getElementById("bible-content");

  // Load saved preferences from localStorage
  const savedFontSize = localStorage.getItem("bibleFontSize") || "medium";
  const savedTheme = localStorage.getItem("bibleTheme") || "light";

  // Apply saved preferences
  applyFontSize(savedFontSize);
  applyTheme(savedTheme);

  // Font size controls
  const fontSizeBtns = document.querySelectorAll(".font-size-btn");
  fontSizeBtns.forEach(btn => {
    btn.addEventListener("click", function() {
      const size = this.getAttribute("data-size");

      // Remove active class from all buttons
      fontSizeBtns.forEach(b => b.classList.remove("active"));

      // Add active class to clicked button
      this.classList.add("active");

      // Apply font size
      applyFontSize(size);

      // Save preference
      localStorage.setItem("bibleFontSize", size);
    });
  });

  // Theme controls
  const themeBtns = document.querySelectorAll(".theme-btn");
  themeBtns.forEach(btn => {
    btn.addEventListener("click", function() {
      const theme = this.getAttribute("data-theme");

      // Remove active class from all buttons
      themeBtns.forEach(b => b.classList.remove("active"));

      // Add active class to clicked button
      this.classList.add("active");

      // Apply theme
      applyTheme(theme);

      // Save preference
      localStorage.setItem("bibleTheme", theme);
    });
  });
}

function applyFontSize(size) {
  const bibleContent = document.getElementById("bible-content");
  const fontSizeBtns = document.querySelectorAll(".font-size-btn");

  if (bibleContent) {
    // Remove all font size classes
    bibleContent.classList.remove("font-small", "font-medium", "font-large", "font-xlarge");

    // Add new font size class
    bibleContent.classList.add(`font-${size}`);
  }

  // Update active button
  fontSizeBtns.forEach(btn => {
    if (btn.getAttribute("data-size") === size) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

function applyTheme(theme) {
  const bibleSection = document.querySelector(".bible-section");
  const themeBtns = document.querySelectorAll(".theme-btn");

  if (bibleSection) {
    // Remove all theme classes
    bibleSection.classList.remove("theme-light", "theme-sepia", "theme-dark");

    // Add new theme class
    bibleSection.classList.add(`theme-${theme}`);
  }

  // Update active button
  themeBtns.forEach(btn => {
    if (btn.getAttribute("data-theme") === theme) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

// loads full bible chapters - way more complex than single verses
async function loadBibleChapter() {
  const bookSelect = document.getElementById("bible-book");
  const chapterSelect = document.getElementById("bible-chapter");
  const translationSelect = document.getElementById("bible-translation");
  const contentDiv = document.getElementById("bible-content");

  const book = bookSelect.value;
  const chapter = chapterSelect.value;
  const translation = translationSelect.value || "WEB";

  // validation
  if (!book || !chapter) {
    return;
  }

  // show loading with better UX
  contentDiv.innerHTML = `
    <div class="bible-loading">
      <div class="loading-spinner"></div>
      <p>Loading ${book} ${chapter}...</p>
    </div>
  `;

  try {
    // select the best API for this translation
    const apiInfo = selectBestAPI(translation);
    const finalTranslation = apiInfo.fallbackTranslation || translation;

    // build the API URL using the selected API
    const url = apiInfo.config.formatUrl(book, chapter, finalTranslation);
    console.log(`Using ${apiInfo.name} API:`, url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API returned ${response.status} - chapter not found`);
    }

    const data = await response.json();

    // parse the response based on which API we used
    const parsedData = parseAPIResponse(
      data,
      apiInfo.name,
      finalTranslation,
      book,
      chapter
    );

    if (!parsedData || !parsedData.text) {
      throw new Error("No chapter text found in API response");
    }

    // show the chapter
    displayBibleChapter(parsedData);
  } catch (error) {
    console.error("Bible loading error:", error);
    contentDiv.innerHTML = `
      <div class="bible-error">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p>Could not load chapter.</p>
        <p><small>${book} ${chapter} (${translation})</small></p>
        <p><small>${error.message}</small></p>
        <p><small>Try selecting a different translation</small></p>
      </div>`;
  }
}

function displayBibleChapter(data) {
  const contentDiv = document.getElementById("bible-content");
  const bookSelect = document.getElementById("bible-book");
  const chapterSelect = document.getElementById("bible-chapter");

  // Saves current position
  currentBook = bookSelect.value;
  currentChapter = parseInt(chapterSelect.value);

  // Process text for display with better verse formatting
  let processedText = formatBibleText(data.text);

  // Displays just the chapter content - clean and minimal
  contentDiv.innerHTML = `
    <div class="chapter-header">
      <h3>${data.reference}</h3>
      <small>${data.translation || data.translation_name || "WEB"}</small>
    </div>
    <div class="chapter-text">
      ${processedText}
    </div>
  `;

  // Add click-to-copy functionality to verse numbers
  initializeVerseClickToCopy();
}

// Format Bible text with proper verse numbers and spacing
function formatBibleText(text) {
  if (!text) return "";

  // Clean up the text first
  let cleanText = text.trim();

  // Pattern to match verse numbers at the start of lines or after periods
  // Matches patterns like "1. " or "1 " at the beginning or after whitespace
  const versePattern = /(\d+)\.\s+/g;

  // Replace verse numbers with properly formatted spans
  cleanText = cleanText.replace(versePattern, function(match, verseNum) {
    return `<span class="verse-number">${verseNum}</span> `;
  });

  // Handle case where verse numbers don't have periods (some APIs)
  // Match standalone numbers at the start of a line or after double space
  cleanText = cleanText.replace(/(\n|^)(\d+)\s+/g, function(match, prefix, verseNum) {
    return `${prefix}<span class="verse-number">${verseNum}</span> `;
  });

  // Add paragraph breaks for readability
  // Split on double line breaks to create paragraphs
  let paragraphs = cleanText.split(/\n\n+/);

  // Wrap each paragraph
  let formattedText = paragraphs.map(para => {
    // Don't wrap if already has verse numbers (to avoid double wrapping)
    if (para.trim()) {
      // Add line breaks for single newlines within paragraphs
      para = para.replace(/\n/g, ' ');
      return `<p>${para}</p>`;
    }
    return '';
  }).filter(p => p).join('');

  return formattedText;
}

// Initialize click-to-copy for verse numbers
function initializeVerseClickToCopy() {
  const verseNumbers = document.querySelectorAll(".verse-number");

  verseNumbers.forEach(verseNum => {
    verseNum.addEventListener("click", function(e) {
      e.preventDefault();

      // Get verse number from the clicked element
      const verseNumber = this.textContent.trim();

      // Get the verse text (next sibling)
      let verseText = "";
      let nextNode = this.nextSibling;

      // Collect text until we hit the next verse number or end
      while (nextNode && !nextNode.classList?.contains("verse-number")) {
        if (nextNode.nodeType === Node.TEXT_NODE) {
          verseText += nextNode.textContent;
        } else if (nextNode.textContent) {
          verseText += nextNode.textContent;
        }
        nextNode = nextNode.nextSibling;

        // Stop if we hit a verse-number class
        if (nextNode?.classList?.contains("verse-number")) {
          break;
        }
      }

      // Clean up the verse text
      verseText = verseText.trim();

      // Create the reference
      const reference = `${currentBook} ${currentChapter}:${verseNumber}`;
      const fullText = `"${verseText}" — ${reference}`;

      // Copy to clipboard
      copyToClipboard(fullText, reference);
    });
  });
}

// Copy text to clipboard with visual feedback
async function copyToClipboard(text, reference) {
  try {
    await navigator.clipboard.writeText(text);
    showCopyNotification(`Copied ${reference}`);
  } catch (err) {
    // Fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand("copy");
      showCopyNotification(`Copied ${reference}`);
    } catch (e) {
      showCopyNotification("Failed to copy", true);
    }

    document.body.removeChild(textarea);
  }
}

// Show copy notification
function showCopyNotification(message, isError = false) {
  // Remove any existing notification
  const existing = document.querySelector(".copy-notification");
  if (existing) {
    existing.remove();
  }

  // Create notification
  const notification = document.createElement("div");
  notification.className = `copy-notification ${isError ? "error" : "success"}`;
  notification.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${isError
        ? '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'
        : '<polyline points="20 6 9 17 4 12"></polyline>'}
    </svg>
    <span>${message}</span>
  `;

  document.body.appendChild(notification);

  // Trigger animation
  setTimeout(() => notification.classList.add("show"), 10);

  // Remove after 2 seconds
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

function updateChapterSelect() {
  const bookSelect = document.getElementById("bible-book");
  const chapterSelect = document.getElementById("bible-chapter");
  const selectedBook = BIBLE_BOOKS.find(
    (book) => book.name === bookSelect.value
  );

  chapterSelect.innerHTML = `<option value="">Select chapter</option>`;

  if (selectedBook) {
    for (let i = 1; i <= selectedBook.chapters; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = `Chapter ${i}`;
      chapterSelect.appendChild(option);
    }
  }
}

// Navigate to previous chapter
function previousChapter() {
  if (!currentBook || !currentChapter) {
    alert("Please load a chapter first");
    return;
  }

  const bookIndex = BIBLE_BOOKS.findIndex((book) => book.name === currentBook);
  let newChapter = currentChapter - 1;
  let newBook = currentBook;

  if (newChapter < 1) {
    // Go to previous book's last chapter
    if (bookIndex > 0) {
      newBook = BIBLE_BOOKS[bookIndex - 1].name;
      newChapter = BIBLE_BOOKS[bookIndex - 1].chapters;
    } else {
      alert("You're at the beginning of the Bible");
      return;
    }
  }

  navigateToChapter(newBook, newChapter);
}

// Navigate to next chapter
function nextChapter() {
  if (!currentBook || !currentChapter) {
    alert("Please load a chapter first");
    return;
  }

  const bookIndex = BIBLE_BOOKS.findIndex((book) => book.name === currentBook);
  const currentBookData = BIBLE_BOOKS[bookIndex];
  let newChapter = currentChapter + 1;
  let newBook = currentBook;

  if (newChapter > currentBookData.chapters) {
    // Go to next book's first chapter
    if (bookIndex < BIBLE_BOOKS.length - 1) {
      newBook = BIBLE_BOOKS[bookIndex + 1].name;
      newChapter = 1;
    } else {
      alert("You're at the end of the Bible");
      return;
    }
  }

  navigateToChapter(newBook, newChapter);
}

// Navigate to specific chapter
function navigateToChapter(book, chapter) {
  const bookSelect = document.getElementById("bible-book");
  const chapterSelect = document.getElementById("bible-chapter");

  // Update dropdowns
  bookSelect.value = book;
  updateChapterSelect();
  chapterSelect.value = chapter;

  // Loads the chapter
  loadBibleChapter();
}

/**
 * Fetch verse by reference for floating Bible panel
 * Exported globally for use by floatingBible.js
 * @param {string} reference - Verse reference (e.g., "John 3:16")
 * @param {string} translation - Translation code (e.g., "web", "kjv")
 * @returns {Promise<{reference: string, text: string, translation: string}>}
 */
window.fetchVerse = async function(reference, translation = 'web') {
  try {
    // Normalize translation to uppercase for API selection
    const normalizedTranslation = translation.toUpperCase();

    // Use primary API (bible-api.com) for supported translations
    if (BIBLE_APIS.primary.supportedTranslations.includes(normalizedTranslation)) {
      const query = reference.replace(/\s+/g, "+");
      const url = normalizedTranslation === "WEB"
        ? `${BIBLE_APIS.primary.base}${query}`
        : `${BIBLE_APIS.primary.base}${query}?translation=${normalizedTranslation.toLowerCase()}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Verse not found");
      }

      const data = await response.json();

      return {
        reference: data.reference || reference,
        text: data.text,
        translation: data.translation_name || normalizedTranslation
      };
    }
    // Use bolls.life API for modern translations
    else if (BIBLE_APIS.bolls.supportedTranslations.includes(normalizedTranslation)) {
      // Parse reference to extract book, chapter, and verse
      const match = reference.match(/^([1-3]?\s?[A-Za-z\s]+)\s+(\d+):(\d+)(-\d+)?$/);

      if (!match) {
        throw new Error("Invalid reference format");
      }

      const [, bookName, chapter, verseStart] = match;
      const bookNumber = getBookNumber(bookName.trim());

      if (!bookNumber) {
        throw new Error("Book not found");
      }

      const url = `${BIBLE_APIS.bolls.base}get-text/${normalizedTranslation}/${bookNumber}/${chapter}/`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Verse not found");
      }

      const data = await response.json();

      // Bolls returns array of verses, need to find the specific one
      if (Array.isArray(data)) {
        const verseNum = parseInt(verseStart);
        const verseData = data.find(v => v.verse === verseNum);

        if (verseData) {
          return {
            reference: `${bookName} ${chapter}:${verseStart}`,
            text: verseData.text,
            translation: normalizedTranslation
          };
        }
      }

      throw new Error("Verse not found in response");
    }
    else {
      throw new Error(`Translation ${normalizedTranslation} not supported`);
    }
  } catch (error) {
    console.error('Error fetching verse:', error);
    throw error;
  }
};
