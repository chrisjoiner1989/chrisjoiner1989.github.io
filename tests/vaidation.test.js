import {
  validateVerseFormat,
  isValidDate,
  validateSermonData,
} from "../../src/utils/validation.js";

describe("Validation Functions", () => {
  describe("validateVerseFormat", () => {
    test("should validate correct verse format", () => {
      expect(validateVerseFormat("John 3:16")).toBe(true);
      expect(validateVerseFormat("Genesis 1:1")).toBe(true);
      expect(validateVerseFormat("1 Corinthians 13:4-7")).toBe(true);
    });

    test("should reject invalid verse format", () => {
      expect(validateVerseFormat("John")).toBe(false);
      expect(validateVerseFormat("3:16")).toBe(false);
      expect(validateVerseFormat("John 3")).toBe(false);
    });
  });

  describe("isValidDate", () => {
    test("should validate correct date format", () => {
      expect(isValidDate("2024-01-01")).toBe(true);
      expect(isValidDate("2024-12-31")).toBe(true);
    });

    test("should reject invalid date format", () => {
      expect(isValidDate("2024-13-01")).toBe(false);
      expect(isValidDate("invalid-date")).toBe(false);
      expect(isValidDate("2024-01-32")).toBe(false);
    });
  });

  describe("validateSermonData", () => {
    test("should validate complete sermon data", () => {
      const validSermon = {
        title: "Test Sermon",
        speaker: "Pastor John",
        date: "2024-01-01",
        series: "Test Series",
      };
      expect(validateSermonData(validSermon)).toEqual([]);
    });

    test("should return errors for missing required fields", () => {
      const invalidSermon = {
        speaker: "Pastor John",
        date: "2024-01-01",
        // Missing title
      };
      const errors = validateSermonData(invalidSermon);
      expect(errors).toContain("Title is required");
    });
  });
});
