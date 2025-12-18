
import {
  getAdminUsersList,
  createAdminUser,
} from "../../../../../src/controller/query/admin/users/users.service";
import axios from "axios";

jest.mock("@/controller/api/config/config", () => ({
  billingApiRequest: jest.fn(),
}));

jest.mock("axios");
jest.mock("@/controller/api/constant/apiLink", () => ({
  adminUsers: {
    list: "/admin/users/list",
    create: "/admin/users/create",
  },
}));

describe("controller/query/admin/users/users.service.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(getAdminUsersList).toBeDefined();
    expect(createAdminUser).toBeDefined();
  });

  it("exports expected functions", async () => {
    const module =
      await import("/home/iann/code/project/sms_portail/../../../src/controller/query/admin/users/users.service.ts");
    const exports = Object.keys(module);
    expect(exports.length).toBeGreaterThan(0);
  });

  it("getAdminUsersList - makes API call", async () => {
    const { billingApiRequest } = await import("@/controller/api/config/config");
    (billingApiRequest as any).mockResolvedValue({
      data: { message: { data: [] } },
    });

    const result = await getAdminUsersList({ page: 1 }, "test-api-key");

    expect(billingApiRequest).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("createAdminUser - makes API call", async () => {
    const { billingApiRequest } = await import("@/controller/api/config/config");
    (billingApiRequest as any).mockResolvedValue({
      data: { message: { status: "success" } },
    });

    const result = await createAdminUser(
      { email: "admin@example.com", full_name: "Admin User" },
      "test-api-key"
    );

    expect(billingApiRequest).toHaveBeenCalled();
    expect(result).toBeDefined();
  });
});
