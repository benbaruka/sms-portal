import { billingApiRequest } from "@/controller/api/config/config";
import { adminPricing } from "@/controller/api/constant/apiLink";
import {
  CreatePricingTierRequest,
  CreatePricingTierResponse,
  GetPricingConfigResponse,
  GetPricingTiersResponse,
  TogglePricingTierRequest,
  TogglePricingTierResponse,
  UpdatePricingConfigRequest,
  UpdatePricingConfigResponse,
  UpdatePricingTierRequest,
  UpdatePricingTierResponse,
} from "@/types";
import { handleAxiosError } from "@/utils/errorHandler";

/**
 * Get active pricing configuration
 */
export const getActivePricingConfig = async (
  apiKey: string
): Promise<GetPricingConfigResponse | undefined> => {
  try {
    const response = await billingApiRequest<Record<string, never>, GetPricingConfigResponse>({
      method: "POST",
      endpoint: adminPricing.configActive,
      data: {},
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for active pricing config.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error fetching active pricing config.");
  }
};

/**
 * Update purchase price in active pricing configuration
 */
export const updatePurchasePrice = async (
  data: UpdatePricingConfigRequest,
  apiKey: string
): Promise<UpdatePricingConfigResponse | undefined> => {
  try {
    const response = await billingApiRequest<
      UpdatePricingConfigRequest,
      UpdatePricingConfigResponse
    >({
      method: "POST",
      endpoint: adminPricing.configUpdate,
      data: {
        purchase_price: data.purchase_price,
      },
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for updating purchase price.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error updating purchase price.");
  }
};

/**
 * Get all pricing tiers for active configuration
 */
export const getAllPricingTiers = async (
  apiKey: string
): Promise<GetPricingTiersResponse | undefined> => {
  try {
    const response = await billingApiRequest<Record<string, never>, GetPricingTiersResponse>({
      method: "POST",
      endpoint: adminPricing.tiersList,
      data: {},
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for pricing tiers.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error fetching pricing tiers.");
  }
};

/**
 * Create a new pricing tier
 */
export const createPricingTier = async (
  data: CreatePricingTierRequest,
  apiKey: string
): Promise<CreatePricingTierResponse | undefined> => {
  try {
    const response = await billingApiRequest<CreatePricingTierRequest, CreatePricingTierResponse>({
      method: "POST",
      endpoint: adminPricing.tiersCreate,
      data: {
        tier_name: data.tier_name,
        volume_min: data.volume_min,
        volume_max: data.volume_max,
        sale_price: data.sale_price,
        tier_order: data.tier_order,
      },
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for creating pricing tier.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error creating pricing tier.");
  }
};

/**
 * Update an existing pricing tier
 */
export const updatePricingTier = async (
  data: UpdatePricingTierRequest,
  apiKey: string
): Promise<UpdatePricingTierResponse | undefined> => {
  try {
    const response = await billingApiRequest<UpdatePricingTierRequest, UpdatePricingTierResponse>({
      method: "POST",
      endpoint: adminPricing.tiersUpdate,
      data: {
        tier_id: data.tier_id,
        tier_name: data.tier_name,
        volume_min: data.volume_min,
        volume_max: data.volume_max,
        sale_price: data.sale_price,
        tier_order: data.tier_order,
      },
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for updating pricing tier.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error updating pricing tier.");
  }
};

/**
 * Toggle pricing tier status (activate/deactivate)
 */
export const togglePricingTier = async (
  data: TogglePricingTierRequest,
  apiKey: string
): Promise<TogglePricingTierResponse | undefined> => {
  try {
    const response = await billingApiRequest<TogglePricingTierRequest, TogglePricingTierResponse>({
      method: "POST",
      endpoint: adminPricing.tiersToggle,
      data: {
        tier_id: data.tier_id,
      },
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for toggling pricing tier.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error toggling pricing tier status.");
  }
};
