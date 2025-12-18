import { renderHook } from "@testing-library/react";

import {
  useCreateManualTopup,
  useManualTopupRequests,
  useManualTopupRequestDetails,
  useAvailableConnectors,
} from "../../../../../src/controller/query/admin/topup/useAdminTopup";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import * as topupService from "../../../../../src/controller/query/admin/topup/topup.service";

jest.mock("@/context/AlertProvider", () => ({
  useAlert: () => ({
    showAlert: jest.fn(),
  }),
}));

jest.mock("../../../../../src/controller/query/admin/topup/topup.service");

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

describe("controller/query/admin/topup/useAdminTopup.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(useCreateManualTopup).toBeDefined();
    expect(useManualTopupRequests).toBeDefined();
    expect(useManualTopupRequestDetails).toBeDefined();
    expect(useAvailableConnectors).toBeDefined();
  });

  it("useCreateManualTopup - returns mutation hook", () => {
    const { result } = renderHook(() => useCreateManualTopup(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
  });

  it("useManualTopupRequests - returns query hook", () => {
    const mockData = { message: { data: [] } };
    jest.mocked(topupService.getManualTopupRequests).mockResolvedValue(mockData as any);

    const { result } = renderHook(
      () => useManualTopupRequests({ page: 1, limit: 10 }, "test-api-key", true),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
  });

  it("useManualTopupRequests - requires apiKey", () => {
    const { result } = renderHook(() => useManualTopupRequests({}, null, true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isEnabled).toBe(false);
  });

  it("useManualTopupRequestDetails - returns query hook", () => {
    const mockData = { message: {} };
    jest.mocked(topupService.getManualTopupRequestDetails).mockResolvedValue(mockData as any);

    const { result } = renderHook(() => useManualTopupRequestDetails(1, "test-api-key", true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("useManualTopupRequestDetails - requires requestId", () => {
    const { result } = renderHook(() => useManualTopupRequestDetails(null, "test-api-key", true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isEnabled).toBe(false);
  });

  it("useAvailableConnectors - returns query hook", () => {
    const mockData = { message: { connectors: [] } };
    jest.mocked(topupService.getAvailableConnectors).mockResolvedValue(mockData as any);

    const { result } = renderHook(() => useAvailableConnectors("test-api-key", true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });
});