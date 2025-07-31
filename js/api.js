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