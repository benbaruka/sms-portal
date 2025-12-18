"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { useAlert } from "@/context/AlertProvider";
import { useClientTokensList } from "@/controller/query/client/tokens/useClientTokens";
import type { ClientToken, PaginationInfo } from "@/types";
import {
  Copy,
  Key,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldOff,
  Calendar,
  Clock,
  Activity,
  BarChart3,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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

export default function ListTokensTab() {
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
  } = useClientTokensList(
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

  const tokens = useMemo(() => {
    if (!tokensResponse) return [];

    // Structure: { status: 200, message: { data: [...], page, pages, per_page, total } }
    // Priorité 1: message.data (structure actuelle du backend)
    if (tokensResponse.message?.data && Array.isArray(tokensResponse.message.data)) {
      return tokensResponse.message.data as ClientToken[];
    }

    // Priorité 2: data directement (si backend change de format)
    if (Array.isArray(tokensResponse.data)) {
      return tokensResponse.data as ClientToken[];
    }

    // Priorité 3: Autres structures possibles
    const payload: unknown =
      tokensResponse.tokens ||
      tokensResponse.data?.tokens ||
      tokensResponse.data?.data ||
      tokensResponse.message?.tokens ||
      tokensResponse.message;
    if (Array.isArray(payload)) return payload as ClientToken[];
    if (payload && typeof payload === "object" && "data" in payload) {
      const data = (payload as { data?: unknown }).data;
      if (Array.isArray(data)) return data as ClientToken[];
    }
    return [];
  }, [tokensResponse]);

  const pagination = useMemo(() => {
    if (!tokensResponse) return null;

    // Structure: { status: 200, message: { data: [...], page, pages, per_page, total } }
    // Priorité 1: message contient page, pages, per_page, total
    if (tokensResponse.message && typeof tokensResponse.message === "object") {
      const message = tokensResponse.message as {
        page?: number;
        pages?: number;
        per_page?: number;
        total?: number;
        pagination?: PaginationInfo;
      };

      if (message.page !== undefined || message.total !== undefined) {
        const currentPage = Number(message.page) || 1;
        const perPage = Number(message.per_page) || 10;
        const total = Number(message.total) || 0;
        const totalPages = Number(message.pages) || Math.ceil(total / perPage);

        return {
          total,
          per_page: perPage,
          current_page: currentPage,
          total_pages: totalPages,
          from: (currentPage - 1) * perPage + 1,
          to: Math.min(currentPage * perPage, total),
          last_page: totalPages,
        };
      }

      // Si pagination est dans message
      if (message.pagination) {
        return message.pagination;
      }
    }

    // Priorité 2: Structure directe { data: [...], total, page, per_page, pages }
    if (tokensResponse.total !== undefined || tokensResponse.page !== undefined) {
      const currentPage = Number(tokensResponse.page) || 1;
      const perPage = Number(tokensResponse.per_page) || 10;
      const total = Number(tokensResponse.total) || 0;
      const totalPages = Number(tokensResponse.pages) || Math.ceil(total / perPage);

      return {
        total,
        per_page: perPage,
        current_page: currentPage,
        total_pages: totalPages,
        from: (currentPage - 1) * perPage + 1,
        to: Math.min(currentPage * perPage, total),
        last_page: totalPages,
      };
    }

    // Priorité 3: Autres structures possibles
    return tokensResponse.pagination || tokensResponse.data?.pagination || null;
  }, [tokensResponse]);

  const isRefreshing = isFetching && !isLoading;

  const handleRefresh = async () => {
    try {
      await refetch();
      showAlert({
        variant: "success",
        title: "Tokens refreshed",
        message: "The latest token list has been loaded successfully.",
      });
    } catch (error) {
      showAlert({
        variant: "error",
        title: "Refresh failed",
        message: error instanceof Error ? error.message : "Unable to refresh the token list.",
      });
    }
  };

  const handleCopy = (text: string | number | undefined, label: string = "Token ID") => {
    if (text === undefined || text === null) return;
    const textToCopy = String(text);
    navigator.clipboard.writeText(textToCopy);
    showAlert({
      variant: "success",
      title: "Copied",
      message: `${label} copied to clipboard.`,
    });
  };

  return (
    <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
      <CardHeader className="p-4 pb-2 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
              <Key className="h-5 w-5 text-brand-500" />
              My Tokens
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              View and manage all your API tokens. Search and filter to find specific tokens.
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-gray-600 dark:text-gray-300" />
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
            <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 dark:text-gray-400" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search by name or token..."
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
            <Loader2 className="h-10 w-10 animate-spin text-brand-500 dark:text-brand-400" />
            <p className="text-muted-foreground text-sm">Loading tokens...</p>
          </div>
        ) : tokens.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
            <Key className="text-muted-foreground h-10 w-10" />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">No tokens found.</p>
            <p className="text-muted-foreground text-sm">
              Create your first live token to get started.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-900/50">
                    <TableHead className="min-w-[140px] font-semibold text-gray-900 dark:text-white">
                      Token
                    </TableHead>
                    <TableHead className="min-w-[120px] font-semibold text-gray-900 dark:text-white">
                      Type
                    </TableHead>
                    <TableHead className="min-w-[180px] font-semibold text-gray-900 dark:text-white">
                      Name
                    </TableHead>
                    <TableHead className="min-w-[100px] font-semibold text-gray-900 dark:text-white">
                      Status
                    </TableHead>
                    <TableHead className="min-w-[140px] font-semibold text-gray-900 dark:text-white">
                      Usage
                    </TableHead>
                    <TableHead className="min-w-[160px] font-semibold text-gray-900 dark:text-white">
                      Created
                    </TableHead>
                    <TableHead className="min-w-[160px] font-semibold text-gray-900 dark:text-white">
                      Last Used
                    </TableHead>
                    <TableHead className="min-w-[120px] text-right font-semibold text-gray-900 dark:text-white">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tokens.map((token: ClientToken) => {
                    // Backend structure: { token_id, token_name, token_type, status, created, ... }
                    const tokenId = token.token_id ?? token.id;
                    const status = normalizeStatus(token.status);
                    const type =
                      (token.token_type || token.type || "").toString().toUpperCase() || "—";
                    const tokenName = token.token_name || token.label || "—";
                    const createdDate = token.created || token.created_at || token.createdOn;
                    const lastUsed = token.last_used_at;
                    const usageCount = token.usage_count ?? 0;
                    const smsLimit = token.sms_limit;
                    const smsUsed = token.sms_used ?? 0;
                    const smsRemaining =
                      smsLimit !== undefined && smsLimit !== null ? smsLimit - smsUsed : null;

                    // Le token n'est pas retourné dans la liste pour des raisons de sécurité
                    // On affiche juste l'ID du token avec un design amélioré
                    const tokenDisplay = tokenId ? `#${String(tokenId).padStart(6, "0")}` : "—";

                    return (
                      <TableRow
                        key={String(tokenId ?? token.id ?? "")}
                        className="group border-b border-gray-200 transition-all hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent dark:border-gray-800 dark:hover:from-gray-900/50 dark:hover:to-transparent"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/10 to-brand-600/10 dark:from-brand-500/20 dark:to-brand-600/20">
                              <Key className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                            </div>
                            <div>
                              <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                                {tokenDisplay}
                              </p>
                              <p className="text-muted-foreground text-xs">API Token</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={type === "LIVE" ? "default" : "secondary"}
                            className={`${
                              type === "LIVE"
                                ? "bg-blue-500 text-white hover:bg-blue-600"
                                : "bg-gray-500 text-white hover:bg-gray-600"
                            } font-semibold uppercase`}
                          >
                            {type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-gray-900 dark:text-white">{tokenName}</p>
                        </TableCell>
                        <TableCell>{statusBadge(status)}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {usageCount > 0 ? (
                              <div className="flex items-center gap-2">
                                <Activity className="text-muted-foreground h-3.5 w-3.5" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {usageCount.toLocaleString()}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">Not used yet</span>
                            )}
                            {smsLimit !== undefined && smsLimit !== null && (
                              <div className="flex items-center gap-2">
                                <BarChart3 className="text-muted-foreground h-3.5 w-3.5" />
                                <span className="text-muted-foreground text-xs">
                                  {smsUsed.toLocaleString()} / {smsLimit.toLocaleString()} SMS
                                </span>
                              </div>
                            )}
                            {smsLimit === null && (
                              <span className="text-xs text-emerald-600 dark:text-emerald-400">
                                Unlimited SMS
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {createdDate ? (
                            <div className="flex items-center gap-2">
                              <Calendar className="text-muted-foreground h-3.5 w-3.5" />
                              <span className="text-muted-foreground text-sm">
                                {new Date(String(createdDate)).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {lastUsed && typeof lastUsed === "string" ? (
                            <div className="flex items-center gap-2">
                              <Clock className="text-muted-foreground h-3.5 w-3.5" />
                              <span className="text-muted-foreground text-sm">
                                {new Date(lastUsed).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs italic">Never used</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {tokenId ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-xl transition-all hover:bg-brand-500/10 hover:text-brand-600 dark:hover:bg-brand-500/20 dark:hover:text-brand-400"
                                onClick={() => handleCopy(tokenId, "Token ID")}
                                title="Copy Token ID"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
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
                  {pagination.to || Math.min(page * perPage, pagination.total || tokens.length)} of{" "}
                  {pagination.total || tokens.length} tokens
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
  );
}
