import { renderHook } from "@testing-library/react";

import {
  useAdminGlobalStatistics,
  useAdminBillingStatistics,
  useAdminClientStatistics,
} from "../../../../../src/controller/query/admin/statistics/useAdminStatistics";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import * as statisticsService from "../../../../../src/controller/query/admin/statistics/statistics.service";

jest.mock("@/context/AlertProvider", () => ({
  useAlert: () => ({
    showAlert: jest.fn(),
  }),
}));

jest.mock("../../../../../src/controller/query/admin/statistics/statistics.service");

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

describe("controller/query/admin/statistics/useAdminStatistics.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(useAdminGlobalStatistics).toBeDefined();
    expect(useAdminBillingStatistics).toBeDefined();
    expect(useAdminClientStatistics).toBeDefined();
  });

  it("useAdminGlobalStatistics - returns query hook", () => {
    const mockData = { message: {} };
    jest.mocked(statisticsService.getAdminGlobalStatistics).mockResolvedValue(mockData as any);

    const { result } = renderHook(
      () => useAdminGlobalStatistics({ page: 1 }, "test-api-key", true),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
  });

  it("useAdminGlobalStatistics - requires apiKey", () => {
    const { result } = renderHook(() => useAdminGlobalStatistics({}, null, true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isEnabled).toBe(false);
  });

  it("useAdminBillingStatistics - returns query hook", () => {
    const mockData = { message: {} };
    jest.mocked(statisticsService.getAdminBillingStatistics).mockResolvedValue(mockData as any);

    const { result } = renderHook(
      () => useAdminBillingStatistics({ page: 1 }, "test-api-key", true),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
  });

  it("useAdminClientStatistics - returns query hook", () => {
    const mockData = { message: {} };
    jest.mocked(statisticsService.getAdminClientStatistics).mockResolvedValue(mockData as any);

    const { result } = renderHook(
      () => useAdminClientStatistics({ page: 1 }, "test-api-key", true),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
  });
});