import { getMessagesTable } from "../../../../src/controller/query/messages/messagesTable.service";

import axios from "axios";

jest.mock("axios");
jest.mock("../../../../src/controller/api/config/smsApiConfig", () => ({
  smsBaseURL: "https://api.test.com",
}));

describe("controller/query/messages/messagesTable.service.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(axios, "isAxiosError");
    jest.spyOn(axios, "post");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("module loads", () => {
    expect(getMessagesTable).toBeDefined();
    expect(typeof getMessagesTable).toBe("function");
  });

  it("getMessagesTable - makes API call", async () => {
    const mockData = { data: [], current_page: 1, last_page: 1, total: 0 };
    jest.spyOn(axios, "post").mockResolvedValue({ data: mockData });

    const result = await getMessagesTable("messages/transactional", { page: 1 }, "test-api-key");

    expect(axios.post).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("getMessagesTable - handles scheduled route", async () => {
    const mockData = { data: [] };
    jest.spyOn(axios, "post").mockResolvedValue({ data: mockData });

    const result = await getMessagesTable("messages/scheduled", { page: 1 }, "test-api-key");

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("messages/scheduled"),
      expect.any(Object),
      expect.any(Object)
    );
    expect(result).toBeDefined();
  });

  it("getMessagesTable - handles error", async () => {
    const error = {
      isAxiosError: true,
      response: { data: { message: "Error" } },
    };
    jest.spyOn(axios, "post").mockRejectedValue(error);
    (axios.isAxiosError as jest.Mock).mockReturnValue(true);

    await expect(
      getMessagesTable("messages/transactional", { page: 1 }, "test-api-key")
    ).rejects.toThrow();
  });

  it("getMessagesTable - handles scheduled route with date params", async () => {
    const mockData = { data: [] };
    jest.spyOn(axios, "post").mockResolvedValue({ data: mockData });

    const result = await getMessagesTable(
      "messages/scheduled",
      { page: 1, start_date: "2024-01-01", end_date: "2024-01-31" },
      "test-api-key"
    );

    expect(axios.post).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("getMessagesTable - handles non-scheduled route with start/end params", async () => {
    const mockData = { data: [] };
    jest.spyOn(axios, "post").mockResolvedValue({ data: mockData });

    const result = await getMessagesTable(
      "messages/transactional",
      { page: 1, start: "2024-01-01", end: "2024-01-31" },
      "test-api-key"
    );

    expect(axios.post).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("getMessagesTable - handles array response", async () => {
    const mockData = [{ id: 1 }, { id: 2 }];
    jest.spyOn(axios, "post").mockResolvedValue({ data: mockData });

    const result = await getMessagesTable("messages/transactional", { page: 1 }, "test-api-key");

    expect(result.data).toEqual(mockData);
    expect(result.current_page).toBe(1);
    expect(result.total).toBe(2);
  });

  it("getMessagesTable - handles response with message.data array", async () => {
    const mockData = {
      message: {
        data: [{ id: 1 }, { id: 2 }],
        current_page: 2,
        last_page: 5,
        per_page: 10,
        total: 50,
        from: 11,
        to: 20,
      },
    };
    jest.spyOn(axios, "post").mockResolvedValue({ data: mockData });

    const result = await getMessagesTable("messages/transactional", { page: 1 }, "test-api-key");

    expect(result.data).toEqual([{ id: 1 }, { id: 2 }]);
    expect(result.current_page).toBe(2);
    expect(result.last_page).toBe(5);
    expect(result.per_page).toBe(10);
    expect(result.total).toBe(50);
    expect(result.from).toBe(11);
    expect(result.to).toBe(20);
  });

  it("getMessagesTable - handles response with message.messages array", async () => {
    const mockData = {
      message: {
        messages: [{ id: 1 }, { id: 2 }],
        current_page: 2,
      },
    };
    jest.spyOn(axios, "post").mockResolvedValue({ data: mockData });

    const result = await getMessagesTable("messages/transactional", { page: 1 }, "test-api-key");

    expect(result.data).toEqual([{ id: 1 }, { id: 2 }]);
    expect(result.current_page).toBe(2);
  });

  it("getMessagesTable - handles response with message.pagination", async () => {
    const mockData = {
      message: {
        data: [{ id: 1 }],
        pagination: {
          current_page: 3,
          last_page: 10,
          per_page: 25,
          total: 250,
          from: 51,
          to: 75,
        },
      },
    };
    jest.spyOn(axios, "post").mockResolvedValue({ data: mockData });

    const result = await getMessagesTable("messages/transactional", { page: 1 }, "test-api-key");

    expect(result.current_page).toBe(3);
    expect(result.last_page).toBe(10);
    expect(result.per_page).toBe(25);
    expect(result.total).toBe(250);
    expect(result.from).toBe(51);
    expect(result.to).toBe(75);
  });

  it("getMessagesTable - handles response with message.data but no current_page in message or pagination", async () => {
    const mockData = {
      message: {
        data: [{ id: 1 }],
        pagination: {
          // current_page is not a number
          last_page: 10,
        },
      },
    };
    jest.spyOn(axios, "post").mockResolvedValue({ data: mockData });

    const result = await getMessagesTable("messages/transactional", { page: 1 }, "test-api-key");

    // Should default to 1 when current_page is not a number in both message and pagination
    expect(result.current_page).toBe(1);
  });

  it("getMessagesTable - handles response with data array directly", async () => {
    const mockData = {
      data: [{ id: 1 }, { id: 2 }],
      current_page: 1,
      last_page: 1,
      per_page: 25,
      total: 2,
      from: 1,
      to: 2,
    };
    jest.spyOn(axios, "post").mockResolvedValue({ data: mockData });

    const result = await getMessagesTable("messages/transactional", { page: 1 }, "test-api-key");

    expect(result.data).toEqual([{ id: 1 }, { id: 2 }]);
    expect(result.current_page).toBe(1);
    expect(result.total).toBe(2);
  });

  it("getMessagesTable - handles response with data array but missing pagination", async () => {
    const mockData = {
      data: [{ id: 1 }],
    };
    jest.spyOn(axios, "post").mockResolvedValue({ data: mockData });

    const result = await getMessagesTable("/messages/transactional", { page: 1, per_page: 50 }, "test-api-key");

    expect(result.data).toEqual([{ id: 1 }]);
    expect(result.current_page).toBe(1);
    expect(result.last_page).toBe(1);
    expect(result.per_page).toBe(50);
    expect(result.total).toBe(1);
  });

  it("getMessagesTable - handles empty response", async () => {
    const mockData = {};
    jest.spyOn(axios, "post").mockResolvedValue({ data: mockData });

    const result = await getMessagesTable("messages/transactional", { page: 1 }, "test-api-key");

    expect(result.data).toEqual([]);
    expect(result.current_page).toBe(1);
    expect(result.total).toBe(0);
  });

  it("getMessagesTable - handles response with sort and filter", async () => {
    const mockData = { data: [] };
    jest.spyOn(axios, "post").mockResolvedValue({ data: mockData });

    const result = await getMessagesTable(
      "messages/transactional",
      { page: 1, sort: "created_at", filter: "sent" },
      "test-api-key"
    );

    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        sort: "created_at",
        filter: "sent",
      }),
      expect.any(Object)
    );
    expect(result).toBeDefined();
  });

  it("getMessagesTable - handles response with empty filter", async () => {
    const mockData = { data: [] };
    jest.spyOn(axios, "post").mockResolvedValue({ data: mockData });

    const result = await getMessagesTable(
      "messages/transactional",
      { page: 1, filter: "" },
      "test-api-key"
    );

    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        filter: "",
      }),
      expect.any(Object)
    );
    expect(result).toBeDefined();
  });

  it("getMessagesTable - handles response with service param", async () => {
    const mockData = { data: [] };
    jest.spyOn(axios, "post").mockResolvedValue({ data: mockData });

    const result = await getMessagesTable(
      "messages/transactional",
      { page: 1, service: "whatsapp" },
      "test-api-key"
    );

    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        service: "whatsapp",
      }),
      expect.any(Object)
    );
    expect(result).toBeDefined();
  });

  it("getMessagesTable - handles no response data", async () => {
    jest.spyOn(axios, "post").mockResolvedValue({ data: null });
    (axios.isAxiosError as jest.Mock).mockReturnValue(false);

    await expect(
      getMessagesTable("messages/transactional", { page: 1 }, "test-api-key")
    ).rejects.toThrow("Server error while fetching messages table.");
  });

  it("getMessagesTable - handles request error", async () => {
    const error = {
      isAxiosError: true,
      request: {},
    };
    jest.spyOn(axios, "post").mockRejectedValue(error);
    (axios.isAxiosError as jest.Mock).mockReturnValue(true);

    await expect(
      getMessagesTable("messages/transactional", { page: 1 }, "test-api-key")
    ).rejects.toThrow("No server response. Please check your internet connection.");
  });

  it("getMessagesTable - handles non-axios error", async () => {
    (axios.post as jest.Mock).mockRejectedValue(new Error("Network error"));
    (axios.isAxiosError as jest.Mock).mockReturnValue(false);

    await expect(
      getMessagesTable("messages/transactional", { page: 1 }, "test-api-key")
    ).rejects.toThrow("Server error while fetching messages table.");
  });
});
