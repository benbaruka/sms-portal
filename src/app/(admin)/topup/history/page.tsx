"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAlert } from "@/context/AlertProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Loader2,
  History,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { useMNOTopupHistory } from "@/controller/query/topup/useTopup";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All status" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];

const FALLBACK_NETWORKS = ["AIRTEL", "ORANGE", "VODACOM", "AFRICELL"];

type HistoryRecord = {
  id?: number | string;
  transaction_id?: string;
  reference?: string;
  amount?: number;
  currency?: string;
  mno_wallet_type?: string;
  msisdn?: string;
  status?: string;
  created_at?: string;
  created?: string;
};

export default function TopupHistoryPage() {
  const { showAlert } = useAlert();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [mnoFilter, setMnoFilter] = useState<string>("ALL");

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const {
    data: historyData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useMNOTopupHistory(
    {
      page,
      per_page: perPage,
      search: search || undefined,
      status: statusFilter !== "ALL" ? statusFilter : undefined,
      mno_wallet_type: mnoFilter !== "ALL" ? mnoFilter : undefined,
      sort: "created_at|DESC",
    },
    apiKey,
    !!apiKey
  );

  const rawHistory = useMemo(() => {
    if (!historyData) return [];

    // Le backend retourne directement pagination, qui contient data
    // Structure: { data: [...], total, per_page, current_page, ... }
    if (Array.isArray(historyData.data)) return historyData.data;

    const payload = (historyData.data || historyData.message || historyData) as {
      transactions?: unknown[];
      data?: unknown[];
      [key: string]: unknown;
    };

    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.transactions)) return payload.transactions;
    return [];
  }, [historyData]);

  const transactions: HistoryRecord[] = useMemo(() => rawHistory.filter(Boolean), [rawHistory]);

  const pagination = useMemo(() => {
    if (!historyData) return null;

    // Le backend retourne directement pagination avec total, per_page, current_page, etc.
    // Vérifier si historyData contient directement les propriétés de pagination
    if (historyData.total !== undefined || historyData.current_page !== undefined) {
      return {
        total: historyData.total,
        per_page: historyData.per_page,
        current_page: historyData.current_page,
        total_pages:
          historyData.total_pages ||
          Math.ceil((historyData.total || 0) / (historyData.per_page || 1)),
        from: historyData.from,
        to: historyData.to,
        last_page: historyData.last_page || historyData.total_pages,
      };
    }

    const payload = (historyData.data || historyData.message || historyData) as {
      pagination?: {
        total_pages?: number;
        from?: number;
        to?: number;
        total?: number;
        current_page?: number;
        per_page?: number;
        last_page?: number;
        [key: string]: unknown;
      };
      total?: number;
      current_page?: number;
      per_page?: number;
      total_pages?: number;
      from?: number;
      to?: number;
      last_page?: number;
      [key: string]: unknown;
    };

    // Si payload a directement les propriétés de pagination
    if (payload.total !== undefined || payload.current_page !== undefined) {
      return {
        total: payload.total,
        per_page: payload.per_page,
        current_page: payload.current_page,
        total_pages:
          payload.total_pages || Math.ceil((payload.total || 0) / (payload.per_page || 1)),
        from: payload.from,
        to: payload.to,
        last_page: payload.last_page || payload.total_pages,
      };
    }

    return payload?.pagination || null;
  }, [historyData]);

  const statusCounters = useMemo(() => {
    return transactions.reduce(
      (acc, item) => {
        const status = (item.status || "unknown").toLowerCase();
        acc.total += 1;
        // Only count amount for completed transactions
        // Note: This is only for the current page, not the total across all pages
        if (status.includes("success") || status.includes("complete")) {
          acc.completed += 1;
          acc.totalAmount += Number(item.amount || 0);
        } else if (status.includes("pend") || status.includes("process")) {
          acc.pending += 1;
        } else if (status.includes("fail") || status.includes("error")) {
          acc.failed += 1;
        } else {
          acc.other += 1;
        }
        return acc;
      },
      { total: 0, completed: 0, pending: 0, failed: 0, other: 0, totalAmount: 0 }
    );
  }, [transactions]);

  const networkOptions = useMemo(() => {
    const unique = new Set<string>();
    transactions.forEach((item) => {
      if (item.mno_wallet_type) unique.add(item.mno_wallet_type.toUpperCase());
    });
    if (unique.size === 0) {
      FALLBACK_NETWORKS.forEach((network) => unique.add(network));
    }
    return Array.from(unique);
  }, [transactions]);

  const getStatusBadge = (status?: string) => {
    const normalized = status?.toLowerCase() || "";
    if (normalized.includes("success") || normalized.includes("complete")) {
      return (
        <Badge variant="default" className="gap-1 bg-emerald-500 text-white">
          <CheckCircle2 className="h-3 w-3" />
          Completed
        </Badge>
      );
    }
    if (normalized.includes("fail") || normalized.includes("error")) {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Failed
        </Badge>
      );
    }
    if (normalized.includes("pend") || normalized.includes("process")) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1">
        {status || "Unknown"}
      </Badge>
    );
  };

  const formatCurrency = (amount: number, currency: string = "USD") =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  const formatDateTime = (dateInput?: string) => {
    if (!dateInput) return "--";
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return dateInput;
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredTransactions = useMemo(() => {
    if (!search.trim()) return transactions;
    const query = search.toLowerCase();
    return transactions.filter((item) => {
      return (
        item.transaction_id?.toLowerCase().includes(query) ||
        item.reference?.toLowerCase().includes(query) ||
        item.mno_wallet_type?.toLowerCase().includes(query) ||
        item.msisdn?.toLowerCase().includes(query)
      );
    });
  }, [transactions, search]);

  const handleRefresh = async () => {
    try {
      await refetch();
      showAlert({
        variant: "success",
        title: "History updated",
        message: "Latest topup transactions loaded successfully.",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unable to refresh topup history.";
      showAlert({
        variant: "error",
        title: "Refresh failed",
        message,
      });
    }
  };

  const isRefreshing = isFetching && !isLoading;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-4">
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <History className="h-9 w-9 rounded-xl bg-brand-500/10 p-2 text-brand-600 dark:text-brand-400" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide dark:text-gray-400">
                Total transactions
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {statusCounters.total}
              </p>
              <p className="text-muted-foreground text-xs dark:text-gray-400">
                All recorded topups
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 className="h-9 w-9 rounded-xl bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-300" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide dark:text-gray-400">
                Completed
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {statusCounters.completed}
              </p>
              <p className="text-muted-foreground text-xs dark:text-gray-400">
                Successfully credited
              </p>
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
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {statusCounters.pending}
              </p>
              <p className="text-muted-foreground text-xs dark:text-gray-400">
                Awaiting confirmation
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <Sparkles className="h-9 w-9 rounded-xl bg-purple-500/10 p-2 text-purple-600 dark:text-purple-300" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide dark:text-gray-400">
                Completed amount
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(statusCounters.totalAmount || 0, "USD")}
              </p>
              <p className="text-muted-foreground text-xs dark:text-gray-400">This page only</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {isError && (
        <Alert
          variant="destructive"
          className="border border-red-500/40 bg-red-50 dark:bg-red-950/30"
        >
          <AlertTitle className="text-gray-900 dark:text-white">Failed to load history</AlertTitle>
          <AlertDescription className="text-gray-900 dark:text-white">
            {error instanceof Error
              ? error.message
              : "Unable to fetch topup transactions right now."}
          </AlertDescription>
        </Alert>
      )}

      <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
                <CreditCard className="h-5 w-5 text-brand-500" />
                Wallet topup transactions
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm dark:text-gray-400">
                Use the filters to drill into specific operators, references or statuses. All
                timestamps are shown in your local timezone.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="h-10 w-full rounded-xl border-2 sm:w-auto"
            >
              {isRefreshing || isLoading ? (
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
          <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <div className="relative">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 dark:text-gray-400" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by transaction ID, reference or phone number..."
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
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={mnoFilter}
              onValueChange={(value) => {
                setMnoFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-11 rounded-xl border-2">
                <SelectValue placeholder="Filter by network" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All networks</SelectItem>
                {networkOptions.map((network) => (
                  <SelectItem key={network} value={network}>
                    {network.charAt(0) + network.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
              <p className="text-muted-foreground text-sm dark:text-gray-400">
                Loading your topup history...
              </p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <History className="text-muted-foreground h-10 w-10 dark:text-gray-400" />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                No transactions match your filters.
              </p>
              <p className="text-muted-foreground px-4 text-center text-sm dark:text-gray-400">
                Try adjusting the search keywords or clearing the status and network filters to see
                more results.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/80 dark:bg-gray-900/40">
                      <TableHead className="min-w-[160px]">Transaction ID</TableHead>
                      <TableHead className="min-w-[120px]">Amount</TableHead>
                      <TableHead className="min-w-[120px]">Network</TableHead>
                      <TableHead className="min-w-[160px]">Phone number</TableHead>
                      <TableHead className="min-w-[140px]">Reference</TableHead>
                      <TableHead className="min-w-[140px]">Status</TableHead>
                      <TableHead className="min-w-[160px]">Created at</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((item) => (
                      <TableRow
                        key={item.id || item.transaction_id || item.reference}
                        className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/30"
                      >
                        <TableCell className="font-semibold text-gray-900 dark:text-white">
                          {item.transaction_id || item.reference || `TXN-${item.id}`}
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">
                          {formatCurrency(Number(item.amount || 0), item.currency || "USD")}
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">
                          {item.mno_wallet_type || "—"}
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">
                          {item.msisdn || "—"}
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">
                          {item.reference || "—"}
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="text-muted-foreground dark:text-gray-400">
                          {formatDateTime(item.created_at || item.created)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {pagination && (pagination.total_pages ?? 0) > 1 && (
                <div className="flex flex-col gap-4 border-t border-gray-200 px-4 py-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-muted-foreground text-sm dark:text-gray-400">
                    Showing {pagination.from ?? 0} to {pagination.to ?? 0} of{" "}
                    {pagination.total ?? filteredTransactions.length} transactions
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
                      Page {page} of {pagination.total_pages ?? 1}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((prev) => Math.min(prev + 1, pagination.total_pages ?? prev + 1))
                      }
                      disabled={page >= (pagination.total_pages ?? 1) || isLoading}
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
