import axios from "axios";
import { billingApiRequest } from "@/controller/api/config/config";
import { adminModules } from "@/controller/api/constant/apiLink";
import { AdminSimpleResponse } from "@/types";

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

export interface AdminModule {
  id?: number | string;
  module?: string; // The module name/code (from API)
  actions?: unknown[] | null; // Array of actions or null
  // Optional fields that might exist
  name?: string;
  code?: string;
  description?: string;
  status?: number;
  created?: string;
  updated?: string;
}

export interface AdminModulesListResponse {
  status: number;
  message: AdminModule[];
  modules?: AdminModule[];
  data?: {
    modules?: AdminModule[];
    data?: AdminModule[];
  };
}

export interface AdminCreateModuleRequest {
  module: string; // The module name/code
  description?: string;
}

export const getAdminModulesList = async (
  apiKey: string
): Promise<AdminModulesListResponse | undefined> => {
  try {
    const response = await billingApiRequest<Record<string, never>, AdminModulesListResponse>({
      method: "POST",
      endpoint: adminModules.list,
      data: {},
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for admin modules list.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error retrieving admin modules list.");
  }
};

export const createAdminModule = async (
  data: AdminCreateModuleRequest,
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    const response = await billingApiRequest<AdminCreateModuleRequest, AdminSimpleResponse>({
      method: "POST",
      endpoint: adminModules.create,
      data,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for module creation.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error creating module.");
  }
};

export const deleteAdminModule = async (
  data: { id: string | number } | { module_id: string | number },
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    // Backend might expect 'id' or 'module_id', try both
    const payload = "id" in data ? { id: data.id } : { module_id: data.module_id };
    const response = await billingApiRequest<
      { id?: string | number; module_id?: string | number },
      AdminSimpleResponse
    >({
      method: "POST",
      endpoint: adminModules.delete,
      data: payload,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for module deletion.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error deleting module.");
  }
};
