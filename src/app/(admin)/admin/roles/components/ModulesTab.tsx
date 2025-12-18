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
  useAdminModulesList,
  useCreateAdminModule,
  useDeleteAdminModule,
} from "@/controller/query/admin/modules/useAdminModules";
import type { AdminModule } from "@/controller/query/admin/modules/modules.service";
import { Calendar, Loader2, Plus, RefreshCw, Search, Settings2, Trash2 } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";

export default function ModulesTab() {
  const { showAlert } = useAlert();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<AdminModule | null>(null);
  const [formData, setFormData] = useState({
    name: "", // This will be sent as 'module' to API
    description: "",
  });

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const {
    data: modulesResponse,
    isLoading,
    isFetching,
    refetch,
  } = useAdminModulesList(apiKey, !!apiKey);

  const modules = useMemo(() => {
    if (!modulesResponse) return [];
    // API returns: { status: 200, message: [{ id, module, actions }] }
    const payload: unknown =
      modulesResponse.message ||
      modulesResponse.modules ||
      modulesResponse.data?.modules ||
      modulesResponse.data?.data ||
      [];
    return Array.isArray(payload) ? payload : [];
  }, [modulesResponse]);

  const filteredModules = useMemo(() => {
    if (!search.trim()) return modules;
    const searchLower = search.toLowerCase();
    return modules.filter(
      (module: AdminModule) =>
        module.module?.toLowerCase().includes(searchLower) ||
        module.name?.toLowerCase().includes(searchLower) ||
        module.code?.toLowerCase().includes(searchLower) ||
        module.description?.toLowerCase().includes(searchLower)
    );
  }, [modules, search]);

  const createMutation = useCreateAdminModule();
  const deleteMutation = useDeleteAdminModule();

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!apiKey) return;

    if (!formData.name.trim()) {
      showAlert({
        variant: "error",
        title: "Validation Error",
        message: "Module name is required.",
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        data: {
          module: formData.name.trim(), // API expects 'module' field
          description: formData.description.trim() || undefined,
        },
        apiKey,
      });
      setIsCreateDialogOpen(false);
      setFormData({ name: "", description: "" });
      await refetch();
    } catch {
      // Error handled in mutation
    }
  };

  const handleDelete = async () => {
    if (!apiKey || !selectedModule?.id) return;

    try {
      await deleteMutation.mutateAsync({
        data: {
          id: selectedModule.id, // Use 'id' to match API structure
        },
        apiKey,
      });
      setIsDeleteDialogOpen(false);
      setSelectedModule(null);
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
                Modules Management
              </CardTitle>
              <CardDescription className="mt-1">
                Create and manage system modules for permissions
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
                Create Module
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
                placeholder="Search modules by name..."
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
          ) : filteredModules.length === 0 ? (
            <div className="py-12 text-center">
              <Settings2 className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-muted-foreground mt-4 text-sm">
                {search
                  ? "No modules found matching your search."
                  : "No modules found. Create your first module."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredModules.map((module: AdminModule) => (
                <Card
                  key={module.id}
                  className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  <CardHeader className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                          {module.module || module.name || "Unnamed Module"}
                        </CardTitle>
                        <CardDescription className="mt-1 text-xs">
                          ID: {module.id || "N/A"}
                        </CardDescription>
                      </div>
                      {module.actions && Array.isArray(module.actions) && (
                        <Badge variant="secondary" className="text-xs">
                          {module.actions.length} action{module.actions.length !== 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {module.description && (
                      <p className="text-muted-foreground mb-3 text-sm">{module.description}</p>
                    )}
                    {module.created && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(module.created), "MMM dd, yyyy")}
                      </div>
                    )}
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedModule(module);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="h-8 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                        title="Delete module"
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

      {/* Create Module Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              Create Module
            </DialogTitle>
            <DialogDescription>
              Create a new system module. Modules are used to organize permissions.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="module-name">Module Name *</Label>
                <Input
                  id="module-name"
                  placeholder="e.g., user, client, message"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-2"
                  required
                />
                <p className="text-muted-foreground mt-1 text-xs">
                  Module identifier (lowercase, no spaces, e.g., "user", "client")
                </p>
              </div>
              <div>
                <Label htmlFor="module-description">Description (Optional)</Label>
                <Textarea
                  id="module-description"
                  placeholder="Describe what this module is for..."
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
                    Create Module
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Module Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete Module
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this module? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground text-sm">
              Module: <strong>{selectedModule?.module || selectedModule?.name || "Unknown"}</strong>{" "}
              (ID: {selectedModule?.id || "N/A"})
            </p>
            <p className="text-muted-foreground mt-2 text-sm">
              This will permanently delete the module and may affect associated permissions.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedModule(null);
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
                  Delete Module
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
