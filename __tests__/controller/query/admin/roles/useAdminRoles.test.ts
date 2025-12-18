import { renderHook } from "@testing-library/react";

import {
  useAdminRolesList,
  useAdminRolePermissions,
  useAdminAvailablePermissions,
  useCreateAdminRole,
  useAssignPermissionToRole,
  useRevokePermissionFromRole,
} from "../../../../../src/controller/query/admin/roles/useAdminRoles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import * as rolesService from "../../../../../src/controller/query/admin/roles/roles.service";

jest.mock("@/context/AlertProvider", () => ({
  useAlert: () => ({
    showAlert: jest.fn(),
  }),
}));

jest.mock("../../../../../src/controller/query/admin/roles/roles.service");

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

describe("controller/query/admin/roles/useAdminRoles.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(useAdminRolesList).toBeDefined();
    expect(useAdminRolePermissions).toBeDefined();
    expect(useAdminAvailablePermissions).toBeDefined();
    expect(useCreateAdminRole).toBeDefined();
  });

  it("useAdminRolesList - returns query hook", () => {
    const mockData = { message: { data: [] } };
    jest.mocked(rolesService.getAdminRolesList).mockResolvedValue(mockData as any);

    const { result } = renderHook(
      () => useAdminRolesList({ page: 1, limit: 10 }, "test-api-key", true),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
  });

  it("useAdminRolesList - requires apiKey", () => {
    const { result } = renderHook(() => useAdminRolesList({ page: 1 }, null, true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isEnabled).toBe(false);
  });

  it("useAdminRolePermissions - returns query hook", () => {
    const mockData = { message: { permissions: [] } };
    jest.mocked(rolesService.getAdminRolePermissions).mockResolvedValue(mockData as any);

    const { result } = renderHook(() => useAdminRolePermissions(1, "test-api-key", true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("useAdminAvailablePermissions - returns query hook", () => {
    const mockData = { message: { permissions: [] } };
    jest.mocked(rolesService.getAvailablePermissions).mockResolvedValue(mockData as any);

    const { result } = renderHook(() => useAdminAvailablePermissions("test-api-key", true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("useCreateAdminRole - returns mutation hook", () => {
    const { result } = renderHook(() => useCreateAdminRole(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
  });

  it("useAssignPermissionToRole - returns mutation hook", () => {
    const { result } = renderHook(() => useAssignPermissionToRole(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
  });

  it("useRevokePermissionFromRole - returns mutation hook", () => {
    const { result } = renderHook(() => useRevokePermissionFromRole(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
  });
});