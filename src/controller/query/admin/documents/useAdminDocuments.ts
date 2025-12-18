import { useAlert } from "@/context/AlertProvider";
import {
  AdminChangeDocumentTypeStatusRequest,
  AdminCreateDocumentRequest,
  AdminCreateDocumentTypeRequest,
  AdminDeleteDocumentRequest,
  AdminDeleteDocumentTypeRequest,
  AdminDocumentsListRequest,
  AdminGetDocumentTypeRequest,
  AdminUpdateDocumentContentRequest,
  AdminUpdateDocumentTypeRequest,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  changeAdminDocumentTypeStatus,
  createAdminDocument,
  createAdminDocumentType,
  deleteAdminDocument,
  deleteAdminDocumentType,
  getAdminDocumentType,
  getAdminDocumentTypes,
  getAdminDocumentsList,
  updateAdminDocumentContent,
  updateAdminDocumentType,
} from "./documents.service";

interface MutationParams<Payload> {
  data: Payload;
  apiKey: string;
}

export const useAdminDocumentsList = (
  params: AdminDocumentsListRequest,
  apiKey: string | null,
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();

  // Vérifier que client_id est valide pour activer la requête
  const hasValidClientId =
    !!params.client_id &&
    (typeof params.client_id === "number"
      ? params.client_id > 0
      : typeof params.client_id === "string"
        ? parseInt(params.client_id, 10) > 0
        : false);

  const shouldExecute = enabled && !!apiKey && hasValidClientId;

  // Logs de debug pour comprendre pourquoi la requête ne se déclenche pas
  useEffect(() => {}, [enabled, apiKey, hasValidClientId, shouldExecute, params]);

  const query = useQuery({
    queryKey: ["admin-documents", "list", params, apiKey],
    queryFn: () => {
      if (!apiKey) {
        throw new Error("API key is required");
      }
      if (!hasValidClientId) {
        throw new Error("Client ID is required. Please select a client.");
      }
      return getAdminDocumentsList(params, apiKey);
    },
    enabled: shouldExecute,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving client documents.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.isError, query.error]);

  return query;
};

export const useAdminDocumentTypes = (apiKey: string | null, enabled: boolean = true) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["admin-documents", "types", apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getAdminDocumentTypes(apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving document types.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.isError, query.error]);

  return query;
};

export const useCreateAdminDocumentType = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: MutationParams<AdminCreateDocumentTypeRequest>) => {
      if (!apiKey) {
        throw new Error("API key is required");
      }
      return createAdminDocumentType(data, apiKey);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-documents", "types"] });
      // Extract message safely - handle both string and object cases
      let message = "Document type created successfully.";
      if (data?.message) {
        if (typeof data.message === "string") {
          message = data.message;
        } else if (typeof data.message === "object" && data.message !== null) {
          // If message is an object, try to extract a string message from it
          const msgObj = data.message as Record<string, unknown>;
          message =
            (msgObj.message as string) || (msgObj.error as string) || JSON.stringify(data.message);
        }
      }
      showAlert({
        variant: "success",
        title: "Document type created",
        message,
      });
    },
    onError: (error) => {
      // Extract error message safely
      let errorMessage = "Failed to create document type.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === "object") {
        const errObj = error as Record<string, unknown>;
        errorMessage = (errObj.message as string) || (errObj.error as string) || errorMessage;
      }
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useUpdateAdminDocumentType = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: MutationParams<AdminUpdateDocumentTypeRequest>) => {
      if (!apiKey) {
        throw new Error("API key is required");
      }
      return updateAdminDocumentType(data, apiKey);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-documents", "types"] });
      // Extract message safely - handle both string and object cases
      let message = "Document type updated successfully.";
      if (data?.message) {
        if (typeof data.message === "string") {
          message = data.message;
        } else if (typeof data.message === "object" && data.message !== null) {
          // If message is an object, try to extract a string message from it
          const msgObj = data.message as Record<string, unknown>;
          message =
            (msgObj.message as string) || (msgObj.error as string) || JSON.stringify(data.message);
        }
      }
      showAlert({
        variant: "success",
        title: "Document type updated",
        message,
      });
    },
    onError: (error) => {
      // Extract error message safely
      let errorMessage = "Failed to update document type.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === "object") {
        const errObj = error as Record<string, unknown>;
        errorMessage = (errObj.message as string) || (errObj.error as string) || errorMessage;
      }
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useChangeAdminDocumentTypeStatus = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: MutationParams<AdminChangeDocumentTypeStatusRequest>) => {
      if (!apiKey) {
        throw new Error("API key is required");
      }
      return changeAdminDocumentTypeStatus(data, apiKey);
    },
    onSuccess: (data) => {
      // Invalidate all document types queries (with or without apiKey in the key)
      queryClient.invalidateQueries({
        queryKey: ["admin-documents", "types"],
        exact: false, // Match all queries starting with ["admin-documents", "types"]
      });
      // Extract message safely - handle both string and object cases
      let message = "Document type status updated successfully.";
      if (data?.message) {
        if (typeof data.message === "string") {
          message = data.message;
        } else if (typeof data.message === "object" && data.message !== null) {
          // If message is an object, try to extract a string message from it
          const msgObj = data.message as Record<string, unknown>;
          message =
            (msgObj.message as string) || (msgObj.error as string) || JSON.stringify(data.message);
        }
      }
      showAlert({
        variant: "success",
        title: "Status updated",
        message,
      });
    },
    onError: (error) => {
      // Extract error message safely
      let errorMessage = "Failed to update document type status.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === "object") {
        const errObj = error as Record<string, unknown>;
        errorMessage = (errObj.message as string) || (errObj.error as string) || errorMessage;
      }
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useGetAdminDocumentType = () => {
  const { showAlert } = useAlert();
  return useMutation({
    mutationFn: async ({ data, apiKey }: MutationParams<AdminGetDocumentTypeRequest>) => {
      if (!apiKey) {
        throw new Error("API key is required");
      }
      return getAdminDocumentType(data, apiKey);
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to retrieve document type details.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useDeleteAdminDocumentType = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: MutationParams<AdminDeleteDocumentTypeRequest>) => {
      if (!apiKey) {
        throw new Error("API key is required");
      }
      return deleteAdminDocumentType(data, apiKey);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-documents", "types"] });
      // Extract message safely - handle both string and object cases
      let message = "Document type deleted successfully.";
      if (data?.message) {
        if (typeof data.message === "string") {
          message = data.message;
        } else if (typeof data.message === "object" && data.message !== null) {
          // If message is an object, try to extract a string message from it
          const msgObj = data.message as Record<string, unknown>;
          message =
            (msgObj.message as string) || (msgObj.error as string) || JSON.stringify(data.message);
        }
      }
      showAlert({
        variant: "success",
        title: "Document type deleted",
        message,
      });
    },
    onError: (error) => {
      // Extract error message safely
      let errorMessage = "Failed to delete document type.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === "object") {
        const errObj = error as Record<string, unknown>;
        errorMessage = (errObj.message as string) || (errObj.error as string) || errorMessage;
      }
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useUpdateAdminDocumentContent = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: MutationParams<AdminUpdateDocumentContentRequest>) => {
      if (!apiKey) {
        throw new Error("API key is required");
      }
      return updateAdminDocumentContent(data, apiKey);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-documents", "list"] });
      showAlert({
        variant: "success",
        title: "Document updated",
        message: data?.message || "Document content updated successfully.",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to update document content.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useDeleteAdminDocument = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: MutationParams<AdminDeleteDocumentRequest>) => {
      if (!apiKey) {
        throw new Error("API key is required");
      }
      return deleteAdminDocument(data, apiKey);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-documents", "list"] });
      showAlert({
        variant: "success",
        title: "Document deleted",
        message: data?.message || "Document deleted successfully.",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to delete document.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useCreateAdminDocument = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: MutationParams<AdminCreateDocumentRequest>) => {
      if (!apiKey) {
        throw new Error("API key is required");
      }
      return createAdminDocument(data, apiKey);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-documents", "list"] });
      showAlert({
        variant: "success",
        title: "Document created",
        message: data?.message || "Document created successfully.",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to create document.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

// Aliases for backward compatibility
export const useGetAdminDocumentTypes = useAdminDocumentTypes;
