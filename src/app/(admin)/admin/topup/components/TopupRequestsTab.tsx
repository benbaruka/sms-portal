"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  CreditCard,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  DollarSign,
  Hash,
  FileText,
  FolderOpen,
} from "lucide-react";
import { useAlert } from "@/context/AlertProvider";
import { useGetManualTopupRequests } from "@/controller/query/topup/useTopup";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import type { ManualTopupRequest, PaginationInfo } from "@/types";

export default function TopupRequestsTab() {
  const { showAlert } = useAlert();
  const router = useRouter();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const {
    data: requestsData,
    isLoading,
    isFetching,
    refetch,
  } = useGetManualTopupRequests(
    {
      page,
      per_page: perPage,
      search: search || undefined,
      sort: "created",
      order: "desc",
    },
    apiKey,
    !!apiKey
  );

  const requests = useMemo(() => {
    if (!requestsData) return [];
    const data =
      requestsData.message?.data ||
      requestsData.data?.data ||
      requestsData.message ||
      requestsData.data;
    if (Array.isArray(data)) return data;
    return [];
  }, [requestsData]);

  const pagination = useMemo(() => {
    if (!requestsData) return null;
    const data =
      requestsData.message?.pagination || requestsData.data?.pagination || requestsData.pagination;
    return data && typeof data === "object" && "total_pages" in data
      ? (data as PaginationInfo)
      : null;
  }, [requestsData]);

  const stats = useMemo(() => {
    return requests.reduce(
      (
        acc: {
          total: number;
          approved: number;
          pending: number;
          rejected: number;
          totalAmount: number;
        },
        request: ManualTopupRequest
      ) => {
        acc.total += 1;
        acc.totalAmount += Number(request.amount) || 0;
        const status = (request.status || "").toLowerCase();
        if (status === "approved" || status === "completed" || status === "success")
          acc.approved += 1;
        else if (status === "pending" || status === "processing") acc.pending += 1;
        else if (status === "rejected" || status === "failed" || status === "error")
          acc.rejected += 1;
        return acc;
      },
      { total: 0, approved: 0, pending: 0, rejected: 0, totalAmount: 0 }
    );
  }, [requests]);

  const isRefreshing = isFetching && !isLoading;

  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "completed":
      case "success":
        return (
          <Badge variant="default" className="gap-1 bg-emerald-500 text-white">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </Badge>
        );
      case "pending":
      case "processing":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "rejected":
      case "failed":
      case "error":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status || "Unknown"}</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm");
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      showAlert({
        variant: "success",
        title: "Requests refreshed",
        message: "Latest top-up requests were loaded successfully.",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unable to refresh requests.";
      showAlert({
        variant: "error",
        title: "Refresh failed",
        message: errorMessage,
      });
    }
  };

  const handleViewDetails = (requestId: number) => {
    router.push(`/admin/topup/request/view?id=${requestId}`);
  };

  const filteredRequests = useMemo(() => {
    if (!search) return requests;
    return requests.filter(
      (request: ManualTopupRequest) =>
        request.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
        request.description?.toLowerCase().includes(search.toLowerCase()) ||
        request.client_name?.toLowerCase().includes(search.toLowerCase()) ||
        request.connector_name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [requests, search]);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {requests.length > 0 && (
        <section className="grid gap-4 md:grid-cols-4">
          <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <CardContent className="flex items-center gap-3 p-4">
              <FolderOpen className="h-9 w-9 rounded-xl bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Total
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <CardContent className="flex items-center gap-3 p-4">
              <DollarSign className="h-9 w-9 rounded-xl bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Total Amount
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(stats.totalAmount)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <CardContent className="flex items-center gap-3 p-4">
              <CheckCircle2 className="h-9 w-9 rounded-xl bg-green-500/10 p-2 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Approved
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stats.approved}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <CardContent className="flex items-center gap-3 p-4">
              <Clock className="h-9 w-9 rounded-xl bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Pending
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stats.pending}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="p-4 pb-2 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
                <CreditCard className="h-5 w-5 text-blue-500" />
                Top-up Requests
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                Search and filter all top-up requests
              </CardDescription>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by invoice number, description, client..."
                className="h-11 rounded-xl border-2 pl-9"
              />
            </div>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading || isRefreshing}
              className="h-11 w-full rounded-xl border-2 sm:w-auto"
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
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
              <p className="text-muted-foreground text-sm">Loading top-up requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
              <CreditCard className="text-muted-foreground h-10 w-10" />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                No top-up requests found
              </p>
              <p className="text-muted-foreground text-sm">
                {search
                  ? "Try adjusting your search filters."
                  : "You haven't created any top-up requests yet."}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-200 bg-gradient-to-r from-gray-50/80 to-gray-100/50 dark:border-gray-700 dark:from-gray-900/40 dark:to-gray-800/40">
                      <TableHead className="min-w-[100px] py-4 font-semibold text-gray-900 dark:text-gray-100">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-blue-500" />
                          ID
                        </div>
                      </TableHead>
                      <TableHead className="min-w-[150px] py-4 font-semibold text-gray-900 dark:text-gray-100">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-emerald-500" />
                          Amount
                        </div>
                      </TableHead>
                      <TableHead className="min-w-[100px] py-4 font-semibold text-gray-900 dark:text-gray-100">
                        Currency
                      </TableHead>
                      <TableHead className="min-w-[150px] py-4 font-semibold text-gray-900 dark:text-gray-100">
                        Connector
                      </TableHead>
                      <TableHead className="min-w-[180px] py-4 font-semibold text-gray-900 dark:text-gray-100">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-purple-500" />
                          Invoice Number
                        </div>
                      </TableHead>
                      <TableHead className="min-w-[120px] py-4 font-semibold text-gray-900 dark:text-gray-100">
                        Status
                      </TableHead>
                      <TableHead className="min-w-[180px] py-4 font-semibold text-gray-900 dark:text-gray-100">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-emerald-500" />
                          Created
                        </div>
                      </TableHead>
                      <TableHead className="min-w-[100px] py-4 text-right font-semibold text-gray-900 dark:text-gray-100">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request: ManualTopupRequest) => (
                      <TableRow
                        key={request.id}
                        className="group border-b border-gray-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/30 dark:border-gray-800/50 dark:hover:from-blue-950/20 dark:hover:to-cyan-950/10"
                      >
                        <TableCell className="py-4">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            #{request.id}
                          </p>
                        </TableCell>
                        <TableCell className="py-4">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {formatCurrency(request.amount || 0, request.currency || "USD")}
                          </p>
                        </TableCell>
                        <TableCell className="py-4">
                          <p className="text-muted-foreground text-sm dark:text-gray-300">
                            {request.currency || "USD"}
                          </p>
                        </TableCell>
                        <TableCell className="py-4">
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {request.connector_name || `Connector ${request.connector_id || "N/A"}`}
                          </p>
                        </TableCell>
                        <TableCell className="py-4">
                          <p className="font-mono text-muted-foreground text-sm dark:text-gray-300">
                            {request.invoice_number || "—"}
                          </p>
                        </TableCell>
                        <TableCell className="py-4">{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="py-4">
                          <div className="text-muted-foreground flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <span className="whitespace-nowrap">
                              {formatDate(request.created_at)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 rounded-lg text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/30 dark:hover:text-blue-300"
                            onClick={() => handleViewDetails(request.id)}
                            title="View Details"
                          >
                            <Eye className="mr-1 h-4 w-4" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {pagination && (pagination.total_pages || pagination.last_page || 0) > 1 && (
                <div className="flex flex-col gap-4 border-t border-gray-200 px-4 py-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-muted-foreground text-sm">
                    Showing {pagination.from || (page - 1) * perPage + 1} to{" "}
                    {pagination.to ||
                      Math.min(page * perPage, pagination.total || filteredRequests.length)}{" "}
                    of {pagination.total || filteredRequests.length} requests
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
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Page {page} of{" "}
                      {Number(pagination.total_pages) || Number(pagination.last_page) || 1}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((prev) =>
                          Math.min(
                            prev + 1,
                            Number(pagination.total_pages) ||
                              Number(pagination.last_page) ||
                              prev + 1
                          )
                        )
                      }
                      disabled={
                        page >=
                          (Number(pagination.total_pages) || Number(pagination.last_page) || 1) ||
                        isLoading
                      }
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
