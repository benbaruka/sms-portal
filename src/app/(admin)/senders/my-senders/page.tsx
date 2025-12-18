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
  Hash,
  RefreshCw,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAlert } from "@/context/AlertProvider";
import { useAuth } from "@/context/AuthProvider";
import { useClientSenderIdsList } from "@/controller/query/senders/useSenders";
import { isSuperAdmin as isSuperAdminUtil } from "@/utils/userUtils";

type NormalizedSender = {
  id: number | string;
  code: string;
  description?: string;
  connector?: string;
  connectorId?: number;
  status: string;
  createdAt?: string;
};

const STATUS_FILTERS = [
  { value: "ALL", label: "All status" },
  { value: "APPROVED", label: "Approved" },
  { value: "PENDING", label: "Pending" },
  { value: "REJECTED", label: "Rejected" },
  { value: "INACTIVE", label: "Inactive" },
];

const statusIcons: Record<string, React.ReactElement> = {
  APPROVED: <CheckCircle2 className="h-3 w-3" />,
  PENDING: <Clock className="h-3 w-3" />,
  REJECTED: <XCircle className="h-3 w-3" />,
  INACTIVE: <Clock className="h-3 w-3" />,
};

const normalizeStatus = (status: string | number | undefined) => {
  if (typeof status === "number") {
    switch (status) {
      case 1:
        return "APPROVED";
      case 0:
        return "PENDING";
      case 2:
        return "REJECTED";
      default:
        return "INACTIVE";
    }
  }
  const normalized = (status || "").toString().toUpperCase();
  if (["APPROVED", "ACTIVE", "ENABLED"].includes(normalized)) return "APPROVED";
  if (["PENDING", "IN_REVIEW", "PROCESSING"].includes(normalized)) return "PENDING";
  if (["REJECTED", "DECLINED"].includes(normalized)) return "REJECTED";
  return normalized || "INACTIVE";
};

const getStatusBadge = (status: string) => {
  const icon = statusIcons[status];
  switch (status) {
    case "APPROVED":
      return (
        <Badge variant="default" className="gap-1 bg-emerald-500 text-white">
          {icon}
          Approved
        </Badge>
      );
    case "PENDING":
      return (
        <Badge variant="secondary" className="gap-1">
          {icon}
          Pending
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge variant="destructive" className="gap-1">
          {icon}
          Rejected
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="gap-1">
          {icon}
          {status.charAt(0) + status.slice(1).toLowerCase()}
        </Badge>
      );
  }
};

export default function MySendersPage() {
  const { showAlert } = useAlert();
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Check if user is admin (super admin: account_type === "root" OR id === 1)
  const isAdmin = useMemo(() => {
    return isSuperAdminUtil(user?.message?.client);
  }, [user]);

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const {
    data: senderList,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useClientSenderIdsList({}, apiKey, !!apiKey);

  const normalizedSenders: NormalizedSender[] = useMemo(() => {
    if (!senderList) return [];
    const payloadObj = senderList as { message?: unknown[]; data?: unknown[] };
    const payload = payloadObj.message || payloadObj.data || [];
    return payload.map((item: unknown) => {
      const itemObj = item as {
        id?: number | string;
        code?: string;
        sender_id?: string;
        description?: string;
        use_case?: string;
        connector_name?: string;
        connector?: string;
        connectors?: Array<{ name?: string; id?: number }>;
        connector_id?: number;
        status?: string | number;
        created?: string;
        created_at?: string;
        createdAt?: string;
        created_on?: string;
      };
      return {
        id: itemObj.id ?? itemObj.code ?? crypto.randomUUID(),
        code: (itemObj.code || itemObj.sender_id || "").toString(),
        description: itemObj.description || itemObj.use_case || "--",
        connector: itemObj.connector_name || itemObj.connector || itemObj.connectors?.[0]?.name,
        connectorId: itemObj.connector_id || itemObj.connectors?.[0]?.id,
        status: normalizeStatus(itemObj.status),
        createdAt: itemObj.created || itemObj.created_at || itemObj.createdAt || itemObj.created_on,
      };
    });
  }, [senderList]);

  const stats = useMemo(() => {
    return normalizedSenders.reduce(
      (acc, sender) => {
        acc.total += 1;
        if (sender.status === "APPROVED") acc.approved += 1;
        if (sender.status === "PENDING") acc.pending += 1;
        if (sender.status === "REJECTED") acc.rejected += 1;
        acc.connectors.add(sender.connector || "Unassigned");
        return acc;
      },
      {
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        connectors: new Set<string>(),
      }
    );
  }, [normalizedSenders]);

  const filteredSenders = useMemo(() => {
    return normalizedSenders.filter((sender) => {
      const matchesSearch =
        !search.trim() ||
        sender.code.toLowerCase().includes(search.toLowerCase()) ||
        (sender.description || "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || sender.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [normalizedSenders, search, statusFilter]);

  const handleRefresh = async () => {
    try {
      await refetch();
      showAlert({
        variant: "success",
        title: "Sender IDs updated",
        message: "Latest sender IDs have been synced successfully.",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unable to refresh sender IDs.";
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
      <section className="grid gap-4 xl:grid-cols-4">
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <Hash className="h-9 w-9 rounded-xl bg-brand-500/10 p-2 text-brand-600 dark:text-brand-400" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide dark:text-gray-400">
                Total senders
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-muted-foreground text-xs dark:text-gray-400">
                Active and pending identities
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 className="h-9 w-9 rounded-xl bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-300" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide dark:text-gray-400">
                Approved
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.approved}
              </p>
              <p className="text-muted-foreground text-xs dark:text-gray-400">
                Live across operators
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-9 w-9 rounded-xl bg-amber-500/10 p-2 text-amber-600 dark:text-amber-300" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide dark:text-gray-400">
                Pending review
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.pending}</p>
              <p className="text-muted-foreground text-xs dark:text-gray-400">
                Awaiting compliance approval
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <ShieldCheck className="h-9 w-9 rounded-xl bg-blue-500/10 p-2 text-blue-600 dark:text-blue-300" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide dark:text-gray-400">
                Available connectors
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.connectors.size}
              </p>
              <p className="text-muted-foreground text-xs dark:text-gray-400">
                Operators linked to your IDs
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error instanceof Error ? error.message : "Unable to load sender IDs at the moment."}
        </div>
      )}

      <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="p-4 pb-2 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
                <Sparkles className="h-5 w-5 text-brand-500" />
                Sender ID inventory
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm dark:text-gray-400">
                Filter by status, search by name and monitor the operators tied to every sender ID.
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
          <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="relative">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 dark:text-gray-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search sender IDs or descriptions..."
                className="h-11 rounded-xl border-2 pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
              <SelectTrigger className="h-11 rounded-xl border-2">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((option) => (
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
              <p className="text-muted-foreground text-sm dark:text-gray-400">
                Loading sender IDs...
              </p>
            </div>
          ) : filteredSenders.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
              <Hash className="text-muted-foreground h-10 w-10 dark:text-gray-400" />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                No sender IDs match your filters.
              </p>
              <p className="text-muted-foreground text-sm dark:text-gray-400">
                Try adjusting your search
                {isAdmin ? " or request a new sender ID to get started" : ""}.
              </p>
              {isAdmin && (
                <Link href="/senders?tab=create">
                  <Button className="mt-2 rounded-xl">
                    <Plus className="mr-2 h-4 w-4" />
                    Request sender ID
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                    <TableHead className="min-w-[100px] font-semibold text-gray-900 dark:text-white">
                      Sender ID
                    </TableHead>
                    <TableHead className="min-w-[160px] font-semibold text-gray-900 dark:text-white">
                      Description
                    </TableHead>
                    <TableHead className="min-w-[140px] font-semibold text-gray-900 dark:text-white">
                      Connector
                    </TableHead>
                    <TableHead className="min-w-[140px] font-semibold text-gray-900 dark:text-white">
                      Status
                    </TableHead>
                    <TableHead className="min-w-[160px] font-semibold text-gray-900 dark:text-white">
                      Created
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSenders.map((sender) => (
                    <TableRow
                      key={sender.id}
                      className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <TableCell className="font-semibold text-gray-900 dark:text-white">
                        {sender.code}
                      </TableCell>
                      <TableCell className="text-muted-foreground dark:text-gray-300">
                        {sender.description || "--"}
                      </TableCell>
                      <TableCell className="text-gray-900 dark:text-gray-100">
                        {sender.connector || "—"}
                      </TableCell>
                      <TableCell>{getStatusBadge(sender.status)}</TableCell>
                      <TableCell className="text-muted-foreground dark:text-gray-400">
                        {sender.createdAt
                          ? new Date(sender.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "--"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
