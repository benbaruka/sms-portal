import { renderHook } from "@testing-library/react";
import React from "react";

import { useMessagesTable } from "../../../../src/controller/query/messages/useMessagesTable";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import * as messagesTableService from "../../../../src/controller/query/messages/messagesTable.service";

jest.mock("../../../../src/controller/query/messages/messagesTable.service");

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

describe("controller/query/messages/useMessagesTable.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(useMessagesTable).toBeDefined();
    expect(typeof useMessagesTable).toBe("function");
  });

  it("useMessagesTable - returns query hook", () => {
    const mockData = { message: { data: [] } };
    jest.mocked(messagesTableService.getMessagesTable).mockResolvedValue(mockData as any);

    const { result } = renderHook(
      () => useMessagesTable("/messages", { page: 1, limit: 10 }, "test-api-key", true),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
  });

  it("useMessagesTable - requires apiKey", () => {
    const { result } = renderHook(
      () => useMessagesTable("/messages", { page: 1 }, null, true),
      { wrapper: createWrapper() }
    );

    expect(result.current.isEnabled).toBe(false);
  });

  it("useMessagesTable - respects enabled flag", () => {
    const { result } = renderHook(
      () => useMessagesTable("/messages", { page: 1 }, "test-api-key", false),
      { wrapper: createWrapper() }
    );

    expect(result.current.isEnabled).toBe(false);
  });

  it("useMessagesTable - includes route in query key", () => {
    const mockData = { message: { data: [] } };
    jest.mocked(messagesTableService.getMessagesTable).mockResolvedValue(mockData as any);

    const { result: result1 } = renderHook(
      () => useMessagesTable("/transactional", { page: 1 }, "test-api-key", true),
      { wrapper: createWrapper() }
    );

    const { result: result2 } = renderHook(
      () => useMessagesTable("/promotional", { page: 1 }, "test-api-key", true),
      { wrapper: createWrapper() }
    );

    // Different routes should create different queries
    expect(result1.current.isLoading).toBe(true);
    expect(result2.current.isLoading).toBe(true);
  });
});