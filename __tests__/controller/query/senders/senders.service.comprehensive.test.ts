// Mock smsApiRequest (senders use SMS API, not billing API)
jest.mock("../../../../src/controller/api/config/smsApiConfig", () => ({
  smsApiRequest: jest.fn(),
}));

// Mock axios
jest.mock("axios");

import { smsApiRequest } from "../../../../src/controller/api/config/smsApiConfig";
import axios from "axios";
import * as service from "../../../../src/controller/query/senders/senders.service";

describe("controller/query/senders/senders.service.ts - Comprehensive Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getClientSenderIdsList", () => {
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
      (smsApiRequest as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await service.getClientSenderIdsList({} as any, apiKey);

      expect(result).toBeDefined();
      expect(smsApiRequest).toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (smsApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

      await expect(service.getClientSenderIdsList({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle empty response", async () => {
      (smsApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(service.getClientSenderIdsList({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle network error", async () => {
      (smsApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

      await expect(service.getClientSenderIdsList({} as any, apiKey)).rejects.toThrow();
    });
  });

  describe("getClientSenderIdsListForMessages", () => {
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
      (smsApiRequest as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await service.getClientSenderIdsListForMessages({} as any, apiKey);

      expect(result).toBeDefined();
      expect(smsApiRequest).toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (smsApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

      await expect(service.getClientSenderIdsListForMessages({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle empty response", async () => {
      (smsApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(service.getClientSenderIdsListForMessages({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle network error", async () => {
      (smsApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

      await expect(service.getClientSenderIdsListForMessages({} as any, apiKey)).rejects.toThrow();
    });
  });

  describe("createSenderIdRequest", () => {
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
      (smsApiRequest as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await service.createSenderIdRequest({} as any, apiKey);

      expect(result).toBeDefined();
      expect(smsApiRequest).toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (smsApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

      await expect(service.createSenderIdRequest({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle empty response", async () => {
      (smsApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(service.createSenderIdRequest({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle network error", async () => {
      (smsApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

      await expect(service.createSenderIdRequest({} as any, apiKey)).rejects.toThrow();
    });
  });

});
