import { billingApiRequest } from "@/controller/api/config/config";
import { adminStatistics } from "@/controller/api/constant/apiLink";
import {
  AdminBillingStatisticsRequest,
  AdminBillingStatisticsResponse,
  AdminClientStatisticsRequest,
  AdminClientStatisticsResponse,
  AdminGlobalStatisticsRequest,
  AdminGlobalStatisticsResponse,
} from "@/types";
import axios from "axios";

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

export const getAdminGlobalStatistics = async (
  data: AdminGlobalStatisticsRequest,
  apiKey: string
): Promise<AdminGlobalStatisticsResponse | undefined> => {
  try {
    const response = await billingApiRequest<
      AdminGlobalStatisticsRequest,
      AdminGlobalStatisticsResponse
    >({
      method: "POST",
      endpoint: adminStatistics.global,
      data,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for global statistics.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error retrieving global statistics.");
  }
};

export const getAdminBillingStatistics = async (
  data: AdminBillingStatisticsRequest,
  apiKey: string
): Promise<AdminBillingStatisticsResponse | undefined> => {
  try {
    // Use the same endpoint as global stats for billing statistics
    // The backend returns billing stats based on the authenticated client
    const response = await billingApiRequest<
      AdminBillingStatisticsRequest,
      AdminBillingStatisticsResponse
    >({
      method: "POST",
      endpoint: adminStatistics.global, // Use global stats endpoint which returns billing data
      data: {},
      apiKey,
    });

    if (!response?.data) {
      throw new Error("No server response for billing statistics.");
    }

    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error retrieving billing statistics.");
  }
};

export const getAdminClientStatistics = async (
  data: AdminClientStatisticsRequest,
  apiKey: string
): Promise<AdminClientStatisticsResponse | undefined> => {
  try {
    // Use minimal VueTable format as expected by backend
    // Backend expects specific format with snake_case keys and proper types
    const vueTablePayload = {
      page: 1,
      per_page: 50,
      search: "",
      status: 0,
      kyb_status: "all",
    };

    const response = await billingApiRequest<any, AdminClientStatisticsResponse>({
      method: "POST",
      endpoint: adminStatistics.clients,
      data: vueTablePayload,
      apiKey,
    });

    if (!response?.data) {
      throw new Error("No server response for client statistics.");
    }

    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error retrieving client statistics.");
  }
};
