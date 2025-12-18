
import {
  getAdminKYBPendings,
  getAdminKYBHistory,
  approveAdminKYB,
  rejectAdminKYB,
} from "../../../../../src/controller/query/admin/kyb/kyb.service";
import axios from "axios";

jest.mock("@/controller/api/config/config", () => ({
  billingApiRequest: jest.fn(),
}));

jest.mock("axios");
jest.mock("@/controller/api/constant/apiLink", () => ({
  adminKyb: {
    pending: "/admin/kyb/pending",
    history: "/admin/kyb/history",
    approve: "/admin/kyb/approve",
    reject: "/admin/kyb/reject",
  },
}));

describe("controller/query/admin/kyb/kyb.service.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(getAdminKYBPendings).toBeDefined();
    expect(getAdminKYBHistory).toBeDefined();
    expect(approveAdminKYB).toBeDefined();
    expect(rejectAdminKYB).toBeDefined();
  });

  it("exports expected functions", async () => {
    const module = await import("../../../../../src/controller/query/admin/kyb/kyb.service");
    const exports = Object.keys(module);
    expect(exports.length).toBeGreaterThan(0);
  });

  it("getAdminKYBPendings - makes API call", async () => {
    const { billingApiRequest } = await import("@/controller/api/config/config");
    (billingApiRequest as any).mockResolvedValue({
      data: { message: { data: [] } },
    });

    const result = await getAdminKYBPendings({ page: 1 }, "test-api-key");

    expect(billingApiRequest).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("getAdminKYBHistory - makes API call", async () => {
    const { billingApiRequest } = await import("@/controller/api/config/config");
    (billingApiRequest as any).mockResolvedValue({
      data: { message: { data: [] } },
    });

    const result = await getAdminKYBHistory({ page: 1 }, "test-api-key");

    expect(billingApiRequest).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("approveAdminKYB - makes API call", async () => {
    const { billingApiRequest } = await import("@/controller/api/config/config");
    (billingApiRequest as any).mockResolvedValue({
      data: { message: { status: "approved" } },
    });

    const result = await approveAdminKYB({ kyb_id: 1 }, "test-api-key");

    expect(billingApiRequest).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("rejectAdminKYB - makes API call", async () => {
    const { billingApiRequest } = await import("@/controller/api/config/config");
    (billingApiRequest as any).mockResolvedValue({
      data: { message: { status: "rejected" } },
    });

    const result = await rejectAdminKYB({ kyb_id: 1, reason: "Invalid documents" }, "test-api-key");

    expect(billingApiRequest).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("handles 503 error gracefully", async () => {
    const { billingApiRequest } = await import("@/controller/api/config/config");
    const axiosError = {
      isAxiosError: true,
      response: { status: 503, data: { message: "Service unavailable" } },
    };
    (axios.isAxiosError as any).mockImplementation((error) => error === axiosError);
    (billingApiRequest as any).mockRejectedValue(axiosError);

    await expect(getAdminKYBPendings({ page: 1 }, "test-api-key")).rejects.toThrow(
      "Service temporarily unavailable"
    );
  });
});
