import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAlert } from "@/context/AlertProvider";
import {
  changeAdminTokenStatus,
  createAdminToken,
  getAdminTokenClients,
  getAdminTokenKYBStatus,
  getAdminTokensList,
} from "./tokens.service";
import {
  AdminCreateTokenRequest,
  AdminTokenKYBStatusRequest,
  AdminTokenStatusRequest,
  AdminTokensListRequest,
} from "@/types";

interface MutationParams<Payload> {
  data: Payload;
  apiKey: string;
}

export const useAdminTokensList = (
  params: AdminTokensListRequest,
  apiKey: string | null,
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["admin-tokens", "list", params, apiKey],
    queryFn: () => {
      if (!apiKey) {
        throw new Error("API key is required");
      }
      return getAdminTokensList(params, apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving admin tokens list.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error]);

  return query;
};

export const useCreateAdminToken = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: MutationParams<AdminCreateTokenRequest>) => {
      if (!apiKey) {
        throw new Error("API key is required");
      }
      return createAdminToken(data, apiKey);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-tokens", "list"] });
      showAlert({
        variant: "success",
        title: "Token created",
        message: data?.message || "Live token created successfully.",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to create token.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useChangeAdminTokenStatus = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: MutationParams<AdminTokenStatusRequest>) => {
      if (!apiKey) {
        throw new Error("API key is required");
      }
      return changeAdminTokenStatus(data, apiKey);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-tokens", "list"] });
      showAlert({
        variant: "success",
        title: "Status updated",
        message: data?.message || "Token status updated successfully.",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to update token status.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useAdminTokenClients = (apiKey: string | null, enabled: boolean = true) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["admin-tokens", "clients", apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getAdminTokenClients(apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving clients.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error]);

  return query;
};

export const useAdminTokenKYBStatus = (
  params: AdminTokenKYBStatusRequest,
  apiKey: string | null,
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["admin-tokens", "kyb-status", params, apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getAdminTokenKYBStatus(params, apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving KYB status.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error]);

  return query;
};
