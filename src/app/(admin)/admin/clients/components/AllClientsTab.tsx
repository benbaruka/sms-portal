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
import { useAlert } from "@/context/AlertProvider";
import {
  useAdminClientAccountTypes,
  useAdminClientCountries,
  useAdminClientsList,
} from "@/controller/query/admin/clients/useAdminClients";
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Globe2,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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

export default function AllClientsTab() {
  const { showAlert } = useAlert();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>("ALL");
  const [countryFilter, setCountryFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [perPage] = useState(12);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

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
    <div className="space-y-6">
      {/* Stats Cards */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <Building2 className="h-9 w-9 rounded-xl bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Total clients
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-muted-foreground text-xs">Active + inactive</p>
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
            <XCircle className="h-9 w-9 rounded-xl bg-amber-500/10 p-2 text-amber-600 dark:text-amber-300" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Inactive
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.inactive}
              </p>
              <p className="text-muted-foreground text-xs">Suspended</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <Globe2 className="h-9 w-9 rounded-xl bg-purple-500/10 p-2 text-purple-600 dark:text-purple-300" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Countries
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.countries.size}
              </p>
              <p className="text-muted-foreground text-xs">Markets covered</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Filters and Search */}
      <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="p-4 pb-4 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
                <Building2 className="h-5 w-5 text-blue-500" />
                Client Directory
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                Search and filter clients by status, account tier or geography
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading || isRefreshing}
              className="h-10 rounded-xl border-2"
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
                <SelectValue placeholder="Status" />
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
                <SelectValue placeholder="Country" />
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
        <CardContent className="p-4 pt-0 sm:p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
              <p className="text-muted-foreground text-sm">Loading clients...</p>
            </div>
          ) : clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
              <Building2 className="text-muted-foreground h-10 w-10" />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                No clients match the current filters.
              </p>
              <p className="text-muted-foreground text-sm">
                Adjust the filters to see more results.
              </p>
            </div>
          ) : (
            <>
              {/* Modern Grid Layout */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                    address?: string;
                  }) => {
                    const status = normalizeStatus(client.status);
                    const clientId = client.id || client.client_id;
                    const clientName = client.name || client.company_name || "Unnamed Client";
                    const clientEmail = client.email || "--";
                    const clientPhone = client.msisdn || client.phone || "--";
                    const accountType =
                      client.account_type_label ||
                      client.account_type_name ||
                      client.account_type ||
                      "—";
                    const country = client.country_code || client.country || "—";
                    const createdAt = client.created_at || client.created || client.createdOn;

                    return (
                      <Card
                        key={clientId || client.email}
                        className="rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-blue-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-700"
                      >
                        <CardHeader className="p-4 pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`rounded-xl p-2.5 ${
                                  status === "ACTIVE" ? "bg-emerald-500/10" : "bg-gray-500/10"
                                }`}
                              >
                                <Building2
                                  className={`h-5 w-5 ${
                                    status === "ACTIVE"
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : "text-gray-600 dark:text-gray-400"
                                  }`}
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="truncate font-semibold text-gray-900 dark:text-white">
                                  {clientName}
                                </h3>
                                <div className="mt-1">{statusBadge(status)}</div>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3 p-4 pt-0">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                              <span className="text-muted-foreground truncate">{clientEmail}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                              <span className="text-muted-foreground">{clientPhone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Briefcase className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                              <span className="text-muted-foreground truncate">{accountType}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Globe2 className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                              <span className="text-muted-foreground">{country}</span>
                            </div>
                            {createdAt && (
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                                <span className="text-muted-foreground text-xs">
                                  {new Date(createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }
                )}
              </div>

              {/* Pagination */}
              {pagination && (pagination?.total_pages || 0) > 1 && (
                <div className="mt-6 flex flex-col gap-4 border-t border-gray-200 pt-6 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
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
