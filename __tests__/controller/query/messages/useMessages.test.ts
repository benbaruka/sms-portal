import { renderHook, waitFor } from "@testing-library/react";
import React from "react";

import {
  useSendTransactionalSMS,
  useSendPromotionalSMS,
  useSendBulkMsisdnSMS,
  useSendContactGroupSMS,
  useSendUploadFileSMS,
  useTransactionalHistory,
  usePromotionalHistory,
  useBulkHistory,
  useBulkGroupHistory,
  useBulkMsisdnListHistory,
  useScheduledHistory,
  useRecurringHistory,
} from "../../../../src/controller/query/messages/useMessages";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import * as messagesService from "../../../../src/controller/query/messages/messages.service";

jest.mock("@/context/AlertProvider", () => ({
  useAlert: () => ({
    showAlert: jest.fn(),
  }),
}));

jest.mock("@/context/AuthProvider", () => ({
  useAuth: () => ({
    user: { message: { client_billing: { balance: 100 } } },
    setUser: jest.fn(),
  }),
}));

jest.mock("../../../../src/controller/query/messages/messages.service");
jest.mock("../../../../src/controller/query/dashboard/dashboard.service", () => ({
  getDashboardSummary: jest.fn().mockResolvedValue({ message: { balance: 100, bonus: 0 } }),
}));

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

describe("controller/query/messages/useMessages.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(useSendTransactionalSMS).toBeDefined();
    expect(useSendPromotionalSMS).toBeDefined();
    expect(useTransactionalHistory).toBeDefined();
  });

  it("useSendTransactionalSMS - returns mutation hook", async () => {
    const { result } = renderHook(() => useSendTransactionalSMS(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    expect(result.current?.mutate).toBeDefined();
    expect(result.current?.mutateAsync).toBeDefined();
  });

  it("useSendPromotionalSMS - returns mutation hook", async () => {
    const { result } = renderHook(() => useSendPromotionalSMS(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    expect(result.current?.mutate).toBeDefined();
  });

  it("useSendBulkMsisdnSMS - returns mutation hook", async () => {
    const { result } = renderHook(() => useSendBulkMsisdnSMS(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    expect(result.current?.mutate).toBeDefined();
  });

  it("useSendContactGroupSMS - returns mutation hook", async () => {
    const { result } = renderHook(() => useSendContactGroupSMS(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    expect(result.current?.mutate).toBeDefined();
  });

  it("useSendUploadFileSMS - returns mutation hook", async () => {
    const { result } = renderHook(() => useSendUploadFileSMS(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    expect(result.current?.mutate).toBeDefined();
  });

  it("useTransactionalHistory - returns query hook", async () => {
    const mockData = { message: { data: [] } };
    jest.mocked(messagesService.getTransactionalHistory).mockResolvedValue(mockData as any);

    const { result } = renderHook(
      () => useTransactionalHistory({ page: 1, limit: 10 }, "test-api-key", true),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    expect(result.current?.isLoading || result.current?.isSuccess).toBeTruthy();
  });

  it("usePromotionalHistory - returns query hook", async () => {
    const mockData = { message: { data: [] } };
    jest.mocked(messagesService.getPromotionalHistory).mockResolvedValue(mockData as any);

    const { result } = renderHook(
      () => usePromotionalHistory({ page: 1, limit: 10 }, "test-api-key", true),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    expect(result.current?.isLoading || result.current?.isSuccess).toBeTruthy();
  });

  it("useBulkHistory - returns query hook", async () => {
    const mockData = { message: { data: [] } };
    jest.mocked(messagesService.getBulkHistory).mockResolvedValue(mockData as any);

    const { result } = renderHook(
      () => useBulkHistory({ page: 1, limit: 10 }, "test-api-key", true),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    expect(result.current?.isLoading || result.current?.isSuccess).toBeTruthy();
  });

  it("useScheduledHistory - requires apiKey", async () => {
    const { result } = renderHook(
      () => useScheduledHistory({ page: 1, limit: 10 }, null, true),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    expect(result.current?.isEnabled).toBe(false);
  });
});
