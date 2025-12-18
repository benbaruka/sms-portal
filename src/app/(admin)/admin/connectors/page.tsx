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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAlert } from "@/context/AlertProvider";
import type { Connector } from "@/controller/query/connectors/connectors.service";
import {
  useCreateConnector,
  useDeleteConnector,
  useGetAllConnectors,
  useGetConnectorById,
  useUpdateConnector,
} from "@/controller/query/connectors/useConnectors";
import { CreateConnectorRequest } from "@/types";
import {
  CheckCircle2,
  Edit,
  Eye,
  Loader2,
  Network,
  Plug,
  Plus,
  Search,
  Settings,
  Trash2,
  XCircle,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

export default function ConnectorsPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedConnector, setSelectedConnector] = useState<Connector | null>(null);
  const [viewConnectorId, setViewConnectorId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState<CreateConnectorRequest>({
    name: "",
    mcc: "",
    mnc: "",
    scope: "",
    queue_prefix: "",
    status: 1,
  });

  const { showAlert } = useAlert();

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const {
    data: connectorsData,
    isLoading,
    refetch,
  } = useGetAllConnectors({ page: 1, limit: 100 }, true);
  const createMutation = useCreateConnector();
  const updateMutation = useUpdateConnector();
  const deleteMutation = useDeleteConnector();
  const { data: connectorDetails, isLoading: isLoadingDetails } = useGetConnectorById(
    viewConnectorId,
    !!viewConnectorId && isViewDialogOpen
  );

  const connectors = useMemo(() => {
    const payload: unknown = connectorsData?.message || connectorsData?.data || [];
    return Array.isArray(payload) ? (payload as Connector[]) : [];
  }, [connectorsData]);

  const filteredConnectors = useMemo(() => {
    if (!search.trim()) return connectors;
    const searchLower = search.toLowerCase();
    return connectors.filter(
      (connector) =>
        connector.name?.toLowerCase().includes(searchLower) ||
        connector.scope?.toLowerCase().includes(searchLower) ||
        connector.id?.toString().includes(searchLower)
    );
  }, [connectors, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) return;

    if (!formData.name.trim()) {
      showAlert({
        variant: "error",
        title: "Validation Error",
        message: "Connector name is required.",
      });
      return;
    }

    if (!formData.scope?.trim()) {
      showAlert({
        variant: "error",
        title: "Validation Error",
        message: "Scope is required.",
      });
      return;
    }

    if (!formData.queue_prefix?.trim()) {
      showAlert({
        variant: "error",
        title: "Validation Error",
        message: "Queue prefix is required.",
      });
      return;
    }

    // Validate mcc and mnc are valid numbers
    const mccNum =
      typeof formData.mcc === "string" ? parseInt(formData.mcc, 10) : Number(formData.mcc);
    const mncNum =
      typeof formData.mnc === "string" ? parseInt(formData.mnc, 10) : Number(formData.mnc);

    if (
      !formData.mcc ||
      !formData.mnc ||
      isNaN(mccNum) ||
      isNaN(mncNum) ||
      mccNum <= 0 ||
      mncNum <= 0
    ) {
      showAlert({
        variant: "error",
        title: "Validation Error",
        message: "MCC and MNC must be valid positive numbers.",
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        data: {
          name: formData.name.trim(),
          scope: formData.scope.trim(),
          queue_prefix: formData.queue_prefix.trim(),
          mcc: mccNum, // Ensure it's a number
          mnc: mncNum, // Ensure it's a number
          status: formData.status ?? 1,
        },
        apiKey,
      });
      setIsCreateDialogOpen(false);
      setFormData({
        name: "",
        mcc: "",
        mnc: "",
        scope: "",
        queue_prefix: "",
        status: 1,
      });
      await refetch();
    } catch {
      // Error handled in mutation
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey || !selectedConnector?.id) return;

    if (!formData.name.trim()) {
      showAlert({
        variant: "error",
        title: "Validation Error",
        message: "Connector name is required.",
      });
      return;
    }

    if (!formData.scope?.trim()) {
      showAlert({
        variant: "error",
        title: "Validation Error",
        message: "Scope is required.",
      });
      return;
    }

    if (!formData.queue_prefix?.trim()) {
      showAlert({
        variant: "error",
        title: "Validation Error",
        message: "Queue prefix is required.",
      });
      return;
    }

    if (!formData.mcc || !formData.mnc) {
      showAlert({
        variant: "error",
        title: "Validation Error",
        message: "MCC and MNC are required.",
      });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        data: {
          id: selectedConnector.id,
          name: formData.name.trim(),
          scope: formData.scope.trim(),
          queue_prefix: formData.queue_prefix.trim(),
          mcc: formData.mcc,
          mnc: formData.mnc,
          status: formData.status ?? 1,
        },
        apiKey,
      });
      setIsEditDialogOpen(false);
      setSelectedConnector(null);
      setFormData({
        name: "",
        mcc: "",
        mnc: "",
        scope: "",
        queue_prefix: "",
        status: 1,
      });
      await refetch();
    } catch {
      // Error handled in mutation
    }
  };

  const openViewDialog = (connector: Connector) => {
    setSelectedConnector(connector);
    setViewConnectorId(connector.id);
    setIsViewDialogOpen(true);
  };

  const openEditDialog = (connector: Connector) => {
    setSelectedConnector(connector);
    setFormData({
      name: connector.name || "",
      mcc: connector.mcc?.toString() || "",
      mnc: connector.mnc?.toString() || "",
      scope: connector.scope || "",
      queue_prefix: connector.queue_prefix || "",
      status: connector.status ?? 1,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!apiKey || !selectedConnector?.id) return;
    try {
      await deleteMutation.mutateAsync({
        data: { connector_id: selectedConnector.id },
        apiKey,
      });
      setIsDeleteDialogOpen(false);
      setSelectedConnector(null);
      await refetch();
    } catch {
      // Error handled in mutation
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="rounded-xl border border-blue-200/50 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 p-6 shadow-sm dark:border-blue-800/50 md:p-8">
        <div className="mb-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="rounded-xl bg-blue-500 p-2 shadow-md sm:p-3">
              <Plug className="h-5 w-5 text-white sm:h-6 sm:w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                Connector Management
              </h1>
              <p className="text-muted-foreground mt-1 text-sm dark:text-gray-400 sm:text-base">
                Manage SMS connectors and network configurations
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="h-10 w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:shadow-blue-500/30 sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Connector
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="border-b border-gray-200/50 p-6 dark:border-gray-800/50">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                  <Plug className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                All Connectors
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2 text-sm">
                List of all SMS connectors and network configurations
              </CardDescription>
            </div>
          </div>
          <div className="relative mt-4">
            <Search className="text-muted-foreground absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search connectors by name, scope, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 rounded-xl border-2 bg-white pl-11 pr-4 text-base dark:bg-gray-900"
            />
          </div>
        </CardHeader>
      </Card>

      {/* Connectors Table */}
      <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
              <p className="text-muted-foreground text-sm font-medium">Loading connectors...</p>
            </div>
          ) : filteredConnectors.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 px-4 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <Plug className="text-muted-foreground h-8 w-8" />
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {connectors.length === 0 ? "No connectors found" : "No matching connectors"}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {connectors.length === 0
                    ? "Create your first connector to get started"
                    : "Try adjusting your search query"}
                </p>
              </div>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-blue-800"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Connector
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200/50 bg-white shadow-sm dark:border-gray-800/50 dark:bg-gray-900/50">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-gray-200 bg-gradient-to-r from-blue-50/80 via-cyan-50/60 to-blue-50/80 dark:border-gray-700 dark:from-blue-950/40 dark:via-cyan-950/30 dark:to-blue-950/40">
                    <TableHead className="min-w-[80px] px-6 py-5 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">
                      ID
                    </TableHead>
                    <TableHead className="min-w-[180px] px-6 py-5 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">
                      Name
                    </TableHead>
                    <TableHead className="min-w-[120px] px-6 py-5 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">
                      Scope
                    </TableHead>
                    <TableHead className="min-w-[140px] px-6 py-5 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">
                      Queue Prefix
                    </TableHead>
                    <TableHead className="min-w-[120px] px-6 py-5 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">
                      MCC/MNC
                    </TableHead>
                    <TableHead className="min-w-[120px] px-6 py-5 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">
                      Status
                    </TableHead>
                    <TableHead className="min-w-[120px] px-6 py-5 text-right text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConnectors.map((connector, index) => (
                    <TableRow
                      key={connector.id}
                      className={`group border-b border-gray-100/80 transition-all duration-300 ${
                        index % 2 === 0
                          ? "bg-white dark:bg-gray-900"
                          : "bg-gray-50/30 dark:bg-gray-900/50"
                      } hover:bg-gradient-to-r hover:from-blue-50/70 hover:via-cyan-50/50 hover:to-blue-50/70 hover:shadow-sm dark:border-gray-800/50 dark:hover:from-blue-950/30 dark:hover:via-cyan-950/20 dark:hover:to-blue-950/30`}
                    >
                      <TableCell className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 shadow-sm">
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                              {connector.id}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {connector.name || "N/A"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <Badge
                          variant="outline"
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg border-2 border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-all dark:border-gray-700 dark:from-gray-800 dark:to-gray-900 dark:text-gray-200"
                        >
                          {connector.scope || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <div className="rounded-lg bg-gray-100/80 px-3 py-1.5 dark:bg-gray-800/50">
                          <code className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {connector.queue_prefix || "N/A"}
                          </code>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <div className="rounded-lg bg-blue-50/80 px-3 py-1.5 dark:bg-blue-950/30">
                          <div className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                            {connector.mcc || "N/A"}/{connector.mnc || "N/A"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <Badge
                          variant="outline"
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm ${
                            connector.status === 1
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
                          }`}
                        >
                          {connector.status === 1 ? (
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
                      <TableCell className="px-6 py-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openViewDialog(connector)}
                            className="h-10 w-10 rounded-xl border-2 bg-white p-0 shadow-sm transition-all hover:border-green-300 hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 hover:shadow-md dark:bg-gray-900 dark:hover:border-green-600 dark:hover:from-green-950/30 dark:hover:to-emerald-950/20"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(connector)}
                            className="h-10 w-10 rounded-xl border-2 bg-white p-0 shadow-sm transition-all hover:border-blue-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-cyan-50 hover:shadow-md dark:bg-gray-900 dark:hover:border-blue-600 dark:hover:from-blue-950/30 dark:hover:to-cyan-950/20"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedConnector(connector);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="h-10 w-10 rounded-xl border-2 border-red-200 bg-white p-0 text-red-700 shadow-sm transition-all hover:border-red-300 hover:bg-gradient-to-br hover:from-red-50 hover:to-rose-50 hover:shadow-md dark:border-red-800 dark:bg-gray-900 dark:text-red-300 dark:hover:border-red-600 dark:hover:from-red-950/30 dark:hover:to-rose-950/20"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Connector Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            // Clear form data when dialog closes
            setFormData({
              name: "",
              mcc: "",
              mnc: "",
              scope: "",
              queue_prefix: "",
              status: 1,
            });
          }
        }}
      >
        <DialogContent className="rounded-3xl sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              Create Connector
            </DialogTitle>
            <DialogDescription>Create a new SMS connector configuration.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="connector-name">Connector Name *</Label>
                <Input
                  id="connector-name"
                  placeholder="e.g., Safaricom, Airtel, MTN"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-2 h-11 rounded-xl border-2"
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="scope">Scope *</Label>
                  <Input
                    id="scope"
                    placeholder="e.g., local, international"
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                    className="mt-2 h-11 rounded-xl border-2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="queue-prefix">Queue Prefix *</Label>
                  <Input
                    id="queue-prefix"
                    placeholder="e.g., safaricom, airtel"
                    value={formData.queue_prefix}
                    onChange={(e) => setFormData({ ...formData, queue_prefix: e.target.value })}
                    className="mt-2 h-11 rounded-xl border-2"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="mcc">MCC (Mobile Country Code) *</Label>
                  <Input
                    id="mcc"
                    type="number"
                    placeholder="e.g., 639"
                    value={formData.mcc}
                    onChange={(e) => setFormData({ ...formData, mcc: e.target.value })}
                    className="mt-2 h-11 rounded-xl border-2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="mnc">MNC (Mobile Network Code) *</Label>
                  <Input
                    id="mnc"
                    type="number"
                    placeholder="e.g., 1"
                    value={formData.mnc}
                    onChange={(e) => setFormData({ ...formData, mnc: e.target.value })}
                    className="mt-2 h-11 rounded-xl border-2"
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setFormData({
                    name: "",
                    mcc: "",
                    mnc: "",
                    scope: "",
                    queue_prefix: "",
                    status: 1,
                  });
                }}
                className="h-11 rounded-xl border-2 bg-white shadow-sm transition-all hover:bg-gray-50 hover:shadow-md dark:bg-gray-900 dark:hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="h-11 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-blue-800"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Connector
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Connector Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            // Clear form data and selected connector when dialog closes
            setSelectedConnector(null);
            setFormData({
              name: "",
              mcc: "",
              mnc: "",
              scope: "",
              queue_prefix: "",
              status: 1,
            });
          }
        }}
      >
        <DialogContent className="rounded-3xl sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" />
              Edit Connector
            </DialogTitle>
            <DialogDescription>Update connector configuration.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-connector-name">Connector Name *</Label>
                <Input
                  id="edit-connector-name"
                  placeholder="e.g., Safaricom, Airtel, MTN"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-2 h-11 rounded-xl border-2"
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="edit-scope">Scope *</Label>
                  <Input
                    id="edit-scope"
                    placeholder="e.g., local, international"
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                    className="mt-2 h-11 rounded-xl border-2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-queue-prefix">Queue Prefix *</Label>
                  <Input
                    id="edit-queue-prefix"
                    placeholder="e.g., safaricom, airtel"
                    value={formData.queue_prefix}
                    onChange={(e) => setFormData({ ...formData, queue_prefix: e.target.value })}
                    className="mt-2 h-11 rounded-xl border-2"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="edit-mcc">MCC (Mobile Country Code) *</Label>
                  <Input
                    id="edit-mcc"
                    type="number"
                    placeholder="e.g., 639"
                    value={formData.mcc}
                    onChange={(e) => setFormData({ ...formData, mcc: e.target.value })}
                    className="mt-2 h-11 rounded-xl border-2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-mnc">MNC (Mobile Network Code) *</Label>
                  <Input
                    id="edit-mnc"
                    type="number"
                    placeholder="e.g., 1"
                    value={formData.mnc}
                    onChange={(e) => setFormData({ ...formData, mnc: e.target.value })}
                    className="mt-2 h-11 rounded-xl border-2"
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedConnector(null);
                  setFormData({
                    name: "",
                    mcc: "",
                    mnc: "",
                    scope: "",
                    queue_prefix: "",
                    status: 1,
                  });
                }}
                className="h-11 rounded-xl border-2 bg-white shadow-sm transition-all hover:bg-gray-50 hover:shadow-md dark:bg-gray-900 dark:hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="h-11 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-blue-800"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="mr-2 h-4 w-4" />
                    Update Connector
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Connector Details Dialog */}
      <Dialog
        open={isViewDialogOpen}
        onOpenChange={(open) => {
          setIsViewDialogOpen(open);
          if (!open) {
            setViewConnectorId(null);
            setSelectedConnector(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-600" />
              Connector Details
            </DialogTitle>
            <DialogDescription>
              Complete information about the connector configuration.
            </DialogDescription>
          </DialogHeader>
          {isLoadingDetails ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Loading connector details...
              </p>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              {(() => {
                const connector =
                  connectorDetails?.message || connectorDetails?.data || selectedConnector;
                if (!connector) {
                  return (
                    <div className="flex flex-col items-center justify-center gap-3 py-8">
                      <Plug className="h-12 w-12 text-gray-400" />
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Connector details not available
                      </p>
                    </div>
                  );
                }
                return (
                  <>
                    {/* Basic Information */}
                    <div className="rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 dark:border-gray-800 dark:from-gray-900/50 dark:to-gray-800/30">
                      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                        <Plug className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Basic Information
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Connector ID
                          </Label>
                          <div className="text-base font-bold text-gray-900 dark:text-white">
                            #{connector.id}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Name
                          </Label>
                          <div className="text-base font-bold text-gray-900 dark:text-white">
                            {connector.name || "N/A"}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Scope
                          </Label>
                          <Badge
                            variant="outline"
                            className="inline-flex items-center gap-1.5 rounded-lg border-2 border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm dark:border-gray-700 dark:from-gray-800 dark:to-gray-900 dark:text-gray-200"
                          >
                            {connector.scope || "N/A"}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Status
                          </Label>
                          <Badge
                            variant="outline"
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm ${
                              connector.status === 1
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
                            }`}
                          >
                            {connector.status === 1 ? (
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
                        </div>
                      </div>
                    </div>

                    {/* Network Configuration */}
                    <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 dark:border-blue-800 dark:from-blue-950/50 dark:to-cyan-950/30">
                      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                        <Network className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Network Configuration
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            MCC (Mobile Country Code)
                          </Label>
                          <div className="rounded-lg bg-blue-50/80 px-3 py-2 dark:bg-blue-950/30">
                            <div className="text-base font-bold text-blue-700 dark:text-blue-400">
                              {connector.mcc || "N/A"}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            MNC (Mobile Network Code)
                          </Label>
                          <div className="rounded-lg bg-blue-50/80 px-3 py-2 dark:bg-blue-950/30">
                            <div className="text-base font-bold text-blue-700 dark:text-blue-400">
                              {connector.mnc || "N/A"}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Queue Prefix
                          </Label>
                          <div className="rounded-lg bg-gray-100/80 px-3 py-2 dark:bg-gray-800/50">
                            <code className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {connector.queue_prefix || "N/A"}
                            </code>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Advanced Settings */}
                    {(connector.supports_batch !== undefined ||
                      connector.batch_size !== undefined) && (
                      <div className="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-6 dark:border-purple-800 dark:from-purple-950/50 dark:to-indigo-950/30">
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                          <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          Advanced Settings
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                          {connector.supports_batch !== undefined && (
                            <div className="space-y-2">
                              <Label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Supports Batch
                              </Label>
                              <Badge
                                variant="outline"
                                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm ${
                                  connector.supports_batch === 1
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                    : "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                }`}
                              >
                                {connector.supports_batch === 1 ? "Yes" : "No"}
                              </Badge>
                            </div>
                          )}
                          {connector.batch_size !== undefined && (
                            <div className="space-y-2">
                              <Label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Batch Size
                              </Label>
                              <div className="text-base font-bold text-gray-900 dark:text-white">
                                {connector.batch_size || "N/A"}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsViewDialogOpen(false);
                setViewConnectorId(null);
                setSelectedConnector(null);
              }}
              className="h-11 rounded-xl border-2 bg-white shadow-sm transition-all hover:bg-gray-50 hover:shadow-md dark:bg-gray-900 dark:hover:bg-gray-800"
            >
              Close
            </Button>
            {selectedConnector && (
              <Button
                onClick={() => {
                  setIsViewDialogOpen(false);
                  openEditDialog(selectedConnector);
                }}
                className="h-11 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-blue-800"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Connector
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Connector Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            // Clear selected connector when dialog closes
            setSelectedConnector(null);
          }
        }}
      >
        <DialogContent className="rounded-3xl sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete Connector
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete connector &quot;{selectedConnector?.name}&quot;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedConnector(null);
              }}
              className="h-11 rounded-xl border-2 bg-white shadow-sm transition-all hover:bg-gray-50 hover:shadow-md dark:bg-gray-900 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="h-11 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25 transition-all hover:from-red-700 hover:to-red-800"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
