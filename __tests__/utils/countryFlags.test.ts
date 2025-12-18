import { getCountryFlag, getCountryName } from "../../src/utils/countryFlags";

describe("utils/countryFlags.ts", () => {
  describe("getCountryFlag", () => {
    it("module loads", () => {
      expect(getCountryFlag).toBeDefined();
      expect(typeof getCountryFlag).toBe("function");
    });

    it("returns default flag for undefined country code", () => {
      expect(getCountryFlag(undefined)).toBe("🏳️");
    });

    it("returns default flag for empty string", () => {
      expect(getCountryFlag("")).toBe("🏳️");
    });

    it("returns flag for known country codes", () => {
      expect(getCountryFlag("US")).toBe("🇺🇸");
      expect(getCountryFlag("us")).toBe("🇺🇸");
      expect(getCountryFlag("GB")).toBe("🇬🇧");
      expect(getCountryFlag("FR")).toBe("🇫🇷");
      expect(getCountryFlag("DE")).toBe("🇩🇪");
      expect(getCountryFlag("KE")).toBe("🇰🇪");
      expect(getCountryFlag("NG")).toBe("🇳🇬");
      expect(getCountryFlag("ZA")).toBe("🇿🇦");
    });

    it("handles lowercase country codes", () => {
      expect(getCountryFlag("cd")).toBe("🇨🇩");
      expect(getCountryFlag("cg")).toBe("🇨🇬");
      expect(getCountryFlag("ke")).toBe("🇰🇪");
    });

    it("returns default flag for unknown country code", () => {
      expect(getCountryFlag("XX")).toBe("🏳️");
      expect(getCountryFlag("unknown")).toBe("🏳️");
    });
  });

  describe("getCountryName", () => {
    it("module loads", () => {
      expect(getCountryName).toBeDefined();
      expect(typeof getCountryName).toBe("function");
    });

    it("returns countryData.name when provided", () => {
      const countryData = { name: "Custom Name", code: "US" };
      expect(getCountryName("US", countryData)).toBe("Custom Name");
    });

    it("returns 'Unknown' for undefined country code when no countryData", () => {
      expect(getCountryName(undefined)).toBe("Unknown");
    });

    it("returns country name for known country codes", () => {
      expect(getCountryName("KE")).toBe("Kenya");
      expect(getCountryName("ke")).toBe("Kenya");
      expect(getCountryName("NG")).toBe("Nigeria");
      expect(getCountryName("ZA")).toBe("South Africa");
      expect(getCountryName("US")).toBe("US");
      expect(getCountryName("CD")).toBe("Congo (DRC)");
      expect(getCountryName("CG")).toBe("Congo (Brazzaville)");
    });

    it("returns uppercase code for unknown country code", () => {
      expect(getCountryName("XX")).toBe("XX");
      expect(getCountryName("unknown")).toBe("UNKNOWN");
    });

    it("prioritizes countryData.name over countryCode", () => {
      const countryData = { name: "Custom", code: "US" };
      expect(getCountryName("KE", countryData)).toBe("Custom");
    });

    it("handles countryData without name", () => {
      const countryData = { code: "US" };
      expect(getCountryName("KE", countryData)).toBe("Kenya");
    });
  });
});
