"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAlert } from "@/context/AlertProvider";
import { useAuth } from "@/context/AuthProvider";
import { useTheme } from "@/context/ThemeContext";
import { useUpdateAdminUser } from "@/controller/query/admin/users/useAdminUsers";
import {
  useBillingStats,
  useClientReports,
  useDashboardSummary,
} from "@/controller/query/dashboard/useDashboard";
import {
  changePassword,
  getInvoices,
  getSMSBillingRates,
  getTransactions,
  Invoice,
  SMSBillingRate,
  Transaction,
} from "@/controller/query/profile/profile.service";
import { useGetMNOProviders, useMNOSelfTopup } from "@/controller/query/topup/useTopup";
import { exportReportToPDF } from "@/utils/exportPDF";
import { isSuperAdmin as isSuperAdminUtil } from "@/utils/userUtils";
import { getCookie } from "cookies-next";
import { endOfDay, format, startOfDay, startOfYear, subDays } from "date-fns";
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Edit,
  Eye,
  EyeOff,
  FileText,
  Globe,
  Hash,
  Key,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  Moon,
  Network,
  Phone,
  Receipt,
  RefreshCw,
  Save,
  Send,
  Shield,
  Sparkles,
  Sun,
  TrendingUp,
  User,
  Users,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { showAlert } = useAlert();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("billing");
  const [reportType, setReportType] = useState<"connector" | "sender">("connector");
  const [dateRange, setDateRange] = useState("week");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);

  // Get user data
  const userData = user?.message?.user;
  const clientData = user?.message?.client;
  const billingData = user?.message?.client_billing;

  // Determine if user is super admin
  const isSuperAdmin = isSuperAdminUtil(clientData);

  // Data states
  const [billingRates, setBillingRates] = useState<SMSBillingRate[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Topup states
  const [topupAmount, setTopupAmount] = useState("");
  const [topupMsisdn, setTopupMsisdn] = useState("");
  const [topupLoading, setTopupLoading] = useState(false);
  const [mnoWalletType, setMnoWalletType] = useState<"AIRTEL" | "ORANGE" | "VODACOM" | "AFRICELL">(
    "AIRTEL"
  );

  // Fetch MNO providers from API
  const { data: providersData, isLoading: isLoadingProviders } = useGetMNOProviders(
    apiKey,
    !!apiKey
  );
  const mnoSelfTopupMutation = useMNOSelfTopup();

  // Process providers data
  const availableNetworks = useMemo(() => {
    const fallbackNetworks = [
      { code: "AIRTEL", name: "Airtel", description: "Airtel RDC" },
      { code: "ORANGE", name: "Orange", description: "Orange RDC" },
      { code: "VODACOM", name: "Vodacom", description: "Vodacom RDC" },
      { code: "AFRICELL", name: "Africell", description: "Africell RDC" },
    ];

    if (!providersData?.message && !providersData?.data) return fallbackNetworks;
    const list = providersData.message || providersData.data || [];
    if (!Array.isArray(list) || list.length === 0) return fallbackNetworks;

    return list.map((p: { code?: string; id?: string; name?: string; description?: string }) => ({
      code: (p.code || p.id || "").toUpperCase(),
      name: p.name || p.code || p.id || "",
      description: p.description || `${p.name || p.code || ""} RDC`,
    }));
  }, [providersData]);

  // Password change states
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }

    // Get login token for SMS API requests
    const cookieToken = getCookie("authToken");
    const storedAuthToken =
      typeof cookieToken === "string" ? cookieToken : localStorage.getItem("authToken");
    if (storedAuthToken && typeof storedAuthToken === "string") {
      setToken(storedAuthToken);
    }
  }, []);

  // According to Postman documentation, dashboard endpoints use api-key header
  // Use generated token (apiKey) for dashboard endpoints instead of login token
  // Following dashboard page logic: apiKey || token
  const dashboardToken = apiKey || token;

  // Fetch dashboard summary for stats (all time data)
  const { data: allTimeSummaryData } = useDashboardSummary(
    {
      start: format(startOfYear(new Date()), "yyyy-MM-dd"),
      end: format(endOfDay(new Date()), "yyyy-MM-dd"),
    },
    dashboardToken,
    !!dashboardToken
  );

  // Fetch billing stats for balance (same as navbar)
  const { data: billingStatsData } = useBillingStats({}, dashboardToken, !!dashboardToken);

  // Fetch dashboard summary for balance (for regular users)
  const { data: dashboardSummaryData } = useDashboardSummary(
    {},
    dashboardToken,
    !!dashboardToken && !isSuperAdmin
  );

  // Calculate stats from dashboard data
  const allTimeSummary = allTimeSummaryData?.message || {};
  const successful = parseFloat(allTimeSummary.successful?.toString() || "0");
  const failed = parseFloat(allTimeSummary.failed?.toString() || "0");
  const pending = parseFloat(allTimeSummary.pending?.toString() || "0");
  const totalSuccess = successful + failed + pending;
  const deliveryRate =
    totalSuccess > 0 ? ((successful / totalSuccess) * 100).toFixed(2) + "%" : "0%";

  // Convert dateRange to start and end dates for reports
  const getDateRange = useMemo(() => {
    // Calculate date range
    let start: Date;
    let end: Date;

    if (dateRange === "custom" && customStartDate && customEndDate) {
      start = startOfDay(customStartDate);
      end = endOfDay(customEndDate);
    } else {
      const today = endOfDay(new Date());
      end = today;

      switch (dateRange) {
        case "today":
          start = startOfDay(new Date());
          break;
        case "week":
          start = startOfDay(subDays(new Date(), 7));
          break;
        case "month":
          start = startOfDay(subDays(new Date(), 30));
          break;
        case "year":
          start = startOfYear(new Date());
          break;
        default:
          start = startOfDay(subDays(new Date(), 7));
      }
    }

    // Backend requires id to be present and non-zero (see sms.go line 175-179)
    // Return id only if clientData.id is defined and non-zero
    // The hook useClientReports will not execute if id is undefined (enabled condition)
    return {
      id: clientData?.id && clientData.id !== 0 ? clientData.id : undefined,
      start: format(start, "yyyy-MM-dd"),
      end: format(end, "yyyy-MM-dd"),
    };
  }, [dateRange, clientData?.id, customStartDate, customEndDate]);

  // Fetch reports data using useClientReports hook
  const {
    data: reportsData,
    isLoading: isLoadingReports,
    isError: isErrorReports,
    refetch: refetchReports,
  } = useClientReports(
    reportType === "connector" ? "connector" : "sender",
    getDateRange,
    apiKey,
    !!apiKey && !!clientData?.id && activeTab === "reports",
    isSuperAdmin
  );

  // Get current report data from API response
  const currentReportData = useMemo(() => {
    if (!reportsData?.message || !Array.isArray(reportsData.message)) {
      return [];
    }
    return reportsData.message;
  }, [reportsData]);

  // Calculate totals from current report data
  // Note: 'sent' might already include delivered/pending/failed, so we use the individual counts
  const totalSent = useMemo(
    () =>
      currentReportData.reduce((sum, item) => {
        // Use sent if available, otherwise sum individual statuses
        const total = item.sent || (item.delivered || 0) + (item.pending || 0) + (item.failed || 0);
        return sum + total;
      }, 0),
    [currentReportData]
  );
  const totalDelivered = useMemo(
    () => currentReportData.reduce((sum, item) => sum + (item.delivered || 0), 0),
    [currentReportData]
  );
  const totalFailed = useMemo(
    () => currentReportData.reduce((sum, item) => sum + (item.failed || 0), 0),
    [currentReportData]
  );
  const totalPending = useMemo(
    () => currentReportData.reduce((sum, item) => sum + (item.pending || 0), 0),
    [currentReportData]
  );

  // Form state
  const [formData, setFormData] = useState({
    full_name: userData?.full_name || "",
    email: userData?.email || clientData?.email || "",
    msisdn: userData?.msisdn || clientData?.msisdn || "",
    address: clientData?.address || "",
  });

  // Profile update mutation
  const updateUserMutation = useUpdateAdminUser();

  // Update form data when user data changes
  useEffect(() => {
    if (userData || clientData) {
      setFormData({
        full_name: userData?.full_name || "",
        email: userData?.email || clientData?.email || "",
        msisdn: userData?.msisdn || clientData?.msisdn || "",
        address: clientData?.address || "",
      });
    }
  }, [userData, clientData]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data
    setFormData({
      full_name: userData?.full_name || "",
      email: userData?.email || clientData?.email || "",
      msisdn: userData?.msisdn || clientData?.msisdn || "",
      address: clientData?.address || "",
    });
  };

  const handleSave = async () => {
    if (!apiKey) {
      showAlert({
        variant: "error",
        title: "Missing API key",
        message: "Please sign in again to update your profile.",
      });
      return;
    }

    if (!userData?.id) {
      showAlert({
        variant: "error",
        title: "User ID missing",
        message: "Unable to identify user. Please refresh the page.",
      });
      return;
    }

    // Validate form data
    if (!formData.email.trim()) {
      showAlert({
        variant: "error",
        title: "Validation Error",
        message: "Email is required.",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      showAlert({
        variant: "error",
        title: "Validation Error",
        message: "Please enter a valid email address.",
      });
      return;
    }

    setLoading(true);
    try {
      await updateUserMutation.mutateAsync({
        data: {
          user_id: userData.id,
          full_name: formData.full_name.trim() || undefined,
          email: formData.email.trim() || undefined,
          msisdn: formData.msisdn.trim() || undefined,
        },
        apiKey,
      });
      setIsEditing(false);
      // Refresh user data by updating the context
      // Get updated user session from localStorage and update context
      const storedUser = localStorage.getItem("user-session");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Update the user context to reflect changes immediately
          setUser(parsedUser);
          // Update formData to reflect the new values
          setFormData({
            full_name: parsedUser?.message?.user?.full_name || "",
            email: parsedUser?.message?.user?.email || parsedUser?.message?.client?.email || "",
            msisdn: parsedUser?.message?.user?.msisdn || parsedUser?.message?.client?.msisdn || "",
            address: parsedUser?.message?.client?.address || "",
          });
        } catch (error) {
          // Fallback to page reload if parsing fails
          window.location.reload();
        }
      } else {
        // Fallback to page reload if no stored user
        window.location.reload();
      }
    } catch (error) {
      // Error is already handled in the mutation's onError callback
      // But we can add additional logging if needed
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U"
    );
  };

  const displayName = userData?.full_name || clientData?.name || "User";
  const displayEmail = userData?.email || clientData?.email || "";
  const displayPhone = userData?.msisdn || clientData?.msisdn || "";
  const accountType = clientData?.account_type || "Standard";

  // Get balance from billing-stats or dashboard summary (same logic as navbar)
  const currentBalance = useMemo(() => {
    console.log(
      "[Profile] Calculating balance - isSuperAdmin:",
      isSuperAdmin,
      "billingStatsData:",
      billingStatsData
    );

    // First, try to get balance from billing-stats (prioritize for all users)
    if (billingStatsData) {
      // ALWAYS check for system_balance first (works for super admin)
      let systemBalance: number | undefined = undefined;
      if (billingStatsData.system_balance !== undefined) {
        systemBalance = Number(billingStatsData.system_balance);
        console.log("[Profile] Found system_balance directly:", systemBalance);
      } else if (billingStatsData.message?.system_balance !== undefined) {
        systemBalance = Number(billingStatsData.message.system_balance);
        console.log("[Profile] Found system_balance in message:", systemBalance);
      }
      // Always return system_balance if it's defined (even if 0) - for super admin
      if (systemBalance !== undefined && !isNaN(systemBalance)) {
        console.log("[Profile] Using system_balance from billingStatsData:", systemBalance);
        return systemBalance;
      }

      // For regular users: check if billing-stats has balance field
      if (!isSuperAdmin) {
        let balanceFromBilling: number | undefined = undefined;
        if (
          billingStatsData.balance !== undefined &&
          typeof billingStatsData.balance === "number"
        ) {
          balanceFromBilling = Number(billingStatsData.balance) ?? 0;
        } else if (
          billingStatsData.message?.balance !== undefined &&
          typeof billingStatsData.message.balance === "number"
        ) {
          balanceFromBilling = Number(billingStatsData.message.balance) ?? 0;
        }
        // If billing-stats has balance, use it (even if 0)
        if (balanceFromBilling !== undefined) {
          // Also get bonus from billing-stats if available
          let bonusFromBilling = 0;
          if (billingStatsData.bonus !== undefined && typeof billingStatsData.bonus === "number") {
            bonusFromBilling = Number(billingStatsData.bonus) ?? 0;
          } else if (
            billingStatsData.message?.bonus !== undefined &&
            typeof billingStatsData.message.bonus === "number"
          ) {
            bonusFromBilling = Number(billingStatsData.message.bonus) ?? 0;
          }
          return balanceFromBilling + bonusFromBilling;
        }
      }
    }

    // Fallback: use dashboard summary for regular clients (balance + bonus)
    if (!isSuperAdmin) {
      const summaryMessage = dashboardSummaryData?.message;
      const userBalance = user?.message?.client_billing?.balance ?? 0;
      const userBonus = user?.message?.client_billing?.bonus ?? 0;
      const userTotal = Number(userBalance) + Number(userBonus);

      if (summaryMessage) {
        const summaryBalance = summaryMessage.balance;
        if (summaryBalance !== undefined && summaryBalance !== null) {
          const balanceValue = Number(summaryBalance);
          if (balanceValue !== 0 || userTotal === 0) {
            const bonusValue =
              summaryMessage.bonus !== undefined && summaryMessage.bonus !== null
                ? Number(summaryMessage.bonus)
                : Number(userBonus);
            return balanceValue + Number(bonusValue);
          }
        }
      }
      return userTotal;
    }

    // Final fallback: user context
    return Number(user?.message?.client_billing?.balance ?? 0);
  }, [billingStatsData, dashboardSummaryData, user, isSuperAdmin]);

  // Get bonus from dashboard summary or fallback to user context
  const currentBonus = useMemo(() => {
    if (isSuperAdmin) return 0; // Super admin doesn't have bonus
    const summaryMessage = dashboardSummaryData?.message;
    if (summaryMessage?.bonus !== undefined && summaryMessage.bonus !== null) {
      return Number(summaryMessage.bonus);
    }
    return Number(user?.message?.client_billing?.bonus ?? 0);
  }, [dashboardSummaryData, user, isSuperAdmin]);

  // Calculate available credit
  const availableCredit = billingData?.credit_limit
    ? billingData.credit_limit - ((currentBalance || 0) < 0 ? Math.abs(currentBalance || 0) : 0)
    : 0;

  // Calculate total balance
  const totalBalance = currentBalance + currentBonus;

  // Load data based on active tab
  useEffect(() => {
    if (!apiKey || !clientData?.id) return;
    if (activeTab === "theme" || activeTab === "topup" || activeTab === "reports") return; // Skip API calls for these tabs

    const loadData = async () => {
      setLoadingData(true);
      setErrorMessage(null);
      try {
        if (activeTab === "billing") {
          if (!apiKey || !clientData?.id) {
            setBillingRates([]);
            setLoadingData(false);
            return;
          }
          const response = await getSMSBillingRates(
            {
              page: 1,
              per_page: 10,
              sort: "created",
              order: "desc",
            },
            apiKey
          );
          // Handle different response formats
          let rates: SMSBillingRate[] = [];
          if (response?.message) {
            if (Array.isArray(response.message)) {
              rates = response.message;
            } else if (typeof response.message === "object" && response.message !== null) {
              // If message is an object, try to extract array from it
              const messageObj = response.message as Record<string, unknown>;
              if (Array.isArray(messageObj.data)) {
                rates = messageObj.data;
              } else if (Array.isArray(messageObj.rates)) {
                rates = messageObj.rates;
              } else if (Array.isArray(messageObj.billing_rates)) {
                rates = messageObj.billing_rates;
              }
            }
          } else if (Array.isArray(response?.data)) {
            rates = response.data;
          }

          setBillingRates(rates);
        } else if (activeTab === "transactions") {
          // For super admin, send 0 to see all transactions or specific client_id
          // For regular client, send 0 to use their own client_id from session
          // Permission: "client", "read"
          // Simple user: doit toujours envoyer client_id: 0 (utilise automatiquement son clientID de session)
          // Super admin: peut envoyer client_id: 0 (tous) ou un client_id spécifique
          const response = await getTransactions(
            {
              client_id: isSuperAdmin ? 0 : 0, // ✅ Simple user: toujours 0
              page: 1,
              per_page: 10,
            },
            apiKey,
            isSuperAdmin
          );
          setTransactions(response?.message?.data || []);
        } else if (activeTab === "invoices") {
          // Permission: "client", "read"
          // Simple user: doit toujours envoyer client_id: 0 (utilise automatiquement son clientID de session)
          // Super admin: peut envoyer client_id: 0 (tous) ou un client_id spécifique
          const response = await getInvoices(
            {
              client_id: isSuperAdmin ? 0 : 0, // ✅ Simple user: toujours 0
              page: 1,
              per_page: 10,
            },
            apiKey,
            isSuperAdmin
          );
          setInvoices(response?.message?.data || []);
        }
      } catch (error: unknown) {
        const errorMsg =
          (error as { response?: { data?: { message?: string } }; message?: string })?.response
            ?.data?.message ||
          (error as { message?: string })?.message ||
          "Failed to load data";
        setErrorMessage(errorMsg);
        showAlert({
          variant: "error",
          title: "Error",
          message: errorMsg,
        });
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [activeTab, apiKey, clientData?.id, isSuperAdmin, showAlert]);

  // Format currency
  const formatCurrency = (amount: number | null | undefined) => {
    const numAmount = amount ?? 0;
    if (isNaN(numAmount)) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  };

  const formatNumber = (num: number | null | undefined) => {
    const numValue = num ?? 0;
    if (isNaN(numValue)) return "0";
    return numValue.toString();
  };

  const handleTopup = async () => {
    if (!apiKey || !clientData?.id) {
      setErrorMessage("API Key or Client ID is missing");
      return;
    }

    if (!topupAmount || parseFloat(topupAmount) <= 0) {
      setErrorMessage("Please enter a valid amount");
      return;
    }

    if (!topupMsisdn || topupMsisdn.trim() === "") {
      setErrorMessage("Please enter a mobile number");
      return;
    }

    if (!mnoWalletType) {
      setErrorMessage("Please select a network provider");
      return;
    }

    setTopupLoading(true);
    setErrorMessage(null);

    try {
      // Use the proper hook for MNO self topup
      // Endpoint: POST /client/self/topup
      // Backend uses clientID from session automatically
      await mnoSelfTopupMutation.mutateAsync({
        data: {
          amount: parseFloat(topupAmount),
          msisdn: topupMsisdn.trim(),
          mno_wallet_type: mnoWalletType, // Required: "AIRTEL" | "ORANGE" | "VODACOM" | "AFRICELL"
          currency: "USD", // Optional, default "USD"
          narration: "Client self top-up", // Optional
        },
        apiKey,
      });

      // Success is handled by the mutation hook
      setTopupAmount("");
      setTopupMsisdn("");
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string; status?: number }; status?: number };
        message?: string;
      };
      let errorMsg =
        axiosError?.response?.data?.message ||
        axiosError?.message ||
        "Failed to process topup request";

      // Provide more specific error messages
      if (errorMsg.includes("MNO authentication failed")) {
        errorMsg = "MNO service authentication failed. Please contact support or try again later.";
      } else if (errorMsg.includes("Insufficient")) {
        errorMsg = "Insufficient balance. Please check your account balance.";
      } else if (errorMsg.includes("Invalid") || errorMsg.includes("invalid")) {
        errorMsg = `Invalid request: ${errorMsg}. Please check your input and try again.`;
      }

      setErrorMessage(errorMsg);
      // Alert is already shown by the mutation hook, but we set errorMessage for UI display
    } finally {
      setTopupLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-8">
        {/* Hero Header Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 shadow-2xl shadow-brand-500/20 dark:from-brand-600 dark:via-brand-700 dark:to-brand-800">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNGMwIDMuMzE0LTIuNjg2IDYtNiA2cy02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiA2IDIuNjg2IDYgNnoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L2c+PC9zdmc+')] opacity-20"></div>
          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-white/20 blur-xl"></div>
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-white/30 bg-white/20 shadow-xl backdrop-blur-sm sm:h-24 sm:w-24">
                    <span className="text-2xl font-bold text-white sm:text-3xl">
                      {getInitials(displayName)}
                    </span>
                  </div>
                </div>
                <div>
                  <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                    {displayName}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <Badge className="border-white/30 bg-white/20 px-3 py-1 font-medium text-white backdrop-blur-sm">
                      {accountType}
                    </Badge>
                    {userData?.status === 1 && (
                      <Badge className="border-emerald-400/30 bg-emerald-500/20 px-3 py-1 font-medium text-white backdrop-blur-sm">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              {!isEditing && (
                <Button
                  onClick={handleEdit}
                  className="h-11 rounded-xl border-2 border-white/30 bg-white/20 px-6 font-medium text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-white/30 hover:shadow-xl sm:h-12"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                <div className="rounded-lg bg-white/20 p-2">
                  <Mail className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-xs text-white/70">Email</p>
                  <p className="truncate text-sm font-medium text-white">{displayEmail}</p>
                </div>
              </div>
              {displayPhone && (
                <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <div className="rounded-lg bg-white/20 p-2">
                    <Phone className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-xs text-white/70">Phone</p>
                    <p className="text-sm font-medium text-white">{displayPhone}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                <div className="rounded-lg bg-white/20 p-2">
                  <Calendar className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-xs text-white/70">Member Since</p>
                  <p className="text-sm font-medium text-white">
                    {userData?.created || clientData?.created
                      ? format(new Date(userData?.created || clientData?.created || ""), "MMM yyyy")
                      : "N/A"}
                  </p>
                </div>
              </div>
              {billingData && (
                <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <div className="rounded-lg bg-white/20 p-2">
                    <Wallet className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-xs text-white/70">Balance</p>
                    <p className="text-sm font-bold text-white">
                      {formatCurrency(currentBalance ?? 0)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Personal Information & Other Sections - Bottom */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Personal Information */}
          <Card className="overflow-hidden rounded-3xl border-0 bg-white/80 shadow-xl backdrop-blur-sm dark:bg-gray-900/80">
            <CardHeader className="border-b border-gray-200/50 bg-gradient-to-r from-brand-50/50 to-brand-100/50 p-6 dark:border-gray-800/50 dark:from-brand-950/50 dark:to-brand-900/50 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 p-3 shadow-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
                    Personal Information
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                    Update your personal details and contact information
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col p-6 sm:p-8">
              <div className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label
                      htmlFor="full_name"
                      className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
                    >
                      <User className="h-4 w-4 text-brand-500" />
                      Full Name
                    </Label>
                    {isEditing ? (
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="Enter your full name"
                        className="h-12 rounded-xl border-2 border-gray-200 bg-white text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900"
                      />
                    ) : (
                      <div className="flex h-12 items-center rounded-xl border-2 border-gray-200 bg-gray-50 px-4 text-sm font-medium text-gray-900 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white">
                        {userData?.full_name || clientData?.name || "N/A"}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
                    >
                      <Mail className="h-4 w-4 text-brand-500" />
                      Email Address
                    </Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter your email"
                        className="h-12 rounded-xl border-2 border-gray-200 bg-white text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900"
                      />
                    ) : (
                      <div className="flex h-12 items-center break-all rounded-xl border-2 border-gray-200 bg-gray-50 px-4 text-sm font-medium text-gray-900 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white">
                        {displayEmail || "N/A"}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="msisdn"
                      className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
                    >
                      <Phone className="h-4 w-4 text-brand-500" />
                      Phone Number
                    </Label>
                    {isEditing ? (
                      <Input
                        id="msisdn"
                        value={formData.msisdn}
                        onChange={(e) => setFormData({ ...formData, msisdn: e.target.value })}
                        placeholder="Enter your phone number"
                        className="h-12 rounded-xl border-2 border-gray-200 bg-white text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900"
                      />
                    ) : (
                      <div className="flex h-12 items-center rounded-xl border-2 border-gray-200 bg-gray-50 px-4 text-sm font-medium text-gray-900 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white">
                        {displayPhone || "N/A"}
                      </div>
                    )}
                  </div>

                  {clientData?.address && (
                    <div className="space-y-2 sm:col-span-2">
                      <Label
                        htmlFor="address"
                        className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                      >
                        Address
                      </Label>
                      {isEditing ? (
                        <Textarea
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder="Enter your address"
                          rows={3}
                          className="rounded-xl border-2 border-gray-200 bg-white text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900"
                        />
                      ) : (
                        <div className="flex min-h-[100px] items-start break-words rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white">
                          {clientData.address || "N/A"}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="flex flex-col items-stretch justify-end gap-3 border-t border-gray-200 pt-5 dark:border-gray-800 sm:flex-row sm:items-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={loading}
                      className="h-11 w-full rounded-xl border-2 font-medium sm:w-auto"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={loading || updateUserMutation.isPending}
                      className="h-11 w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 font-medium text-white shadow-lg transition-all hover:from-brand-600 hover:to-brand-700 hover:shadow-xl sm:w-auto"
                    >
                      {loading || updateUserMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Billing Information Section */}
              {billingData && (
                <>
                  <Separator className="my-6" />
                  <div className="flex flex-1 flex-col">
                    <div className="mb-6 space-y-5">
                      <div>
                        <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                          <Wallet className="h-5 w-5 text-brand-500" />
                          Billing Information
                        </h3>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2 rounded-xl border border-brand-200/50 bg-gradient-to-br from-brand-50 to-brand-100/50 p-4 dark:border-brand-700/50 dark:from-brand-950/50 dark:to-brand-900/50">
                          <Label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Billing Mode
                          </Label>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-brand-500 px-3 py-1 text-xs font-medium text-white">
                              {billingData.billing_mode || "PREPAID"}
                            </Badge>
                          </div>
                        </div>
                        {billingData.billing_type && (
                          <div className="space-y-2 rounded-xl border border-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 dark:border-gray-700/50 dark:from-gray-800/50 dark:to-gray-900/50">
                            <Label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                              Billing Type
                            </Label>
                            <div className="text-base font-bold text-gray-900 dark:text-white">
                              {billingData.billing_type}
                            </div>
                          </div>
                        )}
                        {billingData.billing_rate !== undefined && (
                          <div className="space-y-2 rounded-xl border border-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 dark:border-gray-700/50 dark:from-gray-800/50 dark:to-gray-900/50">
                            <Label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                              Rate per SMS
                            </Label>
                            <div className="text-base font-bold text-gray-900 dark:text-white">
                              {formatCurrency(billingData.billing_rate ?? 0)}
                            </div>
                          </div>
                        )}
                        {billingData.credit_limit && (
                          <div className="space-y-2 rounded-xl border border-blue-200/50 bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 dark:border-blue-700/50 dark:from-blue-950/50 dark:to-blue-900/50">
                            <Label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                              <CreditCard className="h-3 w-3" />
                              Credit Limit
                            </Label>
                            <div className="text-base font-bold text-gray-900 dark:text-white">
                              {formatCurrency(billingData.credit_limit ?? 0)}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Available:{" "}
                              <span className="font-semibold text-blue-600 dark:text-blue-400">
                                {formatCurrency(availableCredit)}
                              </span>
                            </div>
                          </div>
                        )}
                        {currentBonus !== undefined && currentBonus > 0 && (
                          <div className="space-y-2 rounded-xl border border-green-200/50 bg-gradient-to-br from-green-50 to-green-100/50 p-4 dark:border-green-700/50 dark:from-green-950/50 dark:to-green-900/50">
                            <Label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                              <Sparkles className="h-3 w-3" />
                              Bonus Credits
                            </Label>
                            <div className="text-base font-bold text-gray-900 dark:text-white">
                              {formatCurrency(currentBonus ?? 0)}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Free credits
                            </div>
                          </div>
                        )}
                        <div className="space-y-2 rounded-xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 dark:border-emerald-700/50 dark:from-emerald-950/50 dark:to-emerald-900/50">
                          <Label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Total Balance
                          </Label>
                          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(totalBalance)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions - Fixed at bottom */}
                    <div className="-mx-4 -mb-4 mt-4 border-t border-gray-200 px-4 pt-4 dark:border-gray-800 sm:-mx-6 sm:-mb-6 sm:mt-[70px] sm:px-6 sm:pt-6 md:-mx-8 md:px-8">
                      <h4 className="mb-2 text-xs font-semibold text-gray-900 dark:text-white sm:mb-3 sm:text-sm">
                        Quick Actions
                      </h4>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                        <Button
                          className="h-11 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 font-medium text-white shadow-lg transition-all hover:from-brand-600 hover:to-brand-700 hover:shadow-xl"
                          onClick={() => {
                            setActiveTab("topup");
                          }}
                        >
                          <ArrowUpRight className="mr-2 h-4 w-4" />
                          Top Up Account
                        </Button>
                        <Button
                          variant="outline"
                          className="h-11 rounded-xl border-2 font-medium transition-all hover:bg-gray-50 dark:hover:bg-gray-800"
                          onClick={() => router.push("/topup?tab=history")}
                        >
                          <Receipt className="mr-2 h-4 w-4" />
                          View History
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card className="overflow-hidden rounded-3xl border-0 bg-white/80 shadow-xl backdrop-blur-sm dark:bg-gray-900/80">
            <CardHeader className="border-b border-gray-200/50 bg-gradient-to-r from-blue-50/50 to-blue-100/50 p-6 dark:border-gray-800/50 dark:from-blue-950/50 dark:to-blue-900/50 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 shadow-lg">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
                    Account Information
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                    Your account details and subscription information
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              {/* Account Statistics Section */}
              <div className="mb-8">
                <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Account Statistics
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Credits Used */}
                  <div className="space-y-2 rounded-xl border border-purple-200/50 bg-gradient-to-br from-purple-50 to-purple-100/50 p-4 dark:border-purple-700/50 dark:from-purple-950/50 dark:to-purple-900/50">
                    <Label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      <Sparkles className="h-3 w-3" />
                      Credits Used
                    </Label>
                    <div className="text-base font-bold text-gray-900 dark:text-white">
                      {(allTimeSummary.all_credits || 0).toLocaleString()}
                    </div>
                  </div>

                  {/* All Contacts */}
                  <div className="space-y-2 rounded-xl border border-indigo-200/50 bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-4 dark:border-indigo-700/50 dark:from-indigo-950/50 dark:to-indigo-900/50">
                    <Label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      <Users className="h-3 w-3" />
                      All Contacts
                    </Label>
                    <div className="text-base font-bold text-gray-900 dark:text-white">
                      {(allTimeSummary.all_contacts || 0).toLocaleString()}
                    </div>
                  </div>

                  {/* Delivery Rate */}
                  <div className="space-y-2 rounded-xl border border-teal-200/50 bg-gradient-to-br from-teal-50 to-teal-100/50 p-4 dark:border-teal-700/50 dark:from-teal-950/50 dark:to-teal-900/50">
                    <Label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      <TrendingUp className="h-3 w-3" />
                      Delivery Rate
                    </Label>
                    <div className="text-base font-bold text-gray-900 dark:text-white">
                      {deliveryRate}
                    </div>
                  </div>

                  {/* Balance */}
                  <div className="space-y-2 rounded-xl border border-brand-200/50 bg-gradient-to-br from-brand-50 to-brand-100/50 p-4 dark:border-brand-700/50 dark:from-brand-950/50 dark:to-brand-900/50">
                    <Label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      <Wallet className="h-3 w-3" />
                      Balance
                    </Label>
                    <div className="text-base font-bold text-gray-900 dark:text-white">
                      {billingData ? `$${(currentBalance || 0).toFixed(2)}` : "$0.00"}
                    </div>
                  </div>

                  {/* Credit Limit */}
                  <div className="space-y-2 rounded-xl border border-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 dark:border-gray-700/50 dark:from-gray-800/50 dark:to-gray-900/50">
                    <Label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      <CreditCard className="h-3 w-3" />
                      Credit Limit
                    </Label>
                    <div className="text-base font-bold text-gray-900 dark:text-white">
                      {billingData?.credit_limit
                        ? `$${billingData.credit_limit.toFixed(2)}`
                        : "N/A"}
                    </div>
                  </div>

                  {/* Bonus */}
                  <div className="space-y-2 rounded-xl border border-green-200/50 bg-gradient-to-br from-green-50 to-green-100/50 p-4 dark:border-green-700/50 dark:from-green-950/50 dark:to-green-900/50">
                    <Label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      <Receipt className="h-3 w-3" />
                      Bonus
                    </Label>
                    <div className="text-base font-bold text-gray-900 dark:text-white">
                      {billingData ? `$${(currentBonus || 0).toFixed(2)}` : "$0.00"}
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Account Details Section */}
              <div>
                <h3 className="mb-4 text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                  Account Details
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {userData && (
                    <>
                      <div className="space-y-2 rounded-xl border border-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 dark:border-gray-700/50 dark:from-gray-800/50 dark:to-gray-900/50">
                        <Label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          User ID
                        </Label>
                        <div className="text-base font-bold text-gray-900 dark:text-white">
                          #{userData.id}
                        </div>
                      </div>
                      <div className="space-y-2 rounded-xl border border-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 dark:border-gray-700/50 dark:from-gray-800/50 dark:to-gray-900/50">
                        <Label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Role ID
                        </Label>
                        <div className="text-base font-bold text-gray-900 dark:text-white">
                          #{userData.role_id}
                        </div>
                      </div>
                      <div className="space-y-2 rounded-xl border border-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 dark:border-gray-700/50 dark:from-gray-800/50 dark:to-gray-900/50">
                        <Label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Country Code
                        </Label>
                        <div className="text-base font-bold text-gray-900 dark:text-white">
                          {userData.country_code || "N/A"}
                        </div>
                      </div>
                      <div className="space-y-2 rounded-xl border border-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 dark:border-gray-700/50 dark:from-gray-800/50 dark:to-gray-900/50">
                        <Label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Created
                        </Label>
                        <div className="text-base font-bold text-gray-900 dark:text-white">
                          {userData.created
                            ? format(new Date(userData.created), "MMM yyyy")
                            : "N/A"}
                        </div>
                      </div>
                    </>
                  )}
                  {clientData && (
                    <>
                      <div className="space-y-2 rounded-xl border border-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 dark:border-gray-700/50 dark:from-gray-800/50 dark:to-gray-900/50">
                        <Label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Client ID
                        </Label>
                        <div className="text-base font-bold text-gray-900 dark:text-white">
                          #{clientData.id}
                        </div>
                      </div>
                      <div className="flex flex-col items-start space-y-2 rounded-xl border border-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 dark:border-gray-700/50 dark:from-gray-800/50 dark:to-gray-900/50">
                        <Label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Account Type
                        </Label>
                        <Badge className="bg-brand-500 px-3 py-1 text-xs font-medium text-white">
                          {clientData.account_type || "Standard"}
                        </Badge>
                      </div>
                      <div className="space-y-2 rounded-xl border border-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 dark:border-gray-700/50 dark:from-gray-800/50 dark:to-gray-900/50">
                        <Label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Created
                        </Label>
                        <div className="text-base font-bold text-gray-900 dark:text-white">
                          {clientData.created
                            ? format(new Date(clientData.created), "MMM yyyy")
                            : "N/A"}
                        </div>
                      </div>
                      <div className="space-y-2 rounded-xl border border-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 dark:border-gray-700/50 dark:from-gray-800/50 dark:to-gray-900/50">
                        <Label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Last Updated
                        </Label>
                        <div className="text-base font-bold text-gray-900 dark:text-white">
                          {clientData.updated
                            ? format(new Date(clientData.updated), "MMM yyyy")
                            : "N/A"}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Menu */}
        <Card className="overflow-hidden rounded-3xl border-0 bg-white shadow-xl dark:bg-gray-900">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50/50 to-white dark:border-gray-800 dark:from-gray-900/50 dark:to-gray-900">
                <div className="px-6 pb-4 pt-6 sm:px-8">
                  <TabsList className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent flex h-auto w-full items-center justify-start gap-1.5 overflow-x-auto rounded-2xl bg-gray-100 p-1.5 dark:bg-gray-800">
                    <TabsTrigger
                      value="billing"
                      className="relative inline-flex flex-shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-500 data-[state=active]:to-brand-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=active]:shadow-lg data-[state=active]:shadow-brand-500/30 data-[state=inactive]:hover:bg-gray-200/50 data-[state=inactive]:hover:text-gray-900 dark:data-[state=inactive]:text-gray-400 dark:data-[state=active]:shadow-brand-500/20 dark:data-[state=inactive]:hover:bg-gray-700/30 dark:data-[state=inactive]:hover:text-gray-200"
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span className="hidden sm:inline">SMS Billing</span>
                      <span className="sm:hidden">Billing</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="reports"
                      className="relative inline-flex flex-shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-500 data-[state=active]:to-brand-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=active]:shadow-lg data-[state=active]:shadow-brand-500/30 data-[state=inactive]:hover:bg-gray-200/50 data-[state=inactive]:hover:text-gray-900 dark:data-[state=inactive]:text-gray-400 dark:data-[state=active]:shadow-brand-500/20 dark:data-[state=inactive]:hover:bg-gray-700/30 dark:data-[state=inactive]:hover:text-gray-200"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Reports
                    </TabsTrigger>
                    <TabsTrigger
                      value="transactions"
                      className="relative inline-flex flex-shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-500 data-[state=active]:to-brand-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=active]:shadow-lg data-[state=active]:shadow-brand-500/30 data-[state=inactive]:hover:bg-gray-200/50 data-[state=inactive]:hover:text-gray-900 dark:data-[state=inactive]:text-gray-400 dark:data-[state=active]:shadow-brand-500/20 dark:data-[state=inactive]:hover:bg-gray-700/30 dark:data-[state=inactive]:hover:text-gray-200"
                    >
                      <Receipt className="h-4 w-4" />
                      <span className="hidden sm:inline">Transactions</span>
                      <span className="sm:hidden">Txns</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="invoices"
                      className="relative inline-flex flex-shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-500 data-[state=active]:to-brand-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=active]:shadow-lg data-[state=active]:shadow-brand-500/30 data-[state=inactive]:hover:bg-gray-200/50 data-[state=inactive]:hover:text-gray-900 dark:data-[state=inactive]:text-gray-400 dark:data-[state=active]:shadow-brand-500/20 dark:data-[state=inactive]:hover:bg-gray-700/30 dark:data-[state=inactive]:hover:text-gray-200"
                    >
                      <FileText className="h-4 w-4" />
                      Invoices
                    </TabsTrigger>
                    <TabsTrigger
                      value="topup"
                      className="relative inline-flex flex-shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-500 data-[state=active]:to-brand-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=active]:shadow-lg data-[state=active]:shadow-brand-500/30 data-[state=inactive]:hover:bg-gray-200/50 data-[state=inactive]:hover:text-gray-900 dark:data-[state=inactive]:text-gray-400 dark:data-[state=active]:shadow-brand-500/20 dark:data-[state=inactive]:hover:bg-gray-700/30 dark:data-[state=inactive]:hover:text-gray-200"
                    >
                      <Wallet className="h-4 w-4" />
                      Topup
                    </TabsTrigger>
                    <TabsTrigger
                      value="theme"
                      className="relative inline-flex flex-shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-500 data-[state=active]:to-brand-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=active]:shadow-lg data-[state=active]:shadow-brand-500/30 data-[state=inactive]:hover:bg-gray-200/50 data-[state=inactive]:hover:text-gray-900 dark:data-[state=inactive]:text-gray-400 dark:data-[state=active]:shadow-brand-500/20 dark:data-[state=inactive]:hover:bg-gray-700/30 dark:data-[state=inactive]:hover:text-gray-200"
                    >
                      <Globe className="h-4 w-4" />
                      <span className="hidden sm:inline">Site Theme</span>
                      <span className="sm:hidden">Theme</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>

              {/* SMS Billing Tab */}
              <TabsContent value="billing" className="mt-0 space-y-6 p-6 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                      <BarChart3 className="h-5 w-5 text-brand-500" />
                      SMS Pricing
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Price per SMS by network
                    </p>
                  </div>
                </div>
                {loadingData ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Loading billing rates...
                    </div>
                  </div>
                ) : billingRates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16">
                    <BarChart3 className="h-12 w-12 text-gray-400" />
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      No billing rates available
                    </div>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                          <TableHead className="whitespace-nowrap py-4 font-semibold text-gray-900 dark:text-white">
                            Network
                          </TableHead>
                          <TableHead className="whitespace-nowrap py-4 text-right font-semibold text-gray-900 dark:text-white">
                            Price Per SMS
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {billingRates.map((rate, index) => (
                          <TableRow
                            key={index}
                            className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          >
                            <TableCell className="whitespace-nowrap py-4 font-medium text-gray-900 dark:text-white">
                              {rate.connector_name || "N/A"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap py-4 text-right font-semibold text-brand-600 dark:text-brand-400">
                              {formatCurrency(rate.billing_rate ?? 0)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              {/* Reports Tab */}
              <TabsContent value="reports" className="mt-0 space-y-6 p-6 sm:p-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-4">
                  <Card className="overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-lg transition-all duration-300 hover:shadow-xl dark:from-blue-950/50 dark:to-blue-900/50">
                    <CardHeader className="px-4 pb-3 pt-4 sm:px-6 sm:pt-6">
                      <div className="mb-2 flex items-center gap-2">
                        <div className="rounded-xl bg-blue-500/20 p-2 dark:bg-blue-500/30">
                          <Send className="h-4 w-4 text-blue-600 dark:text-blue-400 sm:h-5 sm:w-5" />
                        </div>
                        <CardTitle className="text-xs font-semibold text-gray-700 dark:text-gray-300 sm:text-sm">
                          Total Sent
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-0 sm:px-6 sm:pb-6">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 sm:text-3xl">
                        {formatNumber(totalSent)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-emerald-50 to-emerald-100/50 shadow-lg transition-all duration-300 hover:shadow-xl dark:from-emerald-950/50 dark:to-emerald-900/50">
                    <CardHeader className="px-4 pb-3 pt-4 sm:px-6 sm:pt-6">
                      <div className="mb-2 flex items-center gap-2">
                        <div className="rounded-xl bg-emerald-500/20 p-2 dark:bg-emerald-500/30">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 sm:h-5 sm:w-5" />
                        </div>
                        <CardTitle className="text-xs font-semibold text-gray-700 dark:text-gray-300 sm:text-sm">
                          Delivered
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-0 sm:px-6 sm:pb-6">
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 sm:text-3xl">
                        {formatNumber(totalDelivered)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-red-50 to-red-100/50 shadow-lg transition-all duration-300 hover:shadow-xl dark:from-red-950/50 dark:to-red-900/50">
                    <CardHeader className="px-4 pb-3 pt-4 sm:px-6 sm:pt-6">
                      <div className="mb-2 flex items-center gap-2">
                        <div className="rounded-xl bg-red-500/20 p-2 dark:bg-red-500/30">
                          <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 sm:h-5 sm:w-5" />
                        </div>
                        <CardTitle className="text-xs font-semibold text-gray-700 dark:text-gray-300 sm:text-sm">
                          Failed
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-0 sm:px-6 sm:pb-6">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400 sm:text-3xl">
                        {formatNumber(totalFailed)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-amber-50 to-amber-100/50 shadow-lg transition-all duration-300 hover:shadow-xl dark:from-amber-950/50 dark:to-amber-900/50">
                    <CardHeader className="px-4 pb-3 pt-4 sm:px-6 sm:pt-6">
                      <div className="mb-2 flex items-center gap-2">
                        <div className="rounded-xl bg-amber-500/20 p-2 dark:bg-amber-500/30">
                          <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 sm:h-5 sm:w-5" />
                        </div>
                        <CardTitle className="text-xs font-semibold text-gray-700 dark:text-gray-300 sm:text-sm">
                          Pending
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-0 sm:px-6 sm:pb-6">
                      <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 sm:text-3xl">
                        {formatNumber(totalPending)}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Report Controls */}
                <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-xl dark:bg-gray-900">
                  <CardHeader className="border-b border-gray-200 p-6 dark:border-gray-800 sm:p-8">
                    <div className="flex flex-col gap-6">
                      <div>
                        <CardTitle className="mb-2 flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                          <div className="rounded-xl bg-brand-500/10 p-2 dark:bg-brand-500/20">
                            <BarChart3 className="h-5 w-5 text-brand-500" />
                          </div>
                          SMS Reports
                        </CardTitle>
                        <CardDescription className="ml-12 text-sm text-gray-600 dark:text-gray-400">
                          {reportType === "connector"
                            ? "SMS statistics by network/connector"
                            : "SMS statistics by sender ID"}
                        </CardDescription>
                      </div>
                      <div className="flex flex-nowrap items-center gap-3">
                        <div className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-100 p-1 dark:border-gray-700 dark:bg-gray-800/50">
                          <Button
                            onClick={() => setReportType("connector")}
                            variant={reportType === "connector" ? "default" : "ghost"}
                            size="sm"
                            className={`h-9 rounded-lg px-4 text-sm font-semibold transition-all ${
                              reportType === "connector"
                                ? "bg-brand-500 text-white shadow-md hover:bg-brand-600"
                                : "text-gray-600 hover:bg-white/50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-gray-200"
                            }`}
                          >
                            <Network className="mr-2 h-4 w-4" />
                            Network
                          </Button>
                          <Button
                            onClick={() => setReportType("sender")}
                            variant={reportType === "sender" ? "default" : "ghost"}
                            size="sm"
                            className={`h-9 rounded-lg px-4 text-sm font-semibold transition-all ${
                              reportType === "sender"
                                ? "bg-brand-500 text-white shadow-md hover:bg-brand-600"
                                : "text-gray-600 hover:bg-white/50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-gray-200"
                            }`}
                          >
                            <Hash className="mr-2 h-4 w-4" />
                            Sender
                          </Button>
                        </div>
                        <Select
                          value={dateRange}
                          onValueChange={(value) => {
                            setDateRange(value);
                            if (value !== "custom") {
                              setCustomStartDate(undefined);
                              setCustomEndDate(undefined);
                            }
                          }}
                        >
                          <SelectTrigger className="h-10 w-full rounded-xl border-2 border-gray-200 bg-white text-sm font-medium transition-colors hover:border-brand-500 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-brand-500 dark:focus:border-brand-500 sm:w-[200px]">
                            <SelectValue placeholder="Select date range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="week">Last 7 Days</SelectItem>
                            <SelectItem value="month">Last 30 Days</SelectItem>
                            <SelectItem value="year">This Year</SelectItem>
                            <SelectItem value="custom">Custom Date</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={() => refetchReports()}
                          disabled={isLoadingReports}
                          variant="outline"
                          className="h-10 rounded-xl border-2 border-gray-200 px-5 text-sm font-semibold transition-all hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800"
                        >
                          {isLoadingReports ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Refreshing...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Refresh
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => {
                            if (currentReportData.length === 0) {
                              showAlert({
                                variant: "warning",
                                title: "No Data",
                                message: "No data available to export.",
                              });
                              return;
                            }
                            try {
                              exportReportToPDF({
                                title: "SMS Report",
                                reportType: reportType === "connector" ? "network" : "sender",
                                dateRange,
                                startDate: getDateRange.start,
                                endDate: getDateRange.end,
                                summaryStats: {
                                  totalSent,
                                  totalDelivered,
                                  totalFailed,
                                  totalPending,
                                },
                                reportData: currentReportData,
                                pageColor: "#8b5cf6",
                              });
                              showAlert({
                                variant: "success",
                                title: "Success",
                                message: "Report exported to PDF successfully!",
                              });
                            } catch (error: unknown) {
                              showAlert({
                                variant: "error",
                                title: "Error",
                                message:
                                  (error as { message?: string })?.message ||
                                  "Failed to export report to PDF.",
                              });
                            }
                          }}
                          disabled={isLoadingReports}
                          variant="outline"
                          className="h-10 rounded-xl border-2 border-gray-200 px-5 text-sm font-semibold transition-all hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Export PDF
                        </Button>
                      </div>
                    </div>
                    {dateRange === "custom" && (
                      <div className="mt-6 flex flex-col items-stretch gap-4 rounded-xl border border-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100/50 p-5 dark:border-gray-700/50 dark:from-gray-800/50 dark:to-gray-900/50 sm:flex-row sm:items-end">
                        <div className="flex-1">
                          <Label className="mb-3 block flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                            <Calendar className="h-4 w-4 text-brand-500" />
                            Select Date Range
                          </Label>
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
                            setDateRange("week");
                            setCustomStartDate(undefined);
                            setCustomEndDate(undefined);
                          }}
                          className="h-10 rounded-xl border-2 border-gray-200 px-5 text-sm font-semibold transition-all hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800"
                        >
                          Clear
                        </Button>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-6 pt-0 sm:p-8">
                    {isLoadingReports ? (
                      <div className="flex flex-col items-center justify-center gap-3 py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Loading report data...
                        </span>
                      </div>
                    ) : isErrorReports ? (
                      <div className="flex flex-col items-center justify-center gap-3 py-16">
                        <XCircle className="h-12 w-12 text-red-500" />
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Failed to load report data. Please try again.
                        </p>
                      </div>
                    ) : currentReportData.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-3 py-16">
                        <MessageSquare className="h-12 w-12 text-gray-400" />
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          No data available for the selected date range.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                              <TableHead className="whitespace-nowrap py-4 text-sm font-semibold text-gray-900 dark:text-white">
                                {reportType === "connector" ? "Network" : "Sender ID"}
                              </TableHead>
                              <TableHead className="whitespace-nowrap py-4 text-sm font-semibold text-gray-900 dark:text-white">
                                Sent
                              </TableHead>
                              <TableHead className="whitespace-nowrap py-4 text-sm font-semibold text-gray-900 dark:text-white">
                                Delivered
                              </TableHead>
                              <TableHead className="whitespace-nowrap py-4 text-sm font-semibold text-gray-900 dark:text-white">
                                Failed
                              </TableHead>
                              <TableHead className="whitespace-nowrap py-4 text-sm font-semibold text-gray-900 dark:text-white">
                                Pending
                              </TableHead>
                              <TableHead className="whitespace-nowrap py-4 text-sm font-semibold text-gray-900 dark:text-white">
                                % DLR
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {currentReportData.map(
                              (
                                item: {
                                  connector_name?: string;
                                  sender_id?: string;
                                  sent?: number;
                                  delivered?: number;
                                  failed?: number;
                                  pending?: number;
                                },
                                index: number
                              ) => {
                                // Calculate total sent: use sent if available, otherwise sum individual statuses
                                const totalSent =
                                  item.sent ||
                                  (item.delivered || 0) + (item.pending || 0) + (item.failed || 0);
                                const delivered = item.delivered || 0;
                                const deliveryRate =
                                  totalSent > 0 ? (delivered / totalSent) * 100 : 0;
                                const displayRate =
                                  isNaN(deliveryRate) || !isFinite(deliveryRate)
                                    ? "--"
                                    : `${deliveryRate.toFixed(2)}%`;

                                return (
                                  <TableRow
                                    key={index}
                                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                  >
                                    <TableCell className="whitespace-nowrap py-4 text-sm font-medium text-gray-900 dark:text-white">
                                      {reportType === "connector"
                                        ? item.connector_name || "N/A"
                                        : item.sender_id || "N/A"}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap py-4 text-sm font-medium text-gray-900 dark:text-white">
                                      {formatNumber(totalSent)}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap py-4">
                                      <Badge className="bg-emerald-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-600">
                                        {formatNumber(item.delivered || 0)}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap py-4">
                                      <Badge className="bg-red-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-600">
                                        {formatNumber(item.failed || 0)}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap py-4">
                                      <Badge className="bg-amber-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-amber-600">
                                        {formatNumber(item.pending || 0)}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap py-4 text-sm font-semibold text-gray-900 dark:text-white">
                                      {displayRate}
                                    </TableCell>
                                  </TableRow>
                                );
                              }
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Transactions Tab */}
              <TabsContent value="transactions" className="mt-0 space-y-6 p-6 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                      <Receipt className="h-5 w-5 text-brand-500" />
                      Transaction History
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Your payment and transaction history
                    </p>
                  </div>
                </div>
                {loadingData ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Loading transactions...
                    </div>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16">
                    <Receipt className="h-12 w-12 text-gray-400" />
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      No transactions available
                    </div>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                          <TableHead className="whitespace-nowrap py-4 font-semibold text-gray-900 dark:text-white">
                            Amount
                          </TableHead>
                          <TableHead className="whitespace-nowrap py-4 font-semibold text-gray-900 dark:text-white">
                            Method
                          </TableHead>
                          <TableHead className="hidden whitespace-nowrap py-4 font-semibold text-gray-900 dark:text-white sm:table-cell">
                            Reference
                          </TableHead>
                          <TableHead className="hidden whitespace-nowrap py-4 font-semibold text-gray-900 dark:text-white md:table-cell">
                            Details
                          </TableHead>
                          <TableHead className="whitespace-nowrap py-4 text-right font-semibold text-gray-900 dark:text-white">
                            Date
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((transaction) => (
                          <TableRow
                            key={transaction.id}
                            className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          >
                            <TableCell className="whitespace-nowrap py-4 font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(transaction.amount ?? 0)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap py-4">
                              <Badge variant="secondary" className="text-xs">
                                {transaction.method_type || "N/A"}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden whitespace-nowrap py-4 text-sm text-gray-600 dark:text-gray-400 sm:table-cell">
                              {transaction.reference || "N/A"}
                            </TableCell>
                            <TableCell className="hidden whitespace-nowrap py-4 text-sm text-gray-600 dark:text-gray-400 md:table-cell">
                              {transaction.customer_name || "N/A"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap py-4 text-right text-sm text-gray-600 dark:text-gray-400">
                              {transaction.created
                                ? format(new Date(transaction.created), "PPP")
                                : "N/A"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              {/* Invoices Tab */}
              <TabsContent value="invoices" className="mt-0 space-y-6 p-6 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                      <FileText className="h-5 w-5 text-brand-500" />
                      Invoices
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Your invoice history
                    </p>
                  </div>
                </div>
                {loadingData ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Loading invoices...
                    </div>
                  </div>
                ) : invoices.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16">
                    <FileText className="h-12 w-12 text-gray-400" />
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      No invoices available
                    </div>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                          <TableHead className="whitespace-nowrap py-4 font-semibold text-gray-900 dark:text-white">
                            Invoice #
                          </TableHead>
                          <TableHead className="whitespace-nowrap py-4 font-semibold text-gray-900 dark:text-white">
                            Amount
                          </TableHead>
                          <TableHead className="whitespace-nowrap py-4 font-semibold text-gray-900 dark:text-white">
                            Status
                          </TableHead>
                          <TableHead className="hidden whitespace-nowrap py-4 font-semibold text-gray-900 dark:text-white sm:table-cell">
                            Reference
                          </TableHead>
                          <TableHead className="hidden whitespace-nowrap py-4 font-semibold text-gray-900 dark:text-white md:table-cell">
                            Details
                          </TableHead>
                          <TableHead className="whitespace-nowrap py-4 text-right font-semibold text-gray-900 dark:text-white">
                            Date
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoices.map((invoice) => (
                          <TableRow
                            key={invoice.id}
                            className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          >
                            <TableCell className="whitespace-nowrap py-4 font-medium text-gray-900 dark:text-white">
                              {invoice.invoice_number || `#${invoice.id}`}
                            </TableCell>
                            <TableCell className="whitespace-nowrap py-4 font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(invoice.amount ?? 0)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap py-4">
                              <Badge
                                variant={invoice.status === "paid" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {invoice.status || "N/A"}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden whitespace-nowrap py-4 text-sm text-gray-600 dark:text-gray-400 sm:table-cell">
                              {invoice.reference || "N/A"}
                            </TableCell>
                            <TableCell className="hidden whitespace-nowrap py-4 text-sm text-gray-600 dark:text-gray-400 md:table-cell">
                              {invoice.customer_name || "N/A"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap py-4 text-right text-sm text-gray-600 dark:text-gray-400">
                              {invoice.created ? format(new Date(invoice.created), "PPP") : "N/A"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              {/* Topup Tab */}
              <TabsContent value="topup" className="mt-0 space-y-6 p-6 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                      <Wallet className="h-5 w-5 text-brand-500" />
                      Top Up Account
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Add funds to your account balance via Mobile Money
                    </p>
                  </div>
                </div>

                {errorMessage && (
                  <div className="flex items-start gap-3 rounded-xl border-l-4 border-red-500 bg-red-50 p-4 dark:border-red-400 dark:bg-red-950/30">
                    <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500 dark:text-red-400" />
                    <p className="text-sm font-medium text-red-900 dark:text-red-300">
                      {errorMessage}
                    </p>
                  </div>
                )}

                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Main Topup Form */}
                  <div className="lg:col-span-2">
                    <Card className="overflow-hidden rounded-3xl border-0 bg-white/80 shadow-xl backdrop-blur-sm dark:bg-gray-900/80">
                      <CardHeader className="border-b border-gray-200/50 bg-gradient-to-r from-brand-50/50 to-brand-100/50 p-6 dark:border-gray-800/50 dark:from-brand-950/50 dark:to-brand-900/50 sm:p-8">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 p-3 shadow-lg">
                            <CreditCard className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
                              Top Up Request
                            </CardTitle>
                            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                              Fill in the details to add funds to your account
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6 p-6 sm:p-8">
                        {/* Mobile Network Operator Selection */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="mno_wallet_type"
                            className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white"
                          >
                            <Network className="h-4 w-4 text-brand-500" />
                            Mobile Network Operator *
                          </Label>
                          {isLoadingProviders ? (
                            <div className="flex h-12 items-center justify-center rounded-xl border-2 border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin text-brand-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Loading operators...
                              </span>
                            </div>
                          ) : (
                            <Select
                              value={mnoWalletType}
                              onValueChange={(value) => {
                                setMnoWalletType(
                                  value as "AIRTEL" | "ORANGE" | "VODACOM" | "AFRICELL"
                                );
                                setErrorMessage(null);
                              }}
                            >
                              <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 bg-white text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900">
                                <SelectValue placeholder="Select mobile operator" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableNetworks.map((network) => (
                                  <SelectItem key={network.code} value={network.code}>
                                    {network.name || network.code}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Select the mobile money provider that will be charged
                          </p>
                        </div>

                        {/* Mobile Number */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="topup_msisdn"
                            className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white"
                          >
                            <Phone className="h-4 w-4 text-brand-500" />
                            Mobile Number *
                          </Label>
                          <Input
                            id="topup_msisdn"
                            value={topupMsisdn}
                            onChange={(e) => {
                              setTopupMsisdn(e.target.value);
                              setErrorMessage(null);
                            }}
                            placeholder="+243974096458"
                            className="h-12 rounded-xl border-2 border-gray-200 bg-white text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            This number will receive the mobile money confirmation prompt
                          </p>
                        </div>

                        {/* Amount */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="topup_amount"
                            className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white"
                          >
                            <DollarSign className="h-4 w-4 text-brand-500" />
                            Amount (USD) *
                          </Label>
                          <Input
                            id="topup_amount"
                            type="number"
                            step="0.01"
                            min="1"
                            value={topupAmount}
                            onChange={(e) => {
                              setTopupAmount(e.target.value);
                              setErrorMessage(null);
                            }}
                            placeholder="Enter amount (e.g. 100.00)"
                            className="h-12 rounded-xl border-2 border-gray-200 bg-white text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900"
                          />
                          {topupAmount && parseFloat(topupAmount) > 0 && (
                            <p className="flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-4 w-4" />
                              Amount to debit: {formatCurrency(parseFloat(topupAmount))}
                            </p>
                          )}
                        </div>

                        <Button
                          onClick={handleTopup}
                          disabled={
                            topupLoading ||
                            mnoSelfTopupMutation.isPending ||
                            !topupAmount ||
                            !topupMsisdn ||
                            !mnoWalletType
                          }
                          className="h-12 w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 font-medium text-white shadow-lg transition-all hover:from-brand-600 hover:to-brand-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {topupLoading || mnoSelfTopupMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Submit Top Up Request
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Balance Info Sidebar */}
                  <div className="space-y-6">
                    {/* Current Balance Card */}
                    {billingData && (
                      <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 shadow-2xl dark:from-brand-600 dark:via-brand-700 dark:to-brand-800">
                        <CardContent className="p-6 sm:p-8">
                          <div className="mb-4 flex items-center justify-between">
                            <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                              <Wallet className="h-6 w-6 text-white" />
                            </div>
                            <Badge className="border-white/30 bg-white/20 text-white backdrop-blur-sm">
                              Current
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-white/80">Account Balance</p>
                            <p className="text-3xl font-bold text-white sm:text-4xl">
                              {formatCurrency(currentBalance ?? 0)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Balance Details Card */}
                    {billingData && (
                      <Card className="overflow-hidden rounded-3xl border-0 bg-white/80 shadow-xl backdrop-blur-sm dark:bg-gray-900/80">
                        <CardHeader className="border-b border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-gray-100/50 p-6 dark:border-gray-800/50 dark:from-gray-800/50 dark:to-gray-900/50">
                          <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
                            <BarChart3 className="h-4 w-4 text-brand-500" />
                            Balance Details
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 p-6">
                          <div className="space-y-2 rounded-xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 dark:border-emerald-700/50 dark:from-emerald-950/50 dark:to-emerald-900/50">
                            <Label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                              <Sparkles className="h-3 w-3" />
                              Total Available
                            </Label>
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(totalBalance)}
                            </div>
                          </div>

                          {billingData.credit_limit && (
                            <div className="space-y-2 rounded-xl border border-blue-200/50 bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 dark:border-blue-700/50 dark:from-blue-950/50 dark:to-blue-900/50">
                              <Label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                <CreditCard className="h-3 w-3" />
                                Credit Limit
                              </Label>
                              <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {formatCurrency(billingData.credit_limit ?? 0)}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                Available:{" "}
                                <span className="font-semibold text-blue-600 dark:text-blue-400">
                                  {formatCurrency(availableCredit)}
                                </span>
                              </div>
                            </div>
                          )}

                          {currentBonus !== undefined && currentBonus > 0 && (
                            <div className="space-y-2 rounded-xl border border-green-200/50 bg-gradient-to-br from-green-50 to-green-100/50 p-4 dark:border-green-700/50 dark:from-green-950/50 dark:to-green-900/50">
                              <Label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                <Sparkles className="h-3 w-3" />
                                Bonus Credits
                              </Label>
                              <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {formatCurrency(currentBonus ?? 0)}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                Free credits
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Info Card */}
                    <Card className="overflow-hidden rounded-3xl border border-0 border-blue-200/50 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-lg backdrop-blur-sm dark:border-blue-700/50 dark:from-blue-950/50 dark:to-blue-900/50">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-3">
                          <div className="rounded-lg bg-blue-500/20 p-2">
                            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              Secure Payment
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Every top up is confirmed by your mobile money provider. Your
                              transaction is secure and encrypted.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Site Theme Tab */}
              <TabsContent value="theme" className="mt-0 space-y-6 p-6 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                      <Globe className="h-5 w-5 text-brand-500" />
                      Site Theme
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Customize your application appearance
                    </p>
                  </div>
                </div>

                <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-xl dark:bg-gray-900">
                  <CardContent className="space-y-6 p-6 sm:p-8">
                    <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100/50 p-5 dark:border-gray-700/50 dark:from-gray-800/50 dark:to-gray-900/50 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-4">
                        <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 p-3 shadow-md">
                          {theme === "dark" ? (
                            <Moon className="h-5 w-5 text-white" />
                          ) : (
                            <Sun className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <div>
                          <Label className="text-base font-semibold text-gray-900 dark:text-white">
                            {theme === "dark" ? "Dark Mode" : "Light Mode"}
                          </Label>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            {theme === "dark"
                              ? "Dark theme is currently active"
                              : "Light theme is currently active"}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={toggleTheme}
                        variant="outline"
                        className="h-11 w-full rounded-xl border-2 font-medium sm:w-auto"
                      >
                        {theme === "dark" ? (
                          <>
                            <Sun className="mr-2 h-4 w-4" />
                            Switch to Light
                          </>
                        ) : (
                          <>
                            <Moon className="mr-2 h-4 w-4" />
                            Switch to Dark
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
                      <p className="text-sm text-blue-900 dark:text-blue-300">
                        <strong>Note:</strong> Your theme preference is saved automatically and will
                        be applied across all pages.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Security & Preferences */}
        <Card className="overflow-hidden rounded-3xl border-0 bg-white/80 shadow-xl backdrop-blur-sm dark:bg-gray-900/80">
          <CardHeader className="border-b border-gray-200/50 bg-gradient-to-r from-purple-50/50 to-purple-100/50 p-6 dark:border-gray-800/50 dark:from-purple-950/50 dark:to-purple-900/50 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-3 shadow-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
                  Security & Preferences
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                  Manage your security settings and preferences
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-6 sm:p-8">
            <div className="flex flex-col gap-4 rounded-xl border-2 border-gray-200 bg-gradient-to-r from-gray-50/50 to-gray-100/50 p-4 transition-all duration-200 hover:shadow-lg dark:border-gray-700 dark:from-gray-800/50 dark:to-gray-900/50 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 p-3 shadow-md">
                  <Key className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-base font-semibold text-gray-900 dark:text-white">
                    Change Password
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Update your password to keep your account secure
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-10 rounded-xl border-2 px-6 font-medium"
                onClick={() => setIsChangePasswordOpen(true)}
              >
                Change
              </Button>
            </div>

            <div className="flex flex-col gap-4 rounded-xl border-2 border-gray-200 bg-gradient-to-r from-gray-50/50 to-gray-100/50 p-4 transition-all duration-200 hover:shadow-lg dark:border-gray-700 dark:from-gray-800/50 dark:to-gray-900/50 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 shadow-md">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-base font-semibold text-gray-900 dark:text-white">
                    Notifications
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Manage your notification preferences
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-10 rounded-xl border-2 px-6 font-medium"
                onClick={() => router.push("/notifications")}
              >
                Manage
              </Button>
            </div>

            <div className="flex flex-col gap-4 rounded-xl border-2 border-gray-200 bg-gradient-to-r from-gray-50/50 to-gray-100/50 p-4 transition-all duration-200 hover:shadow-lg dark:border-gray-700 dark:from-gray-800/50 dark:to-gray-900/50 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-3 shadow-md">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-base font-semibold text-gray-900 dark:text-white">
                    Language & Region
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Set your preferred language and region
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-10 rounded-xl border-2 px-6 font-medium"
              >
                Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent className="rounded-2xl border-2 border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
              <Lock className="h-5 w-5 text-brand-500" />
              Change Password
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
              Enter your current password and choose a new one to keep your account secure
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Old Password */}
            <div className="space-y-2">
              <Label
                htmlFor="oldPassword"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Current Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="oldPassword"
                  type={showOldPassword ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="h-12 rounded-xl border-2 border-gray-200 bg-white pl-10 pr-10 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800"
                  disabled={passwordLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                  aria-label={showOldPassword ? "Hide password" : "Show password"}
                >
                  {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label
                htmlFor="newPassword"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="h-12 rounded-xl border-2 border-gray-200 bg-white pl-10 pr-10 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800"
                  disabled={passwordLoading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Password must be at least 6 characters long
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Confirm New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="h-12 rounded-xl border-2 border-gray-200 bg-white pl-10 pr-10 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800"
                  disabled={passwordLoading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-stretch justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-800 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsChangePasswordOpen(false);
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }}
              disabled={passwordLoading}
              className="h-11 w-full rounded-xl border-2 font-medium sm:w-auto"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!oldPassword || !newPassword || !confirmPassword) {
                  showAlert({
                    variant: "error",
                    title: "Fields Required",
                    message: "Please fill in all fields.",
                  });
                  return;
                }

                if (newPassword.length < 6) {
                  showAlert({
                    variant: "error",
                    title: "Password Too Short",
                    message: "Password must contain at least 6 characters.",
                  });
                  return;
                }

                if (newPassword !== confirmPassword) {
                  showAlert({
                    variant: "error",
                    title: "Passwords Don't Match",
                    message: "New password and confirmation password do not match.",
                  });
                  return;
                }

                if (!apiKey) {
                  showAlert({
                    variant: "error",
                    title: "Missing API Key",
                    message: "Please sign in again.",
                  });
                  return;
                }

                setPasswordLoading(true);
                try {
                  await changePassword(
                    {
                      old_password: oldPassword,
                      new_password: newPassword,
                    },
                    apiKey
                  );
                  showAlert({
                    variant: "success",
                    title: "Success",
                    message: "Password changed successfully.",
                  });
                  setIsChangePasswordOpen(false);
                  setOldPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                } catch (error) {
                  // Error is handled by the function
                } finally {
                  setPasswordLoading(false);
                }
              }}
              disabled={passwordLoading}
              className="h-11 w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 font-medium text-white shadow-lg transition-all hover:from-brand-600 hover:to-brand-700 hover:shadow-xl sm:w-auto"
            >
              {passwordLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Change Password
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
