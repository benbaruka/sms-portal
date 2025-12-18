import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAlert } from "@/context/AlertProvider";
import {
  changeAdminUserStatus,
  createAdminUser,
  getAdminUserClients,
  getAdminUserDetails,
  getAdminUserRoles,
  getAdminUsersList,
  updateAdminUser,
} from "./users.service";
import {
  AdminCreateUserRequest,
  AdminUpdateUserRequest,
  AdminUserDetailsRequest,
  AdminUserStatusRequest,
  AdminUsersListRequest,
} from "@/types";

interface MutationParams<Payload> {
  data: Payload;
  apiKey: string;
}

export const useAdminUsersList = (
  params: AdminUsersListRequest,
  apiKey: string | null,
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["admin-users", "list", params, apiKey],
    queryFn: () => {
      if (!apiKey) {
        throw new Error("API key is required");
      }
      return getAdminUsersList(params, apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving admin users list.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error]);

  return query;
};

export const useAdminUserDetails = (
  params: AdminUserDetailsRequest | null,
  apiKey: string | null,
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["admin-users", "details", params, apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      if (!params?.user_id) throw new Error("User ID is required");
      return getAdminUserDetails(params, apiKey);
    },
    enabled: enabled && !!apiKey && !!params?.user_id,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving admin user details.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error]);

  return query;
};

export const useCreateAdminUser = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: MutationParams<AdminCreateUserRequest>) => {
      if (!apiKey) {
        throw new Error("API key is required");
      }
      return createAdminUser(data, apiKey);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users", "list"] });
      showAlert({
        variant: "success",
        title: "User created",
        message: data?.message || "Admin user created successfully.",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to create admin user.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useUpdateAdminUser = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: MutationParams<AdminUpdateUserRequest>) => {
      if (!apiKey) {
        throw new Error("API key is required");
      }
      return updateAdminUser(data, apiKey);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users", "list"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users", "details"] });
      showAlert({
        variant: "success",
        title: "User updated",
        message: data?.message || "Admin user updated successfully.",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to update admin user.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useChangeAdminUserStatus = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: MutationParams<AdminUserStatusRequest>) => {
      if (!apiKey) {
        throw new Error("API key is required");
      }
      return changeAdminUserStatus(data, apiKey);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users", "list"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users", "details"] });
      showAlert({
        variant: "success",
        title: "Status updated",
        message: data?.message || "Admin user status updated successfully.",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to update admin user status.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useAdminUserRoles = (apiKey: string | null, enabled: boolean = true) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["admin-users", "roles", apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getAdminUserRoles(apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving admin user roles.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error]);

  return query;
};

export const useAdminUserClients = (apiKey: string | null, enabled: boolean = true) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["admin-users", "clients", apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getAdminUserClients(apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving admin user clients.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error]);

  return query;
};
