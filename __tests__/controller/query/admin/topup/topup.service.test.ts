
import {
  createManualTopup,
  getManualTopupRequests,
} from "../../../../../src/controller/query/admin/topup/topup.service";
import axios from "axios";

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
  topup: {
    createManualTopup: "/admin/topup/create",
    manualTopupRequests: "/admin/topup/requests",
  },
}));

describe("controller/query/admin/topup/topup.service.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(createManualTopup).toBeDefined();
    expect(getManualTopupRequests).toBeDefined();
  });

  it("exports expected functions", async () => {
    const module =
      await import("/home/iann/code/project/sms_portail/../../../src/controller/query/admin/topup/topup.service.ts");
    const exports = Object.keys(module);
    expect(exports.length).toBeGreaterThan(0);
  });

  it("createManualTopup - makes API call", async () => {
    const { billingApiRequest } = await import("@/controller/api/config/config");
    (billingApiRequest as any).mockResolvedValue({
      data: { message: { status: "success" } },
    });

    const result = await createManualTopup(
      { client_id: 1, amount: 100, connector_id: 1 },
      "test-api-key"
    );

    expect(billingApiRequest).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("getManualTopupRequests - makes API call", async () => {
    const { billingApiRequest } = await import("@/controller/api/config/config");
    (billingApiRequest as any).mockResolvedValue({
      data: { message: { data: [] } },
    });

    const result = await getManualTopupRequests({ page: 1 }, "test-api-key");

    expect(billingApiRequest).toHaveBeenCalled();
    expect(result).toBeDefined();
  });
});
