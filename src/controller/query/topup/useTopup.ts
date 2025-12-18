import { useAlert } from "@/context/AlertProvider";
import {
  CreateManualTopupRequest,
  GetManualTopupRequestDetailsRequest,
  GetManualTopupRequestsRequest,
  MNOSelfTopupRequest,
  MNOTopupHistoryRequest,
  MpesaPaymentRequest,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  createManualTopup,
  getAvailableConnectors,
  getManualTopupRequestDetails,
  getManualTopupRequests,
  getMNOProviders,
  getMNOTopupHistory,
  mnoSelfTopup,
  mpesaPaymentRequest,
} from "./topup.service";

export const useMpesaPaymentRequest = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: { data: MpesaPaymentRequest; apiKey: string }) => {
      if (!apiKey) throw new Error("API key is required");
      return mpesaPaymentRequest(data, apiKey);
    },
    onSuccess: async (data) => {
      // Invalidate dashboard summary to update balance after topup
      queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
      // Refetch dashboard summary to ensure it updates immediately
      await queryClient.refetchQueries({ queryKey: ["dashboard", "summary"] });
      // Invalidate billing stats for super admin (system_balance) - invalidate all variations
      queryClient.invalidateQueries({ queryKey: ["dashboard", "billing-stats"] });
      // Refetch billing stats to ensure it updates immediately
      await queryClient.refetchQueries({ queryKey: ["dashboard", "billing-stats"] });
      showAlert({
        variant: "success",
        title: "Success",
        message: data?.message || "MPESA payment request submitted successfully!",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to submit MPESA payment request.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useGetMNOProviders = (apiKey: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["mno-providers", apiKey],
    queryFn: async () => {
      if (!apiKey) throw new Error("API key is required");
      return getMNOProviders(apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });
};

export const useMNOSelfTopup = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: { data: MNOSelfTopupRequest; apiKey: string }) => {
      if (!apiKey) throw new Error("API key is required");
      return mnoSelfTopup(data, apiKey);
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["mno-topup-history"] });
      // Invalidate dashboard summary to update balance after topup
      queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
      // Refetch dashboard summary to ensure it updates immediately
      await queryClient.refetchQueries({ queryKey: ["dashboard", "summary"] });
      // Invalidate billing stats for super admin (system_balance) - invalidate all variations
      queryClient.invalidateQueries({ queryKey: ["dashboard", "billing-stats"] });
      // Refetch billing stats to ensure it updates immediately
      await queryClient.refetchQueries({ queryKey: ["dashboard", "billing-stats"] });
      showAlert({
        variant: "success",
        title: "Success",
        message: data?.message || "MNO topup request submitted successfully!",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to submit MNO topup request.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useMNOTopupHistory = (
  data: MNOTopupHistoryRequest,
  apiKey: string | null,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["mno-topup-history", data, apiKey],
    queryFn: async () => {
      if (!apiKey) throw new Error("API key is required");
      return getMNOTopupHistory(data, apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });
};

// Admin Manual Topup
export const useCreateManualTopup = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: { data: CreateManualTopupRequest; apiKey: string }) => {
      if (!apiKey) throw new Error("API key is required");
      return createManualTopup(data, apiKey);
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["manual-topup-requests"] });
      // Invalidate dashboard summary to update balance after topup
      queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
      // Refetch dashboard summary to ensure it updates immediately
      await queryClient.refetchQueries({ queryKey: ["dashboard", "summary"] });
      // Invalidate billing stats for super admin (system_balance) - invalidate all variations
      queryClient.invalidateQueries({ queryKey: ["dashboard", "billing-stats"] });
      // Refetch billing stats to ensure it updates immediately
      await queryClient.refetchQueries({ queryKey: ["dashboard", "billing-stats"] });
      showAlert({
        variant: "success",
        title: "Success",
        message: data?.message || "Manual topup request created successfully!",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to create manual topup request.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useGetManualTopupRequests = (
  data: GetManualTopupRequestsRequest,
  apiKey: string | null,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["manual-topup-requests", data, apiKey],
    queryFn: async () => {
      if (!apiKey) throw new Error("API key is required");
      return getManualTopupRequests(data, apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });
};

export const useGetManualTopupRequestDetails = (
  data: GetManualTopupRequestDetailsRequest,
  apiKey: string | null,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["manual-topup-request-details", data, apiKey],
    queryFn: async () => {
      if (!apiKey) throw new Error("API key is required");
      return getManualTopupRequestDetails(data, apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });
};

export const useGetAvailableConnectors = (apiKey: string | null, enabled: boolean = true) => {
  const query = useQuery({
    queryKey: ["available-connectors", apiKey],
    queryFn: async () => {
      if (!apiKey) throw new Error("API key is required");
      return getAvailableConnectors(apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
    retry: false, // Don't retry on 500 errors
  });

  // Silently handle errors - user can still enter connector ID manually
  useEffect(() => {
    if (query.isError && query.error) {
      // Don't show alert - user can still use the form with manual input
    }
  }, [query.isError, query.error]);

  return query;
};
