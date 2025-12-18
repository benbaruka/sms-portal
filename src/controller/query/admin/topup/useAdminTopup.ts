import { useAlert } from "@/context/AlertProvider";
import { GetManualTopupRequestsRequest, ManualTopupRequest } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createManualTopup,
  getAvailableConnectors,
  getManualTopupRequestDetails,
  getManualTopupRequests,
} from "./topup.service";

/**
 * Hook to create a manual top-up request
 */
export const useCreateManualTopup = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: { data: ManualTopupRequest; apiKey: string }) => {
      if (!apiKey) throw new Error("API key is required");
      return createManualTopup(data, apiKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-topup", "requests"] });
      showAlert({
        variant: "success",
        title: "Top-up Request Created",
        message: "Manual top-up request created successfully.",
      });
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create manual top-up request.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

/**
 * Hook to get all manual top-up requests
 */
export const useManualTopupRequests = (
  params: GetManualTopupRequestsRequest,
  apiKey: string | null,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["admin-topup", "requests", params, apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getManualTopupRequests(params, apiKey);
    },
    enabled: enabled && !!apiKey,
  });
};

/**
 * Hook to get manual top-up request details
 */
export const useManualTopupRequestDetails = (
  requestId: number | null,
  apiKey: string | null,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["admin-topup", "request", requestId, apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      if (!requestId) throw new Error("Request ID is required");
      return getManualTopupRequestDetails({ request_id: requestId }, apiKey);
    },
    enabled: enabled && !!apiKey && !!requestId,
  });
};

/**
 * Hook to get available connectors
 */
export const useAvailableConnectors = (apiKey: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["admin-topup", "connectors", apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getAvailableConnectors(apiKey);
    },
    enabled: enabled && !!apiKey,
  });
};
