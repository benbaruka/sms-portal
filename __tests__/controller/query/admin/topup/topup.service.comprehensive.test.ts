// Mock billingApiRequest
jest.mock("@/controller/api/config/config", () => ({
  billingApiRequest: jest.fn(),
}));

// Mock axios
jest.mock("axios");

import { billingApiRequest } from "@/controller/api/config/config";
import axios from "axios";
import * as service from "@/controller/query/admin/topup/topup.service";

describe("controller/query/admin/topup/topup.service.ts - Comprehensive Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createManualTopup", () => {
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

      const result = await service.createManualTopup({} as any, apiKey);

      expect(result).toBeDefined();
      expect(billingApiRequest).toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

      await expect(service.createManualTopup({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle empty response", async () => {
      (billingApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(service.createManualTopup({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle network error", async () => {
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

      await expect(service.createManualTopup({} as any, apiKey)).rejects.toThrow();
    });
  });

  describe("getManualTopupRequests", () => {
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

      const result = await service.getManualTopupRequests({} as any, apiKey);

      expect(result).toBeDefined();
      expect(billingApiRequest).toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

      await expect(service.getManualTopupRequests({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle empty response", async () => {
      (billingApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(service.getManualTopupRequests({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle network error", async () => {
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

      await expect(service.getManualTopupRequests({} as any, apiKey)).rejects.toThrow();
    });
  });

  describe("getManualTopupRequestDetails", () => {
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

      const result = await service.getManualTopupRequestDetails({} as any, apiKey);

      expect(result).toBeDefined();
      expect(billingApiRequest).toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

      await expect(service.getManualTopupRequestDetails({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle empty response", async () => {
      (billingApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(service.getManualTopupRequestDetails({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle network error", async () => {
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

      await expect(service.getManualTopupRequestDetails({} as any, apiKey)).rejects.toThrow();
    });
  });

  describe("getAvailableConnectors", () => {
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

      const result = await service.getAvailableConnectors({} as any, apiKey);

      expect(result).toBeDefined();
      expect(billingApiRequest).toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

      await expect(service.getAvailableConnectors({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle empty response", async () => {
      (billingApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(service.getAvailableConnectors({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle network error", async () => {
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

      await expect(service.getAvailableConnectors({} as any, apiKey)).rejects.toThrow();
    });
  });

});
