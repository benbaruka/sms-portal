"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  ShieldAlert,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useAlert } from "@/context/AlertProvider";
import { useAdminKYBPendings } from "@/controller/query/admin/kyb/useAdminKYB";
import { AdminKYBRecord } from "@/types";
import { format } from "date-fns";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All status" },
  { value: "pending", label: "Pending" },
  { value: "in-review", label: "In review" },
];

export default function PendingKYBPage() {
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
    const responseData = kybResponse as any; // Type assertion to handle various response formats
    const data =
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
    if (!item.submitted_at) return false;
    try {
      const submitted = new Date(item.submitted_at);
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
          <Badge variant="outline" className="border-amber-500 text-xs text-amber-600">
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
    <div className="space-y-8 px-4 py-4 sm:space-y-10 sm:px-6 sm:py-6">
      <header className="rounded-3xl border border-gray-200 bg-white shadow-xl shadow-brand-500/15 dark:border-gray-900 dark:bg-gray-950">
        <div className="flex flex-col gap-6 px-6 py-6 sm:px-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 p-3 shadow-lg shadow-brand-500/40 sm:p-4">
              <ShieldAlert className="h-6 w-6 text-white sm:h-8 sm:w-8" />
            </div>
            <div>
              <h1 className="text-[28px] font-semibold tracking-tight text-gray-900 dark:text-white sm:text-[32px]">
                Pending KYB Reviews
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed dark:text-gray-300 sm:text-base">
                Monitor new KYB submissions, prioritise the latest requests, and keep onboarding
                timelines on track.
              </p>
            </div>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading || isRefreshing}
              className="h-10 w-full rounded-xl border-2 sm:h-11 sm:w-auto"
            >
              {isLoading || isRefreshing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh data
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <ShieldCheck className="h-9 w-9 rounded-xl bg-brand-500/10 p-2 text-brand-600 dark:text-brand-400" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Open reviews
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {isLoading || isRefreshing ? "--" : totalPending.toLocaleString()}
              </p>
              <p className="text-muted-foreground text-xs">Awaiting validation</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <TrendingUp className="h-9 w-9 rounded-xl bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Documents received
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {isLoading || isRefreshing ? "--" : totalDocuments.toLocaleString()}
              </p>
              <p className="text-muted-foreground text-xs">Across all pending files</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-9 w-9 rounded-xl bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Submitted today
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {isLoading || isRefreshing ? "--" : submittedToday.toLocaleString()}
              </p>
              <p className="text-muted-foreground text-xs">Need quick follow-up</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <Eye className="h-9 w-9 rounded-xl bg-sky-500/10 p-2 text-sky-600 dark:text-sky-400" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Avg. documents
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {isLoading || isRefreshing ? "--" : averageDocuments}
              </p>
              <p className="text-muted-foreground text-xs">Per KYB submission</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
                <ShieldAlert className="h-5 w-5 text-brand-500" />
                Pending KYB queue
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-1 text-sm">
                Review new submissions, request additional documents, or finalise approval.
              </CardDescription>
            </div>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <div className="relative max-w-sm flex-1">
                <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Search by client, reviewer or ID"
                  value={search}
                  onChange={(event) => {
                    setPage(1);
                    setSearch(event.target.value);
                  }}
                  className="h-10 rounded-xl border-2 pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(event) => {
                  setPage(1);
                  setStatusFilter(event.target.value);
                }}
                aria-label="Filter by status"
                className="h-10 rounded-xl border-2 bg-white px-3 text-sm dark:bg-gray-900"
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
              <Loader2 className="mb-4 h-8 w-8 animate-spin text-brand-500" />
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
                <div className="overflow-hidden rounded-lg border-2 border-gray-200 dark:border-gray-800">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                        <TableHead className="font-semibold text-gray-900 dark:text-white">
                          Client
                        </TableHead>
                        <TableHead className="font-semibold text-gray-900 dark:text-white">
                          KYB ID
                        </TableHead>
                        <TableHead className="font-semibold text-gray-900 dark:text-white">
                          Documents
                        </TableHead>
                        <TableHead className="font-semibold text-gray-900 dark:text-white">
                          Submitted
                        </TableHead>
                        <TableHead className="font-semibold text-gray-900 dark:text-white">
                          Status
                        </TableHead>
                        <TableHead className="text-right font-semibold text-gray-900 dark:text-white">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {kybRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium text-gray-900 dark:text-white">
                            {request.client_name || "--"}
                          </TableCell>
                          <TableCell className="text-muted-foreground dark:text-gray-300">
                            {request.id || "--"}
                          </TableCell>
                          <TableCell className="text-gray-900 dark:text-gray-100">
                            <Badge variant="secondary" className="rounded-lg">
                              {(request.documents_count ?? 0).toLocaleString()} files
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground dark:text-gray-400">
                            {formatDate(request.submitted_at)}
                          </TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReview(request.id, "approve")}
                                className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                              >
                                <CheckCircle2 className="mr-1 h-4 w-4" /> Approve
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReview(request.id, "reject")}
                                className="text-red-600 hover:text-red-700 dark:text-red-400"
                              >
                                <XCircle className="mr-1 h-4 w-4" /> Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {pagination && (pagination.total_pages || 0) > 1 && (
                <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {pagination.from || 0} to {pagination.to || 0} of{" "}
                    {pagination.total || 0} submissions
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={page <= 1 || isLoading || isRefreshing}
                      className="rounded-xl border-2"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((prev) => prev + 1)}
                      disabled={page >= (pagination.total_pages || 1) || isLoading || isRefreshing}
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
    </div>
  );
}
