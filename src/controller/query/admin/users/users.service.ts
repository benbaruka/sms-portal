import axios from "axios";
import { billingApiRequest } from "@/controller/api/config/config";
import { adminUsers } from "@/controller/api/constant/apiLink";
import {
  AdminCreateUserRequest,
  AdminSimpleResponse,
  AdminUpdateUserRequest,
  AdminUserClientsResponse,
  AdminUserDetailsRequest,
  AdminUserDetailsResponse,
  AdminUserRolesResponse,
  AdminUserStatusRequest,
  AdminUsersListRequest,
  AdminUsersListResponse,
} from "@/types";

const handleAxiosError = (error: unknown, fallbackMessage: string) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      // Extraire le message d'erreur du backend
      let errorMessage = fallbackMessage;
      if (typeof errorData === "string") {
        errorMessage = errorData;
      } else if (errorData && typeof errorData === "object") {
        errorMessage =
          (errorData as { message?: string }).message ||
          (errorData as { error?: string }).error ||
          fallbackMessage;
      }

      // Log détaillé pour debug

      // Messages spécifiques selon le code de statut
      if (status === 401) {
        throw new Error(
          `Unauthorized: ${errorMessage || "You don't have permission to perform this action. Please check your role permissions."}`
        );
      } else if (status === 403) {
        throw new Error(
          `Forbidden: ${errorMessage || "Access denied. Your account may not have the required permissions."}`
        );
      } else if (status === 400) {
        throw new Error(`Bad Request: ${errorMessage}`);
      } else if (status === 404) {
        throw new Error(`User not found: ${errorMessage || "The user may have been deleted."}`);
      } else if (status === 422) {
        throw new Error(
          `Validation Error: ${errorMessage || "Invalid data provided. Please check the user ID and status values."}`
        );
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

export const getAdminUsersList = async (
  data: AdminUsersListRequest,
  apiKey: string
): Promise<AdminUsersListResponse | undefined> => {
  try {
    // /auth/user/all accepte VueTable format
    // Construire le payload minimal pour éviter les erreurs 500
    // Le backend peut être sensible aux champs vides ou undefined
    const payload: Record<string, unknown> = {
      page: data.page || 1,
      per_page: data.per_page || 10,
    };

    // Ajouter search seulement s'il n'est pas vide
    if (data.search && typeof data.search === "string" && data.search.trim()) {
      payload.search = data.search.trim();
    }

    // Ajouter sort seulement s'il est défini (le backend peut avoir une valeur par défaut)
    if (data.sort && typeof data.sort === "string" && data.sort.trim()) {
      payload.sort = data.sort.trim();
    }

    // Ajouter status seulement s'il est défini et valide (pas "ALL" ou undefined)
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

    // Ajouter role_id seulement s'il est défini et valide (pas "ALL" ou undefined)
    if (
      data.role_id !== undefined &&
      data.role_id !== null &&
      data.role_id !== "ALL" &&
      String(data.role_id).trim() !== ""
    ) {
      payload.role_id = data.role_id;
    }

    const response = await billingApiRequest<Record<string, unknown>, AdminUsersListResponse>({
      method: "POST",
      endpoint: adminUsers.list, // /auth/user/all accepte VueTable
      data: payload,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for admin users list.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error retrieving admin users list.");
  }
};

export const createAdminUser = async (
  data: AdminCreateUserRequest,
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    // Le backend attend fullname (pas full_name), email, phone (pas msisdn), password, role_id, client_id
    const backendPayload = {
      fullname: data.full_name.trim(),
      email: data.email.trim(),
      phone: data.msisdn.trim(), // Le backend attend "phone" pas "msisdn"
      password: data.password,
      role_id: typeof data.role_id === "string" ? parseInt(data.role_id, 10) : Number(data.role_id),
      client_id:
        typeof data.client_id === "string" ? parseInt(data.client_id, 10) : Number(data.client_id),
    };

    const response = await billingApiRequest<typeof backendPayload, AdminSimpleResponse>({
      method: "POST",
      endpoint: adminUsers.create,
      data: backendPayload,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for admin user creation.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error creating admin user.");
  }
};

export const updateAdminUser = async (
  data: AdminUpdateUserRequest,
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    // Le backend attend fullname (pas full_name), email, phone (pas msisdn), role_id, client_id
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
      backendPayload.phone = data.msisdn.trim(); // Le backend attend "phone" pas "msisdn"
    }
    if (data.password !== undefined) {
      backendPayload.password = data.password;
    }
    if (data.role_id !== undefined) {
      backendPayload.role_id =
        typeof data.role_id === "string" ? parseInt(data.role_id, 10) : Number(data.role_id);
    }
    if (data.client_id !== undefined) {
      backendPayload.client_id =
        typeof data.client_id === "string" ? parseInt(data.client_id, 10) : Number(data.client_id);
    }

    const response = await billingApiRequest<typeof backendPayload, AdminSimpleResponse>({
      method: "POST",
      endpoint: adminUsers.update,
      data: backendPayload,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for admin user update.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error updating admin user.");
  }
};

export const getAdminUserDetails = async (
  data: AdminUserDetailsRequest,
  apiKey: string
): Promise<AdminUserDetailsResponse | undefined> => {
  try {
    // UserAll accepte VueTable format - utiliser search pour filtrer par user_id
    const response = await billingApiRequest<
      {
        page?: number;
        per_page?: number;
        search?: string;
      },
      AdminUserDetailsResponse
    >({
      method: "POST",
      endpoint: adminUsers.list, // Utiliser /auth/user/all (accepte VueTable)
      data: {
        page: 1,
        per_page: 1,
        search: data.user_id?.toString() || "", // Rechercher par user_id
      },
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for admin user details.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error retrieving admin user details.");
  }
};

export const changeAdminUserStatus = async (
  data: AdminUserStatusRequest,
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    // S'assurer que user_id est un nombre et status est un nombre (0 ou 1)
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

    // Le backend a un bug dans /auth/user/update/status : il vérifie "if status == 0"
    // pour détecter un statut manquant, ce qui bloque l'envoi de status: 0 (inactif).
    // Solution : utiliser /auth/user/update qui utilise -1 comme valeur par défaut,
    // ce qui permet de distinguer "champ manquant" de "champ = 0"
    const payload: { user_id: number; status: number } = {
      user_id: userId,
      status: statusValue, // Envoyer 0 ou 1 comme nombre - UserUpdate utilise -1 comme défaut
    };

    const response = await billingApiRequest<typeof payload, AdminSimpleResponse>({
      method: "POST",
      endpoint: adminUsers.update, // Utiliser /auth/user/update au lieu de /auth/user/update/status
      data: payload,
      apiKey,
    });

    if (!response?.data) {
      throw new Error("No server response for admin user status update.");
    }

    return response.data;
  } catch (error) {
    // Log l'erreur complète pour debug
    handleAxiosError(error, "Error changing admin user status.");
  }
};

export const getAdminUserRoles = async (
  apiKey: string
): Promise<AdminUserRolesResponse | undefined> => {
  try {
    const response = await billingApiRequest<Record<string, never>, AdminUserRolesResponse>({
      method: "POST",
      endpoint: adminUsers.roles,
      data: {},
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for admin user roles.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error retrieving admin user roles.");
  }
};

export const getAdminUserClients = async (
  apiKey: string
): Promise<AdminUserClientsResponse | undefined> => {
  try {
    const response = await billingApiRequest<Record<string, never>, AdminUserClientsResponse>({
      method: "POST",
      endpoint: adminUsers.clients,
      data: {},
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for admin user clients.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error retrieving admin user clients.");
  }
};
