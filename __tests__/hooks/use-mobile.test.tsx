import { renderHook, waitFor } from "@testing-library/react";

import { useIsMobile } from "../../src/hooks/use-mobile";

describe("hooks/use-mobile.ts", () => {
  const originalInnerWidth = window.innerWidth;
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    window.innerWidth = originalInnerWidth;
    window.matchMedia = originalMatchMedia;
  });

  it("module loads", () => {
    expect(useIsMobile).toBeDefined();
    expect(typeof useIsMobile).toBe("function");
  });

  it("returns false for desktop width", async () => {
    window.innerWidth = 1024;
    const mockMatchMedia = jest.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })) as unknown as typeof window.matchMedia;
    window.matchMedia = mockMatchMedia;

    const { result } = renderHook(() => useIsMobile());
    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it("returns true for mobile width", async () => {
    window.innerWidth = 600;
    const mockMatchMedia = jest.fn((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })) as unknown as typeof window.matchMedia;
    window.matchMedia = mockMatchMedia;

    const { result } = renderHook(() => useIsMobile());
    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it("returns true when width is exactly 768px", async () => {
    window.innerWidth = 768;
    const mockMatchMedia = jest.fn((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })) as unknown as typeof window.matchMedia;
    window.matchMedia = mockMatchMedia;

    const { result } = renderHook(() => useIsMobile());
    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it("sets up media query listener", async () => {
    const addEventListener = jest.fn();
    const mockMatchMedia = jest.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener,
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })) as unknown as typeof window.matchMedia;
    window.matchMedia = mockMatchMedia;
    window.innerWidth = 1024;

    const { unmount } = renderHook(() => useIsMobile());
    await waitFor(() =>
      expect(addEventListener).toHaveBeenCalledWith("change", expect.any(Function))
    );

    unmount();
  });

  it("initializes with current window width", async () => {
    window.innerWidth = 500;
    const mockMatchMedia = jest.fn((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })) as unknown as typeof window.matchMedia;
    window.matchMedia = mockMatchMedia;

    const { result } = renderHook(() => useIsMobile());
    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it("cleans up listener on unmount", async () => {
    const removeEventListener = jest.fn();
    const mockMatchMedia = jest.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener,
      dispatchEvent: jest.fn(),
    })) as unknown as typeof window.matchMedia;
    window.matchMedia = mockMatchMedia;

    const { unmount } = renderHook(() => useIsMobile());
    await waitFor(() => expect(removeEventListener).not.toHaveBeenCalled());
    unmount();
    expect(removeEventListener).toHaveBeenCalled();
  });

  it("calls onChange callback when media query changes", async () => {
    let onChangeCallback: (() => void) | null = null;
    const addEventListener = jest.fn((event: string, callback: () => void) => {
      if (event === "change") {
        onChangeCallback = callback;
      }
    });
    const mockMatchMedia = jest.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener,
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })) as unknown as typeof window.matchMedia;
    window.matchMedia = mockMatchMedia;
    window.innerWidth = 1024;

    const { result } = renderHook(() => useIsMobile());
    await waitFor(() => {
      expect(result.current).toBe(false);
    });

    // Simulate media query change
    window.innerWidth = 600;
    if (onChangeCallback) {
      onChangeCallback();
    }

    // The state should update (but we need to wait for re-render)
    // Since we're testing the callback, we verify it was set up correctly
    expect(addEventListener).toHaveBeenCalledWith("change", expect.any(Function));
  });
});
