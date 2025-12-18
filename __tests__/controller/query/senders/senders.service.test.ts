import axios from "axios";
import {
  getClientSenderIdsList,
  getClientSenderIdsListForMessages,
  createSenderIdRequest,
} from "../../../../src/controller/query/senders/senders.service";
import { smsApiRequest } from "@/controller/api/config/smsApiConfig";

jest.mock("@/controller/api/config/smsApiConfig", () => ({
  smsApiRequest: jest.fn(),
}));

jest.mock("axios");

describe("controller/query/senders/senders.service.ts", () => {
  const mockApiKey = "test-api-key";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getClientSenderIdsList", () => {
    it("successfully gets client sender IDs list", async () => {
      const mockData = { message: { data: [] } };
      const mockResponse = { data: mockData };

      jest.mocked(smsApiRequest).mockResolvedValue(mockResponse);

      const result = await getClientSenderIdsList({}, mockApiKey);

      expect(smsApiRequest).toHaveBeenCalledWith({
        method: "POST",
        endpoint: expect.any(String),
        data: {},
        apiKey: mockApiKey,
      });
      expect(result).toEqual(mockData);
    });

    it("throws error when response has no data", async () => {
      const mockResponse = { data: null };

      jest.mocked(smsApiRequest).mockResolvedValue(mockResponse as any);

      await expect(getClientSenderIdsList({}, mockApiKey)).rejects.toThrow(
        "No server response for sender IDs list."
      );
    });

    it("handles axios error with response", async () => {
      const errorResponse = {
        response: {
          data: {
            message: "List fetch failed",
          },
        },
        isAxiosError: true,
      };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.mocked(smsApiRequest).mockRejectedValue(errorResponse);

      await expect(getClientSenderIdsList({}, mockApiKey)).rejects.toThrow("List fetch failed");
    });

    it("handles axios error with request but no response", async () => {
      const errorRequest = {
        request: {},
        isAxiosError: true,
      };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.mocked(smsApiRequest).mockRejectedValue(errorRequest);

      await expect(getClientSenderIdsList({}, mockApiKey)).rejects.toThrow(
        "No server response. Please check your internet connection."
      );
    });

    it("handles non-axios errors", async () => {
      jest.spyOn(axios, "isAxiosError").mockReturnValue(false);
      jest.mocked(smsApiRequest).mockRejectedValue(new Error("Network error"));

      await expect(getClientSenderIdsList({}, mockApiKey)).rejects.toThrow(
        "No server response for sender IDs list."
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
      jest.mocked(smsApiRequest).mockRejectedValue(errorResponse);

      await expect(getClientSenderIdsList({}, mockApiKey)).rejects.toThrow(
        "Error retrieving sender IDs list."
      );
    });
  });

  describe("getClientSenderIdsListForMessages", () => {
    it("successfully gets client sender IDs list for messages", async () => {
      const mockData = { message: { data: [] } };
      const mockResponse = { data: mockData };

      jest.mocked(smsApiRequest).mockResolvedValue(mockResponse);

      const result = await getClientSenderIdsListForMessages({}, mockApiKey);

      expect(smsApiRequest).toHaveBeenCalledWith({
        method: "POST",
        endpoint: expect.any(String),
        data: {},
        apiKey: mockApiKey,
      });
      expect(result).toEqual(mockData);
    });

    it("throws error when response has no data", async () => {
      const mockResponse = { data: null };

      jest.mocked(smsApiRequest).mockResolvedValue(mockResponse as any);

      await expect(getClientSenderIdsListForMessages({}, mockApiKey)).rejects.toThrow(
        "No server response for sender IDs list."
      );
    });

    it("handles axios error with response", async () => {
      const errorResponse = {
        response: {
          data: {
            message: "List fetch failed",
          },
        },
        isAxiosError: true,
      };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.mocked(smsApiRequest).mockRejectedValue(errorResponse);

      await expect(getClientSenderIdsListForMessages({}, mockApiKey)).rejects.toThrow(
        "List fetch failed"
      );
    });

    it("handles axios error with request but no response", async () => {
      const errorRequest = {
        request: {},
        isAxiosError: true,
      };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.mocked(smsApiRequest).mockRejectedValue(errorRequest);

      await expect(getClientSenderIdsListForMessages({}, mockApiKey)).rejects.toThrow(
        "No server response. Please check your internet connection."
      );
    });

    it("handles non-axios errors", async () => {
      jest.spyOn(axios, "isAxiosError").mockReturnValue(false);
      jest.mocked(smsApiRequest).mockRejectedValue(new Error("Network error"));

      await expect(getClientSenderIdsListForMessages({}, mockApiKey)).rejects.toThrow(
        "No server response for sender IDs list."
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
      jest.mocked(smsApiRequest).mockRejectedValue(errorResponse);

      await expect(getClientSenderIdsListForMessages({}, mockApiKey)).rejects.toThrow(
        "Error retrieving sender IDs list."
      );
    });
  });

  describe("createSenderIdRequest", () => {
    it("successfully creates sender ID request", async () => {
      const mockData = { sender_id: "TEST123" };
      const mockResponse = { data: { message: "Request created" } };

      jest.mocked(smsApiRequest).mockResolvedValue(mockResponse);

      const result = await createSenderIdRequest(mockData, mockApiKey);

      expect(smsApiRequest).toHaveBeenCalledWith({
        method: "POST",
        endpoint: expect.any(String),
        data: mockData,
        apiKey: mockApiKey,
      });
      expect(result).toEqual(mockResponse.data);
    });

    it("throws error when response has no data", async () => {
      const mockData = { sender_id: "TEST123" };
      const mockResponse = { data: null };

      jest.mocked(smsApiRequest).mockResolvedValue(mockResponse as any);

      await expect(createSenderIdRequest(mockData, mockApiKey)).rejects.toThrow(
        "No server response for sender ID request."
      );
    });

    it("handles axios error with response", async () => {
      const mockData = { sender_id: "TEST123" };
      const errorResponse = {
        response: {
          data: {
            message: "Creation failed",
          },
        },
        isAxiosError: true,
      };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.mocked(smsApiRequest).mockRejectedValue(errorResponse);

      await expect(createSenderIdRequest(mockData, mockApiKey)).rejects.toThrow("Creation failed");
    });

    it("handles axios error with request but no response", async () => {
      const mockData = { sender_id: "TEST123" };
      const errorRequest = {
        request: {},
        isAxiosError: true,
      };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.mocked(smsApiRequest).mockRejectedValue(errorRequest);

      await expect(createSenderIdRequest(mockData, mockApiKey)).rejects.toThrow(
        "No server response. Please check your internet connection."
      );
    });

    it("handles non-axios errors", async () => {
      const mockData = { sender_id: "TEST123" };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(false);
      jest.mocked(smsApiRequest).mockRejectedValue(new Error("Network error"));

      await expect(createSenderIdRequest(mockData, mockApiKey)).rejects.toThrow(
        "No server response for sender ID request."
      );
    });

    it("handles axios error with response but no message", async () => {
      const mockData = { sender_id: "TEST123" };
      const errorResponse = {
        response: {
          data: {},
        },
        isAxiosError: true,
      };

      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
      jest.mocked(smsApiRequest).mockRejectedValue(errorResponse);

      await expect(createSenderIdRequest(mockData, mockApiKey)).rejects.toThrow(
        "Error requesting sender ID."
      );
    });
  });
});
