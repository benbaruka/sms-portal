import { renderHook } from "@testing-library/react";

import {
  useClientTokensList,
  useClientKYBStatus,
  useCreateClientLiveToken,
  useDeleteClientToken,
} from "../../../../../src/controller/query/client/tokens/useClientTokens";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import * as tokensService from "../../../../../src/controller/query/client/tokens/tokens.service";

jest.mock("@/context/AlertProvider", () => ({
  useAlert: () => ({
    showAlert: jest.fn(),
  }),
}));

jest.mock("cookies-next", () => ({
  getCookie: jest.fn(() => null),
}));

jest.mock("@/controller/hook/useGetToken", () => ({
  getToken: jest.fn(() => null),
}));

jest.mock("../../../../../src/controller/query/client/tokens/tokens.service");

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

describe("controller/query/client/tokens/useClientTokens.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("module loads", () => {
    expect(useClientTokensList).toBeDefined();
    expect(useClientKYBStatus).toBeDefined();
    expect(useCreateClientLiveToken).toBeDefined();
    expect(useDeleteClientToken).toBeDefined();
  });

  it("useClientTokensList - returns query hook", () => {
    const mockData = { message: { data: [] } };
    jest.mocked(tokensService.getClientTokensList).mockResolvedValue(mockData as any);

    const { result } = renderHook(
      () => useClientTokensList({ page: 1, limit: 10 }, "test-api-key", true),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
  });

  it("useClientTokensList - requires apiKey", () => {
    const { result } = renderHook(() => useClientTokensList({ page: 1 }, null, true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isEnabled).toBe(false);
  });

  it("useClientKYBStatus - returns query hook", () => {
    const mockData = { message: {} };
    jest.mocked(tokensService.getClientKYBStatus).mockResolvedValue(mockData as any);

    const { result } = renderHook(() => useClientKYBStatus(1, "test-api-key", true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("useCreateClientLiveToken - returns mutation hook", () => {
    const { result } = renderHook(() => useCreateClientLiveToken(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
  });

  it("useDeleteClientToken - returns mutation hook", () => {
    const { result } = renderHook(() => useDeleteClientToken(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
  });
});