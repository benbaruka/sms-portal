import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { ReactNode } from "react";
import { useLogout } from "../../../src/controller/hook/useLogout";

const {
  mockRouterReplace,
  mockSetIsAuthenticated,
  mockSetUser,
  mockShowAlert,
  mockQueryClientClear,
  mockDeleteCookie,
} = jest.hoisted(() => ({
  mockRouterReplace: jest.fn(),
  mockSetIsAuthenticated: jest.fn(),
  mockSetUser: jest.fn(),
  mockShowAlert: jest.fn(),
  mockQueryClientClear: jest.fn(),
  mockDeleteCookie: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockRouterReplace,
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

jest.mock("cookies-next", () => ({
  deleteCookie: mockDeleteCookie,
}));

jest.mock("../../../src/context/AuthProvider", () => ({
  useAuth: () => ({
    setIsAuthenticated: mockSetIsAuthenticated,
    setUser: mockSetUser,
  }),
}));

jest.mock("../../../src/context/AlertProvider", () => ({
  useAlert: () => ({
    showAlert: mockShowAlert,
  }),
}));

jest.mock("@tanstack/react-query", async () => {
  const actual = await jest.importActual("@tanstack/react-query");
  return {
    ...actual,
    useQueryClient: () => ({
      clear: mockQueryClientClear,
    }),
  };
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe.skip("controller/hook/useLogout.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouterReplace.mockClear();
    mockSetIsAuthenticated.mockClear();
    mockSetUser.mockClear();
    mockShowAlert.mockClear();
    mockQueryClientClear.mockClear();
    mockDeleteCookie.mockClear();
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("module loads", () => {
    expect(useLogout).toBeDefined();
    expect(typeof useLogout).toBe("function");
  });

  it("returns logout function", () => {
    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });
    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe("function");
  });

  it("calls deleteCookie on logout", async () => {
    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current();
    });

    expect(mockDeleteCookie).toHaveBeenCalledWith("authToken");
  });

  it("removes authToken from localStorage", async () => {
    localStorage.setItem("authToken", "test-token");
    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current();
    });

    expect(localStorage.getItem("authToken")).toBeNull();
  });

  it("removes user-session from localStorage", async () => {
    localStorage.setItem("user-session", "test-session");
    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current();
    });

    expect(localStorage.getItem("user-session")).toBeNull();
  });

  it("sets isAuthenticated to false", async () => {
    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current();
    });

    expect(mockSetIsAuthenticated).toHaveBeenCalledWith(false);
  });

  it("sets user to null", async () => {
    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current();
    });

    expect(mockSetUser).toHaveBeenCalledWith(null);
  });

  it("clears query client cache", async () => {
    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current();
    });

    expect(mockQueryClientClear).toHaveBeenCalled();
  });

  it("shows success alert", async () => {
    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current();
    });

    expect(mockShowAlert).toHaveBeenCalledWith({
      variant: "success",
      title: "Logged Out",
      message: "You have been logged out successfully.",
    });
  });

  it("redirects to signin after delay", async () => {
    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current();
    });

    expect(mockRouterReplace).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(mockRouterReplace).toHaveBeenCalledWith("/signin");
  });
});
