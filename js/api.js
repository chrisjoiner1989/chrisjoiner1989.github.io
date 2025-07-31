// free bible api
const API_BASE = "https://bible-api.com/";

// searches for verse api call
async function searchForVerse() {
  const reference = referenceInput.value.trim();

  if (!reference) {
    alert("Please enter a verse reference first");
    return;
  }

  // checks if valid
  if (!validateVerseFormat()) {
    verseDisplay.innerHTML = '<p class="error">Please check verse format</p>';
    return;
  }

  // shows loading
  searchBtn.disabled = true;
  searchBtn.textContent = "Searching...";
  verseDisplay.innerHTML = '<p class="loading">Looking up verse...</p>';

  try {
    // formats for API (replaces empty spaces with +)
    const query = reference.replace(/\s+/g, "+");
    const response = await fetch(API_BASE + query);

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
  } finally {
    // reset button
    searchBtn.disabled = false;
    searchBtn.textContent = "Search verse";
  }
}

function displayVerse() {
  if (!currentVerseData) return;

  verseDisplay.innerHTML = `
      <div class="verse-content">
        <h4>${currentVerseData.reference}</h4>
        <p>"${currentVerseData.text}"</p>
        <small>- ${currentVerseData.translation}</small>
      </div>
    `;
}

function addVerseToNotes() {
  if (!currentVerseData) {
    alert("Please search for a verse first");
    return;
  }

  const verseText = `\n\n${currentVerseData.reference}\n"${currentVerseData.text}"\n`;
  notesInput.value += verseText;
  notesInput.focus();
}

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
function initializeBibleReader() {
  const bookSelect = document.getElementById("bible-book");

  BIBLE_BOOKS.forEach((book) => {
    const option = document.createElement("option");
    option.value = book.name;
    option.textContent = book.name;
    bookSelect.appendChild(option);
  });
}

async function loadBibleChapter() {
  const bookSelect = document.getElementById("bible-book");
  const chapterSelect = document.getElementById("bible-chapter");
  const contentDiv = document.getElementById("bible-content");
  const loadBtn = document.getElementById("load-chapter");

  const book = bookSelect.value;
  const chapter = chapterSelect.value;

  // Validation
  if (!book || !chapter) {
    alert("Please select both a book and chapter");
    return;
  }

  // Shows loading state
  loadBtn.disabled = true;
  loadBtn.textContent = "Loading...";
  contentDiv.innerHTML = "<p>Loading chapter...</p>";

  try {
    // Formats for API (same as the verse search)
    const query = `${book}+${chapter}`;
    const response = await fetch(API_BASE + query);

    if (!response.ok) {
      throw new Error("Chapter not found");
    }

    const data = await response.json();

    // Displays the chapter
    displayBibleChapter(data);
  } catch (error) {
    console.error("Bible API Error:", error);
    contentDiv.innerHTML = `<p class="error">Could not load chapter. Please try again.</p>`;
  } finally {
    // Reset button
    loadBtn.disabled = false;
    loadBtn.textContent = "Load Chapter";
  }
}

function displayBibleChapter(data) {
  const contentDiv = document.getElementById("bible-content");
  const referenceSpan = document.getElementById("current-reference");
  const bookSelect = document.getElementById("bible-book");
  const chapterSelect = document.getElementById("bible-chapter");

  // Saves current position
  currentBook = bookSelect.value;
  currentChapter = parseInt(chapterSelect.value);

  // Updates the current reference display
  referenceSpan.textContent = data.reference || "Bible Chapter";

  // Displays the chapter content
  contentDiv.innerHTML = `
    <div class="chapter-header">
      <h3>${data.reference}</h3>
      <small>${data.translation_name || "WEB"}</small>
    </div>
    <div class="chapter-text">
      ${data.text.replace(/\n/g, '<br><br>')}
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

function displayBibleChapter(data) {
  const contentDiv = document.getElementById("bible-content");
  const referenceSpan = document.getElementById("current-reference");

  referenceSpan.textContent = data.reference || "Bible Chapter";

  contentDiv.innerHTML = `
      <div class="chapter-header">
        <h3>${data.reference}</h3>
        <small>${data.translation_name || "WEB"}</small>
      </div>
      <div class="chapter-text">
        ${data.text.replace(/\n/g, "<br><br>")}
      </div>
    `;
}
