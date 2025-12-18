// Mock billingApiRequest
jest.mock("@/controller/api/config/config", () => ({
  billingApiRequest: jest.fn(),
}));

// Mock axios
jest.mock("axios");

import { billingApiRequest } from "@/controller/api/config/config";
import axios from "axios";
import {
  getBenefitGraph,
  getBenefitByTier,
  getBenefitByClient,
  getBenefitDetails,
} from "@/controller/query/admin/benefit/benefit.service";

describe("controller/query/admin/benefit/benefit.service.ts - Comprehensive Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getBenefitGraph", () => {
    const mockData = { period: "month", type: "revenue" };
    const apiKey = "test-api-key";

    describe("Success scenarios", () => {
      it("should return benefit graph data successfully", async () => {
        const mockResponse = {
          data: { graph: [{ date: "2024-01", amount: 1000 }] },
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };
        (billingApiRequest as jest.Mock).mockResolvedValueOnce(mockResponse);

        const result = await getBenefitGraph(mockData, apiKey);

        expect(billingApiRequest).toHaveBeenCalledWith({
          method: "POST",
          endpoint: expect.any(String),
          data: mockData,
          apiKey,
        });
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe("API error scenarios", () => {
      it("should throw error when API returns error", async () => {
        const axiosError = {
          response: { status: 500, data: { message: "Server error" } },
        };
        (billingApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
        jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

        await expect(getBenefitGraph(mockData, apiKey)).rejects.toThrow("Server error");
      });

      it("should throw error when request fails", async () => {
        const axiosError = { request: {} };
        (billingApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
        jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

        await expect(getBenefitGraph(mockData, apiKey)).rejects.toThrow(
          "No server response. Please check your internet connection."
        );
      });
    });

    describe("Empty response scenarios", () => {
      it("should throw error when response data is null", async () => {
        (billingApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

        await expect(getBenefitGraph(mockData, apiKey)).rejects.toThrow(
          "Error retrieving benefit graph data."
        );
      });

      it("should throw error when response data is undefined", async () => {
        (billingApiRequest as jest.Mock).mockResolvedValueOnce({ data: undefined });

        await expect(getBenefitGraph(mockData, apiKey)).rejects.toThrow(
          "Error retrieving benefit graph data."
        );
      });
    });

    describe("Thrown exception scenarios", () => {
      it("should throw error for non-axios errors", async () => {
        (billingApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
        jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

        await expect(getBenefitGraph(mockData, apiKey)).rejects.toThrow(
          "Error retrieving benefit graph data."
        );
      });
    });
  });

  describe("getBenefitByTier", () => {
    const mockData = { start_date: "2024-01-01", end_date: "2024-01-31" };
    const apiKey = "test-api-key";

    describe("Success scenarios", () => {
      it("should return benefit by tier data successfully", async () => {
        const mockResponse = {
          data: { tiers: [{ name: "Gold", amount: 5000 }] },
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };
        (billingApiRequest as jest.Mock).mockResolvedValueOnce(mockResponse);

        const result = await getBenefitByTier(mockData, apiKey);

        expect(billingApiRequest).toHaveBeenCalledWith({
          method: "POST",
          endpoint: expect.any(String),
          data: mockData,
          apiKey,
        });
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe("Validation scenarios", () => {
      it("should throw error when start_date is missing", async () => {
        const invalidData = { end_date: "2024-01-31" } as any;
        jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

        await expect(getBenefitByTier(invalidData, apiKey)).rejects.toThrow(
          "Error retrieving benefit by tier data."
        );
      });

      it("should throw error when end_date is missing", async () => {
        const invalidData = { start_date: "2024-01-01" } as any;
        jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

        await expect(getBenefitByTier(invalidData, apiKey)).rejects.toThrow(
          "Error retrieving benefit by tier data."
        );
      });

      it("should throw error when both dates are missing", async () => {
        const invalidData = {} as any;
        jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

        await expect(getBenefitByTier(invalidData, apiKey)).rejects.toThrow(
          "Error retrieving benefit by tier data."
        );
      });
    });

    describe("API error scenarios", () => {
      it("should throw error when API returns error", async () => {
        const axiosError = {
          response: { status: 400, data: { message: "Bad request" } },
        };
        (billingApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
        jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

        await expect(getBenefitByTier(mockData, apiKey)).rejects.toThrow("Bad request");
      });
    });

    describe("Empty response scenarios", () => {
      it("should throw error when response data is null", async () => {
        (billingApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

        await expect(getBenefitByTier(mockData, apiKey)).rejects.toThrow(
          "Error retrieving benefit by tier data."
        );
      });
    });

    describe("Thrown exception scenarios", () => {
      it("should throw error for non-axios errors", async () => {
        (billingApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Connection error"));
        jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

        await expect(getBenefitByTier(mockData, apiKey)).rejects.toThrow(
          "Error retrieving benefit by tier data."
        );
      });
    });
  });

  describe("getBenefitByClient", () => {
    const mockData = { start_date: "2024-01-01", end_date: "2024-01-31" };
    const apiKey = "test-api-key";

    describe("Success scenarios", () => {
      it("should return benefit by client data successfully", async () => {
        const mockResponse = {
          data: { clients: [{ name: "Client A", amount: 3000 }] },
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };
        (billingApiRequest as jest.Mock).mockResolvedValueOnce(mockResponse);

        const result = await getBenefitByClient(mockData, apiKey);

        expect(billingApiRequest).toHaveBeenCalledWith({
          method: "POST",
          endpoint: expect.any(String),
          data: mockData,
          apiKey,
        });
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe("Validation scenarios", () => {
      it("should throw error when start_date is missing", async () => {
        const invalidData = { end_date: "2024-01-31" } as any;
        jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

        await expect(getBenefitByClient(invalidData, apiKey)).rejects.toThrow(
          "Error retrieving benefit by client data."
        );
      });

      it("should throw error when end_date is missing", async () => {
        const invalidData = { start_date: "2024-01-01" } as any;
        jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

        await expect(getBenefitByClient(invalidData, apiKey)).rejects.toThrow(
          "Error retrieving benefit by client data."
        );
      });
    });

    describe("API error scenarios", () => {
      it("should throw error when API returns error", async () => {
        const axiosError = {
          response: { status: 401, data: { message: "Unauthorized" } },
        };
        (billingApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
        jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

        await expect(getBenefitByClient(mockData, apiKey)).rejects.toThrow("Unauthorized");
      });
    });

    describe("Empty response scenarios", () => {
      it("should throw error when response data is null", async () => {
        (billingApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

        await expect(getBenefitByClient(mockData, apiKey)).rejects.toThrow(
          "Error retrieving benefit by client data."
        );
      });
    });

    describe("Thrown exception scenarios", () => {
      it("should throw error for non-axios errors", async () => {
        (billingApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Timeout"));
        jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

        await expect(getBenefitByClient(mockData, apiKey)).rejects.toThrow(
          "Error retrieving benefit by client data."
        );
      });
    });
  });

  describe("getBenefitDetails", () => {
    const mockData = { benefit_id: "123" };
    const apiKey = "test-api-key";

    describe("Success scenarios", () => {
      it("should return benefit details successfully", async () => {
        const mockResponse = {
          data: { id: "123", name: "Benefit A", description: "Description" },
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };
        (billingApiRequest as jest.Mock).mockResolvedValueOnce(mockResponse);

        const result = await getBenefitDetails(mockData, apiKey);

        expect(billingApiRequest).toHaveBeenCalledWith({
          method: "POST",
          endpoint: expect.any(String),
          data: mockData,
          apiKey,
        });
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe("API error scenarios", () => {
      it("should throw error when API returns error", async () => {
        const axiosError = {
          response: { status: 404, data: { message: "Not found" } },
        };
        (billingApiRequest as jest.Mock).mockRejectedValueOnce(axiosError);
        jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

        await expect(getBenefitDetails(mockData, apiKey)).rejects.toThrow("Not found");
      });
    });

    describe("Empty response scenarios", () => {
      it("should throw error when response data is null", async () => {
        (billingApiRequest as jest.Mock).mockResolvedValueOnce({ data: null });

        await expect(getBenefitDetails(mockData, apiKey)).rejects.toThrow(
          "Error retrieving benefit details."
        );
      });
    });

    describe("Thrown exception scenarios", () => {
      it("should throw error for non-axios errors", async () => {
        (billingApiRequest as jest.Mock).mockRejectedValueOnce(new Error("Network failure"));
        jest.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

        await expect(getBenefitDetails(mockData, apiKey)).rejects.toThrow(
          "Error retrieving benefit details."
        );
      });
    });
  });
});

