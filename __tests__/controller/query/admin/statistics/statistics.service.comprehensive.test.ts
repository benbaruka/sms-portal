// Mock billingApiRequest
jest.mock("@/controller/api/config/config", () => ({
  billingApiRequest: jest.fn(),
}));

// Mock axios
jest.mock("axios");

import { billingApiRequest } from "@/controller/api/config/config";
import axios from "axios";
import * as service from "@/controller/query/admin/statistics/statistics.service";

describe("controller/query/admin/statistics/statistics.service.ts - Comprehensive Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAdminGlobalStatistics", () => {
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

      const result = await service.getAdminGlobalStatistics({} as any, apiKey);

      expect(result).toBeDefined();
      expect(billingApiRequest).toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

      await expect(service.getAdminGlobalStatistics({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle empty response", async () => {
      (billingApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(service.getAdminGlobalStatistics({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle network error", async () => {
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

      await expect(service.getAdminGlobalStatistics({} as any, apiKey)).rejects.toThrow();
    });
  });

  describe("getAdminBillingStatistics", () => {
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

      const result = await service.getAdminBillingStatistics({} as any, apiKey);

      expect(result).toBeDefined();
      expect(billingApiRequest).toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

      await expect(service.getAdminBillingStatistics({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle empty response", async () => {
      (billingApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(service.getAdminBillingStatistics({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle network error", async () => {
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

      await expect(service.getAdminBillingStatistics({} as any, apiKey)).rejects.toThrow();
    });
  });

  describe("getAdminClientStatistics", () => {
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

      const result = await service.getAdminClientStatistics({} as any, apiKey);

      expect(result).toBeDefined();
      expect(billingApiRequest).toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

      await expect(service.getAdminClientStatistics({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle empty response", async () => {
      (billingApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(service.getAdminClientStatistics({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle network error", async () => {
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

      await expect(service.getAdminClientStatistics({} as any, apiKey)).rejects.toThrow();
    });
  });

});
