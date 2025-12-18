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
  useAdminKYBClientsByStatus,
  useAdminKYBDetails,
  useApproveAdminKYB,
  useRejectAdminKYB,
} from "@/controller/query/admin/kyb/useAdminKYB";
import { AdminKYBRecord } from "@/types";
import { format } from "date-fns";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "LEGACY", label: "Legacy" },
];

export default function KYBPage() {
  const { showAlert } = useAlert();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"PENDING" | "APPROVED" | "REJECTED" | "LEGACY">(
    "PENDING"
  );
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  // Dialog states
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | number | null>(null);
  const [approveNotes, setApproveNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const {
    data: kybResponse,
    isLoading,
    isFetching,
    refetch,
  } = useAdminKYBClientsByStatus(
    {
      page,
      per_page: perPage,
      // Note: Backend doesn't support text search for KYB (uses payload.Search for kyb_status)
      // Search filtering is done on frontend instead
      search: undefined,
      kyb_status: statusFilter,
    },
    apiKey,
    !!apiKey
  );

  const {
    data: kybDetailsResponse,
    isLoading: isLoadingDetails,
    refetch: refetchDetails,
  } = useAdminKYBDetails(
    selectedClientId ? { client_id: selectedClientId } : null,
    apiKey,
    !!apiKey && !!selectedClientId
  );

  const approveMutation = useApproveAdminKYB();
  const rejectMutation = useRejectAdminKYB();

  const kybRequests = useMemo(() => {
    if (!kybResponse) return [] as AdminKYBRecord[];
    const data = kybResponse.data || [];
    const records = Array.isArray(data) ? data : [];

    // Filter by search term on frontend since backend doesn't support text search for KYB
    // (backend uses payload.Search for kyb_status, not for text search)
    if (!search || search.trim().length === 0) {
      return records;
    }

    const searchLower = search.toLowerCase().trim();
    return records.filter((record) => {
      const name = (record.name || record.client_name || "").toLowerCase();
      const email = (record.email || "").toLowerCase();
      const msisdn = record.msisdn ? String(record.msisdn) : "";
      const clientId = record.client_id ? String(record.client_id) : "";

      return (
        name.includes(searchLower) ||
        email.includes(searchLower) ||
        msisdn.includes(searchLower) ||
        clientId.includes(searchLower)
      );
    });
  }, [kybResponse, search]);

  const pagination = useMemo(() => {
    if (!kybResponse) return null;
    if (kybResponse.total !== undefined) {
      return {
        total: kybResponse.total,
        per_page: kybResponse.per_page,
        current_page: kybResponse.current_page,
        last_page: kybResponse.last_page,
        from: kybResponse.from,
        to: kybResponse.to,
        total_pages: kybResponse.last_page,
      };
    }
    return null;
  }, [kybResponse]);

  const kybDetails = useMemo<AdminKYBRecord | null>(() => {
    if (!kybDetailsResponse) return null;
    return (
      (kybDetailsResponse.message as AdminKYBRecord | undefined) ||
      (kybDetailsResponse.data as AdminKYBRecord | undefined) ||
      null
    );
  }, [kybDetailsResponse]);

  // Fetch stats for all statuses in parallel (with per_page: 1 to get only total count)
  const { data: pendingStats, refetch: refetchPendingStats } = useAdminKYBClientsByStatus(
    { page: 1, per_page: 1, kyb_status: "PENDING" },
    apiKey,
    !!apiKey
  );
  const { data: approvedStats, refetch: refetchApprovedStats } = useAdminKYBClientsByStatus(
    { page: 1, per_page: 1, kyb_status: "APPROVED" },
    apiKey,
    !!apiKey
  );
  const { data: rejectedStats, refetch: refetchRejectedStats } = useAdminKYBClientsByStatus(
    { page: 1, per_page: 1, kyb_status: "REJECTED" },
    apiKey,
    !!apiKey
  );
  const { data: legacyStats, refetch: refetchLegacyStats } = useAdminKYBClientsByStatus(
    { page: 1, per_page: 1, kyb_status: "LEGACY" },
    apiKey,
    !!apiKey
  );

  // Statistics - use real counts from API
  const stats = useMemo(() => {
    const pending = pendingStats?.total || 0;
    const approved = approvedStats?.total || 0;
    const rejected = rejectedStats?.total || 0;
    const legacy = legacyStats?.total || 0;
    const total = pending + approved + rejected + legacy;

    return {
      total,
      pending,
      approved,
      rejected,
      legacy,
    };
  }, [pendingStats, approvedStats, rejectedStats, legacyStats]);

  const isRefreshing = isFetching && !isLoading;

  const formatDate = (value?: string) => {
    if (!value) return "N/A";
    try {
      return format(new Date(value), "dd MMM yyyy, HH:mm");
    } catch {
      return value;
    }
  };

  const getStatusBadge = (status?: string) => {
    const statusUpper = (status || "").toUpperCase();
    switch (statusUpper) {
      case "PENDING":
        return (
          <Badge variant="secondary" className="text-xs">
            <Clock className="mr-1 h-3 w-3" /> Pending
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge variant="default" className="bg-emerald-500 text-xs text-white">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="destructive" className="text-xs">
            <XCircle className="mr-1 h-3 w-3" /> Rejected
          </Badge>
        );
      case "LEGACY":
        return (
          <Badge
            variant="outline"
            className="border-purple-500 text-xs text-purple-600 dark:text-purple-400"
          >
            <Clock className="mr-1 h-3 w-3" /> Legacy
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs capitalize">
            {status || "--"}
          </Badge>
        );
    }
  };

  const handleRefresh = async () => {
    try {
      // Refresh all stats and current list
      await Promise.all([
        refetch(),
        refetchPendingStats(),
        refetchApprovedStats(),
        refetchRejectedStats(),
        refetchLegacyStats(),
      ]);
      showAlert({
        variant: "success",
        title: "KYB list updated",
        message: "Latest KYB submissions retrieved successfully.",
      });
    } catch (error) {
      showAlert({
        variant: "error",
        title: "Refresh failed",
        message: error instanceof Error ? error.message : "Unable to refresh KYB list.",
      });
    }
  };

  const handleOpenApproveDialog = async (clientId: string | number) => {
    setSelectedClientId(clientId);
    setApproveNotes("");
    setIsApproveDialogOpen(true);
    await refetchDetails();
  };

  const handleOpenRejectDialog = async (clientId: string | number) => {
    setSelectedClientId(clientId);
    setRejectReason("");
    setIsRejectDialogOpen(true);
    await refetchDetails();
  };

  const handleApprove = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!apiKey || !selectedClientId) return;

    try {
      await approveMutation.mutateAsync({
        data: {
          client_id: selectedClientId,
          notes: approveNotes.trim() || undefined,
        },
        apiKey,
      });
      setIsApproveDialogOpen(false);
      setSelectedClientId(null);
      setApproveNotes("");
      // Refresh all stats and current list
      await Promise.all([
        refetch(),
        refetchPendingStats(),
        refetchApprovedStats(),
        refetchRejectedStats(),
        refetchLegacyStats(),
      ]);
    } catch {
      // Error handled in mutation
    }
  };

  const handleReject = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!apiKey || !selectedClientId) return;
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
          client_id: selectedClientId,
          notes: rejectReason.trim(),
        },
        apiKey,
      });
      setIsRejectDialogOpen(false);
      setSelectedClientId(null);
      setRejectReason("");
      // Refresh all stats and current list
      await Promise.all([
        refetch(),
        refetchPendingStats(),
        refetchApprovedStats(),
        refetchRejectedStats(),
        refetchLegacyStats(),
      ]);
    } catch {
      // Error handled in mutation
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="rounded-xl border border-purple-200/50 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 p-6 shadow-sm dark:border-purple-800/50 md:p-8">
        <div className="mb-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="rounded-xl bg-purple-500 p-2 shadow-md sm:p-3">
            <ShieldCheck className="h-5 w-5 text-white sm:h-6 sm:w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              KYB Management
            </h1>
            <p className="text-muted-foreground mt-1 text-sm dark:text-gray-400 sm:text-base">
              Review and manage Know Your Business verification requests
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <ShieldCheck className="h-8 w-8 rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Total
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {isLoading || isRefreshing ? "--" : stats.total.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-8 w-8 rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Pending
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {isLoading || isRefreshing ? "--" : stats.pending.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 className="h-8 w-8 rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Approved
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {isLoading || isRefreshing ? "--" : stats.approved.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <XCircle className="h-8 w-8 rounded-lg bg-red-500/10 p-2 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Rejected
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {isLoading || isRefreshing ? "--" : stats.rejected.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* KYB Table */}
      <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
                  <ShieldAlert className="h-5 w-5 text-blue-500" />
                  KYB Requests
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-1 text-sm">
                  Review and manage all KYB verification requests
                </CardDescription>
              </div>
            </div>
            <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full min-w-full flex-1 sm:min-w-[400px] sm:max-w-[500px]">
                <Search className="text-muted-foreground absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Search by client name, ID or email"
                  value={search}
                  onChange={(event) => {
                    setPage(1);
                    setSearch(event.target.value);
                  }}
                  className="h-10 w-full rounded-xl border-2 bg-white pl-10 pr-4 dark:bg-gray-900"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setPage(1);
                  setStatusFilter(value as "PENDING" | "APPROVED" | "REJECTED" | "LEGACY");
                }}
              >
                <SelectTrigger className="h-10 w-full rounded-xl border-2 sm:w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="text-muted-foreground h-4 w-4" />
                    <SelectValue placeholder="Filter by status">
                      {STATUS_OPTIONS.find((opt) => opt.value === statusFilter)?.label ||
                        "Select status"}
                    </SelectValue>
                  </div>
                </SelectTrigger>
                <SelectContent className="!z-[9999999]">
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading || isRefreshing}
                className="h-10 w-full rounded-xl border-2 sm:w-auto"
              >
                {isLoading || isRefreshing ? (
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
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6">
          {isLoading || isRefreshing ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 className="mb-4 h-8 w-8 animate-spin text-blue-500" />
              <p className="text-muted-foreground text-sm">Loading KYB requests...</p>
            </div>
          ) : (
            <>
              {kybRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
                  <ShieldAlert className="text-muted-foreground h-10 w-10" />
                  <p className="text-muted-foreground text-sm">
                    No KYB requests match your filters.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm dark:border-gray-800">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-gray-200 bg-gradient-to-r from-gray-50/80 to-gray-100/50 dark:border-gray-700 dark:from-gray-900/40 dark:to-gray-800/40">
                          <TableHead className="min-w-[180px] py-4 font-semibold text-gray-900 dark:text-gray-100">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-blue-500" />
                              Client Name
                            </div>
                          </TableHead>
                          <TableHead className="min-w-[120px] py-4 font-semibold text-gray-900 dark:text-gray-100">
                            Client ID
                          </TableHead>
                          <TableHead className="min-w-[200px] py-4 font-semibold text-gray-900 dark:text-gray-100">
                            <div className="flex items-center gap-2">
                              <Search className="h-4 w-4 text-purple-500" />
                              Email
                            </div>
                          </TableHead>
                          <TableHead className="min-w-[140px] py-4 font-semibold text-gray-900 dark:text-gray-100">
                            Phone
                          </TableHead>
                          <TableHead className="min-w-[160px] py-4 font-semibold text-gray-900 dark:text-gray-100">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-amber-500" />
                              Created
                            </div>
                          </TableHead>
                          <TableHead className="min-w-[130px] py-4 font-semibold text-gray-900 dark:text-gray-100">
                            Status
                          </TableHead>
                          <TableHead className="min-w-[200px] py-4 text-right font-semibold text-gray-900 dark:text-gray-100">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {kybRequests.map((request) => (
                          <TableRow
                            key={request.client_id || request.id}
                            className="group border-b border-gray-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/30 dark:border-gray-800/50 dark:hover:from-blue-950/20 dark:hover:to-cyan-950/10"
                          >
                            <TableCell className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 transition-transform duration-200 group-hover:scale-110 dark:from-blue-500/20 dark:to-cyan-500/20">
                                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {request.name || request.client_name || "--"}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <p className="text-muted-foreground text-sm dark:text-gray-300">
                                #{request.client_id || request.id || "--"}
                              </p>
                            </TableCell>
                            <TableCell className="py-4">
                              <p className="max-w-[200px] truncate text-sm text-gray-900 dark:text-gray-100">
                                {request.email || "--"}
                              </p>
                            </TableCell>
                            <TableCell className="py-4">
                              <p className="text-muted-foreground text-sm dark:text-gray-400">
                                {request.msisdn ? String(request.msisdn) : "--"}
                              </p>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                <span className="whitespace-nowrap">
                                  {formatDate(request.created)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              {getStatusBadge(request.kyb_status || request.status)}
                            </TableCell>
                            <TableCell className="py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {(request.kyb_status || request.status)?.toUpperCase() ===
                                  "PENDING" && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleOpenApproveDialog(request.client_id || request.id!)
                                      }
                                      className="h-8 rounded-lg text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-300"
                                    >
                                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Approve
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleOpenRejectDialog(request.client_id || request.id!)
                                      }
                                      className="h-8 rounded-lg text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                                    >
                                      <XCircle className="mr-1.5 h-3.5 w-3.5" /> Reject
                                    </Button>
                                  </>
                                )}
                                {(request.kyb_status || request.status)?.toUpperCase() !==
                                  "PENDING" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedClientId(request.client_id || request.id!);
                                      setIsApproveDialogOpen(true);
                                    }}
                                    className="h-8 rounded-lg text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/30 dark:hover:text-blue-300"
                                  >
                                    <Eye className="mr-1.5 h-3.5 w-3.5" /> View
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {pagination && (pagination.total_pages || 0) > 1 && (
                <div className="mt-4 flex flex-col items-center justify-between gap-4 border-t border-gray-200 px-4 py-5 dark:border-gray-800 sm:flex-row">
                  <p className="text-muted-foreground text-sm">
                    Showing{" "}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {pagination.from || (page - 1) * perPage + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {pagination.to ||
                        Math.min(page * perPage, pagination.total || kybRequests.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {pagination.total || kybRequests.length}
                    </span>{" "}
                    requests
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={page <= 1 || isLoading || isRefreshing}
                      className="h-9 rounded-xl border-2"
                    >
                      Previous
                    </Button>
                    <span className="px-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                      Page {page} of {pagination.total_pages || pagination.last_page || 1}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((prev) =>
                          Math.min(
                            prev + 1,
                            pagination.total_pages || pagination.last_page || prev + 1
                          )
                        )
                      }
                      disabled={
                        page >= (pagination.total_pages || pagination.last_page || 1) ||
                        isLoading ||
                        isRefreshing
                      }
                      className="h-9 rounded-xl border-2"
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
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-semibold text-gray-900 dark:text-white">
              <ShieldCheck className="h-6 w-6 text-emerald-500" />
              Approve KYB Request
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Review the client information and provide approval notes.
            </DialogDescription>
          </DialogHeader>

          {isLoadingDetails ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-muted-foreground text-sm">Loading client details...</p>
            </div>
          ) : kybDetails ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/40">
                  <p className="text-muted-foreground text-xs font-semibold uppercase">
                    Client Name
                  </p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {kybDetails.name || kybDetails.client_name || "--"}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/40">
                  <p className="text-muted-foreground text-xs font-semibold uppercase">Client ID</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    #{kybDetails.client_id || kybDetails.id || "--"}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/40">
                  <p className="text-muted-foreground text-xs font-semibold uppercase">Email</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {kybDetails.email || "--"}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/40">
                  <p className="text-muted-foreground text-xs font-semibold uppercase">Created</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {formatDate(kybDetails.created)}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
                <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
                  Validate that business identity documents reflect the latest legal name and
                  registration numbers before you approve.
                </p>
              </div>

              <form onSubmit={handleApprove} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="approve-notes">Approval Notes (optional)</Label>
                  <Textarea
                    id="approve-notes"
                    value={approveNotes}
                    onChange={(event) => setApproveNotes(event.target.value)}
                    rows={4}
                    placeholder="Document your checklist, verification tools, or outstanding follow-ups."
                    className="rounded-xl border-2"
                  />
                  <p className="text-muted-foreground text-xs">
                    Notes are shared with the rest of the compliance team but not with the client.
                  </p>
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsApproveDialogOpen(false);
                      setSelectedClientId(null);
                      setApproveNotes("");
                    }}
                    disabled={approveMutation.isPending}
                    className="rounded-xl border-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={approveMutation.isPending || !apiKey}
                    className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    {approveMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Approve KYB
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <ShieldAlert className="text-muted-foreground h-10 w-10" />
              <p className="text-muted-foreground text-sm">No client details found.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-semibold text-gray-900 dark:text-white">
              <XCircle className="h-6 w-6 text-red-500" />
              Reject KYB Request
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Provide a clear explanation of missing requirements to help the client resolve KYB
              blockers quickly.
            </DialogDescription>
          </DialogHeader>

          {isLoadingDetails ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-muted-foreground text-sm">Loading client details...</p>
            </div>
          ) : kybDetails ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/40">
                  <p className="text-muted-foreground text-xs font-semibold uppercase">
                    Client Name
                  </p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {kybDetails.name || kybDetails.client_name || "--"}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/40">
                  <p className="text-muted-foreground text-xs font-semibold uppercase">Client ID</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    #{kybDetails.client_id || kybDetails.id || "--"}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/40">
                  <p className="text-muted-foreground text-xs font-semibold uppercase">Email</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {kybDetails.email || "--"}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/40">
                  <p className="text-muted-foreground text-xs font-semibold uppercase">Created</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {formatDate(kybDetails.created)}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
                <p className="text-sm font-medium text-red-900 dark:text-red-200">
                  Double-check missing documents or discrepancies before rejecting. Communicate
                  clearly what is required to proceed.
                </p>
              </div>

              <form onSubmit={handleReject} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reject-reason">Reason for Rejection *</Label>
                  <Textarea
                    id="reject-reason"
                    value={rejectReason}
                    onChange={(event) => setRejectReason(event.target.value)}
                    rows={4}
                    placeholder="Explain what is missing, expired, or inconsistent."
                    className="rounded-xl border-2"
                    required
                  />
                  <p className="text-muted-foreground text-xs">
                    This message is sent to the client. Be precise about the documents or steps
                    required.
                  </p>
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsRejectDialogOpen(false);
                      setSelectedClientId(null);
                      setRejectReason("");
                    }}
                    disabled={rejectMutation.isPending}
                    className="rounded-xl border-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={rejectMutation.isPending || !apiKey || !rejectReason.trim()}
                    className="rounded-xl bg-red-600 text-white shadow-md shadow-red-500/15 hover:bg-red-700"
                  >
                    {rejectMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject KYB
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <ShieldAlert className="text-muted-foreground h-10 w-10" />
              <p className="text-muted-foreground text-sm">No client details found.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
