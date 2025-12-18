import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAlert } from "@/context/AlertProvider";
import {
  changeClientUserStatus,
  createClientUser,
  getClientUserRoles,
  getClientUsersList,
  updateClientUser,
} from "./clientUsers.service";
import {
  ClientCreateUserRequest,
  ClientUpdateUserRequest,
  ClientUserStatusRequest,
  ClientUsersListRequest,
} from "@/types";

interface MutationParams<Payload> {
  data: Payload;
  apiKey: string;
}

export const useClientUsersList = (
  params: ClientUsersListRequest,
  apiKey: string | null,
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["client-users", "list", params, apiKey],
    queryFn: () => {
      if (!apiKey) {
        throw new Error("API key is required");
      }
      return getClientUsersList(params, apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving client users list.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error, showAlert]);

  return query;
};

export const useCreateClientUser = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: MutationParams<ClientCreateUserRequest>) => {
      if (!apiKey) {
        throw new Error("API key is required");
      }
      return createClientUser(data, apiKey);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["client-users", "list"] });
      showAlert({
        variant: "success",
        title: "User created",
        message: data?.message || "Client user created successfully.",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to create client user.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useUpdateClientUser = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: MutationParams<ClientUpdateUserRequest>) => {
      if (!apiKey) {
        throw new Error("API key is required");
      }
      return updateClientUser(data, apiKey);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["client-users", "list"] });
      showAlert({
        variant: "success",
        title: "User updated",
        message: data?.message || "Client user updated successfully.",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to update client user.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useChangeClientUserStatus = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: MutationParams<ClientUserStatusRequest>) => {
      if (!apiKey) {
        throw new Error("API key is required");
      }
      return changeClientUserStatus(data, apiKey);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["client-users", "list"] });
      showAlert({
        variant: "success",
        title: "Status updated",
        message: data?.message || "Client user status updated successfully.",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to update client user status.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useClientUserRoles = (apiKey: string | null, enabled: boolean = true) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["client-users", "roles", apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getClientUserRoles(apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving client user roles.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error, showAlert]);

  return query;
};
