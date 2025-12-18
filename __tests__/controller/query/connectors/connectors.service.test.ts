
import {
  getAllConnectors,
  getConnectorById,
} from "../../../../src/controller/query/connectors/connectors.service";

jest.mock("@/controller/api/config/smsApiConfig", () => ({
  smsApiRequest: jest.fn(),
}));

jest.mock("@/controller/api/constant/apiLink", () => ({
  connectors: {
    getAll: "/connectors",
    getById: (id: number) => `/connectors/${id}`,
  },
}));

describe("controller/query/connectors/connectors.service.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(getAllConnectors).toBeDefined();
    expect(getConnectorById).toBeDefined();
  });

  it("exports expected functions", async () => {
    const module = await import("../../../../src/controller/query/connectors/connectors.service");
    const exports = Object.keys(module);
    expect(exports.length).toBeGreaterThan(0);
  });

  it("getAllConnectors - makes API call", async () => {
    const { smsApiRequest } = await import("@/controller/api/config/smsApiConfig");
    (smsApiRequest as any).mockResolvedValue({
      data: { message: [], data: [] },
    });

    const result = await getAllConnectors({ page: 1, limit: 10 });

    expect(smsApiRequest).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("getConnectorById - makes API call", async () => {
    const { smsApiRequest } = await import("@/controller/api/config/smsApiConfig");
    (smsApiRequest as any).mockResolvedValue({
      data: { message: {} },
    });

    const result = await getConnectorById(1);

    expect(smsApiRequest).toHaveBeenCalled();
    expect(result).toBeDefined();
  });
});
