import { renderHook } from "@testing-library/react";

import {
  useAdminDocumentsList,
  useAdminDocumentTypes,
  useAdminDocumentType,
  useCreateAdminDocument,
  useUpdateAdminDocumentContent,
} from "../../../../../src/controller/query/admin/documents/useAdminDocuments";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import * as documentsService from "../../../../../src/controller/query/admin/documents/documents.service";

jest.mock("@/context/AlertProvider", () => ({
  useAlert: () => ({
    showAlert: jest.fn(),
  }),
}));

jest.mock("../../../../../src/controller/query/admin/documents/documents.service");

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

describe("controller/query/admin/documents/useAdminDocuments.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(useAdminDocumentsList).toBeDefined();
    expect(useAdminDocumentTypes).toBeDefined();
    expect(useCreateAdminDocument).toBeDefined();
  });

  it("useAdminDocumentsList - returns query hook", () => {
    const mockData = { message: { data: [] } };
    jest.mocked(documentsService.getAdminDocumentsList).mockResolvedValue(mockData as any);

    const { result } = renderHook(
      () => useAdminDocumentsList({ client_id: 1 }, "test-api-key", true),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
  });

  it("useAdminDocumentsList - requires valid client_id", () => {
    const { result } = renderHook(
      () => useAdminDocumentsList({ client_id: 0 }, "test-api-key", true),
      { wrapper: createWrapper() }
    );

    expect(result.current.isEnabled).toBe(false);
  });

  it("useAdminDocumentTypes - returns query hook", () => {
    const mockData = { message: { types: [] } };
    jest.mocked(documentsService.getAdminDocumentTypes).mockResolvedValue(mockData as any);

    const { result } = renderHook(() => useAdminDocumentTypes("test-api-key", true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("useAdminDocumentType - returns query hook", () => {
    const mockData = { message: {} };
    jest.mocked(documentsService.getAdminDocumentType).mockResolvedValue(mockData as any);

    const { result } = renderHook(
      () => useAdminDocumentType({ document_type_id: 1 }, "test-api-key", true),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
  });

  it("useCreateAdminDocument - returns mutation hook", () => {
    const { result } = renderHook(() => useCreateAdminDocument(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
  });

  it("useUpdateAdminDocumentContent - returns mutation hook", () => {
    const { result } = renderHook(() => useUpdateAdminDocumentContent(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
  });
});