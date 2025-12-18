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
import { Textarea } from "@/components/ui/textarea";
import { useAlert } from "@/context/AlertProvider";
import {
  useAdminActionsList,
  useCreateAdminAction,
  useDeleteAdminAction,
} from "@/controller/query/admin/actions/useAdminActions";
import type { AdminAction } from "@/controller/query/admin/actions/actions.service";
import { Calendar, Key, Loader2, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";

export default function ActionsTab() {
  const { showAlert } = useAlert();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<AdminAction | null>(null);
  const [formData, setFormData] = useState({
    name: "", // The action name (e.g., "create", "read", "update", "delete")
    description: "",
  });

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const {
    data: actionsResponse,
    isLoading,
    isFetching,
    refetch,
  } = useAdminActionsList(apiKey, !!apiKey);

  const actions = useMemo(() => {
    if (!actionsResponse) return [];
    // API returns: { status: 200, message: [{ id, name }] }
    const payload: unknown =
      actionsResponse.message ||
      actionsResponse.actions ||
      actionsResponse.data?.actions ||
      actionsResponse.data?.data ||
      [];
    return Array.isArray(payload) ? payload : [];
  }, [actionsResponse]);

  const filteredActions = useMemo(() => {
    if (!search.trim()) return actions;
    const searchLower = search.toLowerCase();
    return actions.filter(
      (action: AdminAction) =>
        action.name?.toLowerCase().includes(searchLower) ||
        action.code?.toLowerCase().includes(searchLower) ||
        action.description?.toLowerCase().includes(searchLower) ||
        action.module?.toLowerCase().includes(searchLower)
    );
  }, [actions, search]);

  const createMutation = useCreateAdminAction();
  const deleteMutation = useDeleteAdminAction();

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!apiKey) {
      showAlert({
        variant: "error",
        title: "Missing API key",
        message: "Please sign in again to create actions.",
      });
      return;
    }

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      showAlert({
        variant: "error",
        title: "Validation Error",
        message: "Action name is required.",
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        data: {
          action: trimmedName, // Backend expects "action" field, not "name"
          description: formData.description.trim() || undefined,
        },
        apiKey,
      });
      // Only close dialog and reset form on success
      setIsCreateDialogOpen(false);
      setFormData({ name: "", description: "" });
      await refetch();
    } catch (error) {
      // Error is handled by mutation's onError, but we keep dialog open so user can fix it
      // Log error for debugging
    }
  };

  const handleDelete = async () => {
    if (!apiKey || !selectedAction?.id) return;

    try {
      await deleteMutation.mutateAsync({
        data: {
          id: selectedAction.id, // Use 'id' to match API structure
        },
        apiKey,
      });
      setIsDeleteDialogOpen(false);
      setSelectedAction(null);
      await refetch();
    } catch {
      // Error handled in mutation
    }
  };

  return (
    <>
      <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="border-b border-gray-200 p-4 dark:border-gray-800 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                Actions Management
              </CardTitle>
              <CardDescription className="mt-1">
                Create and manage actions for permissions (e.g., create, read, update, delete)
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="rounded-xl border-2"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/15 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Action
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search actions by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-xl border-2 pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : filteredActions.length === 0 ? (
            <div className="py-12 text-center">
              <Key className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-muted-foreground mt-4 text-sm">
                {search
                  ? "No actions found matching your search."
                  : "No actions found. Create your first action."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredActions.map((action: AdminAction) => (
                <Card
                  key={action.id}
                  className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  <CardHeader className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                          {action.name || "Unnamed Action"}
                        </CardTitle>
                        <CardDescription className="mt-1 text-xs">
                          ID: {action.id || "N/A"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {action.description && (
                      <p className="text-muted-foreground mb-3 text-sm">{action.description}</p>
                    )}
                    {action.created && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(action.created), "MMM dd, yyyy")}
                      </div>
                    )}
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedAction(action);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="h-8 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                        title="Delete action"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Action Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              Create Action
            </DialogTitle>
            <DialogDescription>
              Create a new action. Actions are used to define permissions (e.g., create, read,
              update, delete).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="action-name">Action Name *</Label>
                <Input
                  id="action-name"
                  placeholder="e.g., create, read, update, delete"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-2"
                  required
                />
                <p className="text-muted-foreground mt-1 text-xs">
                  Action identifier (lowercase, no spaces, e.g., "create", "read", "update",
                  "delete")
                </p>
              </div>
              <div>
                <Label htmlFor="action-description">Description (Optional)</Label>
                <Textarea
                  id="action-description"
                  placeholder="Describe what this action does..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-2"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setFormData({ name: "", description: "" });
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Action
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Action Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete Action
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this action? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground text-sm">
              Action: <strong>{selectedAction?.name || "Unknown"}</strong> (ID:{" "}
              {selectedAction?.id || "N/A"})
            </p>
            <p className="text-muted-foreground mt-2 text-sm">
              This will permanently delete the action and may affect associated permissions.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedAction(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Action
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
