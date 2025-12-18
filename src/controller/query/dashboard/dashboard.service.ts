import axios from "axios";
import { smsApiRequest } from "../../api/config/smsApiConfig";
import { billingApiRequest } from "../../api/config/config";
import { dashboard } from "../../api/constant/apiLink";
import {
  DashboardSummaryRequest,
  DashboardSummaryResponse,
  MessageSentRequest,
  MessageSentResponse,
  MessageGraphRequest,
  MessageGraphResponse,
  ScheduledMessagesRequest,
  ScheduledMessagesResponse,
  BillingStatsRequest,
  BillingStatsResponse,
  ClientsListRequest,
  ClientsListResponse,
  ClientReportsRequest,
  ClientReportsResponse,
  ClientSMSRequest,
  ClientSMSResponse,
} from "@/types";
export const getDashboardSummary = async (
  params: DashboardSummaryRequest,
  apiKey: string
): Promise<DashboardSummaryResponse | undefined> => {
  try {
    const response = await smsApiRequest<DashboardSummaryRequest, DashboardSummaryResponse>({
      method: "POST",
      endpoint: dashboard.summary,
      data: params,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for dashboard summary.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error retrieving dashboard summary.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("No server response for dashboard summary.");
  }
};
export const getMessagesSentByType = async (
  type: "promotional" | "transactional",
  params: MessageSentRequest,
  apiKey: string
): Promise<MessageSentResponse | undefined> => {
  try {
    const response = await smsApiRequest<MessageSentRequest, MessageSentResponse>({
      method: "POST",
      endpoint: dashboard.messageSent(type),
      data: params,
      apiKey,
    });
    if (!response?.data) {
      throw new Error(`No server response for ${type} messages.`);
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || `Error retrieving ${type} messages.`);
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error(`No server response for ${type} messages.`);
  }
};
export const getMessageGraph = async (
  type: "promotional" | "transactional",
  params: MessageGraphRequest,
  apiKey: string
): Promise<MessageGraphResponse | undefined> => {
  try {
    const response = await smsApiRequest<MessageGraphRequest, MessageGraphResponse>({
      method: "POST",
      endpoint: dashboard.messageGraph(type),
      data: params,
      apiKey,
    });
    if (!response?.data) {
      throw new Error(`No server response for ${type} graph.`);
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || `Error retrieving ${type} graph.`);
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error(`No server response for ${type} graph.`);
  }
};
export const getMessageNetworkGraph = async (
  type: "promotional" | "transactional",
  params: MessageGraphRequest,
  apiKey: string
): Promise<MessageGraphResponse | undefined> => {
  try {
    const response = await smsApiRequest<MessageGraphRequest, MessageGraphResponse>({
      method: "POST",
      endpoint: dashboard.messageNetworkGraph(type),
      data: params,
      apiKey,
    });
    if (!response?.data) {
      throw new Error(`No server response for ${type} network graph.`);
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || `Error retrieving ${type} network graph.`);
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error(`Server error while retrieving ${type} network graph.`);
  }
};
export const getScheduledMessages = async (
  params: ScheduledMessagesRequest,
  apiKey: string
): Promise<ScheduledMessagesResponse | undefined> => {
  try {
    const response = await smsApiRequest<ScheduledMessagesRequest, ScheduledMessagesResponse>({
      method: "POST",
      endpoint: dashboard.scheduledMessages,
      data: params,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for scheduled messages.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error retrieving scheduled messages.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("Server error while retrieving scheduled messages.");
  }
};
export const getBillingStats = async (
  params: BillingStatsRequest,
  apiKey: string
): Promise<BillingStatsResponse | undefined> => {
  try {
    const response = await billingApiRequest<BillingStatsRequest, BillingStatsResponse>({
      method: "POST",
      endpoint: dashboard.billingStats,
      data: params,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for billing stats.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error retrieving billing stats.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("No server response for billing stats.");
  }
};
export const getClientsList = async (
  params: ClientsListRequest,
  apiKey: string
): Promise<ClientsListResponse | undefined> => {
  try {
    // Use the same endpoint as admin clients page: /client/all
    const { adminClients } = await import("@/controller/api/constant/apiLink");
    const response = await billingApiRequest<ClientsListRequest, any>({
      method: "POST",
      endpoint: adminClients.list, // /client/all - same as admin clients page
      data: params,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for clients list.");
    }
    // Transform the response to match ClientsListResponse structure
    // The /client/all endpoint returns either:
    // - An array directly: [...]
    // - An object with message/data: { message: [...] } or { data: [...] }
    let allClients: any[] = [];
    if (Array.isArray(response.data)) {
      allClients = response.data;
    } else if (Array.isArray(response.data?.message)) {
      allClients = response.data.message;
    } else if (Array.isArray(response.data?.data)) {
      allClients = response.data.data;
    }

    // Sort by created date descending (most recent first) and limit to per_page
    const sortedClients = allClients
      .sort((a: any, b: any) => {
        const dateA = a.created_at || a.created || a.registered_at || a.createdAt || 0;
        const dateB = b.created_at || b.created || b.registered_at || b.createdAt || 0;
        const timeA = dateA ? new Date(dateA).getTime() : 0;
        const timeB = dateB ? new Date(dateB).getTime() : 0;
        return timeB - timeA; // Most recent first
      })
      .slice(0, params.per_page || 5);

    // Return in the format expected by the dashboard (ClientsListResponse)
    return {
      current_page: 1,
      data: {
        clients: sortedClients,
        summary: {
          total_count: allClients.length,
          active_count: allClients.filter(
            (c: any) => c.status === 1 || c.status === "active" || c.status === "1"
          ).length,
          pending_count: allClients.filter(
            (c: any) => c.status === 0 || c.status === "pending" || c.status === "0"
          ).length,
          compliance_pending: allClients.filter(
            (c: any) => c.compliance_status === "pending" || c.kyb_status === "pending"
          ).length,
        },
      },
      from: 1,
      last_page: 1,
      next_page_url: null,
      per_page: params.per_page || 5,
      prev_page_url: null,
      to: sortedClients.length,
      total: sortedClients.length,
    } as ClientsListResponse;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error retrieving clients list.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("No server response for clients list.");
  }
};
export const getClientReports = async (
  type: "summary" | "connector" | "sender",
  params: ClientReportsRequest,
  apiKey: string,
  isSuperAdmin: boolean = false
): Promise<ClientReportsResponse | undefined> => {
  try {
    // Backend requires id to be present and non-zero (see sms.go line 175-179)
    // The backend rejects id: 0 with "Missing client ID" error
    // For regular users, we must send their client_id (from params.id)
    // For super admin, we should send a specific client_id (not 0)
    if (!params.id || params.id === 0) {
      throw new Error("Client ID is required and must be non-zero for client reports.");
    }

    const requestData: ClientReportsRequest = {
      ...params,
      id: params.id, // Always include id (must be non-zero)
    };

    const response = await smsApiRequest<ClientReportsRequest, ClientReportsResponse>({
      method: "POST",
      endpoint: dashboard.clientReports(type),
      data: requestData,
      apiKey,
    });
    if (!response?.data) {
      throw new Error(`No server response for client reports (${type}).`);
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(
          error.response.data?.message || `Error retrieving client reports (${type}).`
        );
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error(`No server response for client reports (${type}).`);
  }
};
export const getClientTransactionalSMS = async (
  params: ClientSMSRequest,
  apiKey: string
): Promise<ClientSMSResponse | undefined> => {
  try {
    const response = await smsApiRequest<ClientSMSRequest, ClientSMSResponse>({
      method: "POST",
      endpoint: dashboard.clientTransactional,
      data: params,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for client transactional SMS.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(
          error.response.data?.message || "Error retrieving client transactional SMS."
        );
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("Server error while retrieving client transactional SMS.");
  }
};
export const getClientPromotionalSMS = async (
  params: ClientSMSRequest,
  apiKey: string
): Promise<ClientSMSResponse | undefined> => {
  try {
    const response = await smsApiRequest<ClientSMSRequest, ClientSMSResponse>({
      method: "POST",
      endpoint: dashboard.clientPromotional,
      data: params,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for client promotional SMS.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error retrieving client promotional SMS.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("Server error while retrieving client promotional SMS.");
  }
};
