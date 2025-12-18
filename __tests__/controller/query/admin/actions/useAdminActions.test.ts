import { renderHook } from "@testing-library/react";

import {
  useAdminActionsList,
  useCreateAdminAction,
  useDeleteAdminAction,
} from "../../../../../src/controller/query/admin/actions/useAdminActions";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import * as actionsService from "../../../../../src/controller/query/admin/actions/actions.service";

jest.mock("@/context/AlertProvider", () => ({
  useAlert: () => ({
    showAlert: jest.fn(),
  }),
}));

jest.mock("../../../../../src/controller/query/admin/actions/actions.service");

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

describe("controller/query/admin/actions/useAdminActions.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(useAdminActionsList).toBeDefined();
    expect(useCreateAdminAction).toBeDefined();
    expect(useDeleteAdminAction).toBeDefined();
  });

  it("useAdminActionsList - returns query hook", () => {
    const mockData = { message: { actions: [] } };
    jest.mocked(actionsService.getAdminActionsList).mockResolvedValue(mockData as any);

    const { result } = renderHook(() => useAdminActionsList("test-api-key", true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("useAdminActionsList - requires apiKey", () => {
    const { result } = renderHook(() => useAdminActionsList(null, true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isEnabled).toBe(false);
  });

  it("useCreateAdminAction - returns mutation hook", () => {
    const { result } = renderHook(() => useCreateAdminAction(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
  });

  it("useDeleteAdminAction - returns mutation hook", () => {
    const { result } = renderHook(() => useDeleteAdminAction(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
  });
});