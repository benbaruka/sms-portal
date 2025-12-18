// Mock billingApiRequest
jest.mock("@/controller/api/config/config", () => ({
  billingApiRequest: jest.fn(),
}));

// Mock axios
jest.mock("axios");

import { billingApiRequest } from "@/controller/api/config/config";
import axios from "axios";
import * as service from "@/controller/query/admin/users/users.service";

describe("controller/query/admin/users/users.service.ts - Comprehensive Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAdminUsersList", () => {
    const apiKey = "test-api-key";

    it("should handle success scenario", async () => {
      const mockResponse = {
        data: { success: true, data: [] },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
        request: {},
      };
      (billingApiRequest as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await service.getAdminUsersList({} as any, apiKey);

      expect(result).toBeDefined();
      expect(billingApiRequest).toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

      await expect(service.getAdminUsersList({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle empty response", async () => {
      (billingApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(service.getAdminUsersList({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle network error", async () => {
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

      await expect(service.getAdminUsersList({} as any, apiKey)).rejects.toThrow();
    });
  });

  describe("createAdminUser", () => {
    const apiKey = "test-api-key";

    it("should handle success scenario", async () => {
      const mockResponse = {
        data: { success: true, data: [] },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
        request: {},
      };
      (billingApiRequest as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await service.createAdminUser({} as any, apiKey);

      expect(result).toBeDefined();
      expect(billingApiRequest).toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

      await expect(service.createAdminUser({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle empty response", async () => {
      (billingApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(service.createAdminUser({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle network error", async () => {
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

      await expect(service.createAdminUser({} as any, apiKey)).rejects.toThrow();
    });
  });

  describe("updateAdminUser", () => {
    const apiKey = "test-api-key";

    it("should handle success scenario", async () => {
      const mockResponse = {
        data: { success: true, data: [] },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
        request: {},
      };
      (billingApiRequest as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await service.updateAdminUser({} as any, apiKey);

      expect(result).toBeDefined();
      expect(billingApiRequest).toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

      await expect(service.updateAdminUser({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle empty response", async () => {
      (billingApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(service.updateAdminUser({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle network error", async () => {
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

      await expect(service.updateAdminUser({} as any, apiKey)).rejects.toThrow();
    });
  });

  describe("getAdminUserDetails", () => {
    const apiKey = "test-api-key";

    it("should handle success scenario", async () => {
      const mockResponse = {
        data: { success: true, data: [] },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
        request: {},
      };
      (billingApiRequest as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await service.getAdminUserDetails({} as any, apiKey);

      expect(result).toBeDefined();
      expect(billingApiRequest).toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

      await expect(service.getAdminUserDetails({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle empty response", async () => {
      (billingApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(service.getAdminUserDetails({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle network error", async () => {
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

      await expect(service.getAdminUserDetails({} as any, apiKey)).rejects.toThrow();
    });
  });

  describe("changeAdminUserStatus", () => {
    const apiKey = "test-api-key";

    it("should handle success scenario", async () => {
      const mockResponse = {
        data: { success: true, data: [] },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
        request: {},
      };
      (billingApiRequest as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await service.changeAdminUserStatus({} as any, apiKey);

      expect(result).toBeDefined();
      expect(billingApiRequest).toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

      await expect(service.changeAdminUserStatus({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle empty response", async () => {
      (billingApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(service.changeAdminUserStatus({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle network error", async () => {
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

      await expect(service.changeAdminUserStatus({} as any, apiKey)).rejects.toThrow();
    });
  });

  describe("getAdminUserRoles", () => {
    const apiKey = "test-api-key";

    it("should handle success scenario", async () => {
      const mockResponse = {
        data: { success: true, data: [] },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
        request: {},
      };
      (billingApiRequest as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await service.getAdminUserRoles({} as any, apiKey);

      expect(result).toBeDefined();
      expect(billingApiRequest).toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

      await expect(service.getAdminUserRoles({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle empty response", async () => {
      (billingApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(service.getAdminUserRoles({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle network error", async () => {
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

      await expect(service.getAdminUserRoles({} as any, apiKey)).rejects.toThrow();
    });
  });

  describe("getAdminUserClients", () => {
    const apiKey = "test-api-key";

    it("should handle success scenario", async () => {
      const mockResponse = {
        data: { success: true, data: [] },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
        request: {},
      };
      (billingApiRequest as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await service.getAdminUserClients({} as any, apiKey);

      expect(result).toBeDefined();
      expect(billingApiRequest).toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

      await expect(service.getAdminUserClients({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle empty response", async () => {
      (billingApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(service.getAdminUserClients({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle network error", async () => {
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

      await expect(service.getAdminUserClients({} as any, apiKey)).rejects.toThrow();
    });
  });

});
