import { fetchData, fetchItems, addItem, updateItem, deleteItem } from "../../../../src/controller/api/config/fetchData";
import axios from "axios";
import apiRequest from "../../../../src/controller/api/config/config";

jest.mock("axios");
jest.mock("../../../../src/controller/api/config/config");

describe("controller/api/config/fetchData.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(axios, "isAxiosError");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("fetchData", () => {
    it("module loads", () => {
      expect(fetchData).toBeDefined();
      expect(typeof fetchData).toBe("function");
    });

    it("successfully fetches data", async () => {
      const mockData = { data: "test" };
      jest.spyOn(axios, "get").mockResolvedValue({ data: mockData });

      const result = await fetchData("/test");

      expect(axios.get).toHaveBeenCalledWith("/test", undefined);
      expect(result).toEqual(mockData);
    });

    it("passes config to axios", async () => {
      const mockData = { data: "test" };
      const config = { headers: { "Content-Type": "application/json" } };
      jest.spyOn(axios, "get").mockResolvedValue({ data: mockData });

      await fetchData("/test", config);

      expect(axios.get).toHaveBeenCalledWith("/test", config);
    });

    it("throws axios error", async () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 404 },
      };
      jest.spyOn(axios, "get").mockRejectedValue(axiosError);
      (axios.isAxiosError as jest.Mock).mockReturnValue(true);

      await expect(fetchData("/test")).rejects.toEqual(axiosError);
    });

    it("throws unknown error", async () => {
      const error = new Error("Unknown error");
      jest.spyOn(axios, "get").mockRejectedValue(error);
      (axios.isAxiosError as jest.Mock).mockReturnValue(false);

      await expect(fetchData("/test")).rejects.toThrow("An unknown error occurred");
    });
  });

  describe("fetchItems", () => {
    it("module loads", () => {
      expect(fetchItems).toBeDefined();
      expect(typeof fetchItems).toBe("function");
    });

    it("calls apiRequest with correct parameters", async () => {
      (apiRequest as jest.Mock).mockResolvedValue({ data: [] });

      await fetchItems();

      expect(apiRequest).toHaveBeenCalledWith({
        method: "GET",
        endpoint: "/items",
      });
    });

    it("handles errors silently", async () => {
      (apiRequest as jest.Mock).mockRejectedValue(new Error("Error"));

      await expect(fetchItems()).resolves.not.toThrow();
    });
  });

  describe("addItem", () => {
    it("module loads", () => {
      expect(addItem).toBeDefined();
      expect(typeof addItem).toBe("function");
    });

    it("calls apiRequest with correct parameters", async () => {
      const itemData = { name: "Test" };
      const token = "test-token";
      (apiRequest as jest.Mock).mockResolvedValue({ data: itemData });

      await addItem(itemData, token);

      expect(apiRequest).toHaveBeenCalledWith({
        method: "POST",
        endpoint: "/items",
        data: itemData,
        token: token,
      });
    });

    it("handles errors silently", async () => {
      (apiRequest as jest.Mock).mockRejectedValue(new Error("Error"));

      await expect(addItem({}, "token")).resolves.not.toThrow();
    });
  });

  describe("updateItem", () => {
    it("module loads", () => {
      expect(updateItem).toBeDefined();
      expect(typeof updateItem).toBe("function");
    });

    it("calls apiRequest with correct parameters", async () => {
      const itemId = 1;
      const updateData = { name: "Updated" };
      const token = "test-token";
      (apiRequest as jest.Mock).mockResolvedValue({ data: updateData });

      await updateItem(itemId, updateData, token);

      expect(apiRequest).toHaveBeenCalledWith({
        method: "PUT",
        endpoint: "/items",
        id: itemId,
        data: updateData,
        token: token,
      });
    });

    it("handles errors silently", async () => {
      (apiRequest as jest.Mock).mockRejectedValue(new Error("Error"));

      await expect(updateItem(1, {}, "token")).resolves.not.toThrow();
    });
  });

  describe("deleteItem", () => {
    it("module loads", () => {
      expect(deleteItem).toBeDefined();
      expect(typeof deleteItem).toBe("function");
    });

    it("calls apiRequest with correct parameters", async () => {
      const itemId = 1;
      const token = "test-token";
      (apiRequest as jest.Mock).mockResolvedValue({ data: {} });

      await deleteItem(itemId, token);

      expect(apiRequest).toHaveBeenCalledWith({
        method: "DELETE",
        endpoint: "/items",
        id: itemId,
        token: token,
      });
    });

    it("handles errors silently", async () => {
      (apiRequest as jest.Mock).mockRejectedValue(new Error("Error"));

      await expect(deleteItem(1, "token")).resolves.not.toThrow();
    });
  });
});
