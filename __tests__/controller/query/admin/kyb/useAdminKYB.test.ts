import { renderHook } from "@testing-library/react";

import {
  useAdminKYBPendings,
  useAdminKYBHistory,
  useAdminKYBDetails,
  useApproveAdminKYB,
  useRejectAdminKYB,
} from "../../../../../src/controller/query/admin/kyb/useAdminKYB";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import * as kybService from "../../../../../src/controller/query/admin/kyb/kyb.service";

jest.mock("@/context/AlertProvider", () => ({
  useAlert: () => ({
    showAlert: jest.fn(),
  }),
}));

jest.mock("../../../../../src/controller/query/admin/kyb/kyb.service");

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

describe("controller/query/admin/kyb/useAdminKYB.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(useAdminKYBPendings).toBeDefined();
    expect(useAdminKYBHistory).toBeDefined();
    expect(useAdminKYBDetails).toBeDefined();
    expect(useApproveAdminKYB).toBeDefined();
    expect(useRejectAdminKYB).toBeDefined();
  });

  it("useAdminKYBPendings - returns query hook", () => {
    const mockData = { message: { data: [] } };
    jest.mocked(kybService.getAdminKYBPendings).mockResolvedValue(mockData as any);

    const { result } = renderHook(() => useAdminKYBPendings({}, "test-api-key", true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("useAdminKYBPendings - requires apiKey", () => {
    const { result } = renderHook(() => useAdminKYBPendings({}, null, true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isEnabled).toBe(false);
  });

  it("useAdminKYBHistory - returns query hook", () => {
    const mockData = { message: { data: [] } };
    jest.mocked(kybService.getAdminKYBHistory).mockResolvedValue(mockData as any);

    const { result } = renderHook(() => useAdminKYBHistory({}, "test-api-key", true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("useAdminKYBDetails - returns query hook", () => {
    const mockData = { message: {} };
    jest.mocked(kybService.getAdminKYBDetails).mockResolvedValue(mockData as any);

    const { result } = renderHook(
      () => useAdminKYBDetails({ kyb_id: 1 }, "test-api-key", true),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
  });

  it("useApproveAdminKYB - returns mutation hook", () => {
    const { result } = renderHook(() => useApproveAdminKYB(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
  });

  it("useRejectAdminKYB - returns mutation hook", () => {
    const { result } = renderHook(() => useRejectAdminKYB(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
  });
});