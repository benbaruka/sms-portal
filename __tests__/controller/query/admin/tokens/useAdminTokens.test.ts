import { renderHook } from "@testing-library/react";

import {
  useAdminTokensList,
  useCreateAdminToken,
  useChangeAdminTokenStatus,
  useAdminTokenKYBStatus,
} from "../../../../../src/controller/query/admin/tokens/useAdminTokens";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import * as tokensService from "../../../../../src/controller/query/admin/tokens/tokens.service";

jest.mock("@/context/AlertProvider", () => ({
  useAlert: () => ({
    showAlert: jest.fn(),
  }),
}));

jest.mock("../../../../../src/controller/query/admin/tokens/tokens.service");

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

describe("controller/query/admin/tokens/useAdminTokens.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(useAdminTokensList).toBeDefined();
    expect(useCreateAdminToken).toBeDefined();
    expect(useChangeAdminTokenStatus).toBeDefined();
    expect(useAdminTokenKYBStatus).toBeDefined();
  });

  it("useAdminTokensList - returns query hook", () => {
    const mockData = { message: { data: [] } };
    jest.mocked(tokensService.getAdminTokensList).mockResolvedValue(mockData as any);

    const { result } = renderHook(
      () => useAdminTokensList({ page: 1, limit: 10 }, "test-api-key", true),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
  });

  it("useAdminTokensList - requires apiKey", () => {
    const { result } = renderHook(() => useAdminTokensList({ page: 1 }, null, true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isEnabled).toBe(false);
  });

  it("useCreateAdminToken - returns mutation hook", () => {
    const { result } = renderHook(() => useCreateAdminToken(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
  });

  it("useChangeAdminTokenStatus - returns mutation hook", () => {
    const { result } = renderHook(() => useChangeAdminTokenStatus(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
  });

  it("useAdminTokenKYBStatus - returns query hook", () => {
    const mockData = { message: {} };
    jest.mocked(tokensService.getAdminTokenKYBStatus).mockResolvedValue(mockData as any);

    const { result } = renderHook(
      () => useAdminTokenKYBStatus({ token_id: 1 }, "test-api-key", true),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
  });
});