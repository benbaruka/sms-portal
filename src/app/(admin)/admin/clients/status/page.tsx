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
  Building2,
  RefreshCw,
  Search,
  ToggleLeft,
  ToggleRight,
  Shield,
  CheckCircle2,
  XCircle,
  Ban,
} from "lucide-react";
import { useAlert } from "@/context/AlertProvider";
import {
  useAdminClientsList,
  useChangeAdminClientStatus,
} from "@/controller/query/admin/clients/useAdminClients";
import type { AdminClient, PaginationInfo } from "@/types";

type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

const normalizeStatus = (status: number | string | undefined): StatusFilter => {
  if (typeof status === "number") {
    return status === 1 ? "ACTIVE" : "INACTIVE";
  }
  const normalized = (status || "").toString().toUpperCase();
  if (["ACTIVE", "ENABLED", "APPROVED"].includes(normalized)) return "ACTIVE";
  if (["INACTIVE", "DISABLED", "SUSPENDED", "BLOCKED"].includes(normalized)) return "INACTIVE";
  return "INACTIVE";
};

const statusBadge = (status: StatusFilter) => {
  if (status === "ACTIVE") {
    return (
      <Badge variant="default" className="gap-1 bg-emerald-500 text-white">
        <CheckCircle2 className="h-3 w-3" />
        Active
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="gap-1">
      <XCircle className="h-3 w-3" />
      Inactive
    </Badge>
  );
};

export default function ClientStatusPage() {
  const { showAlert } = useAlert();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const {
    data: clientsResponse,
    isLoading,
    isFetching,
    refetch,
  } = useAdminClientsList(
    {
      page,
      per_page: perPage,
      search: search || undefined,
      status: statusFilter !== "ALL" ? statusFilter : undefined,
    },
    apiKey,
    !!apiKey
  );

  const changeStatusMutation = useChangeAdminClientStatus();

  const clients = useMemo((): AdminClient[] => {
    if (!clientsResponse) return [];
    const payload:
      | AdminClient[]
      | AdminClient
      | { data?: AdminClient[]; clients?: AdminClient[] }
      | undefined =
      clientsResponse.clients ||
      clientsResponse.data?.clients ||
      clientsResponse.data?.data ||
      clientsResponse.message?.clients ||
      clientsResponse.message?.data ||
      clientsResponse.message;
    if (Array.isArray(payload)) return payload;
    if (payload && typeof payload === "object" && "data" in payload && Array.isArray(payload.data))
      return payload.data;
    if (
      payload &&
      typeof payload === "object" &&
      "clients" in payload &&
      Array.isArray(payload.clients)
    )
      return payload.clients;
    return [];
  }, [clientsResponse]);

  const pagination = useMemo((): PaginationInfo | null => {
    if (!clientsResponse) return null;
    return (
      clientsResponse.pagination ||
      clientsResponse.data?.pagination ||
      clientsResponse.message?.pagination ||
      null
    );
  }, [clientsResponse]);

  const stats = useMemo(() => {
    return clients.reduce(
      (acc: { total: number; active: number; inactive: number }, client: AdminClient) => {
        const status = normalizeStatus(client.status);
        acc.total += 1;
        if (status === "ACTIVE") acc.active += 1;
        if (status === "INACTIVE") acc.inactive += 1;
        return acc;
      },
      { total: 0, active: 0, inactive: 0 }
    );
  }, [clients]);

  const isRefreshing = isFetching && !isLoading;

  const handleRefresh = async () => {
    try {
      await refetch();
      showAlert({
        variant: "success",
        title: "Status refreshed",
        message: "Client statuses synced successfully with the directory.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to refresh the clients status.";
      showAlert({
        variant: "error",
        title: "Refresh failed",
        message: errorMessage,
      });
    }
  };

  const handleStatusToggle = async (client: AdminClient) => {
    if (!apiKey) {
      showAlert({
        variant: "error",
        title: "Missing API key",
        message: "Please sign in again to change client statuses.",
      });
      return;
    }
    const currentStatus = normalizeStatus(client.status);
    const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const clientId = (client.id ?? client.client_id ?? client.email) as
        | string
        | number
        | undefined;
      if (!clientId) return;
      await changeStatusMutation.mutateAsync({
        data: {
          client_id: clientId,
          status: nextStatus,
        },
        apiKey,
      });
      await refetch();
    } catch {
      // Alert handled by mutation
    }
  };

  return (
    <div className="space-y-8 px-4 py-4 sm:space-y-10 sm:px-6 sm:py-6">
      <header className="rounded-3xl border border-gray-200 bg-white shadow-xl shadow-brand-500/10 dark:border-gray-900 dark:bg-gray-950">
        <div className="flex flex-col gap-6 px-6 py-6 sm:px-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 p-3 shadow-lg shadow-brand-500/40 sm:p-4">
              <Shield className="h-6 w-6 text-white sm:h-8 sm:w-8" />
            </div>
            <div>
              <h1 className="text-[28px] font-semibold tracking-tight text-gray-900 dark:text-white sm:text-[32px]">
                Control client access status
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed dark:text-gray-300 sm:text-base">
                Quickly activate or suspend tenants based on compliance or billing requirements.
                Search by name or email and confirm changes instantly.
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
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh list
              </>
            )}
          </Button>
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <Building2 className="h-9 w-9 rounded-xl bg-brand-500/10 p-2 text-brand-600 dark:text-brand-400" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Total monitored
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-muted-foreground text-xs">Clients loaded in this view</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 className="h-9 w-9 rounded-xl bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-300" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Active
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.active}</p>
              <p className="text-muted-foreground text-xs">Live tenants</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <Ban className="h-9 w-9 rounded-xl bg-amber-500/10 p-2 text-amber-600 dark:text-amber-300" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Inactive
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.inactive}
              </p>
              <p className="text-muted-foreground text-xs">Suspended or paused</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="p-4 pb-2 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
                <Building2 className="h-5 w-5 text-brand-500" />
                Client status console
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                Search by company name, email or phone. Use quick filters to isolate blocked
                tenants.
              </CardDescription>
            </div>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="relative">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by client name, email or phone..."
                className="h-11 rounded-xl border-2 pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "ALL" ? "default" : "outline"}
                className="h-11 flex-1 rounded-xl border-2"
                onClick={() => {
                  setStatusFilter("ALL");
                  setPage(1);
                }}
              >
                All
              </Button>
              <Button
                variant={statusFilter === "ACTIVE" ? "default" : "outline"}
                className="h-11 flex-1 rounded-xl border-2"
                onClick={() => {
                  setStatusFilter("ACTIVE");
                  setPage(1);
                }}
              >
                Active
              </Button>
              <Button
                variant={statusFilter === "INACTIVE" ? "default" : "outline"}
                className="h-11 flex-1 rounded-xl border-2"
                onClick={() => {
                  setStatusFilter("INACTIVE");
                  setPage(1);
                }}
              >
                Inactive
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
              <p className="text-muted-foreground text-sm">Loading client statuses...</p>
            </div>
          ) : clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
              <Building2 className="text-muted-foreground h-10 w-10" />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                No clients match the current filters.
              </p>
              <p className="text-muted-foreground text-sm">
                Try broadening the search or refreshing to load the latest directory data.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/80 dark:bg-gray-900/40">
                      <TableHead className="min-w-[180px]">Client name</TableHead>
                      <TableHead className="min-w-[200px]">Email</TableHead>
                      <TableHead className="min-w-[160px]">Phone</TableHead>
                      <TableHead className="min-w-[140px]">Status</TableHead>
                      <TableHead className="min-w-[180px]">Created</TableHead>
                      <TableHead className="min-w-[150px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client: AdminClient) => {
                      const status = normalizeStatus(client.status);
                      return (
                        <TableRow
                          key={String(client.id ?? client.client_id ?? client.email ?? "")}
                          className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/30"
                        >
                          <TableCell className="font-semibold text-gray-900 dark:text-white">
                            {String(client.name ?? client.company_name ?? "--")}
                          </TableCell>
                          <TableCell className="text-gray-900 dark:text-gray-100">
                            {String(client.email ?? "--")}
                          </TableCell>
                          <TableCell className="text-muted-foreground dark:text-gray-300">
                            {String(client.msisdn ?? client.phone ?? "—")}
                          </TableCell>
                          <TableCell>{statusBadge(status)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {client.created_at || client.created || client.createdOn
                              ? new Date(
                                  String(
                                    client.created_at ?? client.created ?? client.createdOn ?? ""
                                  )
                                ).toLocaleString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "--"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              className="rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-800"
                              disabled={changeStatusMutation.isPending || isRefreshing}
                              onClick={() => handleStatusToggle(client)}
                            >
                              {status === "ACTIVE" ? (
                                <>
                                  <ToggleLeft className="mr-2 h-4 w-4" />
                                  Suspend
                                </>
                              ) : (
                                <>
                                  <ToggleRight className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </Button>
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
                    {pagination.to || Math.min(page * perPage, pagination.total || clients.length)}{" "}
                    of {pagination.total || clients.length} clients
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
