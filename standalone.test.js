/**
 * Standalone tests for utility functions and business logic
 * These tests do not require MongoDB connection
 */

// Simple utility functions to test
const utils = {
  // Add two numbers
  add: (a, b) => a + b,

  // Format a date
  formatDate: (date) => {
    const d = date instanceof Date ? date : new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  },

  // Validate email format
  isValidEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  },

  // Calculate age from birthdate
  calculateAge: (birthdate) => {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  },

  // Truncate text with ellipsis
  truncateText: (text, maxLength) => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.slice(0, maxLength) + "...";
  },

  // Generate a random ID
  generateId: (length = 8) => {
    const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  },
};

// Tests for utility functions
describe("Utility functions", () => {
  describe("add", () => {
    test("adds two positive numbers", () => {
      expect(utils.add(2, 3)).toBe(5);
    });

    test("adds a positive and a negative number", () => {
      expect(utils.add(5, -3)).toBe(2);
    });

    test("adds two negative numbers", () => {
      expect(utils.add(-2, -3)).toBe(-5);
    });
  });

  describe("formatDate", () => {
    test("formats date correctly", () => {
      const date = new Date(2023, 0, 15); // Jan 15, 2023
      expect(utils.formatDate(date)).toBe("2023-01-15");
    });

    test("accepts string dates", () => {
      expect(utils.formatDate("2023-02-10")).toBe("2023-02-10");
    });
  });

  describe("isValidEmail", () => {
    test("validates correct email", () => {
      expect(utils.isValidEmail("test@example.com")).toBe(true);
    });

    test("invalidates incorrect email missing @", () => {
      expect(utils.isValidEmail("testexample.com")).toBe(false);
    });

    test("invalidates incorrect email missing domain", () => {
      expect(utils.isValidEmail("test@")).toBe(false);
    });

    test("invalidates incorrect email with spaces", () => {
      expect(utils.isValidEmail("test @example.com")).toBe(false);
    });
  });

  describe("calculateAge", () => {
    // Store the original Date constructor
    const RealDate = global.Date;

    beforeEach(() => {
      // Create a fixed date for testing: June 15, 2023
      const fixedDate = new Date(2023, 5, 15);

      // Mock the Date constructor to always return our fixed date
      global.Date = class extends RealDate {
        constructor(...args) {
          if (args.length === 0) {
            return fixedDate;
          }
          return new RealDate(...args);
        }

        // Make sure static methods are properly stubbed
        static now() {
          return fixedDate.getTime();
        }
      };
    });

    afterEach(() => {
      // Restore the original Date constructor
      global.Date = RealDate;
    });

    test("calculates age correctly for birthday in past this year", () => {
      expect(utils.calculateAge("2000-01-15")).toBe(23);
    });

    test("calculates age correctly for birthday in future this year", () => {
      expect(utils.calculateAge("2000-12-15")).toBe(22);
    });

    test("calculates age correctly for today's birthday", () => {
      expect(utils.calculateAge("2000-06-15")).toBe(23);
    });
  });

  describe("truncateText", () => {
    test("doesn't truncate text shorter than max length", () => {
      expect(utils.truncateText("Hello", 10)).toBe("Hello");
    });

    test("truncates text longer than max length", () => {
      expect(utils.truncateText("Hello World", 5)).toBe("Hello...");
    });

    test("truncates text exactly at max length", () => {
      expect(utils.truncateText("Hello", 5)).toBe("Hello");
    });
  });

  describe("generateId", () => {
    test("generates ID with default length", () => {
      expect(utils.generateId()).toHaveLength(8);
    });

    test("generates ID with custom length", () => {
      expect(utils.generateId(12)).toHaveLength(12);
    });

    test("generates different IDs on each call", () => {
      const id1 = utils.generateId();
      const id2 = utils.generateId();
      expect(id1).not.toBe(id2);
    });

    test("generates IDs with only allowed characters", () => {
      const id = utils.generateId(20);
      expect(id).toMatch(/^[a-z0-9]+$/);
    });
  });
});
