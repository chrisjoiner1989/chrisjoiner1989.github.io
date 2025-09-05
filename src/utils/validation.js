// Pure validation utilities for both Node (tests) and browser use

function validateVerseFormat(input) {
  if (typeof input !== "string") return false;
  const trimmed = input.trim();
  if (trimmed.length === 0) return false;

  // Handles numbered books (e.g., 1 John), book names with spaces, and optional verse ranges
  const pattern = /^([1-3]?\s?[A-Za-z]+(?:\s[A-Za-z]+)*)\s+(\d{1,3}):(\d{1,3})(-\d{1,3})?$/;
  return pattern.test(trimmed);
}

function isValidDate(dateString) {
  if (typeof dateString !== "string") return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  const timestamp = date.getTime();
  if (typeof timestamp !== "number" || Number.isNaN(timestamp)) return false;

  return dateString === date.toISOString().split("T")[0];
}

function validateSermonData(sermon) {
  const errors = [];
  if (!sermon || typeof sermon !== "object") {
    return ["Invalid sermon object"];
  }

  const title = (sermon.title || "").trim();
  const date = sermon.date || "";

  if (!title) {
    errors.push("Title is required");
  }
  if (!isValidDate(date)) {
    errors.push("Valid date is required");
  }

  return errors;
}

// Browser global exposure (optional)
if (typeof window !== "undefined") {
  window.validateVerseFormat = window.validateVerseFormat || validateVerseFormat;
  window.isValidDate = window.isValidDate || isValidDate;
  window.validateSermonData = window.validateSermonData || validateSermonData;
}

// Node exports for tests
module.exports = {
  validateVerseFormat,
  isValidDate,
  validateSermonData,
};

