import axios from "axios";
import { billingApiRequest } from "@/controller/api/config/config";
import { adminRoles } from "@/controller/api/constant/apiLink";
import {
  AdminAssignPermissionRequest,
  AdminCreateRoleRequest,
  AdminRevokePermissionRequest,
  AdminRolePermissionsResponse,
  AdminRolesListRequest,
  AdminRolesListResponse,
  AdminSimpleResponse,
} from "@/types";

const handleAxiosError = (error: unknown, fallbackMessage: string) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      throw new Error(error.response.data?.message || fallbackMessage);
    }
    if (error.request) {
      throw new Error("No server response. Please check your internet connection.");
    }
  }
  throw new Error(fallbackMessage);
};

export const getAdminRolesList = async (
  data: AdminRolesListRequest,
  apiKey: string
): Promise<AdminRolesListResponse | undefined> => {
  try {
    // Backend RoleAll n'accepte PAS de payload - retourne tous les rôles
    // Pas de pagination côté backend, on doit gérer côté frontend
    const response = await billingApiRequest<Record<string, never>, AdminRolesListResponse>({
      method: "POST",
      endpoint: adminRoles.list, // /admin/role/all n'accepte pas de payload
      data: {}, // Pas de data
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for admin roles list.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error retrieving admin roles list.");
  }
};

export const createAdminRole = async (
  data: AdminCreateRoleRequest,
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    const response = await billingApiRequest<AdminCreateRoleRequest, AdminSimpleResponse>({
      method: "POST",
      endpoint: adminRoles.create,
      data,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for admin role creation.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error creating admin role.");
  }
};

export const getAdminRolePermissions = async (
  roleId: string | number | null,
  apiKey: string
): Promise<AdminRolePermissionsResponse | undefined> => {
  try {
    const response = await billingApiRequest<
      { role_id?: string | number },
      AdminRolePermissionsResponse
    >({
      method: "POST",
      endpoint: adminRoles.permissions,
      data: roleId ? { role_id: roleId } : {},
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for admin role permissions.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error retrieving role permissions.");
  }
};

export const getAvailablePermissions = async (
  apiKey: string
): Promise<AdminRolePermissionsResponse | undefined> => {
  try {
    const response = await billingApiRequest<Record<string, never>, AdminRolePermissionsResponse>({
      method: "POST",
      endpoint: adminRoles.availablePermissions,
      data: {},
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for available permissions.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error retrieving available permissions.");
  }
};

export const assignPermissionToRole = async (
  data: AdminAssignPermissionRequest,
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    const response = await billingApiRequest<AdminAssignPermissionRequest, AdminSimpleResponse>({
      method: "POST",
      endpoint: adminRoles.assignPermission,
      data,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for assigning permission.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error assigning permission to role.");
  }
};

export const revokePermissionFromRole = async (
  data: AdminRevokePermissionRequest,
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    const response = await billingApiRequest<AdminRevokePermissionRequest, AdminSimpleResponse>({
      method: "POST",
      endpoint: adminRoles.revokePermission,
      data,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for revoking permission.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error revoking permission from role.");
  }
};

export const changeAdminRoleStatus = async (
  data: { role_id: string | number; status: number },
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    const response = await billingApiRequest<
      { role_id: string | number; status: number },
      AdminSimpleResponse
    >({
      method: "POST",
      endpoint: adminRoles.changeStatus,
      data: {
        role_id: data.role_id,
        status: data.status, // 1 = Active, 0 = Inactive
      },
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for changing role status.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error changing role status.");
  }
};

// Aliases for backward compatibility
export const assignAdminPermission = assignPermissionToRole;
export const revokeAdminPermission = revokePermissionFromRole;
export const getAdminAvailablePermissions = getAvailablePermissions;
