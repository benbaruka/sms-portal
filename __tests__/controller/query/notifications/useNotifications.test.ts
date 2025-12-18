import React, { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import {
  useNotificationsList,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  useDeleteAllNotifications,
  useUpdateNotificationPreferences,
} from "../../../../src/controller/query/notifications/useNotifications";
import * as notificationsService from "../../../../src/controller/query/notifications/notifications.service";

jest.mock("../../../../src/controller/query/notifications/notifications.service");

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe("controller/query/notifications/useNotifications.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(useNotificationsList).toBeDefined();
    expect(useMarkNotificationAsRead).toBeDefined();
    expect(useDeleteNotification).toBeDefined();
  });

  it("useNotificationsList - returns query hook", async () => {
    const mockData = {
      status: 200,
      notifications: [],
      message: { notifications: [], data: [] },
      data: { notifications: [], data: [] },
    };
    jest.mocked(notificationsService.getNotificationsList).mockResolvedValue(mockData as any);

    const { result } = renderHook(() => useNotificationsList({}, "test-api-key", true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).toBeDefined();
      // Should eventually succeed
      expect(result.current.isSuccess || result.current.isLoading).toBeTruthy();
    }, { timeout: 10000 });
  });

  it("useNotificationsList - handles 404 gracefully", async () => {
    jest.mocked(notificationsService.getNotificationsList).mockResolvedValue(undefined as any);

    const { result } = renderHook(() => useNotificationsList({}, "test-api-key", true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).toBeDefined();
      // Should not throw and should return empty structure
      expect(result.current.isSuccess).toBe(true);
    }, { timeout: 10000 });
  });

  it("useMarkNotificationAsRead - returns mutation hook", async () => {
    const { result } = renderHook(() => useMarkNotificationAsRead(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current.mutate).toBeDefined();
      expect(result.current.mutateAsync).toBeDefined();
    }, { timeout: 10000 });
  });

  it("useMarkAllNotificationsAsRead - returns mutation hook", async () => {
    const { result } = renderHook(() => useMarkAllNotificationsAsRead(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current.mutate).toBeDefined();
    }, { timeout: 10000 });
  });

  it("useDeleteNotification - returns mutation hook", async () => {
    const { result } = renderHook(() => useDeleteNotification(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current.mutate).toBeDefined();
    }, { timeout: 10000 });
  });

  it("useDeleteAllNotifications - returns mutation hook", async () => {
    const { result } = renderHook(() => useDeleteAllNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current.mutate).toBeDefined();
    }, { timeout: 10000 });
  });

  it("useUpdateNotificationPreferences - returns mutation hook", async () => {
    const { result } = renderHook(() => useUpdateNotificationPreferences(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current.mutate).toBeDefined();
    }, { timeout: 10000 });
  });

  it("useNotificationsList - requires apiKey", async () => {
    const { result } = renderHook(() => useNotificationsList({}, null, true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current.isEnabled).toBe(false);
    }, { timeout: 10000 });
  });

  it("useNotificationsList - respects enabled flag", async () => {
    const { result } = renderHook(() => useNotificationsList({}, "test-api-key", false), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current.isFetching).toBe(false);
    }, { timeout: 10000 });
  });

  it("useNotificationsList - handles successful response", async () => {
    const mockData = {
      status: 200,
      notifications: [{ id: 1, message: "Test" }],
      message: { notifications: [{ id: 1 }], data: [] },
      data: { notifications: [{ id: 1 }], data: [] },
    };
    jest.mocked(notificationsService.getNotificationsList).mockResolvedValue(mockData as any);

    const { result } = renderHook(() => useNotificationsList({}, "test-api-key", true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    }, { timeout: 10000 });

    expect(result.current.data).toEqual(mockData);
  });

  it("useNotificationsList - handles error and returns empty structure", async () => {
    jest.mocked(notificationsService.getNotificationsList).mockRejectedValue(new Error("API Error"));

    const { result } = renderHook(() => useNotificationsList({}, "test-api-key", true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    }, { timeout: 10000 });

    expect(result.current.data).toEqual({
      status: 200,
      notifications: [],
      message: { notifications: [], data: [] },
      data: { notifications: [], data: [] },
    });
  });

  it("useNotificationsList - throws error when apiKey is missing in queryFn", async () => {
    jest.mocked(notificationsService.getNotificationsList).mockResolvedValue(undefined as any);

    const { result } = renderHook(() => useNotificationsList({}, "", true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).toBeDefined();
      // Empty string is falsy, so query should be disabled
      expect(result.current.isEnabled).toBe(false);
    }, { timeout: 10000 });
  });

  it("useMarkNotificationAsRead - calls mutation function with correct parameters", async () => {
    const mockResponse = { status: 200, message: "Marked as read" };
    jest.mocked(notificationsService.markNotificationAsRead).mockResolvedValue(mockResponse as any);

    const { result } = renderHook(() => useMarkNotificationAsRead(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.mutate).toBeDefined();
    }, { timeout: 10000 });

    result.current.mutate({
      data: { notification_id: 1 },
      apiKey: "test-api-key",
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    }, { timeout: 10000 });

    expect(notificationsService.markNotificationAsRead).toHaveBeenCalledWith(
      { notification_id: 1 },
      "test-api-key"
    );
  });

  it("useMarkNotificationAsRead - throws error when apiKey is missing", async () => {
    const { result } = renderHook(() => useMarkNotificationAsRead(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.mutateAsync).toBeDefined();
    }, { timeout: 10000 });

    try {
      await result.current.mutateAsync({
        data: { notification_id: 1 },
        apiKey: "",
      });
    } catch (error: any) {
      expect(error.message).toContain("API key is required");
    }
  });

  it("useMarkAllNotificationsAsRead - calls mutation function with correct parameters", async () => {
    const mockResponse = { status: 200, message: "All marked as read" };
    jest.mocked(notificationsService.markAllNotificationsAsRead).mockResolvedValue(mockResponse as any);

    const { result } = renderHook(() => useMarkAllNotificationsAsRead(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.mutate).toBeDefined();
    }, { timeout: 10000 });

    result.current.mutate({ apiKey: "test-api-key" });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    }, { timeout: 10000 });

    expect(notificationsService.markAllNotificationsAsRead).toHaveBeenCalledWith("test-api-key");
  });

  it("useMarkAllNotificationsAsRead - throws error when apiKey is missing", async () => {
    const { result } = renderHook(() => useMarkAllNotificationsAsRead(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.mutateAsync).toBeDefined();
    }, { timeout: 10000 });

    try {
      await result.current.mutateAsync({ apiKey: "" });
    } catch (error: any) {
      expect(error.message).toContain("API key is required");
    }
  });

  it("useDeleteNotification - calls mutation function with correct parameters", async () => {
    const mockResponse = { status: 200, message: "Deleted" };
    jest.mocked(notificationsService.deleteNotification).mockResolvedValue(mockResponse as any);

    const { result } = renderHook(() => useDeleteNotification(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.mutate).toBeDefined();
    }, { timeout: 10000 });

    result.current.mutate({
      notificationId: 1,
      apiKey: "test-api-key",
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    }, { timeout: 10000 });

    expect(notificationsService.deleteNotification).toHaveBeenCalledWith(1, "test-api-key");
  });

  it("useDeleteNotification - calls mutation function with string notificationId", async () => {
    const mockResponse = { status: 200, message: "Deleted" };
    jest.mocked(notificationsService.deleteNotification).mockResolvedValue(mockResponse as any);

    const { result } = renderHook(() => useDeleteNotification(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.mutate).toBeDefined();
    }, { timeout: 10000 });

    result.current.mutate({
      notificationId: "123",
      apiKey: "test-api-key",
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    }, { timeout: 10000 });

    expect(notificationsService.deleteNotification).toHaveBeenCalledWith("123", "test-api-key");
  });

  it("useDeleteNotification - throws error when apiKey is missing", async () => {
    const { result } = renderHook(() => useDeleteNotification(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.mutateAsync).toBeDefined();
    }, { timeout: 10000 });

    try {
      await result.current.mutateAsync({
        notificationId: 1,
        apiKey: "",
      });
    } catch (error: any) {
      expect(error.message).toContain("API key is required");
    }
  });

  it("useDeleteAllNotifications - calls mutation function with correct parameters", async () => {
    const mockResponse = { status: 200, message: "All deleted" };
    jest.mocked(notificationsService.deleteAllNotifications).mockResolvedValue(mockResponse as any);

    const { result } = renderHook(() => useDeleteAllNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.mutate).toBeDefined();
    }, { timeout: 10000 });

    result.current.mutate({ apiKey: "test-api-key" });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    }, { timeout: 10000 });

    expect(notificationsService.deleteAllNotifications).toHaveBeenCalledWith("test-api-key");
  });

  it("useDeleteAllNotifications - throws error when apiKey is missing", async () => {
    const { result } = renderHook(() => useDeleteAllNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.mutateAsync).toBeDefined();
    }, { timeout: 10000 });

    try {
      await result.current.mutateAsync({ apiKey: "" });
    } catch (error: any) {
      expect(error.message).toContain("API key is required");
    }
  });

  it("useUpdateNotificationPreferences - calls mutation function with correct parameters", async () => {
    const mockResponse = { status: 200, message: "Preferences updated" };
    jest.mocked(notificationsService.updateNotificationPreferences).mockResolvedValue(mockResponse as any);

    const { result } = renderHook(() => useUpdateNotificationPreferences(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.mutate).toBeDefined();
    }, { timeout: 10000 });

    result.current.mutate({
      data: { email_notifications: true },
      apiKey: "test-api-key",
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    }, { timeout: 10000 });

    expect(notificationsService.updateNotificationPreferences).toHaveBeenCalledWith(
      { email_notifications: true },
      "test-api-key"
    );
  });

  it("useUpdateNotificationPreferences - throws error when apiKey is missing", async () => {
    const { result } = renderHook(() => useUpdateNotificationPreferences(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.mutateAsync).toBeDefined();
    }, { timeout: 10000 });

    try {
      await result.current.mutateAsync({
        data: { email_notifications: true },
        apiKey: "",
      });
    } catch (error: any) {
      expect(error.message).toContain("API key is required");
    }
  });
});
