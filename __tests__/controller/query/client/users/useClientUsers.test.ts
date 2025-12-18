import { renderHook } from "@testing-library/react";

import {
  useClientUsersList,
  useClientUserRoles,
  useCreateClientUser,
  useUpdateClientUser,
  useChangeClientUserStatus,
} from "../../../../../src/controller/query/client/users/useClientUsers";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import * as clientUsersService from "../../../../../src/controller/query/client/users/clientUsers.service";

jest.mock("@/context/AlertProvider", () => ({
  useAlert: () => ({
    showAlert: jest.fn(),
  }),
}));

jest.mock("../../../../../src/controller/query/client/users/clientUsers.service");

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

describe("controller/query/client/users/useClientUsers.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(useClientUsersList).toBeDefined();
    expect(useClientUserRoles).toBeDefined();
    expect(useCreateClientUser).toBeDefined();
    expect(useUpdateClientUser).toBeDefined();
  });

  it("useClientUsersList - returns query hook", () => {
    const mockData = { message: { data: [] } };
    jest.mocked(clientUsersService.getClientUsersList).mockResolvedValue(mockData as any);

    const { result } = renderHook(
      () => useClientUsersList({ page: 1, limit: 10 }, "test-api-key", true),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
  });

  it("useClientUsersList - requires apiKey", () => {
    const { result } = renderHook(() => useClientUsersList({ page: 1 }, null, true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isEnabled).toBe(false);
  });

  it("useClientUserRoles - returns query hook", () => {
    const mockData = { message: { roles: [] } };
    jest.mocked(clientUsersService.getClientUserRoles).mockResolvedValue(mockData as any);

    const { result } = renderHook(() => useClientUserRoles(1, "test-api-key", true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("useCreateClientUser - returns mutation hook", () => {
    const { result } = renderHook(() => useCreateClientUser(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
  });

  it("useUpdateClientUser - returns mutation hook", () => {
    const { result } = renderHook(() => useUpdateClientUser(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
  });

  it("useChangeClientUserStatus - returns mutation hook", () => {
    const { result } = renderHook(() => useChangeClientUserStatus(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
  });
});