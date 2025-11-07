// sets today's date by default - saves time when creating sermons
function setDefaultDate() {
  // Skip if we're not on the form page
  const dateInput = document.getElementById("date");
  if (!dateInput) return;

  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];
  dateInput.value = formattedDate;

  // Store in localStorage for persistence
  localStorage.setItem("sermonDate", formattedDate);
}

// loads saved date from localStorage or falls back to today
function loadSavedDate() {
  // Skip if we're not on the form page
  const dateInput = document.getElementById("date");
  if (!dateInput) return;

  const savedDate = localStorage.getItem("sermonDate");
  if (savedDate && isValidDate(savedDate)) {
    dateInput.value = savedDate;
  } else {
    setDefaultDate();
  }
}

// validates date format - had issues with invalid dates breaking things
function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  const timestamp = date.getTime();

  if (typeof timestamp !== "number" || Number.isNaN(timestamp)) return false;

  return dateString === date.toISOString().split("T")[0];
}

// checks bible verse format - regex was tricky to get right
function validateVerseFormat(providedInput) {
  // regex pattern for bible verses - handles numbered books and verse ranges
  const pattern = /^([1-3]?\s?[A-Za-z]+)\s+(\d{1,3}):(\d{1,3})(-\d{1,3})?$/;

  // If input is provided, run as a pure function for tests/logic
  if (typeof providedInput === "string") {
    const trimmed = providedInput.trim();
    if (trimmed === "enter") return true;
    return pattern.test(trimmed);
  }

  // Otherwise, operate on DOM elements when available in the browser
  // Skip if we're not on the form page
  const referenceInput = document.getElementById("reference");
  const referenceHelp = document.getElementById("reference-help");
  if (!referenceInput || !referenceHelp) return true;

  const input = referenceInput.value.trim();
  if (input === "enter") {
    referenceHelp.textContent = "";
    referenceHelp.style.color = "";
    return true;
  }

  if (pattern.test(input)) {
    referenceHelp.textContent = "✓ Valid format";
    referenceHelp.style.color = "#5a7a5a";
    return true;
  }

  referenceHelp.textContent = "Use format: Book Chapter:Verse";
  referenceHelp.style.color = "#8b4513";
  return false;
}

// Export for tests without affecting browser usage
if (typeof module !== "undefined") {
  module.exports = { isValidDate, validateVerseFormat };
}
