import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAlert } from "@/context/AlertProvider";
import {
  getAdminBillingStatistics,
  getAdminClientStatistics,
  getAdminGlobalStatistics,
} from "./statistics.service";
import {
  AdminBillingStatisticsRequest,
  AdminClientStatisticsRequest,
  AdminGlobalStatisticsRequest,
} from "@/types";

export const useAdminGlobalStatistics = (
  params: AdminGlobalStatisticsRequest,
  apiKey: string | null,
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["admin-statistics", "global", params, apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getAdminGlobalStatistics(params, apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const message =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving global statistics.";
      showAlert({
        variant: "error",
        title: "Error",
        message,
      });
    }
  }, [query.isError, query.error]);

  return query;
};

export const useAdminBillingStatistics = (
  params: AdminBillingStatisticsRequest,
  apiKey: string | null,
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["admin-statistics", "billing", params, apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getAdminBillingStatistics(params, apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const message =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving billing statistics.";
      showAlert({
        variant: "error",
        title: "Error",
        message,
      });
    }
  }, [query.isError, query.error]);

  return query;
};

export const useAdminClientStatistics = (
  params: AdminClientStatisticsRequest,
  apiKey: string | null,
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["admin-statistics", "clients", params, apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getAdminClientStatistics(params, apiKey);
    },
    enabled: enabled && !!apiKey,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      const message =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving client statistics.";
      showAlert({
        variant: "error",
        title: "Error",
        message,
      });
    }
  }, [query.isError, query.error]);

  return query;
};
