"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  useDashboardSummary,
  useMessageGraph,
  useMessageNetworkGraph,
  useMessagesSentByType,
  useBillingStats,
  useClientsList,
} from "@/controller/query/dashboard/useDashboard";
import { useAuth } from "@/context/AuthProvider";
import { getCookie } from "cookies-next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader, CardSkeleton, TableSkeleton } from "@/components/ui/loader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Line,
} from "recharts";
import {
  MessageSquare,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Filter,
  Calendar,
  RefreshCw,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Wallet,
  Building2,
  Mail,
  Phone,
} from "lucide-react";
import {
  format,
  subDays,
  startOfYear,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { isSuperAdmin as isSuperAdminUtil } from "@/utils/userUtils";

type MessageType = "promotional" | "transactional" | "all";
type QuickFilter = "today" | "week" | "month" | "year" | "custom";

const chartConfig = {
  sent: {
    label: "Sent",
    color: "hsl(221, 83%, 53%)",
  },
  contacts: {
    label: "Contacts",
    color: "hsl(25, 95%, 53%)",
  },
  credits: {
    label: "Credits",
    color: "hsl(45, 93%, 47%)",
  },
  delivered: {
    label: "Delivered",
    color: "hsl(142, 76%, 36%)",
  },
  failed: {
    label: "Failed",
    color: "hsl(0, 84%, 60%)",
  },
  pending: {
    label: "Pending",
    color: "hsl(45, 93%, 47%)",
  },
  promotional: {
    label: "Promotional",
    color: "hsl(262, 83%, 58%)",
  },
  transactional: {
    label: "Transactional",
    color: "hsl(221, 83%, 53%)",
  },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null); // Generated token from histories
  const [messageType, setMessageType] = useState<MessageType>("all");
  // Default to current year (like sms-portal-ui)
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("year");

  // Custom date range states
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  const [useCustomDateRange, setUseCustomDateRange] = useState(false);

  // Clients table states (for super admin only) - removed pagination/search/sort states for recent clients only

  // Super admin: account_type === "root" OR client.id === 1 (ADMIN_CLIENT_ID)
  // Backend uses clientID == 1 to check for super admin, so we check both for consistency
  // Regular clients: account_type !== "root" AND client.id > 1
  const clientData = user?.message?.client;
  const isSuperAdmin = isSuperAdminUtil(clientData);

  // Check if user has documents - redirect to upload page if not
  // But allow access if user clicked "Skip for Now"
  useEffect(() => {
    const skipped = localStorage.getItem("documents_upload_skipped");
    if (user?.message?.has_documents === 0 && !skipped) {
      router.push("/upload-documents");
    }
  }, [user, router]);

  useEffect(() => {
    // Following sms-portal-ui logic: use the login token (request.session.auth) for SMS API requests
    // The token from login is stored in authToken cookie/localStorage
    const cookieToken = getCookie("authToken");
    const storedAuthToken =
      typeof cookieToken === "string" ? cookieToken : localStorage.getItem("authToken");

    // In sms-portal-ui, request.session.auth (login token) is used directly for SMS API requests
    // This is the token from login response, not the token from histories
    if (storedAuthToken && typeof storedAuthToken === "string") {
      setToken(storedAuthToken);
    }

    // Get generated token (from histories) for billing-stats endpoint (api-key header)
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  // Calculate date range based on quickFilter or custom date range (following sms-portal-ui format: start/end)
  // Default to current year if no filter is selected
  const dateRange = useMemo(() => {
    // If custom date range is enabled and both dates are set, use custom dates
    if (useCustomDateRange && customStartDate && customEndDate) {
      return {
        start: format(startOfDay(customStartDate), "yyyy-MM-dd"),
        end: format(endOfDay(customEndDate), "yyyy-MM-dd"),
      };
    }

    // Otherwise, use quick filter
    const now = new Date();
    let startDate: Date;
    let endDate: Date = endOfDay(now);

    switch (quickFilter) {
      case "today":
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case "week":
        startDate = startOfDay(subDays(now, 7));
        endDate = endOfDay(now);
        break;
      case "month":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "year":
        startDate = startOfYear(now);
        endDate = endOfDay(now);
        break;
      default:
        // Default to current year (like sms-portal-ui)
        startDate = startOfYear(now);
        endDate = endOfDay(now);
    }

    // Following sms-portal-ui format: use start/end instead of start_date/end_date
    return {
      start: format(startDate, "yyyy-MM-dd"),
      end: format(endDate, "yyyy-MM-dd"),
    };
  }, [quickFilter, useCustomDateRange, customStartDate, customEndDate]);

  // According to Postman documentation, dashboard endpoints use api-key header
  // Use generated token (apiKey) for dashboard endpoints instead of login token
  // Following Postman documentation: dashboard endpoints use api-key header
  const dashboardToken = apiKey || token; // Use apiKey if available, fallback to token

  // Fetch dashboard summary with date range (for filtered stats)
  const {
    data: summaryData,
    isLoading: isLoadingSummary,
    refetch: refetchSummary,
  } = useDashboardSummary(dateRange, dashboardToken, !!dashboardToken);

  // Fetch dashboard summary WITHOUT dates (allTime - for global stats like all_contacts, all_sent_message, all_credits, etc.)
  // Following sms-portal-ui: allTime() calls /dashboard/summary without dates
  const { data: allTimeSummaryData, isLoading: isLoadingAllTimeSummary } = useDashboardSummary(
    {}, // Empty object for all-time stats (no start/end dates)
    dashboardToken,
    !!dashboardToken
  );

  // Determine graph type based on messageType filter
  // If "all" is selected, default to "transactional" for main graph
  // Otherwise use the selected type
  const graphType = messageType === "all" ? "transactional" : messageType;

  // Fetch message graph data (filtered by messageType)
  const { data: graphData, isLoading: isLoadingGraph } = useMessageGraph(
    graphType,
    dateRange,
    dashboardToken,
    !!dashboardToken &&
      (messageType === "all" || messageType === "transactional" || messageType === "promotional")
  );

  // Fetch transactional network graph (only if "all" or "transactional" is selected)
  const { data: transactionalNetworkData, isLoading: isLoadingTransactionalNetwork } =
    useMessageNetworkGraph(
      "transactional",
      dateRange,
      dashboardToken,
      !!dashboardToken && (messageType === "all" || messageType === "transactional")
    );

  // Fetch promotional network graph (only if "all" or "promotional" is selected)
  const { data: promotionalNetworkData, isLoading: isLoadingPromotionalNetwork } =
    useMessageNetworkGraph(
      "promotional",
      dateRange,
      dashboardToken,
      !!dashboardToken && (messageType === "all" || messageType === "promotional")
    );

  // Fetch transactional messages stats (for detailed stats display)
  // Only fetch if "all" or "transactional" is selected
  const { data: transactionalStatsData, isLoading: isLoadingTransactionalStats } =
    useMessagesSentByType(
      "transactional",
      dateRange,
      dashboardToken,
      !!dashboardToken && (messageType === "all" || messageType === "transactional")
    );

  // Note: Recent messages tables now use direct endpoints (message/all/transactional and message/all/promotional)
  // with POST requests, filtered by current year (from start of year to today), limited to 5 items
  // The RecentMessagesTable component handles all the data fetching internally

  // Fetch promotional messages for statistics (not for recent messages table)
  const { data: promotionalMessages, isLoading: isLoadingPromo } = useMessagesSentByType(
    "promotional",
    { ...dateRange, page: 1, limit: 10 },
    dashboardToken,
    !!dashboardToken && (messageType === "all" || messageType === "promotional")
  );

  // Fetch scheduled messages
  const { isLoading: isLoadingTrans } = useMessagesSentByType(
    "transactional",
    { ...dateRange, page: 1, limit: 10 },
    dashboardToken,
    !!dashboardToken && (messageType === "all" || messageType === "transactional")
  );

  // Fetch billing stats (uses Billing API with api-key header, not SMS API)
  const {
    data: billingStatsData,
    isLoading: isLoadingBillingStats,
    refetch: refetchBillingStats,
  } = useBillingStats(
    dateRange,
    apiKey, // Use generated token (from histories) as api-key header
    isSuperAdmin && !!apiKey // Only fetch for super admin and if apiKey exists
  );

  // Fetch 5 most recent clients (for super admin only)
  // Uses Billing API with api-key header (same as billing-stats endpoint)
  const {
    data: clientsData,
    isLoading: isLoadingClients,
    refetch: refetchClients,
  } = useClientsList(
    {
      page: 1,
      per_page: 5, // Only load 5 recent clients
      search: "", // No search for recent clients
      sort: "created", // Sort by creation date
      order: "desc", // Most recent first
    },
    apiKey, // Use generated token (from histories) as api-key header
    isSuperAdmin && !!apiKey // Only fetch for super admin and if apiKey exists
  );

  // Extract summary data (with date range)
  const summary = summaryData?.message || {};

  // Extract all-time summary data (without date range - following sms-portal-ui allTime())
  const allTimeSummary = allTimeSummaryData?.message || {};

  // Extract transactional stats
  const transactionalStats = transactionalStatsData?.message || {};

  // Extract network data (following sms-portal-ui structure)
  // API returns: { status: number, message: [...] } where message is an array of network objects
  // Each network object: { network: string, delivered: number, ... }
  const transactionalNetworks = Array.isArray(transactionalNetworkData?.message)
    ? transactionalNetworkData.message
    : Array.isArray(transactionalNetworkData)
      ? transactionalNetworkData
      : [];
  const promotionalNetworks = Array.isArray(promotionalNetworkData?.message)
    ? promotionalNetworkData.message
    : Array.isArray(promotionalNetworkData)
      ? promotionalNetworkData
      : [];

  // Debug: Log network data to understand structure

  // Extract billing stats from API response
  // API returns directly: { total_clients: 20, total_amount_spent: 21303, system_balance: 999878.2 }
  // OR with wrapper: { status: number, message: { total_clients, total_amount_spent, system_balance } }
  // Handle both cases
  let billingStats = {
    total_clients: 0,
    total_amount_spent: 0,
    system_balance: 0,
  };

  if (billingStatsData) {
    // Check if data is directly in the response (no wrapper)
    if (
      billingStatsData.total_clients !== undefined ||
      billingStatsData.total_amount_spent !== undefined ||
      billingStatsData.system_balance !== undefined
    ) {
      // Direct structure: { total_clients, total_amount_spent, system_balance }
      billingStats = {
        total_clients: billingStatsData.total_clients ?? 0,
        total_amount_spent: billingStatsData.total_amount_spent ?? 0,
        system_balance: billingStatsData.system_balance ?? 0,
      };
    }
    // Check if data is in message wrapper
    else if (billingStatsData.message) {
      billingStats = {
        total_clients: billingStatsData.message.total_clients ?? 0,
        total_amount_spent: billingStatsData.message.total_amount_spent ?? 0,
        system_balance: billingStatsData.message.system_balance ?? 0,
      };
    }
  }

  // Debug: Log billing stats data to help troubleshoot

  // Extract clients data
  // For super admin: filter out super admin itself (id:1) - only show regular clients (id > 1)
  const allClients = clientsData?.data?.clients || [];
  const clients = isSuperAdmin
    ? allClients.filter(
        (client: { id?: number | string }) =>
          (typeof client.id === "number" ? client.id : Number(client.id)) > 1
      ) // Exclude super admin (id:1), only show regular clients
    : allClients; // For regular clients, show all (should be empty anyway)

  // Prepare stats from API data (using allTimeSummary for global stats - following sms-portal-ui)
  const stats = [
    {
      title: "Total Sent",
      value: allTimeSummary.all_sent_message || summary.total_sent || 0,
      change: "+0%",
      trend: "up" as const,
      icon: Send,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10 dark:bg-blue-500/20",
    },
    {
      title: "Delivered",
      value: allTimeSummary.successful || summary.total_delivered || 0,
      change: "+0%",
      trend: "up" as const,
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-500/10 dark:bg-green-500/20",
    },
    {
      title: "Failed",
      value: allTimeSummary.failed || summary.total_failed || 0,
      change: "-0%",
      trend: "down" as const,
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-500/10 dark:bg-red-500/20",
    },
    {
      title: "Pending",
      value: allTimeSummary.pending || summary.total_pending || 0,
      change: "+0%",
      trend: "up" as const,
      icon: Clock,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-500/10 dark:bg-yellow-500/20",
    },
  ];

  // Billing stats from API (for super admin only)
  // API response structure: { total_clients: 20, total_amount_spent: 21303, system_balance: 999878.2 }
  // Always display the values from API, even if they are 0
  const billingStatsCards = [
    {
      title: "Total Clients",
      value: billingStats.total_clients,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10 dark:bg-blue-500/20",
    },
    {
      title: "Total Amount Spent",
      value: `$${billingStats.total_amount_spent.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Wallet,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-500/10 dark:bg-green-500/20",
    },
    {
      title: "System Balance",
      value: `$${billingStats.system_balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Building2,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-500/10 dark:bg-purple-500/20",
    },
  ];

  // Transform graph data for charts (following sms-portal-ui structure)
  // sms-portal-ui uses: graphData.series (timeline), graphData.messages, graphData.contacts, graphData.credits, graphData.deliveries
  const chartData = useMemo(() => {
    const graphMessage =
      (graphData?.message as {
        series?: string[];
        labels?: string[];
        messages?: number[];
        data?: number[];
        contacts?: number[];
        credits?: number[];
        deliveries?: { delivered: number; failed: number; pending: number };
      }) || {};

    // Handle different API response structures
    // Structure 1: { series: [...], messages: [...], contacts: [...], credits: [...], deliveries: {...} }
    // Structure 2: { labels: [...], data: [...] }
    const series =
      (Array.isArray(graphMessage.series) ? graphMessage.series : []) ||
      (Array.isArray(graphMessage.labels) ? graphMessage.labels : []);
    const messages =
      (Array.isArray(graphMessage.messages) ? graphMessage.messages : []) ||
      (Array.isArray(graphMessage.data) ? graphMessage.data : []);
    const contacts = Array.isArray(graphMessage.contacts) ? graphMessage.contacts : [];
    const credits = Array.isArray(graphMessage.credits) ? graphMessage.credits : [];

    if (series.length === 0) {
      return [];
    }

    // Transform API data to chart format (following sms-portal-ui)
    // Each point in the timeline has: messages, contacts, credits
    // deliveries is a single object with totals, not per point
    // Note: failed/delivered data is not available per period, only as totals in deliveries
    return series.map((label: string, index: number) => ({
      name: label,
      sent: messages[index] || 0,
      contacts: contacts[index] || 0,
      credits: credits[index] || 0,
    }));
  }, [graphData]);

  // Extract deliveries data for pie chart (following sms-portal-ui)
  const deliveriesData = useMemo(() => {
    const graphMessage =
      (graphData?.message as {
        deliveries?: { delivered: number; failed: number; pending: number };
      }) || {};
    const deliveries = graphMessage.deliveries || { delivered: 0, failed: 0, pending: 0 };
    return [
      { name: "Delivered", value: deliveries.delivered || 0, color: "hsl(221, 83%, 53%)" },
      { name: "Failed", value: deliveries.failed || 0, color: "hsl(0, 84%, 60%)" },
      { name: "Pending", value: deliveries.pending || 0, color: "hsl(45, 93%, 47%)" },
    ];
  }, [graphData]);

  // Note: Recent messages are now fetched directly by RecentMessagesTable component
  // using message/all/transactional and message/all/promotional endpoints with POST

  const handleRefresh = useCallback(() => {
    refetchSummary();
    if (isSuperAdmin) {
      refetchBillingStats();
      refetchClients();
    }
  }, [refetchSummary, refetchBillingStats, refetchClients, isSuperAdmin]);

  if (!token) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
        <MessageSquare className="h-16 w-16 text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300">
          Authentication Required
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Please sign in to view dashboard statistics.
        </p>
      </div>
    );
  }

  const isLoading =
    isLoadingSummary ||
    isLoadingAllTimeSummary ||
    isLoadingGraph ||
    isLoadingPromo ||
    isLoadingTrans ||
    isLoadingTransactionalNetwork ||
    isLoadingPromotionalNetwork ||
    isLoadingTransactionalStats ||
    (isSuperAdmin && isLoadingBillingStats);

  return (
    <div className="min-h-screen space-y-6 p-4 md:space-y-8 md:p-6 lg:p-8">
      {/* Header - Modern Design */}
      <div className="relative rounded-2xl border border-gray-200/80 bg-white/80 shadow-xl shadow-brand-500/5 backdrop-blur-xl dark:border-gray-800/80 dark:bg-gray-900/80">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDMwaDJ2MmgtMnptMC02aDJ2MmgtMnptNiA2aDJ2MmgtMnptMC02aDJ2MmgtMnptLTEyIDZoMnYyaC0yem0wLTZoMnYyaC0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />

        <div className="relative border-b border-gray-200/50 bg-gradient-to-br from-brand-500/10 via-blue-light-500/5 to-brand-500/10 px-6 py-6 dark:border-gray-800/50 dark:from-brand-900/20 dark:via-blue-light-900/10 dark:to-brand-900/20 md:px-8 md:py-8">
          <div className="flex flex-col gap-4 md:gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Title Section */}
            <div className="flex items-center gap-4 md:gap-5">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-500 to-blue-light-500 opacity-50 blur-lg"></div>
                <div className="relative rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-blue-light-500 p-3 shadow-lg shadow-brand-500/30 md:p-4">
                  <BarChart3 className="h-6 w-6 text-white md:h-7 md:w-7 lg:h-8 lg:w-8" />
                </div>
              </div>
              <div>
                <CardTitle className="mb-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-xl font-bold text-transparent dark:from-white dark:via-gray-100 dark:to-white md:text-2xl lg:text-3xl">
                  Dashboard
                </CardTitle>
                <CardDescription className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 md:text-base">
                  <span>Welcome back,</span>
                  <span className="font-semibold text-brand-600 dark:text-brand-400">
                    {user?.message?.user?.full_name || user?.message?.client?.name || "User"}
                  </span>
                </CardDescription>
              </div>
            </div>

            {/* Date Range Display - Modern Badge */}
            <div className="flex items-center gap-3 rounded-xl border border-gray-200/80 bg-white/90 px-4 py-3 shadow-lg shadow-brand-500/5 backdrop-blur-sm dark:border-gray-700/80 dark:bg-gray-800/90 md:px-5">
              <div className="rounded-lg bg-gradient-to-br from-brand-500/10 to-blue-light-500/10 p-2 dark:from-brand-500/20 dark:to-blue-light-500/20">
                <Calendar className="h-4 w-4 text-brand-600 dark:text-brand-400 md:h-5 md:w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 md:text-xs">
                  Period
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white md:text-base">
                  {useCustomDateRange && customStartDate && customEndDate
                    ? `${format(customStartDate, "MMM dd, yyyy")} - ${format(customEndDate, "MMM dd, yyyy")}`
                    : quickFilter === "today"
                      ? format(new Date(), "MMM dd, yyyy")
                      : quickFilter === "week"
                        ? `${format(subDays(new Date(), 7), "MMM dd")} - ${format(new Date(), "MMM dd, yyyy")}`
                        : quickFilter === "month"
                          ? `${format(startOfMonth(new Date()), "MMM dd")} - ${format(endOfMonth(new Date()), "MMM dd, yyyy")}`
                          : quickFilter === "year"
                            ? `${format(startOfYear(new Date()), "MMM dd, yyyy")} - ${format(new Date(), "MMM dd, yyyy")}`
                            : format(new Date(), "MMM dd, yyyy")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 p-6 md:p-8">
          {/* Filters Row - Modern Design */}
          <div className="flex flex-col gap-4 md:gap-5">
            <div className="flex flex-col items-end gap-3 sm:flex-row md:gap-4">
              {/* Time Period Filter */}
              <div className="relative z-20 flex-1 sm:w-[200px] sm:flex-initial md:w-[220px]">
                <label className="mb-2 block flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 md:mb-2.5 md:text-sm">
                  <div className="rounded-lg bg-brand-500/10 p-1.5 dark:bg-brand-500/20">
                    <Filter className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400 md:h-4 md:w-4" />
                  </div>
                  <span>Time Period</span>
                </label>
                <Select
                  value={useCustomDateRange ? "custom" : quickFilter}
                  onValueChange={(value) => {
                    if (value === "custom") {
                      setUseCustomDateRange(true);
                    } else {
                      setUseCustomDateRange(false);
                      setQuickFilter(value as QuickFilter);
                    }
                  }}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl border-2 border-gray-200 bg-white/90 text-sm shadow-md backdrop-blur-sm transition-all hover:shadow-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:focus:border-brand-400 md:h-12 md:text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[99999]">
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Message Type Filter */}
              <div className="relative z-20 flex-1 sm:w-[200px] sm:flex-initial md:w-[220px]">
                <label className="mb-2 block flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 md:mb-2.5 md:text-sm">
                  <div className="rounded-lg bg-brand-500/10 p-1.5 dark:bg-brand-500/20">
                    <MessageSquare className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400 md:h-4 md:w-4" />
                  </div>
                  <span>Message Type</span>
                </label>
                <Select
                  value={messageType}
                  onValueChange={(value) => setMessageType(value as MessageType)}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl border-2 border-gray-200 bg-white/90 text-sm shadow-md backdrop-blur-sm transition-all hover:shadow-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:focus:border-brand-400 md:h-12 md:text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[99999]">
                    <SelectItem value="all">All Messages</SelectItem>
                    <SelectItem value="promotional">Promotional</SelectItem>
                    <SelectItem value="transactional">Transactional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Refresh Button */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 rounded-xl border-2 border-gray-200 shadow-md transition-all hover:border-brand-500 hover:bg-brand-50 hover:shadow-lg dark:border-gray-700 dark:hover:border-brand-400 dark:hover:bg-brand-900/20 md:h-12 md:w-12"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  title="Refresh data"
                >
                  <RefreshCw
                    className={`h-4 w-4 md:h-5 md:w-5 ${isLoading ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            </div>

            {/* Custom Date Range Picker - Only shown when custom is selected */}
            {useCustomDateRange && (
              <div className="flex flex-col items-end gap-3 rounded-xl border-2 border-brand-200/60 bg-gradient-to-br from-brand-50/80 via-blue-light-50/60 to-brand-50/80 p-4 shadow-lg backdrop-blur-sm dark:border-gray-700/60 dark:from-gray-800/60 dark:via-gray-800/40 dark:to-gray-800/60 sm:flex-row md:p-5">
                <div className="w-full flex-1">
                  <label className="mb-2.5 block flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 md:text-sm">
                    <div className="rounded-lg bg-brand-500/20 p-1.5 dark:bg-brand-500/30">
                      <Calendar className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400 md:h-4 md:w-4" />
                    </div>
                    <span>Select Date Range</span>
                  </label>
                  <DateRangePicker
                    startDate={customStartDate}
                    endDate={customEndDate}
                    onChange={(start: Date | undefined, end: Date | undefined) => {
                      setCustomStartDate(start);
                      setCustomEndDate(end);
                    }}
                    placeholder="Click to select date range"
                    className="w-full"
                    minDate={new Date(2020, 0, 1)}
                    maxDate={new Date()}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setUseCustomDateRange(false);
                    setCustomStartDate(undefined);
                    setCustomEndDate(undefined);
                    setQuickFilter("year");
                  }}
                  className="h-11 rounded-xl border-2 border-gray-300 text-sm shadow-md transition-all hover:border-gray-500 hover:bg-gray-50 hover:shadow-lg dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-800 md:h-12 md:text-base"
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid - Modern Design */}
      {isLoadingSummary || isLoadingAllTimeSummary ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/90 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-500/10 dark:border-gray-800/80 dark:bg-gray-900/90"
              >
                {/* Animated gradient background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                ></div>

                {/* Decorative corner accent */}
                <div
                  className={`absolute right-0 top-0 h-32 w-32 ${stat.bgColor} rounded-full opacity-5 blur-3xl transition-opacity duration-500 group-hover:opacity-10`}
                ></div>

                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 px-6 pb-4 pt-6">
                  <CardTitle className="text-sm font-bold uppercase tracking-wide text-gray-700 dark:text-gray-100">
                    {stat.title}
                  </CardTitle>
                  <div
                    className={`${stat.bgColor} ${stat.color} rounded-xl p-3 shadow-lg transition-all duration-300 group-hover:rotate-3 group-hover:scale-110`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent className="relative px-6 pb-6">
                  <div className="mb-3 text-2xl font-bold tracking-tight text-gray-900 dark:text-white md:text-3xl">
                    {typeof stat.value === "string" ? stat.value : stat.value.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div
                      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 font-semibold shadow-sm ${
                        stat.trend === "up"
                          ? "border border-green-200 bg-green-100 text-green-700 dark:border-green-800 dark:bg-green-900/40 dark:text-green-400"
                          : "border border-orange-200 bg-orange-100 text-orange-700 dark:border-orange-800 dark:bg-orange-900/40 dark:text-orange-400"
                      }`}
                    >
                      {stat.trend === "up" ? (
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDownRight className="h-3.5 w-3.5" />
                      )}
                      <span>{stat.change}</span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">vs last period</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Billing Stats - Modern Design */}
      {isSuperAdmin && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {isLoadingBillingStats ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : (
            billingStatsCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={index}
                  className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/90 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-500/10 dark:border-gray-800/80 dark:bg-gray-900/90"
                >
                  {/* Animated gradient background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                  ></div>

                  <CardHeader className="relative flex flex-row items-center justify-between space-y-0 px-6 pb-4 pt-6">
                    <CardTitle className="text-sm font-bold text-gray-700 dark:text-gray-100 md:text-base">
                      {stat.title}
                    </CardTitle>
                    <div
                      className={`${stat.bgColor} ${stat.color} rounded-xl p-3 shadow-lg transition-all duration-300 group-hover:rotate-3 group-hover:scale-110`}
                    >
                      <Icon className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative px-6 pb-6">
                    <div className="mb-3 text-xl font-bold text-gray-900 dark:text-white md:text-2xl lg:text-3xl">
                      {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                    </div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 md:text-sm">
                      {stat.title === "Total Clients" && "Active clients in system"}
                      {stat.title === "Total Amount Spent" && "Total revenue from clients"}
                      {stat.title === "System Balance" && "Platform balance"}
                    </p>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Overview Section - Modern Design */}
      <Card className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white/90 shadow-xl shadow-brand-500/5 backdrop-blur-xl dark:border-gray-800/80 dark:bg-gray-900/90">
        <CardHeader className="relative border-b border-gray-200/50 bg-gradient-to-br from-brand-500/10 via-blue-light-500/5 to-brand-500/10 px-6 py-6 dark:border-gray-800/50 dark:from-brand-900/20 dark:via-blue-light-900/10 dark:to-brand-900/20 md:px-8 md:py-8">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="rounded-xl bg-gradient-to-br from-brand-500/20 to-blue-light-500/20 p-2.5 dark:from-brand-500/30 dark:to-blue-light-500/30">
              <Activity className="h-5 w-5 text-brand-600 dark:text-brand-400 md:h-6 md:w-6" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white md:text-xl">
                Overview
              </CardTitle>
              <CardDescription className="mt-1.5 text-sm text-gray-600 dark:text-gray-400 md:text-base">
                Message trends and performance metrics
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 md:p-4 lg:p-6">
          {isLoadingGraph ? (
            <div className="flex h-[200px] items-center justify-center md:h-[250px] lg:h-[350px]">
              <Loader size="lg" variant="brand" text="Loading chart data..." />
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center md:h-[250px] lg:h-[350px]">
              <div className="px-4 text-center">
                <BarChart3 className="mx-auto mb-3 h-8 w-8 text-gray-400 md:mb-4 md:h-10 md:w-10 lg:h-12 lg:w-12" />
                <p className="text-xs text-gray-500 dark:text-gray-400 md:text-sm lg:text-base">
                  No data available for the selected period
                </p>
              </div>
            </div>
          ) : (
            <div className="-mx-3 overflow-x-auto md:mx-0">
              <div className="grid min-w-[600px] gap-4 md:min-w-0 md:grid-cols-3 md:gap-6">
                {/* Main Chart - SMS Sent, Contacts, Credits (following sms-portal-ui) */}
                <div className="md:col-span-2">
                  <ChartContainer
                    config={chartConfig}
                    className="h-[200px] w-full min-w-[400px] md:h-[250px] lg:h-[350px] [&_.recharts-active-dot]:fill-yellow-500 dark:[&_.recharts-active-dot]:fill-yellow-500 [&_.recharts-cartesian-axis-tick_text]:!fill-gray-600 [&_.recharts-cartesian-axis-tick_text]:fill-gray-600 [&_.recharts-cartesian-axis-tick_text]:dark:!fill-gray-300 [&_.recharts-cartesian-axis-tick_text]:dark:fill-gray-300 [&_.recharts-tooltip-cursor]:stroke-gray-300 dark:[&_.recharts-tooltip-cursor]:stroke-gray-600"
                  >
                    <ComposedChart
                      data={chartData}
                      margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="gradientSent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="gradientContacts" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="gradientCredits" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(45, 93%, 47%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(45, 93%, 47%)" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        opacity={0.2}
                      />
                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => value}
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                        className="text-xs [&_text]:fill-gray-600 dark:[&_text]:fill-gray-300"
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                        className="text-xs [&_text]:fill-gray-600 dark:[&_text]:fill-gray-300"
                      />
                      <ChartTooltip
                        cursor={{
                          stroke: "hsl(var(--border))",
                          strokeWidth: 1,
                          strokeOpacity: 0.3,
                        }}
                        content={
                          <ChartTooltipContent
                            indicator="dot"
                            className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 [&_span.text-muted-foreground]:text-gray-600 dark:[&_span.text-muted-foreground]:text-gray-400 [&_span]:text-gray-900 dark:[&_span]:text-gray-100"
                          />
                        }
                      />
                      <Bar
                        dataKey="sent"
                        fill="hsl(221, 83%, 53%)"
                        radius={[4, 4, 0, 0]}
                        name="Sent"
                      />
                      <Bar
                        dataKey="contacts"
                        fill="hsl(25, 95%, 53%)"
                        radius={[4, 4, 0, 0]}
                        name="Contacts"
                      />
                      <Line
                        type="monotone"
                        dataKey="credits"
                        stroke="hsl(45, 93%, 47%)"
                        strokeWidth={2}
                        dot={{ fill: "hsl(45, 93%, 47%)", r: 4 }}
                        activeDot={{
                          r: 6,
                          fill: "hsl(45, 93%, 47%)",
                          stroke: "hsl(45, 93%, 47%)",
                          strokeWidth: 2,
                        }}
                        name="Credits"
                      />
                      <ChartLegend
                        content={
                          <ChartLegendContent
                            hideIcon={false}
                            className="[&>div>div]:text-gray-900 dark:[&>div>div]:text-gray-100 [&>div]:text-sm [&>div]:font-semibold [&>div]:text-gray-900 dark:[&>div]:text-gray-100"
                          />
                        }
                        wrapperStyle={{ color: "inherit" }}
                        iconType="square"
                      />
                    </ComposedChart>
                  </ChartContainer>
                </div>

                {/* Pie Chart - Deliveries (following sms-portal-ui) */}
                <div className="flex items-center justify-center">
                  <ChartContainer
                    config={chartConfig}
                    className="h-[250px] w-full md:h-[350px] [&_.recharts-pie-label-text]:fill-gray-900 [&_.recharts-pie-label-text]:text-xs [&_.recharts-pie-label-text]:font-medium [&_.recharts-pie-label-text]:dark:fill-gray-100 [&_.recharts-tooltip-cursor]:stroke-gray-300 dark:[&_.recharts-tooltip-cursor]:stroke-gray-600"
                  >
                    <PieChart>
                      <Pie
                        data={deliveriesData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {deliveriesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            indicator="dot"
                            className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 [&_span.text-muted-foreground]:text-gray-600 dark:[&_span.text-muted-foreground]:text-gray-400 [&_span]:text-gray-900 dark:[&_span]:text-gray-100"
                          />
                        }
                      />
                      <ChartLegend
                        content={
                          <ChartLegendContent className="[&>div>div]:text-gray-700 dark:[&>div>div]:text-gray-200 [&>div]:text-gray-700 dark:[&>div]:text-gray-200" />
                        }
                        wrapperStyle={{ color: "inherit" }}
                      />
                    </PieChart>
                  </ChartContainer>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Network Statistics - Following sms-portal-ui */}
      {/* Only show network graphs if "all" is selected or the corresponding type is selected */}
      {(messageType === "all" ||
        messageType === "transactional" ||
        messageType === "promotional") && (
        <div
          className={`grid grid-cols-1 gap-4 sm:gap-6 ${messageType === "all" ? "lg:grid-cols-2" : "lg:grid-cols-1"}`}
        >
          {/* Transactional SMS Per Network - Only show if "all" or "transactional" */}
          {(messageType === "all" || messageType === "transactional") && (
            <Card className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white/90 shadow-xl shadow-brand-500/5 backdrop-blur-xl dark:border-gray-800/80 dark:bg-gray-900/90">
              <CardHeader className="relative border-b border-gray-200/50 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-blue-500/10 px-6 py-6 dark:border-gray-800/50 dark:from-blue-900/20 dark:via-cyan-900/10 dark:to-blue-900/20 md:px-8 md:py-8">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-2.5 dark:from-blue-500/30 dark:to-cyan-500/30">
                    <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400 md:h-6 md:w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-gray-900 dark:text-white md:text-lg lg:text-xl">
                      Transactional SMS Per Network
                    </CardTitle>
                    <CardDescription className="mt-1.5 text-sm text-gray-600 dark:text-gray-400 md:text-base">
                      Network distribution for transactional messages
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 md:p-4 lg:p-6">
                {isLoadingTransactionalNetwork ? (
                  <div className="flex h-[150px] items-center justify-center md:h-[200px]">
                    <Loader size="md" variant="brand" text="Loading network data..." />
                  </div>
                ) : Array.isArray(transactionalNetworks) && transactionalNetworks.length > 0 ? (
                  <div className="space-y-3 md:space-y-4">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3">
                      {transactionalNetworks.map(
                        (
                          network: { network?: string; delivered?: number; [key: string]: unknown },
                          index: number
                        ) => {
                          // Network colors - different color for each network
                          const networkColors = [
                            "bg-blue-500",
                            "bg-green-500",
                            "bg-purple-500",
                            "bg-orange-500",
                            "bg-pink-500",
                            "bg-cyan-500",
                            "bg-yellow-500",
                            "bg-indigo-500",
                          ];
                          const networkColor = networkColors[index % networkColors.length];
                          const networkName = network.network || "N/A";

                          return (
                            <div
                              key={index}
                              className="group relative rounded-xl border border-gray-200/80 bg-white/90 p-4 shadow-md backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300/50 hover:shadow-xl dark:border-gray-700/80 dark:bg-gray-800/90 dark:hover:border-brand-700/50 md:p-5"
                            >
                              <div className="mb-2 flex items-center gap-2.5 md:mb-3">
                                <div
                                  className={`h-3 w-3 rounded-full md:h-3.5 md:w-3.5 ${networkColor} shadow-lg ring-2 ring-white dark:ring-gray-800`}
                                ></div>
                                <p className="truncate text-xs font-bold text-gray-700 dark:text-gray-300 md:text-sm">
                                  {networkName}
                                </p>
                              </div>
                              <p className="text-lg font-bold text-gray-900 dark:text-white md:text-xl lg:text-2xl">
                                {network.delivered?.toLocaleString() || 0}
                              </p>
                              <p className="mt-1.5 text-[10px] font-medium text-gray-500 dark:text-gray-400 md:text-xs">
                                Delivered
                              </p>
                            </div>
                          );
                        }
                      )}
                    </div>
                    <div className="-mx-3 h-[200px] overflow-x-auto md:mx-0 md:h-[250px]">
                      <ChartContainer
                        config={chartConfig}
                        className="h-full w-full min-w-[400px] [&_.recharts-cartesian-axis-tick_text]:!fill-gray-600 [&_.recharts-cartesian-axis-tick_text]:fill-gray-600 [&_.recharts-cartesian-axis-tick_text]:dark:!fill-gray-300 [&_.recharts-cartesian-axis-tick_text]:dark:fill-gray-300 [&_.recharts-tooltip-cursor]:stroke-gray-300 dark:[&_.recharts-tooltip-cursor]:stroke-gray-600"
                      >
                        <BarChart
                          data={transactionalNetworks.map(
                            (
                              n: { network?: string; delivered?: number; [key: string]: unknown },
                              idx: number
                            ) => {
                              const colors = [
                                "hsl(221, 83%, 53%)", // Blue
                                "hsl(142, 76%, 36%)", // Green
                                "hsl(262, 83%, 58%)", // Purple
                                "hsl(0, 84%, 60%)", // Red for failed
                                "hsl(330, 81%, 60%)", // Pink
                                "hsl(188, 94%, 43%)", // Cyan
                                "hsl(45, 93%, 47%)", // Yellow
                                "hsl(239, 84%, 67%)", // Indigo
                              ];
                              return {
                                name: n.network || "N/A",
                                value: n.delivered || 0,
                                color: colors[idx % colors.length],
                              };
                            }
                          )}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                            opacity={0.2}
                          />
                          <XAxis
                            dataKey="name"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: "#6b7280", fontSize: 12 }}
                            className="text-xs [&_text]:fill-gray-600 dark:[&_text]:fill-gray-300"
                          />
                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: "#6b7280", fontSize: 12 }}
                            className="text-xs [&_text]:fill-gray-600 dark:[&_text]:fill-gray-300"
                          />
                          <ChartTooltip
                            content={
                              <ChartTooltipContent
                                indicator="dot"
                                className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 [&_span.text-muted-foreground]:text-gray-600 dark:[&_span.text-muted-foreground]:text-gray-400 [&_span]:text-gray-900 dark:[&_span]:text-gray-100"
                              />
                            }
                          />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {transactionalNetworks.map((_: unknown, idx: number) => {
                              const colors = [
                                "hsl(221, 83%, 53%)",
                                "hsl(142, 76%, 36%)",
                                "hsl(262, 83%, 58%)",
                                "hsl(0, 84%, 60%)", // Red for failed (if applicable)
                                "hsl(330, 81%, 60%)",
                                "hsl(188, 94%, 43%)",
                                "hsl(45, 93%, 47%)",
                                "hsl(239, 84%, 67%)",
                              ];
                              return (
                                <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
                              );
                            })}
                          </Bar>
                        </BarChart>
                      </ChartContainer>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-[200px] items-center justify-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No network data available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Promotional SMS Per Network - Only show if "all" or "promotional" */}
          {(messageType === "all" || messageType === "promotional") && (
            <Card className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white/90 shadow-xl shadow-brand-500/5 backdrop-blur-xl dark:border-gray-800/80 dark:bg-gray-900/90">
              <CardHeader className="relative border-b border-gray-200/50 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-green-500/10 px-6 py-6 dark:border-gray-800/50 dark:from-green-900/20 dark:via-emerald-900/10 dark:to-green-900/20 md:px-8 md:py-8">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-2.5 dark:from-green-500/30 dark:to-emerald-500/30">
                    <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400 md:h-6 md:w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-gray-900 dark:text-white md:text-lg lg:text-xl">
                      Promotional SMS Per Network
                    </CardTitle>
                    <CardDescription className="mt-1.5 text-sm text-gray-600 dark:text-gray-400 md:text-base">
                      Network distribution for promotional messages
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 md:p-4 lg:p-6">
                {isLoadingPromotionalNetwork ? (
                  <div className="flex h-[150px] items-center justify-center md:h-[200px]">
                    <Loader size="md" variant="brand" text="Loading network data..." />
                  </div>
                ) : Array.isArray(promotionalNetworks) && promotionalNetworks.length > 0 ? (
                  <div className="space-y-3 md:space-y-4">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3">
                      {promotionalNetworks.map(
                        (
                          network: { network?: string; delivered?: number; [key: string]: unknown },
                          index: number
                        ) => {
                          // Network colors - different color for each network
                          const networkColors = [
                            "bg-green-500",
                            "bg-emerald-500",
                            "bg-teal-500",
                            "bg-lime-500",
                            "bg-cyan-500",
                            "bg-blue-500",
                            "bg-indigo-500",
                            "bg-violet-500",
                          ];
                          const networkColor = networkColors[index % networkColors.length];
                          const networkName = network.network || "N/A";

                          return (
                            <div
                              key={index}
                              className="group relative rounded-xl border border-gray-200/80 bg-white/90 p-4 shadow-md backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300/50 hover:shadow-xl dark:border-gray-700/80 dark:bg-gray-800/90 dark:hover:border-brand-700/50 md:p-5"
                            >
                              <div className="mb-2 flex items-center gap-2.5 md:mb-3">
                                <div
                                  className={`h-3 w-3 rounded-full md:h-3.5 md:w-3.5 ${networkColor} shadow-lg ring-2 ring-white dark:ring-gray-800`}
                                ></div>
                                <p className="truncate text-xs font-bold text-gray-700 dark:text-gray-300 md:text-sm">
                                  {networkName}
                                </p>
                              </div>
                              <p className="text-lg font-bold text-gray-900 dark:text-white md:text-xl lg:text-2xl">
                                {network.delivered?.toLocaleString() || 0}
                              </p>
                              <p className="mt-1.5 text-[10px] font-medium text-gray-500 dark:text-gray-400 md:text-xs">
                                Delivered
                              </p>
                            </div>
                          );
                        }
                      )}
                    </div>
                    <div className="-mx-3 h-[200px] overflow-x-auto md:mx-0 md:h-[250px]">
                      <ChartContainer
                        config={chartConfig}
                        className="h-full w-full min-w-[400px] [&_.recharts-cartesian-axis-tick_text]:!fill-gray-600 [&_.recharts-cartesian-axis-tick_text]:fill-gray-600 [&_.recharts-cartesian-axis-tick_text]:dark:!fill-gray-300 [&_.recharts-cartesian-axis-tick_text]:dark:fill-gray-300 [&_.recharts-tooltip-cursor]:stroke-gray-300 dark:[&_.recharts-tooltip-cursor]:stroke-gray-600"
                      >
                        <BarChart
                          data={promotionalNetworks.map(
                            (
                              n: { network?: string; delivered?: number; [key: string]: unknown },
                              idx: number
                            ) => {
                              const colors = [
                                "hsl(142, 76%, 36%)", // Green
                                "hsl(160, 84%, 39%)", // Emerald
                                "hsl(173, 80%, 40%)", // Teal
                                "hsl(75, 94%, 47%)", // Lime
                                "hsl(188, 94%, 43%)", // Cyan
                                "hsl(221, 83%, 53%)", // Blue
                                "hsl(239, 84%, 67%)", // Indigo
                                "hsl(258, 90%, 66%)", // Violet
                              ];
                              return {
                                name: n.network || "N/A",
                                value: n.delivered || 0,
                                color: colors[idx % colors.length],
                              };
                            }
                          )}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                            opacity={0.2}
                          />
                          <XAxis
                            dataKey="name"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: "#6b7280", fontSize: 12 }}
                            className="text-xs [&_text]:fill-gray-600 dark:[&_text]:fill-gray-300"
                          />
                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: "#6b7280", fontSize: 12 }}
                            className="text-xs [&_text]:fill-gray-600 dark:[&_text]:fill-gray-300"
                          />
                          <ChartTooltip
                            content={
                              <ChartTooltipContent
                                indicator="dot"
                                className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 [&_span.text-muted-foreground]:text-gray-600 dark:[&_span.text-muted-foreground]:text-gray-400 [&_span]:text-gray-900 dark:[&_span]:text-gray-100"
                              />
                            }
                          />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {promotionalNetworks.map((_: unknown, idx: number) => {
                              const colors = [
                                "hsl(142, 76%, 36%)",
                                "hsl(160, 84%, 39%)",
                                "hsl(173, 80%, 40%)",
                                "hsl(75, 94%, 47%)",
                                "hsl(188, 94%, 43%)",
                                "hsl(221, 83%, 53%)",
                                "hsl(239, 84%, 67%)",
                                "hsl(258, 90%, 66%)",
                              ];
                              return (
                                <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
                              );
                            })}
                          </Bar>
                        </BarChart>
                      </ChartContainer>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-[200px] items-center justify-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No network data available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Transactional and Promotional Stats - Modern Design */}
      {(messageType === "all" ||
        messageType === "transactional" ||
        messageType === "promotional") && (
        <Card className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white/90 shadow-xl shadow-brand-500/5 backdrop-blur-xl dark:border-gray-800/80 dark:bg-gray-900/90">
          <CardHeader className="relative border-b border-gray-200/50 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-orange-500/10 px-6 py-6 dark:border-gray-800/50 dark:from-orange-900/20 dark:via-amber-900/10 dark:to-orange-900/20 md:px-8 md:py-8">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 p-2.5 dark:from-orange-500/30 dark:to-amber-500/30">
                <BarChart3 className="h-5 w-5 text-orange-600 dark:text-orange-400 md:h-6 md:w-6" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white md:text-xl">
                  Message Statistics by Type
                </CardTitle>
                <CardDescription className="mt-1.5 text-sm text-gray-600 dark:text-gray-400 md:text-base">
                  Detailed statistics for transactional and promotional messages
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div
              className={`grid gap-6 ${messageType === "all" ? "md:grid-cols-2" : "md:grid-cols-1"}`}
            >
              {/* Transactional Messages Stats - Only show if "all" or "transactional" */}
              {(messageType === "all" || messageType === "transactional") && (
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white md:text-lg">
                    Transactional Messages Sent
                  </h3>
                  <div className="mb-4 text-xl font-bold text-gray-900 dark:text-white md:text-2xl">
                    {(
                      transactionalStats.total ||
                      allTimeSummary.transactional_sent_message ||
                      0
                    ).toLocaleString()}
                  </div>
                  <div className="grid grid-cols-3 gap-2 md:gap-4">
                    <div className="rounded-lg border border-green-200 bg-green-50 p-2 dark:border-green-800 dark:bg-green-900/20 md:p-3">
                      <p className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                        Successful
                      </p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400 md:text-xl">
                        {(
                          transactionalStats.successful ||
                          allTimeSummary.transactional_successful ||
                          0
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-lg border border-red-200 bg-red-50 p-2 dark:border-red-800 dark:bg-red-900/20 md:p-3">
                      <p className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                        Failed
                      </p>
                      <p className="text-lg font-bold text-red-600 dark:text-red-400 md:text-xl">
                        {(
                          transactionalStats.failed ||
                          allTimeSummary.transactional_failed ||
                          0
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-2 dark:border-yellow-800 dark:bg-yellow-900/20 md:p-3">
                      <p className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                        Pending
                      </p>
                      <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400 md:text-xl">
                        {(
                          transactionalStats.pending ||
                          allTimeSummary.transactional_pending ||
                          0
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {/* Credits for Transactional */}
                  <div className="mt-4 rounded-lg border-2 border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-900/20 md:p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400 md:h-5 md:w-5" />
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 md:text-base">
                          Credits Used
                        </p>
                      </div>
                      <p className="text-lg font-bold text-purple-600 dark:text-purple-400 md:text-xl">
                        {(
                          transactionalStats.credits ||
                          allTimeSummary.transactional_credits ||
                          0
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Promotional Messages Stats - Only show if "all" or "promotional" */}
              {(messageType === "all" || messageType === "promotional") && (
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white md:text-lg">
                    Promotional Messages Sent
                  </h3>
                  <div className="mb-4 text-xl font-bold text-gray-900 dark:text-white md:text-2xl">
                    {(
                      promotionalMessages?.message?.total ||
                      allTimeSummary.promotional_sent_message ||
                      summary.promotional_sent ||
                      0
                    ).toLocaleString()}
                  </div>
                  <div className="grid grid-cols-3 gap-2 md:gap-4">
                    <div className="rounded-lg border border-green-200 bg-green-50 p-2 dark:border-green-800 dark:bg-green-900/20 md:p-3">
                      <p className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                        Successful
                      </p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400 md:text-xl">
                        {(
                          promotionalMessages?.message?.successful ||
                          allTimeSummary.promotional_successful ||
                          0
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-lg border border-red-200 bg-red-50 p-2 dark:border-red-800 dark:bg-red-900/20 md:p-3">
                      <p className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                        Failed
                      </p>
                      <p className="text-lg font-bold text-red-600 dark:text-red-400 md:text-xl">
                        {(
                          promotionalMessages?.message?.failed ||
                          allTimeSummary.promotional_failed ||
                          0
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-2 dark:border-yellow-800 dark:bg-yellow-900/20 md:p-3">
                      <p className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                        Pending
                      </p>
                      <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400 md:text-xl">
                        {(
                          promotionalMessages?.message?.pending ||
                          allTimeSummary.promotional_pending ||
                          0
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {/* Credits for Promotional */}
                  <div className="mt-4 rounded-lg border-2 border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-900/20 md:p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400 md:h-5 md:w-5" />
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 md:text-base">
                          Credits Used
                        </p>
                      </div>
                      <p className="text-lg font-bold text-purple-600 dark:text-purple-400 md:text-xl">
                        {(
                          promotionalMessages?.message?.credits ||
                          allTimeSummary.promotional_credits ||
                          summary.promotional_credits ||
                          0
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Clients Table - Super Admin Only */}
      {isSuperAdmin && (
        <Card className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white/90 shadow-xl shadow-brand-500/5 backdrop-blur-xl dark:border-gray-800/80 dark:bg-gray-900/90">
          <CardHeader className="relative border-b border-gray-200/50 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-indigo-500/10 px-6 py-6 dark:border-gray-800/50 dark:from-indigo-900/20 dark:via-purple-900/10 dark:to-indigo-900/20 md:px-8 md:py-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-2.5 dark:from-indigo-500/30 dark:to-purple-500/30">
                  <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400 md:h-6 md:w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white md:text-xl">
                    5 Recent Clients
                  </CardTitle>
                  <CardDescription className="mt-1.5 text-sm text-gray-600 dark:text-gray-400 md:text-base">
                    Most recently registered clients in the system
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="border-border/50 h-11 w-11 border-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                onClick={() => refetchClients()}
                disabled={isLoadingClients}
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingClients ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4 md:space-y-6 md:p-6">
            {/* Recent Clients Table */}
            {isLoadingClients ? (
              <TableSkeleton rows={5} />
            ) : clients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Users className="mb-4 h-12 w-12 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">No clients found</p>
              </div>
            ) : (
              <>
                <div className="border-border/50 overflow-hidden rounded-lg border-2 dark:border-gray-700">
                  <div className="w-full overflow-x-auto">
                    <Table className="w-full">
                      <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                          <TableHead className="w-[80px] font-semibold text-gray-900 dark:text-white">
                            ID
                          </TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-white">
                            Name
                          </TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-white">
                            Email
                          </TableHead>
                          <TableHead className="hidden font-semibold text-gray-900 dark:text-white sm:table-cell">
                            Phone
                          </TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-white">
                            Status
                          </TableHead>
                          <TableHead className="hidden font-semibold text-gray-900 dark:text-white md:table-cell">
                            KYB Status
                          </TableHead>
                          <TableHead className="hidden font-semibold text-gray-900 dark:text-white md:table-cell">
                            Compliance
                          </TableHead>
                          <TableHead className="hidden font-semibold text-gray-900 dark:text-white lg:table-cell">
                            Balance
                          </TableHead>
                          <TableHead className="hidden font-semibold text-gray-900 dark:text-white lg:table-cell">
                            Total Spent
                          </TableHead>
                          <TableHead className="hidden font-semibold text-gray-900 dark:text-white lg:table-cell">
                            Registered
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clients.map((client) => (
                          <TableRow
                            key={client.id}
                            className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          >
                            <TableCell className="font-medium text-gray-900 dark:text-white">
                              {client.id}
                            </TableCell>
                            <TableCell className="font-medium text-gray-900 dark:text-white">
                              {client.name}
                            </TableCell>
                            <TableCell className="text-gray-900 dark:text-gray-100">
                              <div className="flex items-center gap-1.5">
                                <Mail className="h-3 w-3 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                                <span className="truncate">{client.email}</span>
                              </div>
                            </TableCell>
                            <TableCell className="hidden text-gray-900 dark:text-gray-100 sm:table-cell">
                              <div className="flex items-center gap-1.5">
                                <Phone className="h-3 w-3 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                                <span>{client.msisdn || client.phone || "--"}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  client.status === "1" || client.status === "active"
                                    ? "default"
                                    : "secondary"
                                }
                                className={
                                  client.status === "1" || client.status === "active"
                                    ? "bg-green-500 text-white hover:bg-green-600"
                                    : ""
                                }
                              >
                                {client.status === "1" || client.status === "active"
                                  ? "Active"
                                  : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge
                                variant="outline"
                                className="border-gray-300 dark:border-gray-600"
                              >
                                {(client as any).kyb_status || (client as any).kybStatus || "N/A"}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge
                                variant={
                                  (client as any).compliance_status === "submitted" ||
                                  (client as any).compliance_status === "approved" ||
                                  (client as any).complianceStatus === "submitted" ||
                                  (client as any).complianceStatus === "approved"
                                    ? "default"
                                    : "destructive"
                                }
                                className={
                                  (client as any).compliance_status === "submitted" ||
                                  (client as any).compliance_status === "approved" ||
                                  (client as any).complianceStatus === "submitted" ||
                                  (client as any).complianceStatus === "approved"
                                    ? "bg-green-500 text-white hover:bg-green-600"
                                    : "bg-orange-500 text-white hover:bg-orange-600"
                                }
                              >
                                {(client as any).compliance_status ||
                                  (client as any).complianceStatus ||
                                  "N/A"}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden font-medium text-gray-900 dark:text-white lg:table-cell">
                              ${(client.balance || 0).toFixed(2)}
                            </TableCell>
                            <TableCell className="hidden font-medium text-gray-900 dark:text-white lg:table-cell">
                              ${(client.total_spent || 0).toFixed(2)}
                            </TableCell>
                            <TableCell className="hidden text-gray-600 dark:text-gray-400 lg:table-cell">
                              {client.registered_at ||
                              client.created_at ||
                              client.created ||
                              client.createdOn
                                ? format(
                                    new Date(
                                      (client.registered_at ||
                                        client.created_at ||
                                        client.created ||
                                        client.createdOn) as string
                                    ),
                                    "MMM dd, yyyy"
                                  )
                                : "N/A"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
