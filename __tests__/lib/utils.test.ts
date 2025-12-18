import { cn } from "../../src/lib/utils";

describe("lib/utils.ts", () => {
  it("module loads and exports cn function", () => {
    expect(cn).toBeDefined();
    expect(typeof cn).toBe("function");
  });

  it("merges class names correctly", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
    expect(cn("foo", "bar", "baz")).toBe("foo bar baz");
  });

  it("handles conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
    expect(cn("foo", true && "bar")).toBe("foo bar");
    expect(cn("foo", null && "bar", "baz")).toBe("foo baz");
  });

  it("merges Tailwind classes correctly", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
  });

  it("handles empty inputs", () => {
    expect(cn()).toBe("");
    expect(cn("")).toBe("");
    expect(cn("", "")).toBe("");
  });

  it("handles undefined and null", () => {
    expect(cn(undefined, null, "foo")).toBe("foo");
    expect(cn(undefined)).toBe("");
    expect(cn(null)).toBe("");
    expect(cn(undefined, null)).toBe("");
  });

  it("handles arrays and objects", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
    expect(cn({ foo: true, bar: false })).toBe("foo");
    expect(cn({ foo: true, bar: true })).toBe("foo bar");
  });

  it("handles mixed inputs", () => {
    expect(cn("foo", ["bar", "baz"], { qux: true })).toBe("foo bar baz qux");
    expect(cn("foo", undefined, "bar", null, "baz")).toBe("foo bar baz");
  });

  it("handles complex Tailwind merges", () => {
    const result1 = cn("p-4 m-2", "p-6");
    expect(result1).toContain("m-2");
    expect(result1).toContain("p-6");
    expect(result1).not.toContain("p-4");
    
    // twMerge keeps both flex and flex-col as they don't conflict
    const result2 = cn("flex row", "flex-col");
    expect(result2).toContain("flex-col");
    expect(result2).toContain("row");
  });
});
