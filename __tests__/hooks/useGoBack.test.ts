import { renderHook, waitFor } from "@testing-library/react";

import { useGoBack } from "../../src/hooks/useGoBack";

const mockBack = jest.fn();
const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
  }),
}));

describe("hooks/useGoBack.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    if (typeof window !== "undefined") {
      Object.defineProperty(window, "history", {
        value: { length: 2 },
        writable: true,
        configurable: true,
      });
    }
  });

  it("module loads", () => {
    expect(useGoBack).toBeDefined();
    expect(typeof useGoBack).toBe("function");
  });

  it("exports default function", async () => {
    const Module = await import("../../src/hooks/useGoBack");
    expect(Module.default).toBeDefined();
    expect(typeof Module.default).toBe("function");
  });

  it("returns goBack function", async () => {
    const { result } = renderHook(() => useGoBack());
    await waitFor(() => expect(result.current).not.toBeNull());
    expect(typeof result.current.goBack).toBe("function");
  });

  it("calls router.back() when history length > 1", async () => {
    if (typeof window !== "undefined") {
      Object.defineProperty(window, "history", {
        value: { length: 3 },
        writable: true,
        configurable: true,
      });
    }

    const { result } = renderHook(() => useGoBack());
    await waitFor(() => expect(result.current).not.toBeNull());
    result.current.goBack();
    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("calls router.push('/') when history length <= 1", async () => {
    if (typeof window !== "undefined") {
      Object.defineProperty(window, "history", {
        value: { length: 1 },
        writable: true,
        configurable: true,
      });
    }

    const { result } = renderHook(() => useGoBack());
    await waitFor(() => expect(result.current).not.toBeNull());
    result.current.goBack();
    expect(mockPush).toHaveBeenCalledWith("/");
    expect(mockBack).not.toHaveBeenCalled();
  });

  it("calls router.push('/') when history length is 0", async () => {
    if (typeof window !== "undefined") {
      Object.defineProperty(window, "history", {
        value: { length: 0 },
        writable: true,
        configurable: true,
      });
    }

    const { result } = renderHook(() => useGoBack());
    await waitFor(() => expect(result.current).not.toBeNull());
    result.current.goBack();
    expect(mockPush).toHaveBeenCalledWith("/");
    expect(mockBack).not.toHaveBeenCalled();
  });

  it("handles undefined window gracefully", async () => {
    const { result } = renderHook(() => useGoBack());
    await waitFor(() => expect(result.current).not.toBeNull());
    expect(typeof result.current.goBack).toBe("function");
  });

  it("checks window.history.length correctly", async () => {
    if (typeof window !== "undefined") {
      Object.defineProperty(window, "history", {
        value: { length: 5 },
        writable: true,
        configurable: true,
      });
    }

    const { result } = renderHook(() => useGoBack());
    await waitFor(() => expect(result.current).not.toBeNull());
    result.current.goBack();
    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalled();
  });
});
