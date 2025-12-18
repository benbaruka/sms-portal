
import {
  getClientTokensList,
  createClientLiveToken,
} from "../../../../../src/controller/query/client/tokens/tokens.service";
import axios from "axios";

jest.mock("@/controller/api/config/config", () => ({
  billingApi: {
    request: jest.fn(),
  },
  billingApiRequest: jest.fn(),
}));

jest.mock("axios");
jest.mock("@/controller/api/constant/apiLink", () => ({
  clientTokens: {
    list: "/client/tokens/list",
    create: "/client/tokens/create",
  },
}));

describe("controller/query/client/tokens/tokens.service.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(getClientTokensList).toBeDefined();
    expect(createClientLiveToken).toBeDefined();
  });

  it("exports expected functions", async () => {
    const module =
      await import("/home/iann/code/project/sms_portail/../../../src/controller/query/client/tokens/tokens.service.ts");
    const exports = Object.keys(module);
    expect(exports.length).toBeGreaterThan(0);
  });

  it("getClientTokensList - makes API call", async () => {
    const { billingApiRequest } = await import("@/controller/api/config/config");
    (billingApiRequest as any).mockResolvedValue({
      data: { message: { data: [] } },
    });

    const result = await getClientTokensList({ page: 1 }, "test-api-key", "test-token");

    expect(billingApiRequest).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("createClientLiveToken - makes API call", async () => {
    const { billingApiRequest } = await import("@/controller/api/config/config");
    (billingApiRequest as any).mockResolvedValue({
      data: { message: { token: "new-token" } },
    });

    const result = await createClientLiveToken({ name: "Test Token" }, "test-api-key");

    expect(billingApiRequest).toHaveBeenCalled();
    expect(result).toBeDefined();
  });
});
