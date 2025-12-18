
import {
  sendTransactionalSMS,
  sendPromotionalSMS,
  sendBulkMsisdnSMS,
  sendContactGroupSMS,
  sendUploadFileSMS,
  getTransactionalHistory,
  getPromotionalHistory,
  getBulkHistory,
  getBulkGroupHistory,
  getBulkMsisdnListHistory,
  getScheduledHistory,
  getRecurringHistory,
} from "../../../../src/controller/query/messages/messages.service";
import axios from "axios";

jest.mock("axios");
jest.mock("../../../../src/controller/api/config/smsApiConfig", () => ({
  smsBaseURL: "https://api.test.com",
}));
jest.mock("../../../../src/controller/api/constant/apiLink", () => ({
  messages: {
    sendTransactional: "/messages/transactional",
    sendPromotional: "/messages/promotional",
    sendBulkMsisdn: "/messages/bulk-msisdn",
    sendContactGroup: "/messages/contact-group",
    sendUploadFile: "/messages/upload-file",
    getTransactionalHistory: "/messages/transactional/history",
    allTransactional: "/messages/transactional/history",
    allPromotional: "/messages/promotional/history",
    bulk: "/messages/bulk",
    bulkGroup: "/messages/bulk-group",
    bulkMsisdnList: "/messages/bulk-msisdn-list",
    allScheduled: "/messages/scheduled",
    allRecurring: "/messages/recurring",
  },
}));

describe("controller/query/messages/messages.service.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(axios, "isAxiosError");
    jest.spyOn(axios, "post");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("module loads", () => {
    expect(sendTransactionalSMS).toBeDefined();
    expect(sendPromotionalSMS).toBeDefined();
    expect(sendBulkMsisdnSMS).toBeDefined();
    expect(sendContactGroupSMS).toBeDefined();
    expect(sendUploadFileSMS).toBeDefined();
    expect(getTransactionalHistory).toBeDefined();
    expect(getPromotionalHistory).toBeDefined();
    expect(getBulkHistory).toBeDefined();
    expect(getBulkGroupHistory).toBeDefined();
    expect(getBulkMsisdnListHistory).toBeDefined();
    expect(getScheduledHistory).toBeDefined();
    expect(getRecurringHistory).toBeDefined();
  });

  it("sendTransactionalSMS - makes API call", async () => {
    const mockData = { message: { status: "sent" } };
    jest.spyOn(axios, "post").mockResolvedValue({ data: mockData });

    const result = await sendTransactionalSMS(
      { msisdn: "+1234567890", message: "Test" },
      "test-api-key"
    );

    expect(axios.post).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("sendTransactionalSMS - handles error", async () => {
    const error = {
      isAxiosError: true,
      response: { data: { message: "Error" } },
    };
    jest.spyOn(axios, "post").mockRejectedValue(error);
    (axios.isAxiosError as jest.Mock).mockReturnValue(true);

    await expect(
      sendTransactionalSMS({ msisdn: "+1234567890", message: "Test" }, "test-api-key")
    ).rejects.toThrow();
  });

  it("getTransactionalHistory - makes API call", async () => {
    const mockData = { message: { data: [] } };
    jest.spyOn(axios, "post").mockResolvedValue({ data: mockData });

    const result = await getTransactionalHistory({ page: 1 }, "test-api-key");

    expect(axios.post).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("getTransactionalHistory - handles no response data", async () => {
    jest.spyOn(axios, "post").mockResolvedValue({ data: null });
    (axios.isAxiosError as jest.Mock).mockReturnValue(false);

    await expect(getTransactionalHistory({ page: 1 }, "test-api-key")).rejects.toThrow(
      "Server error while fetching transactional history."
    );
  });

  it("getTransactionalHistory - handles error with response", async () => {
    const error = {
      isAxiosError: true,
      response: { data: { message: "Error message" } },
    };
    jest.spyOn(axios, "post").mockRejectedValue(error);
    (axios.isAxiosError as jest.Mock).mockReturnValue(true);

    await expect(getTransactionalHistory({ page: 1 }, "test-api-key")).rejects.toThrow(
      "Error message"
    );
  });

  it("getTransactionalHistory - handles error with response but no message", async () => {
    const error = {
      isAxiosError: true,
      response: { data: {} },
    };
    jest.spyOn(axios, "post").mockRejectedValue(error);
    (axios.isAxiosError as jest.Mock).mockReturnValue(true);

    await expect(getTransactionalHistory({ page: 1 }, "test-api-key")).rejects.toThrow(
      "Error fetching transactional history."
    );
  });

  it("getTransactionalHistory - handles request error", async () => {
    const error = {
      isAxiosError: true,
      request: {},
    };
    jest.spyOn(axios, "post").mockRejectedValue(error);
    (axios.isAxiosError as jest.Mock).mockReturnValue(true);

    await expect(getTransactionalHistory({ page: 1 }, "test-api-key")).rejects.toThrow(
      "No server response. Please check your internet connection."
    );
  });

  it("getTransactionalHistory - handles non-axios error", async () => {
    jest.spyOn(axios, "post").mockRejectedValue(new Error("Network error"));
    (axios.isAxiosError as jest.Mock).mockReturnValue(false);

    await expect(getTransactionalHistory({ page: 1 }, "test-api-key")).rejects.toThrow(
      "Server error while fetching transactional history."
    );
  });

  it("sendTransactionalSMS - handles no response data", async () => {
    jest.spyOn(axios, "post").mockResolvedValue({ data: null });
    (axios.isAxiosError as jest.Mock).mockReturnValue(false);

    await expect(
      sendTransactionalSMS({ msisdn: "+1234567890", message: "Test" }, "test-api-key")
    ).rejects.toThrow("Server error while sending transactional SMS.");
  });

  it("sendTransactionalSMS - handles request error", async () => {
    const error = {
      isAxiosError: true,
      request: {},
    };
    jest.spyOn(axios, "post").mockRejectedValue(error);
    (axios.isAxiosError as jest.Mock).mockReturnValue(true);

    await expect(
      sendTransactionalSMS({ msisdn: "+1234567890", message: "Test" }, "test-api-key")
    ).rejects.toThrow("No server response. Please check your internet connection.");
  });

  it("sendTransactionalSMS - handles non-axios error", async () => {
    (axios.post as jest.Mock).mockRejectedValue(new Error("Network error"));
    (axios.isAxiosError as jest.Mock).mockReturnValue(false);

    await expect(
      sendTransactionalSMS({ msisdn: "+1234567890", message: "Test" }, "test-api-key")
    ).rejects.toThrow("Server error while sending transactional SMS.");
  });

  describe("sendPromotionalSMS", () => {
    it("makes API call", async () => {
      const mockData = { message: { status: "sent" } };
      jest.spyOn(axios, "post").mockResolvedValue({ data: mockData });

      const result = await sendPromotionalSMS(
        { msisdn: "+1234567890", message: "Test" },
        "test-api-key"
      );

      expect(axios.post).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("handles no response data", async () => {
      jest.spyOn(axios, "post").mockResolvedValue({ data: null });
      (axios.isAxiosError as jest.Mock).mockReturnValue(false);

      await expect(
        sendPromotionalSMS({ msisdn: "+1234567890", message: "Test" }, "test-api-key")
      ).rejects.toThrow("Server error while sending promotional SMS.");
    });

    it("handles error with response", async () => {
      const error = {
        isAxiosError: true,
        response: { data: { message: "Error" } },
      };
      jest.spyOn(axios, "post").mockRejectedValue(error);
      (axios.isAxiosError as jest.Mock).mockReturnValue(true);

      await expect(
        sendPromotionalSMS({ msisdn: "+1234567890", message: "Test" }, "test-api-key")
      ).rejects.toThrow("Error");
    });

    it("handles request error", async () => {
      const error = {
        isAxiosError: true,
        request: {},
      };
      jest.spyOn(axios, "post").mockRejectedValue(error);
      (axios.isAxiosError as jest.Mock).mockReturnValue(true);

      await expect(
        sendPromotionalSMS({ msisdn: "+1234567890", message: "Test" }, "test-api-key")
      ).rejects.toThrow("No server response. Please check your internet connection.");
    });

    it("handles non-axios error", async () => {
      (axios.post as jest.Mock).mockRejectedValue(new Error("Network error"));
      (axios.isAxiosError as jest.Mock).mockReturnValue(false);

      await expect(
        sendPromotionalSMS({ msisdn: "+1234567890", message: "Test" }, "test-api-key")
      ).rejects.toThrow("Server error while sending promotional SMS.");
    });
  });

  describe("sendBulkMsisdnSMS", () => {
    it("makes API call", async () => {
      const mockData = { message: { status: "sent" } };
      jest.spyOn(axios, "post").mockResolvedValue({ data: mockData });

      const result = await sendBulkMsisdnSMS(
        { msisdn_list: ["+1234567890"], message: "Test" },
        "test-api-key"
      );

      expect(axios.post).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("handles no response data", async () => {
      jest.spyOn(axios, "post").mockResolvedValue({ data: null });
      (axios.isAxiosError as jest.Mock).mockReturnValue(false);

      await expect(
        sendBulkMsisdnSMS({ msisdn_list: ["+1234567890"], message: "Test" }, "test-api-key")
      ).rejects.toThrow("Server error while sending bulk SMS.");
    });

    it("handles error", async () => {
      const error = {
        isAxiosError: true,
        response: { data: { message: "Error" } },
      };
      jest.spyOn(axios, "post").mockRejectedValue(error);
      (axios.isAxiosError as jest.Mock).mockReturnValue(true);

      await expect(
        sendBulkMsisdnSMS({ msisdn_list: ["+1234567890"], message: "Test" }, "test-api-key")
      ).rejects.toThrow("Error");
    });

    it("handles request error", async () => {
      const error = {
        isAxiosError: true,
        request: {},
      };
      jest.spyOn(axios, "post").mockRejectedValue(error);
      (axios.isAxiosError as jest.Mock).mockReturnValue(true);

      await expect(
        sendBulkMsisdnSMS({ msisdn_list: ["+1234567890"], message: "Test" }, "test-api-key")
      ).rejects.toThrow("No server response. Please check your internet connection.");
    });

    it("handles non-axios error", async () => {
      jest.spyOn(axios, "post").mockRejectedValue(new Error("Network error"));
      (axios.isAxiosError as jest.Mock).mockReturnValue(false);

      await expect(
        sendBulkMsisdnSMS({ msisdn_list: ["+1234567890"], message: "Test" }, "test-api-key")
      ).rejects.toThrow("Server error while sending bulk SMS.");
    });
  });

  describe("sendContactGroupSMS", () => {
    it("makes API call with all fields", async () => {
      const mockData = { message: { status: "sent" } };
      jest.spyOn(axios, "post").mockResolvedValue({ data: mockData });

      const result = await sendContactGroupSMS(
        {
          contact_group_id: 1,
          message: "Test",
          sender_id: "123",
          campaign_name: "Test Campaign",
          sms_type: "promotional",
          schedule: true,
          date: "2024-01-01",
          send_time: "10:00",
          repeat_type: "daily",
        },
        "test-api-key"
      );

      expect(axios.post).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("makes API call with minimal fields", async () => {
      const mockData = { message: { status: "sent" } };
      jest.spyOn(axios, "post").mockResolvedValue({ data: mockData });

      const result = await sendContactGroupSMS(
        {
          contact_group_id: 1,
          message: "Test",
          sender_id: "123",
          campaign_name: "Test Campaign",
        },
        "test-api-key"
      );

      expect(axios.post).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("handles no response data", async () => {
      jest.spyOn(axios, "post").mockResolvedValue({ data: null });
      (axios.isAxiosError as jest.Mock).mockReturnValue(false);

      await expect(
        sendContactGroupSMS(
          {
            contact_group_id: 1,
            message: "Test",
            sender_id: "123",
            campaign_name: "Test Campaign",
          },
          "test-api-key"
        )
      ).rejects.toThrow("Server error while sending contact group SMS.");
    });

    it("handles error", async () => {
      const error = {
        isAxiosError: true,
        response: { data: { message: "Error" } },
      };
      jest.spyOn(axios, "post").mockRejectedValue(error);
      (axios.isAxiosError as jest.Mock).mockReturnValue(true);

      await expect(
        sendContactGroupSMS(
          {
            contact_group_id: 1,
            message: "Test",
            sender_id: "123",
            campaign_name: "Test Campaign",
          },
          "test-api-key"
        )
      ).rejects.toThrow("Error");
    });

    it("handles request error", async () => {
      const error = {
        isAxiosError: true,
        request: {},
      };
      jest.spyOn(axios, "post").mockRejectedValue(error);
      (axios.isAxiosError as jest.Mock).mockReturnValue(true);

      await expect(
        sendContactGroupSMS(
          {
            contact_group_id: 1,
            message: "Test",
            sender_id: "123",
            campaign_name: "Test Campaign",
          },
          "test-api-key"
        )
      ).rejects.toThrow("No server response. Please check your internet connection.");
    });

    it("handles non-axios error", async () => {
      jest.spyOn(axios, "post").mockRejectedValue(new Error("Network error"));
      (axios.isAxiosError as jest.Mock).mockReturnValue(false);

      await expect(
        sendContactGroupSMS(
          {
            contact_group_id: 1,
            message: "Test",
            sender_id: "123",
            campaign_name: "Test Campaign",
          },
          "test-api-key"
        )
      ).rejects.toThrow("Server error while sending contact group SMS.");
    });
  });

  describe("sendUploadFileSMS", () => {
    it("makes API call with all fields", async () => {
      const mockData = { message: { status: "sent" } };
      jest.spyOn(axios, "post").mockResolvedValue({ data: mockData });
      const mockFile = new File(["content"], "test.csv", { type: "text/csv" });

      const result = await sendUploadFileSMS(
        {
          file: mockFile,
          message: "Test",
          sender_id: "123",
          campaign_name: "Test Campaign",
          route: "custom/route",
          service: "sms",
          schedule: true,
          send_date: "2024-01-01",
          send_time: "10:00",
          date: "2024-01-01",
          repeat_type: "daily",
        },
        "test-api-key"
      );

      expect(axios.post).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("makes API call with minimal fields", async () => {
      const mockData = { message: { status: "sent" } };
      jest.spyOn(axios, "post").mockResolvedValue({ data: mockData });
      const mockFile = new File(["content"], "test.csv", { type: "text/csv" });

      const result = await sendUploadFileSMS(
        {
          file: mockFile,
          message: "Test",
          sender_id: "123",
          campaign_name: "Test Campaign",
        },
        "test-api-key"
      );

      expect(axios.post).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("handles no response data", async () => {
      jest.spyOn(axios, "post").mockResolvedValue({ data: null });
      (axios.isAxiosError as jest.Mock).mockReturnValue(false);
      const mockFile = new File(["content"], "test.csv", { type: "text/csv" });

      await expect(
        sendUploadFileSMS(
          {
            file: mockFile,
            message: "Test",
            sender_id: "123",
            campaign_name: "Test Campaign",
          },
          "test-api-key"
        )
      ).rejects.toThrow("Server error while sending file upload SMS.");
    });

    it("handles error", async () => {
      const error = {
        isAxiosError: true,
        response: { data: { message: "Error" } },
      };
      jest.spyOn(axios, "post").mockRejectedValue(error);
      (axios.isAxiosError as jest.Mock).mockReturnValue(true);
      const mockFile = new File(["content"], "test.csv", { type: "text/csv" });

      await expect(
        sendUploadFileSMS(
          {
            file: mockFile,
            message: "Test",
            sender_id: "123",
            campaign_name: "Test Campaign",
          },
          "test-api-key"
        )
      ).rejects.toThrow("Error");
    });

    it("handles request error", async () => {
      const error = {
        isAxiosError: true,
        request: {},
      };
      jest.spyOn(axios, "post").mockRejectedValue(error);
      (axios.isAxiosError as jest.Mock).mockReturnValue(true);
      const mockFile = new File(["content"], "test.csv", { type: "text/csv" });

      await expect(
        sendUploadFileSMS(
          {
            file: mockFile,
            message: "Test",
            sender_id: "123",
            campaign_name: "Test Campaign",
          },
          "test-api-key"
        )
      ).rejects.toThrow("No server response. Please check your internet connection.");
    });

    it("handles non-axios error", async () => {
      jest.spyOn(axios, "post").mockRejectedValue(new Error("Network error"));
      (axios.isAxiosError as jest.Mock).mockReturnValue(false);
      const mockFile = new File(["content"], "test.csv", { type: "text/csv" });

      await expect(
        sendUploadFileSMS(
          {
            file: mockFile,
            message: "Test",
            sender_id: "123",
            campaign_name: "Test Campaign",
          },
          "test-api-key"
        )
      ).rejects.toThrow("Server error while sending file upload SMS.");
    });
  });

  describe("getPromotionalHistory", () => {
    it("makes API call", async () => {
      const mockData = { message: { data: [] } };
      jest.spyOn(axios, "post").mockResolvedValue({ data: mockData });

      const result = await getPromotionalHistory({ page: 1 }, "test-api-key");

      expect(axios.post).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("handles no response data", async () => {
      jest.spyOn(axios, "post").mockResolvedValue({ data: null });
      (axios.isAxiosError as jest.Mock).mockReturnValue(false);

      await expect(getPromotionalHistory({ page: 1 }, "test-api-key")).rejects.toThrow(
        "Server error while fetching promotional history."
      );
    });

    it("handles error", async () => {
      const error = {
        isAxiosError: true,
        response: { data: { message: "Error" } },
      };
      jest.spyOn(axios, "post").mockRejectedValue(error);
      (axios.isAxiosError as jest.Mock).mockReturnValue(true);

      await expect(getPromotionalHistory({ page: 1 }, "test-api-key")).rejects.toThrow("Error");
    });

    it("handles request error", async () => {
      const error = {
        isAxiosError: true,
        request: {},
      };
      jest.spyOn(axios, "post").mockRejectedValue(error);
      (axios.isAxiosError as jest.Mock).mockReturnValue(true);

      await expect(getPromotionalHistory({ page: 1 }, "test-api-key")).rejects.toThrow(
        "No server response. Please check your internet connection."
      );
    });

    it("handles non-axios error", async () => {
      jest.spyOn(axios, "post").mockRejectedValue(new Error("Network error"));
      (axios.isAxiosError as jest.Mock).mockReturnValue(false);

      await expect(getPromotionalHistory({ page: 1 }, "test-api-key")).rejects.toThrow(
        "Server error while fetching promotional history."
      );
    });
  });

  describe("getBulkHistory", () => {
    it("makes API call", async () => {
      const mockData = { message: { data: [] } };
      jest.spyOn(axios, "post").mockResolvedValue({ data: mockData });

      const result = await getBulkHistory({ page: 1 }, "test-api-key");

      expect(axios.post).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("handles no response data", async () => {
      jest.spyOn(axios, "post").mockResolvedValue({ data: null });
      (axios.isAxiosError as jest.Mock).mockReturnValue(false);

      await expect(getBulkHistory({ page: 1 }, "test-api-key")).rejects.toThrow(
        "Server error while fetching bulk history."
      );
    });

    it("handles error", async () => {
      const error = {
        isAxiosError: true,
        response: { data: { message: "Error" } },
      };
      jest.spyOn(axios, "post").mockRejectedValue(error);
      (axios.isAxiosError as jest.Mock).mockReturnValue(true);

      await expect(getBulkHistory({ page: 1 }, "test-api-key")).rejects.toThrow("Error");
    });

    it("handles request error", async () => {
      const error = {
        isAxiosError: true,
        request: {},
      };
      jest.spyOn(axios, "post").mockRejectedValue(error);
      (axios.isAxiosError as jest.Mock).mockReturnValue(true);

      await expect(getBulkHistory({ page: 1 }, "test-api-key")).rejects.toThrow(
        "No server response. Please check your internet connection."
      );
    });

    it("handles non-axios error", async () => {
      jest.spyOn(axios, "post").mockRejectedValue(new Error("Network error"));
      (axios.isAxiosError as jest.Mock).mockReturnValue(false);

      await expect(getBulkHistory({ page: 1 }, "test-api-key")).rejects.toThrow(
        "Server error while fetching bulk history."
      );
    });
  });

  describe("getBulkGroupHistory", () => {
    it("makes API call", async () => {
      const mockData = { message: { data: [] } };
      jest.spyOn(axios, "post").mockResolvedValue({ data: mockData });

      const result = await getBulkGroupHistory({ page: 1 }, "test-api-key");

      expect(axios.post).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("handles no response data", async () => {
      jest.spyOn(axios, "post").mockResolvedValue({ data: null });
      (axios.isAxiosError as jest.Mock).mockReturnValue(false);

      await expect(getBulkGroupHistory({ page: 1 }, "test-api-key")).rejects.toThrow(
        "Server error while fetching bulk group history."
      );
    });

    it("handles error", async () => {
      const error = {
        isAxiosError: true,
        response: { data: { message: "Error" } },
      };
      jest.spyOn(axios, "post").mockRejectedValue(error);
      (axios.isAxiosError as jest.Mock).mockReturnValue(true);

      await expect(getBulkGroupHistory({ page: 1 }, "test-api-key")).rejects.toThrow("Error");
    });

    it("handles request error", async () => {
      const error = {
        isAxiosError: true,
        request: {},
      };
      jest.spyOn(axios, "post").mockRejectedValue(error);
      (axios.isAxiosError as jest.Mock).mockReturnValue(true);

      await expect(getBulkGroupHistory({ page: 1 }, "test-api-key")).rejects.toThrow(
        "No server response. Please check your internet connection."
      );
    });

    it("handles non-axios error", async () => {
      jest.spyOn(axios, "post").mockRejectedValue(new Error("Network error"));
      (axios.isAxiosError as jest.Mock).mockReturnValue(false);

      await expect(getBulkGroupHistory({ page: 1 }, "test-api-key")).rejects.toThrow(
        "Server error while fetching bulk group history."
      );
    });
  });

  describe("getBulkMsisdnListHistory", () => {
    it("makes API call", async () => {
      const mockData = { message: { data: [] } };
      jest.spyOn(axios, "post").mockResolvedValue({ data: mockData });

      const result = await getBulkMsisdnListHistory({ page: 1 }, "test-api-key");

      expect(axios.post).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("handles no response data", async () => {
      jest.spyOn(axios, "post").mockResolvedValue({ data: null });
      (axios.isAxiosError as jest.Mock).mockReturnValue(false);

      await expect(getBulkMsisdnListHistory({ page: 1 }, "test-api-key")).rejects.toThrow(
        "Server error while fetching bulk MSISDN list history."
      );
    });

    it("handles error", async () => {
      const error = {
        isAxiosError: true,
        response: { data: { message: "Error" } },
      };
      jest.spyOn(axios, "post").mockRejectedValue(error);
      (axios.isAxiosError as jest.Mock).mockReturnValue(true);

      await expect(getBulkMsisdnListHistory({ page: 1 }, "test-api-key")).rejects.toThrow("Error");
    });

    it("handles request error", async () => {
      const error = {
        isAxiosError: true,
        request: {},
      };
      jest.spyOn(axios, "post").mockRejectedValue(error);
      (axios.isAxiosError as jest.Mock).mockReturnValue(true);

      await expect(getBulkMsisdnListHistory({ page: 1 }, "test-api-key")).rejects.toThrow(
        "No server response. Please check your internet connection."
      );
    });

    it("handles non-axios error", async () => {
      jest.spyOn(axios, "post").mockRejectedValue(new Error("Network error"));
      (axios.isAxiosError as jest.Mock).mockReturnValue(false);

      await expect(getBulkMsisdnListHistory({ page: 1 }, "test-api-key")).rejects.toThrow(
        "Server error while fetching bulk MSISDN list history."
      );
    });
  });

  describe("getScheduledHistory", () => {
    it("makes API call", async () => {
      const mockData = { message: { data: [] } };
      jest.spyOn(axios, "post").mockResolvedValue({ data: mockData });

      const result = await getScheduledHistory({ page: 1 }, "test-api-key");

      expect(axios.post).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("handles no response data", async () => {
      jest.spyOn(axios, "post").mockResolvedValue({ data: null });
      (axios.isAxiosError as jest.Mock).mockReturnValue(false);

      await expect(getScheduledHistory({ page: 1 }, "test-api-key")).rejects.toThrow(
        "Server error while fetching scheduled history."
      );
    });

    it("handles error", async () => {
      const error = {
        isAxiosError: true,
        response: { data: { message: "Error" } },
      };
      jest.spyOn(axios, "post").mockRejectedValue(error);
      (axios.isAxiosError as jest.Mock).mockReturnValue(true);

      await expect(getScheduledHistory({ page: 1 }, "test-api-key")).rejects.toThrow("Error");
    });

    it("handles request error", async () => {
      const error = {
        isAxiosError: true,
        request: {},
      };
      jest.spyOn(axios, "post").mockRejectedValue(error);
      (axios.isAxiosError as jest.Mock).mockReturnValue(true);

      await expect(getScheduledHistory({ page: 1 }, "test-api-key")).rejects.toThrow(
        "No server response. Please check your internet connection."
      );
    });

    it("handles non-axios error", async () => {
      jest.spyOn(axios, "post").mockRejectedValue(new Error("Network error"));
      (axios.isAxiosError as jest.Mock).mockReturnValue(false);

      await expect(getScheduledHistory({ page: 1 }, "test-api-key")).rejects.toThrow(
        "Server error while fetching scheduled history."
      );
    });
  });

  describe("getRecurringHistory", () => {
    it("makes API call", async () => {
      const mockData = { message: { data: [] } };
      jest.spyOn(axios, "post").mockResolvedValue({ data: mockData });

      const result = await getRecurringHistory({ page: 1 }, "test-api-key");

      expect(axios.post).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("handles no response data", async () => {
      jest.spyOn(axios, "post").mockResolvedValue({ data: null });
      (axios.isAxiosError as jest.Mock).mockReturnValue(false);

      await expect(getRecurringHistory({ page: 1 }, "test-api-key")).rejects.toThrow(
        "Server error while fetching recurring history."
      );
    });

    it("handles error", async () => {
      const error = {
        isAxiosError: true,
        response: { data: { message: "Error" } },
      };
      jest.spyOn(axios, "post").mockRejectedValue(error);
      (axios.isAxiosError as jest.Mock).mockReturnValue(true);

      await expect(getRecurringHistory({ page: 1 }, "test-api-key")).rejects.toThrow("Error");
    });

    it("handles request error", async () => {
      const error = {
        isAxiosError: true,
        request: {},
      };
      jest.spyOn(axios, "post").mockRejectedValue(error);
      (axios.isAxiosError as jest.Mock).mockReturnValue(true);

      await expect(getRecurringHistory({ page: 1 }, "test-api-key")).rejects.toThrow(
        "No server response. Please check your internet connection."
      );
    });

    it("handles non-axios error", async () => {
      jest.spyOn(axios, "post").mockRejectedValue(new Error("Network error"));
      (axios.isAxiosError as jest.Mock).mockReturnValue(false);

      await expect(getRecurringHistory({ page: 1 }, "test-api-key")).rejects.toThrow(
        "Server error while fetching recurring history."
      );
    });
  });
});
