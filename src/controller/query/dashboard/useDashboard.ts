import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  getDashboardSummary,
  getMessagesSentByType,
  getMessageGraph,
  getMessageNetworkGraph,
  getScheduledMessages,
  getBillingStats,
  getClientsList,
  getClientReports,
  getClientTransactionalSMS,
  getClientPromotionalSMS,
} from "./dashboard.service";
import {
  DashboardSummaryRequest,
  MessageSentRequest,
  MessageGraphRequest,
  ScheduledMessagesRequest,
  BillingStatsRequest,
  ClientsListRequest,
  ClientReportsRequest,
  ClientSMSRequest,
} from "@/types";
import { useAlert } from "@/context/AlertProvider";
export const useDashboardSummary = (
  params: DashboardSummaryRequest,
  apiKey: string | null,
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["dashboard", "summary", params, apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getDashboardSummary(params, apiKey);
    },
    enabled: enabled && !!apiKey,
  });
  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving dashboard summary.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error]);
  return query;
};
export const useMessagesSentByType = (
  type: "promotional" | "transactional",
  params: MessageSentRequest,
  apiKey: string | null,
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["dashboard", "messages-sent", type, params, apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getMessagesSentByType(type, params, apiKey);
    },
    enabled: enabled && !!apiKey,
  });
  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving messages.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error]);
  return query;
};
export const useMessageGraph = (
  type: "promotional" | "transactional",
  params: MessageGraphRequest,
  apiKey: string | null,
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["dashboard", "message-graph", type, params, apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getMessageGraph(type, params, apiKey);
    },
    enabled: enabled && !!apiKey,
  });
  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving message graph.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error]);
  return query;
};
export const useMessageNetworkGraph = (
  type: "promotional" | "transactional",
  params: MessageGraphRequest,
  apiKey: string | null,
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["dashboard", "message-network-graph", type, params, apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getMessageNetworkGraph(type, params, apiKey);
    },
    enabled: enabled && !!apiKey,
  });
  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving network graph.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error]);
  return query;
};
export const useScheduledMessages = (
  params: ScheduledMessagesRequest,
  apiKey: string | null,
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["dashboard", "scheduled-messages", params, apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getScheduledMessages(params, apiKey);
    },
    enabled: enabled && !!apiKey,
  });
  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving scheduled messages.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error]);
  return query;
};
export const useBillingStats = (
  params: BillingStatsRequest,
  apiKey: string | null,
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["dashboard", "billing-stats", params, apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getBillingStats(params, apiKey);
    },
    enabled: enabled && !!apiKey,
  });
  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving billing stats.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error]);
  return query;
};
export const useClientsList = (
  params: ClientsListRequest,
  apiKey: string | null,
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["dashboard", "clients", params, apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getClientsList(params, apiKey);
    },
    enabled: enabled && !!apiKey,
  });
  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving clients list.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error]);
  return query;
};
export const useClientReports = (
  type: "summary" | "connector" | "sender",
  params: ClientReportsRequest,
  apiKey: string | null,
  enabled: boolean = true,
  isSuperAdmin: boolean = false
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["dashboard", "client-reports", type, params, apiKey, isSuperAdmin],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      // Backend requires id to be present and non-zero (rejects id: 0)
      // For regular users, id must be provided and non-zero
      // For super admin, a specific client_id must be provided (not 0)
      if (!params.id || params.id === 0) {
        throw new Error("Client ID is required and must be non-zero for client reports.");
      }
      return getClientReports(type, params, apiKey, isSuperAdmin);
    },
    enabled: enabled && !!apiKey && !!params.id && params.id !== 0,
  });
  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        `Error retrieving client reports (${type}).`;
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error]);
  return query;
};
export const useClientTransactionalSMS = (
  params: ClientSMSRequest,
  apiKey: string | null,
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["dashboard", "client-transactional-sms", params, apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getClientTransactionalSMS(params, apiKey);
    },
    enabled: enabled && !!apiKey,
  });
  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving client transactional SMS.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error]);
  return query;
};
export const useClientPromotionalSMS = (
  params: ClientSMSRequest,
  apiKey: string | null,
  enabled: boolean = true
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["dashboard", "client-promotional-sms", params, apiKey],
    queryFn: () => {
      if (!apiKey) throw new Error("API key is required");
      return getClientPromotionalSMS(params, apiKey);
    },
    enabled: enabled && !!apiKey,
  });
  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        (query.error instanceof Error ? query.error.message : undefined) ||
        "Error retrieving client promotional SMS.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  }, [query.isError, query.error]);
  return query;
};
