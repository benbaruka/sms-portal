"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useAdminClientsList } from "@/controller/query/admin/clients/useAdminClients";
import {
  useAdminDocumentsList,
  useDeleteAdminDocument,
  useUpdateAdminDocumentContent,
  useAdminDocumentTypes,
} from "@/controller/query/admin/documents/useAdminDocuments";
import type { AdminClient, AdminDocument, AdminDocumentType } from "@/types";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  Edit,
  Eye,
  FileText,
  FileWarning,
  Filter,
  FolderOpen,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type StatusFilter = "ALL" | "APPROVED" | "PENDING" | "REJECTED";
type SortField = "created" | "document_name" | "document_type_name" | "status";
type SortOrder = "asc" | "desc";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All status" },
  { value: "APPROVED", label: "Approved" },
  { value: "PENDING", label: "Pending" },
  { value: "REJECTED", label: "Rejected" },
];

const SORT_FIELD_OPTIONS: { value: SortField; label: string }[] = [
  { value: "created", label: "Date Created" },
  { value: "document_name", label: "Document Name" },
  { value: "document_type_name", label: "Document Type" },
  { value: "status", label: "Status" },
];

const SORT_ORDER_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "desc", label: "Descending" },
  { value: "asc", label: "Ascending" },
];

export default function ClientDocumentsTab() {
  const { showAlert } = useAlert();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<SortField>("created");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [viewMode, setViewMode] = useState<"overview" | "details">("overview");

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  // Récupérer la liste des clients
  const { data: clientsData, isLoading: isLoadingClients } = useAdminClientsList(
    {
      page: 1,
      per_page: 1000,
    },
    apiKey,
    !!apiKey
  );

  // Récupérer les types de documents
  const { data: documentTypesData, isLoading: isLoadingDocumentTypes } = useAdminDocumentTypes(
    apiKey,
    !!apiKey
  );

  const documentTypes = useMemo(() => {
    if (!documentTypesData) return [];

    let types: AdminDocumentType[] = [];

    if (documentTypesData.data && Array.isArray(documentTypesData.data)) {
      types = documentTypesData.data;
    } else if (documentTypesData.message?.data && Array.isArray(documentTypesData.message.data)) {
      types = documentTypesData.message.data;
    } else if (documentTypesData.message?.types && Array.isArray(documentTypesData.message.types)) {
      types = documentTypesData.message.types;
    } else if (documentTypesData.types && Array.isArray(documentTypesData.types)) {
      types = documentTypesData.types;
    }

    return types.filter((type) => type.active !== false);
  }, [documentTypesData]);

  const clientOptions = useMemo(() => {
    let source: unknown = null;

    if (clientsData?.message && Array.isArray(clientsData.message)) {
      source = clientsData.message;
    } else if (clientsData?.clients && Array.isArray(clientsData.clients)) {
      source = clientsData.clients;
    } else if (clientsData?.data?.clients && Array.isArray(clientsData.data.clients)) {
      source = clientsData.data.clients;
    } else if (clientsData?.data?.data && Array.isArray(clientsData.data.data)) {
      source = clientsData.data.data;
    } else if (clientsData?.message?.clients && Array.isArray(clientsData.message.clients)) {
      source = clientsData.message.clients;
    } else if (clientsData?.message?.data && Array.isArray(clientsData.message.data)) {
      source = clientsData.message.data;
    }

    return Array.isArray(source) ? source : [];
  }, [clientsData]);

  // Convertir selectedClientId en number pour la requête
  const clientIdForRequest = useMemo(() => {
    if (!selectedClientId) {
      return undefined;
    }
    const parsed =
      typeof selectedClientId === "string"
        ? parseInt(selectedClientId, 10)
        : Number(selectedClientId);
    return isNaN(parsed) || parsed <= 0 ? undefined : parsed;
  }, [selectedClientId]);

  const shouldFetchDocuments = !!apiKey && !!clientIdForRequest;

  // Récupérer les documents pour le client sélectionné
  const {
    data: documentsResponse,
    isLoading: isLoadingDocuments,
    isFetching,
    refetch,
    error: documentsError,
  } = useAdminDocumentsList(
    {
      page,
      per_page: perPage,
      search: search && search.trim() ? search.trim() : undefined,
      status: statusFilter !== "ALL" ? statusFilter : undefined,
      client_id: clientIdForRequest,
      sort: sortField,
      order: sortOrder,
    },
    apiKey,
    shouldFetchDocuments && viewMode === "details"
  );

  const updateDocumentMutation = useUpdateAdminDocumentContent();
  const deleteDocumentMutation = useDeleteAdminDocument();
  const [editingDocument, setEditingDocument] = useState<AdminDocument | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<AdminDocument | null>(null);
  const [viewingDocument, setViewingDocument] = useState<AdminDocument | null>(null);
  const [editFormData, setEditFormData] = useState({
    document_name: "",
    document_number: "",
  });

  const documents = useMemo(() => {
    if (!documentsResponse) return [];

    let documentsList: AdminDocument[] = [];

    if (documentsResponse.data && Array.isArray(documentsResponse.data)) {
      documentsList = documentsResponse.data as AdminDocument[];
    } else if (documentsResponse.documents && Array.isArray(documentsResponse.documents)) {
      documentsList = documentsResponse.documents;
    } else if (documentsResponse.message?.data && Array.isArray(documentsResponse.message.data)) {
      documentsList = documentsResponse.message.data;
    } else if (
      documentsResponse.message?.documents &&
      Array.isArray(documentsResponse.message.documents)
    ) {
      documentsList = documentsResponse.message.documents;
    } else if (
      (documentsResponse as unknown as { data?: { data?: unknown[] } }).data?.data &&
      Array.isArray((documentsResponse as unknown as { data?: { data?: unknown[] } }).data?.data)
    ) {
      documentsList = (documentsResponse as unknown as { data: { data: AdminDocument[] } }).data
        .data;
    } else if (Array.isArray(documentsResponse.message)) {
      documentsList = documentsResponse.message as AdminDocument[];
    }

    // Filtrer par statut
    if (statusFilter !== "ALL" && documentsList.length > 0) {
      documentsList = documentsList.filter((doc: AdminDocument) => {
        const docStatus = (doc.status || "").toString().toUpperCase();
        return docStatus === statusFilter.toUpperCase();
      });
    }

    // Filtrer par type de document
    if (documentTypeFilter !== "ALL" && documentsList.length > 0) {
      documentsList = documentsList.filter((doc: AdminDocument) => {
        const docTypeId = String(doc.document_type_id || "");
        return docTypeId === documentTypeFilter;
      });
    }

    return documentsList;
  }, [documentsResponse, statusFilter, documentTypeFilter]);

  const pagination = useMemo(() => {
    if (!documentsResponse) return null;
    return {
      total: documentsResponse.total || 0,
      per_page: documentsResponse.per_page || perPage,
      current_page: documentsResponse.current_page || page,
      last_page: documentsResponse.last_page || documentsResponse.total_pages || 1,
      from: documentsResponse.from || (page - 1) * perPage + 1,
      to: documentsResponse.to || Math.min(page * perPage, documentsResponse.total || 0),
      total_pages: documentsResponse.total_pages || documentsResponse.last_page || 1,
    };
  }, [documentsResponse, page, perPage]);

  const stats = useMemo(() => {
    return documents.reduce(
      (
        acc: { total: number; approved: number; pending: number; rejected: number },
        doc: AdminDocument
      ) => {
        acc.total += 1;
        const status = (doc.status || "").toString().toUpperCase();
        if (status === "APPROVED") acc.approved += 1;
        else if (status === "PENDING") acc.pending += 1;
        else if (status === "REJECTED") acc.rejected += 1;
        return acc;
      },
      { total: 0, approved: 0, pending: 0, rejected: 0 }
    );
  }, [documents]);

  const isRefreshing = isFetching && !isLoadingDocuments;

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

  const handleClientClick = (clientId: string) => {
    setSelectedClientId(clientId);
    setViewMode("details");
    setPage(1);
    setSearch("");
    setStatusFilter("ALL");
    setDocumentTypeFilter("ALL");
    setSortField("created");
    setSortOrder("desc");
  };

  const handleBackToOverview = () => {
    setSelectedClientId(null);
    setViewMode("overview");
    setPage(1);
    setSearch("");
    setStatusFilter("ALL");
    setDocumentTypeFilter("ALL");
    setSortField("created");
    setSortOrder("desc");
  };

  const handleViewClick = (doc: AdminDocument) => {
    setViewingDocument(doc);
  };

  const handleViewConfirm = () => {
    if (viewingDocument?.document_path) {
      window.open(viewingDocument.document_path, "_blank", "noopener,noreferrer");
    }
    setViewingDocument(null);
  };

  const handleEditClick = (doc: AdminDocument) => {
    setEditingDocument(doc);
    setEditFormData({
      document_name: doc.document_name || "",
      document_number: doc.document_number || "",
    });
  };

  const handleEditSubmit = async () => {
    if (!apiKey || !editingDocument) return;
    try {
      await updateDocumentMutation.mutateAsync({
        data: {
          document_id: (editingDocument.id || editingDocument.document_id) as number,
          document_name: editFormData.document_name.trim(),
          document_number: editFormData.document_number.trim(),
        },
        apiKey,
      });
      setEditingDocument(null);
      await refetch();
    } catch {
      // alert already handled by mutation
    }
  };

  const handleDeleteClick = (doc: AdminDocument) => {
    setDeletingDocument(doc);
  };

  const handleDeleteConfirm = async () => {
    if (!apiKey || !deletingDocument) return;
    try {
      await deleteDocumentMutation.mutateAsync({
        data: {
          document_id: (deletingDocument.id || deletingDocument.document_id) as number,
        },
        apiKey,
      });
      setDeletingDocument(null);
      await refetch();
    } catch {
      // alert already handled by mutation
    }
  };

  const selectedClient = useMemo(() => {
    if (!selectedClientId) return null;
    return clientOptions.find((client: AdminClient) => String(client.id) === selectedClientId);
  }, [selectedClientId, clientOptions]);

  // Vue d'ensemble des clients
  if (viewMode === "overview") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
              Client Documents
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Select a client to view their documents
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              if (apiKey) {
                // Refetch clients
                window.location.reload();
              }
            }}
            disabled={isLoadingClients}
            className="h-10 w-full rounded-xl border-2 sm:h-11 sm:w-auto"
          >
            {isLoadingClients ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>

        {isLoadingClients ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            <p className="text-muted-foreground text-sm">Loading clients...</p>
          </div>
        ) : clientOptions.length === 0 ? (
          <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <CardContent className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
              <Users className="text-muted-foreground h-12 w-12" />
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                No clients found
              </p>
              <p className="text-muted-foreground text-sm">
                There are no clients in the system yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clientOptions.map((client: AdminClient) => (
              <Card
                key={String(client.id || "")}
                className="cursor-pointer rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-blue-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-700"
                onClick={() => handleClientClick(String(client.id || ""))}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20">
                      <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="mb-1 truncate text-base font-semibold text-gray-900 dark:text-white">
                        {String(client.name || client.company_name || `Client ${client.id || ""}`)}
                      </h3>
                      <p className="text-muted-foreground truncate text-sm">
                        {client.email || "No email"}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <FileText className="text-muted-foreground h-4 w-4" />
                        <span className="text-muted-foreground text-sm">
                          Click to view documents
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Vue détaillée des documents d'un client
  return (
    <div className="space-y-6">
      {/* Header avec branding amélioré */}
      <div className="rounded-xl border border-blue-200/50 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 p-6 shadow-sm dark:border-blue-800/50 md:p-8">
        <div className="mb-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToOverview}
            className="-ml-2 h-9 flex-shrink-0 rounded-lg transition-colors hover:bg-white/50 dark:hover:bg-gray-800/50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-2 shadow-md sm:p-3">
            <Building2 className="h-5 w-5 text-white sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              {selectedClient?.name || selectedClient?.company_name || `Client ${selectedClientId}`}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm dark:text-gray-400 sm:text-base">
              Manage documents for this client
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoadingDocuments || isRefreshing}
            className="h-10 w-full flex-shrink-0 rounded-xl border-2 sm:w-auto"
          >
            {isLoadingDocuments || isRefreshing ? (
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
                Search and filter documents for this client
              </CardDescription>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by document name, reference, or type..."
                className="h-11 rounded-xl border-2 pl-9"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap gap-3">
              {/* Status Filter */}
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value as StatusFilter);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-2 sm:w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Document Type Filter */}
              <Select
                value={documentTypeFilter}
                onValueChange={(value) => {
                  setDocumentTypeFilter(value);
                  setPage(1);
                }}
                disabled={isLoadingDocumentTypes}
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-2 sm:w-[180px]">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <SelectValue placeholder="Filter by type" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All document types</SelectItem>
                  {documentTypes.map((type) => (
                    <SelectItem key={String(type.id)} value={String(type.id)}>
                      {type.name || `Type ${type.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort Field */}
              <Select
                value={sortField}
                onValueChange={(value) => {
                  setSortField(value as SortField);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-2 sm:w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_FIELD_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort Order */}
              <Select
                value={sortOrder}
                onValueChange={(value) => {
                  setSortOrder(value as SortOrder);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-2 sm:w-[140px]">
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_ORDER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingDocuments ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
              <p className="text-muted-foreground text-sm">Loading documents...</p>
            </div>
          ) : documentsError ? (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
              <FileWarning className="h-10 w-10 text-red-500" />
              <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                Error loading documents
              </p>
              <p className="text-muted-foreground text-sm">
                {documentsError instanceof Error
                  ? documentsError.message
                  : "Failed to load documents. Please try again."}
              </p>
              <Button onClick={() => refetch()} variant="outline" className="mt-2">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
              <FileWarning className="text-muted-foreground h-10 w-10" />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                No documents found
              </p>
              <p className="text-muted-foreground text-sm">
                {search || statusFilter !== "ALL"
                  ? "Try adjusting your search or filters."
                  : "This client hasn't uploaded any documents yet."}
              </p>
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
                    {documents.map((doc: AdminDocument) => {
                      const documentType = doc.document_type_name || doc.document_type || "—";
                      const documentName = doc.document_name || "—";
                      const documentNumber = doc.document_number || "—";
                      const createdAt = doc.created || doc.uploaded_at || doc.updated;
                      const createdDate = createdAt
                        ? new Date(createdAt).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—";

                      return (
                        <TableRow
                          key={String(doc.id || doc.document_id || "")}
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
                          <TableCell className="py-4">
                            <div className="text-muted-foreground flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                              <span className="whitespace-nowrap">{createdDate}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {doc.document_path && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 rounded-lg text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/30 dark:hover:text-blue-300"
                                  onClick={() => handleViewClick(doc)}
                                  title="View Document"
                                  disabled={
                                    updateDocumentMutation.isPending ||
                                    deleteDocumentMutation.isPending
                                  }
                                >
                                  <Eye className="mr-1 h-4 w-4" />
                                  View
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 rounded-lg text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-950/30 dark:hover:text-gray-300"
                                disabled={
                                  updateDocumentMutation.isPending ||
                                  deleteDocumentMutation.isPending
                                }
                                onClick={() => handleEditClick(doc)}
                                title="Edit Document"
                              >
                                <Edit className="mr-1 h-4 w-4" />
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 rounded-lg text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                                disabled={
                                  updateDocumentMutation.isPending ||
                                  deleteDocumentMutation.isPending
                                }
                                onClick={() => handleDeleteClick(doc)}
                                title="Delete Document"
                              >
                                <Trash2 className="mr-1 h-4 w-4" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {pagination && ((pagination?.total_pages as number) || 0) > 1 && (
                <div className="flex flex-col gap-4 border-t border-gray-200 px-4 py-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-muted-foreground text-sm">
                    Showing {pagination.from || (page - 1) * perPage + 1} to{" "}
                    {pagination.to ||
                      Math.min(page * perPage, pagination.total || documents.length)}{" "}
                    of {pagination.total || documents.length} documents
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={page <= 1 || isLoadingDocuments}
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
                        isLoadingDocuments
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
                {viewingDocument?.document_type_name || "—"}
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

      {/* Edit Document Dialog */}
      <Dialog open={!!editingDocument} onOpenChange={(open) => !open && setEditingDocument(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
            <DialogDescription>Update the document name and reference number.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-document-name">Document Name</Label>
              <Input
                id="edit-document-name"
                value={editFormData.document_name}
                onChange={(event) =>
                  setEditFormData((prev) => ({ ...prev, document_name: event.target.value }))
                }
                placeholder="Enter document name"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-document-number">Reference Number</Label>
              <Input
                id="edit-document-number"
                value={editFormData.document_number}
                onChange={(event) =>
                  setEditFormData((prev) => ({ ...prev, document_number: event.target.value }))
                }
                placeholder="Enter reference number"
                className="rounded-xl"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setEditingDocument(null)}
              disabled={updateDocumentMutation.isPending}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
              disabled={updateDocumentMutation.isPending}
              className="rounded-xl"
            >
              {updateDocumentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingDocument} onOpenChange={(open) => !open && setDeletingDocument(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;
              {deletingDocument?.document_name || deletingDocument?.document_type_name}&quot;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setDeletingDocument(null)}
              disabled={deleteDocumentMutation.isPending}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteDocumentMutation.isPending}
              className="rounded-xl"
            >
              {deleteDocumentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
