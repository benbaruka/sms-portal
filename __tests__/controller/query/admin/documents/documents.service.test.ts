
import {
  getAdminDocumentsList,
  getAdminDocumentTypes,
  createAdminDocument,
} from "../../../../../src/controller/query/admin/documents/documents.service";
import axios from "axios";

jest.mock("@/controller/api/config/config", () => ({
  billingApiRequest: jest.fn(),
}));

jest.mock("axios");
jest.mock("@/controller/api/constant/apiLink", () => ({
  adminDocuments: {
    list: "/admin/documents/list",
    types: "/admin/documents/types",
    create: "/admin/documents/create",
  },
}));

describe("controller/query/admin/documents/documents.service.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(getAdminDocumentsList).toBeDefined();
    expect(getAdminDocumentTypes).toBeDefined();
    expect(createAdminDocument).toBeDefined();
  });

  it("exports expected functions", async () => {
    const module =
      await import("/home/iann/code/project/sms_portail/../../../src/controller/query/admin/documents/documents.service.ts");
    const exports = Object.keys(module);
    expect(exports.length).toBeGreaterThan(0);
  });

  it("getAdminDocumentsList - makes API call", async () => {
    const { billingApiRequest } = await import("@/controller/api/config/config");
    (billingApiRequest as any).mockResolvedValue({
      data: { message: { data: [] } },
    });

    const result = await getAdminDocumentsList({ client_id: 1, page: 1 }, "test-api-key");

    expect(billingApiRequest).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("getAdminDocumentTypes - makes API call", async () => {
    const { billingApiRequest } = await import("@/controller/api/config/config");
    (billingApiRequest as any).mockResolvedValue({
      data: { message: { types: [] } },
    });

    const result = await getAdminDocumentTypes("test-api-key");

    expect(billingApiRequest).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("createAdminDocument - makes API call", async () => {
    const { billingApiRequest } = await import("@/controller/api/config/config");
    (billingApiRequest as any).mockResolvedValue({
      data: { message: { status: "success" } },
    });

    const result = await createAdminDocument({ client_id: 1, document_type_id: 1 }, "test-api-key");

    expect(billingApiRequest).toHaveBeenCalled();
    expect(result).toBeDefined();
  });
});
