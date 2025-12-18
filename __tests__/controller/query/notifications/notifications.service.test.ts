
import {
  getNotificationsList,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  updateNotificationPreferences,
} from "../../../../src/controller/query/notifications/notifications.service";
import axios from "axios";

jest.mock("@/controller/api/config/smsApiConfig", () => ({
  smsApiRequest: jest.fn(),
}));

jest.mock("axios");
jest.mock("@/controller/api/constant/apiLink", () => ({
  notifications: {
    list: "/notifications/list",
    markAsRead: "/notifications/mark-read",
    markAllAsRead: "/notifications/mark-all-read",
    delete: "/notifications/delete",
    deleteAll: "/notifications/delete-all",
    preferences: "/notifications/preferences",
  },
}));

describe("controller/query/notifications/notifications.service.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(axios, "isAxiosError").mockImplementation((error) => {
      return error && typeof error === "object" && "isAxiosError" in error && error.isAxiosError === true;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("module loads", () => {
    expect(getNotificationsList).toBeDefined();
    expect(markNotificationAsRead).toBeDefined();
    expect(markAllNotificationsAsRead).toBeDefined();
    expect(deleteNotification).toBeDefined();
    expect(deleteAllNotifications).toBeDefined();
    expect(updateNotificationPreferences).toBeDefined();
  });

  describe("getNotificationsList", () => {
    it("returns data on successful response", async () => {
      const { smsApiRequest } = await import("@/controller/api/config/smsApiConfig");
      const mockData = {
        status: 200,
        notifications: [],
        message: { notifications: [], data: [] },
        data: { notifications: [], data: [] },
      };
      (smsApiRequest as any).mockResolvedValue({ data: mockData });

      const result = await getNotificationsList({}, "test-api-key");
      expect(result).toEqual(mockData);
      expect(smsApiRequest).toHaveBeenCalledWith({
        method: "POST",
        endpoint: "/notifications/list",
        data: {},
        apiKey: "test-api-key",
      });
    });

    it("throws error when response has no data", async () => {
      const { smsApiRequest } = await import("@/controller/api/config/smsApiConfig");
      (smsApiRequest as any).mockResolvedValue({ data: null });

      await expect(getNotificationsList({}, "test-api-key")).rejects.toThrow(
        "No server response for notifications list."
      );
    });

    it("handles 404 silently", async () => {
      const { smsApiRequest } = await import("@/controller/api/config/smsApiConfig");
      const axiosError = {
        isAxiosError: true,
        response: { status: 404 },
      };
      (smsApiRequest as any).mockRejectedValue(axiosError);

      const result = await getNotificationsList({}, "test-api-key");
      expect(result).toBeUndefined();
    });

    it("handles 404 in catch block", async () => {
      const { smsApiRequest } = await import("@/controller/api/config/smsApiConfig");
      const axiosError = {
        isAxiosError: true,
        response: { status: 404 },
      };
      (smsApiRequest as any).mockRejectedValue(axiosError);

      const result = await getNotificationsList({}, "test-api-key");
      expect(result).toBeUndefined();
    });

    it("handles axios error with response data message", async () => {
      const { smsApiRequest } = await import("@/controller/api/config/smsApiConfig");
      const axiosError = {
        isAxiosError: true,
        response: { status: 500, data: { message: "Server error" } },
      };
      (smsApiRequest as any).mockRejectedValue(axiosError);

      await expect(getNotificationsList({}, "test-api-key")).rejects.toThrow("Server error");
    });

    it("handles axios error with request but no response", async () => {
      const { smsApiRequest } = await import("@/controller/api/config/smsApiConfig");
      const axiosError = {
        isAxiosError: true,
        request: {},
      };
      (smsApiRequest as any).mockRejectedValue(axiosError);

      await expect(getNotificationsList({}, "test-api-key")).rejects.toThrow(
        "No server response. Please check your internet connection."
      );
    });

    it("handles non-axios error", async () => {
      const { smsApiRequest } = await import("@/controller/api/config/smsApiConfig");
      (smsApiRequest as any).mockRejectedValue(new Error("Unknown error"));

      await expect(getNotificationsList({}, "test-api-key")).rejects.toThrow(
        "No server response for notifications list."
      );
    });
  });

  describe("markNotificationAsRead", () => {
    it("returns data on successful response", async () => {
      const { smsApiRequest } = await import("@/controller/api/config/smsApiConfig");
      const mockData = { status: 200, message: "Marked as read" };
      (smsApiRequest as any).mockResolvedValue({ data: mockData });

      const result = await markNotificationAsRead({ notification_id: 1 }, "test-api-key");
      expect(result).toEqual(mockData);
      expect(smsApiRequest).toHaveBeenCalledWith({
        method: "POST",
        endpoint: "/notifications/mark-read",
        data: { notification_id: 1 },
        apiKey: "test-api-key",
      });
    });

    it("throws error when response has no data", async () => {
      const { smsApiRequest } = await import("@/controller/api/config/smsApiConfig");
      (smsApiRequest as any).mockResolvedValue({ data: null });

      await expect(markNotificationAsRead({ notification_id: 1 }, "test-api-key")).rejects.toThrow(
        "No server response for mark notification as read."
      );
    });

    it("handles 404 silently", async () => {
      const { smsApiRequest } = await import("@/controller/api/config/smsApiConfig");
      const axiosError = {
        isAxiosError: true,
        response: { status: 404 },
      };
      (smsApiRequest as any).mockRejectedValue(axiosError);

      const result = await markNotificationAsRead({ notification_id: 1 }, "test-api-key");
      expect(result).toBeUndefined();
    });

    it("handles axios error with response data message", async () => {
      const { smsApiRequest } = await import("@/controller/api/config/smsApiConfig");
      const axiosError = {
        isAxiosError: true,
        response: { status: 500, data: { message: "Server error" } },
      };
      (smsApiRequest as any).mockRejectedValue(axiosError);

      await expect(markNotificationAsRead({ notification_id: 1 }, "test-api-key")).rejects.toThrow(
        "Server error"
      );
    });
  });

  describe("markAllNotificationsAsRead", () => {
    it("returns data on successful response", async () => {
      const { smsApiRequest } = await import("@/controller/api/config/smsApiConfig");
      const mockData = { status: 200, message: "All marked as read" };
      (smsApiRequest as any).mockResolvedValue({ data: mockData });

      const result = await markAllNotificationsAsRead("test-api-key");
      expect(result).toEqual(mockData);
      expect(smsApiRequest).toHaveBeenCalledWith({
        method: "POST",
        endpoint: "/notifications/mark-all-read",
        data: {},
        apiKey: "test-api-key",
      });
    });

    it("throws error when response has no data", async () => {
      const { smsApiRequest } = await import("@/controller/api/config/smsApiConfig");
      (smsApiRequest as any).mockResolvedValue({ data: null });

      await expect(markAllNotificationsAsRead("test-api-key")).rejects.toThrow(
        "No server response for mark all notifications as read."
      );
    });

    it("handles 404 silently", async () => {
      const { smsApiRequest } = await import("@/controller/api/config/smsApiConfig");
      const axiosError = {
        isAxiosError: true,
        response: { status: 404 },
      };
      (smsApiRequest as any).mockRejectedValue(axiosError);

      const result = await markAllNotificationsAsRead("test-api-key");
      expect(result).toBeUndefined();
    });

    it("handles axios error with response data message", async () => {
      const { smsApiRequest } = await import("@/controller/api/config/smsApiConfig");
      const axiosError = {
        isAxiosError: true,
        response: { status: 500, data: { message: "Server error" } },
      };
      (smsApiRequest as any).mockRejectedValue(axiosError);

      await expect(markAllNotificationsAsRead("test-api-key")).rejects.toThrow("Server error");
    });
  });

  describe("deleteNotification", () => {
    it("returns data on successful response with number id", async () => {
      const { smsApiRequest } = await import("@/controller/api/config/smsApiConfig");
      const mockData = { status: 200, message: "Deleted" };
      (smsApiRequest as any).mockResolvedValue({ data: mockData });

      const result = await deleteNotification(1, "test-api-key");
      expect(result).toEqual(mockData);
      expect(smsApiRequest).toHaveBeenCalledWith({
        method: "POST",
        endpoint: "/notifications/delete",
        data: { notification_id: 1 },
        apiKey: "test-api-key",
      });
    });

    it("returns data on successful response with string id", async () => {
      const { smsApiRequest } = await import("@/controller/api/config/smsApiConfig");
      const mockData = { status: 200, message: "Deleted" };
      (smsApiRequest as any).mockResolvedValue({ data: mockData });

      const result = await deleteNotification("123", "test-api-key");
      expect(result).toEqual(mockData);
      expect(smsApiRequest).toHaveBeenCalledWith({
        method: "POST",
        endpoint: "/notifications/delete",
        data: { notification_id: "123" },
        apiKey: "test-api-key",
      });
    });

    it("throws error when response has no data", async () => {
      const { smsApiRequest } = await import("@/controller/api/config/smsApiConfig");
      (smsApiRequest as any).mockResolvedValue({ data: null });

      await expect(deleteNotification(1, "test-api-key")).rejects.toThrow(
        "No server response for delete notification."
      );
    });

    it("handles 404 silently", async () => {
      const { smsApiRequest } = await import("@/controller/api/config/smsApiConfig");
      const axiosError = {
        isAxiosError: true,
        response: { status: 404 },
      };
      (smsApiRequest as any).mockRejectedValue(axiosError);

      const result = await deleteNotification(1, "test-api-key");
      expect(result).toBeUndefined();
    });

    it("handles axios error with response data message", async () => {
      const { smsApiRequest } = await import("@/controller/api/config/smsApiConfig");
      const axiosError = {
        isAxiosError: true,
        response: { status: 500, data: { message: "Server error" } },
      };
      (smsApiRequest as any).mockRejectedValue(axiosError);

      await expect(deleteNotification(1, "test-api-key")).rejects.toThrow("Server error");
    });
  });

  describe("deleteAllNotifications", () => {
    it("returns data on successful response", async () => {
      const { smsApiRequest } = await import("@/controller/api/config/smsApiConfig");
      const mockData = { status: 200, message: "All deleted" };
      (smsApiRequest as any).mockResolvedValue({ data: mockData });

      const result = await deleteAllNotifications("test-api-key");
      expect(result).toEqual(mockData);
      expect(smsApiRequest).toHaveBeenCalledWith({
        method: "POST",
        endpoint: "/notifications/delete-all",
        data: {},
        apiKey: "test-api-key",
      });
    });

    it("throws error when response has no data", async () => {
      const { smsApiRequest } = await import("@/controller/api/config/smsApiConfig");
      (smsApiRequest as any).mockResolvedValue({ data: null });

      await expect(deleteAllNotifications("test-api-key")).rejects.toThrow(
        "No server response for delete all notifications."
      );
    });

    it("handles 404 silently", async () => {
      const { smsApiRequest } = await import("@/controller/api/config/smsApiConfig");
      const axiosError = {
        isAxiosError: true,
        response: { status: 404 },
      };
      (smsApiRequest as any).mockRejectedValue(axiosError);

      const result = await deleteAllNotifications("test-api-key");
      expect(result).toBeUndefined();
    });

    it("handles axios error with response data message", async () => {
      const { smsApiRequest } = await import("@/controller/api/config/smsApiConfig");
      const axiosError = {
        isAxiosError: true,
        response: { status: 500, data: { message: "Server error" } },
      };
      (smsApiRequest as any).mockRejectedValue(axiosError);

      await expect(deleteAllNotifications("test-api-key")).rejects.toThrow("Server error");
    });
  });

  describe("updateNotificationPreferences", () => {
    it("returns data on successful response", async () => {
      const { smsApiRequest } = await import("@/controller/api/config/smsApiConfig");
      const mockData = { status: 200, message: "Preferences updated" };
      (smsApiRequest as any).mockResolvedValue({ data: mockData });

      const result = await updateNotificationPreferences(
        { email_notifications: true },
        "test-api-key"
      );
      expect(result).toEqual(mockData);
      expect(smsApiRequest).toHaveBeenCalledWith({
        method: "POST",
        endpoint: "/notifications/preferences",
        data: { email_notifications: true },
        apiKey: "test-api-key",
      });
    });

    it("throws error when response has no data", async () => {
      const { smsApiRequest } = await import("@/controller/api/config/smsApiConfig");
      (smsApiRequest as any).mockResolvedValue({ data: null });

      await expect(
        updateNotificationPreferences({ email_notifications: true }, "test-api-key")
      ).rejects.toThrow("No server response for update notification preferences.");
    });

    it("handles 404 silently", async () => {
      const { smsApiRequest } = await import("@/controller/api/config/smsApiConfig");
      const axiosError = {
        isAxiosError: true,
        response: { status: 404 },
      };
      (smsApiRequest as any).mockRejectedValue(axiosError);

      const result = await updateNotificationPreferences(
        { email_notifications: true },
        "test-api-key"
      );
      expect(result).toBeUndefined();
    });

    it("handles axios error with response data message", async () => {
      const { smsApiRequest } = await import("@/controller/api/config/smsApiConfig");
      const axiosError = {
        isAxiosError: true,
        response: { status: 500, data: { message: "Server error" } },
      };
      (smsApiRequest as any).mockRejectedValue(axiosError);

      await expect(
        updateNotificationPreferences({ email_notifications: true }, "test-api-key")
      ).rejects.toThrow("Server error");
    });
  });
});
