import axios from "axios";
import {
  mpesaPaymentRequest,
  getMNOProviders,
  mnoSelfTopup,
  getMNOTopupHistory,
  createManualTopup,
  getManualTopupRequests,
  getManualTopupRequestDetails,
  getAvailableConnectors,
} from "../../../../src/controller/query/topup/topup.service";
import { billingApiRequest } from "@/controller/api/config/config";

jest.mock("@/controller/api/config/config", () => ({
  billingApiRequest: jest.fn(),
}));

jest.mock("axios");

describe("controller/query/topup/topup.service.ts", () => {
  const mockApiKey = "test-api-key";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("mpesaPaymentRequest", () => {
    it("successfully makes payment request", async () => {
      const mockData = { amount: 100, phone: "+1234567890" };
      const mockResponse = { data: { message: "Payment successful", status: "success" } };

      jest.mocked(billingApiRequest).mockResolvedValue(mockResponse);

      const result = await mpesaPaymentRequest(mockData, mockApiKey);

      expect(billingApiRequest).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });

    it("throws error when response has no data", async () => {
      const mockData = { amount: 100, phone: "+1234567890" };
      const mockResponse = { data: null };

      jest.mocked(billingApiRequest).mockResolvedValue(mockResponse as any);

      await expect(mpesaPaymentRequest(mockData, mockApiKey)).rejects.toThrow(
        "No server response for MPESA payment request."
      );
    });

    it("handles axios error with response", async () => {
      const mockData = { amount: 100, phone: "+1234567890" };
      const errorResponse = {
        response: {
          data: {
            message: "Payment failed",
          },
        },
        isAxiosError: true,
      };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.mocked(billingApiRequest).mockRejectedValue(errorResponse);

      await expect(mpesaPaymentRequest(mockData, mockApiKey)).rejects.toThrow("Payment failed");
    });

    it("handles axios error with request but no response", async () => {
      const mockData = { amount: 100, phone: "+1234567890" };
      const errorRequest = {
        request: {},
        isAxiosError: true,
      };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.mocked(billingApiRequest).mockRejectedValue(errorRequest);

      await expect(mpesaPaymentRequest(mockData, mockApiKey)).rejects.toThrow(
        "No server response. Please check your internet connection."
      );
    });

    it("handles non-axios errors", async () => {
      const mockData = { amount: 100, phone: "+1234567890" };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(false);
      jest.mocked(billingApiRequest).mockRejectedValue(new Error("Network error"));

      await expect(mpesaPaymentRequest(mockData, mockApiKey)).rejects.toThrow(
        "No server response for MPESA payment request."
      );
    });

    it("handles axios error with response but no message", async () => {
      const mockData = { amount: 100, phone: "+1234567890" };
      const errorResponse = {
        response: {
          data: {},
        },
        isAxiosError: true,
      };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.mocked(billingApiRequest).mockRejectedValue(errorResponse);

      await expect(mpesaPaymentRequest(mockData, mockApiKey)).rejects.toThrow(
        "Error processing MPESA payment request."
      );
    });
  });

  describe("getMNOProviders", () => {
    it("successfully gets MNO providers", async () => {
      const mockResponse = {
        data: {
          status: 200,
          message: [
            { id: "AIRTEL", code: "AIRTEL", name: "Airtel", description: "Airtel RDC" },
          ],
        },
      };

      jest.mocked(billingApiRequest).mockResolvedValue(mockResponse);

      const result = await getMNOProviders(mockApiKey);

      expect(billingApiRequest).toHaveBeenCalledWith({
        method: "POST",
        endpoint: expect.any(String),
        data: {},
        apiKey: mockApiKey,
      });
      expect(result).toEqual(mockResponse.data);
    });

    it("throws error when response has no data", async () => {
      const mockResponse = { data: null };

      jest.mocked(billingApiRequest).mockResolvedValue(mockResponse as any);

      await expect(getMNOProviders(mockApiKey)).rejects.toThrow(
        "No server response for MNO providers."
      );
    });

    it("returns fallback providers on 500 error", async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: {
            message: "Internal server error",
          },
        },
        isAxiosError: true,
      };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.mocked(billingApiRequest).mockRejectedValue(errorResponse);

      const result = await getMNOProviders(mockApiKey);

      expect(result).toEqual({
        status: 200,
        message: [
          { id: "AIRTEL", code: "AIRTEL", name: "Airtel", description: "Airtel RDC" },
          { id: "ORANGE", code: "ORANGE", name: "Orange", description: "Orange RDC" },
          { id: "VODACOM", code: "VODACOM", name: "Vodacom", description: "Vodacom RDC" },
          { id: "AFRICELL", code: "AFRICELL", name: "Africell", description: "Africell RDC" },
        ],
      });
    });

    it("returns fallback providers on 500 error without message", async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: {},
        },
        isAxiosError: true,
      };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.mocked(billingApiRequest).mockRejectedValue(errorResponse);

      const result = await getMNOProviders(mockApiKey);

      expect(result).toEqual({
        status: 200,
        message: [
          { id: "AIRTEL", code: "AIRTEL", name: "Airtel", description: "Airtel RDC" },
          { id: "ORANGE", code: "ORANGE", name: "Orange", description: "Orange RDC" },
          { id: "VODACOM", code: "VODACOM", name: "Vodacom", description: "Vodacom RDC" },
          { id: "AFRICELL", code: "AFRICELL", name: "Africell", description: "Africell RDC" },
        ],
      });
    });

    it("handles axios error with response (non-500)", async () => {
      const errorResponse = {
        response: {
          status: 400,
          data: {
            message: "Bad request",
          },
        },
        isAxiosError: true,
      };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.mocked(billingApiRequest).mockRejectedValue(errorResponse);

      await expect(getMNOProviders(mockApiKey)).rejects.toThrow("Bad request");
    });

    it("handles axios error with request but no response", async () => {
      const errorRequest = {
        request: {},
        isAxiosError: true,
      };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.mocked(billingApiRequest).mockRejectedValue(errorRequest);

      await expect(getMNOProviders(mockApiKey)).rejects.toThrow(
        "No server response. Please check your internet connection."
      );
    });

    it("handles non-axios errors", async () => {
      jest.spyOn(axios, "isAxiosError").mockReturnValue(false);
      jest.mocked(billingApiRequest).mockRejectedValue(new Error("Network error"));

      await expect(getMNOProviders(mockApiKey)).rejects.toThrow(
        "No server response for MNO providers."
      );
    });

    it("handles axios error with response but no message", async () => {
      const errorResponse = {
        response: {
          status: 400,
          data: {},
        },
        isAxiosError: true,
      };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.mocked(billingApiRequest).mockRejectedValue(errorResponse);

      await expect(getMNOProviders(mockApiKey)).rejects.toThrow("Error fetching MNO providers.");
    });
  });

  describe("mnoSelfTopup", () => {
    it("successfully makes MNO self topup request", async () => {
      const mockData = { provider: "AIRTEL", amount: 100, phone: "+1234567890" };
      const mockResponse = { data: { message: "Topup successful", status: "success" } };

      jest.mocked(billingApiRequest).mockResolvedValue(mockResponse);

      const result = await mnoSelfTopup(mockData, mockApiKey);

      expect(billingApiRequest).toHaveBeenCalledWith({
        method: "POST",
        endpoint: expect.any(String),
        data: mockData,
        apiKey: mockApiKey,
      });
      expect(result).toEqual(mockResponse.data);
    });

    it("throws error when response has no data", async () => {
      const mockData = { provider: "AIRTEL", amount: 100, phone: "+1234567890" };
      const mockResponse = { data: null };

      jest.mocked(billingApiRequest).mockResolvedValue(mockResponse as any);

      await expect(mnoSelfTopup(mockData, mockApiKey)).rejects.toThrow(
        "No server response for MNO self topup."
      );
    });

    it("handles axios error with response", async () => {
      const mockData = { provider: "AIRTEL", amount: 100, phone: "+1234567890" };
      const errorResponse = {
        response: {
          data: {
            message: "Topup failed",
          },
        },
        isAxiosError: true,
      };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.mocked(billingApiRequest).mockRejectedValue(errorResponse);

      await expect(mnoSelfTopup(mockData, mockApiKey)).rejects.toThrow("Topup failed");
    });

    it("handles axios error with request but no response", async () => {
      const mockData = { provider: "AIRTEL", amount: 100, phone: "+1234567890" };
      const errorRequest = {
        request: {},
        isAxiosError: true,
      };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.mocked(billingApiRequest).mockRejectedValue(errorRequest);

      await expect(mnoSelfTopup(mockData, mockApiKey)).rejects.toThrow(
        "No server response. Please check your internet connection."
      );
    });

    it("handles non-axios errors", async () => {
      const mockData = { provider: "AIRTEL", amount: 100, phone: "+1234567890" };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(false);
      jest.mocked(billingApiRequest).mockRejectedValue(new Error("Network error"));

      await expect(mnoSelfTopup(mockData, mockApiKey)).rejects.toThrow(
        "No server response for MNO self topup."
      );
    });

    it("handles axios error with response but no message", async () => {
      const mockData = { provider: "AIRTEL", amount: 100, phone: "+1234567890" };
      const errorResponse = {
        response: {
          data: {},
        },
        isAxiosError: true,
      };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.mocked(billingApiRequest).mockRejectedValue(errorResponse);

      await expect(mnoSelfTopup(mockData, mockApiKey)).rejects.toThrow(
        "Error processing MNO self topup."
      );
    });
  });

  describe("getMNOTopupHistory", () => {
    it("successfully gets MNO topup history", async () => {
      const mockData = { page: 1, limit: 10 };
      const mockResponse = { data: { message: { history: [] } } };

      jest.mocked(billingApiRequest).mockResolvedValue(mockResponse);

      const result = await getMNOTopupHistory(mockData, mockApiKey);

      expect(billingApiRequest).toHaveBeenCalledWith({
        method: "POST",
        endpoint: expect.any(String),
        data: mockData,
        apiKey: mockApiKey,
      });
      expect(result).toEqual(mockResponse.data);
    });

    it("throws error when response has no data", async () => {
      const mockData = { page: 1, limit: 10 };
      const mockResponse = { data: null };

      jest.mocked(billingApiRequest).mockResolvedValue(mockResponse as any);

      await expect(getMNOTopupHistory(mockData, mockApiKey)).rejects.toThrow(
        "No server response for MNO topup history."
      );
    });

    it("handles axios error with response", async () => {
      const mockData = { page: 1, limit: 10 };
      const errorResponse = {
        response: {
          data: {
            message: "History fetch failed",
          },
        },
        isAxiosError: true,
      };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.mocked(billingApiRequest).mockRejectedValue(errorResponse);

      await expect(getMNOTopupHistory(mockData, mockApiKey)).rejects.toThrow(
        "History fetch failed"
      );
    });

    it("handles axios error with request but no response", async () => {
      const mockData = { page: 1, limit: 10 };
      const errorRequest = {
        request: {},
        isAxiosError: true,
      };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.mocked(billingApiRequest).mockRejectedValue(errorRequest);

      await expect(getMNOTopupHistory(mockData, mockApiKey)).rejects.toThrow(
        "No server response. Please check your internet connection."
      );
    });

    it("handles non-axios errors", async () => {
      const mockData = { page: 1, limit: 10 };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(false);
      jest.mocked(billingApiRequest).mockRejectedValue(new Error("Network error"));

      await expect(getMNOTopupHistory(mockData, mockApiKey)).rejects.toThrow(
        "No server response for MNO topup history."
      );
    });

    it("handles axios error with response but no message", async () => {
      const mockData = { page: 1, limit: 10 };
      const errorResponse = {
        response: {
          data: {},
        },
        isAxiosError: true,
      };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.mocked(billingApiRequest).mockRejectedValue(errorResponse);

      await expect(getMNOTopupHistory(mockData, mockApiKey)).rejects.toThrow(
        "Error fetching MNO topup history."
      );
    });
  });

  describe("createManualTopup", () => {
    it("successfully creates manual topup", async () => {
      const mockData = { amount: 100, connectorId: "conn-1" };
      const mockResponse = { data: { message: "Topup created", status: "success" } };

      jest.mocked(billingApiRequest).mockResolvedValue(mockResponse);

      const result = await createManualTopup(mockData, mockApiKey);

      expect(billingApiRequest).toHaveBeenCalledWith({
        method: "POST",
        endpoint: expect.any(String),
        data: mockData,
        apiKey: mockApiKey,
      });
      expect(result).toEqual(mockResponse.data);
    });

    it("throws error when response has no data", async () => {
      const mockData = { amount: 100, connectorId: "conn-1" };
      const mockResponse = { data: null };

      jest.mocked(billingApiRequest).mockResolvedValue(mockResponse as any);

      await expect(createManualTopup(mockData, mockApiKey)).rejects.toThrow(
        "Server error while creating manual topup request."
      );
    });

    it("handles axios error with response", async () => {
      const mockData = { amount: 100, connectorId: "conn-1" };
      const errorResponse = {
        response: {
          data: {
            message: "Creation failed",
          },
        },
        isAxiosError: true,
      };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.mocked(billingApiRequest).mockRejectedValue(errorResponse);

      await expect(createManualTopup(mockData, mockApiKey)).rejects.toThrow("Creation failed");
    });

    it("handles axios error with request but no response", async () => {
      const mockData = { amount: 100, connectorId: "conn-1" };
      const errorRequest = {
        request: {},
        isAxiosError: true,
      };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.mocked(billingApiRequest).mockRejectedValue(errorRequest);

      await expect(createManualTopup(mockData, mockApiKey)).rejects.toThrow(
        "No server response. Please check your internet connection."
      );
    });

    it("handles non-axios errors", async () => {
      const mockData = { amount: 100, connectorId: "conn-1" };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(false);
      jest.mocked(billingApiRequest).mockRejectedValue(new Error("Network error"));

      await expect(createManualTopup(mockData, mockApiKey)).rejects.toThrow(
        "Server error while creating manual topup request."
      );
    });

    it("handles axios error with response but no message", async () => {
      const mockData = { amount: 100, connectorId: "conn-1" };
      const errorResponse = {
        response: {
          data: {},
        },
        isAxiosError: true,
      };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.mocked(billingApiRequest).mockRejectedValue(errorResponse);

      await expect(createManualTopup(mockData, mockApiKey)).rejects.toThrow(
        "Error creating manual topup request."
      );
    });
  });

  describe("getManualTopupRequests", () => {
    it("successfully gets manual topup requests", async () => {
      const mockData = { page: 1, limit: 10 };
      const mockResponse = { data: { message: { requests: [] } } };

      jest.mocked(billingApiRequest).mockResolvedValue(mockResponse);

      const result = await getManualTopupRequests(mockData, mockApiKey);

      expect(billingApiRequest).toHaveBeenCalledWith({
        method: "POST",
        endpoint: expect.any(String),
        data: mockData,
        apiKey: mockApiKey,
      });
      expect(result).toEqual(mockResponse.data);
    });

    it("throws error when response has no data", async () => {
      const mockData = { page: 1, limit: 10 };
      const mockResponse = { data: null };

      jest.mocked(billingApiRequest).mockResolvedValue(mockResponse as any);

      await expect(getManualTopupRequests(mockData, mockApiKey)).rejects.toThrow(
        "Server error while fetching manual topup requests."
      );
    });

    it("handles axios error with response", async () => {
      const mockData = { page: 1, limit: 10 };
      const errorResponse = {
        response: {
          data: {
            message: "Fetch failed",
          },
        },
        isAxiosError: true,
      };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.mocked(billingApiRequest).mockRejectedValue(errorResponse);

      await expect(getManualTopupRequests(mockData, mockApiKey)).rejects.toThrow("Fetch failed");
    });

    it("handles axios error with request but no response", async () => {
      const mockData = { page: 1, limit: 10 };
      const errorRequest = {
        request: {},
        isAxiosError: true,
      };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.mocked(billingApiRequest).mockRejectedValue(errorRequest);

      await expect(getManualTopupRequests(mockData, mockApiKey)).rejects.toThrow(
        "No server response. Please check your internet connection."
      );
    });

    it("handles non-axios errors", async () => {
      const mockData = { page: 1, limit: 10 };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(false);
      jest.mocked(billingApiRequest).mockRejectedValue(new Error("Network error"));

      await expect(getManualTopupRequests(mockData, mockApiKey)).rejects.toThrow(
        "Server error while fetching manual topup requests."
      );
    });

    it("handles axios error with response but no message", async () => {
      const mockData = { page: 1, limit: 10 };
      const errorResponse = {
        response: {
          data: {},
        },
        isAxiosError: true,
      };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.mocked(billingApiRequest).mockRejectedValue(errorResponse);

      await expect(getManualTopupRequests(mockData, mockApiKey)).rejects.toThrow(
        "Error fetching manual topup requests."
      );
    });
  });

  describe("getManualTopupRequestDetails", () => {
    it("successfully gets manual topup request details", async () => {
      const mockData = { id: 1 };
      const mockResponse = { data: { message: { request: {} } } };

      jest.mocked(billingApiRequest).mockResolvedValue(mockResponse);

      const result = await getManualTopupRequestDetails(mockData, mockApiKey);

      expect(billingApiRequest).toHaveBeenCalledWith({
        method: "POST",
        endpoint: expect.any(String),
        data: mockData,
        apiKey: mockApiKey,
      });
      expect(result).toEqual(mockResponse.data);
    });

    it("throws error when response has no data", async () => {
      const mockData = { id: 1 };
      const mockResponse = { data: null };

      jest.mocked(billingApiRequest).mockResolvedValue(mockResponse as any);

      await expect(getManualTopupRequestDetails(mockData, mockApiKey)).rejects.toThrow(
        "Server error while fetching manual topup request details."
      );
    });

    it("handles axios error with response", async () => {
      const mockData = { id: 1 };
      const errorResponse = {
        response: {
          data: {
            message: "Details fetch failed",
          },
        },
        isAxiosError: true,
      };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.mocked(billingApiRequest).mockRejectedValue(errorResponse);

      await expect(getManualTopupRequestDetails(mockData, mockApiKey)).rejects.toThrow(
        "Details fetch failed"
      );
    });

    it("handles axios error with request but no response", async () => {
      const mockData = { id: 1 };
      const errorRequest = {
        request: {},
        isAxiosError: true,
      };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.mocked(billingApiRequest).mockRejectedValue(errorRequest);

      await expect(getManualTopupRequestDetails(mockData, mockApiKey)).rejects.toThrow(
        "No server response. Please check your internet connection."
      );
    });

    it("handles non-axios errors", async () => {
      const mockData = { id: 1 };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(false);
      jest.mocked(billingApiRequest).mockRejectedValue(new Error("Network error"));

      await expect(getManualTopupRequestDetails(mockData, mockApiKey)).rejects.toThrow(
        "Server error while fetching manual topup request details."
      );
    });

    it("handles axios error with response but no message", async () => {
      const mockData = { id: 1 };
      const errorResponse = {
        response: {
          data: {},
        },
        isAxiosError: true,
      };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.mocked(billingApiRequest).mockRejectedValue(errorResponse);

      await expect(getManualTopupRequestDetails(mockData, mockApiKey)).rejects.toThrow(
        "Error fetching manual topup request details."
      );
    });
  });

  describe("getAvailableConnectors", () => {
    it("successfully gets available connectors", async () => {
      const mockResponse = { data: { message: { connectors: [] } } };

      jest.mocked(billingApiRequest).mockResolvedValue(mockResponse);

      const result = await getAvailableConnectors(mockApiKey);

      expect(billingApiRequest).toHaveBeenCalledWith({
        method: "POST",
        endpoint: expect.any(String),
        data: {},
        apiKey: mockApiKey,
      });
      expect(result).toEqual(mockResponse.data);
    });

    it("throws error when response has no data", async () => {
      const mockResponse = { data: null };

      jest.mocked(billingApiRequest).mockResolvedValue(mockResponse as any);

      await expect(getAvailableConnectors(mockApiKey)).rejects.toThrow(
        "Server error while fetching available connectors."
      );
    });

    it("handles axios error with response", async () => {
      const errorResponse = {
        response: {
          data: {
            message: "Connectors fetch failed",
          },
        },
        isAxiosError: true,
      };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.mocked(billingApiRequest).mockRejectedValue(errorResponse);

      await expect(getAvailableConnectors(mockApiKey)).rejects.toThrow("Connectors fetch failed");
    });

    it("handles axios error with request but no response", async () => {
      const errorRequest = {
        request: {},
        isAxiosError: true,
      };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.mocked(billingApiRequest).mockRejectedValue(errorRequest);

      await expect(getAvailableConnectors(mockApiKey)).rejects.toThrow(
        "No server response. Please check your internet connection."
      );
    });

    it("handles non-axios errors", async () => {
      jest.spyOn(axios, "isAxiosError").mockReturnValue(false);
      jest.mocked(billingApiRequest).mockRejectedValue(new Error("Network error"));

      await expect(getAvailableConnectors(mockApiKey)).rejects.toThrow(
        "Server error while fetching available connectors."
      );
    });

    it("handles axios error with response but no message", async () => {
      const errorResponse = {
        response: {
          data: {},
        },
        isAxiosError: true,
      };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.mocked(billingApiRequest).mockRejectedValue(errorResponse);

      await expect(getAvailableConnectors(mockApiKey)).rejects.toThrow(
        "Error fetching available connectors."
      );
    });
  });
});
