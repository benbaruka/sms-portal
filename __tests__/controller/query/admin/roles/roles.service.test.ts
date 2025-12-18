
import {
  getAdminRolesList,
  createAdminRole,
  getAdminRolePermissions,
} from "../../../../../src/controller/query/admin/roles/roles.service";
import axios from "axios";

jest.mock("@/controller/api/config/config", () => ({
  billingApiRequest: jest.fn(),
}));

jest.mock("axios");
jest.mock("@/controller/api/constant/apiLink", () => ({
  adminRoles: {
    list: "/admin/roles/list",
    create: "/admin/roles/create",
    permissions: (id: number) => `/admin/roles/${id}/permissions`,
  },
}));

describe("controller/query/admin/roles/roles.service.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(getAdminRolesList).toBeDefined();
    expect(createAdminRole).toBeDefined();
    expect(getAdminRolePermissions).toBeDefined();
  });

  it("exports expected functions", async () => {
    const module =
      await import("/home/iann/code/project/sms_portail/../../../src/controller/query/admin/roles/roles.service.ts");
    const exports = Object.keys(module);
    expect(exports.length).toBeGreaterThan(0);
  });

  it("getAdminRolesList - makes API call", async () => {
    const { billingApiRequest } = await import("@/controller/api/config/config");
    (billingApiRequest as any).mockResolvedValue({
      data: { message: { roles: [] } },
    });

    const result = await getAdminRolesList({ page: 1 }, "test-api-key");

    expect(billingApiRequest).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("createAdminRole - makes API call", async () => {
    const { billingApiRequest } = await import("@/controller/api/config/config");
    (billingApiRequest as any).mockResolvedValue({
      data: { message: { status: "success" } },
    });

    const result = await createAdminRole({ name: "Test Role" }, "test-api-key");

    expect(billingApiRequest).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("getAdminRolePermissions - makes API call", async () => {
    const { billingApiRequest } = await import("@/controller/api/config/config");
    (billingApiRequest as any).mockResolvedValue({
      data: { message: { permissions: [] } },
    });

    const result = await getAdminRolePermissions(1, "test-api-key");

    expect(billingApiRequest).toHaveBeenCalled();
    expect(result).toBeDefined();
  });
});
