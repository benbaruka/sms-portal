import { fetchData, fetchItems, addItem, updateItem, deleteItem } from "../../../../src/controller/api/config/fetchData";
import axios from "axios";
import apiRequest from "../../../../src/controller/api/config/config";

jest.mock("axios");
jest.mock("../../../../src/controller/api/config/config");

describe("controller/api/config/fetchData.ts - Comprehensive Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("fetchData", () => {
    const endpoint = "https://api.test.com/data";
    const mockData = { id: 1, name: "Test" };

    it("should successfully fetch data with axios.get", async () => {
      jest.spyOn(axios, "get").mockResolvedValue({ data: mockData });

      const result = await fetchData(endpoint);

      expect(result).toEqual(mockData);
      expect(axios.get).toHaveBeenCalledWith(endpoint, undefined);
    });

    it("should successfully fetch data with custom config", async () => {
      const config = { headers: { Authorization: "Bearer token" } };
      jest.spyOn(axios, "get").mockResolvedValue({ data: mockData });

      const result = await fetchData(endpoint, config);

      expect(result).toEqual(mockData);
      expect(axios.get).toHaveBeenCalledWith(endpoint, config);
    });

    it("should handle axios errors (404)", async () => {
      const axiosError = {
        response: { status: 404, data: { message: "Not found" } },
        isAxiosError: true,
      };
      jest.spyOn(axios, "get").mockRejectedValue(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);

      await expect(fetchData(endpoint)).rejects.toEqual(axiosError);
    });

    it("should handle axios errors (500)", async () => {
      const axiosError = {
        response: { status: 500, data: { message: "Server error" } },
        isAxiosError: true,
      };
      jest.spyOn(axios, "get").mockRejectedValue(axiosError);
      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);

      await expect(fetchData(endpoint)).rejects.toEqual(axiosError);
    });

    it("should handle non-axios errors and throw generic error", async () => {
      const genericError = new Error("Network failure");
      jest.spyOn(axios, "get").mockRejectedValue(genericError);
      jest.spyOn(axios, "isAxiosError").mockReturnValue(false);

      await expect(fetchData(endpoint)).rejects.toThrow("An unknown error occurred");
    });

    it("should handle timeout errors", async () => {
      const timeoutError = new Error("timeout of 5000ms exceeded");
      jest.spyOn(axios, "get").mockRejectedValue(timeoutError);
      jest.spyOn(axios, "isAxiosError").mockReturnValue(false);

      await expect(fetchData(endpoint)).rejects.toThrow("An unknown error occurred");
    });

    it("should handle network connection errors", async () => {
      const networkError = new Error("Network Error");
      jest.spyOn(axios, "get").mockRejectedValue(networkError);
      jest.spyOn(axios, "isAxiosError").mockReturnValue(false);

      await expect(fetchData(endpoint)).rejects.toThrow("An unknown error occurred");
    });
  });

  describe("fetchItems", () => {
    it("should call apiRequest with GET method", async () => {
      (apiRequest as jest.Mock).mockResolvedValue({
        data: { success: true, items: [] },
        status: 200,
        statusText: "OK",
      });

      await fetchItems();

      expect(apiRequest).toHaveBeenCalledWith({
        method: "GET",
        endpoint: "/items",
      });
    });

    it("should handle API errors silently (catches error)", async () => {
      const error = new Error("API Error");
      (apiRequest as jest.Mock).mockRejectedValue(error);

      // Should not throw - function catches errors
      await expect(fetchItems()).resolves.toBeUndefined();
    });

    it("should handle 500 server error", async () => {
      const error = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (apiRequest as jest.Mock).mockRejectedValue(error);

      await expect(fetchItems()).resolves.toBeUndefined();
    });

    it("should handle network error", async () => {
      const error = new Error("Network error");
      (apiRequest as jest.Mock).mockRejectedValue(error);

      await expect(fetchItems()).resolves.toBeUndefined();
    });

    it("should handle null response", async () => {
      (apiRequest as jest.Mock).mockResolvedValue(null);

      await expect(fetchItems()).resolves.toBeUndefined();
    });
  });

  describe("addItem", () => {
    const itemData = { name: "New Item", price: 100 };
    const token = "test-token";

    it("should call apiRequest with POST method", async () => {
      (apiRequest as jest.Mock).mockResolvedValue({
        data: { success: true, id: 1 },
        status: 201,
        statusText: "Created",
      });

      await addItem(itemData, token);

      expect(apiRequest).toHaveBeenCalledWith({
        method: "POST",
        endpoint: "/items",
        data: itemData,
        token: token,
      });
    });

    it("should handle API errors silently", async () => {
      const error = new Error("API Error");
      (apiRequest as jest.Mock).mockRejectedValue(error);

      await expect(addItem(itemData, token)).resolves.toBeUndefined();
    });

    it("should handle 400 validation error", async () => {
      const error = {
        response: { status: 400, data: { message: "Invalid data" } },
      };
      (apiRequest as jest.Mock).mockRejectedValue(error);

      await expect(addItem(itemData, token)).resolves.toBeUndefined();
    });

    it("should handle 401 unauthorized error", async () => {
      const error = {
        response: { status: 401, data: { message: "Unauthorized" } },
      };
      (apiRequest as jest.Mock).mockRejectedValue(error);

      await expect(addItem(itemData, token)).resolves.toBeUndefined();
    });

    it("should handle 403 forbidden error", async () => {
      const error = {
        response: { status: 403, data: { message: "Forbidden" } },
      };
      (apiRequest as jest.Mock).mockRejectedValue(error);

      await expect(addItem(itemData, token)).resolves.toBeUndefined();
    });
  });

  describe("updateItem", () => {
    const itemId = 123;
    const updateData = { name: "Updated Item", price: 150 };
    const token = "test-token";

    it("should call apiRequest with PUT method", async () => {
      (apiRequest as jest.Mock).mockResolvedValue({
        data: { success: true, item: { id: itemId, ...updateData } },
        status: 200,
        statusText: "OK",
      });

      await updateItem(itemId, updateData, token);

      expect(apiRequest).toHaveBeenCalledWith({
        method: "PUT",
        endpoint: "/items",
        id: itemId,
        data: updateData,
        token: token,
      });
    });

    it("should handle API errors silently", async () => {
      const error = new Error("API Error");
      (apiRequest as jest.Mock).mockRejectedValue(error);

      await expect(updateItem(itemId, updateData, token)).resolves.toBeUndefined();
    });

    it("should handle 404 not found error", async () => {
      const error = {
        response: { status: 404, data: { message: "Item not found" } },
      };
      (apiRequest as jest.Mock).mockRejectedValue(error);

      await expect(updateItem(itemId, updateData, token)).resolves.toBeUndefined();
    });

    it("should handle 500 server error", async () => {
      const error = {
        response: { status: 500, data: { message: "Server error" } },
      };
      (apiRequest as jest.Mock).mockRejectedValue(error);

      await expect(updateItem(itemId, updateData, token)).resolves.toBeUndefined();
    });

    it("should handle network error", async () => {
      const error = new Error("Network error");
      (apiRequest as jest.Mock).mockRejectedValue(error);

      await expect(updateItem(itemId, updateData, token)).resolves.toBeUndefined();
    });
  });

  describe("deleteItem", () => {
    const itemId = 456;
    const token = "test-token";

    it("should call apiRequest with DELETE method", async () => {
      (apiRequest as jest.Mock).mockResolvedValue({
        data: { success: true, message: "Item deleted" },
        status: 200,
        statusText: "OK",
      });

      await deleteItem(itemId, token);

      expect(apiRequest).toHaveBeenCalledWith({
        method: "DELETE",
        endpoint: "/items",
        id: itemId,
        token: token,
      });
    });

    it("should handle API errors silently", async () => {
      const error = new Error("API Error");
      (apiRequest as jest.Mock).mockRejectedValue(error);

      await expect(deleteItem(itemId, token)).resolves.toBeUndefined();
    });

    it("should handle 404 not found error", async () => {
      const error = {
        response: { status: 404, data: { message: "Item not found" } },
      };
      (apiRequest as jest.Mock).mockRejectedValue(error);

      await expect(deleteItem(itemId, token)).resolves.toBeUndefined();
    });

    it("should handle 403 forbidden error", async () => {
      const error = {
        response: { status: 403, data: { message: "Forbidden" } },
      };
      (apiRequest as jest.Mock).mockRejectedValue(error);

      await expect(deleteItem(itemId, token)).resolves.toBeUndefined();
    });

    it("should handle network error", async () => {
      const error = new Error("Network error");
      (apiRequest as jest.Mock).mockRejectedValue(error);

      await expect(deleteItem(itemId, token)).resolves.toBeUndefined();
    });
  });
});
