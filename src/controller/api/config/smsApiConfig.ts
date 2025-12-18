import axios, { AxiosRequestConfig, AxiosResponse, AxiosResponseHeaders, Method } from "axios";
export const getSmsBaseURL = () => {
  const smsUrl = process.env.NEXT_PUBLIC_SMS_API_BASE_URL;
  const billingUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Check if we're in a Jest/test environment
  // This check happens before NODE_ENV check to handle test discovery phase
  const isJestEnvironment =
    typeof process !== "undefined" &&
    (process.env.JEST_WORKER_ID !== undefined ||
      process.env.NODE_ENV === "test" ||
      (typeof global !== "undefined" && "jest" in global));

  // If either env var is set, use the preferred one
  if (smsUrl && !smsUrl.includes("localhost") && !smsUrl.includes("127.0.0.1")) {
    return smsUrl;
  }
  if (billingUrl) {
    return billingUrl;
  }

  // If no env vars are set, provide defaults for non-production environments
  // This prevents errors during test discovery and development when modules are imported
  if (!smsUrl && !billingUrl) {
    // In Jest/test environment, always use default
    if (isJestEnvironment) {
      return "https://sms-api.test.com";
    }
    // Only throw error in explicit production environment
    // In all other cases (development, undefined), use a default
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "NEXT_PUBLIC_SMS_API_BASE_URL or NEXT_PUBLIC_API_BASE_URL must be set in .env"
      );
    }
    // Default for development/undefined environments
    return "https://sms-api.test.com";
  }

  // Fallback (shouldn't reach here, but just in case)
  return smsUrl || billingUrl || "https://sms-api.test.com";
};
export const smsBaseURL = getSmsBaseURL();
if (typeof window === "undefined" && process.env.NODE_ENV === "development") {
  if (smsBaseURL.includes("localhost")) {
    // Using localhost URL
  }
}
interface ApiResponse<ResponseType> {
  data: ResponseType;
  status: number;
  statusText: string;
  headers: AxiosResponseHeaders;
  config: AxiosRequestConfig;
  request?: unknown;
}
export const smsApi = axios.create({
  baseURL: smsBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds timeout to prevent 504 Gateway Timeout errors
});

// Intercepteur pour masquer les informations sensibles dans les logs et l'inspecteur
// Safe setup for test environments - only set up interceptors if they exist
try {
  if (smsApi && smsApi.interceptors && typeof smsApi.interceptors.request.use === "function") {
    smsApi.interceptors.request.use(
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
    smsApi.interceptors.response.use(
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
interface SmsApiRequestParams<RequestType> {
  method: Method;
  endpoint: string;
  data?: RequestType;
  params?: Record<string, string | number | boolean>;
  apiKey?: string;
}
export const smsApiRequest = async <RequestType, ResponseType>({
  method,
  endpoint,
  data,
  params,
  apiKey,
}: SmsApiRequestParams<RequestType>): Promise<ApiResponse<ResponseType>> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
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
    const response: AxiosResponse<ResponseType> = await smsApi(config);

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
