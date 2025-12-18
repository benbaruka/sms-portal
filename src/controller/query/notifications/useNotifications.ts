import {
  MarkNotificationReadRequest,
  NotificationPreferencesRequest,
  NotificationsListRequest,
  NotificationsListResponse,
} from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  deleteAllNotifications,
  deleteNotification,
  getNotificationsList,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  updateNotificationPreferences,
} from "./notifications.service";

export const useNotificationsList = (
  params: NotificationsListRequest = {},
  apiKey: string | null,
  enabled: boolean = true
) => {
  const query = useQuery({
    queryKey: ["notifications", "list", params, apiKey],
    queryFn: async () => {
      if (!apiKey) throw new Error("API key is required");
      try {
        const result = await getNotificationsList(params, apiKey);
        // Si l'endpoint retourne undefined (404 géré silencieusement), retourner une structure vide
        if (!result) {
          return {
            status: 200,
            notifications: [],
            message: { notifications: [], data: [] },
            data: { notifications: [], data: [] },
          } as NotificationsListResponse;
        }
        return result;
      } catch {
        // En cas d'erreur autre que 404, retourner une structure vide aussi
        return {
          status: 200,
          notifications: [],
          message: { notifications: [], data: [] },
          data: { notifications: [], data: [] },
        } as NotificationsListResponse;
      }
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
    retry: false, // Ne pas retry si l'endpoint n'existe pas
    // Ne pas afficher d'alerte si l'endpoint n'existe pas (404) - c'est silencieux
  });

  // Pas d'alerte d'erreur - les notifications peuvent ne pas être implémentées dans le backend
  return query;
};

export const useMarkNotificationAsRead = () => {
  return useMutation({
    mutationFn: async ({ data, apiKey }: { data: MarkNotificationReadRequest; apiKey: string }) => {
      if (!apiKey) throw new Error("API key is required");
      return markNotificationAsRead(data, apiKey);
    },
    // Pas d'alerte - opération silencieuse pour ne pas polluer l'interface si l'endpoint n'existe pas
    retry: false,
  });
};

export const useMarkAllNotificationsAsRead = () => {
  return useMutation({
    mutationFn: async ({ apiKey }: { apiKey: string }) => {
      if (!apiKey) throw new Error("API key is required");
      return markAllNotificationsAsRead(apiKey);
    },
    // Pas d'alerte - opération silencieuse
    retry: false,
  });
};

export const useDeleteNotification = () => {
  return useMutation({
    mutationFn: async ({
      notificationId,
      apiKey,
    }: {
      notificationId: string | number;
      apiKey: string;
    }) => {
      if (!apiKey) throw new Error("API key is required");
      return deleteNotification(notificationId, apiKey);
    },
    // Pas d'alerte - opération silencieuse
    retry: false,
  });
};

export const useDeleteAllNotifications = () => {
  return useMutation({
    mutationFn: async ({ apiKey }: { apiKey: string }) => {
      if (!apiKey) throw new Error("API key is required");
      return deleteAllNotifications(apiKey);
    },
    // Pas d'alerte - opération silencieuse
    retry: false,
  });
};

export const useUpdateNotificationPreferences = () => {
  return useMutation({
    mutationFn: async ({
      data,
      apiKey,
    }: {
      data: NotificationPreferencesRequest;
      apiKey: string;
    }) => {
      if (!apiKey) throw new Error("API key is required");
      return updateNotificationPreferences(data, apiKey);
    },
    // Pas d'alerte - opération silencieuse
    retry: false,
  });
};
