
import {
  getBenefitGraph,
  getBenefitByTier,
  getBenefitByClient,
} from "../../../../../src/controller/query/admin/benefit/benefit.service";
import axios from "axios";

jest.mock("@/controller/api/config/config", () => ({
  billingApiRequest: jest.fn(),
}));

jest.mock("axios");
jest.mock("@/controller/api/constant/apiLink", () => ({
  adminBenefit: {
    graph: "/admin/benefit/graph",
    byTier: "/admin/benefit/by-tier",
    byClient: "/admin/benefit/by-client",
  },
}));

describe("controller/query/admin/benefit/benefit.service.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(getBenefitGraph).toBeDefined();
    expect(getBenefitByTier).toBeDefined();
    expect(getBenefitByClient).toBeDefined();
  });

  it("exports expected functions", async () => {
    const module =
      await import("/home/iann/code/project/sms_portail/../../../src/controller/query/admin/benefit/benefit.service.ts");
    const exports = Object.keys(module);
    expect(exports.length).toBeGreaterThan(0);
  });

  it("getBenefitGraph - makes API call", async () => {
    const { billingApiRequest } = await import("@/controller/api/config/config");
    (billingApiRequest as any).mockResolvedValue({
      data: { message: { data: [] } },
    });

    const result = await getBenefitGraph({}, "test-api-key");

    expect(billingApiRequest).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("getBenefitByTier - makes API call", async () => {
    const { billingApiRequest } = await import("@/controller/api/config/config");
    (billingApiRequest as any).mockResolvedValue({
      data: { message: {} },
    });

    const result = await getBenefitByTier({ tier_id: 1 }, "test-api-key");

    expect(billingApiRequest).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("getBenefitByClient - makes API call", async () => {
    const { billingApiRequest } = await import("@/controller/api/config/config");
    (billingApiRequest as any).mockResolvedValue({
      data: { message: {} },
    });

    const result = await getBenefitByClient({ client_id: 1 }, "test-api-key");

    expect(billingApiRequest).toHaveBeenCalled();
    expect(result).toBeDefined();
  });
});
