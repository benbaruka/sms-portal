import axios from "axios";
import { billingApiRequest } from "@/controller/api/config/config";
import { adminKyb } from "@/controller/api/constant/apiLink";
import {
  AdminKYBDecisionRequest,
  AdminKYBDetailsRequest,
  AdminKYBDetailsResponse,
  AdminKYBListRequest,
  AdminKYBListResponse,
} from "@/types";

const handleAxiosError = (error: unknown, fallbackMessage: string) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const status = error.response.status;
      const statusText = error.response.statusText;
      const message =
        error.response.data?.message || error.response.data?.error || statusText || fallbackMessage;

      // Gestion spéciale pour les erreurs 503 (Service Unavailable)
      if (status === 503) {
        throw new Error(
          `Service temporarily unavailable (503). The backend service may be down or overloaded. Please try again later. Original error: ${message}`
        );
      }

      // Gestion spéciale pour les erreurs 500 (Internal Server Error)
      if (status === 500) {
        throw new Error(`Internal server error (500). ${message}`);
      }

      throw new Error(message);
    }
    if (error.request) {
      throw new Error("No server response. Please check your internet connection.");
    }
  }
  throw new Error(fallbackMessage);
};

export const getAdminKYBPendings = async (
  data: AdminKYBListRequest,
  apiKey: string
): Promise<AdminKYBListResponse | undefined> => {
  try {
    // D'après la documentation backend (kyb.go ligne 377-386):
    // - Le backend convertit le body en VueTable
    // - Il extrait kyb_status du body et le met dans payload.Search
    // - Format attendu: { page, per_page, kyb_status, search? }
    // Format exact des tests backend (controllers_test.go ligne 9000-9003):
    // { "page": 1, "per_page": 10, "kyb_status": "PENDING" }
    const payload: Record<string, string | number> = {
      page: data.page || 1,
      per_page: data.per_page || 10,
      kyb_status: "PENDING", // REQUIS - Backend attend kyb_status dans le payload
    };

    // Ajouter search seulement si non vide (optionnel)
    if (data.search && typeof data.search === "string" && data.search.trim()) {
      payload.search = data.search.trim();
    }

    const response = await billingApiRequest<Record<string, string | number>, AdminKYBListResponse>(
      {
        method: "POST",
        endpoint: adminKyb.clients, // /admin/kyb/clients
        data: payload,
        apiKey,
      }
    );

    if (!response?.data) {
      throw new Error("No server response for pending KYB list.");
    }

    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error retrieving pending KYB list.");
  }
};

// Fonction générique pour récupérer les clients par statut KYB
export const getAdminKYBClientsByStatus = async (
  data: AdminKYBListRequest & { kyb_status: "PENDING" | "APPROVED" | "REJECTED" | "LEGACY" },
  apiKey: string
): Promise<AdminKYBListResponse | undefined> => {
  try {
    // Format attendu par le backend: { page, per_page, kyb_status, search? }
    const payload: Record<string, string | number> = {
      page: data.page || 1,
      per_page: data.per_page || 10,
      kyb_status: data.kyb_status, // REQUIS - Backend attend kyb_status dans le payload
    };

    // Ajouter search seulement si non vide (optionnel)
    if (data.search && typeof data.search === "string" && data.search.trim()) {
      payload.search = data.search.trim();
    }

    const response = await billingApiRequest<Record<string, string | number>, AdminKYBListResponse>(
      {
        method: "POST",
        endpoint: adminKyb.clients, // /admin/kyb/clients
        data: payload,
        apiKey,
      }
    );

    if (!response?.data) {
      throw new Error("No server response for KYB clients list.");
    }

    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error retrieving KYB clients list.");
  }
};

// Alias pour récupérer l'historique (APPROVED + REJECTED + LEGACY)
export const getAdminKYBHistory = async (
  data: AdminKYBListRequest & { kyb_status?: "APPROVED" | "REJECTED" | "LEGACY" },
  apiKey: string
): Promise<AdminKYBListResponse | undefined> => {
  // Utiliser kyb_status s'il est fourni, sinon utiliser APPROVED par défaut
  const status = data.kyb_status || "APPROVED";

  return getAdminKYBClientsByStatus(
    {
      ...data,
      kyb_status: status,
    },
    apiKey
  );
};

export const getAdminKYBDetails = async (
  data: AdminKYBDetailsRequest,
  apiKey: string
): Promise<AdminKYBDetailsResponse | undefined> => {
  try {
    // Backend attend client_id (voir kyb.go ligne 406)
    // Dans la liste KYB, l'id correspond au client_id
    const clientId = data.kyb_id || data.client_id;
    if (!clientId) {
      throw new Error("Client ID is required");
    }

    // Convertir en nombre pour validation
    const clientIdNum = typeof clientId === "string" ? parseInt(clientId, 10) : Number(clientId);
    if (isNaN(clientIdNum) || clientIdNum <= 0) {
      throw new Error("Client ID must be a valid positive number");
    }

    const response = await billingApiRequest<{ client_id: number }, AdminKYBDetailsResponse>({
      method: "POST",
      endpoint: adminKyb.history, // Utilise /admin/kyb/history avec client_id
      data: {
        client_id: clientIdNum,
      },
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for KYB details.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error retrieving KYB details.");
  }
};

export const approveAdminKYB = async (data: AdminKYBDecisionRequest, apiKey: string) => {
  try {
    // Backend attend client_id (pas kyb_id) et message (pas notes)
    // Dans la liste KYB, l'id correspond au client_id
    const clientId = data.kyb_id || data.client_id;
    if (!clientId) {
      throw new Error("Client ID is required");
    }

    // Convertir en nombre pour validation
    const clientIdNum = typeof clientId === "string" ? parseInt(clientId, 10) : Number(clientId);
    if (isNaN(clientIdNum) || clientIdNum <= 0) {
      throw new Error("Client ID must be a valid positive number");
    }

    // Backend attend "message" et non "notes" (voir kyb.go ligne 45)
    const response = await billingApiRequest<
      { client_id: number; message?: string },
      AdminKYBDetailsResponse
    >({
      method: "POST",
      endpoint: adminKyb.approve,
      data: {
        client_id: clientIdNum,
        message: data.notes || undefined, // Utiliser notes comme message (backend accepte message)
      },
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for KYB approval.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error approving KYB request.");
  }
};

export const rejectAdminKYB = async (data: AdminKYBDecisionRequest, apiKey: string) => {
  try {
    // Backend attend client_id (pas kyb_id) et message (pas notes)
    // Dans la liste KYB, l'id correspond au client_id
    const clientId = data.kyb_id || data.client_id;
    if (!clientId) {
      throw new Error("Client ID is required");
    }

    // Convertir en nombre pour validation
    const clientIdNum = typeof clientId === "string" ? parseInt(clientId, 10) : Number(clientId);
    if (isNaN(clientIdNum) || clientIdNum <= 0) {
      throw new Error("Client ID must be a valid positive number");
    }

    // Backend attend "message" et non "notes" (voir kyb.go ligne 229)
    // Le message est REQUIRED pour le rejet (voir ligne 230-232)
    if (!data.notes || data.notes.trim().length === 0) {
      throw new Error("Rejection message is required");
    }

    const response = await billingApiRequest<
      { client_id: number; message: string },
      AdminKYBDetailsResponse
    >({
      method: "POST",
      endpoint: adminKyb.reject,
      data: {
        client_id: clientIdNum,
        message: data.notes.trim(), // Utiliser notes comme message (backend attend message)
      },
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for KYB rejection.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error rejecting KYB request.");
  }
};

// Aliases for backward compatibility
export const getAdminKybPending = getAdminKYBPendings;
export const approveAdminKyb = approveAdminKYB;
