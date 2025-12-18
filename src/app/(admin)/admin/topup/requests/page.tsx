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
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
} from "lucide-react";
import { useAlert } from "@/context/AlertProvider";
import Link from "next/link";
import { useGetManualTopupRequests } from "@/controller/query/topup/useTopup";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import type { ManualTopupRequest, PaginationInfo } from "@/types";

export default function TopupRequestsPage() {
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

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "completed":
      case "success":
        return (
          <Badge variant="default" className="bg-green-500 text-white">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        );
      case "pending":
      case "processing":
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case "rejected":
      case "failed":
      case "error":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status || "Unknown"}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
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
    await refetch();
    showAlert({
      variant: "success",
      title: "Success",
      message: "Top-up requests refreshed successfully!",
    });
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            All Top-up Requests
          </h1>
          <p className="text-muted-foreground mt-1 dark:text-gray-400">
            View and manage all top-up requests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleRefresh} disabled={isLoading} variant="outline">
            {isLoading ? (
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
          <Link href="/admin/topup/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Request
            </Button>
          </Link>
        </div>
      </div>

      <Card className="border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <CreditCard className="h-5 w-5 text-brand-500" />
            Top-up Requests
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            A list of all top-up requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center gap-4">
            <div className="relative max-w-sm flex-1">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                placeholder="Search by invoice number, description, client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                Loading top-up requests...
              </span>
            </div>
          ) : (
            <>
              <div className="rounded-md border border-gray-200 dark:border-gray-800">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Currency</TableHead>
                      <TableHead>Connector</TableHead>
                      <TableHead>Invoice Number</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-muted-foreground py-8 text-center dark:text-gray-400"
                        >
                          No top-up requests found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRequests.map((request: ManualTopupRequest) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium text-gray-900 dark:text-white">
                            {request.id}
                          </TableCell>
                          <TableCell className="text-gray-900 dark:text-gray-100">
                            {formatCurrency(request.amount || 0, request.currency || "USD")}
                          </TableCell>
                          <TableCell className="text-gray-900 dark:text-gray-100">
                            {request.currency || "USD"}
                          </TableCell>
                          <TableCell className="text-gray-900 dark:text-gray-100">
                            {request.connector_name || `Connector ${request.connector_id || "N/A"}`}
                          </TableCell>
                          <TableCell className="text-gray-900 dark:text-gray-100">
                            {request.invoice_number || "N/A"}
                          </TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell className="text-muted-foreground dark:text-gray-400">
                            {formatDate(request.created_at || "")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(request.id)}
                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                              >
                                <Eye className="mr-1 h-4 w-4" />
                                View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {pagination && (pagination.total_pages ?? 0) > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {pagination.from ?? 0} to {pagination.to ?? 0} of{" "}
                    {pagination.total ?? 0} requests
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page <= 1 || isLoading}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= (pagination.total_pages ?? 1) || isLoading}
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
