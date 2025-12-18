// Mock billingApiRequest
jest.mock("../../../../src/controller/api/config/config", () => ({
  billingApiRequest: jest.fn(),
}));

// Mock axios
jest.mock("axios");

import { billingApiRequest } from "../../../../src/controller/api/config/config";
import axios from "axios";
import * as service from "../../../../src/controller/query/documents/document.service";

describe("controller/query/documents/document.service.ts - Comprehensive Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getActiveDocumentTypes", () => {
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

      const result = await service.getActiveDocumentTypes({} as any, apiKey);

      expect(result).toBeDefined();
      expect(billingApiRequest).toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

      await expect(service.getActiveDocumentTypes({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle empty response", async () => {
      (billingApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(service.getActiveDocumentTypes({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle network error", async () => {
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

      await expect(service.getActiveDocumentTypes({} as any, apiKey)).rejects.toThrow();
    });
  });

  describe("generatePresignedUrl", () => {
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

      const result = await service.generatePresignedUrl({} as any, apiKey);

      expect(result).toBeDefined();
      expect(billingApiRequest).toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

      await expect(service.generatePresignedUrl({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle empty response", async () => {
      (billingApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(service.generatePresignedUrl({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle network error", async () => {
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

      await expect(service.generatePresignedUrl({} as any, apiKey)).rejects.toThrow();
    });
  });

  describe("uploadFileToS3", () => {
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

      const result = await service.uploadFileToS3({} as any, apiKey);

      expect(result).toBeDefined();
      expect(billingApiRequest).toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

      await expect(service.uploadFileToS3({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle empty response", async () => {
      (billingApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(service.uploadFileToS3({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle network error", async () => {
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

      await expect(service.uploadFileToS3({} as any, apiKey)).rejects.toThrow();
    });
  });

  describe("createDocument", () => {
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

      const result = await service.createDocument({} as any, apiKey);

      expect(result).toBeDefined();
      expect(billingApiRequest).toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

      await expect(service.createDocument({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle empty response", async () => {
      (billingApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(service.createDocument({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle network error", async () => {
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

      await expect(service.createDocument({} as any, apiKey)).rejects.toThrow();
    });
  });

  describe("createDocuments", () => {
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

      const result = await service.createDocuments({} as any, apiKey);

      expect(result).toBeDefined();
      expect(billingApiRequest).toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

      await expect(service.createDocuments({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle empty response", async () => {
      (billingApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(service.createDocuments({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle network error", async () => {
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

      await expect(service.createDocuments({} as any, apiKey)).rejects.toThrow();
    });
  });

  describe("getMyDocuments", () => {
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

      const result = await service.getMyDocuments({} as any, apiKey);

      expect(result).toBeDefined();
      expect(billingApiRequest).toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

      await expect(service.getMyDocuments({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle empty response", async () => {
      (billingApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(service.getMyDocuments({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle network error", async () => {
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

      await expect(service.getMyDocuments({} as any, apiKey)).rejects.toThrow();
    });
  });

});
