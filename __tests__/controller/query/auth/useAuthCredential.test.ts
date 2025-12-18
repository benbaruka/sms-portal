import { renderHook, waitFor } from "@testing-library/react";

import {
  useLogin,
  useSignup,
  useForgotPassword,
  useResetPassword,
} from "../../../../src/controller/query/auth/useAuthCredential";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import * as authService from "../../../../src/controller/query/auth/auth.service";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

jest.mock("@/context/AuthProvider", () => ({
  useAuth: () => ({
    setIsAuthenticated: jest.fn(),
    setUser: jest.fn(),
    user: null,
  }),
}));

jest.mock("@/context/AlertProvider", () => ({
  useAlert: () => ({
    showAlert: jest.fn(),
  }),
}));

jest.mock("@/controller/hook/authToken", () => ({
  saveAuthToken: jest.fn(),
}));

jest.mock("@/utils/userUtils", () => ({
  isSuperAdmin: jest.fn(() => false),
}));

jest.mock("../../../../src/controller/query/auth/auth.service");
jest.mock("cookies-next", () => ({
  setCookie: jest.fn(),
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

describe("controller/query/auth/useAuthCredential.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("module loads", () => {
    expect(useLogin).toBeDefined();
    expect(useSignup).toBeDefined();
    expect(useForgotPassword).toBeDefined();
    expect(useResetPassword).toBeDefined();
  });

  it("useLogin - returns mutation hook", () => {
    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
  });

  it("useSignup - returns mutation hook", () => {
    const { result } = renderHook(() => useSignup(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
  });

  it("useForgotPassword - returns mutation hook", () => {
    const { result } = renderHook(() => useForgotPassword(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
  });

  it("useResetPassword - returns mutation hook", () => {
    const { result } = renderHook(() => useResetPassword(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
  });
});