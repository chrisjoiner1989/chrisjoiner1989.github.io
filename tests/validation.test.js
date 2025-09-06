// testing the validation stuff - need to make sure verse format works right
const {
  validateVerseFormat,
  isValidDate,
  validateSermonData,
} = require("../src/utils/validation.js");

// TODO: need to implement these functions in validation.js
describe("Validation Tests", () => {
  // verse format validation
  describe("verse format", () => {
    test("basic verse works", () => {
      expect(validateVerseFormat("John 3:16")).toBe(true);
      expect(validateVerseFormat("Genesis 1:1")).toBe(true);
    });

    test("verse ranges work", () => {
      expect(validateVerseFormat("1 Corinthians 13:4-7")).toBe(true);
    });

    test("invalid stuff gets rejected", () => {
      expect(validateVerseFormat("John")).toBe(false); // missing chapter/verse
      expect(validateVerseFormat("3:16")).toBe(false); // missing book
      expect(validateVerseFormat("John 3")).toBe(false); // missing verse
    });
  });

  // date validation
  describe("date validation", () => {
    test("good dates pass", () => {
      expect(isValidDate("2024-01-01")).toBe(true);
      expect(isValidDate("2024-12-31")).toBe(true);
    });

    test("bad dates fail", () => {
      expect(isValidDate("2024-13-01")).toBe(false); // invalid month
      expect(isValidDate("invalid-date")).toBe(false);
      expect(isValidDate("2024-01-32")).toBe(false); // invalid day
    });
  });

  // sermon data validation
  describe("sermon data", () => {
    test("complete sermon is valid", () => {
      const goodSermon = {
        title: "Test Sermon",
        speaker: "Pastor John",
        date: "2024-01-01",
        series: "Test Series",
      };
      expect(validateSermonData(goodSermon)).toEqual([]);
    });

    test("missing required fields gives errors", () => {
      const badSermon = {
        speaker: "Pastor John",
        date: "2024-01-01",
        // missing title
      };
      const errors = validateSermonData(badSermon);
      expect(errors).toContain("Title is required");
    });
  });
});
