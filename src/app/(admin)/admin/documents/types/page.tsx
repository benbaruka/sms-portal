"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAlert } from "@/context/AlertProvider";
import {
  useAdminDocumentTypes,
  useChangeAdminDocumentTypeStatus,
  useCreateAdminDocumentType,
  useDeleteAdminDocumentType,
  useUpdateAdminDocumentType,
} from "@/controller/query/admin/documents/useAdminDocuments";
import type { AdminDocumentType } from "@/types";
import {
  Calendar,
  CheckCircle2,
  Edit,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings2,
  Trash2,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function DocumentTypesPage() {
  const { showAlert } = useAlert();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<AdminDocumentType | null>(null);
  const [deletingType, setDeletingType] = useState<AdminDocumentType | null>(null);

  // Form states
  const [createFormData, setCreateFormData] = useState({
    name: "",
    description: "",
    required: false,
    active: true,
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    required: false,
  });

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const {
    data: documentTypesResponse,
    isLoading,
    refetch,
  } = useAdminDocumentTypes(apiKey, !!apiKey);

  const createTypeMutation = useCreateAdminDocumentType();
  const updateTypeMutation = useUpdateAdminDocumentType();
  const deleteTypeMutation = useDeleteAdminDocumentType();
  const changeStatusMutation = useChangeAdminDocumentTypeStatus();

  // Extract document types from response
  const documentTypes = useMemo(() => {
    if (!documentTypesResponse) return [];

    const response = documentTypesResponse as Record<string, unknown>;

    // Try different possible structures
    let raw: unknown[] = [];

    // Structure 1: { data: [...] } - direct array
    if (Array.isArray(response.data)) {
      raw = response.data;
    }
    // Structure 2: { data: { data: [...] } } - nested
    else if (response.data && typeof response.data === "object" && !Array.isArray(response.data)) {
      const dataObj = response.data as Record<string, unknown>;
      if (Array.isArray(dataObj.data)) {
        raw = dataObj.data;
      }
    }
    // Structure 3: { types: [...] }
    else if (Array.isArray(response.types)) {
      raw = response.types;
    }
    // Structure 4: { message: { data: [...] } }
    else if (
      response.message &&
      typeof response.message === "object" &&
      !Array.isArray(response.message)
    ) {
      const messageObj = response.message as Record<string, unknown>;
      if (Array.isArray(messageObj.data)) {
        raw = messageObj.data;
      } else if (Array.isArray(messageObj.types)) {
        raw = messageObj.types;
      }
    }
    // Structure 5: { message: [...] }
    else if (Array.isArray(response.message)) {
      raw = response.message;
    }

    return raw as AdminDocumentType[];
  }, [documentTypesResponse]);

  // Filter by search
  const filteredDocumentTypes = useMemo(() => {
    if (!search || search.trim().length === 0) {
      return documentTypes;
    }

    const searchLower = search.toLowerCase().trim();
    return documentTypes.filter((type: AdminDocumentType) => {
      const name = (type.name || "").toLowerCase();
      const description = (type.description || "").toLowerCase();
      return name.includes(searchLower) || description.includes(searchLower);
    });
  }, [documentTypes, search]);

  // Calculate statistics
  const stats = useMemo(() => {
    return documentTypes.reduce(
      (
        acc: {
          total: number;
          active: number;
          required: number;
          inactive: number;
        },
        type: AdminDocumentType
      ) => {
        acc.total += 1;
        // status: 1 = active, 0 or other = inactive
        const statusValue = type.status;
        if (statusValue === 1 || statusValue === "1") {
          acc.active += 1;
        } else {
          acc.inactive += 1;
        }
        if (type.is_required || type.required) {
          acc.required += 1;
        }
        return acc;
      },
      {
        total: 0,
        active: 0,
        required: 0,
        inactive: 0,
      }
    );
  }, [documentTypes]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      showAlert({
        variant: "success",
        title: "Refreshed",
        message: "Document types list has been updated.",
      });
    } catch {
      // Error handled by hook
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    } catch {
      // Error handled by mutation
    }
  };

  const handleEditClick = (type: AdminDocumentType) => {
    setEditingType(type);
    setEditFormData({
      name: type.name || "",
      description: type.description || "",
      required: !!(type.is_required || type.required),
    });
  };

  const handleEditSubmit = async () => {
    if (!apiKey || !editingType) return;
    try {
      await updateTypeMutation.mutateAsync({
        data: {
          type_id: (editingType.id || editingType.type_id) as number,
          name: editFormData.name.trim(),
          description: editFormData.description.trim(),
          required: editFormData.required,
        },
        apiKey,
      });
      setEditingType(null);
      await refetch();
    } catch {
      // Error handled by mutation
    }
  };

  const handleDeleteClick = (type: AdminDocumentType) => {
    setDeletingType(type);
  };

  const handleDeleteConfirm = async () => {
    if (!apiKey || !deletingType) return;
    try {
      await deleteTypeMutation.mutateAsync({
        data: {
          type_id: (deletingType.id || deletingType.type_id) as number,
        },
        apiKey,
      });
      setDeletingType(null);
      await refetch();
    } catch {
      // Error handled by mutation
    }
  };

  const toggleStatus = async (type: AdminDocumentType) => {
    if (!apiKey) {
      showAlert({
        variant: "error",
        title: "Missing API key",
        message: "Please sign in again to update document types.",
      });
      return;
    }
    // status: 1 = active, 0 = inactive
    const currentStatus = type.status;
    const isCurrentlyActive =
      currentStatus === 1 || currentStatus === "1" || currentStatus === "ACTIVE";
    // Send number: 1 for active, 0 for inactive (API expects number, not string)
    const nextStatus = isCurrentlyActive ? 0 : 1;
    try {
      await changeStatusMutation.mutateAsync({
        data: {
          type_id: (type.id || type.type_id) as number,
          status: nextStatus, // Send number: 1 = active, 0 = inactive
        },
        apiKey,
      });
      // Force refetch to get updated data
      await refetch();
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <section className="grid gap-4 xl:grid-cols-4">
        <Card className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/50 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-800 dark:from-gray-900 dark:to-gray-950/50">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/20">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                Total Types
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-muted-foreground mt-0.5 text-xs">Document types configured</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-emerald-50/30 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-800 dark:from-gray-900 dark:to-emerald-950/20">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/20">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                Active Types
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {stats.active}
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs">Currently enabled</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-orange-50/30 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-800 dark:from-gray-900 dark:to-orange-950/20">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/20">
              <Settings2 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                Required Types
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {stats.required}
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs">Mandatory for KYB</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-red-50/30 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-800 dark:from-gray-900 dark:to-red-950/20">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/10 to-red-600/20">
              <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                Inactive Types
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {stats.inactive}
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs">Currently disabled</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Document Types Table */}
      <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="border-b border-gray-200/50 p-6 dark:border-gray-800/50">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Document Types Management
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-2 text-sm">
                  Configure and manage document types required for client onboarding
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isLoading || isRefreshing}
                  className="h-11 rounded-xl border-2 shadow-sm transition-all hover:shadow-md"
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
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="h-11 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:shadow-blue-500/30"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Type
                </Button>
              </div>
            </div>
            <div className="relative">
              <Search className="text-muted-foreground absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or description..."
                className="h-12 rounded-xl border-2 bg-white pl-11 pr-4 text-base dark:bg-gray-900"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
              <p className="text-muted-foreground text-sm font-medium">Loading document types...</p>
            </div>
          ) : filteredDocumentTypes.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 px-4 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <FileText className="text-muted-foreground h-8 w-8" />
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {documentTypes.length === 0
                    ? "No document types found"
                    : "No matching document types"}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {documentTypes.length === 0
                    ? "Create your first document type to get started"
                    : "Try adjusting your search query"}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 via-gray-50/80 to-gray-100/50 dark:border-gray-700 dark:from-gray-800/60 dark:via-gray-900/40 dark:to-gray-800/30">
                    <TableHead className="min-w-[80px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      ID
                    </TableHead>
                    <TableHead className="min-w-[220px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Name
                    </TableHead>
                    <TableHead className="min-w-[320px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Description
                    </TableHead>
                    <TableHead className="min-w-[130px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Status
                    </TableHead>
                    <TableHead className="min-w-[130px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Required
                    </TableHead>
                    <TableHead className="min-w-[200px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Created Date
                    </TableHead>
                    <TableHead className="min-w-[220px] px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocumentTypes.map((type: AdminDocumentType) => {
                    const typeId = String(type.id ?? type.type_id ?? "N/A");
                    const typeName = String(type.name ?? "--");
                    const typeDescription = String(type.description ?? "No description provided.");
                    // status: 1 = active, 0 = inactive (can be number or string)
                    const statusValue = type.status;
                    const isActive =
                      statusValue === 1 || statusValue === "1" || statusValue === "ACTIVE";
                    const isRequired = !!(type.is_required || type.required);
                    // Use 'created' and 'updated' fields directly from API
                    const created = type.created;
                    const updated = type.updated;
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
                    const updatedDate = updated
                      ? new Date(String(updated)).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }) +
                        " " +
                        new Date(String(updated)).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "--";

                    return (
                      <TableRow
                        key={typeId}
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
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {typeName}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="py-5">
                          <p className="text-muted-foreground line-clamp-2 max-w-md text-sm leading-relaxed dark:text-gray-300">
                            {typeDescription}
                          </p>
                        </TableCell>
                        <TableCell className="py-5">
                          <Badge
                            variant="outline"
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                              isActive
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                : "border-red-200 bg-red-50 text-red-700 shadow-sm dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
                            }`}
                          >
                            {isActive ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3.5 w-3.5" />
                                Inactive
                              </>
                            )}
                          </Badge>
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
                        <TableCell className="py-5">
                          <div className="text-muted-foreground flex items-center gap-2 text-xs">
                            <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                            <span className="whitespace-nowrap font-medium">{createdDate}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-5">
                          <div className="text-muted-foreground flex items-center gap-2 text-xs">
                            <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                            <span className="whitespace-nowrap font-medium">{updatedDate}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
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
                              onClick={() => toggleStatus(type)}
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

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              Create Document Type
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-base">
              Define a new document type required during client onboarding or KYB review
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-name" className="text-sm font-semibold">
                  Document Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="create-name"
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Example: Passport, National ID, Business License"
                  required
                  className="h-11 rounded-xl border-2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-description" className="text-sm font-semibold">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="create-description"
                  value={createFormData.description}
                  onChange={(e) =>
                    setCreateFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Explain why this document is required and what should be verified..."
                  rows={4}
                  required
                  className="rounded-xl border-2"
                />
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-5 dark:border-gray-800 dark:bg-gray-900/40">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="create-required" className="text-sm font-semibold">
                      Required Document
                    </Label>
                    <p className="text-muted-foreground text-xs">
                      Enable if clients must provide this document to pass KYB verification
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
                    <Label htmlFor="create-active" className="text-sm font-semibold">
                      Active Status
                    </Label>
                    <p className="text-muted-foreground text-xs">
                      Disable to keep it hidden until compliance team approval
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
            </div>
            <DialogFooter className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={createTypeMutation.isPending}
                className="h-11 rounded-xl border-2"
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
                className="h-11 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-blue-800"
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

      {/* Edit Dialog */}
      <Dialog open={!!editingType} onOpenChange={(open) => !open && setEditingType(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl font-bold">
              <Edit className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Edit Document Type
            </DialogTitle>
            <DialogDescription>
              Update the document type information. Changes will be applied immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-sm font-semibold">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="Document type name"
                className="h-11 rounded-xl border-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-sm font-semibold">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder="Document type description"
                rows={4}
                className="rounded-xl border-2"
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-900/40">
              <div className="space-y-0.5">
                <Label htmlFor="edit-required" className="text-sm font-semibold">
                  Required for KYB
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
          <DialogFooter className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setEditingType(null)}
              disabled={updateTypeMutation.isPending}
              className="h-11 rounded-xl border-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
              disabled={updateTypeMutation.isPending || !editFormData.name.trim()}
              className="h-11 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25"
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
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingType} onOpenChange={(open) => !open && setDeletingType(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-red-600 dark:text-red-400">
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
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteTypeMutation.isPending}
              className="h-11 rounded-xl bg-red-600 text-white shadow-lg shadow-red-500/25 hover:bg-red-700"
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
    </div>
  );
}
