document.addEventListener("DOMContentLoaded", function () {
  console.log("Mount Builder starting up...");
});

// gets form and all input elements
const sermonForm = document.getElementById("sermon-form");
const speakerInput = document.getElementById("speaker");
const titleInput = document.getElementById("title");
const referenceInput = document.getElementById("reference");
const dateInput = document.getElementById("date");
const seriesInput = document.getElementById("series");
const notesInput = document.getElementById("notes");
const verseDisplay = document.getElementById("verse-display");
const referenceHelp = document.getElementById("reference-help");

// button elements
const searchBtn = document.querySelector(".search-btn");
const saveBtn = document.querySelector(".save-btn");
const clearBtn = document.querySelector(".clear-btn");
const exportBtn = document.querySelector(".export-btn");

// vars to store data
let sermons = [];
let currentVerseData = null;

// free bible api
const API_BASE = "https://bible-api.com/";

// loads ext sermons on start up
loadSermons();

//sets today as default date
const today = new Date();
dateInput.value = today.toISOString().split("T")[0];

// Event Listeners
searchBtn.addEventListener("click", function (e) {
  e.preventDefault();
  searchForVerse();
});

saveBtn.addEventListener("click", saveSermon);
clearBtn.addEventListener("click", clearForm);
exportBtn.addEventListener("click", exportData);

const addVerseBtn = document.querySelector(".addverse-btn");
addVerseBtn.addEventListener("click", addVerseToNotes);

//Validates verse ref as user types it in
referenceInput.addEventListener("input", function () {
  validateVerseFormat();
});

// allows enter key to search
referenceInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    searchForVerse();
  }
});

// Validation Function
function validateVerseFormat() {
  const input = referenceInput.value.trim();

  // regex pattern for bible verses AI helped here source (claude code)
  const pattern = /^([1-3]?\s?[A-Za-z]+)\s+(\d{1,3}):(\d{1,3})(-\d{1,3})?$/;

  if (input === "enter") {
    referenceHelp.textContent = "";
    referenceHelp.style.color = "";
    return true;
  }

  if (pattern.test(input)) {
    referenceHelp.textContent = "✓ Valid format";
    referenceHelp.style.color = "#5a7a5a";
    return true;
  } else {
    referenceHelp.textContent = "Use format: Book Chapter:Verse";
    referenceHelp.style.color = "#8b4513";
    return false;
  }
}

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
// SAVE SERMON FUNCTION
function saveSermon(e) {
  e.preventDefault();

  // get all values
  const title = titleInput.value.trim();
  const speaker = speakerInput.value.trim() || "Guest Speaker";
  const date = dateInput.value;
  const series = seriesInput.value.trim();
  const notes = notesInput.value.trim();
  const reference = referenceInput.value.trim();

  // validation
  if (!title) {
    alert("Please enter a sermon title");
    titleInput.focus();
    return;
  }

  if (!date) {
    alert("Please select a date for the sermon");
    dateInput.focus();
    return;
  }

  // creates sermon object
  const newSermon = {
    id: Date.now(), // simple ID
    title: title,
    speaker: speaker,
    date: date,
    series: series || "General",
    notes: notes,
    verseReference: reference,
    verseData: currentVerseData, // includes full verse text if searched
    savedAt: new Date().toISOString(),
  };

  // adds to array
  sermons.push(newSermon);

  // saves to localStorage
  saveToStorage();

  // shows success
  alert("✓ Sermon saved successfully!");

  // analyzes the data after save
  analyzeSermons();

  // clears the  form
  clearForm();
}
// ANALYZE SERMONS - shows stats in console
function analyzeSermons() {
  if (sermons.length === 0) return;

  // calculate various stats
  const totalSermons = sermons.length;
  const sermonsWithVerses = sermons.filter((s) => s.verseReference).length;
  const avgNotesLength = Math.round(
    sermons.reduce((sum, s) => sum + s.notes.length, 0) / totalSermons
  ); // count by speaker
  const speakers = {};
  sermons.forEach((sermon) => {
    speakers[sermon.speaker] = (speakers[sermon.speaker] || 0) + 1;
  });

  // find upcoming sermons
  const today = new Date();
  const upcoming = sermons.filter((s) => new Date(s.date) >= today).length;

  console.log("=== Sermon Statistics ===");
  console.log(`Total Sermons: ${totalSermons}`);
  console.log(`Sermons with verses: ${sermonsWithVerses}`);
  console.log(`Average notes length: ${avgNotesLength} characters`);
  console.log(`Upcoming sermons: ${upcoming}`);
  console.log("Speakers:", speakers);
}

// CALCULATE DAYS UNTIL - for export feature
function getDaysUntil(dateStr) {
  const today = new Date();
  const sermonDate = new Date(dateStr);

  // reset times for accurate calculation
  today.setHours(0, 0, 0, 0);
  sermonDate.setHours(0, 0, 0, 0);

  const diff = sermonDate - today;
  const days = Math.round(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days > 0) return `In ${days} days`;
  return `${Math.abs(days)} days ago`;
}

// CLEARs FORM
function clearForm() {
  sermonForm.reset();
  verseDisplay.innerHTML = "";
  referenceHelp.textContent = "";
  currentVerseData = null;

  // resest date to today
  dateInput.value = new Date().toISOString().split("T")[0];
}

// EXPORTs SERMONS
function exportData() {
  if (sermons.length === 0) {
    alert("No sermons to export yet!");
    return;
  }

  let exportText = "MOUNT BUILDER - SERMON EXPORT\n";
  exportText += "Generated: " + new Date().toLocaleDateString() + "\n";
  exportText += "=====================================\n\n";

  // sorts by date newest first
  const sorted = [...sermons].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  sorted.forEach((sermon, index) => {
    exportText += `SERMON #${index + 1}\n`;
    exportText += `---------\n`;
    exportText += `Title: ${sermon.title}\n`;
    exportText += `Speaker: ${sermon.speaker}\n`;
    exportText += `Date: ${formatDate(sermon.date)} (${getDaysUntil(
      sermon.date
    )})\n`;
    exportText += `Series: ${sermon.series}\n`;

    if (sermon.verseReference) {
      exportText += `\nScripture: ${sermon.verseReference}\n`;
      if (sermon.verseData && sermon.verseData.text) {
        exportText += `"${sermon.verseData.text}"\n`;
      }
    }

    if (sermon.notes) {
      exportText += `\nSermon Notes:\n${sermon.notes}\n`;
    }

    exportText += "\n=====================================\n\n";
  });

  // downloads file
  const blob = new Blob([exportText], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `mount-builder-sermons-${Date.now()}.txt`;
  link.click();
  URL.revokeObjectURL(url);

  alert("Sermons exported!");
}

// LOCALSTORAGE FUNCTIONS
function saveToStorage() {
  try {
    localStorage.setItem("mountBuilderSermons", JSON.stringify(sermons));
  } catch (e) {
    console.error("Failed to save:", e);
    alert("Could not save to browser storage");
  }
}

function loadSermons() {
  try {
    const saved = localStorage.getItem("mountBuilderSermons");
    if (saved) {
      sermons = JSON.parse(saved);
      console.log(`Loaded ${sermons.length} sermons`);
      analyzeSermons(); // show stats on load
    }
  } catch (e) {
    console.error("Failed to load sermons:", e);
    sermons = [];
  }
}

// HELPER FUNCTION
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

// debugs helper for development
window.viewSermons = () => {
  console.table(sermons);
};
