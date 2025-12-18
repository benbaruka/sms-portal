
import {
  getClientUsersList,
  createClientUser,
} from "../../../../../src/controller/query/client/users/clientUsers.service";
import axios from "axios";

jest.mock("@/controller/api/config/config", () => ({
  billingApiRequest: jest.fn(),
}));

jest.mock("axios");
jest.mock("@/controller/api/constant/apiLink", () => ({
  clientUsers: {
    list: "/client/users/list",
    create: "/client/users/create",
  },
}));

describe("controller/query/client/users/clientUsers.service.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(getClientUsersList).toBeDefined();
    expect(createClientUser).toBeDefined();
  });

  it("exports expected functions", async () => {
    const module =
      await import("/home/iann/code/project/sms_portail/../../../src/controller/query/client/users/clientUsers.service.ts");
    const exports = Object.keys(module);
    expect(exports.length).toBeGreaterThan(0);
  });

  it("getClientUsersList - makes API call", async () => {
    const { billingApiRequest } = await import("@/controller/api/config/config");
    (billingApiRequest as any).mockResolvedValue({
      data: { message: { data: [] } },
    });

    const result = await getClientUsersList({ page: 1 }, "test-api-key");

    expect(billingApiRequest).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("createClientUser - makes API call", async () => {
    const { billingApiRequest } = await import("@/controller/api/config/config");
    (billingApiRequest as any).mockResolvedValue({
      data: { message: { status: "success" } },
    });

    const result = await createClientUser(
      { email: "test@example.com", full_name: "Test User" },
      "test-api-key"
    );

    expect(billingApiRequest).toHaveBeenCalled();
    expect(result).toBeDefined();
  });
});
