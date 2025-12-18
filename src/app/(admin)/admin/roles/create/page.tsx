"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Shield, Save, ArrowLeft, Search, Key } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAlert } from "@/context/AlertProvider";
import {
  useAdminAvailablePermissions,
  useCreateAdminRole,
} from "@/controller/query/admin/roles/useAdminRoles";
import type { AdminRolePermission } from "@/types";

interface PermissionRecord {
  id?: number | string;
  name?: string;
  code?: string;
  description?: string;
  module?: string;
  action?: string;
}

export default function CreateRolePage() {
  const { showAlert } = useAlert();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [permissionSearch, setPermissionSearch] = useState("");

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const { data: permissionsResponse, isLoading: isLoadingPermissions } =
    useAdminAvailablePermissions(apiKey, !!apiKey);

  const createRoleMutation = useCreateAdminRole();

  const permissions = useMemo(() => {
    let raw: unknown;
    if (Array.isArray(permissionsResponse)) {
      raw = permissionsResponse;
    } else if (permissionsResponse) {
      const response = permissionsResponse as {
        permissions?: AdminRolePermission[];
        data?: { permissions?: AdminRolePermission[] } | AdminRolePermission[];
        message?: { permissions?: AdminRolePermission[] } | AdminRolePermission[];
      };
      raw =
        response.permissions ||
        (Array.isArray(response.data) ? response.data : response.data?.permissions) ||
        (Array.isArray(response.message) ? response.message : response.message?.permissions);
    }
    const flat = Array.isArray(raw) ? raw : [];
    if (!permissionSearch) return flat;
    return flat.filter((permission: PermissionRecord) => {
      const target =
        `${permission.name || ""} ${permission.code || ""} ${permission.module || ""} ${permission.action || ""}`.toLowerCase();
      return target.includes(permissionSearch.toLowerCase());
    });
  }, [permissionsResponse, permissionSearch]);

  const togglePermission = (permissionId?: string | number) => {
    if (!permissionId) return;
    setSelectedPermissions((current) => {
      const next = new Set(current);
      if (next.has(String(permissionId))) {
        next.delete(String(permissionId));
      } else {
        next.add(String(permissionId));
      }
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiKey) {
      showAlert({
        variant: "error",
        title: "Missing API key",
        message: "Please sign in again to create roles.",
      });
      return;
    }

    try {
      await createRoleMutation.mutateAsync({
        data: {
          name: formData.name.trim(),
          description: formData.description.trim(),
          permissions: Array.from(selectedPermissions),
        },
        apiKey,
      });
      setFormData({ name: "", description: "" });
      setSelectedPermissions(new Set());
      setPermissionSearch("");
    } catch {
      // Alert handled inside mutation
    }
  };

  const isSubmitting = createRoleMutation.isPending;

  return (
    <div className="space-y-8 px-4 py-4 sm:space-y-10 sm:px-6 sm:py-6">
      <header className="rounded-3xl border border-gray-200 bg-white shadow-xl shadow-brand-500/10 dark:border-gray-900 dark:bg-gray-950">
        <div className="flex flex-col gap-6 px-6 py-6 sm:px-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 p-3 shadow-lg shadow-brand-500/40 sm:p-4">
              <Shield className="h-6 w-6 text-white sm:h-8 sm:w-8" />
            </div>
            <div>
              <h1 className="text-[28px] font-semibold tracking-tight text-gray-900 dark:text-white sm:text-[32px]">
                Create a new role
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed dark:text-gray-300 sm:text-base">
                Define a security profile by naming the role, describing its scope and selecting the
                exact permissions it should grant.
              </p>
            </div>
          </div>
          <Link href="/admin/roles" className="w-full sm:w-auto">
            <Button variant="outline" className="h-10 w-full rounded-xl border-2 sm:h-11 sm:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to roles
            </Button>
          </Link>
        </div>
      </header>

      <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:gap-3 sm:text-xl">
            <Shield className="h-4 w-4 text-brand-500 sm:h-5 sm:w-5" />
            Role details
          </CardTitle>
          <CardDescription className="mt-1 text-sm text-gray-600 dark:text-gray-400 sm:mt-2">
            Provide a name and description so other administrators understand the purpose of this
            role.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <CardContent className="flex-1 space-y-6 p-4 pt-0 sm:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Role name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Example: Finance Manager"
                  required
                  className="h-11 rounded-2xl border-2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, description: event.target.value }))
                  }
                  placeholder="Shortly describe what this role is allowed to do."
                  rows={4}
                  required
                  className="rounded-2xl border-2"
                />
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-900/40 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
                    Attach permissions
                  </h3>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    Select one or more permissions. The selected set will be granted to any user
                    assigned to this role.
                  </p>
                </div>
                <Badge variant="outline" className="rounded-xl">
                  <Key className="mr-1 h-3.5 w-3.5" />
                  {selectedPermissions.size} selected
                </Badge>
              </div>
              <div className="relative">
                <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  value={permissionSearch}
                  onChange={(event) => setPermissionSearch(event.target.value)}
                  placeholder="Search permission by name, module, or code..."
                  className="h-10 rounded-xl border-2 pl-9"
                />
              </div>
              <div className="max-h-64 divide-y divide-gray-100 overflow-y-auto rounded-xl border border-gray-200 bg-white dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-950/60">
                {isLoadingPermissions ? (
                  <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-10">
                    <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
                    Loading permissions...
                  </div>
                ) : permissions.length === 0 ? (
                  <div className="text-muted-foreground py-10 text-center text-sm">
                    No permissions match this search.
                  </div>
                ) : (
                  permissions.map((permission: PermissionRecord) => {
                    const id = String(permission.id ?? permission.code ?? permission.name);
                    const isChecked = selectedPermissions.has(id);
                    return (
                      <label
                        key={id}
                        className="flex cursor-pointer items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-900/40 sm:p-4"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(id)}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {permission.name || permission.code || "Unnamed permission"}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {permission.description || "No description provided."}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {permission.module && (
                              <Badge variant="outline" className="rounded-xl text-xs">
                                Module: {permission.module}
                              </Badge>
                            )}
                            {permission.action && (
                              <Badge variant="outline" className="rounded-xl text-xs">
                                Action: {permission.action}
                              </Badge>
                            )}
                            {permission.code && (
                              <Badge variant="outline" className="rounded-xl text-xs">
                                Code: {permission.code}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="mt-auto border-t border-gray-100 p-4 pt-0 dark:border-gray-800 sm:p-6">
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-muted-foreground text-xs">
                Role changes apply immediately. Make sure to communicate the permission set to your
                colleagues.
              </div>
              <div className="flex gap-3">
                <Link href="/admin/roles/all">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    className="h-10 rounded-xl border-2"
                  >
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.name || !formData.description}
                  className="h-10 rounded-xl px-6 shadow-md shadow-brand-500/15"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create role
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
