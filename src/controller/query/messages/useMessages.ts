import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAlert } from "@/context/AlertProvider";
import { useAuth } from "@/context/AuthProvider";
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
} from "./messages.service";
import { getDashboardSummary } from "../dashboard/dashboard.service";
import {
  SendTransactionalSMSRequest,
  SendPromotionalSMSRequest,
  SendBulkMsisdnSMSRequest,
  SendContactGroupSMSRequest,
  SendUploadFileSMSRequest,
  MessageHistoryRequest,
} from "@/types";
export const useSendTransactionalSMS = () => {
  const { showAlert } = useAlert();
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: { data: SendTransactionalSMSRequest; apiKey: string }) => {
      if (!apiKey) throw new Error("API key is required");
      return sendTransactionalSMS(data, apiKey);
    },
    retry: false, // Prevent automatic retries that could cause double requests
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["transactional-history"] });
      // Invalidate dashboard summary to update balance after message sent
      queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
      // Refetch dashboard summary to ensure it updates immediately
      await queryClient.refetchQueries({ queryKey: ["dashboard", "summary"] });
      // Invalidate billing stats for super admin (system_balance) - invalidate all variations
      queryClient.invalidateQueries({ queryKey: ["dashboard", "billing-stats"] });
      // Refetch billing stats to ensure it updates immediately
      await queryClient.refetchQueries({ queryKey: ["dashboard", "billing-stats"] });

      // Update user context with new balance from dashboard summary
      try {
        const updatedSummary = await getDashboardSummary({}, apiKey);
        if (updatedSummary?.message && user) {
          const newBalance = updatedSummary.message.balance;
          const newBonus = updatedSummary.message.bonus;
          if (newBalance !== undefined || newBonus !== undefined) {
            const updatedUser = {
              ...user,
              message: {
                ...user.message,
                client_billing: {
                  ...user.message?.client_billing,
                  balance:
                    newBalance !== undefined ? newBalance : user.message?.client_billing?.balance,
                  bonus: newBonus !== undefined ? newBonus : user.message?.client_billing?.bonus,
                },
              },
            };
            setUser(updatedUser);
            localStorage.setItem("user-session", JSON.stringify(updatedUser));
          }
        }
      } catch (error) {
        // Silently fail - balance will update via query invalidation
      }

      showAlert({
        variant: "success",
        title: "Success",
        message: data?.message || "Transactional SMS sent successfully!",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to send transactional SMS.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};
export const useSendPromotionalSMS = () => {
  const { showAlert } = useAlert();
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: { data: SendPromotionalSMSRequest; apiKey: string }) => {
      if (!apiKey) throw new Error("API key is required");
      return sendPromotionalSMS(data, apiKey);
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["promotional-history"] });
      queryClient.invalidateQueries({ queryKey: ["scheduled-history"] });
      queryClient.invalidateQueries({ queryKey: ["recurring-history"] });
      // Invalidate dashboard summary to update balance after message sent
      queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
      // Refetch dashboard summary to ensure it updates immediately
      await queryClient.refetchQueries({ queryKey: ["dashboard", "summary"] });
      // Invalidate billing stats for super admin (system_balance) - invalidate all variations
      queryClient.invalidateQueries({ queryKey: ["dashboard", "billing-stats"] });
      // Refetch billing stats to ensure it updates immediately
      await queryClient.refetchQueries({ queryKey: ["dashboard", "billing-stats"] });

      // Update user context with new balance from dashboard summary
      try {
        const updatedSummary = await getDashboardSummary({}, apiKey);
        if (updatedSummary?.message && user) {
          const newBalance = updatedSummary.message.balance;
          const newBonus = updatedSummary.message.bonus;
          if (newBalance !== undefined || newBonus !== undefined) {
            const updatedUser = {
              ...user,
              message: {
                ...user.message,
                client_billing: {
                  ...user.message?.client_billing,
                  balance:
                    newBalance !== undefined ? newBalance : user.message?.client_billing?.balance,
                  bonus: newBonus !== undefined ? newBonus : user.message?.client_billing?.bonus,
                },
              },
            };
            setUser(updatedUser);
            localStorage.setItem("user-session", JSON.stringify(updatedUser));
          }
        }
      } catch (error) {
        // Silently fail - balance will update via query invalidation
      }

      showAlert({
        variant: "success",
        title: "Success",
        message: data?.message || "Promotional SMS sent successfully!",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to send promotional SMS.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};
export const useSendBulkMsisdnSMS = () => {
  const { showAlert } = useAlert();
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: { data: SendBulkMsisdnSMSRequest; apiKey: string }) => {
      if (!apiKey) throw new Error("API key is required");
      return sendBulkMsisdnSMS(data, apiKey);
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["bulk-history"] });
      queryClient.invalidateQueries({ queryKey: ["bulk-msisdn-list-history"] });
      // Invalidate dashboard summary to update balance after message sent
      queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
      // Refetch dashboard summary to ensure it updates immediately
      await queryClient.refetchQueries({ queryKey: ["dashboard", "summary"] });
      // Invalidate billing stats for super admin (system_balance) - invalidate all variations
      queryClient.invalidateQueries({ queryKey: ["dashboard", "billing-stats"] });
      // Refetch billing stats to ensure it updates immediately
      await queryClient.refetchQueries({ queryKey: ["dashboard", "billing-stats"] });

      // Update user context with new balance from dashboard summary
      try {
        const updatedSummary = await getDashboardSummary({}, apiKey);
        if (updatedSummary?.message && user) {
          const newBalance = updatedSummary.message.balance;
          const newBonus = updatedSummary.message.bonus;
          if (newBalance !== undefined || newBonus !== undefined) {
            const updatedUser = {
              ...user,
              message: {
                ...user.message,
                client_billing: {
                  ...user.message?.client_billing,
                  balance:
                    newBalance !== undefined ? newBalance : user.message?.client_billing?.balance,
                  bonus: newBonus !== undefined ? newBonus : user.message?.client_billing?.bonus,
                },
              },
            };
            setUser(updatedUser);
            localStorage.setItem("user-session", JSON.stringify(updatedUser));
          }
        }
      } catch (error) {
        // Silently fail - balance will update via query invalidation
      }

      showAlert({
        variant: "success",
        title: "Success",
        message: data?.message || "Bulk SMS sent successfully!",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to send bulk SMS.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};
export const useSendContactGroupSMS = () => {
  const { showAlert } = useAlert();
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: { data: SendContactGroupSMSRequest; apiKey: string }) => {
      if (!apiKey) throw new Error("API key is required");
      return sendContactGroupSMS(data, apiKey);
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["bulk-group-history"] });
      queryClient.invalidateQueries({ queryKey: ["contact-groups-simple"] });
      queryClient.invalidateQueries({ queryKey: ["contact-groups-list"] });
      // Invalidate dashboard summary to update balance after message sent
      queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
      // Refetch dashboard summary to ensure it updates immediately
      await queryClient.refetchQueries({ queryKey: ["dashboard", "summary"] });
      // Invalidate billing stats for super admin (system_balance) - invalidate all variations
      queryClient.invalidateQueries({ queryKey: ["dashboard", "billing-stats"] });
      // Refetch billing stats to ensure it updates immediately
      await queryClient.refetchQueries({ queryKey: ["dashboard", "billing-stats"] });

      // Update user context with new balance from dashboard summary
      try {
        const updatedSummary = await getDashboardSummary({}, apiKey);
        if (updatedSummary?.message && user) {
          const newBalance = updatedSummary.message.balance;
          const newBonus = updatedSummary.message.bonus;
          if (newBalance !== undefined || newBonus !== undefined) {
            const updatedUser = {
              ...user,
              message: {
                ...user.message,
                client_billing: {
                  ...user.message?.client_billing,
                  balance:
                    newBalance !== undefined ? newBalance : user.message?.client_billing?.balance,
                  bonus: newBonus !== undefined ? newBonus : user.message?.client_billing?.bonus,
                },
              },
            };
            setUser(updatedUser);
            localStorage.setItem("user-session", JSON.stringify(updatedUser));
          }
        }
      } catch (error) {
        // Silently fail - balance will update via query invalidation
      }

      showAlert({
        variant: "success",
        title: "Success",
        message: data?.message || "SMS sent to contact group successfully!",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to send SMS to contact group.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};
export const useSendUploadFileSMS = () => {
  const { showAlert } = useAlert();
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: { data: SendUploadFileSMSRequest; apiKey: string }) => {
      if (!apiKey) throw new Error("API key is required");
      return sendUploadFileSMS(data, apiKey);
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["bulk-history"] });
      // Invalidate dashboard summary to update balance after message sent
      queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
      // Refetch dashboard summary to ensure it updates immediately
      await queryClient.refetchQueries({ queryKey: ["dashboard", "summary"] });
      // Invalidate billing stats for super admin (system_balance) - invalidate all variations
      queryClient.invalidateQueries({ queryKey: ["dashboard", "billing-stats"] });
      // Refetch billing stats to ensure it updates immediately
      await queryClient.refetchQueries({ queryKey: ["dashboard", "billing-stats"] });

      // Update user context with new balance from dashboard summary
      try {
        const updatedSummary = await getDashboardSummary({}, apiKey);
        if (updatedSummary?.message && user) {
          const newBalance = updatedSummary.message.balance;
          const newBonus = updatedSummary.message.bonus;
          if (newBalance !== undefined || newBonus !== undefined) {
            const updatedUser = {
              ...user,
              message: {
                ...user.message,
                client_billing: {
                  ...user.message?.client_billing,
                  balance:
                    newBalance !== undefined ? newBalance : user.message?.client_billing?.balance,
                  bonus: newBonus !== undefined ? newBonus : user.message?.client_billing?.bonus,
                },
              },
            };
            setUser(updatedUser);
            localStorage.setItem("user-session", JSON.stringify(updatedUser));
          }
        }
      } catch (error) {
        // Silently fail - balance will update via query invalidation
      }

      showAlert({
        variant: "success",
        title: "Success",
        message: data?.message || "SMS sent via file upload successfully!",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to send SMS via file upload.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};
export const useTransactionalHistory = (
  data: MessageHistoryRequest,
  apiKey: string | null,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["transactional-history", data, apiKey],
    queryFn: async () => {
      if (!apiKey) throw new Error("API key is required");
      return getTransactionalHistory(data, apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });
};
export const usePromotionalHistory = (
  data: MessageHistoryRequest,
  apiKey: string | null,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["promotional-history", data, apiKey],
    queryFn: async () => {
      if (!apiKey) throw new Error("API key is required");
      return getPromotionalHistory(data, apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });
};
export const useBulkHistory = (
  data: MessageHistoryRequest,
  apiKey: string | null,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["bulk-history", data, apiKey],
    queryFn: async () => {
      if (!apiKey) throw new Error("API key is required");
      return getBulkHistory(data, apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });
};
export const useBulkGroupHistory = (
  data: MessageHistoryRequest,
  apiKey: string | null,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["bulk-group-history", data, apiKey],
    queryFn: async () => {
      if (!apiKey) throw new Error("API key is required");
      return getBulkGroupHistory(data, apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });
};
export const useBulkMsisdnListHistory = (
  data: MessageHistoryRequest,
  apiKey: string | null,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["bulk-msisdn-list-history", data, apiKey],
    queryFn: async () => {
      if (!apiKey) throw new Error("API key is required");
      return getBulkMsisdnListHistory(data, apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });
};
export const useScheduledHistory = (
  data: MessageHistoryRequest,
  apiKey: string | null,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["scheduled-history", data, apiKey],
    queryFn: async () => {
      if (!apiKey) throw new Error("API key is required");
      return getScheduledHistory(data, apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });
};
export const useRecurringHistory = (
  data: MessageHistoryRequest,
  apiKey: string | null,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["recurring-history", data, apiKey],
    queryFn: async () => {
      if (!apiKey) throw new Error("API key is required");
      return getRecurringHistory(data, apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });
};
