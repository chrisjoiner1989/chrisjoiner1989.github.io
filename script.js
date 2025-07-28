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
  e.preventDefault;
  searchForVerse();
});

saveBtn.addEventListener("click", saveSermon);
clearBtn.addEventListener("click", clearForm);
exportBtn.addEventListener("click", exportData);

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
