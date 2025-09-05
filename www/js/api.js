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
  const reference = referenceInput.value.trim();

  if (!reference) {
    alert("Please enter a verse reference first");
    return;
  }

  // checks if valid format before making API call
  if (!validateVerseFormat()) {
    verseDisplay.innerHTML = '<p class="error">Please check verse format</p>';
    return;
  }

  // shows loading
  searchBtn.disabled = true;
  searchBtn.textContent = "Searching...";
  verseDisplay.innerHTML = '<p class="loading">Looking up verse...</p>';

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
    }; // displays the verse
    displayVerse();
  } catch (error) {
    console.error("API Error:", error);
    verseDisplay.innerHTML = `<p class="error">Could not find verse. Please try again.</p>`;
    currentVerseData = null;

    const addVerseBtn = document.querySelector(".addverse-btn");
    addVerseBtn.classList.remove("show");
  } finally {
    // reset button
    searchBtn.disabled = false;
    searchBtn.textContent = "Search verse";
  }
}

// shows the verse result with add to notes button
function displayVerse() {
  if (!currentVerseData) return;

  verseDisplay.innerHTML = `
      <div class="verse-content">
        <h4>${currentVerseData.reference}</h4>
        <p>"${currentVerseData.text}"</p>
        <small>- ${currentVerseData.translation}</small>
      </div>
    `;

  const addVerseBtn = document.querySelector(".addverse-btn");
  addVerseBtn.style.display = "block";
}

// adds verse text to sermon notes - saves copy/paste time
function addVerseToNotes() {
  if (!currentVerseData) {
    alert("Please search for a verse first");
    return;
  }

  const verseText = `\n\n${currentVerseData.reference}\n"${currentVerseData.text}"\n`;
  notesInput.value += verseText;
  notesInput.focus();
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

  BIBLE_BOOKS.forEach((book) => {
    const option = document.createElement("option");
    option.value = book.name;
    option.textContent = book.name;
    bookSelect.appendChild(option);
  });
}

// loads full bible chapters - way more complex than single verses
async function loadBibleChapter() {
  const bookSelect = document.getElementById("bible-book");
  const chapterSelect = document.getElementById("bible-chapter");
  const translationSelect = document.getElementById("bible-translation");
  const contentDiv = document.getElementById("bible-content");
  const loadBtn = document.getElementById("load-chapter");

  const book = bookSelect.value;
  const chapter = chapterSelect.value;
  const translation = translationSelect.value || "WEB";

  // validation
  if (!book || !chapter) {
    alert("Please select both a book and chapter");
    return;
  }

  // show loading
  loadBtn.disabled = true;
  loadBtn.textContent = "Loading...";
  contentDiv.innerHTML = "<p>Loading chapter...</p>";

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
      <div class="error" style="text-align: center; padding: 2rem; color: #dc143c;">
        <p>Could not load chapter.</p>
        <p><small>Book: ${book}, Chapter: ${chapter}, Translation: ${translation}</small></p>
        <p><small>${error.message}</small></p>
        <p><small>Try selecting a different translation</small></p>
      </div>`;
  } finally {
    // reset button
    loadBtn.disabled = false;
    loadBtn.textContent = "Go";
  }
}

function displayBibleChapter(data) {
  const contentDiv = document.getElementById("bible-content");
  const bookSelect = document.getElementById("bible-book");
  const chapterSelect = document.getElementById("bible-chapter");

  // Saves current position
  currentBook = bookSelect.value;
  currentChapter = parseInt(chapterSelect.value);

  // Process text for display
  let processedText = data.text.replace(/\n/g, "<br><br>");

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
