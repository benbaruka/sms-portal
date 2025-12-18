import { describe, it, expect, beforeEach } from "@jest/globals";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useIsMobile } from "../../src/hooks/use-mobile";

describe("useIsMobile", () => {
  let mockMatchMedia: any;
  let changeListeners: Array<(event: MediaQueryListEvent) => void> = [];

  beforeEach(() => {
    // Reset listeners
    changeListeners = [];

    // Set initial desktop width first
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1024,
      writable: true,
    });

    // Mock matchMedia - must calculate matches based on current window.innerWidth
    mockMatchMedia = jest.fn().mockImplementation((query: string) => {
      const maxWidth = query.includes("max-width")
        ? parseInt(query.match(/max-width:\s*(\d+)px/)?.[1] || "0")
        : Infinity;
      return {
        matches: window.innerWidth <= maxWidth,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: (event: string, cb: (event: MediaQueryListEvent) => void) => {
          if (event === "change") {
            changeListeners.push(cb);
          }
        },
        removeEventListener: jest.fn((event: string, cb: (event: MediaQueryListEvent) => void) => {
          if (event === "change") {
            const index = changeListeners.indexOf(cb);
            if (index > -1) changeListeners.splice(index, 1);
          }
        }),
        dispatchEvent: jest.fn(),
      };
    });

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: mockMatchMedia,
    });
  });

  it("returns false on desktop width and true on mobile width", async () => {
    const { result } = renderHook(() => useIsMobile());

    // Wait for the effect to run and set initial state
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    // Initial state should be false for desktop width
    expect(result.current).toBe(false);

    // Change to mobile width
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 500,
      writable: true,
    });

    // Simulate matchMedia change event
    await act(async () => {
      const mockEvent = {
        matches: true,
      } as MediaQueryListEvent;

      changeListeners.forEach((cb) => cb(mockEvent));
      // Wait for state update
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Wait for the effect to update
    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });
});
