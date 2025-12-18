"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
import {
  Loader2,
  Key,
  RefreshCw,
  Search,
  Plus,
  Copy,
  ShieldCheck,
  ShieldOff,
  Clock3,
} from "lucide-react";
import { useAlert } from "@/context/AlertProvider";
import {
  useAdminTokensList,
  useChangeAdminTokenStatus,
} from "@/controller/query/admin/tokens/useAdminTokens";
import type { AdminToken } from "@/types";

type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";
type TokenTypeFilter = "ALL" | "LIVE" | "TEST";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All status" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

const TOKEN_TYPE_OPTIONS: { value: TokenTypeFilter; label: string }[] = [
  { value: "ALL", label: "All types" },
  { value: "LIVE", label: "Live" },
  { value: "TEST", label: "Test" },
];

const normalizeStatus = (status: number | string | undefined): StatusFilter => {
  if (typeof status === "number") {
    return status === 1 ? "ACTIVE" : "INACTIVE";
  }
  const normalized = (status || "").toString().toUpperCase();
  if (["ACTIVE", "ENABLED", "APPROVED"].includes(normalized)) return "ACTIVE";
  if (["INACTIVE", "DISABLED", "REVOKED", "SUSPENDED"].includes(normalized)) return "INACTIVE";
  return "INACTIVE";
};

const statusBadge = (status: StatusFilter) => {
  if (status === "ACTIVE") {
    return (
      <Badge variant="default" className="gap-1 bg-emerald-500 text-white">
        <ShieldCheck className="h-3 w-3" />
        Active
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="gap-1">
      <ShieldOff className="h-3 w-3" />
      Inactive
    </Badge>
  );
};

const maskToken = (token: string | undefined) => {
  if (!token) return "--";
  if (token.length <= 12) return token;
  return `${token.slice(0, 6)}••••${token.slice(-6)}`;
};

export default function AllTokensPage() {
  const { showAlert } = useAlert();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [tokenTypeFilter, setTokenTypeFilter] = useState<TokenTypeFilter>("ALL");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const {
    data: tokensResponse,
    isLoading,
    isFetching,
    refetch,
  } = useAdminTokensList(
    {
      page,
      per_page: perPage,
      search: search || undefined,
      status: statusFilter !== "ALL" ? statusFilter : undefined,
      token_type: tokenTypeFilter !== "ALL" ? tokenTypeFilter : undefined,
    },
    apiKey,
    !!apiKey
  );

  const changeStatusMutation = useChangeAdminTokenStatus();

  const tokens = useMemo(() => {
    if (!tokensResponse) return [];
    const payload: unknown =
      tokensResponse.tokens ||
      tokensResponse.data?.tokens ||
      tokensResponse.data?.data ||
      tokensResponse.message?.tokens ||
      tokensResponse.message?.data ||
      tokensResponse.message;
    if (Array.isArray(payload)) return payload as AdminToken[];
    if (payload && typeof payload === "object" && "data" in payload) {
      const data = (payload as { data?: unknown }).data;
      if (Array.isArray(data)) return data as AdminToken[];
    }
    return [];
  }, [tokensResponse]);

  const pagination = useMemo(() => {
    if (!tokensResponse) return null;
    return (
      tokensResponse.pagination ||
      tokensResponse.data?.pagination ||
      tokensResponse.message?.pagination ||
      null
    );
  }, [tokensResponse]);

  const stats = useMemo(() => {
    return tokens.reduce(
      (
        acc: { total: number; active: number; revoked: number; live: number; test: number },
        token: AdminToken
      ) => {
        const status = normalizeStatus(token.status);
        const type = (token.token_type || token.type || "").toString().toUpperCase();
        acc.total += 1;
        if (status === "ACTIVE") acc.active += 1;
        if (status === "INACTIVE") acc.revoked += 1;
        if (type === "LIVE") acc.live += 1;
        if (type === "TEST") acc.test += 1;
        return acc;
      },
      { total: 0, active: 0, revoked: 0, live: 0, test: 0 }
    );
  }, [tokens]);

  const isRefreshing = isFetching && !isLoading;

  const handleRefresh = async () => {
    try {
      await refetch();
      showAlert({
        variant: "success",
        title: "Tokens refreshed",
        message: "The latest token registry has been loaded successfully.",
      });
    } catch (error) {
      showAlert({
        variant: "error",
        title: "Refresh failed",
        message: error instanceof Error ? error.message : "Unable to refresh the token list.",
      });
    }
  };

  const handleCopy = (token: string | undefined) => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    showAlert({
      variant: "success",
      title: "Copied",
      message: "Token copied to clipboard.",
    });
  };

  const handleToggleStatus = async (token: AdminToken) => {
    if (!apiKey) {
      showAlert({
        variant: "error",
        title: "Missing API key",
        message: "Please sign in again to change token status.",
      });
      return;
    }
    const status = normalizeStatus(token.status);
    const nextStatus = status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const tokenId = (token.id ?? token.token_id ?? token.token) as string | number | undefined;
      if (!tokenId) return;
      await changeStatusMutation.mutateAsync({
        data: {
          token_id: tokenId,
          status: nextStatus,
        },
        apiKey,
      });
      await refetch();
    } catch {
      // Alert handled in mutation
    }
  };

  return (
    <div className="space-y-8 px-4 py-4 sm:space-y-10 sm:px-6 sm:py-6">
      <header className="rounded-3xl border border-gray-200 bg-white shadow-xl shadow-brand-500/10 dark:border-gray-900 dark:bg-gray-950">
        <div className="flex flex-col gap-6 px-6 py-6 sm:px-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 p-3 shadow-lg shadow-brand-500/40 sm:p-4">
              <Key className="h-6 w-6 text-white sm:h-8 sm:w-8" />
            </div>
            <div>
              <h1 className="text-[28px] font-semibold tracking-tight text-gray-900 dark:text-white sm:text-[32px]">
                Client API Tokens
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed dark:text-gray-300 sm:text-base">
                Monitor every credential issued to your tenants. Filter by status or environment and
                keep the registry aligned with KYB decisions.
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
                  Refresh list
                </>
              )}
            </Button>
            <Link href="/admin/tokens/create" className="w-full sm:w-auto">
              <Button className="h-10 w-full rounded-xl sm:h-11 sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Create token
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-4">
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <Key className="h-9 w-9 rounded-xl bg-brand-500/10 p-2 text-brand-600 dark:text-brand-400" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Total tokens
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-muted-foreground text-xs">Across all clients</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <ShieldCheck className="h-9 w-9 rounded-xl bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-300" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Active
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.active}</p>
              <p className="text-muted-foreground text-xs">Ready to use</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <ShieldOff className="h-9 w-9 rounded-xl bg-amber-500/10 p-2 text-amber-600 dark:text-amber-300" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Inactive
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.revoked}</p>
              <p className="text-muted-foreground text-xs">Revoked or disabled</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <Clock3 className="h-9 w-9 rounded-xl bg-blue-500/10 p-2 text-blue-600 dark:text-blue-300" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Live vs test
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.live} live · {stats.test} test
              </p>
              <p className="text-muted-foreground text-xs">Environment split</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="p-4 pb-2 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
                <Key className="h-5 w-5 text-brand-500" />
                Manage issued tokens
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                Search by client name or token value. Filter by status or environment to locate the
                right credential.
              </CardDescription>
            </div>
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
          <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <div className="relative">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by client, token or reference..."
                className="h-11 rounded-xl border-2 pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value as StatusFilter);
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
              value={tokenTypeFilter}
              onValueChange={(value) => {
                setTokenTypeFilter(value as TokenTypeFilter);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-11 rounded-xl border-2">
                <SelectValue placeholder="Token type" />
              </SelectTrigger>
              <SelectContent>
                {TOKEN_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
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
              <p className="text-muted-foreground text-sm">Loading tokens...</p>
            </div>
          ) : tokens.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
              <Key className="text-muted-foreground h-10 w-10" />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                No tokens match the current filters.
              </p>
              <p className="text-muted-foreground text-sm">
                Adjust the filters or create a new token for a client tenant.
              </p>
              <Link href="/admin/tokens/create">
                <Button className="mt-2 rounded-xl">
                  <Plus className="mr-2 h-4 w-4" />
                  Create token
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/80 dark:bg-gray-900/40">
                      <TableHead className="min-w-[180px]">Client</TableHead>
                      <TableHead className="min-w-[200px]">Token</TableHead>
                      <TableHead className="min-w-[120px]">Type</TableHead>
                      <TableHead className="min-w-[120px]">Status</TableHead>
                      <TableHead className="min-w-[180px]">Created</TableHead>
                      <TableHead className="min-w-[140px]">Last used</TableHead>
                      <TableHead className="min-w-[160px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tokens.map((token: AdminToken) => {
                      const status = normalizeStatus(token.status);
                      const type =
                        (token.token_type || token.type || "").toString().toUpperCase() || "—";
                      return (
                        <TableRow
                          key={String(token.id ?? token.token_id ?? token.token ?? "")}
                          className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/30"
                        >
                          <TableCell className="font-semibold text-gray-900 dark:text-white">
                            {String(token.client_name ?? token.client ?? "—")}
                          </TableCell>
                          <TableCell className="font-mono text-sm text-gray-900 dark:text-gray-100">
                            {maskToken(
                              typeof token.token === "string"
                                ? token.token
                                : typeof token.key === "string"
                                  ? token.key
                                  : undefined
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs font-semibold uppercase">
                            {type}
                          </TableCell>
                          <TableCell>{statusBadge(status)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {token.created_at || token.created || token.createdOn
                              ? new Date(
                                  String(token.created_at ?? token.created ?? token.createdOn ?? "")
                                ).toLocaleString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "--"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {token.last_used_at && typeof token.last_used_at === "string"
                              ? new Date(token.last_used_at).toLocaleString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Never"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-xl"
                                onClick={() =>
                                  handleCopy(
                                    typeof token.token === "string"
                                      ? token.token
                                      : typeof token.key === "string"
                                        ? token.key
                                        : undefined
                                  )
                                }
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 rounded-xl border-2"
                                disabled={changeStatusMutation.isPending || isRefreshing}
                                onClick={() => handleToggleStatus(token)}
                              >
                                {status === "ACTIVE" ? (
                                  <>
                                    <ShieldOff className="mr-2 h-4 w-4" />
                                    Disable
                                  </>
                                ) : (
                                  <>
                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                    Activate
                                  </>
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {pagination && (pagination?.total_pages || 0) > 1 && (
                <div className="flex flex-col gap-4 border-t border-gray-200 px-4 py-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-muted-foreground text-sm">
                    Showing {pagination.from || (page - 1) * perPage + 1} to{" "}
                    {pagination.to || Math.min(page * perPage, pagination.total || tokens.length)}{" "}
                    of {pagination.total || tokens.length} tokens
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
                        page >= (pagination.total_pages || pagination.last_page || 1) || isLoading
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
