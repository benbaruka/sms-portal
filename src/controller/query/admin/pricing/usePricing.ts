import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAlert } from "@/context/AlertProvider";
import {
  getPricingConfig,
  updatePricingConfig,
  getPricingTiers,
  createPricingTier,
  updatePricingTier,
  togglePricingTier,
} from "./pricing.service";
import {
  UpdatePricingConfigRequest,
  CreatePricingTierRequest,
  UpdatePricingTierRequest,
  TogglePricingTierRequest,
} from "@/types";

export const useGetPricingConfig = (apiKey: string | null, enabled: boolean = true) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["pricing", "config", apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getPricingConfig(apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving pricing configuration.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error, showAlert]);

  return query;
};

export const useUpdatePricingConfig = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: { data: UpdatePricingConfigRequest; apiKey: string }) => {
      if (!apiKey) throw new Error("API key is required");
      return updatePricingConfig(data, apiKey);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["pricing", "config"] });
      showAlert({
        variant: "success",
        title: "Success",
        message: data?.message?.message || "Purchase price updated successfully!",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to update pricing configuration.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useGetPricingTiers = (apiKey: string | null, enabled: boolean = true) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["pricing", "tiers", apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getPricingTiers(apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving pricing tiers.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error, showAlert]);

  return query;
};

export const useCreatePricingTier = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: { data: CreatePricingTierRequest; apiKey: string }) => {
      if (!apiKey) throw new Error("API key is required");
      return createPricingTier(data, apiKey);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["pricing", "tiers"] });
      showAlert({
        variant: "success",
        title: "Success",
        message: data?.message?.message || "Pricing tier created successfully!",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to create pricing tier.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useUpdatePricingTier = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: { data: UpdatePricingTierRequest; apiKey: string }) => {
      if (!apiKey) throw new Error("API key is required");
      return updatePricingTier(data, apiKey);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["pricing", "tiers"] });
      showAlert({
        variant: "success",
        title: "Success",
        message: data?.message?.message || "Pricing tier updated successfully!",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to update pricing tier.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useTogglePricingTier = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, apiKey }: { data: TogglePricingTierRequest; apiKey: string }) => {
      if (!apiKey) throw new Error("API key is required");
      return togglePricingTier(data, apiKey);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["pricing", "tiers"] });
      const action = data?.message?.is_active ? "activated" : "deactivated";
      showAlert({
        variant: "success",
        title: "Success",
        message: data?.message?.message || `Pricing tier ${action} successfully!`,
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to toggle pricing tier status.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};
