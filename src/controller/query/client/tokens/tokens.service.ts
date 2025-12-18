import { billingApi, billingApiRequest } from "@/controller/api/config/config";
import { clientTokens } from "@/controller/api/constant/apiLink";
import {
  ClientCreateLiveTokenRequest,
  ClientCreateLiveTokenResponse,
  ClientDeleteTokenRequest,
  ClientKYBStatusResponse,
  ClientSimpleResponse,
  ClientTokensListRequest,
  ClientTokensListResponse,
} from "@/types";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

const handleAxiosError = (
  error: unknown,
  fallbackMessage: string,
  context?: "create" | "list" | "delete" | "kyb"
) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const status = error.response.status;
      const errorMessage = error.response.data?.message || fallbackMessage;

      // Messages user-friendly sans détails techniques
      if (status === 403) {
        if (errorMessage.includes("KYB") || errorMessage.includes("kyb")) {
          throw new Error(
            "Your account needs to be verified before you can manage tokens. Please check your KYB status and ensure it's approved."
          );
        }
        if (
          errorMessage.includes("authorization failed") ||
          errorMessage.includes("not authorized")
        ) {
          let actionMessage = "perform this action";
          if (context === "create") {
            actionMessage = "create tokens";
          } else if (context === "list") {
            actionMessage = "view tokens";
          } else if (context === "delete") {
            actionMessage = "delete tokens";
          } else if (context === "kyb") {
            actionMessage = "check verification status";
          }

          throw new Error(
            `You don't have permission to ${actionMessage}. Please sign out and sign in again, or contact support if the issue persists.`
          );
        }
      }

      if (status === 401) {
        throw new Error("Your session has expired. Please sign out and sign in again.");
      }

      // Messages user-friendly pour autres erreurs
      if (errorMessage.includes("KYB") || errorMessage.includes("kyb")) {
        throw new Error("Your account verification is required. Please check your KYB status.");
      }

      if (errorMessage.includes("authorization") || errorMessage.includes("not authorized")) {
        throw new Error(
          "You don't have permission to perform this action. Please contact support if you believe this is an error."
        );
      }

      // Message générique user-friendly
      throw new Error(
        "Something went wrong. Please try again or contact support if the problem continues."
      );
    }
    if (error.request) {
      throw new Error(
        "Unable to connect to the server. Please check your internet connection and try again."
      );
    }
  }
  throw new Error("An unexpected error occurred. Please try again or contact support.");
};

/**
 * Crée un token LIVE
 * L'endpoint /client/tokens/create-live nécessite :
 * 1. Une API key avec la permission "auth" pour "self"
 * 2. Le client doit être KYB approuvé
 *
 * ⚠️ IMPORTANT: Le backend n'accepte QUE l'API key (pas le token Bearer) pour cet endpoint
 */
export const createClientLiveToken = async (
  data: ClientCreateLiveTokenRequest,
  apiKey: string,
  authToken?: string
): Promise<ClientCreateLiveTokenResponse | undefined> => {
  try {
    if (!apiKey) {
      throw new Error("API key is required to create live tokens");
    }

    const normalizedEndpoint = clientTokens.createLive.startsWith("/")
      ? clientTokens.createLive
      : `/${clientTokens.createLive}`;

    // Utiliser le token Bearer en priorité car il a toutes les permissions de l'utilisateur
    // Le backend checkAuthApi() accepte "self", "auth" pour les tokens JWT (ligne 150 de auth.go)
    // L'API key peut ne pas avoir "self" dans ses permissions, donc on utilise Bearer en priorité
    if (authToken) {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          // Le backend GetToken() retourne le token tel quel et checkAuthApi() valide le JWT
          // Il faut envoyer juste le token JWT, pas "Bearer {token}"
          Authorization: authToken.startsWith("Bearer ")
            ? authToken.replace("Bearer ", "")
            : authToken,
        };

        const config: AxiosRequestConfig = {
          method: "POST",
          url: normalizedEndpoint,
          headers,
          data,
        };

        const response: AxiosResponse<ClientCreateLiveTokenResponse> = await billingApi(config);

        if (!response?.data) {
          throw new Error("No server response for client live token creation.");
        }
        return response.data;
      } catch (bearerError) {
        // Si erreur 401/403 avec Bearer token, essayer avec API key comme fallback
        const bearerStatus = axios.isAxiosError(bearerError) ? bearerError.response?.status : null;

        if ((bearerStatus === 401 || bearerStatus === 403) && apiKey) {
          try {
            const headers: Record<string, string> = {
              "Content-Type": "application/json",
              "api-key": apiKey,
            };

            const config: AxiosRequestConfig = {
              method: "POST",
              url: normalizedEndpoint,
              headers,
              data,
            };

            const response: AxiosResponse<ClientCreateLiveTokenResponse> = await billingApi(config);

            if (!response?.data) {
              throw new Error("No server response for client live token creation.");
            }
            return response.data;
          } catch (apiKeyError) {
            // Si les deux échouent, lancer l'erreur avec message détaillé
            const apiKeyStatus = axios.isAxiosError(apiKeyError)
              ? apiKeyError.response?.status
              : null;
            const errorMessage = axios.isAxiosError(bearerError)
              ? bearerError.response?.data?.message ||
                bearerError.response?.data?.error ||
                "Authorization failed"
              : "Authorization failed";

            // Message user-friendly sans détails techniques
            const userFriendlyMessage =
              errorMessage.includes("KYB") || errorMessage.includes("kyb")
                ? "Your account needs to be verified before creating tokens. Please check your KYB status and ensure it's approved."
                : errorMessage.includes("authorization") || errorMessage.includes("not authorized")
                  ? "You don't have permission to create tokens. Please sign out and sign in again, or contact support if the issue persists."
                  : "Unable to create token. Please try again or contact support if the problem continues.";

            throw new Error(userFriendlyMessage);
          }
        }

        // Pour les autres erreurs avec Bearer, message user-friendly
        if (axios.isAxiosError(bearerError)) {
          const errorMessage =
            bearerError.response?.data?.message ||
            bearerError.response?.data?.error ||
            "Authorization failed";

          const userFriendlyMessage =
            errorMessage.includes("KYB") || errorMessage.includes("kyb")
              ? "Your account needs to be verified before creating tokens. Please check your KYB status."
              : errorMessage.includes("authorization") || errorMessage.includes("not authorized")
                ? "You don't have permission to create tokens. Please sign out and sign in again."
                : "Unable to create token. Please try again or contact support.";

          throw new Error(userFriendlyMessage);
        }
        throw new Error("Unable to create token. Please try again or contact support.");
      }
    }

    // Fallback sur API key si pas de token Bearer
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "api-key": apiKey,
    };

    const config: AxiosRequestConfig = {
      method: "POST",
      url: normalizedEndpoint,
      headers,
      data,
    };

    const response: AxiosResponse<ClientCreateLiveTokenResponse> = await billingApi(config);

    if (!response?.data) {
      throw new Error("No server response for client live token creation.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error creating client live token.", "create");
  }
};

export const deleteClientToken = async (
  data: ClientDeleteTokenRequest,
  apiKey: string
): Promise<ClientSimpleResponse | undefined> => {
  try {
    const response = await billingApiRequest<ClientDeleteTokenRequest, ClientSimpleResponse>({
      method: "POST",
      endpoint: clientTokens.delete,
      data,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for client token deletion.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error deleting client token.", "delete");
  }
};

export const getClientTokensList = async (
  data: ClientTokensListRequest,
  apiKey: string,
  authToken?: string
): Promise<ClientTokensListResponse | undefined> => {
  try {
    const normalizedEndpoint = clientTokens.list.startsWith("/")
      ? clientTokens.list
      : `/${clientTokens.list}`;

    // Utiliser le token Bearer en priorité (a toutes les permissions)
    // Le backend accepte Authorization header pour les endpoints avec "self", "auth"
    if (authToken) {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          // Le backend GetToken() retourne le token tel quel et checkAuthApi() valide le JWT
          // Il faut envoyer juste le token JWT, pas "Bearer {token}"
          Authorization: authToken.startsWith("Bearer ")
            ? authToken.replace("Bearer ", "")
            : authToken,
        };

        const config: AxiosRequestConfig = {
          method: "POST",
          url: normalizedEndpoint,
          headers,
          data,
        };

        const response: AxiosResponse<ClientTokensListResponse> = await billingApi(config);

        if (!response?.data) {
          throw new Error("No server response for client tokens list.");
        }
        return response.data;
      } catch (bearerError) {
        // Si erreur avec Bearer token, essayer avec API key comme fallback
        if (!axios.isAxiosError(bearerError) || bearerError.response?.status !== 401) {
          // Si ce n'est pas une erreur 401, réessayer avec API key
          const response = await billingApiRequest<
            ClientTokensListRequest,
            ClientTokensListResponse
          >({
            method: "POST",
            endpoint: clientTokens.list,
            data,
            apiKey,
          });
          if (!response?.data) {
            throw new Error("No server response for client tokens list.");
          }
          return response.data;
        }
        throw bearerError;
      }
    }

    // Fallback sur API key si pas de token Bearer
    const response = await billingApiRequest<ClientTokensListRequest, ClientTokensListResponse>({
      method: "POST",
      endpoint: clientTokens.list,
      data,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for client tokens list.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error retrieving client tokens list.", "list");
  }
};

export const getClientKYBStatus = async (
  apiKey: string,
  authToken?: string
): Promise<ClientKYBStatusResponse | undefined> => {
  try {
    const normalizedEndpoint = clientTokens.kybStatus.startsWith("/")
      ? clientTokens.kybStatus
      : `/${clientTokens.kybStatus}`;

    // Utiliser le token Bearer en priorité (a toutes les permissions)
    // Le backend accepte Authorization header pour les endpoints avec "self", "auth"
    if (authToken) {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          // Le backend GetToken() retourne le token tel quel et checkAuthApi() valide le JWT
          // Il faut envoyer juste le token JWT, pas "Bearer {token}"
          Authorization: authToken.startsWith("Bearer ")
            ? authToken.replace("Bearer ", "")
            : authToken,
        };

        const config: AxiosRequestConfig = {
          method: "POST",
          url: normalizedEndpoint,
          headers,
          data: {},
        };

        const response: AxiosResponse<ClientKYBStatusResponse> = await billingApi(config);

        if (!response?.data) {
          throw new Error("No server response for client KYB status.");
        }
        return response.data;
      } catch (bearerError) {
        // Si erreur avec Bearer token, essayer avec API key comme fallback
        if (!axios.isAxiosError(bearerError) || bearerError.response?.status !== 401) {
          // Si ce n'est pas une erreur 401, réessayer avec API key
          const response = await billingApiRequest<Record<string, never>, ClientKYBStatusResponse>({
            method: "POST",
            endpoint: clientTokens.kybStatus,
            data: {},
            apiKey,
          });
          if (!response?.data) {
            throw new Error("No server response for client KYB status.");
          }
          return response.data;
        }
        throw bearerError;
      }
    }

    // Fallback sur API key si pas de token Bearer
    const response = await billingApiRequest<Record<string, never>, ClientKYBStatusResponse>({
      method: "POST",
      endpoint: clientTokens.kybStatus,
      data: {},
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for client KYB status.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error retrieving client KYB status.", "kyb");
  }
};
