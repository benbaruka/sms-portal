import DateFormatter from "../../src/utils/dateFns";


describe("utils/dateFns.ts", () => {
  it("module loads", () => {
    expect(DateFormatter).toBeDefined();
  });

  describe("safeParse", () => {
    it("returns null for undefined", () => {
      expect(DateFormatter.safeParse()).toBeNull();
    });

    it("returns null for empty string", () => {
      expect(DateFormatter.safeParse("")).toBeNull();
    });

    it("returns null for invalid date string", () => {
      expect(DateFormatter.safeParse("invalid-date")).toBeNull();
      expect(DateFormatter.safeParse("not-a-date")).toBeNull();
      expect(DateFormatter.safeParse("abc")).toBeNull();
    });

    it("returns null for invalid ISO string", () => {
      expect(DateFormatter.safeParse("2024-13-45")).toBeNull();
    });

    it("returns Date for valid ISO string", () => {
      // Use a valid ISO string that parseISO can handle
      // parseISO works with ISO 8601 format
      const validISO = "2024-01-15T10:30:00Z";
      const date = DateFormatter.safeParse(validISO);
      expect(date).not.toBeNull();
      if (date) {
        expect(date).toBeInstanceOf(Date);
        expect(isNaN(date.getTime())).toBe(false);
      }
    });

    it("returns Date for valid ISO string without timezone", () => {
      // Test with ISO string format that parseISO accepts
      const validDate = "2024-01-15T10:30:00";
      const date = DateFormatter.safeParse(validDate);
      expect(date).not.toBeNull();
      if (date) {
        expect(date).toBeInstanceOf(Date);
        expect(isNaN(date.getTime())).toBe(false);
      }
    });

    it("returns Date for valid date string", () => {
      // parseISO can handle date-only strings in ISO format
      const validDate = "2024-01-15";
      const date = DateFormatter.safeParse(validDate);
      expect(date).not.toBeNull();
      if (date) {
        expect(date).toBeInstanceOf(Date);
        expect(isNaN(date.getTime())).toBe(false);
      }
    });

    it("handles parseISO exception in catch block", () => {
      // Test the catch block by using a string that causes parseISO to throw
      // parseISO doesn't actually throw, but returns Invalid Date
      // However, we can test the isNaN check path which is similar
      // The catch block is hard to trigger, but we test the isNaN path instead
      const result = DateFormatter.safeParse("invalid-date-that-causes-issues");
      expect(result).toBeNull();
    });

    it("handles date with isNaN check correctly", () => {
      // Test the isNaN check in safeParse (line 9-11)
      const result = DateFormatter.safeParse("2024-13-45T99:99:99Z");
      expect(result).toBeNull();
    });

    // Note: Testing the catch block (lines 13-14) is difficult because parseISO
    // from date-fns doesn't throw errors - it returns Invalid Date instead.
    // The catch block is a safety net for unexpected errors.
    // The isNaN check (lines 9-11) covers the invalid date case.

    it("handles isNaN check for invalid date from parseISO (lines 9-11)", () => {
      // Test the isNaN check path in safeParse
      // Create a date string that parseISO can parse but results in invalid date
      // Actually, parseISO handles most cases, so we'll test with a clearly invalid one
      const result = DateFormatter.safeParse("invalid-date-string-that-parseISO-cant-handle");
      expect(result).toBeNull();
    });

    it("covers the return date path in safeParse (line 12)", () => {
      // Ensure the return date path is covered when date is valid
      const validDate = "2024-01-15T10:30:00Z";
      const result = DateFormatter.safeParse(validDate);
      expect(result).not.toBeNull();
      expect(result).toBeInstanceOf(Date);
      expect(isNaN(result!.getTime())).toBe(false);
      // This covers line 12: return date;
    });

    it("handles all format methods with null date", () => {
      // Test that all format methods handle null/undefined dates correctly
      expect(DateFormatter.formatDateLong(undefined)).toBe("Date inconnue");
      expect(DateFormatter.formatDateShort(undefined)).toBe("—");
      expect(DateFormatter.formatTimeAndDay(undefined)).toBe("—");
      expect(DateFormatter.formatISO(undefined)).toBe("");
    });

    it("handles all format methods with invalid date (isNaN check)", () => {
      // Test isNaN check paths (lines 19, 26, 33, 40)
      const invalidDate = "invalid-date-string";
      expect(DateFormatter.formatDateLong(invalidDate)).toBe("Date inconnue");
      expect(DateFormatter.formatDateShort(invalidDate)).toBe("—");
      expect(DateFormatter.formatTimeAndDay(invalidDate)).toBe("—");
      expect(DateFormatter.formatISO(invalidDate)).toBe("");
    });

    it("formats date correctly with all methods for valid date", () => {
      const validDate = "2024-01-15T10:30:00Z";
      expect(DateFormatter.formatDateLong(validDate)).not.toBe("Date inconnue");
      expect(DateFormatter.formatDateShort(validDate)).not.toBe("—");
      expect(DateFormatter.formatTimeAndDay(validDate)).not.toBe("—");
      expect(DateFormatter.formatISO(validDate)).not.toBe("");
    });

    it("formatDateLong handles isNaN check (line 19-20)", () => {
      // Test the isNaN check branch in formatDateLong
      const invalidDate = DateFormatter.safeParse("invalid");
      // safeParse returns null for invalid, but we can test with a date that becomes invalid
      const result = DateFormatter.formatDateLong("not-a-date");
      expect(result).toBe("Date inconnue");
    });

    it("formatDateShort handles isNaN check (line 26-27)", () => {
      const result = DateFormatter.formatDateShort("not-a-date");
      expect(result).toBe("—");
    });

    it("formatTimeAndDay handles isNaN check (line 33-34)", () => {
      const result = DateFormatter.formatTimeAndDay("not-a-date");
      expect(result).toBe("—");
    });

    it("formatISO handles isNaN check (line 40-41)", () => {
      const result = DateFormatter.formatISO("not-a-date");
      expect(result).toBe("");
    });

    it("formatISO returns ISO string for valid date (line 43)", () => {
      const validDate = "2024-01-15T10:30:00.000Z";
      const result = DateFormatter.formatISO(validDate);
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(result).toBeTruthy();
    });
  });

  describe("formatDateLong", () => {
    it("returns 'Date inconnue' for undefined", () => {
      expect(DateFormatter.formatDateLong()).toBe("Date inconnue");
    });

    it("returns 'Date inconnue' for invalid date", () => {
      expect(DateFormatter.formatDateLong("invalid")).toBe("Date inconnue");
      expect(DateFormatter.formatDateLong("")).toBe("Date inconnue");
    });

    it("formats valid date in French (line 22)", () => {
      const result = DateFormatter.formatDateLong("2024-01-15T10:30:00Z");
      expect(result).not.toBe("Date inconnue");
      expect(result).toContain("2024");
      // Verify the format function is actually called (line 22)
      expect(result.length).toBeGreaterThan(10);
    });
  });

  describe("formatDateShort", () => {
    it("returns '—' for undefined", () => {
      expect(DateFormatter.formatDateShort()).toBe("—");
    });

    it("returns '—' for invalid date", () => {
      expect(DateFormatter.formatDateShort("invalid")).toBe("—");
      expect(DateFormatter.formatDateShort("")).toBe("—");
    });

    it("formats valid date as dd/MM/yyyy (line 29)", () => {
      const result = DateFormatter.formatDateShort("2024-01-15T10:30:00Z");
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
      // Verify the format function is actually called (line 29)
      expect(result).toBe("15/01/2024");
    });
  });

  describe("formatTimeAndDay", () => {
    it("returns '—' for undefined", () => {
      expect(DateFormatter.formatTimeAndDay()).toBe("—");
    });

    it("returns '—' for invalid date", () => {
      expect(DateFormatter.formatTimeAndDay("invalid")).toBe("—");
      expect(DateFormatter.formatTimeAndDay("")).toBe("—");
    });

    it("formats valid date with time and day (line 36)", () => {
      const result = DateFormatter.formatTimeAndDay("2024-01-15T10:30:00Z");
      expect(result).toContain(":");
      expect(result).not.toBe("—");
      // Verify the format function is actually called (line 36)
      expect(result.length).toBeGreaterThan(10);
    });
  });

  describe("formatISO", () => {
    it("returns empty string for undefined", () => {
      expect(DateFormatter.formatISO()).toBe("");
    });

    it("returns empty string for invalid date", () => {
      expect(DateFormatter.formatISO("invalid")).toBe("");
      expect(DateFormatter.formatISO("")).toBe("");
    });

    it("returns ISO string for valid date (line 43)", () => {
      const result = DateFormatter.formatISO("2024-01-15T10:30:00Z");
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      // Verify toISOString is actually called (line 43)
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
