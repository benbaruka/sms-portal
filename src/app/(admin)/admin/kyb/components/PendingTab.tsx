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
import { useAdminKYBPendings } from "@/controller/query/admin/kyb/useAdminKYB";
import { AdminKYBRecord } from "@/types";
import { format } from "date-fns";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All status" },
  { value: "pending", label: "Pending" },
  { value: "in-review", label: "In review" },
];

export default function PendingTab() {
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
  } = useAdminKYBPendings(
    {
      page,
      per_page: perPage,
      search: search || undefined,
      status: statusFilter !== "ALL" ? statusFilter : undefined,
    },
    apiKey,
    !!apiKey
  );

  const kybRequests = useMemo(() => {
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
    const responseData = kybResponse as any;
    // Backend returns pagination directly (not wrapped)
    if (responseData.total !== undefined) {
      return {
        total: responseData.total,
        per_page: responseData.per_page,
        current_page: responseData.current_page,
        last_page: responseData.last_page,
        from: responseData.from,
        to: responseData.to,
        total_pages: responseData.last_page,
      };
    }
    // Wrapped format (backward compatibility)
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

  const totalPending = kybRequests.length;
  const totalDocuments = kybRequests.reduce((acc, item) => acc + (item.documents_count || 0), 0);
  const submittedToday = kybRequests.filter((item) => {
    const dateStr = item.created || item.submitted_at;
    if (!dateStr) return false;
    try {
      const submitted = new Date(dateStr);
      const today = new Date();
      return (
        submitted.getDate() === today.getDate() &&
        submitted.getMonth() === today.getMonth() &&
        submitted.getFullYear() === today.getFullYear()
      );
    } catch {
      return false;
    }
  }).length;

  const averageDocuments = totalPending ? (totalDocuments / totalPending).toFixed(1) : "0";

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
    switch (status?.toLowerCase()) {
      case "pending":
      case "submitted":
        return (
          <Badge variant="secondary" className="text-xs">
            <Clock className="mr-1 h-3 w-3" /> Pending
          </Badge>
        );
      case "in-review":
      case "review":
        return (
          <Badge
            variant="outline"
            className="border-amber-500 text-xs text-amber-600 dark:border-amber-400 dark:text-amber-400"
          >
            <ShieldAlert className="mr-1 h-3 w-3" /> In review
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs capitalize">
            {status || "Pending"}
          </Badge>
        );
    }
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      showAlert({
        variant: "success",
        title: "Pending KYB updated",
        message: "Latest KYB submissions retrieved successfully.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to refresh KYB list.";
      showAlert({
        variant: "error",
        title: "Refresh failed",
        message: errorMessage,
      });
    }
  };

  const handleReview = (requestId: string | number | undefined, action: "approve" | "reject") => {
    if (!requestId) return;
    router.push(`/admin/kyb/${action}?id=${requestId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Pending KYB Reviews
          </h2>
          <p className="text-muted-foreground mt-1 text-sm dark:text-gray-400">
            Monitor new KYB submissions and review requests
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
            <ShieldCheck className="h-8 w-8 rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Open reviews
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {isLoading || isRefreshing ? "--" : totalPending.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <TrendingUp className="h-8 w-8 rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Documents
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {isLoading || isRefreshing ? "--" : totalDocuments.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-8 w-8 rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Today
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {isLoading || isRefreshing ? "--" : submittedToday.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <Eye className="h-8 w-8 rounded-lg bg-sky-500/10 p-2 text-sky-600 dark:text-sky-400" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Avg. docs
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {isLoading || isRefreshing ? "--" : averageDocuments}
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
                <ShieldAlert className="h-5 w-5 text-blue-500" />
                Pending KYB queue
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-1 text-sm">
                Review new submissions and take action
              </CardDescription>
            </div>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <div className="relative max-w-sm flex-1">
                <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Search by client or ID"
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
              <p className="text-muted-foreground text-sm">Loading pending KYB submissions...</p>
            </div>
          ) : (
            <>
              {kybRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
                  <ShieldAlert className="text-muted-foreground h-10 w-10" />
                  <p className="text-muted-foreground text-sm">
                    No KYB submissions match your filters.
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
                        {kybRequests.map((request, index) => (
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
                                  {formatDate(request.created || request.submitted_at)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              {getStatusBadge(request.kyb_status || request.status)}
                            </TableCell>
                            <TableCell className="py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleReview(request.client_id || request.id, "approve")
                                  }
                                  className="h-8 rounded-lg text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-300"
                                >
                                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Approve
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleReview(request.client_id || request.id, "reject")
                                  }
                                  className="h-8 rounded-lg text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                                >
                                  <XCircle className="mr-1.5 h-3.5 w-3.5" /> Reject
                                </Button>
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
                    submissions
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
