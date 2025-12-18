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
import { Loader2, Building2, RefreshCw, Search, Plus, Briefcase, Globe2 } from "lucide-react";
import { useAlert } from "@/context/AlertProvider";
import {
  useAdminClientAccountTypes,
  useAdminClientsList,
  useAdminClientCountries,
} from "@/controller/query/admin/clients/useAdminClients";

type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All status" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

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
        Active
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="gap-1">
      Inactive
    </Badge>
  );
};

export default function AllClientsPage() {
  const { showAlert } = useAlert();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>("ALL");
  const [countryFilter, setCountryFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const { data: accountTypesData } = useAdminClientAccountTypes(apiKey, !!apiKey);

  const { data: countriesData } = useAdminClientCountries(apiKey, !!apiKey);

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
      account_type: accountTypeFilter !== "ALL" ? accountTypeFilter : undefined,
      country_code: countryFilter !== "ALL" ? countryFilter : undefined,
    },
    apiKey,
    !!apiKey
  );

  const clients = useMemo(() => {
    if (!clientsResponse) return [];
    const payload: unknown =
      clientsResponse.clients ||
      (clientsResponse as { data?: { clients?: unknown[]; data?: unknown[] } }).data?.clients ||
      (clientsResponse as { data?: { data?: unknown[] } }).data?.data ||
      (clientsResponse as { message?: { clients?: unknown[]; data?: unknown[] } }).message
        ?.clients ||
      (clientsResponse as { message?: { data?: unknown[] } }).message?.data ||
      (clientsResponse as { message?: unknown }).message;
    if (Array.isArray(payload)) return payload;
    if (payload && typeof payload === "object" && "data" in payload && Array.isArray(payload.data))
      return payload.data;
    return [];
  }, [clientsResponse]);

  const pagination = useMemo(() => {
    if (!clientsResponse) return null;
    return (
      clientsResponse.pagination ||
      clientsResponse.data?.pagination ||
      clientsResponse.message?.pagination ||
      null
    );
  }, [clientsResponse]);

  const accountTypeOptions = useMemo(() => {
    const source = accountTypesData?.data || accountTypesData?.message || [];
    return Array.isArray(source) ? source : [];
  }, [accountTypesData]);

  const countryOptions = useMemo(() => {
    const source = countriesData?.data || countriesData?.message || [];
    return Array.isArray(source) ? source : [];
  }, [countriesData]);

  const stats = useMemo(() => {
    return clients.reduce(
      (
        acc: {
          total: number;
          active: number;
          inactive: number;
          accounts: Set<string>;
          countries: Set<string>;
        },
        client: { status?: number | string; account_type?: string; country_code?: string }
      ) => {
        const status = normalizeStatus(client.status);
        acc.total += 1;
        if (status === "ACTIVE") acc.active += 1;
        if (status === "INACTIVE") acc.inactive += 1;
        if (client.account_type) acc.accounts.add(String(client.account_type));
        if (client.country_code) acc.countries.add(String(client.country_code));
        return acc;
      },
      {
        total: 0,
        active: 0,
        inactive: 0,
        accounts: new Set<string>(),
        countries: new Set<string>(),
      }
    );
  }, [clients]);

  const isRefreshing = isFetching && !isLoading;

  const handleRefresh = async () => {
    try {
      await refetch();
      showAlert({
        variant: "success",
        title: "Clients refreshed",
        message: "The latest client directory has been loaded successfully.",
      });
    } catch (error: unknown) {
      showAlert({
        variant: "error",
        title: "Refresh failed",
        message: error instanceof Error ? error.message : "Unable to refresh the clients list.",
      });
    }
  };

  return (
    <div className="space-y-8 px-4 py-4 sm:space-y-10 sm:px-6 sm:py-6">
      <header className="rounded-3xl border border-gray-200 bg-white shadow-xl shadow-brand-500/10 dark:border-gray-900 dark:bg-gray-950">
        <div className="flex flex-col gap-6 px-6 py-6 sm:px-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 p-3 shadow-lg shadow-brand-500/40 sm:p-4">
              <Building2 className="h-6 w-6 text-white sm:h-8 sm:w-8" />
            </div>
            <div>
              <h1 className="text-[28px] font-semibold tracking-tight text-gray-900 dark:text-white sm:text-[32px]">
                Client Portfolio Overview
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed dark:text-gray-300 sm:text-base">
                Audit every customer account connected to the SMS platform. Filter by status,
                account tier or geography and open a profile in seconds.
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
            <Link href="/admin/clients/create" className="w-full sm:w-auto">
              <Button className="h-10 w-full rounded-xl sm:h-11 sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Create client
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-4">
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <Building2 className="h-9 w-9 rounded-xl bg-brand-500/10 p-2 text-brand-600 dark:text-brand-400" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Total clients
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-muted-foreground text-xs">Active + inactive accounts</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <Briefcase className="h-9 w-9 rounded-xl bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-300" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Active
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.active}</p>
              <p className="text-muted-foreground text-xs">Billing-enabled tenants</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <Briefcase className="h-9 w-9 rounded-xl bg-amber-500/10 p-2 text-amber-600 dark:text-amber-300" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Inactive
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.inactive}
              </p>
              <p className="text-muted-foreground text-xs">Awaiting reactivation</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <Globe2 className="h-9 w-9 rounded-xl bg-blue-500/10 p-2 text-blue-600 dark:text-blue-300" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Markets covered
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.countries.size}
              </p>
              <p className="text-muted-foreground text-xs">Unique country codes</p>
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
                Manage client directory
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                Search by legal name or email, then combine filters to target account tier or
                geography.
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
          <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
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
              value={accountTypeFilter}
              onValueChange={(value) => {
                setAccountTypeFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-11 rounded-xl border-2">
                <SelectValue placeholder="Account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All tiers</SelectItem>
                {accountTypeOptions.map(
                  (type: {
                    id?: number | string;
                    code?: string;
                    name?: string;
                    label?: string;
                  }) => (
                    <SelectItem
                      key={String(type.id ?? type.code ?? type.name)}
                      value={String(type.id ?? type.code ?? type.name)}
                    >
                      {type.name || type.label || type.code || `Type ${type.id}`}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            <Select
              value={countryFilter}
              onValueChange={(value) => {
                setCountryFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-11 rounded-xl border-2">
                <SelectValue placeholder="Country code" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All countries</SelectItem>
                {countryOptions.map(
                  (country: { code?: string; dial_code?: string; name?: string }) => (
                    <SelectItem
                      key={country.code ?? country.dial_code ?? country.name}
                      value={String(country.code ?? country.dial_code ?? country.name)}
                    >
                      {country.code || country.dial_code || country.name}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
              <p className="text-muted-foreground text-sm">Loading clients...</p>
            </div>
          ) : clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
              <Building2 className="text-muted-foreground h-10 w-10" />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                No clients match the current filters.
              </p>
              <p className="text-muted-foreground text-sm">
                Adjust the filters or create a new client to populate the directory.
              </p>
              <Link href="/admin/clients/create">
                <Button className="mt-2 rounded-xl">
                  <Plus className="mr-2 h-4 w-4" />
                  Create client
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/80 dark:bg-gray-900/40">
                      <TableHead className="min-w-[160px]">Client name</TableHead>
                      <TableHead className="min-w-[180px]">Email</TableHead>
                      <TableHead className="min-w-[140px]">Phone</TableHead>
                      <TableHead className="min-w-[140px]">Account type</TableHead>
                      <TableHead className="min-w-[120px]">Country</TableHead>
                      <TableHead className="min-w-[120px]">Status</TableHead>
                      <TableHead className="min-w-[160px]">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map(
                      (client: {
                        id?: number;
                        client_id?: number;
                        email?: string;
                        status?: number | string;
                        name?: string;
                        company_name?: string;
                        msisdn?: string;
                        phone?: string;
                        account_type_label?: string;
                        account_type_name?: string;
                        account_type?: string;
                        country_code?: string;
                        country?: string;
                        created_at?: string;
                        created?: string;
                        createdOn?: string;
                      }) => {
                        const status = normalizeStatus(client.status);
                        return (
                          <TableRow
                            key={client.id || client.client_id || client.email}
                            className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/30"
                          >
                            <TableCell className="font-semibold text-gray-900 dark:text-white">
                              {client.name || client.company_name || "--"}
                            </TableCell>
                            <TableCell className="text-gray-900 dark:text-gray-100">
                              {client.email || "--"}
                            </TableCell>
                            <TableCell className="text-muted-foreground dark:text-gray-300">
                              {client.msisdn || client.phone || "--"}
                            </TableCell>
                            <TableCell className="text-muted-foreground dark:text-gray-300">
                              {client.account_type_label ||
                                client.account_type_name ||
                                client.account_type ||
                                "—"}
                            </TableCell>
                            <TableCell className="text-muted-foreground dark:text-gray-300">
                              {client.country_code || client.country || "—"}
                            </TableCell>
                            <TableCell>{statusBadge(status)}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {client.created_at || client.created || client.createdOn
                                ? new Date(
                                    (client.created_at ||
                                      client.created ||
                                      client.createdOn) as string
                                  ).toLocaleString("en-US", {
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
                      }
                    )}
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
