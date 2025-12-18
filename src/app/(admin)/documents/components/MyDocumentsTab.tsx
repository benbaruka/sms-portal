"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useGetMyDocuments } from "@/controller/query/documents/useDocuments";
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
  FileText,
  RefreshCw,
  Search,
  Upload,
  Eye,
  Download,
  Clock,
  ShieldCheck,
  FolderOpen,
  CheckCircle2,
  XCircle,
  FileWarning,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAlert } from "@/context/AlertProvider";
import { useRouter } from "next/navigation";

type StatusFilter = "ALL" | "APPROVED" | "PENDING" | "REJECTED";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All status" },
  { value: "APPROVED", label: "Approved" },
  { value: "PENDING", label: "Pending" },
  { value: "REJECTED", label: "Rejected" },
];

const statusBadge = (status: string | undefined) => {
  const normalized = (status || "").toString().toUpperCase();
  switch (normalized) {
    case "APPROVED":
    case "1":
      return (
        <Badge variant="default" className="gap-1 bg-emerald-500 text-white">
          <CheckCircle2 className="h-3 w-3" />
          Approved
        </Badge>
      );
    case "REJECTED":
    case "2":
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>
      );
    case "PENDING":
    case "0":
    default:
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
  }
};

export default function MyDocumentsTab() {
  const { showAlert } = useAlert();
  const router = useRouter();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [viewingDocument, setViewingDocument] = useState<{
    id?: number | string;
    document_name?: string;
    document_number?: string;
    document_type?: string;
    document_type_name?: string;
    document_path?: string;
    created?: string;
    created_at?: string;
    status?: string;
    [key: string]: unknown;
  } | null>(null);

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const {
    data: documentsData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetMyDocuments(
    { page, per_page: perPage, search, sort: "ced.id", order: "desc" },
    apiKey || "",
    !!apiKey
  );

  const { documents, pagination } = useMemo(() => {
    if (!documentsData) return { documents: [], pagination: null };

    const response = documentsData as Record<string, unknown>;

    let docsList: unknown[] = [];
    let paginationData: {
      current_page?: number;
      per_page?: number;
      total?: number;
      total_pages?: number;
      last_page?: number;
      from?: number;
      to?: number;
    } | null = null;

    if (response.total !== undefined || response.current_page !== undefined) {
      docsList = (response.data as unknown[]) || [];
      paginationData = {
        current_page: (response.current_page as number) || 1,
        per_page: (response.per_page as number) || 10,
        total: (response.total as number) || 0,
        total_pages: (response.last_page as number) || (response.total_pages as number) || 1,
        from: (response.from as number) || 0,
        to: (response.to as number) || 0,
      };
    } else if (response.message) {
      const message = response.message as Record<string, unknown>;
      docsList = (message.data as unknown[]) || (message.documents as unknown[]) || [];
      paginationData = message.pagination as typeof paginationData;
    } else if (response.data) {
      if (Array.isArray(response.data)) {
        docsList = response.data;
      } else {
        const data = response.data as Record<string, unknown>;
        docsList = (data.data as unknown[]) || (data.documents as unknown[]) || [];
        paginationData = data.pagination as typeof paginationData;
      }
    } else if (Array.isArray(response)) {
      docsList = response;
    }

    return {
      documents: Array.isArray(docsList) ? docsList : [],
      pagination: paginationData,
    };
  }, [documentsData]);

  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (doc: Record<string, unknown>) =>
          (doc.document_name as string)?.toLowerCase().includes(searchLower) ||
          (doc.document_number as string)?.toLowerCase().includes(searchLower) ||
          (doc.document_type as string)?.toLowerCase().includes(searchLower) ||
          (doc.document_type_name as string)?.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((doc: Record<string, unknown>) => {
        const docStatus = ((doc.status as string) || "").toString().toUpperCase();
        return docStatus === statusFilter.toUpperCase();
      });
    }

    return filtered;
  }, [documents, search, statusFilter]);

  const stats = useMemo(() => {
    return documents.reduce(
      (
        acc: { total: number; approved: number; pending: number; rejected: number },
        doc: Record<string, unknown>
      ) => {
        acc.total += 1;
        const status = ((doc.status as string) || "").toString().toUpperCase();
        if (status === "APPROVED" || status === "1") acc.approved += 1;
        else if (status === "PENDING" || status === "0") acc.pending += 1;
        else if (status === "REJECTED" || status === "2") acc.rejected += 1;
        return acc;
      },
      { total: 0, approved: 0, pending: 0, rejected: 0 }
    );
  }, [documents]);

  const isRefreshing = isFetching && !isLoading;

  const handleRefresh = async () => {
    try {
      await refetch();
      showAlert({
        variant: "success",
        title: "Documents refreshed",
        message: "Latest documents were loaded successfully.",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unable to refresh documents.";
      showAlert({
        variant: "error",
        title: "Refresh failed",
        message: errorMessage,
      });
    }
  };

  const handleViewClick = (doc: Record<string, unknown>) => {
    setViewingDocument(doc as typeof viewingDocument);
  };

  const handleViewConfirm = () => {
    if (viewingDocument?.document_path) {
      window.open(viewingDocument.document_path as string, "_blank", "noopener,noreferrer");
    }
    setViewingDocument(null);
  };

  const handleDownloadDocument = (doc: Record<string, unknown>) => {
    if (doc.document_path) {
      const link = document.createElement("a");
      link.href = doc.document_path as string;
      link.download = (doc.document_name as string) || "document";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "—";
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
            My Documents
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            View and manage all your uploaded documents
          </p>
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
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
          <Button
            onClick={() => router.push("/documents?tab=upload")}
            className="h-10 w-full rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/15 hover:bg-blue-700 sm:h-11 sm:w-auto"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {documents.length > 0 && (
        <section className="grid gap-4 md:grid-cols-4">
          <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <CardContent className="flex items-center gap-3 p-4">
              <FileText className="h-9 w-9 rounded-xl bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Total
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <CardContent className="flex items-center gap-3 p-4">
              <CheckCircle2 className="h-9 w-9 rounded-xl bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Approved
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stats.approved}
                </p>
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
                  {stats.pending}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <CardContent className="flex items-center gap-3 p-4">
              <XCircle className="h-9 w-9 rounded-xl bg-red-500/10 p-2 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Rejected
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stats.rejected}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="p-4 pb-2 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
                <FolderOpen className="h-5 w-5 text-blue-500" />
                Documents
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                Search and filter your documents
              </CardDescription>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by document name or reference..."
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
              <SelectTrigger className="h-11 w-full rounded-xl border-2 sm:w-[180px]">
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
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
              <p className="text-muted-foreground text-sm">Loading documents...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
              <FileWarning className="h-10 w-10 text-red-500" />
              <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                Error loading documents
              </p>
              <p className="text-muted-foreground text-sm">
                {(error as Error)?.message || "Failed to load documents. Please try again."}
              </p>
              <Button onClick={() => refetch()} variant="outline" className="mt-2">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
              <FileWarning className="text-muted-foreground h-10 w-10" />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                No documents found
              </p>
              <p className="text-muted-foreground text-sm">
                {search || statusFilter !== "ALL"
                  ? "Try adjusting your search or filters."
                  : "You haven't uploaded any documents yet."}
              </p>
              {!search && statusFilter === "ALL" && (
                <Button
                  onClick={() => router.push("/documents?tab=upload")}
                  className="mt-2 bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload First Document
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-200 bg-gradient-to-r from-gray-50/80 to-gray-100/50 dark:border-gray-700 dark:from-gray-900/40 dark:to-gray-800/40">
                      <TableHead className="min-w-[200px] py-4 font-semibold text-gray-900 dark:text-gray-100">
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-4 w-4 text-blue-500" />
                          Document Type
                        </div>
                      </TableHead>
                      <TableHead className="min-w-[200px] py-4 font-semibold text-gray-900 dark:text-gray-100">
                        Document Name
                      </TableHead>
                      <TableHead className="min-w-[180px] py-4 font-semibold text-gray-900 dark:text-gray-100">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-purple-500" />
                          Reference Number
                        </div>
                      </TableHead>
                      <TableHead className="min-w-[120px] py-4 font-semibold text-gray-900 dark:text-gray-100">
                        Status
                      </TableHead>
                      <TableHead className="min-w-[180px] py-4 font-semibold text-gray-900 dark:text-gray-100">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-emerald-500" />
                          Created
                        </div>
                      </TableHead>
                      <TableHead className="min-w-[150px] py-4 text-right font-semibold text-gray-900 dark:text-gray-100">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc: Record<string, unknown>) => {
                      const documentType =
                        (doc.document_type_name as string) || (doc.document_type as string) || "—";
                      const documentName = (doc.document_name as string) || "—";
                      const documentNumber = (doc.document_number as string) || "—";
                      const createdAt = (doc.created_at as string) || (doc.created as string);
                      const createdDate = formatDate(createdAt);
                      const status = (doc.status as string) || "";

                      return (
                        <TableRow
                          key={String(doc.id || "")}
                          className="group border-b border-gray-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/30 dark:border-gray-800/50 dark:hover:from-blue-950/20 dark:hover:to-cyan-950/10"
                        >
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 transition-transform duration-200 group-hover:scale-110 dark:from-blue-500/20 dark:to-cyan-500/20">
                                <FolderOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {documentType}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {documentName}
                            </p>
                          </TableCell>
                          <TableCell className="py-4">
                            <p className="text-muted-foreground font-mono text-sm dark:text-gray-300">
                              {documentNumber}
                            </p>
                          </TableCell>
                          <TableCell className="py-4">{statusBadge(status)}</TableCell>
                          <TableCell className="py-4">
                            <div className="text-muted-foreground flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                              <span className="whitespace-nowrap">{createdDate}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {doc.document_path && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 rounded-lg text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/30 dark:hover:text-blue-300"
                                    onClick={() => handleViewClick(doc)}
                                    title="View Document"
                                  >
                                    <Eye className="mr-1 h-4 w-4" />
                                    View
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 rounded-lg text-green-600 transition-colors hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-950/30 dark:hover:text-green-300"
                                    onClick={() => handleDownloadDocument(doc)}
                                    title="Download Document"
                                  >
                                    <Download className="mr-1 h-4 w-4" />
                                    Download
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {pagination && (pagination.total_pages || pagination.last_page || 0) > 1 && (
                <div className="flex flex-col gap-4 border-t border-gray-200 px-4 py-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-muted-foreground text-sm">
                    Showing {pagination.from || (page - 1) * perPage + 1} to{" "}
                    {pagination.to ||
                      Math.min(page * perPage, pagination.total || filteredDocuments.length)}{" "}
                    of {pagination.total || filteredDocuments.length} documents
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
                      Page {page} of{" "}
                      {Number(pagination.total_pages) || Number(pagination.last_page) || 1}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((prev) =>
                          Math.min(
                            prev + 1,
                            Number(pagination.total_pages) ||
                              Number(pagination.last_page) ||
                              prev + 1
                          )
                        )
                      }
                      disabled={
                        page >=
                          (Number(pagination.total_pages) || Number(pagination.last_page) || 1) ||
                        isLoading
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

      {/* View Document Confirmation Dialog */}
      <Dialog open={!!viewingDocument} onOpenChange={(open) => !open && setViewingDocument(null)}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-500" />
              View Document
            </DialogTitle>
            <DialogDescription>
              You are about to open &quot;
              {viewingDocument?.document_name ||
                viewingDocument?.document_type_name ||
                "this document"}
              &quot; in a new tab.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
              <p className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
                Document Details:
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <span className="font-medium">Type:</span>{" "}
                {viewingDocument?.document_type_name || viewingDocument?.document_type || "—"}
              </p>
              {viewingDocument?.document_number && (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Reference:</span> {viewingDocument.document_number}
                </p>
              )}
            </div>
            <p className="text-muted-foreground text-sm">
              The document will open in a new browser tab. Make sure pop-ups are enabled for this
              site.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setViewingDocument(null)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleViewConfirm}
              className="rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            >
              <Eye className="mr-2 h-4 w-4" />
              Open Document
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
