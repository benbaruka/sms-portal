import { renderHook } from "@testing-library/react";

import {
  useVerifyOtp,
  useResendOtp,
} from "../../../../src/controller/query/auth/useOtp";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import * as otpService from "../../../../src/controller/query/auth/otp.service";

jest.mock("@/context/AuthProvider", () => ({
  useAuth: () => ({
    user: { message: { user: { status: 0 } } },
    setUser: jest.fn(),
  }),
}));

jest.mock("@/context/AlertProvider", () => ({
  useAlert: () => ({
    showAlert: jest.fn(),
  }),
}));

jest.mock("../../../../src/controller/query/auth/otp.service");

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

describe("controller/query/auth/useOtp.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("module loads", () => {
    expect(useVerifyOtp).toBeDefined();
    expect(useResendOtp).toBeDefined();
  });

  it("useVerifyOtp - returns mutation hook", () => {
    const { result } = renderHook(() => useVerifyOtp(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
  });

  it("useResendOtp - returns mutation hook", () => {
    const { result } = renderHook(() => useResendOtp(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
  });
});