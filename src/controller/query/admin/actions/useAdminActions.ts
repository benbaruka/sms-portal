import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAlert } from "@/context/AlertProvider";
import {
  getAdminActionsList,
  createAdminAction,
  deleteAdminAction,
  AdminCreateActionRequest,
} from "./actions.service";

export const useAdminActionsList = (apiKey: string | null, enabled: boolean = true) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["admin-actions", "list", apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getAdminActionsList(apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving actions list.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error, showAlert]);

  return query;
};

export const useCreateAdminAction = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, apiKey }: { data: AdminCreateActionRequest; apiKey: string }) => {
      if (!apiKey) throw new Error("API key is required");
      return createAdminAction(data, apiKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-actions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] }); // Invalidate roles to refresh permissions
      showAlert({
        variant: "success",
        title: "Action created",
        message: "The action has been created successfully.",
      });
    },
    onError: (error) => {
      // Extract detailed error message
      let errorMessage = "Failed to create action.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === "object") {
        const errObj = error as Record<string, unknown>;
        errorMessage = (errObj.message as string) || (errObj.error as string) || errorMessage;
      }

      // Log error details in development

      showAlert({
        variant: "error",
        title: "Error creating action",
        message: errorMessage,
      });
    },
  });
};

export const useDeleteAdminAction = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      apiKey,
    }: {
      data: { id: string | number } | { action_id: string | number };
      apiKey: string;
    }) => {
      if (!apiKey) throw new Error("API key is required");
      return deleteAdminAction(data, apiKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-actions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] }); // Invalidate roles to refresh permissions
      showAlert({
        variant: "success",
        title: "Action deleted",
        message: "The action has been deleted successfully.",
      });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete action.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};
