import { useAlert } from "@/context/AlertProvider";
import { CreateConnectorRequest, DeleteConnectorRequest } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  createConnector,
  deleteConnector,
  getAllConnectors,
  GetAllConnectorsRequest,
  getConnectorById,
  updateConnector,
} from "./connectors.service";

export const useGetAllConnectors = (
  params: GetAllConnectorsRequest = { page: 1, limit: 50 },
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["connectors", "all", params],
    queryFn: () => getAllConnectors(params),
    enabled,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving connectors list.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error, showAlert]);

  return query;
};

export const useCreateConnector = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: { data: CreateConnectorRequest; apiKey: string }) => {
      if (!apiKey) throw new Error("API key is required");
      return createConnector(data, apiKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connectors", "all"] });
      showAlert({
        variant: "success",
        title: "Connector Created",
        message: "The connector has been created successfully.",
      });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "Failed to create connector.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useUpdateConnector = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      data,
      apiKey,
    }: {
      data: CreateConnectorRequest & { id: number };
      apiKey: string;
    }) => {
      if (!apiKey) throw new Error("API key is required");
      return updateConnector(data, apiKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connectors", "all"] });
      showAlert({
        variant: "success",
        title: "Connector Updated",
        message: "The connector has been updated successfully.",
      });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "Failed to update connector.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useGetConnectorById = (
  connectorId: number | string | null,
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["connectors", "details", connectorId],
    queryFn: () => {
      if (!connectorId) throw new Error("Connector ID is required");
      return getConnectorById(connectorId);
    },
    enabled: enabled && !!connectorId,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving connector details.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error, showAlert]);

  return query;
};

export const useDeleteConnector = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: { data: DeleteConnectorRequest; apiKey: string }) => {
      if (!apiKey) throw new Error("API key is required");
      return deleteConnector(data, apiKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connectors", "all"] });
      showAlert({
        variant: "success",
        title: "Connector Deleted",
        message: "The connector has been deleted successfully.",
      });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete connector.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};
