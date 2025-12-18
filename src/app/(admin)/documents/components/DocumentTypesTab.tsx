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
  FileText,
  RefreshCw,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Check,
  MinusCircle,
} from "lucide-react";
import { useAlert } from "@/context/AlertProvider";
import {
  useAdminDocumentTypes,
  useChangeAdminDocumentTypeStatus,
  useUpdateAdminDocumentType,
  useDeleteAdminDocumentType,
  useCreateAdminDocumentType,
} from "@/controller/query/admin/documents/useAdminDocuments";
import { AdminDocumentType } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Edit, Trash2, Save, Calendar } from "lucide-react";

type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

const statusBadge = (status: unknown) => {
  // status: 1 = active, 0 or other = inactive
  const isActive = status === 1 || status === "1";
  if (isActive) {
    return (
      <Badge
        variant="outline"
        className="inline-flex items-center gap-1.5 rounded-lg border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        Active
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="inline-flex items-center gap-1.5 rounded-lg border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 shadow-sm dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
    >
      <XCircle className="h-3.5 w-3.5" />
      Inactive
    </Badge>
  );
};

export default function DocumentTypesTab() {
  const { showAlert } = useAlert();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const {
    data: typesResponse,
    isLoading,
    isFetching,
    refetch,
  } = useAdminDocumentTypes(apiKey, !!apiKey);
  const changeStatusMutation = useChangeAdminDocumentTypeStatus();
  const updateTypeMutation = useUpdateAdminDocumentType();
  const deleteTypeMutation = useDeleteAdminDocumentType();
  const createTypeMutation = useCreateAdminDocumentType();
  const [editingType, setEditingType] = useState<AdminDocumentType | null>(null);
  const [deletingType, setDeletingType] = useState<AdminDocumentType | null>(null);
  const [togglingStatusType, setTogglingStatusType] = useState<AdminDocumentType | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    required: false,
  });
  const [createFormData, setCreateFormData] = useState({
    name: "",
    description: "",
    required: false,
    active: true,
  });

  const types = useMemo(() => {
    // The API returns: { total: 3, per_page: 1000, data: [...] }
    // typesResponse is already response.data from axios, so typesResponse.data is the array
    const raw =
      typesResponse?.data || // Direct: { data: [...] } - THIS IS THE CORRECT ONE
      typesResponse?.data?.data || // Nested: { data: { data: [...] } }
      typesResponse?.types ||
      typesResponse?.message?.data ||
      typesResponse?.message?.types ||
      typesResponse?.message ||
      [];
    const list = Array.isArray(raw) ? raw : [];
    return list.filter((type: AdminDocumentType) => {
      const matchesSearch =
        !search ||
        `${type.name || ""} ${type.description || ""}`.toLowerCase().includes(search.toLowerCase());
      // status: 1 = active, 0 or other = inactive
      const statusValue = type.status;
      const isActive = statusValue === 1 || statusValue === "1";
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && isActive) ||
        (statusFilter === "INACTIVE" && !isActive);
      return matchesSearch && matchesStatus;
    });
  }, [typesResponse, search, statusFilter]);

  const stats = useMemo(() => {
    return types.reduce(
      (acc, type: AdminDocumentType) => {
        const required = !!(type.is_required || type.required);
        // status: 1 = active, 0 or other = inactive
        const statusValue = type.status;
        const isActive = statusValue === 1 || statusValue === "1";
        acc.total += 1;
        if (required) acc.required += 1;
        if (isActive) acc.active += 1;
        if (!isActive) acc.inactive += 1;
        return acc;
      },
      { total: 0, required: 0, active: 0, inactive: 0 }
    );
  }, [types]);

  const isRefreshing = isFetching && !isLoading;

  const handleRefresh = async () => {
    try {
      await refetch();
      showAlert({
        variant: "success",
        title: "Document types refreshed",
        message: "Latest configuration was loaded successfully.",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to refresh document types.";
      showAlert({
        variant: "error",
        title: "Refresh failed",
        message: errorMessage,
      });
    }
  };

  const handleToggleStatusConfirm = async () => {
    if (!apiKey || !togglingStatusType) return;
    // status: 1 = active, 0 or other = inactive
    // Backend expects string format: "ACTIVE" or "INACTIVE"
    const currentStatus = togglingStatusType.status;
    const isCurrentlyActive = currentStatus === 1 || currentStatus === "1";
    const nextStatus = isCurrentlyActive ? "INACTIVE" : "ACTIVE";
    try {
      const typeId = togglingStatusType.id || togglingStatusType.type_id;
      if (!typeId) {
        showAlert({
          variant: "error",
          title: "Error",
          message: "Document type ID is missing.",
        });
        return;
      }
      const idValue = Number(typeId);
      if (isNaN(idValue) || idValue <= 0) {
        showAlert({
          variant: "error",
          title: "Error",
          message: "Invalid document type ID.",
        });
        return;
      }
      // Backend error says "document type ID is required" - try different field names
      // Based on other endpoints, backend might expect 'document_type_id' or 'id'
      const payload: Record<string, unknown> = {
        document_type_id: idValue, // Try document_type_id first (used in other endpoints)
        type_id: idValue, // Fallback
        id: idValue, // Also try id
        status: nextStatus,
      };
      await changeStatusMutation.mutateAsync({
        data: payload as AdminChangeDocumentTypeStatusRequest & {
          document_type_id: number;
          id: number;
        },
        apiKey,
      });
      setTogglingStatusType(null);
      await refetch();
    } catch {
      // alert already handled by mutation
    }
  };

  const handleEditClick = (type: AdminDocumentType) => {
    setEditingType(type);
    setEditFormData({
      name: type.name || "",
      description: type.description || "",
      required: !!type.required,
    });
  };

  const handleEditSubmit = async () => {
    if (!apiKey || !editingType) return;
    const typeId = editingType.id || editingType.type_id;
    if (!typeId) {
      showAlert({
        variant: "error",
        title: "Error",
        message: "Document type ID is missing.",
      });
      return;
    }
    const idValue = Number(typeId);
    if (isNaN(idValue) || idValue <= 0) {
      showAlert({
        variant: "error",
        title: "Error",
        message: "Invalid document type ID.",
      });
      return;
    }
    try {
      const payload: Record<string, unknown> = {
        document_type_id: idValue, // Try document_type_id first
        type_id: idValue, // Fallback
        id: idValue, // Also try id
        name: editFormData.name.trim(),
        description: editFormData.description.trim(),
        required: editFormData.required,
      };
      await updateTypeMutation.mutateAsync({
        data: payload as AdminUpdateDocumentTypeRequest & { document_type_id: number; id: number },
        apiKey,
      });
      setEditingType(null);
      await refetch();
    } catch {
      // alert already handled by mutation
    }
  };

  const handleDeleteClick = (type: AdminDocumentType) => {
    setDeletingType(type);
  };

  const handleDeleteConfirm = async () => {
    if (!apiKey || !deletingType) return;
    const typeId = deletingType.id || deletingType.type_id;
    if (!typeId) {
      showAlert({
        variant: "error",
        title: "Error",
        message: "Document type ID is missing.",
      });
      return;
    }
    const idValue = Number(typeId);
    if (isNaN(idValue) || idValue <= 0) {
      showAlert({
        variant: "error",
        title: "Error",
        message: "Invalid document type ID.",
      });
      return;
    }
    try {
      const payload: Record<string, unknown> = {
        document_type_id: idValue, // Try document_type_id first
        type_id: idValue, // Fallback
        id: idValue, // Also try id
      };
      await deleteTypeMutation.mutateAsync({
        data: payload as AdminDeleteDocumentTypeRequest & { document_type_id: number; id: number },
        apiKey,
      });
      setDeletingType(null);
      await refetch();
    } catch {
      // alert already handled by mutation
    }
  };

  const handleCreateSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!apiKey) {
      showAlert({
        variant: "error",
        title: "Missing API key",
        message: "Please sign in again to create document types.",
      });
      return;
    }

    try {
      await createTypeMutation.mutateAsync({
        data: {
          name: createFormData.name.trim(),
          description: createFormData.description.trim(),
          required: createFormData.required,
          status: createFormData.active ? "ACTIVE" : "INACTIVE",
        },
        apiKey,
      });
      setCreateFormData({
        name: "",
        description: "",
        required: false,
        active: true,
      });
      setIsCreateDialogOpen(false);
      await refetch();
    } catch (error: unknown) {
      // alert already handled by mutation
    }
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
    setCreateFormData({
      name: "",
      description: "",
      required: false,
      active: true,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
            Document Types
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Configure the set of documents your clients must submit
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
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh list
              </>
            )}
          </Button>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="h-10 w-full rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/15 hover:bg-blue-700 sm:h-11 sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Type
          </Button>
        </div>
      </div>
      <section className="grid gap-4 xl:grid-cols-4">
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <FileText className="h-9 w-9 rounded-xl bg-brand-500/10 p-2 text-brand-600 dark:text-brand-400" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Total types
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-muted-foreground text-xs">Configured entries</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <Check className="h-9 w-9 rounded-xl bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-300" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Required
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.required}
              </p>
              <p className="text-muted-foreground text-xs">Needed for KYB approval</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 className="h-9 w-9 rounded-xl bg-blue-500/10 p-2 text-blue-600 dark:text-blue-300" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Active
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.active}</p>
              <p className="text-muted-foreground text-xs">Currently enforced</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <MinusCircle className="h-9 w-9 rounded-xl bg-amber-500/10 p-2 text-amber-600 dark:text-amber-300" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Inactive
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.inactive}
              </p>
              <p className="text-muted-foreground text-xs">Not used currently</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="p-4 pb-2 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
                <FileText className="h-5 w-5 text-brand-500" />
                Manage document types
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                Filter by status or search by name to keep your onboarding requirements up to date.
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
          <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by document name or description..."
                className="h-11 rounded-xl border-2 pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            >
              <SelectTrigger className="h-11 rounded-xl border-2">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
              <p className="text-muted-foreground text-sm">Loading document types...</p>
            </div>
          ) : types.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
              <FileText className="text-muted-foreground h-10 w-10" />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                No document types match the current filters.
              </p>
              <p className="text-muted-foreground text-sm">
                Try another search or create a new document type for your KYB flow.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 via-gray-50/80 to-gray-100/50 dark:border-gray-700 dark:from-gray-800/60 dark:via-gray-900/40 dark:to-gray-800/30">
                    <TableHead className="min-w-[80px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      ID
                    </TableHead>
                    <TableHead className="min-w-[200px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Name
                    </TableHead>
                    <TableHead className="min-w-[300px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Description
                    </TableHead>
                    <TableHead className="min-w-[130px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Required
                    </TableHead>
                    <TableHead className="min-w-[130px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Status
                    </TableHead>
                    <TableHead className="min-w-[200px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Created
                    </TableHead>
                    <TableHead className="min-w-[200px] px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {types.map((type: AdminDocumentType) => {
                    const id = type.id || type.type_id;
                    const typeId = String(id ?? "N/A");
                    // status: 1 = active, 0 or other = inactive
                    const statusValue = type.status;
                    const isActive = statusValue === 1 || statusValue === "1";
                    const isRequired = !!(type.is_required || type.required);
                    // Use 'created' field from API
                    const created = type.created || type.created_at;
                    const createdDate = created
                      ? new Date(String(created)).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }) +
                        " " +
                        new Date(String(created)).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "--";
                    return (
                      <TableRow
                        key={id}
                        className="group border-b border-gray-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/30 dark:border-gray-800/50 dark:hover:from-blue-950/20 dark:hover:to-cyan-950/10"
                      >
                        <TableCell className="py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 font-semibold text-blue-600 dark:from-blue-500/20 dark:to-cyan-500/20 dark:text-blue-400">
                              #{typeId}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-5">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {type.name || "Untitled type"}
                          </p>
                        </TableCell>
                        <TableCell className="py-5">
                          <p className="text-muted-foreground line-clamp-2 max-w-md text-sm leading-relaxed dark:text-gray-300">
                            {type.description || "No description provided."}
                          </p>
                        </TableCell>
                        <TableCell className="py-5">
                          <Badge
                            variant="outline"
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                              isRequired
                                ? "border-orange-200 bg-orange-50 text-orange-700 shadow-sm dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-300"
                                : "border-gray-200 bg-gray-50 text-gray-700 shadow-sm dark:border-gray-800 dark:bg-gray-950/40 dark:text-gray-300"
                            }`}
                          >
                            {isRequired ? "Required" : "Optional"}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-5">{statusBadge(statusValue)}</TableCell>
                        <TableCell className="py-5">
                          <div className="text-muted-foreground flex items-center gap-2 text-xs">
                            <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                            <span className="whitespace-nowrap font-medium">{createdDate}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-5">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditClick(type)}
                              disabled={
                                updateTypeMutation.isPending ||
                                deleteTypeMutation.isPending ||
                                changeStatusMutation.isPending
                              }
                              className="h-9 rounded-lg border-2 transition-all hover:border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setTogglingStatusType(type)}
                              disabled={
                                updateTypeMutation.isPending ||
                                deleteTypeMutation.isPending ||
                                changeStatusMutation.isPending
                              }
                              className={`h-9 rounded-lg border-2 transition-all ${
                                isActive
                                  ? "hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20"
                                  : "hover:border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                              }`}
                            >
                              {isActive ? "Deactivate" : "Activate"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(type)}
                              disabled={
                                updateTypeMutation.isPending ||
                                deleteTypeMutation.isPending ||
                                changeStatusMutation.isPending
                              }
                              className="h-9 rounded-lg border-2 text-red-600 transition-all hover:border-red-200 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Document Type Dialog */}
      <Dialog open={!!editingType} onOpenChange={(open) => !open && setEditingType(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Edit Document Type
            </DialogTitle>
            <DialogDescription>
              Update the document type information. Changes will be applied immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="Document type name"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder="Document type description"
                className="min-h-[100px] rounded-xl"
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-900/40">
              <div className="space-y-0.5">
                <Label htmlFor="edit-required" className="cursor-pointer text-sm font-semibold">
                  Required for KYB approval
                </Label>
                <p className="text-muted-foreground text-xs">
                  Enable if this document is mandatory for approval
                </p>
              </div>
              <Switch
                id="edit-required"
                checked={editFormData.required}
                onCheckedChange={(checked) =>
                  setEditFormData({ ...editFormData, required: checked })
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setEditingType(null)}
              disabled={updateTypeMutation.isPending}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
              disabled={updateTypeMutation.isPending || !editFormData.name.trim()}
              className="rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            >
              {updateTypeMutation.isPending ? (
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

      {/* Toggle Status Confirmation Dialog */}
      <Dialog
        open={!!togglingStatusType}
        onOpenChange={(open) => !open && setTogglingStatusType(null)}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {togglingStatusType &&
              (togglingStatusType.status === 1 || togglingStatusType.status === "1") ? (
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              )}
              {togglingStatusType &&
              (togglingStatusType.status === 1 || togglingStatusType.status === "1")
                ? "Deactivate Document Type"
                : "Activate Document Type"}
            </DialogTitle>
            <DialogDescription className="text-base">
              Are you sure you want to{" "}
              {togglingStatusType &&
              (togglingStatusType.status === 1 || togglingStatusType.status === "1")
                ? "deactivate"
                : "activate"}{" "}
              <strong>&ldquo;{togglingStatusType?.name}&rdquo;</strong>? This will{" "}
              {togglingStatusType &&
              (togglingStatusType.status === 1 || togglingStatusType.status === "1")
                ? "disable it for new client submissions."
                : "make it available for client submissions."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setTogglingStatusType(null)}
              disabled={changeStatusMutation.isPending}
              className="h-11 rounded-xl border-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleToggleStatusConfirm}
              disabled={changeStatusMutation.isPending}
              className={`h-11 rounded-xl ${
                togglingStatusType &&
                (togglingStatusType.status === 1 || togglingStatusType.status === "1")
                  ? "bg-red-600 text-white shadow-lg shadow-red-500/25 hover:bg-red-700"
                  : "bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-700"
              }`}
            >
              {changeStatusMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {togglingStatusType &&
                  (togglingStatusType.status === 1 || togglingStatusType.status === "1")
                    ? "Deactivating..."
                    : "Activating..."}
                </>
              ) : (
                <>
                  {togglingStatusType &&
                  (togglingStatusType.status === 1 || togglingStatusType.status === "1")
                    ? "Deactivate"
                    : "Activate"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingType} onOpenChange={(open) => !open && setDeletingType(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <Trash2 className="h-5 w-5" />
              Delete Document Type
            </DialogTitle>
            <DialogDescription className="text-base">
              Are you sure you want to delete <strong>&ldquo;{deletingType?.name}&rdquo;</strong>?
              This action cannot be undone and may affect existing client documents.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setDeletingType(null)}
              disabled={deleteTypeMutation.isPending}
              className="h-11 rounded-xl border-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={deleteTypeMutation.isPending}
              className="h-11 rounded-xl bg-red-600 text-white shadow-lg shadow-red-500/25 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              {deleteTypeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Document Type Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseCreateDialog();
          } else {
            setIsCreateDialogOpen(true);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-semibold text-gray-900 dark:text-white">
              <FileText className="h-6 w-6 text-blue-500" />
              Create Document Type
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Define the documents required during onboarding or KYB review
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-name">Document Name *</Label>
                <Input
                  id="create-name"
                  value={createFormData.name}
                  onChange={(event) =>
                    setCreateFormData((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Example: Passport, National ID, Business license"
                  required
                  className="h-11 rounded-xl border-2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-description">Description *</Label>
                <Textarea
                  id="create-description"
                  value={createFormData.description}
                  onChange={(event) =>
                    setCreateFormData((prev) => ({ ...prev, description: event.target.value }))
                  }
                  placeholder="Explain why this document is required and what the reviewer should verify."
                  rows={4}
                  required
                  className="rounded-xl border-2"
                />
              </div>
            </div>

            <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50/60 p-5 dark:border-gray-800 dark:bg-gray-900/40">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="create-required">Required Document</Label>
                  <p className="text-muted-foreground text-sm">
                    Toggle on if clients must provide this document to pass KYB.
                  </p>
                </div>
                <Switch
                  id="create-required"
                  checked={createFormData.required}
                  onCheckedChange={(checked) =>
                    setCreateFormData((prev) => ({ ...prev, required: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="create-active">Active Status</Label>
                  <p className="text-muted-foreground text-sm">
                    Disable to keep it hidden until the compliance team approves it.
                  </p>
                </div>
                <Switch
                  id="create-active"
                  checked={createFormData.active}
                  onCheckedChange={(checked) =>
                    setCreateFormData((prev) => ({ ...prev, active: checked }))
                  }
                />
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseCreateDialog}
                disabled={createTypeMutation.isPending}
                className="rounded-xl border-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createTypeMutation.isPending ||
                  !createFormData.name.trim() ||
                  !createFormData.description.trim()
                }
                className="rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/15 hover:bg-blue-700"
              >
                {createTypeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Document Type
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
