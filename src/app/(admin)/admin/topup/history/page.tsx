"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  History,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  DollarSign,
} from "lucide-react";
import { useAlert } from "@/context/AlertProvider";
import { useGetManualTopupRequests } from "@/controller/query/topup/useTopup";
import { format } from "date-fns";
import type { ManualTopupRequest, PaginationInfo } from "@/types";

export default function AdminTopupHistoryPage() {
  const { showAlert } = useAlert();
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

  const totalAmount = useMemo(() => {
    return requests.reduce(
      (sum: number, item: ManualTopupRequest) => sum + (Number(item.amount) || 0),
      0
    );
  }, [requests]);

  const completedCount = useMemo(() => {
    return requests.filter((item: ManualTopupRequest) => {
      const status = (item.status || "").toLowerCase();
      return status === "approved" || status === "completed" || status === "success";
    }).length;
  }, [requests]);

  const pendingCount = useMemo(() => {
    return requests.filter((item: ManualTopupRequest) => {
      const status = (item.status || "").toLowerCase();
      return status === "pending" || status === "processing";
    }).length;
  }, [requests]);

  const isRefreshing = isFetching && !isLoading;

  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "completed":
      case "success":
        return (
          <Badge variant="default" className="bg-green-500 text-white">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Completed
          </Badge>
        );
      case "pending":
      case "processing":
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" /> Pending
          </Badge>
        );
      case "rejected":
      case "failed":
      case "error":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" /> Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status || "Unknown"}</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd MMM yyyy, HH:mm");
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
        title: "History refreshed",
        message: "Top-up history was updated successfully.",
      });
    } catch (error) {
      showAlert({
        variant: "error",
        title: "Refresh failed",
        message: error instanceof Error ? error.message : "Unable to refresh top-up history.",
      });
    }
  };

  return (
    <div className="space-y-8 px-4 py-4 sm:space-y-10 sm:px-6 sm:py-6">
      <header className="rounded-3xl border border-gray-200 bg-white shadow-xl shadow-brand-500/10 dark:border-gray-900 dark:bg-gray-950">
        <div className="flex flex-col gap-6 px-6 py-6 sm:px-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 p-3 shadow-lg shadow-brand-500/40 sm:p-4">
              <History className="h-6 w-6 text-white sm:h-8 sm:w-8" />
            </div>
            <div>
              <h1 className="text-[28px] font-semibold tracking-tight text-gray-900 dark:text-white sm:text-[32px]">
                Top-up History
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed dark:text-gray-300 sm:text-base">
                View all top-up transaction history, track completed requests, and monitor pending
                approvals.
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

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <DollarSign className="h-9 w-9 rounded-xl bg-brand-500/10 p-2 text-brand-600 dark:text-brand-400" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Total Amount
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {isLoading || isRefreshing ? "--" : formatCurrency(totalAmount)}
              </p>
              <p className="text-muted-foreground text-xs">All top-up requests</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 className="h-9 w-9 rounded-xl bg-green-500/10 p-2 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Completed
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {isLoading || isRefreshing ? "--" : completedCount.toLocaleString()}
              </p>
              <p className="text-muted-foreground text-xs">Approved requests</p>
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
                {isLoading || isRefreshing ? "--" : pendingCount.toLocaleString()}
              </p>
              <p className="text-muted-foreground text-xs">Awaiting approval</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
                <History className="h-5 w-5 text-brand-500" />
                Top-up Transaction History
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-1 text-sm">
                Complete list of all top-up requests and their status.
              </CardDescription>
            </div>
            <div className="relative max-w-sm flex-1">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search by invoice, client, description..."
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                className="h-10 rounded-xl border-2 pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6">
          {isLoading || isRefreshing ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 className="mb-4 h-8 w-8 animate-spin text-brand-500" />
              <p className="text-muted-foreground text-sm">Loading top-up history...</p>
            </div>
          ) : (
            <>
              {requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
                  <History className="text-muted-foreground h-10 w-10" />
                  <p className="text-muted-foreground text-sm">No top-up history found.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border-2 border-gray-200 dark:border-gray-800">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                        <TableHead className="font-semibold text-gray-900 dark:text-white">
                          Invoice
                        </TableHead>
                        <TableHead className="font-semibold text-gray-900 dark:text-white">
                          Client
                        </TableHead>
                        <TableHead className="font-semibold text-gray-900 dark:text-white">
                          Amount
                        </TableHead>
                        <TableHead className="font-semibold text-gray-900 dark:text-white">
                          Connector
                        </TableHead>
                        <TableHead className="font-semibold text-gray-900 dark:text-white">
                          Status
                        </TableHead>
                        <TableHead className="font-semibold text-gray-900 dark:text-white">
                          Created At
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((request: ManualTopupRequest) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium text-gray-900 dark:text-white">
                            {request.invoice_number || `#${request.id}`}
                          </TableCell>
                          <TableCell className="text-gray-900 dark:text-gray-100">
                            {request.client_name || "--"}
                          </TableCell>
                          <TableCell className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                            <CreditCard className="h-4 w-4 text-brand-500" />
                            {formatCurrency(request.amount || 0, request.currency || "USD")}
                          </TableCell>
                          <TableCell className="text-gray-900 dark:text-gray-100">
                            {request.connector_name || "--"}
                          </TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell className="text-muted-foreground dark:text-gray-400">
                            {formatDate(request.created_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {pagination && (pagination.total_pages ?? 0) > 1 && (
                <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {pagination.from ?? 0} to {pagination.to ?? 0} of{" "}
                    {pagination.total ?? 0} requests
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page <= 1 || isLoading || isRefreshing}
                      className="rounded-xl border-2"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= (pagination.total_pages ?? 1) || isLoading || isRefreshing}
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
