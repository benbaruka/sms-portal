import axios from "axios";
import { smsApiRequest } from "@/controller/api/config/smsApiConfig";
import { notifications } from "@/controller/api/constant/apiLink";
import {
  NotificationsListRequest,
  NotificationsListResponse,
  MarkNotificationReadRequest,
  NotificationPreferencesRequest,
  AdminSimpleResponse,
} from "@/types";

const handleAxiosError = (
  error: unknown,
  fallbackMessage: string,
  silent404 = false
): undefined => {
  if (axios.isAxiosError(error)) {
    // Gérer silencieusement les erreurs 404 (endpoints non implémentés)
    if (error.response?.status === 404 && silent404) {
      // Ne pas logger en production, seulement en développement avec un message discret
      return undefined; // Retourner undefined au lieu de throw
    }
    // Pour les autres erreurs, on throw (mais TypeScript ne le sait pas)
    if (error.response) {
      throw new Error(error.response.data?.message || fallbackMessage);
    }
    if (error.request) {
      throw new Error("No server response. Please check your internet connection.");
    }
  }
  throw new Error(fallbackMessage);
};

export const getNotificationsList = async (
  data: NotificationsListRequest,
  apiKey: string
): Promise<NotificationsListResponse | undefined> => {
  try {
    const response = await smsApiRequest<NotificationsListRequest, NotificationsListResponse>({
      method: "POST",
      endpoint: notifications.list,
      data,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for notifications list.");
    }
    return response.data;
  } catch (error) {
    // Gérer silencieusement les 404 (endpoints non implémentés dans le backend)
    // L'endpoint /notifications/list n'existe pas encore dans le backend
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return undefined; // Retourner undefined au lieu de throw pour éviter les erreurs dans la console
    }
    // Pour les autres erreurs, on throw (mais TypeScript ne le sait pas)
    const result = handleAxiosError(error, "No server response for notifications list.", true);
    return result;
  }
};

export const markNotificationAsRead = async (
  data: MarkNotificationReadRequest,
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    const response = await smsApiRequest<MarkNotificationReadRequest, AdminSimpleResponse>({
      method: "POST",
      endpoint: notifications.markAsRead,
      data,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for mark notification as read.");
    }
    return response.data;
  } catch (error) {
    // Gérer silencieusement les 404 (endpoints non implémentés dans le backend)
    const result = handleAxiosError(
      error,
      "No server response for mark notification as read.",
      true
    );
    return result;
  }
};

export const markAllNotificationsAsRead = async (
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    const response = await smsApiRequest<Record<string, never>, AdminSimpleResponse>({
      method: "POST",
      endpoint: notifications.markAllAsRead,
      data: {},
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for mark all notifications as read.");
    }
    return response.data;
  } catch (error) {
    // Gérer silencieusement les 404 (endpoints non implémentés dans le backend)
    const result = handleAxiosError(
      error,
      "No server response for mark all notifications as read.",
      true
    );
    return result;
  }
};

export const deleteNotification = async (
  notificationId: string | number,
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    const response = await smsApiRequest<{ notification_id: string | number }, AdminSimpleResponse>(
      {
        method: "POST",
        endpoint: notifications.delete,
        data: { notification_id: notificationId },
        apiKey,
      }
    );
    if (!response?.data) {
      throw new Error("No server response for delete notification.");
    }
    return response.data;
  } catch (error) {
    // Gérer silencieusement les 404 (endpoints non implémentés dans le backend)
    const result = handleAxiosError(error, "No server response for delete notification.", true);
    return result;
  }
};

export const deleteAllNotifications = async (
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    const response = await smsApiRequest<Record<string, never>, AdminSimpleResponse>({
      method: "POST",
      endpoint: notifications.deleteAll,
      data: {},
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for delete all notifications.");
    }
    return response.data;
  } catch (error) {
    // Gérer silencieusement les 404 (endpoints non implémentés dans le backend)
    const result = handleAxiosError(
      error,
      "No server response for delete all notifications.",
      true
    );
    return result;
  }
};

export const updateNotificationPreferences = async (
  data: NotificationPreferencesRequest,
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    const response = await smsApiRequest<NotificationPreferencesRequest, AdminSimpleResponse>({
      method: "POST",
      endpoint: notifications.preferences,
      data,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for update notification preferences.");
    }
    return response.data;
  } catch (error) {
    // Gérer silencieusement les 404 (endpoints non implémentés dans le backend)
    const result = handleAxiosError(
      error,
      "No server response for update notification preferences.",
      true
    );
    return result;
  }
};
