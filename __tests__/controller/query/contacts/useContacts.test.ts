import { renderHook } from "@testing-library/react";

import {
  useCreateContact,
  useUploadContacts,
  useContactGroupList,
  useContactGroupsSimple,
  useContactGroup,
  useUpdateContactGroup,
  useDeleteContactGroup,
} from "../../../../src/controller/query/contacts/useContacts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import * as contactsService from "../../../../src/controller/query/contacts/contacts.service";

jest.mock("@/context/AlertProvider", () => ({
  useAlert: () => ({
    showAlert: jest.fn(),
  }),
}));

jest.mock("../../../../src/controller/query/contacts/contacts.service");

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

describe("controller/query/contacts/useContacts.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(useCreateContact).toBeDefined();
    expect(useContactGroupList).toBeDefined();
    expect(useContactGroupsSimple).toBeDefined();
  });

  it("useCreateContact - returns mutation hook", () => {
    const { result } = renderHook(() => useCreateContact(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
  });

  it("useUploadContacts - returns mutation hook", () => {
    const { result } = renderHook(() => useUploadContacts(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
  });

  it("useContactGroupList - returns query hook", () => {
    const mockData = { message: { data: [] } };
    jest.mocked(contactsService.getContactGroupList).mockResolvedValue(mockData as any);

    const { result } = renderHook(
      () => useContactGroupList({ page: 1, limit: 10 }, "test-api-key", true),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
  });

  it("useContactGroupsSimple - returns query hook", () => {
    const mockData = { message: { data: [] } };
    jest.mocked(contactsService.getContactGroupsSimple).mockResolvedValue(mockData as any);

    const { result } = renderHook(() => useContactGroupsSimple("test-api-key", true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("useContactGroup - returns query hook", () => {
    const mockData = { message: {} };
    jest.mocked(contactsService.getContactGroup).mockResolvedValue(mockData as any);

    const { result } = renderHook(() => useContactGroup({ id: 1 }, "test-api-key", true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("useUpdateContactGroup - returns mutation hook", () => {
    const { result } = renderHook(() => useUpdateContactGroup(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
  });

  it("useDeleteContactGroup - returns mutation hook", () => {
    const { result } = renderHook(() => useDeleteContactGroup(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
  });

  it("useContactGroupList - requires apiKey", () => {
    const { result } = renderHook(() => useContactGroupList({}, null, true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isEnabled).toBe(false);
  });
});
