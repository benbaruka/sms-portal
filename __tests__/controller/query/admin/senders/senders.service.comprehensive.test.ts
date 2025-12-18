// Mock billingApiRequest
jest.mock("@/controller/api/config/config", () => ({
  billingApiRequest: jest.fn(),
}));

// Mock axios
jest.mock("axios");

import { billingApiRequest } from "@/controller/api/config/config";
import axios from "axios";
import * as service from "@/controller/query/admin/senders/senders.service";

describe("controller/query/admin/senders/senders.service.ts - Comprehensive Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAdminSendersList", () => {
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

      const result = await service.getAdminSendersList({} as any, apiKey);

      expect(result).toBeDefined();
      expect(billingApiRequest).toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

      await expect(service.getAdminSendersList({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle empty response", async () => {
      (billingApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(service.getAdminSendersList({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle network error", async () => {
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

      await expect(service.getAdminSendersList({} as any, apiKey)).rejects.toThrow();
    });
  });

  describe("getAdminSenderDetails", () => {
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

      const result = await service.getAdminSenderDetails({} as any, apiKey);

      expect(result).toBeDefined();
      expect(billingApiRequest).toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

      await expect(service.getAdminSenderDetails({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle empty response", async () => {
      (billingApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(service.getAdminSenderDetails({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle network error", async () => {
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

      await expect(service.getAdminSenderDetails({} as any, apiKey)).rejects.toThrow();
    });
  });

  describe("approveAdminSender", () => {
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

      const result = await service.approveAdminSender({} as any, apiKey);

      expect(result).toBeDefined();
      expect(billingApiRequest).toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

      await expect(service.approveAdminSender({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle empty response", async () => {
      (billingApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(service.approveAdminSender({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle network error", async () => {
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

      await expect(service.approveAdminSender({} as any, apiKey)).rejects.toThrow();
    });
  });

  describe("rejectAdminSender", () => {
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

      const result = await service.rejectAdminSender({} as any, apiKey);

      expect(result).toBeDefined();
      expect(billingApiRequest).toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

      await expect(service.rejectAdminSender({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle empty response", async () => {
      (billingApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(service.rejectAdminSender({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle network error", async () => {
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

      await expect(service.rejectAdminSender({} as any, apiKey)).rejects.toThrow();
    });
  });

  describe("updateAdminSenderStatus", () => {
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

      const result = await service.updateAdminSenderStatus({} as any, apiKey);

      expect(result).toBeDefined();
      expect(billingApiRequest).toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

      await expect(service.updateAdminSenderStatus({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle empty response", async () => {
      (billingApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(service.updateAdminSenderStatus({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle network error", async () => {
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

      await expect(service.updateAdminSenderStatus({} as any, apiKey)).rejects.toThrow();
    });
  });

  describe("assignSenderToClient", () => {
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

      const result = await service.assignSenderToClient({} as any, apiKey);

      expect(result).toBeDefined();
      expect(billingApiRequest).toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

      await expect(service.assignSenderToClient({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle empty response", async () => {
      (billingApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(service.assignSenderToClient({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle network error", async () => {
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

      await expect(service.assignSenderToClient({} as any, apiKey)).rejects.toThrow();
    });
  });

  describe("unassignSenderFromClient", () => {
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

      const result = await service.unassignSenderFromClient({} as any, apiKey);

      expect(result).toBeDefined();
      expect(billingApiRequest).toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

      await expect(service.unassignSenderFromClient({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle empty response", async () => {
      (billingApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(service.unassignSenderFromClient({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle network error", async () => {
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

      await expect(service.unassignSenderFromClient({} as any, apiKey)).rejects.toThrow();
    });
  });

  describe("updateClientSenderStatus", () => {
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

      const result = await service.updateClientSenderStatus({} as any, apiKey);

      expect(result).toBeDefined();
      expect(billingApiRequest).toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

      await expect(service.updateClientSenderStatus({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle empty response", async () => {
      (billingApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(service.updateClientSenderStatus({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle network error", async () => {
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

      await expect(service.updateClientSenderStatus({} as any, apiKey)).rejects.toThrow();
    });
  });

  describe("getClientsAssignedToSender", () => {
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

      const result = await service.getClientsAssignedToSender({} as any, apiKey);

      expect(result).toBeDefined();
      expect(billingApiRequest).toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

      await expect(service.getClientsAssignedToSender({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle empty response", async () => {
      (billingApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(service.getClientsAssignedToSender({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle network error", async () => {
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

      await expect(service.getClientsAssignedToSender({} as any, apiKey)).rejects.toThrow();
    });
  });

  describe("deleteAdminSender", () => {
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

      const result = await service.deleteAdminSender({} as any, apiKey);

      expect(result).toBeDefined();
      expect(billingApiRequest).toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

      await expect(service.deleteAdminSender({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle empty response", async () => {
      (billingApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(service.deleteAdminSender({} as any, apiKey)).rejects.toThrow();
    });

    it("should handle network error", async () => {
      (billingApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

      await expect(service.deleteAdminSender({} as any, apiKey)).rejects.toThrow();
    });
  });

});
