import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAlert } from "@/context/AlertProvider";
import {
  getAdminModulesList,
  createAdminModule,
  deleteAdminModule,
  AdminCreateModuleRequest,
} from "./modules.service";

export const useAdminModulesList = (apiKey: string | null, enabled: boolean = true) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["admin-modules", "list", apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getAdminModulesList(apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving modules list.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error, showAlert]);

  return query;
};

export const useCreateAdminModule = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, apiKey }: { data: AdminCreateModuleRequest; apiKey: string }) => {
      if (!apiKey) throw new Error("API key is required");
      return createAdminModule(data, apiKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-modules"] });
      showAlert({
        variant: "success",
        title: "Module created",
        message: "The module has been created successfully.",
      });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "Failed to create module.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useDeleteAdminModule = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      apiKey,
    }: {
      data: { id: string | number } | { module_id: string | number };
      apiKey: string;
    }) => {
      if (!apiKey) throw new Error("API key is required");
      return deleteAdminModule(data, apiKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-modules"] });
      showAlert({
        variant: "success",
        title: "Module deleted",
        message: "The module has been deleted successfully.",
      });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete module.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};
