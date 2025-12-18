import { renderHook } from "@testing-library/react";

import {
  useDashboardSummary,
  useMessagesSentByType,
  useMessageGraph,
  useMessageNetworkGraph,
  useScheduledMessages,
  useBillingStats,
  useClientsList,
  useClientReports,
  useClientTransactionalSMS,
  useClientPromotionalSMS,
} from "../../../../src/controller/query/dashboard/useDashboard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import * as dashboardService from "../../../../src/controller/query/dashboard/dashboard.service";

jest.mock("@/context/AlertProvider", () => ({
  useAlert: () => ({
    showAlert: jest.fn(),
  }),
}));

jest.mock("../../../../src/controller/query/dashboard/dashboard.service");

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

describe("controller/query/dashboard/useDashboard.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(useDashboardSummary).toBeDefined();
    expect(useMessagesSentByType).toBeDefined();
    expect(useMessageGraph).toBeDefined();
    expect(useScheduledMessages).toBeDefined();
  });

  it("useDashboardSummary - returns query hook", () => {
    const mockData = { message: {} };
    jest.mocked(dashboardService.getDashboardSummary).mockResolvedValue(mockData as any);

    const { result } = renderHook(() => useDashboardSummary({}, "test-api-key", true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("useDashboardSummary - requires apiKey", () => {
    const { result } = renderHook(() => useDashboardSummary({}, null, true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isEnabled).toBe(false);
  });

  it("useMessagesSentByType - returns query hook", () => {
    const mockData = { message: { data: [] } };
    jest.mocked(dashboardService.getMessagesSentByType).mockResolvedValue(mockData as any);

    const { result } = renderHook(
      () => useMessagesSentByType("promotional", { page: 1 }, "test-api-key", true),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
  });

  it("useMessageGraph - returns query hook", () => {
    const mockData = { message: { data: [] } };
    jest.mocked(dashboardService.getMessageGraph).mockResolvedValue(mockData as any);

    const { result } = renderHook(
      () => useMessageGraph("transactional", { page: 1 }, "test-api-key", true),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
  });

  it("useMessageNetworkGraph - returns query hook", () => {
    const mockData = { message: { data: [] } };
    jest.mocked(dashboardService.getMessageNetworkGraph).mockResolvedValue(mockData as any);

    const { result } = renderHook(
      () => useMessageNetworkGraph("promotional", { page: 1 }, "test-api-key", true),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
  });

  it("useScheduledMessages - returns query hook", () => {
    const mockData = { message: { data: [] } };
    jest.mocked(dashboardService.getScheduledMessages).mockResolvedValue(mockData as any);

    const { result } = renderHook(
      () => useScheduledMessages({ page: 1 }, "test-api-key", true),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
  });

  it("useBillingStats - returns query hook", () => {
    const mockData = { message: {} };
    jest.mocked(dashboardService.getBillingStats).mockResolvedValue(mockData as any);

    const { result } = renderHook(
      () => useBillingStats({ page: 1 }, "test-api-key", true),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
  });

  it("useClientsList - returns query hook", () => {
    const mockData = { message: { data: [] } };
    jest.mocked(dashboardService.getClientsList).mockResolvedValue(mockData as any);

    const { result } = renderHook(
      () => useClientsList({ page: 1 }, "test-api-key", true),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
  });

  it("useClientReports - requires valid id", () => {
    const { result } = renderHook(
      () => useClientReports("summary", { id: 0 }, "test-api-key", true, false),
      { wrapper: createWrapper() }
    );

    expect(result.current.isEnabled).toBe(false);
  });

  it("useClientTransactionalSMS - returns query hook", () => {
    const mockData = { message: { data: [] } };
    jest.mocked(dashboardService.getClientTransactionalSMS).mockResolvedValue(mockData as any);

    const { result } = renderHook(
      () => useClientTransactionalSMS({ page: 1 }, "test-api-key", true),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
  });

  it("useClientPromotionalSMS - returns query hook", () => {
    const mockData = { message: { data: [] } };
    jest.mocked(dashboardService.getClientPromotionalSMS).mockResolvedValue(mockData as any);

    const { result } = renderHook(
      () => useClientPromotionalSMS({ page: 1 }, "test-api-key", true),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
  });
});
