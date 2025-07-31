//Validates verse ref as user types it in
referenceInput.addEventListener("input", function () {
  validateVerseFormat();
});

//sets today as default date and handles mobile formatting
function setDefaultDate() {
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];
  dateInput.value = formattedDate;

  // Store in localStorage for persistence
  localStorage.setItem("sermonDate", formattedDate);
}

// Load saved date or set today's date
function loadSavedDate() {
  const savedDate = localStorage.getItem("sermonDate");
  if (savedDate && isValidDate(savedDate)) {
    dateInput.value = savedDate;
  } else {
    setDefaultDate();
  }
}

// Validate date format (YYYY-MM-DD)
function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  const timestamp = date.getTime();

  if (typeof timestamp !== "number" || Number.isNaN(timestamp)) return false;

  return dateString === date.toISOString().split("T")[0];
}

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