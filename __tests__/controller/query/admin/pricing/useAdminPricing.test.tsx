import { renderHook } from "@testing-library/react";

import {
  useActivePricingConfig,
  useUpdatePurchasePrice,
  useAllPricingTiers,
  useCreatePricingTier,
  useUpdatePricingTier,
  useTogglePricingTier,
} from "../../../../../src/controller/query/admin/pricing/useAdminPricing";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import * as pricingService from "../../../../../src/controller/query/admin/pricing/pricing.service";

jest.mock("@/context/AlertProvider", () => ({
  useAlert: () => ({
    showAlert: jest.fn(),
  }),
}));

jest.mock("../../../../../src/controller/query/admin/pricing/pricing.service");

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

describe("controller/query/admin/pricing/useAdminPricing.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(useActivePricingConfig).toBeDefined();
    expect(useUpdatePurchasePrice).toBeDefined();
    expect(useAllPricingTiers).toBeDefined();
    expect(useCreatePricingTier).toBeDefined();
  });

  it("useActivePricingConfig - returns query hook", () => {
    const mockData = { message: {} };
    jest.mocked(pricingService.getActivePricingConfig).mockResolvedValue(mockData as any);

    const { result } = renderHook(() => useActivePricingConfig("test-api-key", true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("useActivePricingConfig - requires apiKey", () => {
    const { result } = renderHook(() => useActivePricingConfig(null, true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isEnabled).toBe(false);
  });

  it("useUpdatePurchasePrice - returns mutation hook", () => {
    const { result } = renderHook(() => useUpdatePurchasePrice(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
  });

  it("useAllPricingTiers - returns query hook", () => {
    const mockData = { message: { tiers: [] } };
    jest.mocked(pricingService.getAllPricingTiers).mockResolvedValue(mockData as any);

    const { result } = renderHook(() => useAllPricingTiers("test-api-key", true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("useCreatePricingTier - returns mutation hook", () => {
    const { result } = renderHook(() => useCreatePricingTier(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
  });

  it("useUpdatePricingTier - returns mutation hook", () => {
    const { result } = renderHook(() => useUpdatePricingTier(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
  });

  it("useTogglePricingTier - returns mutation hook", () => {
    const { result } = renderHook(() => useTogglePricingTier(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
  });
});
