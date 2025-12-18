import { billingApiRequest } from "@/controller/api/config/config";
import { topup } from "@/controller/api/constant/apiLink";
import {
  GetAvailableConnectorsResponse,
  GetManualTopupRequestDetailsRequest,
  GetManualTopupRequestDetailsResponse,
  GetManualTopupRequestsRequest,
  GetManualTopupRequestsResponse,
  ManualTopupRequest,
  ManualTopupResponse,
} from "@/types";
import { handleAxiosError } from "@/utils/errorHandler";

/**
 * Create a manual top-up request
 */
export const createManualTopup = async (
  data: ManualTopupRequest,
  apiKey: string
): Promise<ManualTopupResponse | undefined> => {
  try {
    const response = await billingApiRequest<ManualTopupRequest, ManualTopupResponse>({
      method: "POST",
      endpoint: topup.createManualTopup,
      data: {
        client_id: data.client_id,
        amount: data.amount,
        connector_id: data.connector_id,
        reference: data.reference,
        description: data.description,
      },
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for creating manual top-up request.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error creating manual top-up request.");
  }
};

/**
 * Get all manual top-up requests
 */
export const getManualTopupRequests = async (
  data: GetManualTopupRequestsRequest,
  apiKey: string
): Promise<GetManualTopupRequestsResponse | undefined> => {
  try {
    const response = await billingApiRequest<
      GetManualTopupRequestsRequest,
      GetManualTopupRequestsResponse
    >({
      method: "POST",
      endpoint: topup.getManualTopupRequests,
      data: {
        page: data.page,
        limit: data.limit,
        status: data.status,
        client_id: data.client_id,
      },
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for manual top-up requests.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error fetching manual top-up requests.");
  }
};

/**
 * Get manual top-up request details
 */
export const getManualTopupRequestDetails = async (
  data: GetManualTopupRequestDetailsRequest,
  apiKey: string
): Promise<GetManualTopupRequestDetailsResponse | undefined> => {
  try {
    const response = await billingApiRequest<
      GetManualTopupRequestDetailsRequest,
      GetManualTopupRequestDetailsResponse
    >({
      method: "POST",
      endpoint: topup.getManualTopupRequestDetails,
      data: {
        request_id: data.request_id,
      },
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for manual top-up request details.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error fetching manual top-up request details.");
  }
};

/**
 * Get available connectors for top-up
 */
export const getAvailableConnectors = async (
  apiKey: string
): Promise<GetAvailableConnectorsResponse | undefined> => {
  try {
    const response = await billingApiRequest<Record<string, never>, GetAvailableConnectorsResponse>(
      {
        method: "POST",
        endpoint: topup.getAvailableConnectors,
        data: {},
        apiKey,
      }
    );
    if (!response?.data) {
      throw new Error("No server response for available connectors.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error fetching available connectors.");
  }
};
