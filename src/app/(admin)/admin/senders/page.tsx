"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAlert } from "@/context/AlertProvider";
import { useAdminClientsList } from "@/controller/query/admin/clients/useAdminClients";
import {
  useAddConnectorToSender,
  useAdminSenderDetails,
  useAdminSendersList,
  useApproveAdminSender,
  useAssignSenderToClient,
  useClientsAssignedToSender,
  useDeleteAdminSender,
  useRejectAdminSender,
  useRemoveConnectorFromSender,
  useUpdateAdminSenderStatus,
  useUpdateClientSenderOTP,
} from "@/controller/query/admin/senders/useAdminSenders";
import { useGetAllConnectors } from "@/controller/query/connectors/useConnectors";
import type { AdminSender } from "@/types";
import { format } from "date-fns";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Hash,
  Loader2,
  Plug,
  PlugZap,
  Plus,
  Power,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Trash2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All status" },
  { value: "APPROVED", label: "Approved" },
  { value: "PENDING", label: "Pending" },
  { value: "REJECTED", label: "Rejected" },
  { value: "INACTIVE", label: "Inactive" },
];

export default function AdminSendersPage() {
  const { showAlert } = useAlert();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  // Dialog states
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddConnectorDialogOpen, setIsAddConnectorDialogOpen] = useState(false);
  const [isRemoveConnectorDialogOpen, setIsRemoveConnectorDialogOpen] = useState(false);
  const [selectedSenderId, setSelectedSenderId] = useState<string | number | null>(null);
  const [selectedSenderStatus, setSelectedSenderStatus] = useState<string | number | undefined>(
    undefined
  );
  const [approveNotes, setApproveNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [newStatus, setNewStatus] = useState<string>("");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedConnectorId, setSelectedConnectorId] = useState<string>("");
  const [connectorToRemove, setConnectorToRemove] = useState<string | number | null>(null);

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const {
    data: sendersResponse,
    isLoading,
    isFetching,
    refetch,
  } = useAdminSendersList(
    {
      // Load all senders without pagination (like clients)
      page: 1,
      per_page: 1000,
      // Filtering done on frontend
      search: undefined,
      status: undefined,
    },
    apiKey,
    !!apiKey
  );

  const {
    data: senderDetailsResponse,
    isLoading: isLoadingDetails,
    refetch: refetchDetails,
  } = useAdminSenderDetails(
    selectedSenderId ? { sender_id: selectedSenderId } : null,
    apiKey,
    !!apiKey && !!selectedSenderId && isViewDialogOpen
  );

  // Fetch clients assigned to this sender using the dedicated function
  const { data: assignedClientsData } = useClientsAssignedToSender(
    selectedSenderId,
    apiKey,
    !!apiKey && !!selectedSenderId && isViewDialogOpen
  );

  // Extract assigned clients from the response
  const assignedClients = useMemo(() => {
    if (!assignedClientsData || !Array.isArray(assignedClientsData)) {
      return [];
    }

    // The data should already be an array of clients
    return assignedClientsData as Array<{
      id?: number | string;
      name?: string;
      company_name?: string;
      email?: string;
      client_id?: number | string;
      [key: string]: unknown;
    }>;
  }, [assignedClientsData]);

  const approveMutation = useApproveAdminSender();
  const rejectMutation = useRejectAdminSender();
  const updateStatusMutation = useUpdateAdminSenderStatus();
  const assignMutation = useAssignSenderToClient();
  const deleteMutation = useDeleteAdminSender();
  const addConnectorMutation = useAddConnectorToSender();
  const removeConnectorMutation = useRemoveConnectorFromSender();
  const updateOTPMutation = useUpdateClientSenderOTP();

  // Get all connectors for Add Connector dialog
  const { data: connectorsData } = useGetAllConnectors({ page: 1, limit: 100 }, !!apiKey);
  const connectorsList = useMemo(() => {
    if (!connectorsData) return [];
    const data = connectorsData.message || connectorsData.data || connectorsData;
    return Array.isArray(data) ? data : [];
  }, [connectorsData]);

  // Fetch clients list for assignment dialog
  const { data: clientsResponse, isLoading: isLoadingClients } = useAdminClientsList(
    {
      page: 1,
      per_page: 1000, // Get all clients for the dropdown
    },
    apiKey,
    !!apiKey && isAssignDialogOpen
  );

  // Extract assigned client IDs from sender details (if available in response)
  // This is used in the assign dialog to mark already assigned clients
  const assignedClientIds = useMemo(() => {
    if (!senderDetailsResponse || !selectedSenderId) return new Set<string | number>();

    // Check if sender details contain assigned clients
    const details = senderDetailsResponse.data || senderDetailsResponse.message;
    if (!details) return new Set<string | number>();

    // Look for clients array or client_senders array in the response
    const assignedClients =
      (details as Record<string, unknown>).clients ||
      (details as Record<string, unknown>).client_senders ||
      (details as Record<string, unknown>).assigned_clients;

    if (Array.isArray(assignedClients)) {
      const clientIds = assignedClients
        .map(
          (client: { id?: number | string; client_id?: number | string }) =>
            client.id || client.client_id
        )
        .filter(Boolean);

      return new Set(clientIds);
    }

    return new Set<string | number>();
  }, [senderDetailsResponse, selectedSenderId]);

  const clientsList = useMemo(() => {
    if (!clientsResponse) {
      return [];
    }
    // Extract clients from various possible response structures
    const payload: unknown =
      clientsResponse.clients ||
      (clientsResponse as { data?: { clients?: unknown[]; data?: unknown[] } }).data?.clients ||
      (clientsResponse as { data?: { data?: unknown[] } }).data?.data ||
      (clientsResponse as { message?: { clients?: unknown[]; data?: unknown[] } }).message
        ?.clients ||
      (clientsResponse as { message?: { data?: unknown[] } }).message?.data ||
      (clientsResponse as { message?: unknown }).message;

    if (Array.isArray(payload)) {
      return payload;
    }
    if (payload && typeof payload === "object" && "data" in payload) {
      const payloadWithData = payload as { data?: unknown[] };
      if (Array.isArray(payloadWithData.data)) {
        return payloadWithData.data;
      }
    }
    return [];
  }, [clientsResponse]);

  const normalizeStatus = (status: string | number | undefined): string => {
    if (typeof status === "number") {
      switch (status) {
        case 1:
          return "APPROVED";
        case 0:
          return "PENDING";
        case 2:
          return "REJECTED";
        default:
          return "INACTIVE";
      }
    }
    const normalized = (status || "").toString().toUpperCase();
    if (["APPROVED", "ACTIVE", "ENABLED"].includes(normalized)) return "APPROVED";
    if (["PENDING", "IN_REVIEW", "PROCESSING"].includes(normalized)) return "PENDING";
    if (["REJECTED", "DECLINED"].includes(normalized)) return "REJECTED";
    return normalized || "INACTIVE";
  };

  const sendersData = useMemo(() => {
    if (!sendersResponse) {
      return [] as AdminSender[];
    }
    const responseData = sendersResponse as Record<string, unknown>;

    // Extract senders from various response formats
    let sendersArray: AdminSender[] = [];

    if (Array.isArray((responseData as { data?: unknown[] }).data)) {
      sendersArray = (responseData as { data: AdminSender[] }).data;
    } else if (Array.isArray((responseData as { message?: { data?: unknown[] } }).message?.data)) {
      sendersArray = (responseData as { message: { data: AdminSender[] } }).message.data;
    } else if (Array.isArray((responseData as { senders?: unknown[] }).senders)) {
      sendersArray = (responseData as { senders: AdminSender[] }).senders;
    } else if (Array.isArray((responseData as { message?: unknown[] }).message)) {
      sendersArray = (responseData as { message: AdminSender[] }).message;
    }

    // Normalize sender data to match AdminSender interface
    const normalizedSenders: AdminSender[] = sendersArray.map((sender: AdminSender) => {
      // Extract connector name from connectors array
      const connectorName =
        sender.connector_name ||
        (Array.isArray(sender.connectors) && sender.connectors.length > 0
          ? sender.connectors
              .map((c: { id?: number; name?: string }) => c.name || "")
              .filter(Boolean)
              .join(", ")
          : "");

      // Log the full sender object to check for assigned clients

      return {
        id: sender.id,
        code: sender.code,
        sender_id: sender.code, // Use code as sender_id
        connector_id: sender.connector_id,
        connector_name: connectorName,
        connector: connectorName,
        connectors: sender.connectors || [],
        created: sender.created,
        created_at: sender.created,
        status: sender.status,
        package_id: sender.package_id,
        // Preserve any additional fields that might contain client assignments
        ...(sender as Record<string, unknown>),
        // Note: client_name and description are not in the API response
        // These would need to come from a different endpoint
      } as AdminSender;
    });

    // Apply filters on frontend
    return normalizedSenders.filter((sender: AdminSender) => {
      // Search filter
      if (search && search.trim()) {
        const searchLower = search.toLowerCase().trim();
        const code = (sender.code || sender.sender_id || "").toLowerCase();
        const connector = (sender.connector_name || sender.connector || "").toLowerCase();

        if (!code.includes(searchLower) && !connector.includes(searchLower)) {
          return false;
        }
      }

      // Status filter
      if (statusFilter && statusFilter !== "ALL") {
        const senderStatus = normalizeStatus(sender.status);
        if (senderStatus !== statusFilter) {
          return false;
        }
      }

      return true;
    });
  }, [sendersResponse, search, statusFilter, apiKey]);

  // Frontend pagination
  const paginatedSenders = useMemo(() => {
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    return sendersData.slice(startIndex, endIndex);
  }, [sendersData, page, perPage]);

  const totalPages = Math.ceil(sendersData.length / perPage);

  const handleRefresh = async () => {
    try {
      await refetch();
      showAlert({
        variant: "success",
        title: "Senders list updated",
        message: "Latest sender IDs retrieved successfully.",
      });
    } catch (error) {
      showAlert({
        variant: "error",
        title: "Refresh failed",
        message: error instanceof Error ? error.message : "Unable to refresh senders list.",
      });
    }
  };

  const handleApprove = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!apiKey || !selectedSenderId) return;

    try {
      await approveMutation.mutateAsync({
        data: {
          sender_id: selectedSenderId,
          notes: approveNotes.trim() || undefined,
        },
        apiKey,
      });
      setIsApproveDialogOpen(false);
      setSelectedSenderId(null);
      setApproveNotes("");
      await refetch();
    } catch {
      // Error handled in mutation
    }
  };

  const handleReject = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!apiKey || !selectedSenderId) return;
    if (!rejectReason.trim()) {
      showAlert({
        variant: "error",
        title: "Reason required",
        message: "Please provide a rejection reason.",
      });
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        data: {
          sender_id: selectedSenderId,
          reason: rejectReason.trim(),
        },
        apiKey,
      });
      setIsRejectDialogOpen(false);
      setSelectedSenderId(null);
      setRejectReason("");
      await refetch();
    } catch {
      // Error handled in mutation
    }
  };

  const handleUpdateStatus = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!apiKey || !selectedSenderId || !newStatus) return;

    try {
      // Convert status string to number if needed
      let statusValue: string | number = newStatus;
      if (newStatus === "APPROVED" || newStatus === "ACTIVE") {
        statusValue = 1;
      } else if (newStatus === "PENDING") {
        statusValue = 0;
      } else if (newStatus === "REJECTED") {
        statusValue = 2;
      } else if (newStatus === "INACTIVE") {
        statusValue = 3;
      }

      await updateStatusMutation.mutateAsync({
        data: {
          sender_id: selectedSenderId,
          status: statusValue,
        },
        apiKey,
      });
      setIsStatusDialogOpen(false);
      setSelectedSenderId(null);
      setSelectedSenderStatus(undefined);
      setNewStatus("");
      await refetch();
    } catch {
      // Error handled in mutation
    }
  };

  const handleAssignSender = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!apiKey || !selectedSenderId || !selectedClientId) return;

    try {
      await assignMutation.mutateAsync({
        data: {
          sender_id: selectedSenderId,
          client_id: selectedClientId,
          otp: 0, // Default OTP status
        },
        apiKey,
      });
      setIsAssignDialogOpen(false);
      setSelectedSenderId(null);
      setSelectedClientId("");
      await refetch();
    } catch {
      // Error handled in mutation
    }
  };

  const handleDeleteSender = async () => {
    if (!apiKey || !selectedSenderId) return;

    try {
      await deleteMutation.mutateAsync({
        data: {
          sender_id: selectedSenderId,
        },
        apiKey,
      });
      setIsDeleteDialogOpen(false);
      setSelectedSenderId(null);
      await refetch();
    } catch {
      // Error handled in mutation
    }
  };

  const handleAddConnector = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!apiKey || !selectedSenderId || !selectedConnectorId) return;

    try {
      await addConnectorMutation.mutateAsync({
        data: {
          sender_id: selectedSenderId,
          connector_id: selectedConnectorId,
        },
        apiKey,
      });
      setIsAddConnectorDialogOpen(false);
      setSelectedConnectorId("");
      await refetch();
      await refetchDetails();
    } catch {
      // Error handled in mutation
    }
  };

  const handleRemoveConnector = async () => {
    if (!apiKey || !selectedSenderId || !connectorToRemove) return;

    try {
      await removeConnectorMutation.mutateAsync({
        data: {
          sender_id: selectedSenderId,
          connector_id: connectorToRemove,
        },
        apiKey,
      });
      setIsRemoveConnectorDialogOpen(false);
      setConnectorToRemove(null);
      await refetch();
      await refetchDetails();
    } catch {
      // Error handled in mutation
    }
  };

  const handleToggleOTP = async (clientSenderId: string | number, currentOTP: number) => {
    if (!apiKey) return;

    try {
      await updateOTPMutation.mutateAsync({
        data: {
          id: clientSenderId,
          otp: currentOTP === 1 ? 0 : 1, // Toggle OTP
        },
        apiKey,
      });
      await refetch();
      await refetchDetails();
    } catch {
      // Error handled in mutation
    }
  };

  const stats = useMemo<{
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    inactive: number;
  }>(() => {
    // Calculate stats from all senders data (not from API stats)
    return sendersData.reduce(
      (
        acc: {
          total: number;
          approved: number;
          pending: number;
          rejected: number;
          inactive: number;
        },
        sender: AdminSender
      ) => {
        const status = normalizeStatus(sender.status);
        acc.total += 1;
        if (status === "APPROVED") acc.approved += 1;
        if (status === "PENDING") acc.pending += 1;
        if (status === "REJECTED") acc.rejected += 1;
        if (status === "INACTIVE") acc.inactive += 1;
        return acc;
      },
      {
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        inactive: 0,
      }
    );
  }, [sendersData]);

  const getStatusBadge = (status: string | number | undefined) => {
    const normalized = normalizeStatus(status);
    switch (normalized) {
      case "APPROVED":
        return (
          <Badge variant="default" className="gap-1 bg-emerald-500 text-white">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            {normalized}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="rounded-xl border border-brand-200/50 bg-gradient-to-r from-brand-500/10 via-blue-light-500/10 to-brand-500/10 p-6 shadow-sm dark:border-brand-800/50 md:p-8">
        <div className="mb-3 flex items-center gap-4">
          <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 p-3 shadow-md">
            <Hash className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white md:text-3xl">
              Sender IDs Configuration
            </h1>
            <p className="text-muted-foreground mt-2 dark:text-gray-400">
              Manage and approve sender ID requests from all clients
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <Hash className="h-9 w-9 rounded-xl bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide dark:text-gray-400">
                Total senders
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-muted-foreground text-xs dark:text-gray-400">All statuses</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 className="h-9 w-9 rounded-xl bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-300" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide dark:text-gray-400">
                Approved
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.approved}
              </p>
              <p className="text-muted-foreground text-xs dark:text-gray-400">Active senders</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-9 w-9 rounded-xl bg-amber-500/10 p-2 text-amber-600 dark:text-amber-300" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide dark:text-gray-400">
                Pending
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.pending}</p>
              <p className="text-muted-foreground text-xs dark:text-gray-400">Awaiting review</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <XCircle className="h-9 w-9 rounded-xl bg-red-500/10 p-2 text-red-600 dark:text-red-300" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide dark:text-gray-400">
                Rejected
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.rejected}
              </p>
              <p className="text-muted-foreground text-xs dark:text-gray-400">Declined requests</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <ShieldCheck className="h-9 w-9 rounded-xl bg-purple-500/10 p-2 text-purple-600 dark:text-purple-300" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide dark:text-gray-400">
                Inactive
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.inactive}
              </p>
              <p className="text-muted-foreground text-xs dark:text-gray-400">Disabled</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Filters and Search */}
      <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="p-4 pb-4 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
                <Hash className="h-5 w-5 text-blue-500" />
                Sender IDs Directory
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm dark:text-gray-400">
                Search and filter sender IDs by status, client or description
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/admin/senders/create">
                <Button
                  variant="default"
                  className="h-10 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Sender
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading || isFetching}
                className="h-10 rounded-xl border-2"
              >
                {isLoading || isFetching ? (
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
            </div>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="relative">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 dark:text-gray-500" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by sender ID, client name or description..."
                className="h-11 rounded-xl border-2 pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-11 rounded-xl border-2">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6">
          {!apiKey ? (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
              <ShieldCheck className="text-muted-foreground h-10 w-10 dark:text-gray-500" />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                API Key Required
              </p>
              <p className="text-muted-foreground text-sm dark:text-gray-400">
                Please sign in again to access sender management.
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500 dark:text-blue-400" />
              <p className="text-muted-foreground text-sm dark:text-gray-400">Loading senders...</p>
            </div>
          ) : sendersData.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
              <Hash className="text-muted-foreground h-10 w-10 dark:text-gray-500" />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {sendersResponse ? "No senders match the current filters." : "No senders found."}
              </p>
              <p className="text-muted-foreground text-sm dark:text-gray-400">
                {sendersResponse
                  ? "Adjust the filters to see more results."
                  : "Try refreshing the page or check your API connection."}
              </p>
              {!sendersResponse && (
                <Button variant="outline" onClick={() => refetch()} className="mt-4">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Modern Grid Layout */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {paginatedSenders.map((sender: AdminSender) => {
                  const status = normalizeStatus(sender.status);
                  const senderId = sender.id || sender.sender_id;
                  const senderCode = sender.code || sender.sender_id || "Unknown";
                  // Extract connector name from connectors array if connector_name is empty
                  const connector =
                    sender.connector_name ||
                    (Array.isArray(sender.connectors) && sender.connectors.length > 0
                      ? sender.connectors
                          .map((c: { id?: number; name?: string }) => c.name || "")
                          .filter(Boolean)
                          .join(", ")
                      : "—");
                  const createdAt: string | undefined =
                    typeof (sender.created || sender.created_at) === "string"
                      ? ((sender.created || sender.created_at) as string)
                      : undefined;

                  return (
                    <Card
                      key={String(senderId || sender.code || "")}
                      className="rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-blue-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-700"
                    >
                      <CardHeader className="p-4 pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <div
                              className={`rounded-xl p-2.5 ${
                                status === "APPROVED"
                                  ? "bg-emerald-500/10"
                                  : status === "PENDING"
                                    ? "bg-amber-500/10"
                                    : status === "REJECTED"
                                      ? "bg-red-500/10"
                                      : "bg-gray-500/10"
                              }`}
                            >
                              <Hash
                                className={`h-5 w-5 ${
                                  status === "APPROVED"
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : status === "PENDING"
                                      ? "text-amber-600 dark:text-amber-400"
                                      : status === "REJECTED"
                                        ? "text-red-600 dark:text-red-400"
                                        : "text-gray-600 dark:text-gray-400"
                                }`}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="truncate text-base font-semibold text-gray-900 dark:text-white">
                                {senderCode}
                              </h3>
                              <p className="text-muted-foreground truncate text-xs dark:text-gray-400">
                                {connector}
                              </p>
                            </div>
                          </div>
                          <div className="ml-2">{getStatusBadge(sender.status)}</div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="space-y-2 text-sm">
                          <div className="text-muted-foreground flex items-center gap-2 dark:text-gray-400">
                            <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate text-xs">{connector}</span>
                          </div>
                          {sender.package_id !== undefined && (
                            <div className="text-muted-foreground flex items-center gap-2 dark:text-gray-400">
                              <span className="text-xs">Package ID: {sender.package_id}</span>
                            </div>
                          )}
                          {createdAt && (
                            <div className="text-muted-foreground flex items-center gap-2 dark:text-gray-400">
                              <Calendar className="h-4 w-4 flex-shrink-0" />
                              <span className="text-xs">
                                {format(new Date(createdAt), "MMM dd, yyyy")}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardContent className="border-t border-gray-200 p-4 pt-3 dark:border-gray-800">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              if (senderId !== undefined && senderId !== null) {
                                setSelectedSenderId(senderId);
                                setIsViewDialogOpen(true);
                                await refetchDetails();
                              }
                            }}
                            className="h-8 rounded-lg"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {status === "PENDING" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedSenderId((sender.id || sender.sender_id) ?? null);
                                  setIsApproveDialogOpen(true);
                                }}
                                className="h-8 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950"
                                title="Approve sender ID"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedSenderId((sender.id || sender.sender_id) ?? null);
                                  setIsRejectDialogOpen(true);
                                }}
                                className="h-8 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                                title="Reject sender ID"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {(status === "APPROVED" ||
                            status === "INACTIVE" ||
                            status === "REJECTED") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedSenderId((sender.id || sender.sender_id) ?? null);
                                setSelectedSenderStatus(sender.status);
                                setIsStatusDialogOpen(true);
                              }}
                              className="h-8 rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950"
                              title="Update sender status"
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSenderId((sender.id || sender.sender_id) ?? null);
                              setIsAssignDialogOpen(true);
                            }}
                            className="h-8 rounded-lg text-purple-600 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950"
                            title="Assign sender to client"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSenderId((sender.id || sender.sender_id) ?? null);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="h-8 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                            title="Delete sender ID"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex flex-col gap-4 border-t border-gray-200 pt-6 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-muted-foreground text-sm dark:text-gray-400">
                    Showing {(page - 1) * perPage + 1} to{" "}
                    {Math.min(page * perPage, sendersData.length)} of {sendersData.length} senders
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={page <= 1 || isLoading}
                      className="rounded-xl border-2"
                    >
                      Previous
                    </Button>
                    <span className="px-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={page >= totalPages || isLoading}
                      className="rounded-xl border-2"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Approve Sender ID
            </DialogTitle>
            <DialogDescription>
              Approve this sender ID request. You can add optional notes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="approve-notes">Notes (Optional)</Label>
              <Textarea
                id="approve-notes"
                placeholder="Add approval notes..."
                value={approveNotes}
                onChange={(e) => setApproveNotes(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsApproveDialogOpen(false);
                setApproveNotes("");
                setSelectedSenderId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Reject Sender ID
            </DialogTitle>
            <DialogDescription>
              Reject this sender ID request. Please provide a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="reject-reason">Rejection Reason *</Label>
              <Textarea
                id="reject-reason"
                placeholder="Enter the reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mt-2"
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectDialogOpen(false);
                setRejectReason("");
                setSelectedSenderId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              className="bg-red-600 text-white shadow-md shadow-red-500/15 hover:bg-red-700"
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-brand-500" />
              Sender ID Details
            </DialogTitle>
            <DialogDescription>View detailed information about this sender ID.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {isLoadingDetails ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
              </div>
            ) : (
              (() => {
                // Find sender from the list instead of using senderDetails (which may not have all data)
                const sender = sendersData.find((s) => (s.id || s.sender_id) === selectedSenderId);
                if (!sender) {
                  return <p className="text-muted-foreground">No details available.</p>;
                }

                // Extract connector names from connectors array
                const connectorNames =
                  Array.isArray(sender.connectors) && sender.connectors.length > 0
                    ? sender.connectors
                        .map((c: { id?: number; name?: string }) => c.name || "")
                        .filter(Boolean)
                        .join(", ")
                    : sender.connector_name || sender.connector || "—";

                return (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-muted-foreground text-sm font-medium">Sender ID</Label>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {sender.code || sender.sender_id || "—"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm font-medium">
                        Connector(s)
                      </Label>
                      <p className="text-base text-gray-900 dark:text-white">{connectorNames}</p>
                    </div>
                    {sender.connector_id !== undefined && sender.connector_id !== 0 && (
                      <div>
                        <Label className="text-muted-foreground text-sm font-medium">
                          Connector ID
                        </Label>
                        <p className="text-base text-gray-900 dark:text-white">
                          {sender.connector_id}
                        </p>
                      </div>
                    )}
                    {sender.package_id !== undefined && (
                      <div>
                        <Label className="text-muted-foreground text-sm font-medium">
                          Package ID
                        </Label>
                        <p className="text-base text-gray-900 dark:text-white">
                          {sender.package_id}
                        </p>
                      </div>
                    )}
                    <div>
                      <Label className="text-muted-foreground text-sm font-medium">Status</Label>
                      <div className="mt-1">{getStatusBadge(sender.status)}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm font-medium">Created</Label>
                      <p className="text-base text-gray-900 dark:text-white">
                        {sender.created || sender.created_at
                          ? format(
                              new Date(sender.created || sender.created_at || ""),
                              "MMM dd, yyyy HH:mm"
                            )
                          : "—"}
                      </p>
                    </div>
                    {Array.isArray(sender.connectors) && sender.connectors.length > 0 && (
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <Label className="text-muted-foreground text-sm font-medium">
                            Connectors
                          </Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSenderId((sender.id || sender.sender_id) ?? null);
                              setIsAddConnectorDialogOpen(true);
                            }}
                            className="h-7 text-xs"
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            Add Connector
                          </Button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {sender.connectors.map(
                            (connector: { id?: number; name?: string }, index: number) => (
                              <div key={index} className="flex items-center gap-1">
                                <Badge variant="outline" className="text-xs">
                                  {connector.name || "Unknown"} (ID: {connector.id || "N/A"})
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedSenderId((sender.id || sender.sender_id) ?? null);
                                    setConnectorToRemove(connector.id || null);
                                    setIsRemoveConnectorDialogOpen(true);
                                  }}
                                  className="h-5 w-5 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                                  title="Remove connector"
                                >
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                    {(!Array.isArray(sender.connectors) || sender.connectors.length === 0) && (
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <Label className="text-muted-foreground text-sm font-medium">
                            Connectors
                          </Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSenderId((sender.id || sender.sender_id) ?? null);
                              setIsAddConnectorDialogOpen(true);
                            }}
                            className="h-7 text-xs"
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            Add Connector
                          </Button>
                        </div>
                        <p className="text-muted-foreground text-sm">No connectors assigned</p>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
                      <Label className="text-muted-foreground text-sm font-medium">
                        Assigned Clients
                      </Label>
                      {assignedClients.length === 0 ? (
                        <p className="text-muted-foreground mt-2 text-sm">
                          No clients assigned to this sender ID.
                        </p>
                      ) : (
                        <div className="mt-2 space-y-2">
                          {assignedClients.map(
                            (client: {
                              id?: number | string;
                              name?: string;
                              company_name?: string;
                              email?: string;
                            }) => {
                              const clientId = client.id;
                              const clientName =
                                client.name ||
                                client.company_name ||
                                client.email ||
                                `Client ${clientId}`;
                              return (
                                <div
                                  key={String(clientId)}
                                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900"
                                >
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                      {clientName}
                                    </p>
                                    {client.email && (
                                      <p className="text-muted-foreground text-xs">
                                        {client.email}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        // Find the client_sender relation ID - this might be in the assignedClients data
                                        const clientSenderRelation = assignedClients.find(
                                          (c: {
                                            id?: number | string;
                                            client_id?: number | string;
                                            client?: { id?: number | string };
                                            otp?: number;
                                            otp_status?: number;
                                          }) =>
                                            (c.id || c.client_id) === clientId ||
                                            (c.client?.id || c.client_id) === clientId
                                        );
                                        const relationId: string | number =
                                          (clientSenderRelation?.id as
                                            | string
                                            | number
                                            | undefined) ||
                                          ((
                                            clientSenderRelation as {
                                              client_sender_id?: number | string;
                                            }
                                          )?.client_sender_id as string | number | undefined) ||
                                          (clientId as string | number) ||
                                          0;
                                        const currentOTP: number =
                                          (typeof clientSenderRelation?.otp === "number"
                                            ? clientSenderRelation.otp
                                            : undefined) ||
                                          (typeof clientSenderRelation?.otp_status === "number"
                                            ? clientSenderRelation.otp_status
                                            : undefined) ||
                                          0;
                                        if (relationId && relationId !== 0) {
                                          handleToggleOTP(relationId, currentOTP);
                                        }
                                      }}
                                      className="h-7 text-xs"
                                      title="Toggle OTP status"
                                    >
                                      {(() => {
                                        const clientSenderRelation = assignedClients.find(
                                          (c: {
                                            id?: number | string;
                                            client_id?: number | string;
                                            client?: { id?: number | string };
                                            otp?: number;
                                            otp_status?: number;
                                          }) =>
                                            (c.id || c.client_id) === clientId ||
                                            (c.client?.id || c.client_id) === clientId
                                        );
                                        const currentOTP =
                                          clientSenderRelation?.otp ||
                                          clientSenderRelation?.otp_status ||
                                          0;
                                        return currentOTP === 1 ? (
                                          <>
                                            <ToggleRight className="mr-1 h-3 w-3 text-green-600" />
                                            OTP On
                                          </>
                                        ) : (
                                          <>
                                            <ToggleLeft className="mr-1 h-3 w-3 text-gray-400" />
                                            OTP Off
                                          </>
                                        );
                                      })()}
                                    </Button>
                                    <Badge variant="outline" className="text-xs">
                                      Assigned
                                    </Badge>
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {/* Status update disabled - endpoint returns 404 */}
            {/* {(() => {
              const sender = sendersData.find((s) => (s.id || s.sender_id) === selectedSenderId);
              if (!sender) return null;
              const senderStatus = normalizeStatus(sender.status);
              if (senderStatus === "PENDING") return null;
              return (
                <Button
                  variant="default"
                  onClick={() => {
                    showAlert({
                      variant: "info",
                      title: "Feature Not Available",
                      message: "The status update endpoint is not yet implemented in the backend.",
                    });
                  }}
                  className="bg-blue-600 text-white hover:bg-blue-700 opacity-50 cursor-not-allowed"
                  disabled
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Change Status (Not Available)
                </Button>
              );
            })()} */}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Update Sender Status
            </DialogTitle>
            <DialogDescription>
              Change the status of this sender ID. Select the new status from the dropdown.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateStatus}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="status-select">New Status *</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger id="status-select" className="mt-2">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APPROVED">Approved (Active)</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    {/* Note: PENDING and INACTIVE are disabled because the status update endpoint returns 404 */}
                    {/* <SelectItem value="PENDING">Pending</SelectItem> */}
                    {/* <SelectItem value="INACTIVE">Inactive</SelectItem> */}
                  </SelectContent>
                </Select>
                {selectedSenderStatus !== undefined && (
                  <p className="text-muted-foreground mt-2 text-xs">
                    Current status: {getStatusBadge(selectedSenderStatus)}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsStatusDialogOpen(false);
                  setSelectedSenderId(null);
                  setSelectedSenderStatus(undefined);
                  setNewStatus("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!newStatus || updateStatusMutation.isPending}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {updateStatusMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Power className="mr-2 h-4 w-4" />
                    Update Status
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Sender to Client Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-purple-600" />
              Assign Sender to Client
            </DialogTitle>
            <DialogDescription>
              Assign this sender ID to a client. The client will be able to use this sender ID after
              approval.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignSender}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="client-select">Select Client *</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger
                    id="client-select"
                    className="mt-2"
                    disabled={isLoadingClients || assignMutation.isPending}
                  >
                    <SelectValue
                      placeholder={isLoadingClients ? "Loading clients..." : "Select a client"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingClients ? (
                      <SelectItem value="loading" disabled>
                        Loading clients...
                      </SelectItem>
                    ) : clientsList.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No clients available
                      </SelectItem>
                    ) : (
                      clientsList.map(
                        (client: {
                          id?: number | string;
                          name?: string;
                          company_name?: string;
                          email?: string;
                          full_name?: string;
                        }) => {
                          const clientId = String(client.id || "");
                          const clientName =
                            client.name ||
                            client.company_name ||
                            client.full_name ||
                            client.email ||
                            `Client ${clientId}`;

                          const isAssigned =
                            assignedClientIds.has(clientId) ||
                            assignedClientIds.has(Number(clientId));

                          return (
                            <SelectItem
                              key={clientId}
                              value={clientId}
                              disabled={isAssigned}
                              className={isAssigned ? "opacity-50" : ""}
                            >
                              {clientName} {client.email ? `(${client.email})` : ""}
                              {isAssigned && " (Already assigned)"}
                            </SelectItem>
                          );
                        }
                      )
                    )}
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground mt-2 text-xs">
                  Select the client who should have access to this sender ID.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAssignDialogOpen(false);
                  setSelectedSenderId(null);
                  setSelectedClientId("");
                }}
                disabled={assignMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!selectedClientId || assignMutation.isPending}
                className="bg-purple-600 text-white hover:bg-purple-700"
              >
                {assignMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Assign to Client
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Sender Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete Sender ID
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this sender ID? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground text-sm">
              This will permanently delete the sender ID and all associated data.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedSenderId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteSender}
              disabled={deleteMutation.isPending}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Sender
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Connector Dialog */}
      <Dialog open={isAddConnectorDialogOpen} onOpenChange={setIsAddConnectorDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plug className="h-5 w-5 text-blue-600" />
              Add Connector to Sender
            </DialogTitle>
            <DialogDescription>Select a connector to add to this sender ID.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddConnector}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="connector-select">Select Connector *</Label>
                <Select value={selectedConnectorId} onValueChange={setSelectedConnectorId}>
                  <SelectTrigger
                    id="connector-select"
                    className="mt-2"
                    disabled={addConnectorMutation.isPending}
                  >
                    <SelectValue placeholder="Select a connector" />
                  </SelectTrigger>
                  <SelectContent>
                    {connectorsList.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No connectors available
                      </SelectItem>
                    ) : (
                      connectorsList.map((connector: { id?: number | string; name?: string }) => {
                        const connectorId = String(connector.id || "");
                        const connectorName = connector.name || `Connector ${connectorId}`;
                        return (
                          <SelectItem key={connectorId} value={connectorId}>
                            {connectorName}
                          </SelectItem>
                        );
                      })
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddConnectorDialogOpen(false);
                  setSelectedConnectorId("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!selectedConnectorId || addConnectorMutation.isPending}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {addConnectorMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plug className="mr-2 h-4 w-4" />
                    Add Connector
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Remove Connector Dialog */}
      <Dialog open={isRemoveConnectorDialogOpen} onOpenChange={setIsRemoveConnectorDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlugZap className="h-5 w-5 text-orange-600" />
              Remove Connector from Sender
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this connector from the sender ID?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground text-sm">
              This will remove the connector from the sender ID. The connector can be added back
              later if needed.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRemoveConnectorDialogOpen(false);
                setConnectorToRemove(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRemoveConnector}
              disabled={removeConnectorMutation.isPending}
              className="bg-orange-600 text-white hover:bg-orange-700"
            >
              {removeConnectorMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <PlugZap className="mr-2 h-4 w-4" />
                  Remove Connector
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
