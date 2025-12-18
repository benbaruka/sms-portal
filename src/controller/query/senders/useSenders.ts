import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  createSenderIdRequest,
  getClientSenderIdsList,
  getClientSenderIdsListForMessages,
} from "./senders.service";
import { CreateSenderIdRequest, GetClientSenderIdsListRequest } from "@/types";
import { useAlert } from "@/context/AlertProvider";
export const useClientSenderIdsList = (
  params: GetClientSenderIdsListRequest = {},
  apiKey: string | null,
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["senders", "client", "list", params, apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getClientSenderIdsList(params, apiKey);
    },
    enabled: enabled && !!apiKey,
  });
  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving sender IDs list.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error]);
  return query;
};

export const useClientSenderIdsListForMessages = (
  params: GetClientSenderIdsListRequest = {},
  apiKey: string | null,
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["senders", "client", "list", "messages", params, apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getClientSenderIdsListForMessages(params, apiKey);
    },
    enabled: enabled && !!apiKey,
  });
  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving sender IDs list.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error]);
  return query;
};

export const useCreateSenderIdRequest = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: { data: CreateSenderIdRequest; apiKey: string }) => {
      if (!apiKey) throw new Error("API key is required");
      return createSenderIdRequest(data, apiKey);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["senders", "client", "list"] });
      showAlert({
        variant: "success",
        title: "Sender ID requested",
        message: data?.message || "Your sender ID request has been submitted successfully.",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to request sender ID.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};
