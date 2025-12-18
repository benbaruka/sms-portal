import axios from "axios";
import { billingApiRequest } from "@/controller/api/config/config";
import { adminBenefit } from "@/controller/api/constant/apiLink";
import {
  BenefitGraphRequest,
  BenefitGraphResponse,
  BenefitByTierRequest,
  BenefitByTierResponse,
  BenefitByClientRequest,
  BenefitByClientResponse,
  BenefitDetailsRequest,
  BenefitDetailsResponse,
} from "@/types";

const handleAxiosError = (error: unknown, fallbackMessage: string) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const errorData = error.response.data;
      const message =
        typeof errorData === "object" && errorData !== null && "message" in errorData
          ? (errorData as { message?: string }).message || fallbackMessage
          : fallbackMessage;
      throw new Error(message);
    }
    if (error.request) {
      throw new Error("No server response. Please check your internet connection.");
    }
  }
  throw new Error(fallbackMessage);
};

export const getBenefitGraph = async (
  data: BenefitGraphRequest,
  apiKey: string
): Promise<BenefitGraphResponse | undefined> => {
  try {
    const response = await billingApiRequest<BenefitGraphRequest, BenefitGraphResponse>({
      method: "POST",
      endpoint: adminBenefit.graph,
      data,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for benefit graph.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error retrieving benefit graph data.");
  }
};

export const getBenefitByTier = async (
  data: BenefitByTierRequest,
  apiKey: string
): Promise<BenefitByTierResponse | undefined> => {
  try {
    if (!data.start_date || !data.end_date) {
      throw new Error("start_date and end_date are required");
    }

    const response = await billingApiRequest<BenefitByTierRequest, BenefitByTierResponse>({
      method: "POST",
      endpoint: adminBenefit.byTier,
      data,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for benefit by tier.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error retrieving benefit by tier data.");
  }
};

export const getBenefitByClient = async (
  data: BenefitByClientRequest,
  apiKey: string
): Promise<BenefitByClientResponse | undefined> => {
  try {
    if (!data.start_date || !data.end_date) {
      throw new Error("start_date and end_date are required");
    }

    const response = await billingApiRequest<BenefitByClientRequest, BenefitByClientResponse>({
      method: "POST",
      endpoint: adminBenefit.byClient,
      data,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for benefit by client.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error retrieving benefit by client data.");
  }
};

export const getBenefitDetails = async (
  data: BenefitDetailsRequest,
  apiKey: string
): Promise<BenefitDetailsResponse | undefined> => {
  try {
    const response = await billingApiRequest<BenefitDetailsRequest, BenefitDetailsResponse>({
      method: "POST",
      endpoint: adminBenefit.details,
      data,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for benefit details.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error retrieving benefit details.");
  }
};

// Aliases for backward compatibility
export const getAdminBenefitGraph = getBenefitGraph;
export const getAdminBenefitByTier = getBenefitByTier;
export const getAdminBenefitByClient = getBenefitByClient;
export const getAdminBenefitDetails = getBenefitDetails;
