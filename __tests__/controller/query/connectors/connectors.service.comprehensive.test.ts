// Mock smsApiRequest (connectors use SMS API, not billing API)
jest.mock("../../../../src/controller/api/config/smsApiConfig", () => ({
  smsApiRequest: jest.fn(),
}));

// Mock axios
jest.mock("axios");

import { smsApiRequest } from "../../../../src/controller/api/config/smsApiConfig";
import axios from "axios";
import * as service from "../../../../src/controller/query/connectors/connectors.service";

describe("controller/query/connectors/connectors.service.ts - Comprehensive Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllConnectors", () => {
    const apiKey = "test-api-key";

    it("should handle success scenario", async () => {
      const mockResponse = {
        data: { status: 200, message: [] },
      };
      (smsApiRequest as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await service.getAllConnectors({} as any);

      expect(result).toBeDefined();
      expect(smsApiRequest).toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
        isAxiosError: true,
      };
      (smsApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

      await expect(service.getAllConnectors({} as any)).rejects.toThrow();
    });

    it("should handle empty response", async () => {
      (smsApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(service.getAllConnectors({} as any)).rejects.toThrow();
    });

    it("should handle network error", async () => {
      (smsApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

      await expect(service.getAllConnectors({} as any)).rejects.toThrow();
    });
  });

  describe("createConnector", () => {
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

      const result = await service.createConnector({ mcc: 630, mnc: 2, name: "test", queue_prefix: "test" } as any, apiKey);

      expect(result).toBeDefined();
      expect(smsApiRequest).toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (smsApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

      await expect(service.createConnector({ mcc: 630, mnc: 2, name: "test", queue_prefix: "test" } as any, apiKey)).rejects.toThrow();
    });

    it("should handle empty response", async () => {
      (smsApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(service.createConnector({ mcc: 630, mnc: 2, name: "test", queue_prefix: "test" } as any, apiKey)).rejects.toThrow();
    });

    it("should handle network error", async () => {
      (smsApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

      await expect(service.createConnector({ mcc: 630, mnc: 2, name: "test", queue_prefix: "test" } as any, apiKey)).rejects.toThrow();
    });
  });

  describe("updateConnector", () => {
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

      const result = await service.updateConnector({ id: 1, mcc: 630, mnc: 2 } as any, apiKey);

      expect(result).toBeDefined();
      expect(smsApiRequest).toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (smsApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

      await expect(service.updateConnector({ id: 1, mcc: 630, mnc: 2 } as any, apiKey)).rejects.toThrow();
    });

    it("should handle empty response", async () => {
      (smsApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(service.updateConnector({ id: 1, mcc: 630, mnc: 2 } as any, apiKey)).rejects.toThrow();
    });

    it("should handle network error", async () => {
      (smsApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

      await expect(service.updateConnector({ id: 1, mcc: 630, mnc: 2 } as any, apiKey)).rejects.toThrow();
    });
  });

  describe("getConnectorById", () => {
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

      const result = await service.getConnectorById({ id: 1 } as any, apiKey);

      expect(result).toBeDefined();
      expect(smsApiRequest).toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (smsApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

      await expect(service.getConnectorById({ id: 1 } as any, apiKey)).rejects.toThrow();
    });

    it("should handle empty response", async () => {
      (smsApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(service.getConnectorById({ id: 1 } as any, apiKey)).rejects.toThrow();
    });

    it("should handle network error", async () => {
      (smsApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

      await expect(service.getConnectorById({ id: 1 } as any, apiKey)).rejects.toThrow();
    });
  });

  describe("deleteConnector", () => {
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

      const result = await service.deleteConnector({ id: 1 } as any, apiKey);

      expect(result).toBeDefined();
      expect(smsApiRequest).toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (smsApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

      await expect(service.deleteConnector({ id: 1 } as any, apiKey)).rejects.toThrow();
    });

    it("should handle empty response", async () => {
      (smsApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(service.deleteConnector({ id: 1 } as any, apiKey)).rejects.toThrow();
    });

    it("should handle network error", async () => {
      (smsApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

      await expect(service.deleteConnector({ id: 1 } as any, apiKey)).rejects.toThrow();
    });
  });

});
