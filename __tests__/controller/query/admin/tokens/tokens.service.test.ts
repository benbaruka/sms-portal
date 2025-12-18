
import {
  getAdminTokensList,
  createAdminToken,
} from "../../../../../src/controller/query/admin/tokens/tokens.service";
import axios from "axios";

jest.mock("@/controller/api/config/config", () => ({
  billingApiRequest: jest.fn(),
}));

jest.mock("axios");
jest.mock("@/controller/api/constant/apiLink", () => ({
  adminTokens: {
    list: "/admin/tokens/list",
    create: "/admin/tokens/create",
  },
}));

describe("controller/query/admin/tokens/tokens.service.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(getAdminTokensList).toBeDefined();
    expect(createAdminToken).toBeDefined();
  });

  it("exports expected functions", async () => {
    const module =
      await import("/home/iann/code/project/sms_portail/../../../src/controller/query/admin/tokens/tokens.service.ts");
    const exports = Object.keys(module);
    expect(exports.length).toBeGreaterThan(0);
  });

  it("getAdminTokensList - makes API call", async () => {
    const { billingApiRequest } = await import("@/controller/api/config/config");
    (billingApiRequest as any).mockResolvedValue({
      data: { message: { data: [] } },
    });

    const result = await getAdminTokensList({ page: 1 }, "test-api-key");

    expect(billingApiRequest).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("createAdminToken - makes API call", async () => {
    const { billingApiRequest } = await import("@/controller/api/config/config");
    (billingApiRequest as any).mockResolvedValue({
      data: { message: { token: "new-token" } },
    });

    const result = await createAdminToken({ name: "Admin Token" }, "test-api-key");

    expect(billingApiRequest).toHaveBeenCalled();
    expect(result).toBeDefined();
  });
});
