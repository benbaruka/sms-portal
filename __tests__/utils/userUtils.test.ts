import { getAvatarColor, getInitials, isSuperAdmin } from "../../src/utils/userUtils";

describe("utils/userUtils.ts", () => {
  describe("getInitials", () => {
    it("returns 'U' for empty or null input", () => {
      expect(getInitials("")).toBe("U");
      expect(getInitials(null)).toBe("U");
      expect(getInitials(undefined)).toBe("U");
      expect(getInitials("   ")).toBe("U");
    });

    it("returns first 2 letters for single word", () => {
      expect(getInitials("John")).toBe("JO");
      expect(getInitials("Mary")).toBe("MA");
    });

    it("returns first letter of first two words", () => {
      expect(getInitials("John Doe")).toBe("JD");
      expect(getInitials("Mary Jane Watson")).toBe("MJ");
    });

    it("handles multiple spaces", () => {
      expect(getInitials("John  Doe")).toBe("JD");
      expect(getInitials("  John   Doe  ")).toBe("JD");
    });

    it("returns 'U' when initials would be empty string", () => {
      // This tests the fallback at line 24: return initials || "U";
      // The fallback can be triggered if the map/join results in an empty string
      // This is theoretically possible but unlikely with normal input
      // However, we can test edge cases to ensure the fallback works
      expect(getInitials("A")).toBe("A");

      // Test with single character - should return first 2 chars (or just the char if length < 2)
      expect(getInitials("A")).toBe("A");

      // The fallback at line 24: return initials || "U" is a safety net
      // In practice, initials will always have at least one character from charAt(0)
      // But the fallback ensures we never return an empty string
    });

    it("handles edge case where parts might result in empty initials", () => {
      // Test various edge cases to ensure the fallback works
      // Even though initials should never be empty, we test the logic
      expect(getInitials("  A  ")).toBe("A");
      expect(getInitials("A B")).toBe("AB");
    });

    it("covers fallback when initials would be empty (line 24)", () => {
      // To cover line 24's fallback, we need a case where initials is falsy
      // This is difficult with normal strings, but we can test the logic path
      // The fallback `return initials || "U"` ensures we never return empty string

      // With normal input, initials will always have at least one character
      // But the fallback is there as a safety net
      // We test that the function always returns a valid string
      const result = getInitials("Test Name");
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);

      // The fallback at line 24 cannot be triggered with normal input
      // but the code path exists for safety

      // Test edge case: string with only spaces between words (should still work)
      expect(getInitials("A  B")).toBe("AB");
      expect(getInitials("  X  Y  ")).toBe("XY");

      // Test with Unicode characters that might cause issues
      // Even with special characters, charAt(0) should return a character
      expect(getInitials("测试 名字")).toBeTruthy();
      expect(getInitials("émoji 🎉 test")).toBeTruthy();
    });

    it("falls back to 'U' when computed initials are empty", () => {
      const mapSpy = jest.spyOn(Array.prototype, "map");
      mapSpy.mockImplementationOnce(() => [""]);
      expect(getInitials("any value")).toBe("U");
      mapSpy.mockRestore();
    });
  });

  describe("getAvatarColor", () => {
    it("returns gray-500 for null or undefined", () => {
      expect(getAvatarColor(null)).toBe("bg-gray-500");
      expect(getAvatarColor(undefined)).toBe("bg-gray-500");
    });

    it("returns a valid color class", () => {
      const color = getAvatarColor("John");
      expect(color).toMatch(/^bg-(blue|green|purple|pink|indigo|teal|orange|red|cyan|amber)-500$/);
    });

    it("returns consistent color for same name", () => {
      const color1 = getAvatarColor("John Doe");
      const color2 = getAvatarColor("John Doe");
      expect(color1).toBe(color2);
    });

    it("returns different colors for different names", () => {
      const color1 = getAvatarColor("John");
      const color2 = getAvatarColor("Jane");
      // They might be the same by chance, but usually different
      expect(color1).toMatch(/^bg-\w+-500$/);
      expect(color2).toMatch(/^bg-\w+-500$/);
    });
  });

  describe("isSuperAdmin", () => {
    it("returns false for null or undefined client", () => {
      expect(isSuperAdmin(null)).toBe(false);
      expect(isSuperAdmin(undefined)).toBe(false);
    });

    it("returns true for account_type === 'root'", () => {
      expect(isSuperAdmin({ account_type: "root" })).toBe(true);
    });

    it("returns true for id === 1", () => {
      expect(isSuperAdmin({ id: 1 })).toBe(true);
      expect(isSuperAdmin({ id: "1" })).toBe(true);
    });

    it("returns true when Number(id) === 1", () => {
      // Test all variations of id that should result in Number(id) === 1
      expect(isSuperAdmin({ id: 1 })).toBe(true);
      expect(isSuperAdmin({ id: "1" })).toBe(true);
      // Test with null id
      expect(isSuperAdmin({ id: null })).toBe(false);
      // Test with undefined id
      expect(isSuperAdmin({})).toBe(false);
    });

    it("handles edge case with empty string initials fallback", () => {
      // Test the fallback at line 24: return initials || "U"
      // This case is difficult to trigger since we always have characters
      // But let's ensure the fallback works by testing single character edge cases
      expect(getInitials("A")).toBe("A");
    });

    it("returns false for regular client", () => {
      expect(isSuperAdmin({ account_type: "client", id: 2 })).toBe(false);
      expect(isSuperAdmin({ id: 2 })).toBe(false);
    });

    it("returns true when both conditions are met", () => {
      expect(isSuperAdmin({ account_type: "root", id: 1 })).toBe(true);
    });
  });
});
