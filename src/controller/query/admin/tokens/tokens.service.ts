import axios from "axios";
import { billingApiRequest } from "@/controller/api/config/config";
import { adminTokens } from "@/controller/api/constant/apiLink";
import {
  AdminCreateTokenRequest,
  AdminSimpleResponse,
  AdminTokenClientsResponse,
  AdminTokenKYBStatusRequest,
  AdminTokenKYBStatusResponse,
  AdminTokenStatusRequest,
  AdminTokensListRequest,
  AdminTokensListResponse,
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

export const getAdminTokensList = async (
  data: AdminTokensListRequest,
  apiKey: string
): Promise<AdminTokensListResponse | undefined> => {
  try {
    // ⚠️ Endpoint /admin/token/list n'existe pas dans le backend
    // Utiliser /client/tokens/list avec client_id: 0 pour tous les tokens
    // OU créer l'endpoint dans le backend
    const response = await billingApiRequest<
      { client_id?: number; page?: number; per_page?: number },
      AdminTokensListResponse
    >({
      method: "POST",
      endpoint: `/client/tokens/list`, // Utiliser client/tokens/list temporairement
      data: {
        client_id: data.client_id || 0, // 0 = tous les clients
        page: data.page || 1,
        per_page: data.per_page || 10,
      },
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for admin tokens list.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error retrieving admin tokens list.");
  }
};

export const createAdminToken = async (
  data: AdminCreateTokenRequest,
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    // ⚠️ Endpoint /admin/token/create n'existe pas dans le backend
    // Utiliser GET /auth/api-key pour générer un token
    // Note: GET /auth/api-key génère un token pour le client actuel
    const response = await billingApiRequest<Record<string, never>, AdminSimpleResponse>({
      method: "GET", // GET au lieu de POST
      endpoint: adminTokens.create, // Utiliser /auth/api-key
      data: {}, // Pas de data pour GET
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for admin token creation.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error creating admin token.");
  }
};

export const changeAdminTokenStatus = async (
  data: AdminTokenStatusRequest,
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    // Utiliser /client/tokens/delete pour révoquer un token
    const response = await billingApiRequest<{ token_id: string | number }, AdminSimpleResponse>({
      method: "POST",
      endpoint: adminTokens.revoke, // Utiliser /client/tokens/delete
      data: {
        token_id: data.token_id, // Passer token_id
      },
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for admin token status update.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error updating admin token status.");
  }
};

export const getAdminTokenClients = async (
  apiKey: string
): Promise<AdminTokenClientsResponse | undefined> => {
  try {
    const response = await billingApiRequest<Record<string, never>, AdminTokenClientsResponse>({
      method: "POST",
      endpoint: adminTokens.clients,
      data: {},
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for admin token clients.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error retrieving clients for token creation.");
  }
};

export const getAdminTokenKYBStatus = async (
  data: AdminTokenKYBStatusRequest,
  apiKey: string
): Promise<AdminTokenKYBStatusResponse | undefined> => {
  try {
    // Utiliser /admin/kyb/history avec client_id dans le payload
    const response = await billingApiRequest<{ client_id: number }, AdminTokenKYBStatusResponse>({
      method: "POST",
      endpoint: adminTokens.kybStatus, // /admin/kyb/history
      data: {
        client_id: data.client_id || 0,
      },
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for admin token KYB status.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error retrieving KYB status for clients.");
  }
};
