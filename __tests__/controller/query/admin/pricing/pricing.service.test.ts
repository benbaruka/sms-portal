
import {
  getActivePricingConfig,
  getAllPricingTiers,
  updatePurchasePrice,
} from "../../../../../src/controller/query/admin/pricing/pricing.service";

jest.mock("@/controller/api/config/config", () => ({
  billingApiRequest: jest.fn(),
}));

jest.mock("@/utils/errorHandler", () => ({
  handleAxiosError: jest.fn((error) => {
    throw error;
  }),
}));

jest.mock("axios");
jest.mock("@/controller/api/constant/apiLink", () => ({
  adminPricing: {
    configActive: "/admin/pricing/config/active",
    updatePurchasePrice: "/admin/pricing/config/update",
    tiersList: "/admin/pricing/tiers",
  },
}));

describe("controller/query/admin/pricing/pricing.service.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(getActivePricingConfig).toBeDefined();
    expect(updatePurchasePrice).toBeDefined();
    expect(getAllPricingTiers).toBeDefined();
  });

  it("exports expected functions", async () => {
    const module = await import("@/controller/query/admin/pricing/pricing.service");
    const exports = Object.keys(module);
    expect(exports.length).toBeGreaterThan(0);
  });

  it("getActivePricingConfig - makes API call", async () => {
    const { billingApiRequest } = await import("@/controller/api/config/config");
    (billingApiRequest as any).mockResolvedValue({
      data: { message: {} },
    });

    const result = await getActivePricingConfig("test-api-key");

    expect(billingApiRequest).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("updatePurchasePrice - makes API call", async () => {
    const { billingApiRequest } = await import("@/controller/api/config/config");
    (billingApiRequest as any).mockResolvedValue({
      data: { message: { status: "success" } },
    });

    const result = await updatePurchasePrice({ purchase_price: 10 }, "test-api-key");

    expect(billingApiRequest).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("getAllPricingTiers - makes API call", async () => {
    const { billingApiRequest } = await import("@/controller/api/config/config");
    (billingApiRequest as any).mockResolvedValue({
      data: { message: { tiers: [] } },
    });

    const result = await getAllPricingTiers("test-api-key");

    expect(billingApiRequest).toHaveBeenCalled();
    expect(result).toBeDefined();
  });
});
