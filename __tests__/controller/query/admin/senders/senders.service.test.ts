
import {
  getAdminSendersList,
  approveAdminSender,
} from "../../../../../src/controller/query/admin/senders/senders.service";
import axios from "axios";

jest.mock("@/controller/api/config/smsApiConfig", () => ({
  smsApiRequest: jest.fn(),
}));

jest.mock("axios");
jest.mock("@/controller/api/constant/apiLink", () => ({
  senders: {
    adminList: "/admin/senders/list",
    approve: "/admin/senders/approve",
  },
}));

describe("controller/query/admin/senders/senders.service.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(getAdminSendersList).toBeDefined();
    expect(approveAdminSender).toBeDefined();
  });

  it("exports expected functions", async () => {
    const module =
      await import("/home/iann/code/project/sms_portail/../../../src/controller/query/admin/senders/senders.service.ts");
    const exports = Object.keys(module);
    expect(exports.length).toBeGreaterThan(0);
  });

  it("getAdminSendersList - makes API call", async () => {
    const { smsApiRequest } = await import("@/controller/api/config/smsApiConfig");
    (smsApiRequest as any).mockResolvedValue({
      data: { message: { data: [] } },
    });

    const result = await getAdminSendersList({}, "test-api-key");

    expect(smsApiRequest).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("approveAdminSender - makes API call", async () => {
    const { smsApiRequest } = await import("@/controller/api/config/smsApiConfig");
    (smsApiRequest as any).mockResolvedValue({
      data: { message: { status: "approved" } },
    });

    const result = await approveAdminSender({ sender_id: 1 }, "test-api-key");

    expect(smsApiRequest).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("handles 404 error gracefully", async () => {
    const { smsApiRequest } = await import("@/controller/api/config/smsApiConfig");
    (smsApiRequest as any).mockRejectedValue({
      isAxiosError: true,
      response: { status: 404, config: { url: "/admin/senders/list" } },
    });
    jest.mocked(axios.isAxiosError).mockReturnValue(true);

    await expect(getAdminSendersList({}, "test-api-key")).rejects.toThrow("Endpoint not found");
  });
});
