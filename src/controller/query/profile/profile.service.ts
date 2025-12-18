import axios from "axios";
import { billingApiRequest } from "../../api/config/config";
import { smsApiRequest } from "../../api/config/smsApiConfig";
import { adminClients, topup, auth } from "../../api/constant/apiLink";

// SMS Billing Rates
export interface SMSBillingRate {
  connector_name: string;
  billing_rate: number;
}

export interface SMSBillingRatesRequest {
  page?: number;
  per_page?: number;
  sort?: string;
  order?: "asc" | "desc";
  search?: string;
}

export interface SMSBillingRatesResponse {
  status: number;
  message:
    | SMSBillingRate[]
    | {
        data?: SMSBillingRate[];
        rates?: SMSBillingRate[];
        billing_rates?: SMSBillingRate[];
        [key: string]: unknown;
      };
  data?: SMSBillingRate[];
}

export const getSMSBillingRates = async (
  params: SMSBillingRatesRequest,
  apiKey: string
): Promise<SMSBillingRatesResponse | undefined> => {
  try {
    // Prepare request data with pagination and sorting
    const requestData: SMSBillingRatesRequest = {
      page: Number(params.page) || 1,
      per_page: Number(params.per_page) || 10,
      sort: params.sort || "created",
      order: params.order || "desc",
    };

    // Only include search if provided
    if (params.search && params.search.trim() !== "") {
      requestData.search = params.search.trim();
    }

    const response = await billingApiRequest<SMSBillingRatesRequest, SMSBillingRatesResponse>({
      method: "POST",
      endpoint: adminClients.billingView, // POST /client/billing/view
      data: requestData,
      apiKey,
    });

    if (!response?.data) {
      throw new Error("No server response for SMS billing rates.");
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle timeout errors
      if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        throw new Error("Request timeout: The server took too long to respond. Please try again.");
      }
      // Handle gateway timeout (504)
      if (error.response?.status === 504) {
        throw new Error(
          "Gateway timeout: The server took too long to process your request. Please try again later."
        );
      }
      if (error.response) {
        const errorMessage = error.response.data?.message || "Error retrieving SMS billing rates.";
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("Server error while retrieving SMS billing rates.");
  }
};

// SMS Reports - Connector
export interface SMSReportConnector {
  connector_name: string;
  total: number;
  delivered: number;
  sent: number;
  pending: number;
  failed: number;
  delivery_rate: string;
}

export interface SMSReportsConnectorResponse {
  status: number;
  message: SMSReportConnector[];
}

export const getSMSReportsConnector = async (
  clientId: number,
  start: string,
  end: string,
  apiKey: string,
  isSuperAdmin: boolean = false
): Promise<SMSReportsConnectorResponse | undefined> => {
  try {
    // Même endpoint pour admin et client, mais avec id: 0 pour admin (tous les clients)
    const response = await smsApiRequest<
      { id: number; start: string; end: string },
      SMSReportsConnectorResponse
    >({
      method: "POST",
      endpoint: `/client/reports/sms/connector`,
      data: {
        id: isSuperAdmin ? 0 : clientId, // 0 = tous les clients pour admin
        start: start || "",
        end: end || "",
      },
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for SMS connector reports.");
    }
    // Calculate delivery rate
    const reports = response.data.message?.map(
      (
        report: SMSReportConnector | (Partial<SMSReportConnector> & { connector_name?: string })
      ) => {
        const delivered = report.delivered ?? 0;
        const sent = report.sent ?? 0;
        const pending = report.pending ?? 0;
        const failed = report.failed ?? 0;
        const total = delivered + sent + pending + failed;
        return {
          ...report,
          connector_name: report.connector_name ?? "",
          total,
          delivered,
          sent,
          pending,
          failed,
          delivery_rate: total > 0 ? `${((delivered / total) * 100).toFixed(2)}%` : "0%",
        } as SMSReportConnector;
      }
    );
    return {
      ...response.data,
      message: reports || [],
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error retrieving SMS connector reports.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("Server error while retrieving SMS connector reports.");
  }
};

// SMS Reports - Sender
export interface SMSReportSender {
  sender_id: string;
  total: number;
  delivered: number;
  sent: number;
  pending: number;
  failed: number;
  delivery_rate: string;
}

export interface SMSReportsSenderResponse {
  status: number;
  message: SMSReportSender[];
}

export const getSMSReportsSender = async (
  clientId: number,
  start: string,
  end: string,
  apiKey: string,
  isSuperAdmin: boolean = false
): Promise<SMSReportsSenderResponse | undefined> => {
  try {
    // Même endpoint pour admin et client, mais avec id: 0 pour admin (tous les clients)
    const response = await smsApiRequest<
      { id: number; start: string; end: string },
      SMSReportsSenderResponse
    >({
      method: "POST",
      endpoint: `/client/reports/sms/sender`,
      data: {
        id: isSuperAdmin ? 0 : clientId, // 0 = tous les clients pour admin
        start: start || "",
        end: end || "",
      },
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for SMS sender reports.");
    }
    // Calculate delivery rate
    const reports = response.data.message?.map(
      (report: SMSReportSender | (Partial<SMSReportSender> & { sender_id?: string })) => {
        const delivered = report.delivered ?? 0;
        const sent = report.sent ?? 0;
        const pending = report.pending ?? 0;
        const failed = report.failed ?? 0;
        const total = delivered + sent + pending + failed;
        return {
          ...report,
          sender_id: report.sender_id ?? "",
          total,
          delivered,
          sent,
          pending,
          failed,
          delivery_rate: total > 0 ? `${((delivered / total) * 100).toFixed(2)}%` : "0%",
        } as SMSReportSender;
      }
    );
    return {
      ...response.data,
      message: reports || [],
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error retrieving SMS sender reports.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("Server error while retrieving SMS sender reports.");
  }
};

// Transactions
export interface Transaction {
  id: number;
  amount: number;
  method_type: string;
  reference: string;
  customer_name: string;
  created: string;
}

export interface TransactionsResponse {
  status: number;
  message: {
    data: Transaction[];
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

export interface TransactionsRequest {
  client_id?: number; // 0 = current client from session, or specific client_id for admin
  page?: number;
  per_page?: number;
  sort?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
}

/**
 * Get transactions
 * Uses POST /client/payment from Billing API
 * Expects VueTable format: { client_id, page, per_page, sort, search, start_date, end_date }
 *
 * Logic:
 * - If client_id is 0 or undefined: Uses current client from session (parentClientID)
 * - If client_id is specified: Admin can view any client's transactions, regular client can only view their own
 * - Admin (client_id = 1) can view all transactions by sending 0 or specific client_id
 * - Regular client can only view their own transactions (client_id = 0 or their own client_id)
 */
export const getTransactions = async (
  params: TransactionsRequest,
  apiKey: string,
  isSuperAdmin: boolean = false
): Promise<TransactionsResponse | undefined> => {
  try {
    // Permission: "client", "read"
    // Backend logic: Format VueTable, si ClientID == 0, utilise le parentClientID de session
    // - Simple user: doit toujours envoyer client_id: 0 (utilise automatiquement son clientID de session)
    // - Super admin: peut envoyer client_id: 0 (tous) ou un client_id spécifique
    // Backend expects VueTable format (see models/vuetable.go)
    // The struct has ClientID field with json tag "client_id"
    // So we must use client_id (snake_case) in JSON, not ClientID
    // VueTable struct expects: client_id (int64), page (int64), per_page (int64), sort (string), search (string), start_date (string), end_date (string)
    // Backend logic: if client_id == 0, it uses parentClientID from session
    // Ensure all numeric values are proper numbers (not strings)
    // Only include non-empty optional fields to avoid potential backend issues with empty strings
    let requestData: TransactionsRequest = {
      client_id: isSuperAdmin ? (params.client_id ?? 0) : 0,
      page: Number(params.page) || 1,
      per_page: Number(params.per_page) || 10,
      sort: params.sort || "payment.id",
    };
    
    // For testing: allow overriding client_id to null/undefined via special test flag
    if ((params as any).__test_force_null_client_id) {
      requestData.client_id = null as any;
    }

    // Only include optional fields if they have values (avoid empty strings)
    if (params.search && params.search.trim() !== "") {
      requestData.search = params.search.trim();
    }
    if (params.start_date && params.start_date.trim() !== "") {
      requestData.start_date = params.start_date.trim();
    }
    if (params.end_date && params.end_date.trim() !== "") {
      requestData.end_date = params.end_date.trim();
    }

    // Validate that required fields are present and have correct types
    // client_id can be 0 (backend will use session client_id)
    // Note: This check is defensive - with current logic (?? 0), client_id should never be null/undefined
    // but we keep it for safety in case the logic changes in the future
    if (requestData.client_id === undefined || requestData.client_id === null) {
      throw new Error("Client ID is required for transactions.");
    }

    // Ensure page and per_page are positive integers
    if (requestData.page! < 1) {
      requestData.page = 1;
    }
    if (requestData.per_page! < 1) {
      requestData.per_page = 10;
    }

    const response = await billingApiRequest<TransactionsRequest, TransactionsResponse>({
      method: "POST",
      endpoint: topup.clientPayment, // POST /client/payment
      data: requestData,
      apiKey,
    });

    if (!response?.data) {
      throw new Error("No server response for transactions.");
    }
    return response.data;
  } catch (error) {
    // Re-throw validation errors as-is
    if (error instanceof Error && error.message === "Client ID is required for transactions.") {
      throw error;
    }
    if (axios.isAxiosError(error)) {
      // Handle 500 Internal Server Error specifically
      if (error.response?.status === 500) {
        const errorMessage =
          error.response.data?.message || "Internal server error while retrieving transactions.";

        throw new Error(
          `Server error: ${errorMessage}. Please check the request format and try again.`
        );
      }
      if (error.response) {
        throw new Error(error.response.data?.message || "Error retrieving transactions.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("Server error while retrieving transactions.");
  }
};

// Invoices
export interface Invoice {
  id: number;
  amount: number;
  invoice_number: string;
  status: string;
  reference: string;
  customer_name: string;
  created: string;
}

export interface InvoicesResponse {
  status: number;
  message: {
    data: Invoice[];
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

export interface InvoicesRequest {
  client_id?: number; // 0 = current client from session, or specific client_id for admin
  page?: number;
  per_page?: number;
  sort?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
}

/**
 * Get invoices
 * Uses POST /client/payment from Billing API
 * Expects VueTable format: { client_id, page, per_page, sort, search, start_date, end_date }
 *
 * Logic:
 * - If client_id is 0 or undefined: Uses current client from session (parentClientID)
 * - If client_id is specified: Admin can view any client's invoices, regular client can only view their own
 * - Admin (client_id = 1) can view all invoices by sending 0 or specific client_id
 * - Regular client can only view their own invoices (client_id = 0 or their own client_id)
 * Note: Same endpoint as transactions, but may filter by type in the API
 */
export const getInvoices = async (
  params: InvoicesRequest,
  apiKey: string,
  isSuperAdmin: boolean = false
): Promise<InvoicesResponse | undefined> => {
  try {
    // Permission: "client", "read"
    // Backend logic: Format VueTable, si ClientID == 0, utilise le parentClientID de session
    // - Simple user: doit toujours envoyer client_id: 0 (utilise automatiquement son clientID de session)
    // - Super admin: peut envoyer client_id: 0 (tous) ou un client_id spécifique
    // Note: Même endpoint que getTransactions, mais peut filtrer différemment côté backend
    // Backend expects VueTable format (see models/vuetable.go)
    // Only include non-empty optional fields to avoid potential backend issues with empty strings
    const requestData: InvoicesRequest = {
      client_id: isSuperAdmin ? (params.client_id ?? 0) : 0,
      page: Number(params.page) || 1,
      per_page: Number(params.per_page) || 10,
      sort: params.sort || "payment.id",
    };

    // Only include optional fields if they have values (avoid empty strings)
    if (params.search && params.search.trim() !== "") {
      requestData.search = params.search.trim();
    }
    if (params.start_date && params.start_date.trim() !== "") {
      requestData.start_date = params.start_date.trim();
    }
    if (params.end_date && params.end_date.trim() !== "") {
      requestData.end_date = params.end_date.trim();
    }

    const response = await billingApiRequest<InvoicesRequest, InvoicesResponse>({
      method: "POST",
      endpoint: topup.clientPayment, // POST /client/payment
      data: requestData,
      apiKey,
    });

    if (!response?.data) {
      throw new Error("No server response for invoices.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle 500 Internal Server Error specifically
      if (error.response?.status === 500) {
        const errorMessage =
          error.response.data?.message || "Internal server error while retrieving invoices.";

        throw new Error(
          `Server error: ${errorMessage}. Please check the request format and try again.`
        );
      }
      if (error.response) {
        throw new Error(error.response.data?.message || "Error retrieving invoices.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("Server error while retrieving invoices.");
  }
};

// Profile management functions
// ⚠️ ATTENTION: Vérifier si /auth/user/profile existe dans l'API SMS
// Si OUI → Garder smsApiRequest
// Si NON → Utiliser POST /auth/user/all avec billingApiRequest

export interface GetProfileRequest {
  user_id?: number | string;
  page?: number;
  per_page?: number;
}

export interface ProfileResponse {
  status: number;
  message?: {
    data?: Array<{
      id: number;
      full_name: string;
      email: string;
      msisdn: string;
      country_code?: string;
      status: number;
      role_id: number;
      created: string;
      updated: string;
      [key: string]: unknown;
    }>;
    users?: Array<{
      id: number;
      full_name: string;
      email: string;
      msisdn: string;
      country_code?: string;
      status: number;
      role_id: number;
      created: string;
      updated: string;
      [key: string]: unknown;
    }>;
    pagination?: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Get user profile
 * Uses POST /auth/user/all from Billing API with user_id filter
 * Note: If user_id is not provided, will return current user from session
 */
export const getProfile = async (apiKey: string, userId?: number | string) => {
  try {
    const response = await billingApiRequest<{ user_id?: number | string }, ProfileResponse>({
      method: "POST",
      endpoint: `/auth/user/all`,
      data: userId ? { user_id: userId } : {},
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for profile.");
    }
    // The API returns a list, we need to extract the first user or current user
    const message = response.data.message;
    if (message?.data && Array.isArray(message.data) && message.data.length > 0) {
      // Return the first user from the list
      return {
        ...response.data,
        message: message.data[0],
      };
    } else if (message?.users && Array.isArray(message.users) && message.users.length > 0) {
      // Alternative format
      return {
        ...response.data,
        message: message.users[0],
      };
    }
    // If no user found, return the response as is
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error retrieving profile.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("Error retrieving profile.");
  }
};

export interface UpdateProfileRequest {
  full_name?: string;
  email?: string;
  phone_number?: string; // ⚠️ À vérifier: peut être msisdn dans l'API
  msisdn?: string;
  country_code?: string;
}

export interface UpdateProfileResponse {
  status: number;
  message: string;
  [key: string]: unknown;
}

/**
 * Update user profile
 * Uses POST /auth/user/update from Billing API
 * Note: user_id is required in the payload. If not provided, will use current user from session
 */
export const updateProfile = async (
  data: UpdateProfileRequest & { user_id?: number | string },
  apiKey: string
) => {
  try {
    // Permission: "user", "update"
    // Backend logic: Utilise UserBelongsToClient pour vérifier les permissions
    // - Simple user: peut modifier uniquement son propre profil (user_id doit être le sien)
    // - Super admin: peut modifier n'importe quel user (user_id spécifié)
    // Backend attend "fullname" (pas "full_name") dans le payload
    const updateData: Record<string, unknown> = {};

    if (data.user_id) {
      updateData.user_id = data.user_id;
    }
    // Backend attend "fullname" (sans underscore) - ligne 268 user_create.go
    if (data.full_name) {
      updateData.fullname = data.full_name; // ✅ Mapping: full_name → fullname
    }
    if (data.email) {
      updateData.email = data.email;
    }
    // Use msisdn if provided, otherwise use phone_number and rename it
    if (data.msisdn) {
      updateData.msisdn = data.msisdn;
    } else if (data.phone_number) {
      updateData.msisdn = data.phone_number; // Billing API expects msisdn, not phone_number
    }
    if (data.country_code) {
      updateData.country_code = data.country_code;
    }

    const response = await billingApiRequest<Record<string, unknown>, UpdateProfileResponse>({
      method: "POST",
      endpoint: `/auth/user/update`,
      data: updateData,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for profile update.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error updating profile.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("Error updating profile.");
  }
};

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface ChangePasswordResponse {
  status: number;
  message: string;
  [key: string]: unknown;
}

/**
 * Change user password
 * Uses POST /auth/user/password/change
 */
export const changePassword = async (
  data: ChangePasswordRequest,
  apiKey: string
): Promise<ChangePasswordResponse | undefined> => {
  try {
    const response = await billingApiRequest<ChangePasswordRequest, ChangePasswordResponse>({
      method: "POST",
      endpoint: auth.changePassword,
      data,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for password change.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error changing password.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("Error changing password.");
  }
};

export interface APIKeyResponse {
  status: number;
  message?: {
    token?: string;
    api_key?: string;
    [key: string]: unknown;
  };
  token?: string;
  api_key?: string;
  [key: string]: unknown;
}

/**
 * Generate or retrieve API key
 * Uses GET /auth/api-key
 * Note: This endpoint generates a new API key if none exists, or returns the existing one
 */
export const generateApiKey = async (apiKey: string): Promise<APIKeyResponse | undefined> => {
  try {
    // GET request - no data in body
    const response = await billingApiRequest<Record<string, never>, APIKeyResponse>({
      method: "GET",
      endpoint: auth.gen,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for API key generation.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error generating API key.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("Error generating API key.");
  }
};

/**
 * Regenerate API key (same endpoint as generate)
 * Uses GET /auth/api-key
 * Note: The API doesn't have a separate regenerate endpoint,
 * but calling this endpoint again may regenerate the key depending on API implementation
 */
export const regenerateApiKey = async (apiKey: string): Promise<APIKeyResponse | undefined> => {
  // Use the same endpoint as generateApiKey
  // The API may regenerate the key on subsequent calls
  return generateApiKey(apiKey);
};
