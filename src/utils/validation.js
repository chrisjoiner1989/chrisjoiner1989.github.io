function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  const timestamp = date.getTime();
  if (typeof timestamp !== "number" || Number.isNaN(timestamp)) return false;

  return dateString === date.toISOString().split("T")[0];
}

function validateVerseFormat(input) {
  if (typeof input !== "string") return false;
  const trimmed = input.trim();
  if (trimmed.length === 0) return false;

  // Examples: "John 3:16", "Genesis 1:1", "1 Corinthians 13:4-7"
  const pattern = /^([1-3]?\s?[A-Za-z]+(?:\s[A-Za-z]+)*)\s+(\d{1,3}):(\d{1,3})(?:-(\d{1,3}))?$/;
  return pattern.test(trimmed);
}

function validateSermonData(sermon) {
  const errors = [];
  if (!sermon || typeof sermon !== "object") {
    return ["Invalid sermon object"];
  }

  const title = (sermon.title || "").toString().trim();
  if (!title) {
    errors.push("Title is required");
  }

  if (sermon.date && !isValidDate(sermon.date)) {
    errors.push("Date must be YYYY-MM-DD");
  }

  return errors;
}

module.exports = {
  isValidDate,
  validateVerseFormat,
  validateSermonData,
};

