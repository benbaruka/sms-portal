import { billingApiRequest } from "@/controller/api/config/config";
import { clientUsers } from "@/controller/api/constant/apiLink";
import {
  ClientCreateUserRequest,
  ClientSimpleResponse,
  ClientUpdateUserRequest,
  ClientUserRolesResponse,
  ClientUserStatusRequest,
  ClientUsersListRequest,
  ClientUsersListResponse,
} from "@/types";
import axios from "axios";

const handleAxiosError = (error: unknown, fallbackMessage: string) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      let errorMessage = fallbackMessage;
      if (typeof errorData === "string") {
        errorMessage = errorData;
      } else if (errorData && typeof errorData === "object") {
        errorMessage =
          (errorData as { message?: string }).message ||
          (errorData as { error?: string }).error ||
          fallbackMessage;
      }

      if (status === 401) {
        throw new Error("Unauthorized: You don't have permission to perform this action.");
      } else if (status === 403) {
        throw new Error("Forbidden: Access denied.");
      } else if (status === 400) {
        throw new Error(`Bad Request: ${errorMessage}`);
      } else if (status === 422) {
        // 422 Unprocessable Entity - validation error
        throw new Error(`Validation Error: ${errorMessage}`);
      } else if (status === 404) {
        throw new Error("User not found.");
      } else if (status === 500) {
        throw new Error(`Server Error: ${errorMessage}`);
      } else {
        throw new Error(errorMessage);
      }
    }
    if (error.request) {
      throw new Error("No server response. Please check your internet connection.");
    }
  }
  throw new Error(fallbackMessage);
};

export const getClientUsersList = async (
  data: ClientUsersListRequest,
  apiKey: string
): Promise<ClientUsersListResponse | undefined> => {
  try {
    const payload: Record<string, unknown> = {
      page: data.page || 1,
      per_page: data.per_page || 10,
    };

    if (data.search && typeof data.search === "string" && data.search.trim()) {
      payload.search = data.search.trim();
    }

    if (data.sort && typeof data.sort === "string" && data.sort.trim()) {
      payload.sort = data.sort.trim();
    }

    if (
      data.status !== undefined &&
      data.status !== null &&
      data.status !== "ALL" &&
      String(data.status).trim() !== ""
    ) {
      const statusValue = typeof data.status === "string" ? parseInt(data.status) : data.status;
      if (!isNaN(statusValue as number)) {
        payload.status = statusValue;
      }
    }

    if (
      data.role_id !== undefined &&
      data.role_id !== null &&
      data.role_id !== "ALL" &&
      String(data.role_id).trim() !== ""
    ) {
      payload.role_id = data.role_id;
    }

    const response = await billingApiRequest<Record<string, unknown>, ClientUsersListResponse>({
      method: "POST",
      endpoint: clientUsers.table, // /client/user/table avec VueTable format
      data: payload,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for client users list.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error retrieving client users list.");
  }
};

export const createClientUser = async (
  data: ClientCreateUserRequest,
  apiKey: string
): Promise<ClientSimpleResponse | undefined> => {
  try {
    // Validation des champs requis
    const fullname = data.full_name?.trim();
    const email = data.email?.trim();
    const phone = data.msisdn?.trim();
    const password = data.password;
    const roleId =
      typeof data.role_id === "string" ? parseInt(data.role_id, 10) : Number(data.role_id);

    if (!fullname || fullname.length === 0) {
      throw new Error("Full name is required.");
    }
    if (!email || email.length === 0) {
      throw new Error("Email is required.");
    }
    if (!phone || phone.length === 0) {
      throw new Error("Phone number is required.");
    }
    if (!password || password.length === 0) {
      throw new Error("Password is required.");
    }
    if (isNaN(roleId) || roleId <= 0) {
      throw new Error("Valid role ID is required.");
    }

    // D'après le code backend (auth_user.go ligne 37-40), le backend attend :
    // - fullname (pas full_name)
    // - email
    // - msisdn (pas phone) - le message d'erreur dit "phone number" mais le code vérifie "msisdn"
    // Le téléphone doit avoir le + selon le signup
    const phoneFormatted = phone.startsWith("+") ? phone : `+${phone}`;

    const backendPayload = {
      fullname: fullname, // Le backend attend "fullname" (voir auth_user.go ligne 37)
      email: email,
      msisdn: phoneFormatted, // Le backend attend "msisdn" (voir auth_user.go ligne 40), avec le +
      password: password,
      role_id: roleId,
    };

    // Log pour déboguer

    const response = await billingApiRequest<typeof backendPayload, ClientSimpleResponse>({
      method: "POST",
      endpoint: clientUsers.create,
      data: backendPayload,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for client user creation.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error creating client user.");
  }
};

export const updateClientUser = async (
  data: ClientUpdateUserRequest,
  apiKey: string
): Promise<ClientSimpleResponse | undefined> => {
  try {
    // Le backend attend fullname (pas full_name), email, phone (pas msisdn), role_id
    const backendPayload: Record<string, unknown> = {
      user_id: typeof data.user_id === "string" ? parseInt(data.user_id, 10) : Number(data.user_id),
    };

    if (data.full_name !== undefined) {
      backendPayload.fullname = data.full_name.trim();
    }
    if (data.email !== undefined) {
      backendPayload.email = data.email.trim();
    }
    if (data.msisdn !== undefined) {
      backendPayload.msisdn = data.msisdn.trim(); // Le backend attend "msisdn" (voir auth_user.go)
    }
    if (data.password !== undefined) {
      backendPayload.password = data.password;
    }
    if (data.role_id !== undefined) {
      backendPayload.role_id =
        typeof data.role_id === "string" ? parseInt(data.role_id, 10) : Number(data.role_id);
    }

    const response = await billingApiRequest<typeof backendPayload, ClientSimpleResponse>({
      method: "POST",
      endpoint: clientUsers.update,
      data: backendPayload,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for client user update.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error updating client user.");
  }
};

export const changeClientUserStatus = async (
  data: ClientUserStatusRequest,
  apiKey: string
): Promise<ClientSimpleResponse | undefined> => {
  try {
    const userId =
      typeof data.user_id === "string" ? parseInt(data.user_id, 10) : Number(data.user_id);
    const statusValue =
      typeof data.status === "string" ? parseInt(data.status, 10) : Number(data.status);

    if (isNaN(userId) || userId <= 0) {
      throw new Error("Invalid user ID. Please provide a valid user identifier.");
    }

    if (isNaN(statusValue) || (statusValue !== 0 && statusValue !== 1)) {
      throw new Error("Invalid status. Status must be 0 (inactive) or 1 (active).");
    }

    const payload = {
      user_id: userId,
      status: statusValue,
    };

    const response = await billingApiRequest<typeof payload, ClientSimpleResponse>({
      method: "POST",
      endpoint: clientUsers.changeStatus,
      data: payload,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for client user status update.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error changing client user status.");
  }
};

export const getClientUserRoles = async (
  apiKey: string
): Promise<ClientUserRolesResponse | undefined> => {
  try {
    const response = await billingApiRequest<Record<string, never>, ClientUserRolesResponse>({
      method: "POST",
      endpoint: clientUsers.role,
      data: {},
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for client user roles.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error retrieving client user roles.");
  }
};
