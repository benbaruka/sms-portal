import { useAlert } from "@/context/AlertProvider";
import {
  AdminApproveSenderRequest,
  AdminAssignSenderToClientRequest,
  AdminRejectSenderRequest,
  AdminSenderDetailsRequest,
  AdminSendersListRequest,
  AdminUnassignSenderFromClientRequest,
  AdminUpdateClientSenderStatusRequest,
  AdminUpdateSenderStatusRequest,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  addConnectorToSender,
  approveAdminSender,
  assignSenderToClient,
  deleteAdminSender,
  getAdminSenderDetails,
  getAdminSendersList,
  getClientsAssignedToSender,
  rejectAdminSender,
  removeConnectorFromSender,
  unassignSenderFromClient,
  updateAdminSenderStatus,
  updateClientSenderOTP,
  updateClientSenderStatus,
} from "./senders.service";

export const useAdminSendersList = (
  params: AdminSendersListRequest = {},
  apiKey: string | null,
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["admin-senders", "list", params, apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getAdminSendersList(params, apiKey);
    },
    enabled: enabled && !!apiKey,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving admin senders list.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error, showAlert]);

  return query;
};

export const useAdminSenderDetails = (
  params: AdminSenderDetailsRequest | null,
  apiKey: string | null,
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["admin-senders", "details", params, apiKey],
    queryFn: () => {
      if (!apiKey || !params) throw new Error("API key and sender ID are required");
      return getAdminSenderDetails(params, apiKey);
    },
    enabled: enabled && !!apiKey && !!params,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving sender details.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error, showAlert]);

  return query;
};

export const useApproveAdminSender = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, apiKey }: { data: AdminApproveSenderRequest; apiKey: string }) => {
      if (!apiKey) throw new Error("API key is required");
      return approveAdminSender(data, apiKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-senders"] });
      showAlert({
        variant: "success",
        title: "Sender approved",
        message: "The sender ID has been approved successfully.",
      });
    },
    onError: (error) => {
      let errorMessage = "Failed to approve sender ID.";
      if (error instanceof Error) {
        errorMessage = error.message;
        // Check if it's a 404 error
        if (error.message.includes("404") || error.message.includes("not found")) {
          errorMessage =
            "The approve endpoint is not available (404). This feature is not yet implemented in the backend.";
        }
      }
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useRejectAdminSender = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, apiKey }: { data: AdminRejectSenderRequest; apiKey: string }) => {
      if (!apiKey) throw new Error("API key is required");
      return rejectAdminSender(data, apiKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-senders"] });
      showAlert({
        variant: "success",
        title: "Sender rejected",
        message: "The sender ID has been rejected.",
      });
    },
    onError: (error) => {
      let errorMessage = "Failed to reject sender ID.";
      if (error instanceof Error) {
        errorMessage = error.message;
        // Check if it's a 404 error
        if (error.message.includes("404") || error.message.includes("not found")) {
          errorMessage =
            "The reject endpoint is not available (404). This feature is not yet implemented in the backend.";
        }
      }
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useUpdateAdminSenderStatus = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      apiKey,
    }: {
      data: AdminUpdateSenderStatusRequest;
      apiKey: string;
    }) => {
      if (!apiKey) throw new Error("API key is required");
      return updateAdminSenderStatus(data, apiKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-senders"] });
      showAlert({
        variant: "success",
        title: "Status updated",
        message: "The sender ID status has been updated successfully.",
      });
    },
    onError: (error) => {
      let errorMessage = "Failed to update sender status.";
      if (error instanceof Error) {
        errorMessage = error.message;
        // Check if it's a 404 error
        if (error.message.includes("404") || error.message.includes("not found")) {
          errorMessage =
            "The status update endpoint is not available (404). Only APPROVED and REJECTED status changes are supported via approve/reject endpoints.";
        }
      }
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useAssignSenderToClient = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      apiKey,
    }: {
      data: AdminAssignSenderToClientRequest;
      apiKey: string;
    }) => {
      if (!apiKey) throw new Error("API key is required");
      return assignSenderToClient(data, apiKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-senders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-clients"] });
      showAlert({
        variant: "success",
        title: "Sender assigned",
        message: "The sender ID has been assigned to the client successfully.",
      });
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to assign sender to client.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useUnassignSenderFromClient = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      apiKey,
    }: {
      data: AdminUnassignSenderFromClientRequest;
      apiKey: string;
    }) => {
      if (!apiKey) throw new Error("API key is required");
      return unassignSenderFromClient(data, apiKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-senders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-clients"] });
      showAlert({
        variant: "success",
        title: "Sender unassigned",
        message: "The sender ID has been unassigned from the client successfully.",
      });
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to unassign sender from client.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useUpdateClientSenderStatus = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      apiKey,
    }: {
      data: AdminUpdateClientSenderStatusRequest;
      apiKey: string;
    }) => {
      if (!apiKey) throw new Error("API key is required");
      return updateClientSenderStatus(data, apiKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-senders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-clients"] });
      showAlert({
        variant: "success",
        title: "Status updated",
        message: "The client sender status has been updated successfully.",
      });
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update client sender status.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useClientsAssignedToSender = (
  senderId: string | number | null,
  apiKey: string | null,
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["admin-senders", "assigned-clients", senderId, apiKey],
    queryFn: () => {
      if (!apiKey || !senderId) throw new Error("API key and sender ID are required");
      return getClientsAssignedToSender(senderId, apiKey);
    },
    enabled: enabled && !!apiKey && !!senderId,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving clients assigned to sender.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error, showAlert]);

  return query;
};

// Delete sender hook
export const useDeleteAdminSender = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      apiKey,
    }: {
      data: { sender_id: string | number };
      apiKey: string;
    }) => {
      if (!apiKey) throw new Error("API key is required");
      return deleteAdminSender(data, apiKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-senders"] });
      showAlert({
        variant: "success",
        title: "Sender Deleted",
        message: "The sender ID has been successfully deleted.",
      });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete sender.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

// Add connector to sender hook
export const useAddConnectorToSender = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      apiKey,
    }: {
      data: { sender_id: string | number; connector_id: string | number };
      apiKey: string;
    }) => {
      if (!apiKey) throw new Error("API key is required");
      return addConnectorToSender(data, apiKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-senders"] });
      showAlert({
        variant: "success",
        title: "Connector Added",
        message: "The connector has been successfully added to the sender.",
      });
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add connector to sender.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

// Remove connector from sender hook
export const useRemoveConnectorFromSender = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      apiKey,
    }: {
      data: { sender_id: string | number; connector_id: string | number };
      apiKey: string;
    }) => {
      if (!apiKey) throw new Error("API key is required");
      return removeConnectorFromSender(data, apiKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-senders"] });
      showAlert({
        variant: "success",
        title: "Connector Removed",
        message: "The connector has been successfully removed from the sender.",
      });
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to remove connector from sender.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

// Update client sender OTP hook
export const useUpdateClientSenderOTP = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      apiKey,
    }: {
      data: { id: string | number; otp: number };
      apiKey: string;
    }) => {
      if (!apiKey) throw new Error("API key is required");
      return updateClientSenderOTP(data, apiKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-senders"] });
      showAlert({
        variant: "success",
        title: "OTP Status Updated",
        message: "The client sender OTP status has been updated successfully.",
      });
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update client sender OTP status.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};
