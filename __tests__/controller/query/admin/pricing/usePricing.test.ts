import { beforeEach, describe, expect, it } from "@jest/globals";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import {
  useGetPricingConfig,
  useUpdatePricingConfig,
  useGetPricingTiers,
  useCreatePricingTier,
  useUpdatePricingTier,
  useTogglePricingTier,
} from "../../../../../src/controller/query/admin/pricing/usePricing";

const mockShowAlert = jest.fn();
const mockGetPricingConfig = jest.fn();
const mockUpdatePricingConfig = jest.fn();
const mockGetPricingTiers = jest.fn();
const mockCreatePricingTier = jest.fn();
const mockUpdatePricingTier = jest.fn();
const mockTogglePricingTier = jest.fn();

jest.mock("@/context/AlertProvider", () => ({
  useAlert: () => ({
    showAlert: mockShowAlert,
  }),
}));

jest.mock("../../../../../src/controller/query/admin/pricing/pricing.service", () => ({
  getPricingConfig: (...args: any[]) => mockGetPricingConfig(...args),
  updatePricingConfig: (...args: any[]) => mockUpdatePricingConfig(...args),
  getPricingTiers: (...args: any[]) => mockGetPricingTiers(...args),
  createPricingTier: (...args: any[]) => mockCreatePricingTier(...args),
  updatePricingTier: (...args: any[]) => mockUpdatePricingTier(...args),
  togglePricingTier: (...args: any[]) => mockTogglePricingTier(...args),
}));

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

describe("controller/query/admin/pricing/usePricing.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(useGetPricingConfig).toBeDefined();
    expect(useUpdatePricingConfig).toBeDefined();
    expect(useGetPricingTiers).toBeDefined();
    expect(useCreatePricingTier).toBeDefined();
    expect(useUpdatePricingTier).toBeDefined();
    expect(useTogglePricingTier).toBeDefined();
  });

  it("exports expected hooks", async () => {
    const Module = await import("../../../../../src/controller/query/admin/pricing/usePricing");
    const exports = Object.keys(Module);
    expect(exports.length).toBeGreaterThan(0);
  });

  describe("useGetPricingConfig", () => {
    it("fetches pricing config when apiKey is provided", async () => {
      mockGetPricingConfig.mockResolvedValue({ message: { config: {} } });

      const { result } = renderHook(() => useGetPricingConfig("test-api-key", true), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      }, { timeout: 10000 }););

      expect(mockGetPricingConfig).toHaveBeenCalled();
    });

    it("does not fetch when apiKey is null", () => {
      const { result } = renderHook(() => useGetPricingConfig(null, true), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
      expect(mockGetPricingConfig).not.toHaveBeenCalled();
    });

    it("shows error alert on failure", async () => {
      mockGetPricingConfig.mockRejectedValue(new Error("Failed to fetch"));

      const { result } = renderHook(() => useGetPricingConfig("test-api-key", true), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      }, { timeout: 10000 }););

      await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: "error",
            title: "Error",
          })
        );
      });
    });
  });

  describe("useUpdatePricingConfig", () => {
    it("updates pricing config and shows success alert", async () => {
      mockUpdatePricingConfig.mockResolvedValue({ message: { message: "Updated" } });

      const { result } = renderHook(() => useUpdatePricingConfig(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        data: { purchase_price: 10 },
        apiKey: "test-api-key",
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      }, { timeout: 10000 }););

      expect(mockUpdatePricingConfig).toHaveBeenCalled();
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "success",
          title: "Success",
        })
      );
    });

    it("shows error alert on failure", async () => {
      mockUpdatePricingConfig.mockRejectedValue(new Error("Failed"));

      const { result } = renderHook(() => useUpdatePricingConfig(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        data: { purchase_price: 10 },
        apiKey: "test-api-key",
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      }, { timeout: 10000 }););

      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "error",
          title: "Error",
        })
      );
    });
  });

  describe("useGetPricingTiers", () => {
    it("fetches pricing tiers when apiKey is provided", async () => {
      mockGetPricingTiers.mockResolvedValue({ message: { tiers: [] } });

      const { result } = renderHook(() => useGetPricingTiers("test-api-key", true), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      }, { timeout: 10000 }););

      expect(mockGetPricingTiers).toHaveBeenCalled();
    });

    it("does not fetch when apiKey is null", () => {
      const { result } = renderHook(() => useGetPricingTiers(null, true), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
      expect(mockGetPricingTiers).not.toHaveBeenCalled();
    });
  });

  describe("useCreatePricingTier", () => {
    it("creates pricing tier and shows success alert", async () => {
      mockCreatePricingTier.mockResolvedValue({ message: { message: "Created" } });

      const { result } = renderHook(() => useCreatePricingTier(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        data: { name: "Tier 1", min_amount: 0, max_amount: 100 },
        apiKey: "test-api-key",
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      }, { timeout: 10000 }););

      expect(mockCreatePricingTier).toHaveBeenCalled();
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "success",
        })
      );
    });
  });

  describe("useUpdatePricingTier", () => {
    it("updates pricing tier and shows success alert", async () => {
      mockUpdatePricingTier.mockResolvedValue({ message: { message: "Updated" } });

      const { result } = renderHook(() => useUpdatePricingTier(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        data: { id: 1, name: "Updated Tier" },
        apiKey: "test-api-key",
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      }, { timeout: 10000 }););

      expect(mockUpdatePricingTier).toHaveBeenCalled();
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "success",
        })
      );
    });
  });

  describe("useTogglePricingTier", () => {
    it("toggles pricing tier and shows success alert", async () => {
      mockTogglePricingTier.mockResolvedValue({
        message: { message: "Toggled", is_active: true },
      });

      const { result } = renderHook(() => useTogglePricingTier(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        data: { id: 1 },
        apiKey: "test-api-key",
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      }, { timeout: 10000 }););

      expect(mockTogglePricingTier).toHaveBeenCalled();
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "success",
        })
      );
    });
  });
});