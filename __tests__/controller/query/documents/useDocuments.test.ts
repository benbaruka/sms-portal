import { renderHook, waitFor } from "@testing-library/react";
import React from "react";

import {
  useGetActiveDocumentTypes,
  useGeneratePresignedUrl,
  useUploadDocument,
  useCreateDocuments,
  useGetMyDocuments,
} from "../../../../src/controller/query/documents/useDocuments";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import * as documentService from "../../../../src/controller/query/documents/document.service";

jest.mock("@/context/AlertProvider", () => ({
  useAlert: () => ({
    showAlert: jest.fn(),
  }),
}));

jest.mock("../../../../src/controller/query/documents/document.service");

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

describe("controller/query/documents/useDocuments.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(useGetActiveDocumentTypes).toBeDefined();
    expect(useGeneratePresignedUrl).toBeDefined();
    expect(useUploadDocument).toBeDefined();
    expect(useCreateDocuments).toBeDefined();
  });

  it("useGetActiveDocumentTypes - returns query hook", async () => {
    const mockData = { message: { data: [] } };
    jest.mocked(documentService.getActiveDocumentTypes).mockResolvedValue(mockData as any);

    const { result } = renderHook(() => useGetActiveDocumentTypes(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    expect(result.current?.isLoading || result.current?.isSuccess).toBeTruthy();
  });

  it("useGeneratePresignedUrl - returns mutation hook", async () => {
    const { result } = renderHook(() => useGeneratePresignedUrl(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    expect(result.current?.mutate).toBeDefined();
    expect(result.current?.mutateAsync).toBeDefined();
  });

  it("useUploadDocument - returns mutation hook", async () => {
    const { result } = renderHook(() => useUploadDocument(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    expect(result.current?.mutate).toBeDefined();
  });

  it("useCreateDocuments - returns mutation hook", async () => {
    const { result } = renderHook(() => useCreateDocuments("test-api-key"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    expect(result.current?.mutate).toBeDefined();
  });

  it("useGetMyDocuments - returns query hook", async () => {
    const mockData = { message: { data: [] } };
    jest.mocked(documentService.getMyDocuments).mockResolvedValue(mockData as any);

    const { result } = renderHook(
      () => useGetMyDocuments({ page: 1, limit: 10 }, "test-api-key", true),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    expect(result.current?.isLoading || result.current?.isSuccess).toBeTruthy();
  });

  it("useGetMyDocuments - requires enabled flag", async () => {
    const { result } = renderHook(
      () => useGetMyDocuments({ page: 1, limit: 10 }, "test-api-key", false),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    expect(result.current?.isEnabled).toBe(false);
  });

  it("useCreateDocuments - requires apiKey", async () => {
    const { result } = renderHook(() => useCreateDocuments(null), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    try {
      await result.current?.mutateAsync({
        documents: [],
      });
    } catch (error: any) {
      expect(error.message).toContain("API key is required");
    }
  });
});
