"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAlert } from "@/context/AlertProvider";
import {
  useAdminClientsList,
  useClientSMSBilling,
  useCreditClientTopup,
  useUpdateClientBillingRate,
} from "@/controller/query/admin/clients/useAdminClients";
import {
  useActivePricingConfig,
  useAllPricingTiers,
  useCreatePricingTier,
  useTogglePricingTier,
  useUpdatePricingTier,
  useUpdatePurchasePrice,
} from "@/controller/query/admin/pricing/useAdminPricing";
import type { Connector } from "@/controller/query/connectors/connectors.service";
import { useGetAllConnectors } from "@/controller/query/connectors/useConnectors";
import { cn } from "@/lib/utils";
import { CreatePricingTierRequest, SMSPricingTier, UpdatePricingTierRequest } from "@/types";
import {
  Check,
  CheckCircle2,
  ChevronsUpDown,
  CreditCard,
  DollarSign,
  Edit,
  Loader2,
  Network,
  Package,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  TrendingUp,
  XCircle,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
export default function PricingPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdatePriceDialogOpen, setIsUpdatePriceDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SMSPricingTier | null>(null);
  const [formData, setFormData] = useState<CreatePricingTierRequest>({
    tier_name: "",
    volume_min: 0,
    volume_max: null,
    sale_price: 0,
    tier_order: 0,
  });
  const [purchasePrice, setPurchasePrice] = useState<string>("");

  // Connector pricing configuration states
  const [isConnectorPricingDialogOpen, setIsConnectorPricingDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [connectorRates, setConnectorRates] = useState<
    Array<{ connector_id: number; billing_rate: number | string }>
  >([]);
  const [connectorClientSearchQuery, setConnectorClientSearchQuery] = useState<string>("");
  const [isConnectorClientPopoverOpen, setIsConnectorClientPopoverOpen] = useState(false);

  // Credit Account states
  const [isCreditAccountDialogOpen, setIsCreditAccountDialogOpen] = useState(false);
  const [creditClientId, setCreditClientId] = useState<string>("");
  const [creditFormData, setCreditFormData] = useState({
    amount: "",
    description: "",
  });
  const [clientSearchQuery, setClientSearchQuery] = useState<string>("");
  const [isCreditClientPopoverOpen, setIsCreditClientPopoverOpen] = useState(false);

  const { showAlert } = useAlert();

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const { data: configData, isLoading: isLoadingConfig } = useActivePricingConfig(apiKey, !!apiKey);
  const {
    data: tiersData,
    isLoading: isLoadingTiers,
    refetch: refetchTiers,
  } = useAllPricingTiers(apiKey, !!apiKey);
  const { data: connectorsData, isLoading: isLoadingConnectors } = useGetAllConnectors(
    { page: 1, limit: 100 },
    true
  );
  const updatePriceMutation = useUpdatePurchasePrice();
  const createTierMutation = useCreatePricingTier();
  const updateTierMutation = useUpdatePricingTier();
  const toggleTierMutation = useTogglePricingTier();
  const updateBillingRateMutation = useUpdateClientBillingRate();
  const creditTopupMutation = useCreditClientTopup();

  // Get clients list for selector (for both dialogs)
  // Load clients whenever apiKey is available (not just when dialog is open)
  // This ensures data is ready when dialog opens
  const {
    data: clientsData,
    isLoading: isLoadingClients,
    error: clientsError,
  } = useAdminClientsList(
    { page: 1, per_page: 100 },
    apiKey,
    !!apiKey // Always load when apiKey is available
  );

  // Debug: Log clients data
  useEffect(() => {}, [
    clientsData,
    isLoadingClients,
    clientsError,
    isCreditAccountDialogOpen,
    isConnectorPricingDialogOpen,
  ]);

  // Get client billing rates when client is selected
  const clientIdNumber = selectedClientId ? parseInt(selectedClientId, 10) : null;
  const { data: billingData } = useClientSMSBilling(
    clientIdNumber,
    apiKey,
    !!clientIdNumber && !!apiKey && isConnectorPricingDialogOpen
  );

  const config = configData?.message;
  const allTiers = useMemo(() => {
    const payload: unknown = tiersData?.message || [];
    if (!Array.isArray(payload)) return [];

    // Normalize volume_max from object format {Int64: number, Valid: boolean} to number | null
    return (payload as SMSPricingTier[]).map((tier) => {
      if (tier.volume_max && typeof tier.volume_max === "object" && "Int64" in tier.volume_max) {
        const volumeMaxObj = tier.volume_max as { Int64: number; Valid: boolean };
        return {
          ...tier,
          volume_max: volumeMaxObj.Valid ? volumeMaxObj.Int64 : null,
        };
      }
      return tier;
    });
  }, [tiersData]);

  // Filter tiers based on search
  const tiers = useMemo(() => {
    if (!search.trim()) return allTiers;
    const searchLower = search.toLowerCase();
    return allTiers.filter((tier) => {
      const tierName = String(tier.tier_name || "").toLowerCase();
      return tierName.includes(searchLower);
    });
  }, [allTiers, search]);

  const stats = useMemo(() => {
    const activeTiers = tiers.filter((tier) => tier.is_active === true).length;
    const totalTiers = tiers.length;
    const avgSalePrice =
      tiers.length > 0
        ? tiers.reduce((sum, tier) => sum + (tier.sale_price || 0), 0) / tiers.length
        : 0;
    return {
      totalTiers,
      activeTiers,
      inactiveTiers: totalTiers - activeTiers,
      avgSalePrice,
    };
  }, [tiers]);

  const isRefreshing = isLoadingConfig || isLoadingTiers;

  const handleRefresh = async () => {
    try {
      await refetchTiers();
      showAlert({
        variant: "success",
        title: "Pricing refreshed",
        message: "The latest pricing configuration has been loaded successfully.",
      });
    } catch (error) {
      showAlert({
        variant: "error",
        title: "Refresh failed",
        message: error instanceof Error ? error.message : "Unable to refresh pricing data.",
      });
    }
  };

  const handleUpdatePurchasePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) return;

    const price = parseFloat(purchasePrice);
    if (isNaN(price) || price <= 0) {
      showAlert({
        variant: "error",
        title: "Validation Error",
        message: "Purchase price must be a positive number.",
      });
      return;
    }

    try {
      await updatePriceMutation.mutateAsync({
        data: { purchase_price: price },
        apiKey,
      });
      setIsUpdatePriceDialogOpen(false);
      setPurchasePrice("");
    } catch {
      // Error handled in mutation
    }
  };

  const handleCreateTier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) return;

    if (!formData.tier_name.trim()) {
      showAlert({
        variant: "error",
        title: "Validation Error",
        message: "Tier name is required.",
      });
      return;
    }

    if (formData.volume_min < 0) {
      showAlert({
        variant: "error",
        title: "Validation Error",
        message: "Volume min must be >= 0.",
      });
      return;
    }

    if (
      formData.volume_max !== null &&
      formData.volume_max !== undefined &&
      formData.volume_max <= formData.volume_min
    ) {
      showAlert({
        variant: "error",
        title: "Validation Error",
        message: "Volume max must be greater than volume min.",
      });
      return;
    }

    if (formData.sale_price <= 0) {
      showAlert({
        variant: "error",
        title: "Validation Error",
        message: "Sale price must be greater than 0.",
      });
      return;
    }

    try {
      await createTierMutation.mutateAsync({
        data: formData,
        apiKey,
      });
      setIsCreateDialogOpen(false);
      setFormData({
        tier_name: "",
        volume_min: 0,
        volume_max: null,
        sale_price: 0,
        tier_order: 0,
      });
      await refetchTiers();
    } catch {
      // Error handled in mutation
    }
  };

  const handleEditTier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey || !selectedTier?.id) return;

    const updateData: UpdatePricingTierRequest = {
      tier_id: selectedTier.id,
    };

    if (formData.tier_name.trim()) updateData.tier_name = formData.tier_name;
    if (formData.volume_min >= 0) updateData.volume_min = formData.volume_min;
    if (formData.volume_max !== null) updateData.volume_max = formData.volume_max;
    if (formData.sale_price > 0) updateData.sale_price = formData.sale_price;
    if (formData.tier_order >= 0) updateData.tier_order = formData.tier_order;

    try {
      await updateTierMutation.mutateAsync({
        data: updateData,
        apiKey,
      });
      setIsEditDialogOpen(false);
      setSelectedTier(null);
      setFormData({
        tier_name: "",
        volume_min: 0,
        volume_max: null,
        sale_price: 0,
        tier_order: 0,
      });
      await refetchTiers();
    } catch {
      // Error handled in mutation
    }
  };

  const handleToggleTier = async (tierId: number) => {
    if (!apiKey) return;
    try {
      await toggleTierMutation.mutateAsync({
        data: { tier_id: tierId },
        apiKey,
      });
      await refetchTiers();
    } catch {
      // Error handled in mutation
    }
  };

  const openEditDialog = (tier: SMSPricingTier) => {
    setSelectedTier(tier);

    // Handle volume_max which can be number, null, or object {Int64, Valid}
    let volumeMax: number | null = null;
    if (tier.volume_max !== undefined && tier.volume_max !== null) {
      if (typeof tier.volume_max === "object" && "Int64" in tier.volume_max) {
        const volMax = tier.volume_max as { Int64: number; Valid: boolean };
        volumeMax = volMax.Valid ? volMax.Int64 : null;
      } else if (typeof tier.volume_max === "number") {
        volumeMax = tier.volume_max;
      }
    }

    setFormData({
      tier_name: tier.tier_name || "",
      volume_min: tier.volume_min || 0,
      volume_max: volumeMax,
      sale_price: tier.sale_price || 0,
      tier_order: tier.tier_order || 0,
    });
    setIsEditDialogOpen(true);
  };

  // Handle connector pricing configuration
  const handleOpenConnectorPricingDialog = () => {
    setIsConnectorPricingDialogOpen(true);
    setSelectedClientId("");
    setConnectorRates([]);
    setConnectorClientSearchQuery("");
  };

  const handleCloseConnectorPricingDialog = () => {
    setIsConnectorPricingDialogOpen(false);
    setSelectedClientId("");
    setConnectorRates([]);
    setConnectorClientSearchQuery("");
  };

  // Get current billing rates for selected client
  const currentBillingRates = useMemo(() => {
    if (!billingData?.message) return [];
    const billingResponse = billingData.message;
    const ratesArray = Array.isArray(billingResponse)
      ? billingResponse
      : typeof billingResponse === "object" && billingResponse !== null
        ? Object.values(billingResponse)
        : [];
    return ratesArray as Array<{ connector_id?: number; billing_rate?: number }>;
  }, [billingData]);

  // Initialize connector rates when client is selected or dialog opens
  useEffect(() => {
    if (isConnectorPricingDialogOpen && connectorsData) {
      const connectorsList =
        connectorsData?.message || connectorsData?.data || connectorsData || [];
      const connectors = Array.isArray(connectorsList) ? connectorsList : [];

      if (connectors.length > 0 && selectedClientId) {
        // Initialize rates for all connectors with existing rates if available
        const initialRates = connectors.map((connector: Connector) => {
          const connectorId = connector.id || 0;
          const existingRate = currentBillingRates.find(
            (rate) => rate.connector_id === connectorId
          );
          return {
            connector_id: connectorId,
            billing_rate: existingRate?.billing_rate?.toString() || "",
          };
        });
        setConnectorRates(initialRates);
      } else if (connectors.length > 0 && !selectedClientId) {
        // Initialize with empty rates if no client selected
        const initialRates = connectors.map((connector: Connector) => ({
          connector_id: connector.id || 0,
          billing_rate: "",
        }));
        setConnectorRates(initialRates);
      }
    }
  }, [isConnectorPricingDialogOpen, selectedClientId, connectorsData, currentBillingRates]);

  const handleUpdateConnectorPricing = async () => {
    if (!apiKey || !selectedClientId) {
      showAlert({
        variant: "error",
        title: "Validation Error",
        message: "Please select a client to configure billing rates.",
      });
      return;
    }

    if (connectorRates.length === 0) {
      showAlert({
        variant: "error",
        title: "Validation Error",
        message: "Please configure at least one billing rate.",
      });
      return;
    }

    try {
      await updateBillingRateMutation.mutateAsync({
        data: {
          id: parseInt(selectedClientId, 10),
          billing_rate: connectorRates
            .filter((rate) => rate.billing_rate && parseFloat(rate.billing_rate.toString()) > 0)
            .map((rate) => ({
              connector_id: rate.connector_id,
              billing_rate: Number(rate.billing_rate) || 0,
            })),
        },
        apiKey,
      });
      handleCloseConnectorPricingDialog();
    } catch {
      // Error handled in mutation
    }
  };

  // Handle Credit Account
  const handleOpenCreditAccountDialog = () => {
    setIsCreditAccountDialogOpen(true);
    setCreditClientId("");
    setCreditFormData({ amount: "", description: "" });
    setClientSearchQuery("");
  };

  const handleCloseCreditAccountDialog = () => {
    setIsCreditAccountDialogOpen(false);
    setCreditClientId("");
    setCreditFormData({ amount: "", description: "" });
    setClientSearchQuery("");
  };

  const handleCreditAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiKey || !creditClientId) {
      showAlert({
        variant: "error",
        title: "Validation Error",
        message: "Please select a client.",
      });
      return;
    }

    const amount = parseFloat(creditFormData.amount);
    if (isNaN(amount) || amount <= 0) {
      showAlert({
        variant: "error",
        title: "Validation Error",
        message: "Amount must be a positive number.",
      });
      return;
    }

    try {
      await creditTopupMutation.mutateAsync({
        data: {
          client_id: Number(creditClientId),
          amount,
          description: creditFormData.description.trim() || undefined,
        },
        apiKey,
      });
      handleCloseCreditAccountDialog();
    } catch {
      // Error handled in mutation
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="rounded-xl border border-blue-200/50 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 p-6 shadow-sm dark:border-blue-800/50 md:p-8">
        <div className="mb-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="rounded-xl bg-blue-500 p-2 shadow-md sm:p-3">
            <DollarSign className="h-5 w-5 text-white sm:h-6 sm:w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              SMS Pricing Management
            </h1>
            <p className="text-muted-foreground mt-1 text-sm dark:text-gray-400 sm:text-base">
              Configure pricing tiers and purchase price for SMS services. Manage volume-based
              pricing structures and monitor your pricing strategy.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-10 w-full rounded-xl border-2 bg-white shadow-sm transition-all hover:bg-gray-50 hover:shadow-md dark:bg-gray-900 dark:hover:bg-gray-800 sm:w-auto sm:flex-shrink-0"
          >
            {isRefreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span className="sm:inline">Syncing...</span>
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                <span className="sm:inline">Refresh list</span>
              </>
            )}
          </Button>
          <Button
            onClick={() => setIsUpdatePriceDialogOpen(true)}
            variant="outline"
            className="h-10 w-full rounded-xl border-2 bg-white shadow-sm transition-all hover:bg-gray-50 hover:shadow-md dark:bg-gray-900 dark:hover:bg-gray-800 sm:w-auto sm:flex-shrink-0"
          >
            <Settings className="mr-2 h-4 w-4" />
            <span className="sm:inline">Update Price</span>
          </Button>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="h-10 w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:shadow-blue-500/30 sm:w-auto sm:flex-shrink-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="sm:inline">Create tier</span>
          </Button>
          <Button
            onClick={handleOpenConnectorPricingDialog}
            variant="outline"
            className="h-10 w-full rounded-xl border-2 bg-gradient-to-r from-purple-500 to-indigo-500 px-4 font-semibold text-white shadow-md shadow-purple-500/25 transition-all hover:from-purple-600 hover:to-indigo-600 hover:shadow-lg hover:shadow-purple-500/30 dark:from-purple-600 dark:to-indigo-600 dark:hover:from-purple-700 dark:hover:to-indigo-700 sm:w-auto sm:flex-shrink-0 sm:px-6"
          >
            <Network className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Configure Connector Pricing</span>
            <span className="sm:hidden">Connector Pricing</span>
          </Button>
          <Button
            onClick={handleOpenCreditAccountDialog}
            variant="outline"
            className="h-10 w-full rounded-xl border-2 bg-gradient-to-r from-green-500 to-emerald-500 px-4 font-semibold text-white shadow-md shadow-green-500/25 transition-all hover:from-green-600 hover:to-emerald-600 hover:shadow-lg hover:shadow-green-500/30 dark:from-green-600 dark:to-emerald-600 dark:hover:from-green-700 dark:hover:to-emerald-700 sm:w-auto sm:flex-shrink-0 sm:px-6"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            <span className="sm:inline">Credit Account</span>
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/50 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-800 dark:from-gray-900 dark:to-gray-950/50">
          <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/20 sm:h-12 sm:w-12">
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                Total Tiers
              </p>
              <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                {stats.totalTiers}
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs">Pricing tiers defined</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-emerald-50/30 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-800 dark:from-gray-900 dark:to-emerald-950/20">
          <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/20 sm:h-12 sm:w-12">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                Active Tiers
              </p>
              <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                {stats.activeTiers}
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs">Currently enabled</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-orange-50/30 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-800 dark:from-gray-900 dark:to-orange-950/20">
          <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/20 sm:h-12 sm:w-12">
              <Package className="h-5 w-5 text-orange-600 dark:text-orange-400 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                Inactive Tiers
              </p>
              <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                {stats.inactiveTiers}
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs">Awaiting activation</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-blue-50/30 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-800 dark:from-gray-900 dark:to-blue-950/20">
          <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/20 sm:h-12 sm:w-12">
              <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                Avg Sale Price
              </p>
              <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                ${stats.avgSalePrice.toFixed(4)}
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs">Per SMS across tiers</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Active Configuration Card */}
      {isLoadingConfig ? (
        <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
            </div>
          </CardContent>
        </Card>
      ) : config ? (
        <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
          <CardHeader className="p-4 pb-2 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
                  <DollarSign className="h-5 w-5 text-brand-500" />
                  Active Pricing Configuration
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm">
                  Current pricing configuration details and purchase price settings.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsUpdatePriceDialogOpen(true)}
                className="h-10 w-full rounded-xl border-2 bg-white shadow-sm transition-all hover:bg-gray-50 hover:shadow-md dark:bg-gray-900 dark:hover:bg-gray-800 sm:w-auto"
              >
                <Settings className="mr-2 h-4 w-4" />
                Update Price
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
              <div className="space-y-2 rounded-xl border border-blue-200/50 bg-gradient-to-br from-blue-50 to-cyan-50 p-3 dark:border-blue-800/50 dark:from-blue-950/50 dark:to-cyan-950/50 sm:p-4">
                <Label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Config ID
                </Label>
                <div className="text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                  {config.id || "N/A"}
                </div>
              </div>
              <div className="space-y-2 rounded-xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-green-50 p-3 dark:border-emerald-800/50 dark:from-emerald-950/50 dark:to-green-950/50 sm:p-4">
                <Label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Purchase Price
                </Label>
                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 sm:text-lg">
                  ${config.purchase_price?.toFixed(4) || "0.0000"}
                </div>
              </div>
              <div className="flex flex-col justify-between space-y-2 rounded-xl border border-purple-200/50 bg-gradient-to-br from-purple-50 to-indigo-50 p-3 dark:border-purple-800/50 dark:from-purple-950/50 dark:to-indigo-950/50 sm:p-4">
                <Label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Status
                </Label>
                <div>
                  <Badge
                    variant="outline"
                    className={`${
                      config.is_active
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                        : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
                    }`}
                  >
                    {config.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2 rounded-xl border border-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100 p-3 dark:border-gray-700/50 dark:from-gray-800/50 dark:to-gray-900/50 sm:p-4">
                <Label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Created
                </Label>
                <div className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">
                  {config.created
                    ? new Date(config.created).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "N/A"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Connector Pricing Overview */}
      <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="border-b border-gray-200/50 p-4 dark:border-gray-800/50 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white sm:gap-3 sm:text-xl lg:text-2xl">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 sm:h-10 sm:w-10">
                  <Network className="h-4 w-4 text-purple-600 dark:text-purple-400 sm:h-5 sm:w-5" />
                </div>
                Connector Pricing Overview
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2 text-xs sm:text-sm">
                View all connectors and understand how pricing is applied. Client-specific billing
                rates can be configured in the Clients section.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingConnectors ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
              <p className="text-muted-foreground text-sm font-medium">Loading connectors...</p>
            </div>
          ) : (
            (() => {
              const connectorsList =
                connectorsData?.message || connectorsData?.data || connectorsData || [];
              const connectors = Array.isArray(connectorsList) ? connectorsList : [];

              if (connectors.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center gap-4 px-4 py-20 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                      <Network className="text-muted-foreground h-8 w-8" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        No connectors found
                      </p>
                      <p className="text-muted-foreground mt-1 text-sm">
                        Create connectors first to see pricing information
                      </p>
                    </div>
                  </div>
                );
              }

              // Calculate average sale price from active tiers
              const activeTiers = allTiers.filter((tier) => tier.is_active === true);
              const avgSalePrice =
                activeTiers.length > 0
                  ? activeTiers.reduce((sum, tier) => sum + (tier.sale_price || 0), 0) /
                    activeTiers.length
                  : 0;

              // Calculate margin (sale price - purchase price)
              const purchasePrice = config?.purchase_price || 0;
              const margin = avgSalePrice - purchasePrice;
              const marginPercent = purchasePrice > 0 ? (margin / purchasePrice) * 100 : 0;

              return (
                <div className="overflow-x-auto rounded-xl border border-gray-200/50 bg-white shadow-sm dark:border-gray-800/50 dark:bg-gray-900/50">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b-2 border-gray-200 bg-gradient-to-r from-purple-50/80 via-indigo-50/60 to-purple-50/80 dark:border-gray-700 dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-purple-950/40">
                        <TableHead className="min-w-[60px] px-3 py-4 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 sm:min-w-[80px] sm:px-6 sm:py-5">
                          ID
                        </TableHead>
                        <TableHead className="min-w-[140px] px-3 py-4 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 sm:min-w-[180px] sm:px-6 sm:py-5">
                          Connector Name
                        </TableHead>
                        <TableHead className="min-w-[100px] px-3 py-4 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 sm:min-w-[120px] sm:px-6 sm:py-5">
                          Scope
                        </TableHead>
                        <TableHead className="min-w-[100px] px-3 py-4 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 sm:min-w-[140px] sm:px-6 sm:py-5">
                          MCC/MNC
                        </TableHead>
                        <TableHead className="min-w-[120px] px-3 py-4 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 sm:min-w-[140px] sm:px-6 sm:py-5">
                          Purchase Price
                        </TableHead>
                        <TableHead className="min-w-[120px] px-3 py-4 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 sm:min-w-[140px] sm:px-6 sm:py-5">
                          Avg Sale Price
                        </TableHead>
                        <TableHead className="min-w-[120px] px-3 py-4 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 sm:min-w-[140px] sm:px-6 sm:py-5">
                          Margin
                        </TableHead>
                        <TableHead className="min-w-[100px] px-3 py-4 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 sm:min-w-[120px] sm:px-6 sm:py-5">
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {connectors.map((connector: Connector, index: number) => (
                        <TableRow
                          key={connector.id}
                          className={`group border-b border-gray-100/80 transition-all duration-300 ${
                            index % 2 === 0
                              ? "bg-white dark:bg-gray-900"
                              : "bg-gray-50/30 dark:bg-gray-900/50"
                          } hover:bg-gradient-to-r hover:from-purple-50/70 hover:via-indigo-50/50 hover:to-purple-50/70 hover:shadow-sm dark:border-gray-800/50 dark:hover:from-purple-950/30 dark:hover:via-indigo-950/20 dark:hover:to-purple-950/30`}
                        >
                          <TableCell className="px-3 py-4 sm:px-6 sm:py-6">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/10 to-indigo-500/10 shadow-sm sm:h-10 sm:w-10">
                                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 sm:text-sm">
                                  {connector.id}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-3 py-4 sm:px-6 sm:py-6">
                            <div>
                              <p className="text-xs font-bold text-gray-900 dark:text-white sm:text-sm">
                                {connector.name || "N/A"}
                              </p>
                              {connector.queue_prefix && (
                                <p className="text-muted-foreground font-mono mt-1 text-xs">
                                  {connector.queue_prefix}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-3 py-4 sm:px-6 sm:py-6">
                            <Badge
                              variant="outline"
                              className="inline-flex items-center justify-center gap-1.5 rounded-lg border-2 border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 px-2 py-1 text-xs font-semibold text-gray-700 shadow-sm transition-all dark:border-gray-700 dark:from-gray-800 dark:to-gray-900 dark:text-gray-200 sm:px-3 sm:py-1.5"
                            >
                              {connector.scope || "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-3 py-4 sm:px-6 sm:py-6">
                            <div className="rounded-lg bg-blue-50/80 px-2 py-1 dark:bg-blue-950/30 sm:px-3 sm:py-1.5">
                              <div className="text-xs font-semibold text-blue-700 dark:text-blue-400 sm:text-sm">
                                {connector.mcc || "N/A"}/{connector.mnc || "N/A"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-3 py-4 sm:px-6 sm:py-6">
                            <div className="flex items-center gap-2">
                              <div className="rounded-lg bg-emerald-50/80 px-2 py-1 dark:bg-emerald-950/30 sm:px-3 sm:py-1.5">
                                <div className="flex items-baseline gap-1">
                                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 sm:text-sm">
                                    ${purchasePrice.toFixed(4)}
                                  </span>
                                  <span className="text-[10px] font-medium text-emerald-600/70 dark:text-emerald-400/70 sm:text-xs">
                                    /SMS
                                  </span>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-3 py-4 sm:px-6 sm:py-6">
                            <div className="flex items-center gap-2">
                              <div className="rounded-lg bg-blue-50/80 px-2 py-1 dark:bg-blue-950/30 sm:px-3 sm:py-1.5">
                                <div className="flex items-baseline gap-1">
                                  <span className="text-xs font-bold text-blue-700 dark:text-blue-400 sm:text-sm">
                                    ${avgSalePrice.toFixed(4)}
                                  </span>
                                  <span className="text-[10px] font-medium text-blue-600/70 dark:text-blue-400/70 sm:text-xs">
                                    /SMS
                                  </span>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-3 py-4 sm:px-6 sm:py-6">
                            <div className="flex items-center gap-2">
                              <div
                                className={`rounded-lg px-2 py-1 ${
                                  margin >= 0
                                    ? "bg-green-50/80 dark:bg-green-950/30"
                                    : "bg-red-50/80 dark:bg-red-950/30"
                                } sm:px-3 sm:py-1.5`}
                              >
                                <div className="flex items-baseline gap-1">
                                  <span
                                    className={`text-xs font-bold ${
                                      margin >= 0
                                        ? "text-green-700 dark:text-green-400"
                                        : "text-red-700 dark:text-red-400"
                                    } sm:text-sm`}
                                  >
                                    ${margin.toFixed(4)}
                                  </span>
                                  <span
                                    className={`text-[10px] font-medium ${
                                      margin >= 0
                                        ? "text-green-600/70 dark:text-green-400/70"
                                        : "text-red-600/70 dark:text-red-400/70"
                                    } sm:text-xs`}
                                  >
                                    ({marginPercent.toFixed(1)}%)
                                  </span>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-3 py-4 sm:px-6 sm:py-6">
                            <Badge
                              variant="outline"
                              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm ${
                                connector.status === 1
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                  : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
                              }`}
                            >
                              {connector.status === 1 ? (
                                <>
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3.5 w-3.5" />
                                  Inactive
                                </>
                              )}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="border-t border-gray-200/50 bg-gray-50/50 p-4 dark:border-gray-800/50 dark:bg-gray-900/50">
                    <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        💡 How Pricing Works:
                      </p>
                      <ul className="ml-4 list-disc space-y-1">
                        <li>
                          <strong>Purchase Price:</strong> The cost per SMS you pay to the provider
                          (configured above)
                        </li>
                        <li>
                          <strong>Sale Price:</strong> The price charged to clients based on their
                          volume tier
                        </li>
                        <li>
                          <strong>Margin:</strong> The profit per SMS (Sale Price - Purchase Price)
                        </li>
                        <li>
                          <strong>Client Billing Rates:</strong> Can be customized per client and
                          connector in the Clients section
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </CardContent>
      </Card>

      {/* Pricing Tiers Table */}
      <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="border-b border-gray-200/50 p-4 dark:border-gray-800/50 sm:p-6">
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white sm:gap-3 sm:text-xl lg:text-2xl">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 sm:h-10 sm:w-10">
                    <Package className="h-4 w-4 text-blue-600 dark:text-blue-400 sm:h-5 sm:w-5" />
                  </div>
                  Pricing Tiers Management
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-2 text-xs sm:text-sm">
                  Create and manage volume-based pricing tiers. Configure volume ranges and sale
                  prices for different usage levels.
                </CardDescription>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isLoadingTiers || isRefreshing}
                  className="h-11 rounded-xl border-2 bg-white shadow-sm transition-all hover:bg-gray-50 hover:shadow-md dark:bg-gray-900 dark:hover:bg-gray-800"
                >
                  {isLoadingTiers || isRefreshing ? (
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
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="h-11 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:shadow-blue-500/30"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Tier
                </Button>
              </div>
            </div>
            <div className="relative">
              <Search className="text-muted-foreground absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                }}
                placeholder="Search by tier name..."
                className="h-12 rounded-xl border-2 bg-white pl-11 pr-4 text-base dark:bg-gray-900"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingTiers ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
              <p className="text-muted-foreground text-sm font-medium">Loading pricing tiers...</p>
            </div>
          ) : tiers.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 px-4 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <Package className="text-muted-foreground h-8 w-8" />
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {allTiers.length === 0 ? "No pricing tiers found" : "No matching pricing tiers"}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {allTiers.length === 0
                    ? "Create your first pricing tier to get started"
                    : "Try adjusting your search query"}
                </p>
              </div>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-blue-800"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Tier
              </Button>
            </div>
          ) : (
            <div className="overflow-visible rounded-xl border border-gray-200/50 bg-white shadow-sm dark:border-gray-800/50 dark:bg-gray-900/50">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-gray-200 bg-gradient-to-r from-blue-50/80 via-cyan-50/60 to-blue-50/80 dark:border-gray-700 dark:from-blue-950/40 dark:via-cyan-950/30 dark:to-blue-950/40">
                    <TableHead className="min-w-[140px] px-3 py-4 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 sm:min-w-[180px] sm:px-6 sm:py-5">
                      Tier Name
                    </TableHead>
                    <TableHead className="min-w-[160px] px-3 py-4 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 sm:min-w-[200px] sm:px-6 sm:py-5">
                      Volume Range
                    </TableHead>
                    <TableHead className="min-w-[120px] px-3 py-4 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 sm:min-w-[140px] sm:px-6 sm:py-5">
                      Sale Price
                    </TableHead>
                    <TableHead className="min-w-[80px] px-3 py-4 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 sm:min-w-[100px] sm:px-6 sm:py-5">
                      Order
                    </TableHead>
                    <TableHead className="min-w-[100px] px-3 py-4 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 sm:min-w-[120px] sm:px-6 sm:py-5">
                      Status
                    </TableHead>
                    <TableHead className="min-w-[100px] px-3 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 sm:min-w-[120px] sm:px-6 sm:py-5">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tiers.map((tier, index) => (
                    <TableRow
                      key={String(tier.id ?? tier.tier_name ?? "")}
                      className={`group border-b border-gray-100/80 transition-all duration-300 ${
                        index % 2 === 0
                          ? "bg-white dark:bg-gray-900"
                          : "bg-gray-50/30 dark:bg-gray-900/50"
                      } hover:bg-gradient-to-r hover:from-blue-50/70 hover:via-cyan-50/50 hover:to-blue-50/70 hover:shadow-sm dark:border-gray-800/50 dark:hover:from-blue-950/30 dark:hover:via-cyan-950/20 dark:hover:to-blue-950/30`}
                    >
                      <TableCell className="px-3 py-4 sm:px-6 sm:py-6">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 shadow-sm sm:h-10 sm:w-10">
                            <Package className="h-4 w-4 text-blue-600 dark:text-blue-400 sm:h-5 sm:w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-900 dark:text-white sm:text-sm">
                              {String(tier.tier_name ?? "--")}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-4 sm:px-6 sm:py-6">
                        <div className="flex items-center gap-2">
                          <div className="rounded-lg bg-gray-100/80 px-2 py-1 dark:bg-gray-800/50 sm:px-3 sm:py-1.5">
                            <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 sm:text-sm">
                              {(() => {
                                const min = tier.volume_min ?? 0;
                                let max: number | null = null;

                                // Handle volume_max which can be number, null, or object {Int64, Valid}
                                if (tier.volume_max !== undefined && tier.volume_max !== null) {
                                  if (
                                    typeof tier.volume_max === "object" &&
                                    "Int64" in tier.volume_max
                                  ) {
                                    const volMax = tier.volume_max as {
                                      Int64: number;
                                      Valid: boolean;
                                    };
                                    max = volMax.Valid ? volMax.Int64 : null;
                                  } else if (typeof tier.volume_max === "number") {
                                    max = tier.volume_max;
                                  }
                                }

                                return (
                                  <>
                                    {min.toLocaleString()} -{" "}
                                    {max !== null ? max.toLocaleString() : "∞"}
                                  </>
                                );
                              })()}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-4 sm:px-6 sm:py-6">
                        <div className="flex items-center gap-2">
                          <div className="rounded-lg bg-emerald-50/80 px-2 py-1 dark:bg-emerald-950/30 sm:px-3 sm:py-1.5">
                            <div className="flex items-baseline gap-1">
                              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 sm:text-base">
                                ${(tier.sale_price ?? 0).toFixed(4)}
                              </span>
                              <span className="text-[10px] font-medium text-emerald-600/70 dark:text-emerald-400/70 sm:text-xs">
                                /SMS
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-4 sm:px-6 sm:py-6">
                        <Badge
                          variant="outline"
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg border-2 border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm transition-all dark:border-gray-700 dark:from-gray-800 dark:to-gray-900 dark:text-gray-200 sm:px-4 sm:py-2"
                        >
                          {tier.tier_order ?? 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-3 py-4 sm:px-6 sm:py-6">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Switch
                            checked={tier.is_active === true}
                            onCheckedChange={() => tier.id && handleToggleTier(tier.id)}
                            disabled={toggleTierMutation.isPending}
                            className={`${
                              tier.is_active === true
                                ? "data-[state=checked]:bg-emerald-600"
                                : "data-[state=checked]:bg-gray-400"
                            }`}
                          />
                          <span
                            className={`text-xs font-semibold ${
                              tier.is_active === true
                                ? "text-emerald-700 dark:text-emerald-400"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {tier.is_active === true ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-4 sm:px-6 sm:py-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(tier)}
                            disabled={toggleTierMutation.isPending || updateTierMutation.isPending}
                            className="h-9 w-9 rounded-xl border-2 bg-white p-0 shadow-sm transition-all hover:border-blue-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-cyan-50 hover:shadow-md dark:bg-gray-900 dark:hover:border-blue-600 dark:hover:from-blue-950/30 dark:hover:to-cyan-950/20 sm:h-10 sm:w-10"
                          >
                            <Edit className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Update Purchase Price Dialog */}
      <Dialog
        open={isUpdatePriceDialogOpen}
        onOpenChange={(open) => {
          setIsUpdatePriceDialogOpen(open);
          if (!open) {
            setPurchasePrice("");
          }
        }}
      >
        <DialogContent className="rounded-3xl border border-gray-200 dark:border-gray-800 sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Update Purchase Price
            </DialogTitle>
            <DialogDescription>
              Update the purchase price for the active pricing configuration.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdatePurchasePrice}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="purchase-price">Purchase Price *</Label>
                <Input
                  id="purchase-price"
                  type="number"
                  step="0.0001"
                  min="0"
                  placeholder="0.0000"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="mt-2 h-11 rounded-xl border-2"
                  required
                />
                <p className="text-muted-foreground mt-1 text-xs">
                  Current: ${config?.purchase_price?.toFixed(4) || "0.0000"}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsUpdatePriceDialogOpen(false);
                  setPurchasePrice("");
                }}
                className="h-11 rounded-xl border-2 bg-white shadow-sm transition-all hover:bg-gray-50 hover:shadow-md dark:bg-gray-900 dark:hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updatePriceMutation.isPending}
                className="h-11 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-blue-800"
              >
                {updatePriceMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Price"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Tier Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            setFormData({
              tier_name: "",
              volume_min: 0,
              volume_max: null,
              sale_price: 0,
              tier_order: 0,
            });
          }
        }}
      >
        <DialogContent className="rounded-3xl border border-gray-200 dark:border-gray-800 sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              Create Pricing Tier
            </DialogTitle>
            <DialogDescription>Create a new pricing tier based on volume range.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTier}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="tier-name">Tier Name *</Label>
                <Input
                  id="tier-name"
                  placeholder="e.g., Starter, Professional, Enterprise"
                  value={formData.tier_name}
                  onChange={(e) => setFormData({ ...formData, tier_name: e.target.value })}
                  className="mt-2 h-11 rounded-xl border-2"
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="volume-min">Volume Min *</Label>
                  <Input
                    id="volume-min"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.volume_min}
                    onChange={(e) =>
                      setFormData({ ...formData, volume_min: parseInt(e.target.value) || 0 })
                    }
                    className="mt-2 h-11 rounded-xl border-2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="volume-max">Volume Max (Optional)</Label>
                  <Input
                    id="volume-max"
                    type="number"
                    min="0"
                    placeholder="Leave empty for unlimited"
                    value={formData.volume_max || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        volume_max: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    className="mt-2 h-11 rounded-xl border-2"
                  />
                  <p className="text-muted-foreground mt-1 text-xs">Leave empty for unlimited</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="sale-price">Sale Price (per SMS) *</Label>
                  <Input
                    id="sale-price"
                    type="number"
                    step="0.0001"
                    min="0"
                    placeholder="0.0000"
                    value={formData.sale_price}
                    onChange={(e) =>
                      setFormData({ ...formData, sale_price: parseFloat(e.target.value) || 0 })
                    }
                    className="mt-2 h-11 rounded-xl border-2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tier-order">Tier Order</Label>
                  <Input
                    id="tier-order"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.tier_order}
                    onChange={(e) =>
                      setFormData({ ...formData, tier_order: parseInt(e.target.value) || 0 })
                    }
                    className="mt-2 h-11 rounded-xl border-2"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setFormData({
                    tier_name: "",
                    volume_min: 0,
                    volume_max: null,
                    sale_price: 0,
                    tier_order: 0,
                  });
                }}
                className="h-11 rounded-xl border-2 bg-white shadow-sm transition-all hover:bg-gray-50 hover:shadow-md dark:bg-gray-900 dark:hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTierMutation.isPending}
                className="h-11 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-blue-800"
              >
                {createTierMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Tier
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Tier Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setSelectedTier(null);
            setFormData({
              tier_name: "",
              volume_min: 0,
              volume_max: null,
              sale_price: 0,
              tier_order: 0,
            });
          }
        }}
      >
        <DialogContent className="rounded-3xl border border-gray-200 dark:border-gray-800 sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" />
              Edit Pricing Tier
            </DialogTitle>
            <DialogDescription>Update pricing tier details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditTier}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-tier-name">Tier Name</Label>
                <Input
                  id="edit-tier-name"
                  placeholder="e.g., Starter, Professional, Enterprise"
                  value={formData.tier_name}
                  onChange={(e) => setFormData({ ...formData, tier_name: e.target.value })}
                  className="mt-2 h-11 rounded-xl border-2"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="edit-volume-min">Volume Min</Label>
                  <Input
                    id="edit-volume-min"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.volume_min}
                    onChange={(e) =>
                      setFormData({ ...formData, volume_min: parseInt(e.target.value) || 0 })
                    }
                    className="mt-2 h-11 rounded-xl border-2"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-volume-max">Volume Max</Label>
                  <Input
                    id="edit-volume-max"
                    type="number"
                    min="0"
                    placeholder="Leave empty for unlimited"
                    value={formData.volume_max || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        volume_max: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    className="mt-2 h-11 rounded-xl border-2"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="edit-sale-price">Sale Price (per SMS)</Label>
                  <Input
                    id="edit-sale-price"
                    type="number"
                    step="0.0001"
                    min="0"
                    placeholder="0.0000"
                    value={formData.sale_price}
                    onChange={(e) =>
                      setFormData({ ...formData, sale_price: parseFloat(e.target.value) || 0 })
                    }
                    className="mt-2 h-11 rounded-xl border-2"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-tier-order">Tier Order</Label>
                  <Input
                    id="edit-tier-order"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.tier_order}
                    onChange={(e) =>
                      setFormData({ ...formData, tier_order: parseInt(e.target.value) || 0 })
                    }
                    className="mt-2 h-11 rounded-xl border-2"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedTier(null);
                  setFormData({
                    tier_name: "",
                    volume_min: 0,
                    volume_max: null,
                    sale_price: 0,
                    tier_order: 0,
                  });
                }}
                className="h-11 rounded-xl border-2 bg-white shadow-sm transition-all hover:bg-gray-50 hover:shadow-md dark:bg-gray-900 dark:hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateTierMutation.isPending}
                className="h-11 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-blue-800"
              >
                {updateTierMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Tier"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Configure Connector Pricing Dialog */}
      <Dialog open={isConnectorPricingDialogOpen} onOpenChange={setIsConnectorPricingDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto rounded-3xl border-2 border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
          <DialogHeader className="space-y-3 border-b border-gray-200 pb-4 dark:border-gray-800">
            <DialogTitle className="flex items-center gap-3 text-2xl font-semibold text-gray-900 dark:text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/30">
                <Network className="h-5 w-5 text-white" />
              </div>
              Configure Connector Pricing
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 dark:text-gray-400">
              Set billing rates per connector for a specific client. These rates override the global
              pricing tiers.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6">
            {/* Client Selector */}
            <div className="space-y-2">
              <Label
                htmlFor="client-select"
                className="text-sm font-semibold text-gray-900 dark:text-white"
              >
                Select Client *
              </Label>
              <Popover
                open={isConnectorClientPopoverOpen}
                onOpenChange={setIsConnectorClientPopoverOpen}
                modal={false}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    type="button"
                    className="h-11 w-full justify-between rounded-xl border-2 bg-white text-left font-normal transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:bg-gray-900 dark:focus:border-purple-400"
                  >
                    {selectedClientId
                      ? (() => {
                          const responseData = clientsData as Record<string, unknown>;
                          let clientsArray: Array<{
                            id?: number | string;
                            name?: string;
                            email?: string;
                          }> = [];

                          if (Array.isArray((responseData as { data?: unknown[] }).data)) {
                            clientsArray = (
                              responseData as {
                                data: Array<{
                                  id?: number | string;
                                  name?: string;
                                  email?: string;
                                }>;
                              }
                            ).data;
                          } else if (
                            Array.isArray(
                              (responseData as { data?: { data?: unknown[] } }).data?.data
                            )
                          ) {
                            clientsArray = (
                              responseData as {
                                data: {
                                  data: Array<{
                                    id?: number | string;
                                    name?: string;
                                    email?: string;
                                  }>;
                                };
                              }
                            ).data.data;
                          } else if (
                            Array.isArray(
                              (responseData as { data?: { clients?: unknown[] } }).data?.clients
                            )
                          ) {
                            clientsArray = (
                              responseData as {
                                data: {
                                  clients: Array<{
                                    id?: number | string;
                                    name?: string;
                                    email?: string;
                                  }>;
                                };
                              }
                            ).data.clients;
                          } else if (
                            Array.isArray((responseData as { message?: unknown[] }).message)
                          ) {
                            clientsArray = (
                              responseData as {
                                message: Array<{
                                  id?: number | string;
                                  name?: string;
                                  email?: string;
                                }>;
                              }
                            ).message;
                          } else if (
                            Array.isArray(
                              (responseData as { message?: { data?: unknown[] } }).message?.data
                            )
                          ) {
                            clientsArray = (
                              responseData as {
                                message: {
                                  data: Array<{
                                    id?: number | string;
                                    name?: string;
                                    email?: string;
                                  }>;
                                };
                              }
                            ).message.data;
                          } else if (
                            Array.isArray(
                              (responseData as { message?: { clients?: unknown[] } }).message
                                ?.clients
                            )
                          ) {
                            clientsArray = (
                              responseData as {
                                message: {
                                  clients: Array<{
                                    id?: number | string;
                                    name?: string;
                                    email?: string;
                                  }>;
                                };
                              }
                            ).message.clients;
                          }

                          const selectedClient = clientsArray.find(
                            (client: { id?: number | string }) =>
                              String(client.id || "") === selectedClientId
                          );
                          return selectedClient
                            ? selectedClient.name ||
                                selectedClient.email ||
                                `Client #${selectedClient.id}`
                            : "Select client...";
                        })()
                      : "Select client..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="z-[1000000] w-[var(--radix-popover-trigger-width)] max-w-md border border-gray-200 bg-white p-0 shadow-lg dark:border-gray-800 dark:bg-gray-900"
                  align="start"
                  sideOffset={4}
                >
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Search clients..."
                      value={connectorClientSearchQuery}
                      onValueChange={setConnectorClientSearchQuery}
                    />
                    <CommandList>
                      {isLoadingClients ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                          <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                          <p className="mt-2">Loading clients...</p>
                        </div>
                      ) : clientsError ? (
                        <CommandEmpty>
                          Error loading clients:{" "}
                          {clientsError instanceof Error ? clientsError.message : "Unknown error"}
                        </CommandEmpty>
                      ) : !clientsData ? (
                        <CommandEmpty>
                          No clients data available. Please check your API key.
                        </CommandEmpty>
                      ) : (
                        (() => {
                          // Handle multiple data structures like in ClientsTab.tsx
                          const responseData = clientsData as Record<string, unknown>;
                          let clientsArray: Array<{
                            id?: number | string;
                            name?: string;
                            email?: string;
                            account_type?: string;
                            accountType?: string;
                          }> = [];

                          // Format 1: response.data (array direct)
                          if (Array.isArray((responseData as { data?: unknown[] }).data)) {
                            clientsArray = (
                              responseData as {
                                data: Array<{
                                  id?: number | string;
                                  name?: string;
                                  email?: string;
                                  account_type?: string;
                                  accountType?: string;
                                }>;
                              }
                            ).data;
                          }
                          // Format 2: response.data.data
                          else if (
                            Array.isArray(
                              (responseData as { data?: { data?: unknown[] } }).data?.data
                            )
                          ) {
                            clientsArray = (
                              responseData as {
                                data: {
                                  data: Array<{
                                    id?: number | string;
                                    name?: string;
                                    email?: string;
                                    account_type?: string;
                                    accountType?: string;
                                  }>;
                                };
                              }
                            ).data.data;
                          }
                          // Format 3: response.data.clients
                          else if (
                            Array.isArray(
                              (responseData as { data?: { clients?: unknown[] } }).data?.clients
                            )
                          ) {
                            clientsArray = (
                              responseData as {
                                data: {
                                  clients: Array<{
                                    id?: number | string;
                                    name?: string;
                                    email?: string;
                                    account_type?: string;
                                    accountType?: string;
                                  }>;
                                };
                              }
                            ).data.clients;
                          }
                          // Format 4: response.message (array direct)
                          else if (
                            Array.isArray((responseData as { message?: unknown[] }).message)
                          ) {
                            clientsArray = (
                              responseData as {
                                message: Array<{
                                  id?: number | string;
                                  name?: string;
                                  email?: string;
                                  account_type?: string;
                                  accountType?: string;
                                }>;
                              }
                            ).message;
                          }
                          // Format 5: response.message.data
                          else if (
                            Array.isArray(
                              (responseData as { message?: { data?: unknown[] } }).message?.data
                            )
                          ) {
                            clientsArray = (
                              responseData as {
                                message: {
                                  data: Array<{
                                    id?: number | string;
                                    name?: string;
                                    email?: string;
                                    account_type?: string;
                                    accountType?: string;
                                  }>;
                                };
                              }
                            ).message.data;
                          }
                          // Format 6: response.message.clients
                          else if (
                            Array.isArray(
                              (responseData as { message?: { clients?: unknown[] } }).message
                                ?.clients
                            )
                          ) {
                            clientsArray = (
                              responseData as {
                                message: {
                                  clients: Array<{
                                    id?: number | string;
                                    name?: string;
                                    email?: string;
                                    account_type?: string;
                                    accountType?: string;
                                  }>;
                                };
                              }
                            ).message.clients;
                          }

                          // Filter out root clients
                          const filteredClients = clientsArray.filter(
                            (client: { account_type?: string; accountType?: string }) => {
                              const accountType = client.account_type || client.accountType || "";
                              return accountType !== "root";
                            }
                          );

                          // Apply search filter
                          const searchLower = (connectorClientSearchQuery || "")
                            .toLowerCase()
                            .trim();
                          const filtered = searchLower
                            ? filteredClients.filter(
                                (client: {
                                  name?: string;
                                  email?: string;
                                  id?: number | string;
                                }) => {
                                  const name = (client.name || "").toLowerCase();
                                  const email = (client.email || "").toLowerCase();
                                  const id = String(client.id || "").toLowerCase();
                                  const matches =
                                    name.includes(searchLower) ||
                                    email.includes(searchLower) ||
                                    id.includes(searchLower);

                                  return matches;
                                }
                              )
                            : filteredClients;

                          if (filtered.length === 0) {
                            return <CommandEmpty>No clients found</CommandEmpty>;
                          }

                          return (
                            <CommandGroup>
                              {filtered.map(
                                (client: {
                                  id?: number | string;
                                  name?: string;
                                  email?: string;
                                }) => (
                                  <CommandItem
                                    key={client.id}
                                    value={`${client.name || ""} ${client.email || ""} ${client.id || ""}`}
                                    onSelect={() => {
                                      setSelectedClientId(String(client.id || ""));
                                      setConnectorClientSearchQuery("");
                                      setIsConnectorClientPopoverOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedClientId === String(client.id || "")
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {client.name || client.email || `Client #${client.id}`}
                                  </CommandItem>
                                )
                              )}
                            </CommandGroup>
                          );
                        })()
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="text-muted-foreground text-xs">
                Select a client to configure their connector-specific billing rates
              </p>
            </div>

            {/* Connector Rates Configuration */}
            {(() => {
              const connectorsList =
                connectorsData?.message || connectorsData?.data || connectorsData || [];
              const connectors = Array.isArray(connectorsList) ? connectorsList : [];

              if (connectors.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center gap-3 py-8">
                    <Network className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      No connectors available
                    </p>
                    <p className="text-muted-foreground text-xs dark:text-gray-400">
                      Please create connectors first.
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  <div className="rounded-xl border-2 border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                      💡 Pricing Information
                    </p>
                    <ul className="text-muted-foreground ml-4 mt-2 list-disc space-y-1 text-xs">
                      <li>
                        Purchase Price: ${config?.purchase_price?.toFixed(4) || "0.0000"} per SMS
                      </li>
                      <li>
                        Average Sale Price: ${stats.avgSalePrice.toFixed(4)} per SMS (from active
                        tiers)
                      </li>
                      <li>
                        These rates will override the tier-based pricing for the selected client
                      </li>
                    </ul>
                  </div>

                  {connectors.map((connector: Connector) => {
                    const connectorId = connector.id || 0;
                    const connectorName = connector.name || `Connector ${connectorId}`;
                    const currentRate = connectorRates.find(
                      (rate) => rate.connector_id === connectorId
                    );

                    return (
                      <div
                        key={connectorId}
                        className="rounded-xl border-2 border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-semibold text-gray-900 dark:text-white">
                              {connectorName}
                            </Label>
                            <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
                              <Badge variant="outline" className="text-xs">
                                ID: {connectorId}
                              </Badge>
                              {connector.scope && (
                                <Badge variant="outline" className="text-xs">
                                  {connector.scope}
                                </Badge>
                              )}
                              {connector.mcc && connector.mnc && (
                                <span className="text-xs">
                                  {connector.mcc}/{connector.mnc}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="relative">
                          <DollarSign className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 dark:text-gray-500" />
                          <Input
                            type="number"
                            step="0.0001"
                            min="0"
                            placeholder="0.0000"
                            value={currentRate?.billing_rate || ""}
                            onChange={(e) => {
                              const newRates = connectorRates.map((rate) =>
                                rate.connector_id === connectorId
                                  ? { ...rate, billing_rate: e.target.value }
                                  : rate
                              );
                              // If connector doesn't exist in rates, add it
                              if (
                                !connectorRates.find((rate) => rate.connector_id === connectorId)
                              ) {
                                newRates.push({
                                  connector_id: connectorId,
                                  billing_rate: e.target.value,
                                });
                              }
                              setConnectorRates(newRates);
                            }}
                            disabled={!selectedClientId}
                            className="h-11 rounded-xl border-2 pl-10 transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50 dark:focus:border-purple-400"
                          />
                        </div>
                        <p className="text-muted-foreground mt-2 text-xs">
                          Billing rate per SMS for this connector (USD). Leave empty to use
                          tier-based pricing.
                        </p>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          <DialogFooter className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 dark:border-gray-800 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseConnectorPricingDialog}
              disabled={updateBillingRateMutation.isPending}
              className="h-11 w-full rounded-xl border-2 font-medium transition-all hover:bg-gray-50 dark:hover:bg-gray-800 sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpdateConnectorPricing}
              disabled={
                updateBillingRateMutation.isPending ||
                !selectedClientId ||
                connectorRates.length === 0
              }
              className="h-11 w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-8 font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-purple-500/30 disabled:opacity-50 dark:from-purple-500 dark:to-indigo-500 dark:hover:from-purple-600 dark:hover:to-indigo-600 sm:w-auto"
            >
              {updateBillingRateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Billing Rates
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credit Account Dialog */}
      <Dialog open={isCreditAccountDialogOpen} onOpenChange={setIsCreditAccountDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl border-2 border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
          <DialogHeader className="space-y-3 border-b border-gray-200 pb-4 dark:border-gray-800">
            <DialogTitle className="flex items-center gap-3 text-2xl font-semibold text-gray-900 dark:text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-500/30">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              Credit Client Account
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 dark:text-gray-400">
              Add funds to a client&apos;s account. This will increase their available balance
              immediately.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreditAccount} className="space-y-6 py-6">
            <div className="space-y-2">
              <Label
                htmlFor="credit-client-select"
                className="text-sm font-semibold text-gray-900 dark:text-white"
              >
                Select Client *
              </Label>
              <Popover
                open={isCreditClientPopoverOpen}
                onOpenChange={setIsCreditClientPopoverOpen}
                modal={false}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="h-11 w-full justify-between rounded-xl border-2 bg-white text-left font-normal transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:bg-gray-900 dark:focus:border-green-400"
                  >
                    {creditClientId
                      ? (() => {
                          const responseData = clientsData as Record<string, unknown>;
                          let clientsArray: Array<{
                            id?: number | string;
                            name?: string;
                            email?: string;
                          }> = [];

                          if (Array.isArray((responseData as { data?: unknown[] }).data)) {
                            clientsArray = (
                              responseData as {
                                data: Array<{
                                  id?: number | string;
                                  name?: string;
                                  email?: string;
                                }>;
                              }
                            ).data;
                          } else if (
                            Array.isArray(
                              (responseData as { data?: { data?: unknown[] } }).data?.data
                            )
                          ) {
                            clientsArray = (
                              responseData as {
                                data: {
                                  data: Array<{
                                    id?: number | string;
                                    name?: string;
                                    email?: string;
                                  }>;
                                };
                              }
                            ).data.data;
                          } else if (
                            Array.isArray(
                              (responseData as { data?: { clients?: unknown[] } }).data?.clients
                            )
                          ) {
                            clientsArray = (
                              responseData as {
                                data: {
                                  clients: Array<{
                                    id?: number | string;
                                    name?: string;
                                    email?: string;
                                  }>;
                                };
                              }
                            ).data.clients;
                          } else if (
                            Array.isArray((responseData as { message?: unknown[] }).message)
                          ) {
                            clientsArray = (
                              responseData as {
                                message: Array<{
                                  id?: number | string;
                                  name?: string;
                                  email?: string;
                                }>;
                              }
                            ).message;
                          } else if (
                            Array.isArray(
                              (responseData as { message?: { data?: unknown[] } }).message?.data
                            )
                          ) {
                            clientsArray = (
                              responseData as {
                                message: {
                                  data: Array<{
                                    id?: number | string;
                                    name?: string;
                                    email?: string;
                                  }>;
                                };
                              }
                            ).message.data;
                          } else if (
                            Array.isArray(
                              (responseData as { message?: { clients?: unknown[] } }).message
                                ?.clients
                            )
                          ) {
                            clientsArray = (
                              responseData as {
                                message: {
                                  clients: Array<{
                                    id?: number | string;
                                    name?: string;
                                    email?: string;
                                  }>;
                                };
                              }
                            ).message.clients;
                          }

                          const selectedClient = clientsArray.find(
                            (client: { id?: number | string }) =>
                              String(client.id || "") === creditClientId
                          );
                          return selectedClient
                            ? selectedClient.name ||
                                selectedClient.email ||
                                `Client #${selectedClient.id}`
                            : "Select client...";
                        })()
                      : "Select client..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="z-[1000000] w-[var(--radix-popover-trigger-width)] max-w-md border border-gray-200 bg-white p-0 shadow-lg dark:border-gray-800 dark:bg-gray-900"
                  align="start"
                  sideOffset={4}
                >
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Search clients..."
                      value={clientSearchQuery}
                      onValueChange={setClientSearchQuery}
                    />
                    <CommandList>
                      {isLoadingClients ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                          <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                          <p className="mt-2">Loading clients...</p>
                        </div>
                      ) : clientsError ? (
                        <CommandEmpty>
                          Error loading clients:{" "}
                          {clientsError instanceof Error ? clientsError.message : "Unknown error"}
                        </CommandEmpty>
                      ) : !clientsData ? (
                        <CommandEmpty>
                          No clients data available. Please check your API key.
                        </CommandEmpty>
                      ) : (
                        (() => {
                          // Handle multiple data structures like in ClientsTab.tsx
                          const responseData = clientsData as Record<string, unknown>;
                          let clientsArray: Array<{
                            id?: number | string;
                            name?: string;
                            email?: string;
                            account_type?: string;
                            accountType?: string;
                          }> = [];

                          // Debug: Log raw data structure

                          // Format 1: response.data (array direct)
                          if (Array.isArray((responseData as { data?: unknown[] }).data)) {
                            clientsArray = (
                              responseData as {
                                data: Array<{
                                  id?: number | string;
                                  name?: string;
                                  email?: string;
                                  account_type?: string;
                                  accountType?: string;
                                }>;
                              }
                            ).data;
                          }
                          // Format 2: response.data.data
                          else if (
                            Array.isArray(
                              (responseData as { data?: { data?: unknown[] } }).data?.data
                            )
                          ) {
                            clientsArray = (
                              responseData as {
                                data: {
                                  data: Array<{
                                    id?: number | string;
                                    name?: string;
                                    email?: string;
                                    account_type?: string;
                                    accountType?: string;
                                  }>;
                                };
                              }
                            ).data.data;
                          }
                          // Format 3: response.data.clients
                          else if (
                            Array.isArray(
                              (responseData as { data?: { clients?: unknown[] } }).data?.clients
                            )
                          ) {
                            clientsArray = (
                              responseData as {
                                data: {
                                  clients: Array<{
                                    id?: number | string;
                                    name?: string;
                                    email?: string;
                                    account_type?: string;
                                    accountType?: string;
                                  }>;
                                };
                              }
                            ).data.clients;
                          }
                          // Format 4: response.message (array direct)
                          else if (
                            Array.isArray((responseData as { message?: unknown[] }).message)
                          ) {
                            clientsArray = (
                              responseData as {
                                message: Array<{
                                  id?: number | string;
                                  name?: string;
                                  email?: string;
                                  account_type?: string;
                                  accountType?: string;
                                }>;
                              }
                            ).message;
                          }
                          // Format 5: response.message.data
                          else if (
                            Array.isArray(
                              (responseData as { message?: { data?: unknown[] } }).message?.data
                            )
                          ) {
                            clientsArray = (
                              responseData as {
                                message: {
                                  data: Array<{
                                    id?: number | string;
                                    name?: string;
                                    email?: string;
                                    account_type?: string;
                                    accountType?: string;
                                  }>;
                                };
                              }
                            ).message.data;
                          }
                          // Format 6: response.message.clients
                          else if (
                            Array.isArray(
                              (responseData as { message?: { clients?: unknown[] } }).message
                                ?.clients
                            )
                          ) {
                            clientsArray = (
                              responseData as {
                                message: {
                                  clients: Array<{
                                    id?: number | string;
                                    name?: string;
                                    email?: string;
                                    account_type?: string;
                                    accountType?: string;
                                  }>;
                                };
                              }
                            ).message.clients;
                          }

                          // Debug: Log parsed array

                          // Filter out root clients
                          const filteredClients = clientsArray.filter(
                            (client: { account_type?: string; accountType?: string }) => {
                              const accountType = client.account_type || client.accountType || "";
                              return accountType !== "root";
                            }
                          );

                          // Apply search filter
                          const searchLower = (clientSearchQuery || "").toLowerCase().trim();
                          const filtered = searchLower
                            ? filteredClients.filter(
                                (client: {
                                  name?: string;
                                  email?: string;
                                  id?: number | string;
                                }) => {
                                  const name = (client.name || "").toLowerCase();
                                  const email = (client.email || "").toLowerCase();
                                  const id = String(client.id || "").toLowerCase();
                                  const matches =
                                    name.includes(searchLower) ||
                                    email.includes(searchLower) ||
                                    id.includes(searchLower);

                                  return matches;
                                }
                              )
                            : filteredClients;

                          if (filtered.length === 0) {
                            return <CommandEmpty>No clients found</CommandEmpty>;
                          }

                          return (
                            <CommandGroup>
                              {filtered.map(
                                (client: {
                                  id?: number | string;
                                  name?: string;
                                  email?: string;
                                }) => (
                                  <CommandItem
                                    key={client.id}
                                    value={`${client.name || ""} ${client.email || ""} ${client.id || ""}`}
                                    onSelect={() => {
                                      setCreditClientId(String(client.id || ""));
                                      setClientSearchQuery("");
                                      setIsCreditClientPopoverOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        creditClientId === String(client.id || "")
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {client.name || client.email || `Client #${client.id}`}
                                  </CommandItem>
                                )
                              )}
                            </CommandGroup>
                          );
                        })()
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="credit-amount" className="text-gray-900 dark:text-white">
                Amount (USD) *
              </Label>
              <div className="relative">
                <DollarSign className="text-muted-foreground absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 dark:text-gray-500" />
                <Input
                  id="credit-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={creditFormData.amount}
                  onChange={(e) =>
                    setCreditFormData((prev) => ({ ...prev, amount: e.target.value }))
                  }
                  placeholder="100.00"
                  required
                  disabled={creditTopupMutation.isPending}
                  className="h-11 rounded-xl border-2 pl-10 transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:focus:border-green-400"
                />
              </div>
              <p className="text-muted-foreground text-xs">
                Enter the amount to credit to the client&apos;s account
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="credit-description" className="text-gray-900 dark:text-white">
                Description (Optional)
              </Label>
              <Textarea
                id="credit-description"
                value={creditFormData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setCreditFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="e.g., Manual credit by admin, Refund, etc."
                rows={3}
                disabled={creditTopupMutation.isPending}
                className="rounded-xl border-2 transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:focus:border-green-400"
              />
            </div>

            <DialogFooter className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 dark:border-gray-800 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseCreditAccountDialog}
                disabled={creditTopupMutation.isPending}
                className="h-11 w-full rounded-xl border-2 font-medium transition-all hover:bg-gray-50 dark:hover:bg-gray-800 sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  creditTopupMutation.isPending ||
                  !creditClientId ||
                  !creditFormData.amount ||
                  parseFloat(creditFormData.amount) <= 0
                }
                className="h-11 w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-8 font-semibold text-white shadow-lg shadow-green-500/25 transition-all hover:from-green-700 hover:to-emerald-700 hover:shadow-xl hover:shadow-green-500/30 disabled:opacity-50 dark:from-green-500 dark:to-emerald-500 dark:hover:from-green-600 dark:hover:to-emerald-600 sm:w-auto"
              >
                {creditTopupMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Crediting...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Credit Account
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
