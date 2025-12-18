import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAlert } from "@/context/AlertProvider";
import {
  assignPermissionToRole,
  changeAdminRoleStatus,
  createAdminRole,
  getAdminRolePermissions,
  getAdminRolesList,
  getAvailablePermissions,
  revokePermissionFromRole,
} from "./roles.service";
import {
  AdminAssignPermissionRequest,
  AdminChangeRoleStatusRequest,
  AdminCreateRoleRequest,
  AdminRevokePermissionRequest,
  AdminRolesListRequest,
} from "@/types";

interface MutationParams<Payload> {
  data: Payload;
  apiKey: string;
}

export const useAdminRolesList = (
  params: AdminRolesListRequest,
  apiKey: string | null,
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["admin-roles", "list", params, apiKey],
    queryFn: () => {
      if (!apiKey) {
        throw new Error("API key is required");
      }
      return getAdminRolesList(params, apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving roles list.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error]);

  return query;
};

export const useAdminRolePermissions = (
  roleId: string | number | null,
  apiKey: string | null,
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["admin-roles", "permissions", roleId, apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getAdminRolePermissions(roleId, apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving role permissions.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error]);

  return query;
};

export const useAdminAvailablePermissions = (apiKey: string | null, enabled: boolean = true) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["admin-roles", "available-permissions", apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getAvailablePermissions(apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving permissions.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error]);

  return query;
};

export const useCreateAdminRole = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: MutationParams<AdminCreateRoleRequest>) => {
      if (!apiKey) {
        throw new Error("API key is required");
      }
      return createAdminRole(data, apiKey);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-roles", "list"] });
      showAlert({
        variant: "success",
        title: "Role created",
        message: data?.message || "Role created successfully.",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to create role.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useAssignPermissionToRole = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: MutationParams<AdminAssignPermissionRequest>) => {
      if (!apiKey) {
        throw new Error("API key is required");
      }
      return assignPermissionToRole(data, apiKey);
    },
    onSuccess: (data) => {
      // Invalidate both permissions and roles list to update the table
      queryClient.invalidateQueries({ queryKey: ["admin-roles", "permissions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-roles", "list"] });
      showAlert({
        variant: "success",
        title: "Permission assigned",
        message: data?.message || "Permission assigned to role successfully.",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to assign permission.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useRevokePermissionFromRole = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: MutationParams<AdminRevokePermissionRequest>) => {
      if (!apiKey) {
        throw new Error("API key is required");
      }
      return revokePermissionFromRole(data, apiKey);
    },
    onSuccess: (data) => {
      // Invalidate both permissions and roles list to update the table
      queryClient.invalidateQueries({ queryKey: ["admin-roles", "permissions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-roles", "list"] });
      showAlert({
        variant: "success",
        title: "Permission revoked",
        message: data?.message || "Permission revoked from role successfully.",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to revoke permission.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useChangeAdminRoleStatus = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: MutationParams<AdminChangeRoleStatusRequest>) => {
      if (!apiKey) {
        throw new Error("API key is required");
      }
      return changeAdminRoleStatus(data, apiKey);
    },
    onSuccess: (data) => {
      // Invalidate roles list to update the table
      queryClient.invalidateQueries({ queryKey: ["admin-roles", "list"] });
      showAlert({
        variant: "success",
        title: "Role status updated",
        message: data?.message || "Role status has been updated successfully.",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to update role status.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

// Aliases for backward compatibility
export const useGetAdminRolePermissions = useAdminRolePermissions;
export const useAssignAdminPermission = useAssignPermissionToRole;
export const useRevokeAdminPermission = useRevokePermissionFromRole;
export const useGetAdminAvailablePermissions = useAdminAvailablePermissions;
