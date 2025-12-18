import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAlert } from "@/context/AlertProvider";
import {
  approveAdminKYB,
  getAdminKYBDetails,
  getAdminKYBHistory,
  getAdminKYBPendings,
  getAdminKYBClientsByStatus,
  rejectAdminKYB,
} from "./kyb.service";
import { AdminKYBDecisionRequest, AdminKYBDetailsRequest, AdminKYBListRequest } from "@/types";

export const useAdminKYBPendings = (
  params: AdminKYBListRequest = {},
  apiKey: string | null,
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["admin-kyb", "pending", params, apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getAdminKYBPendings(params, apiKey);
    },
    enabled: enabled && !!apiKey,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving pending KYB list.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error, showAlert]);

  return query;
};

export const useAdminKYBClientsByStatus = (
  params: AdminKYBListRequest & { kyb_status: "PENDING" | "APPROVED" | "REJECTED" | "LEGACY" },
  apiKey: string | null,
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["admin-kyb", "clients", params, apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getAdminKYBClientsByStatus(params, apiKey);
    },
    enabled: enabled && !!apiKey,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving KYB clients list.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error, showAlert]);

  return query;
};

export const useAdminKYBHistory = (
  params: AdminKYBListRequest & { kyb_status?: "APPROVED" | "REJECTED" | "LEGACY" } = {},
  apiKey: string | null,
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["admin-kyb", "history", params, apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getAdminKYBHistory(params, apiKey);
    },
    enabled: enabled && !!apiKey,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving KYB history.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error, showAlert]);

  return query;
};

export const useAdminKYBDetails = (
  params: AdminKYBDetailsRequest | null,
  apiKey: string | null,
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["admin-kyb", "details", params, apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      if (!params) throw new Error("KYB id is required");
      return getAdminKYBDetails(params, apiKey);
    },
    enabled: enabled && !!apiKey && !!params,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving KYB details.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error, showAlert]);

  return query;
};

export const useApproveAdminKYB = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: { data: AdminKYBDecisionRequest; apiKey: string }) => {
      if (!apiKey) throw new Error("API key is required");
      return approveAdminKYB(data, apiKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-kyb"] });
      showAlert({
        variant: "success",
        title: "Success",
        message: "KYB approved successfully!",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to approve KYB.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useRejectAdminKYB = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: { data: AdminKYBDecisionRequest; apiKey: string }) => {
      if (!apiKey) throw new Error("API key is required");
      return rejectAdminKYB(data, apiKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-kyb"] });
      showAlert({
        variant: "success",
        title: "Success",
        message: "KYB rejected successfully!",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to reject KYB.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};
