import { renderHook } from "@testing-library/react";

import {
  useAdminSendersList,
  useAdminSenderDetails,
  useApproveAdminSender,
  useRejectAdminSender,
} from "../../../../../src/controller/query/admin/senders/useAdminSenders";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import * as sendersService from "../../../../../src/controller/query/admin/senders/senders.service";

jest.mock("@/context/AlertProvider", () => ({
  useAlert: () => ({
    showAlert: jest.fn(),
  }),
}));

jest.mock("../../../../../src/controller/query/admin/senders/senders.service");

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

describe("controller/query/admin/senders/useAdminSenders.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(useAdminSendersList).toBeDefined();
    expect(useAdminSenderDetails).toBeDefined();
    expect(useApproveAdminSender).toBeDefined();
    expect(useRejectAdminSender).toBeDefined();
  });

  it("useAdminSendersList - returns query hook", () => {
    const mockData = { message: { data: [] } };
    jest.mocked(sendersService.getAdminSendersList).mockResolvedValue(mockData as any);

    const { result } = renderHook(() => useAdminSendersList({}, "test-api-key", true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("useAdminSendersList - requires apiKey", () => {
    const { result } = renderHook(() => useAdminSendersList({}, null, true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isEnabled).toBe(false);
  });

  it("useAdminSenderDetails - returns query hook", () => {
    const mockData = { message: {} };
    jest.mocked(sendersService.getAdminSenderDetails).mockResolvedValue(mockData as any);

    const { result } = renderHook(
      () => useAdminSenderDetails({ sender_id: 1 }, "test-api-key", true),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
  });

  it("useAdminSenderDetails - requires params", () => {
    const { result } = renderHook(() => useAdminSenderDetails(null, "test-api-key", true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isEnabled).toBe(false);
  });

  it("useApproveAdminSender - returns mutation hook", () => {
    const { result } = renderHook(() => useApproveAdminSender(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
  });

  it("useRejectAdminSender - returns mutation hook", () => {
    const { result } = renderHook(() => useRejectAdminSender(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
  });
});