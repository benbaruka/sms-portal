
import {
  getAdminGlobalStatistics,
  getAdminBillingStatistics,
} from "../../../../../src/controller/query/admin/statistics/statistics.service";
import axios from "axios";

jest.mock("@/controller/api/config/config", () => ({
  billingApiRequest: jest.fn(),
}));

jest.mock("axios");
jest.mock("@/controller/api/constant/apiLink", () => ({
  adminStatistics: {
    global: "/admin/statistics/global",
    billing: "/admin/statistics/billing",
  },
}));

describe("controller/query/admin/statistics/statistics.service.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(getAdminGlobalStatistics).toBeDefined();
    expect(getAdminBillingStatistics).toBeDefined();
  });

  it("exports expected functions", async () => {
    const module =
      await import("/home/iann/code/project/sms_portail/../../../src/controller/query/admin/statistics/statistics.service.ts");
    const exports = Object.keys(module);
    expect(exports.length).toBeGreaterThan(0);
  });

  it("getAdminGlobalStatistics - makes API call", async () => {
    const { billingApiRequest } = await import("@/controller/api/config/config");
    (billingApiRequest as any).mockResolvedValue({
      data: { message: {} },
    });

    const result = await getAdminGlobalStatistics({ page: 1 }, "test-api-key");

    expect(billingApiRequest).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("getAdminBillingStatistics - makes API call", async () => {
    const { billingApiRequest } = await import("@/controller/api/config/config");
    (billingApiRequest as any).mockResolvedValue({
      data: { message: {} },
    });

    const result = await getAdminBillingStatistics({ page: 1 }, "test-api-key");

    expect(billingApiRequest).toHaveBeenCalled();
    expect(result).toBeDefined();
  });
});
