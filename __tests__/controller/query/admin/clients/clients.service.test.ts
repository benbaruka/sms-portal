
import {
  getAdminClientsList,
  createAdminClient,
  getAdminClientDetails,
  updateAdminClient,
  changeAdminClientStatus,
  getAdminClientAccountTypes,
  getAdminClientCountries,
} from "../../../../../src/controller/query/admin/clients/clients.service";
import axios from "axios";
import { billingApiRequest } from "@/controller/api/config/config";

jest.mock("@/controller/api/config/config", () => ({
  billingApiRequest: jest.fn(),
}));

jest.mock("axios");
jest.mock("@/controller/api/constant/apiLink", () => ({
  adminClients: {
    list: "/admin/clients/list",
    all: "/client/all",
    create: "/admin/clients/create",
    details: (id: number) => `/admin/clients/${id}`,
    update: "/admin/clients/update",
    changeStatus: "/admin/clients/change-status",
    accountTypes: "/admin/clients/account-types",
    countries: "/admin/clients/countries",
  },
}));

describe("controller/query/admin/clients/clients.service.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(getAdminClientsList).toBeDefined();
    expect(createAdminClient).toBeDefined();
    expect(getAdminClientDetails).toBeDefined();
    expect(updateAdminClient).toBeDefined();
    expect(changeAdminClientStatus).toBeDefined();
    expect(getAdminClientAccountTypes).toBeDefined();
    expect(getAdminClientCountries).toBeDefined();
  });

  describe("getAdminClientsList", () => {
    it("uses /client/all when no filters", async () => {
      jest.mocked(billingApiRequest).mockResolvedValueOnce({
        data: { message: [{ id: 1, name: "Client 1" }] },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      const result = await getAdminClientsList({ page: 1 }, "test-api-key");

      expect(billingApiRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: expect.stringContaining("/client/all"),
        })
      );
      expect(result).toBeDefined();
    });

    it("uses /client/table when filters are present", async () => {
      jest.mocked(billingApiRequest).mockResolvedValueOnce({
        data: { data: { data: [], total: 0 } },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      const result = await getAdminClientsList(
        { page: 1, search: "test", status: "ACTIVE" },
        "test-api-key"
      );

      expect(billingApiRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: expect.stringContaining("/client/table"),
        })
      );
      expect(result).toBeDefined();
    });

    it("handles array response format", async () => {
      jest.mocked(billingApiRequest).mockResolvedValueOnce({
        data: [{ id: 1, name: "Client 1" }],
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      const result = await getAdminClientsList({ page: 1 }, "test-api-key");
      expect(result?.clients).toBeDefined();
    });

    it("handles message.data format", async () => {
      jest.mocked(billingApiRequest).mockResolvedValueOnce({
        data: { message: { data: [{ id: 1, name: "Client 1" }] } },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      const result = await getAdminClientsList({ page: 1 }, "test-api-key");
      expect(result?.clients).toBeDefined();
    });

    it("handles error and falls back to /client/table", async () => {
      jest.mocked(billingApiRequest)
        .mockRejectedValueOnce(new Error("Failed"))
        .mockResolvedValueOnce({
          data: { data: { data: [], total: 0 } },
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
        });

      const result = await getAdminClientsList({ page: 1 }, "test-api-key");
      expect(result).toBeDefined();
    });

    it("handles axios error with response", async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          data: { message: "Server error" },
        },
      };
      jest.mocked(axios.isAxiosError).mockReturnValue(true);
      jest.mocked(billingApiRequest).mockRejectedValue(axiosError);

      await expect(getAdminClientsList({ page: 1 }, "test-api-key")).rejects.toThrow(
        "Server error"
      );
    });

    it("handles axios error without response", async () => {
      const axiosError = {
        isAxiosError: true,
        request: {},
      };
      jest.mocked(axios.isAxiosError).mockReturnValue(true);
      jest.mocked(billingApiRequest).mockRejectedValue(axiosError);

      await expect(getAdminClientsList({ page: 1 }, "test-api-key")).rejects.toThrow(
        "No server response"
      );
    });
  });

  describe("createAdminClient", () => {
    it("makes API call with correct data", async () => {
      jest.mocked(billingApiRequest).mockResolvedValueOnce({
        data: { message: { status: "success" } },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      const result = await createAdminClient(
        { company_name: "Test Company", email: "test@example.com" },
        "test-api-key"
      );

      expect(billingApiRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "POST",
          data: expect.objectContaining({
            company_name: "Test Company",
            email: "test@example.com",
          }),
        })
      );
      expect(result).toBeDefined();
    });

    it("handles error correctly", async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          data: { message: "Validation error" },
        },
      };
      jest.mocked(axios.isAxiosError).mockReturnValue(true);
      jest.mocked(billingApiRequest).mockRejectedValue(axiosError);

      await expect(
        createAdminClient({ company_name: "Test", email: "test@example.com" }, "test-api-key")
      ).rejects.toThrow("Validation error");
    });
  });

  describe("getAdminClientDetails", () => {
    it("makes API call with client_id", async () => {
      jest.mocked(billingApiRequest).mockResolvedValueOnce({
        data: { message: { id: 1, name: "Client" } },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      const result = await getAdminClientDetails({ client_id: 1 }, "test-api-key");

      expect(billingApiRequest).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("handles error correctly", async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          data: { message: "Client not found" },
        },
      };
      jest.mocked(axios.isAxiosError).mockReturnValue(true);
      jest.mocked(billingApiRequest).mockRejectedValue(axiosError);

      await expect(getAdminClientDetails({ client_id: 999 }, "test-api-key")).rejects.toThrow(
        "Client not found"
      );
    });
  });

  describe("updateAdminClient", () => {
    it("makes API call with update data", async () => {
      jest.mocked(billingApiRequest).mockResolvedValueOnce({
        data: { message: { status: "success" } },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      const result = await updateAdminClient({
        data: { client_id: "1", name: "Updated Name" },
        apiKey: "test-key",
      });

      expect(billingApiRequest).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe("changeAdminClientStatus", () => {
    it("makes API call to change status", async () => {
      jest.mocked(billingApiRequest).mockResolvedValueOnce({
        data: { message: { status: "success" } },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      const result = await changeAdminClientStatus({
        data: { client_id: "1", status: "ACTIVE" },
        apiKey: "test-key",
      });

      expect(billingApiRequest).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe("getAdminClientAccountTypes", () => {
    it("makes API call to get account types", async () => {
      jest.mocked(billingApiRequest).mockResolvedValueOnce({
        data: { data: [{ id: 1, name: "Premium" }] },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      const result = await getAdminClientAccountTypes("test-api-key");

      expect(billingApiRequest).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe("getAdminClientCountries", () => {
    it("makes API call to get countries", async () => {
      jest.mocked(billingApiRequest).mockResolvedValueOnce({
        data: { data: [{ code: "CD", name: "Congo" }] },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      const result = await getAdminClientCountries("test-api-key");

      expect(billingApiRequest).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });
});
