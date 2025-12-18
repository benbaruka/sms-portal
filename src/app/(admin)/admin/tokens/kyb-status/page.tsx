"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  CheckCircle2,
  XCircle,
  Clock,
  FileCheck,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import { useAlert } from "@/context/AlertProvider";
import { useAdminTokenKYBStatus } from "@/controller/query/admin/tokens/useAdminTokens";
import type { AdminToken } from "@/types";

type KYBFilter = "ALL" | "APPROVED" | "PENDING" | "REJECTED";
type TokenFilter = "ALL" | "ACTIVE" | "INACTIVE";

const KYB_OPTIONS: { value: KYBFilter; label: string }[] = [
  { value: "ALL", label: "All KYB status" },
  { value: "APPROVED", label: "Approved" },
  { value: "PENDING", label: "Pending" },
  { value: "REJECTED", label: "Rejected" },
];

const TOKEN_STATUS_OPTIONS: { value: TokenFilter; label: string }[] = [
  { value: "ALL", label: "All token status" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

const normalizeKybStatus = (status: string | undefined): KYBFilter => {
  const normalized = (status || "").toString().toUpperCase();
  if (["APPROVED", "VALIDATED"].includes(normalized)) return "APPROVED";
  if (["PENDING", "IN_REVIEW"].includes(normalized)) return "PENDING";
  if (["REJECTED", "DECLINED"].includes(normalized)) return "REJECTED";
  return "PENDING";
};

const normalizeTokenStatus = (status: string | undefined): TokenFilter => {
  const normalized = (status || "").toString().toUpperCase();
  if (["ACTIVE", "ENABLED"].includes(normalized)) return "ACTIVE";
  if (["INACTIVE", "REVOKED", "DISABLED"].includes(normalized)) return "INACTIVE";
  return "INACTIVE";
};

const kybBadge = (status: KYBFilter) => {
  switch (status) {
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
        <Badge variant="secondary" className="gap-1">
          {status}
        </Badge>
      );
  }
};

const tokenBadge = (status: TokenFilter) => {
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

export default function KYBStatusPage() {
  const { showAlert } = useAlert();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [kybFilter, setKybFilter] = useState<KYBFilter>("ALL");
  const [tokenFilter, setTokenFilter] = useState<TokenFilter>("ALL");
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
  } = useAdminTokenKYBStatus(
    {
      page,
      per_page: perPage,
      search: search || undefined,
      kyb_status: kybFilter !== "ALL" ? kybFilter : undefined,
      token_status: tokenFilter !== "ALL" ? tokenFilter : undefined,
    },
    apiKey,
    !!apiKey
  );

  const records = useMemo((): AdminToken[] => {
    if (!kybResponse) return [];
    const payload:
      | AdminToken[]
      | AdminToken
      | { data?: AdminToken[]; records?: AdminToken[] }
      | undefined =
      kybResponse.records ||
      kybResponse.data?.records ||
      kybResponse.data?.data ||
      kybResponse.message?.records ||
      kybResponse.message?.data ||
      kybResponse.message;
    if (Array.isArray(payload)) return payload;
    if (payload && typeof payload === "object" && "data" in payload && Array.isArray(payload.data))
      return payload.data;
    if (
      payload &&
      typeof payload === "object" &&
      "records" in payload &&
      Array.isArray(payload.records)
    )
      return payload.records;
    return [];
  }, [kybResponse]);

  const pagination = useMemo(() => {
    if (!kybResponse) return null;
    return (
      kybResponse.pagination ||
      kybResponse.data?.pagination ||
      kybResponse.message?.pagination ||
      null
    );
  }, [kybResponse]);

  const stats = useMemo(() => {
    return records.reduce(
      (
        acc: {
          total: number;
          approved: number;
          pending: number;
          rejected: number;
          tokensActive: number;
          tokensInactive: number;
        },
        record: AdminToken
      ) => {
        const kybStatus = normalizeKybStatus(
          typeof record.kyb_status === "string" ? record.kyb_status : undefined
        );
        const tokenStatus = normalizeTokenStatus(
          typeof record.token_status === "string" ? record.token_status : undefined
        );
        acc.total += 1;
        if (kybStatus === "APPROVED") acc.approved += 1;
        if (kybStatus === "PENDING") acc.pending += 1;
        if (kybStatus === "REJECTED") acc.rejected += 1;
        if (tokenStatus === "ACTIVE") acc.tokensActive += 1;
        if (tokenStatus === "INACTIVE") acc.tokensInactive += 1;
        return acc;
      },
      { total: 0, approved: 0, pending: 0, rejected: 0, tokensActive: 0, tokensInactive: 0 }
    );
  }, [records]);

  const isRefreshing = isFetching && !isLoading;

  const handleRefresh = async () => {
    try {
      await refetch();
      showAlert({
        variant: "success",
        title: "Status refreshed",
        message: "KYB status and token status synced successfully.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to refresh KYB data.";
      showAlert({
        variant: "error",
        title: "Refresh failed",
        message: errorMessage,
      });
    }
  };

  return (
    <div className="space-y-8 px-4 py-4 sm:space-y-10 sm:px-6 sm:py-6">
      <header className="rounded-3xl border border-gray-200 bg-white shadow-xl shadow-brand-500/10 dark:border-gray-900 dark:bg-gray-950">
        <div className="flex flex-col gap-6 px-6 py-6 sm:px-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 p-3 shadow-lg shadow-brand-500/40 sm:p-4">
              <FileCheck className="h-6 w-6 text-white sm:h-8 sm:w-8" />
            </div>
            <div>
              <h1 className="text-[28px] font-semibold tracking-tight text-gray-900 dark:text-white sm:text-[32px]">
                KYB & token compliance
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed dark:text-gray-300 sm:text-base">
                Track each client&apos;s KYB progress and make sure only approved tenants have
                active production tokens.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            className="h-10 w-full rounded-xl border-2 sm:h-11 sm:w-auto"
          >
            {isLoading || isRefreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Synchronisation...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Rafraîchir
              </>
            )}
          </Button>
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-4">
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <FileCheck className="h-9 w-9 rounded-xl bg-brand-500/10 p-2 text-brand-600 dark:text-brand-400" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Tracked clients
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-muted-foreground text-xs">With KYB records synced</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 className="h-9 w-9 rounded-xl bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-300" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                KYB approved
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.approved}
              </p>
              <p className="text-muted-foreground text-xs">Clients ready for live tokens</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-9 w-9 rounded-xl bg-amber-500/10 p-2 text-amber-600 dark:text-amber-300" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                KYB pending
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.pending}</p>
              <p className="text-muted-foreground text-xs">Verification in progress</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <ShieldCheck className="h-9 w-9 rounded-xl bg-blue-500/10 p-2 text-blue-600 dark:text-blue-300" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Token status
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.tokensActive} active · {stats.tokensInactive} inactive
              </p>
              <p className="text-muted-foreground text-xs">Credential posture</p>
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
                Statut KYB par client
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                Filter by validation state or token status to spot inconsistencies.
              </CardDescription>
            </div>
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
                placeholder="Search by client name or reference..."
                className="h-11 rounded-xl border-2 pl-9"
              />
            </div>
            <Select
              value={kybFilter}
              onValueChange={(value) => {
                setKybFilter(value as KYBFilter);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-11 rounded-xl border-2">
                <SelectValue placeholder="Filtrer par statut KYB" />
              </SelectTrigger>
              <SelectContent>
                {KYB_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={tokenFilter}
              onValueChange={(value) => {
                setTokenFilter(value as TokenFilter);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-11 rounded-xl border-2">
                <SelectValue placeholder="Filtrer par statut token" />
              </SelectTrigger>
              <SelectContent>
                {TOKEN_STATUS_OPTIONS.map((option) => (
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
              <p className="text-muted-foreground text-sm">Loading KYB status...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
              <FileCheck className="text-muted-foreground h-10 w-10" />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                No clients match the current filters.
              </p>
              <p className="text-muted-foreground text-sm">
                Adjust the filters or refresh the KYB data to update the list.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/80 dark:bg-gray-900/40">
                      <TableHead className="min-w-[180px]">Client</TableHead>
                      <TableHead className="min-w-[140px]">Statut KYB</TableHead>
                      <TableHead className="min-w-[140px]">Statut token</TableHead>
                      <TableHead className="min-w-[180px]">Date validation</TableHead>
                      <TableHead className="min-w-[180px]">Dernière mise à jour</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record: AdminToken) => {
                      const kybStatus = normalizeKybStatus(
                        typeof record.kyb_status === "string" ? record.kyb_status : undefined
                      );
                      const tokenStatus = normalizeTokenStatus(
                        typeof record.token_status === "string" ? record.token_status : undefined
                      );
                      return (
                        <TableRow
                          key={String(record.id ?? record.client_id ?? "")}
                          className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/30"
                        >
                          <TableCell className="font-semibold text-gray-900 dark:text-white">
                            {String(
                              record.client_name ??
                                record.client ??
                                `Client ${record.client_id ?? ""}`
                            )}
                          </TableCell>
                          <TableCell>{kybBadge(kybStatus)}</TableCell>
                          <TableCell>{tokenBadge(tokenStatus)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {record.verified_at &&
                            typeof record.verified_at === "string" &&
                            record.verified_at !== "-"
                              ? new Date(record.verified_at).toLocaleString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "En attente"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {record.updated_at && typeof record.updated_at === "string"
                              ? new Date(record.updated_at).toLocaleString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "--"}
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
                    {pagination.to || Math.min(page * perPage, pagination.total || records.length)}{" "}
                    of {pagination.total || records.length} clients
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
