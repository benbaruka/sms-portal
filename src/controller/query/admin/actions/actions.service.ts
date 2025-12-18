import axios from "axios";
import { billingApiRequest } from "@/controller/api/config/config";
import { adminActions } from "@/controller/api/constant/apiLink";
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

export interface AdminAction {
  id?: number | string;
  name?: string; // The action name (e.g., "create", "read", "update", "delete")
  // Optional fields that might exist
  code?: string;
  description?: string;
  module_id?: number | string;
  module?: string;
  status?: number;
  created?: string;
  updated?: string;
}

export interface AdminActionsListResponse {
  status: number;
  message: AdminAction[];
  actions?: AdminAction[];
  data?: {
    actions?: AdminAction[];
    data?: AdminAction[];
  };
}

export interface AdminCreateActionRequest {
  action: string; // The action name (e.g., "create", "read", "update", "delete") - Backend expects "action" not "name"
  description?: string;
}

export const getAdminActionsList = async (
  apiKey: string
): Promise<AdminActionsListResponse | undefined> => {
  try {
    const response = await billingApiRequest<Record<string, never>, AdminActionsListResponse>({
      method: "POST",
      endpoint: adminActions.list,
      data: {},
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for admin actions list.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error retrieving admin actions list.");
  }
};

export const createAdminAction = async (
  data: AdminCreateActionRequest,
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    // Backend expects "action" field, not "name"
    // Validate that action is provided and not empty
    const actionValue = data.action || (data as unknown as { name?: string }).name;
    if (!actionValue || typeof actionValue !== "string" || !actionValue.trim()) {
      throw new Error("Action name is required and cannot be empty.");
    }

    // Prepare payload - backend expects "action" field
    const payload: AdminCreateActionRequest = {
      action: actionValue.trim(),
    };

    // Only include description if it's provided and not empty
    if (data.description && typeof data.description === "string" && data.description.trim()) {
      payload.description = data.description.trim();
    }

    // Log the data being sent for debugging

    const response = await billingApiRequest<AdminCreateActionRequest, AdminSimpleResponse>({
      method: "POST",
      endpoint: adminActions.create,
      data: payload,
      apiKey,
    });

    if (!response?.data) {
      throw new Error("No server response for action creation.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error creating action.");
  }
};

export const deleteAdminAction = async (
  data: { id: string | number } | { action_id: string | number },
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    // Backend might expect 'id' or 'action_id', try both
    const payload = "id" in data ? { id: data.id } : { action_id: data.action_id };
    const response = await billingApiRequest<
      { id?: string | number; action_id?: string | number },
      AdminSimpleResponse
    >({
      method: "POST",
      endpoint: adminActions.delete,
      data: payload,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for action deletion.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error deleting action.");
  }
};
