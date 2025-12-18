import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
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

jest.mock("@/context/AuthProvider", () => ({
  useAuth: () => ({
    setIsAuthenticated: mockSetIsAuthenticated,
    setUser: mockSetUser,
  }),
}));

jest.mock("@/context/AlertProvider", () => ({
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

jest.mock("cookies-next", () => ({
  deleteCookie: mockDeleteCookie,
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
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

  it("exports useLogout function", async () => {
    const Module = await import("../../../src/controller/hook/useLogout");
    expect(Module.useLogout).toBeDefined();
    expect(typeof Module.useLogout).toBe("function");
  });

  it("returns logout function", () => {
    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe("function");
  });

  it("clears localStorage on logout", async () => {
    localStorage.setItem("authToken", "test-token");
    localStorage.setItem("user-session", "{}");
    localStorage.setItem("apiKey", "test-key");

    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current();
    });

    expect(localStorage.getItem("authToken")).toBeNull();
    expect(localStorage.getItem("user-session")).toBeNull();
  });

  it("calls setIsAuthenticated(false) on logout", async () => {
    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current();
    });

    expect(mockSetIsAuthenticated).toHaveBeenCalledWith(false);
  });

  it("calls setUser(null) on logout", async () => {
    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current();
    });

    expect(mockSetUser).toHaveBeenCalledWith(null);
  });

  it("shows success alert on logout", async () => {
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
});
