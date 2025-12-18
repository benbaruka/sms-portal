import { renderHook } from "@testing-library/react";

import {
  useAdminModulesList,
  useCreateAdminModule,
  useDeleteAdminModule,
} from "../../../../../src/controller/query/admin/modules/useAdminModules";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import * as modulesService from "../../../../../src/controller/query/admin/modules/modules.service";

jest.mock("@/context/AlertProvider", () => ({
  useAlert: () => ({
    showAlert: jest.fn(),
  }),
}));

jest.mock("../../../../../src/controller/query/admin/modules/modules.service");

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

describe("controller/query/admin/modules/useAdminModules.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(useAdminModulesList).toBeDefined();
    expect(useCreateAdminModule).toBeDefined();
    expect(useDeleteAdminModule).toBeDefined();
  });

  it("useAdminModulesList - returns query hook", () => {
    const mockData = { message: { modules: [] } };
    jest.mocked(modulesService.getAdminModulesList).mockResolvedValue(mockData as any);

    const { result } = renderHook(() => useAdminModulesList("test-api-key", true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("useAdminModulesList - requires apiKey", () => {
    const { result } = renderHook(() => useAdminModulesList(null, true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isEnabled).toBe(false);
  });

  it("useCreateAdminModule - returns mutation hook", () => {
    const { result } = renderHook(() => useCreateAdminModule(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
  });

  it("useDeleteAdminModule - returns mutation hook", () => {
    const { result } = renderHook(() => useDeleteAdminModule(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
  });
});