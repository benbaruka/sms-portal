import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAlert } from "@/context/AlertProvider";
import {
  getBenefitGraph,
  getBenefitByTier,
  getBenefitByClient,
  getBenefitDetails,
} from "./benefit.service";
import {
  BenefitGraphRequest,
  BenefitByTierRequest,
  BenefitByClientRequest,
  BenefitDetailsRequest,
} from "@/types";

export const useBenefitGraph = (
  params: BenefitGraphRequest = {},
  apiKey: string | null,
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["benefit", "graph", params, apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getBenefitGraph(params, apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving benefit graph data.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error, showAlert]);

  return query;
};

export const useBenefitByTier = (
  params: BenefitByTierRequest,
  apiKey: string | null,
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["benefit", "by-tier", params, apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getBenefitByTier(params, apiKey);
    },
    enabled: enabled && !!apiKey && !!params.start_date && !!params.end_date,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving benefit by tier data.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error, showAlert]);

  return query;
};

export const useBenefitByClient = (
  params: BenefitByClientRequest,
  apiKey: string | null,
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["benefit", "by-client", params, apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getBenefitByClient(params, apiKey);
    },
    enabled: enabled && !!apiKey && !!params.start_date && !!params.end_date,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving benefit by client data.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error, showAlert]);

  return query;
};

export const useBenefitDetails = (
  params: BenefitDetailsRequest = {},
  apiKey: string | null,
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["benefit", "details", params, apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getBenefitDetails(params, apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving benefit details.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error, showAlert]);

  return query;
};
