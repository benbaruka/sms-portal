import axios from "axios";
import { smsBaseURL } from "../../api/config/smsApiConfig";
export interface MessagesTableRequest {
  page?: number;
  per_page?: number;
  sort?: string;
  filter?: string;
  start?: string;
  end?: string;
  start_date?: string;
  end_date?: string;
  service?: string;
}
export interface MessagesTableResponse {
  data: unknown[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  [key: string]: unknown;
}
export const getMessagesTable = async (
  route: string,
  params: MessagesTableRequest,
  apiKey: string
): Promise<MessagesTableResponse> => {
  try {
    const isScheduled = route.includes("scheduled");
    const requestBody: {
      page: number;
      per_page: number;
      service: string;
      sort?: string;
      filter?: string;
      start_date?: string;
      end_date?: string;
      start?: string;
      end?: string;
    } = {
      page: params.page || 1,
      per_page: params.per_page || 25,
      service: params.service || "sms",
    };
    if (params.sort) requestBody.sort = params.sort;
    if (params.filter !== undefined) requestBody.filter = params.filter || "";
    if (isScheduled) {
      if (params.start_date) requestBody.start_date = params.start_date;
      if (params.end_date) requestBody.end_date = params.end_date;
    } else {
      if (params.start) requestBody.start = params.start;
      if (params.end) requestBody.end = params.end;
    }
    const response = await axios.post<MessagesTableResponse>(
      `${smsBaseURL}/${route}`,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      }
    );
    if (!response?.data) {
      throw new Error("No server response for messages table.");
    }
    const responseData = response.data;
    if (responseData && typeof responseData === "object") {
      if (Array.isArray(responseData)) {
        return {
          data: responseData,
          current_page: 1,
          last_page: 1,
          per_page: params.per_page || 25,
          total: responseData.length,
          from: 1,
          to: responseData.length,
        };
      }
      if (responseData.message) {
        const messageData = responseData.message as Record<string, unknown>;
        const messageDataPagination = (messageData.pagination as Record<string, unknown>) || {};
        if (Array.isArray(messageData.data) || Array.isArray(messageData.messages)) {
          const data = (messageData.data as unknown[]) || (messageData.messages as unknown[]) || [];
          return {
            data,
            current_page:
              typeof messageData.current_page === "number"
                ? messageData.current_page
                : typeof messageDataPagination.current_page === "number"
                  ? messageDataPagination.current_page
                  : 1,
            last_page:
              typeof messageData.last_page === "number"
                ? messageData.last_page
                : typeof messageDataPagination.last_page === "number"
                  ? messageDataPagination.last_page
                  : 1,
            per_page:
              typeof messageData.per_page === "number"
                ? messageData.per_page
                : typeof messageDataPagination.per_page === "number"
                  ? messageDataPagination.per_page
                  : params.per_page || 25,
            total:
              typeof messageData.total === "number"
                ? messageData.total
                : typeof messageDataPagination.total === "number"
                  ? messageDataPagination.total
                  : data.length,
            from:
              typeof messageData.from === "number"
                ? messageData.from
                : typeof messageDataPagination.from === "number"
                  ? messageDataPagination.from
                  : 1,
            to:
              typeof messageData.to === "number"
                ? messageData.to
                : typeof messageDataPagination.to === "number"
                  ? messageDataPagination.to
                  : data.length,
          };
        }
      }
      if (Array.isArray(responseData.data)) {
        return {
          data: responseData.data,
          current_page: responseData.current_page || 1,
          last_page: responseData.last_page || 1,
          per_page: responseData.per_page || params.per_page || 25,
          total: responseData.total || responseData.data.length,
          from: responseData.from || 1,
          to: responseData.to || responseData.data.length,
        };
      }
    }
    return {
      data: [],
      current_page: 1,
      last_page: 1,
      per_page: params.per_page || 25,
      total: 0,
      from: 0,
      to: 0,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error fetching messages table.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("Server error while fetching messages table.");
  }
};
