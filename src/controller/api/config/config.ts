import axios, { AxiosRequestConfig, AxiosResponse, AxiosResponseHeaders, Method } from "axios";
import { baseURL } from "./baseUrl";
interface ApiResponse<ResponseType> {
  data: ResponseType;
  status: number;
  statusText: string;
  headers: AxiosResponseHeaders;
  config: AxiosRequestConfig;
  request?: unknown;
}
export const billingApi = axios.create({
  baseURL: baseURL || "",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds timeout to prevent 504 Gateway Timeout errors
});

// Intercepteur pour masquer les informations sensibles dans les logs et l'inspecteur
// Safe setup for test environments - only set up interceptors if they exist
try {
  if (
    billingApi &&
    billingApi.interceptors &&
    typeof billingApi.interceptors.request.use === "function"
  ) {
    billingApi.interceptors.request.use(
      (config) => {
        // Masquer les tokens et API keys dans les headers pour la sécurité
        if (config.headers) {
          // Créer une copie des headers sans les informations sensibles pour les logs
          const sanitizedHeaders = { ...config.headers };

          // Masquer Authorization token
          if (sanitizedHeaders.Authorization) {
            const authValue = sanitizedHeaders.Authorization as string;
            sanitizedHeaders.Authorization = authValue.startsWith("Bearer ")
              ? `Bearer ***${authValue.slice(-4)}`
              : `***${authValue.slice(-4)}`;
          }

          // Masquer API key
          if (sanitizedHeaders["api-key"]) {
            const apiKey = sanitizedHeaders["api-key"] as string;
            sanitizedHeaders["api-key"] = `***${apiKey.slice(-4)}`;
          }

          // En production, ne pas logger les headers sensibles
          if (process.env.NODE_ENV === "production") {
            // Supprimer complètement les headers sensibles des logs en production
            delete sanitizedHeaders.Authorization;
            delete sanitizedHeaders["api-key"];
          }
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Intercepteur de réponse pour masquer les données sensibles et gérer les erreurs de token expiré
    billingApi.interceptors.response.use(
      (response) => {
        // En production, masquer les données sensibles dans les réponses
        if (process.env.NODE_ENV === "production" && response.config) {
          // Ne pas exposer les tokens dans les réponses
          if (response.data && typeof response.data === "object") {
            const sanitizedData = { ...response.data };
            if (sanitizedData.token) {
              sanitizedData.token = "***HIDDEN***";
            }
            if (sanitizedData.apiKey) {
              sanitizedData.apiKey = "***HIDDEN***";
            }
          }
        }
        return response;
      },
      (error) => {
        // Vérifier si l'erreur contient le message de token expiré
        if (axios.isAxiosError(error)) {
          const errorMessage =
            error.response?.data?.message || error.response?.data?.error || error.message || "";

          const isTokenExpired =
            typeof errorMessage === "string" &&
            (errorMessage.toLowerCase().includes("token has expired") ||
              errorMessage.toLowerCase().includes("token expired") ||
              errorMessage.toLowerCase().includes("please generate a new one") ||
              errorMessage.toLowerCase().includes("your token has expired"));

          if (isTokenExpired && typeof window !== "undefined") {
            // Nettoyer toutes les données de session
            try {
              // Supprimer tous les éléments du localStorage
              localStorage.clear();

              // Supprimer tous les éléments du sessionStorage
              sessionStorage.clear();

              // Supprimer tous les cookies
              document.cookie.split(";").forEach((c) => {
                const cookieName = c.split("=")[0].trim();
                document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
              });

              // Rediriger vers signin
              window.location.href = "/signin";
            } catch (cleanupError) {
              // Rediriger quand même vers signin
              if (typeof window !== "undefined") {
                window.location.href = "/signin";
              }
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }
} catch (error) {
  // Silently fail in test environments if interceptors can't be set up
}
interface ApiRequestParams<RequestType> {
  method: Method;
  endpoint: string;
  data?: RequestType;
  params?: Record<string, string | number | boolean>;
  id?: string | number;
  token?: string;
}
/**
 * Requête API générale avec authentification Bearer
 * ⚠️ IMPORTANT: Le token est passé depuis le client (localStorage/cookie), pas depuis le serveur
 *
 * @param token - Token d'authentification récupéré côté client (via getToken())
 * @see doc/TOKEN_MANAGEMENT.md pour la documentation complète
 */
const apiRequest = async <RequestType, ResponseType>({
  method,
  endpoint,
  data,
  params,
  id,
  token,
}: ApiRequestParams<RequestType>): Promise<ApiResponse<ResponseType>> => {
  const url = id ? `${endpoint}/${id}` : endpoint;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  // Token côté client ajouté dans header Authorization
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const config: AxiosRequestConfig = {
    method,
    url,
    headers,
    data,
    params,
  };
  try {
    const response: AxiosResponse<ResponseType> = await billingApi(config);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as AxiosResponseHeaders,
      config: response.config,
      request: response.request,
    };
  } catch (error) {
    throw error;
  }
};
interface BillingApiRequestParams<RequestType> {
  method: Method;
  endpoint: string;
  data?: RequestType;
  params?: Record<string, string | number | boolean>;
  apiKey?: string;
}
/**
 * Requête API admin avec authentification api-key
 * ⚠️ IMPORTANT: L'API Key est récupérée depuis localStorage côté client, pas depuis le serveur
 * Utilisé pour les endpoints admin (billing-stats, token management, etc.)
 *
 * @param apiKey - API Key récupérée côté client (via localStorage.getItem('apiKey'))
 * @see doc/TOKEN_MANAGEMENT.md pour la documentation complète
 */
export const billingApiRequest = async <RequestType, ResponseType>({
  method,
  endpoint,
  data,
  params,
  apiKey,
}: BillingApiRequestParams<RequestType>): Promise<ApiResponse<ResponseType>> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  // API Key côté client ajoutée dans header api-key
  if (apiKey) {
    headers["api-key"] = apiKey;
  }
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const config: AxiosRequestConfig = {
    method,
    url: normalizedEndpoint,
    headers,
    data,
    params,
  };
  try {
    const response: AxiosResponse<ResponseType> = await billingApi(config);

    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as AxiosResponseHeaders,
      config: response.config,
      request: response.request,
    };
  } catch (error) {
    throw error;
  }
};
export default apiRequest;
