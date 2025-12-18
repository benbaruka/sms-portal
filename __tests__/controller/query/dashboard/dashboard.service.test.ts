
import {
  getDashboardSummary,
  getMessagesSentByType,
} from "../../../../src/controller/query/dashboard/dashboard.service";
import axios from "axios";

jest.mock("@/controller/api/config/smsApiConfig", () => ({
  smsApiRequest: jest.fn(),
}));

jest.mock("axios");
jest.mock("@/controller/api/constant/apiLink", () => ({
  dashboard: {
    summary: "/dashboard/summary",
    messagesSent: "/dashboard/messages-sent",
  },
}));

describe("controller/query/dashboard/dashboard.service.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(getDashboardSummary).toBeDefined();
    expect(getMessagesSentByType).toBeDefined();
  });

  it("exports expected functions", async () => {
    const module = await import("../../../../src/controller/query/dashboard/dashboard.service");
    const exports = Object.keys(module);
    expect(exports.length).toBeGreaterThan(0);
  });

  it("getDashboardSummary - makes API call", async () => {
    const { smsApiRequest } = await import("@/controller/api/config/smsApiConfig");
    (smsApiRequest as any).mockResolvedValue({
      data: { message: {} },
    });

    const result = await getDashboardSummary({}, "test-api-key");

    expect(smsApiRequest).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("getMessagesSentByType - makes API call", async () => {
    const { smsApiRequest } = await import("@/controller/api/config/smsApiConfig");
    (smsApiRequest as any).mockResolvedValue({
      data: { message: { data: [] } },
    });

    const result = await getMessagesSentByType("promotional", { page: 1 }, "test-api-key");

    expect(smsApiRequest).toHaveBeenCalled();
    expect(result).toBeDefined();
  });
});
