"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAlert } from "@/context/AlertProvider";
import { useAdminKYBHistory } from "@/controller/query/admin/kyb/useAdminKYB";
import { AdminKYBRecord } from "@/types";
import { format } from "date-fns";
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  History,
  Loader2,
  RefreshCw,
  Search,
  Users,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All status" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "LEGACY", label: "Legacy" },
];

export default function HistoryTab() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

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
  } = useAdminKYBHistory(
    {
      page,
      per_page: perPage,
      search: search || undefined,
      kyb_status:
        statusFilter !== "ALL" ? (statusFilter as "APPROVED" | "REJECTED" | "LEGACY") : "APPROVED", // Par défaut APPROVED si "ALL" (le backend ne permet qu'un seul statut)
    },
    apiKey,
    !!apiKey
  );

  const historyRecords = useMemo(() => {
    if (!kybResponse) return [] as AdminKYBRecord[];
    // Backend returns pagination directly with data array (RespondRaw)
    // Structure: { total, per_page, current_page, last_page, from, to, data: [...] }
    const responseData = kybResponse as any; // Type assertion to handle various response formats
    const data =
      responseData.data || // Direct pagination format
      responseData.records ||
      responseData.message?.data ||
      responseData.message?.records ||
      (typeof responseData.data === "object" &&
      responseData.data !== null &&
      "data" in responseData.data
        ? (responseData.data as any).data
        : undefined) ||
      (typeof responseData.data === "object" &&
      responseData.data !== null &&
      "records" in responseData.data
        ? (responseData.data as any).records
        : undefined) ||
      [];
    return Array.isArray(data) ? data : [];
  }, [kybResponse]);

  const pagination = useMemo(() => {
    if (!kybResponse) return null;
    // Backend returns pagination directly (not wrapped)
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
    // Wrapped format (backward compatibility)
    const responseData = kybResponse as any;
    return (
      responseData.pagination ||
      responseData.message?.pagination ||
      (typeof responseData.data === "object" &&
      responseData.data !== null &&
      "pagination" in responseData.data
        ? (responseData.data as any).pagination
        : undefined) ||
      null
    );
  }, [kybResponse]);

  const totalReviews = pagination?.total || historyRecords.length;
  const approvedReviews = historyRecords.filter(
    (item) => (item.kyb_status || item.status)?.toUpperCase() === "APPROVED"
  ).length;
  const rejectedReviews = historyRecords.filter(
    (item) => (item.kyb_status || item.status)?.toUpperCase() === "REJECTED"
  ).length;
  const legacyReviews = historyRecords.filter(
    (item) => (item.kyb_status || item.status)?.toUpperCase() === "LEGACY"
  ).length;

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
      case "PENDING":
        return (
          <Badge variant="secondary" className="text-xs">
            <Clock className="mr-1 h-3 w-3" /> Pending
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
      await refetch();
      showAlert({
        variant: "success",
        title: "History updated",
        message: "Latest KYB review history fetched successfully.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to refresh KYB history.";
      showAlert({
        variant: "error",
        title: "Refresh failed",
        message: errorMessage,
      });
    }
  };

  const handleOpenDetails = (requestId: string | number | undefined) => {
    if (!requestId) return;
    router.push(`/admin/kyb/approve?id=${requestId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            KYB Review History
          </h2>
          <p className="text-muted-foreground mt-1 text-sm dark:text-gray-400">
            Audit past KYB decisions and track reviewer actions
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
          className="rounded-xl border-2"
        >
          {isLoading || isRefreshing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </>
          )}
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <History className="h-8 w-8 rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Total
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {isLoading || isRefreshing ? "--" : totalReviews.toLocaleString()}
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
                {isLoading || isRefreshing ? "--" : approvedReviews.toLocaleString()}
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
                {isLoading || isRefreshing ? "--" : rejectedReviews.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-8 w-8 rounded-lg bg-purple-500/10 p-2 text-purple-600 dark:text-purple-400" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Legacy
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {isLoading || isRefreshing ? "--" : legacyReviews.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                <History className="h-5 w-5 text-blue-500" />
                Completed reviews log
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-1 text-sm">
                Every KYB verdict and decision timeline
              </CardDescription>
            </div>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <div className="relative max-w-sm flex-1">
                <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Search by client or KYB id"
                  value={search}
                  onChange={(event) => {
                    setPage(1);
                    setSearch(event.target.value);
                  }}
                  className="h-10 rounded-xl border-2 bg-white pl-10 dark:bg-gray-900"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(event) => {
                  setPage(1);
                  setStatusFilter(event.target.value);
                }}
                aria-label="Filter by status"
                className="h-10 rounded-xl border-2 bg-white px-3 text-sm text-gray-900 dark:bg-gray-900 dark:text-white"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6">
          {isLoading || isRefreshing ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 className="mb-4 h-8 w-8 animate-spin text-blue-500" />
              <p className="text-muted-foreground text-sm">Loading KYB history...</p>
            </div>
          ) : (
            <>
              {historyRecords.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
                  <History className="text-muted-foreground h-10 w-10" />
                  <p className="text-muted-foreground text-sm">
                    No KYB history matches the selected filters.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm dark:border-gray-800">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-gray-200 bg-gradient-to-r from-gray-50/80 to-gray-100/50 dark:border-gray-700 dark:from-gray-900/40 dark:to-gray-800/40">
                          <TableHead className="min-w-[120px] py-4 font-semibold text-gray-900 dark:text-gray-100">
                            Client ID
                          </TableHead>
                          <TableHead className="min-w-[180px] py-4 font-semibold text-gray-900 dark:text-gray-100">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-blue-500" />
                              Client Name
                            </div>
                          </TableHead>
                          <TableHead className="min-w-[130px] py-4 font-semibold text-gray-900 dark:text-gray-100">
                            Status
                          </TableHead>
                          <TableHead className="min-w-[150px] py-4 font-semibold text-gray-900 dark:text-gray-100">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-purple-500" />
                              Approved By
                            </div>
                          </TableHead>
                          <TableHead className="min-w-[180px] py-4 font-semibold text-gray-900 dark:text-gray-100">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-amber-500" />
                              Approved At
                            </div>
                          </TableHead>
                          <TableHead className="min-w-[120px] py-4 text-right font-semibold text-gray-900 dark:text-gray-100">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historyRecords.map((record) => (
                          <TableRow
                            key={record.client_id || record.id}
                            className="group border-b border-gray-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/30 dark:border-gray-800/50 dark:hover:from-blue-950/20 dark:hover:to-cyan-950/10"
                          >
                            <TableCell className="py-4">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                #{record.client_id || record.id || "--"}
                              </p>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 transition-transform duration-200 group-hover:scale-110 dark:from-blue-500/20 dark:to-cyan-500/20">
                                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {record.name || record.client_name || "--"}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              {getStatusBadge(record.kyb_status || record.status)}
                            </TableCell>
                            <TableCell className="py-4">
                              <p className="text-muted-foreground text-sm dark:text-gray-400">
                                {record.approved_by_name || record.reviewer || "--"}
                              </p>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                <span className="whitespace-nowrap">
                                  {formatDate(
                                    record.approved_at || record.created || record.updated_at
                                  )}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenDetails(record.client_id || record.id)}
                                className="h-8 rounded-lg text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/30 dark:hover:text-blue-300"
                              >
                                <ArrowUpRight className="mr-1.5 h-3.5 w-3.5" /> View
                              </Button>
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
                        Math.min(page * perPage, pagination.total || historyRecords.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {pagination.total || historyRecords.length}
                    </span>{" "}
                    records
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
    </div>
  );
}
