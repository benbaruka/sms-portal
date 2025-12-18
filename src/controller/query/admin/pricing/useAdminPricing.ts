import { useAlert } from "@/context/AlertProvider";
import {
  CreatePricingTierRequest,
  TogglePricingTierRequest,
  UpdatePricingConfigRequest,
  UpdatePricingTierRequest,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPricingTier,
  getActivePricingConfig,
  getAllPricingTiers,
  togglePricingTier,
  updatePricingTier,
  updatePurchasePrice,
} from "./pricing.service";

/**
 * Hook to get active pricing configuration
 */
export const useActivePricingConfig = (apiKey: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["admin-pricing", "config", "active", apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getActivePricingConfig(apiKey);
    },
    enabled: enabled && !!apiKey,
  });
};

/**
 * Hook to update purchase price
 */
export const useUpdatePurchasePrice = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: { data: UpdatePricingConfigRequest; apiKey: string }) => {
      if (!apiKey) throw new Error("API key is required");
      return updatePurchasePrice(data, apiKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pricing", "config"] });
      showAlert({
        variant: "success",
        title: "Purchase Price Updated",
        message: "The purchase price has been updated successfully.",
      });
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update purchase price.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

/**
 * Hook to get all pricing tiers
 */
export const useAllPricingTiers = (apiKey: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["admin-pricing", "tiers", "list", apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getAllPricingTiers(apiKey);
    },
    enabled: enabled && !!apiKey,
  });
};

/**
 * Hook to create a pricing tier
 */
export const useCreatePricingTier = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: { data: CreatePricingTierRequest; apiKey: string }) => {
      if (!apiKey) throw new Error("API key is required");
      return createPricingTier(data, apiKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pricing", "tiers"] });
      showAlert({
        variant: "success",
        title: "Pricing Tier Created",
        message: "The pricing tier has been created successfully.",
      });
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create pricing tier.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

/**
 * Hook to update a pricing tier
 */
export const useUpdatePricingTier = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: { data: UpdatePricingTierRequest; apiKey: string }) => {
      if (!apiKey) throw new Error("API key is required");
      return updatePricingTier(data, apiKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pricing", "tiers"] });
      showAlert({
        variant: "success",
        title: "Pricing Tier Updated",
        message: "The pricing tier has been updated successfully.",
      });
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update pricing tier.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

/**
 * Hook to toggle pricing tier status
 */
export const useTogglePricingTier = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: { data: TogglePricingTierRequest; apiKey: string }) => {
      if (!apiKey) throw new Error("API key is required");
      return togglePricingTier(data, apiKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pricing", "tiers"] });
      showAlert({
        variant: "success",
        title: "Pricing Tier Status Updated",
        message: "The pricing tier status has been updated successfully.",
      });
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to toggle pricing tier status.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};
