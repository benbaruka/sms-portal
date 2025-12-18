import { renderHook } from "@testing-library/react";

import {
  useAdminUsersList,
  useAdminUserDetails,
  useCreateAdminUser,
  useUpdateAdminUser,
  useChangeAdminUserStatus,
} from "../../../../../src/controller/query/admin/users/useAdminUsers";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import * as usersService from "../../../../../src/controller/query/admin/users/users.service";

jest.mock("@/context/AlertProvider", () => ({
  useAlert: () => ({
    showAlert: jest.fn(),
  }),
}));

jest.mock("../../../../../src/controller/query/admin/users/users.service");

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

describe("controller/query/admin/users/useAdminUsers.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(useAdminUsersList).toBeDefined();
    expect(useAdminUserDetails).toBeDefined();
    expect(useCreateAdminUser).toBeDefined();
    expect(useUpdateAdminUser).toBeDefined();
  });

  it("useAdminUsersList - returns query hook", () => {
    const mockData = { message: { data: [] } };
    jest.mocked(usersService.getAdminUsersList).mockResolvedValue(mockData as any);

    const { result } = renderHook(
      () => useAdminUsersList({ page: 1, limit: 10 }, "test-api-key", true),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
  });

  it("useAdminUsersList - requires apiKey", () => {
    const { result } = renderHook(() => useAdminUsersList({ page: 1 }, null, true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isEnabled).toBe(false);
  });

  it("useAdminUserDetails - returns query hook", () => {
    const mockData = { message: {} };
    jest.mocked(usersService.getAdminUserDetails).mockResolvedValue(mockData as any);

    const { result } = renderHook(
      () => useAdminUserDetails({ user_id: 1 }, "test-api-key", true),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
  });

  it("useAdminUserDetails - requires user_id", () => {
    const { result } = renderHook(() => useAdminUserDetails(null, "test-api-key", true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isEnabled).toBe(false);
  });

  it("useCreateAdminUser - returns mutation hook", () => {
    const { result } = renderHook(() => useCreateAdminUser(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
  });

  it("useUpdateAdminUser - returns mutation hook", () => {
    const { result } = renderHook(() => useUpdateAdminUser(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
  });

  it("useChangeAdminUserStatus - returns mutation hook", () => {
    const { result } = renderHook(() => useChangeAdminUserStatus(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
  });
});