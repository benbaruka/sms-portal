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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Shield, ArrowLeft, Key, Search } from "lucide-react";
import { useAlert } from "@/context/AlertProvider";
import {
  useAdminRolesList,
  useAssignPermissionToRole,
} from "@/controller/query/admin/roles/useAdminRoles";
import { useAdminModulesList } from "@/controller/query/admin/modules/useAdminModules";
import { useAdminActionsList } from "@/controller/query/admin/actions/useAdminActions";
import type { AdminRolePermission } from "@/types";

interface PermissionRecord {
  id?: number | string;
  name?: string;
  code?: string;
  description?: string;
  module?: string;
  action?: string;
}

export default function AssignPermissionPage() {
  const { showAlert } = useAlert();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [roleId, setRoleId] = useState("");
  const [permissionSearch, setPermissionSearch] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  // Get role_id from URL params if present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const roleIdFromUrl = urlParams.get("role_id");
      if (roleIdFromUrl) {
        setRoleId(roleIdFromUrl);
      }
    }
  }, []);

  const { data: rolesResponse, refetch: refetchRoles } = useAdminRolesList(
    { page: 1, per_page: 100 },
    apiKey,
    !!apiKey
  );

  // Fetch modules and actions separately to combine them into permissions
  const { data: modulesResponse, isLoading: isLoadingModules } = useAdminModulesList(
    apiKey,
    !!apiKey
  );
  const { data: actionsResponse, isLoading: isLoadingActions } = useAdminActionsList(
    apiKey,
    !!apiKey
  );

  const assignMutation = useAssignPermissionToRole();

  const isLoadingPermissions = isLoadingModules || isLoadingActions;

  const roles = useMemo(() => {
    const payload: unknown =
      rolesResponse?.roles ||
      rolesResponse?.data?.roles ||
      rolesResponse?.data?.data ||
      rolesResponse?.message?.roles ||
      rolesResponse?.message?.data ||
      rolesResponse?.message ||
      [];
    return Array.isArray(payload) ? payload : [];
  }, [rolesResponse]);

  // Extract modules from response
  const modules = useMemo(() => {
    if (!modulesResponse) return [];
    const payload: unknown =
      modulesResponse.message ||
      modulesResponse.modules ||
      modulesResponse.data?.modules ||
      modulesResponse.data?.data ||
      [];
    return Array.isArray(payload) ? payload : [];
  }, [modulesResponse]);

  // Extract actions from response
  const actions = useMemo(() => {
    if (!actionsResponse) return [];
    const payload: unknown =
      actionsResponse.message ||
      actionsResponse.actions ||
      actionsResponse.data?.actions ||
      actionsResponse.data?.data ||
      [];
    return Array.isArray(payload) ? payload : [];
  }, [actionsResponse]);

  // Generate permissions by combining modules and actions
  const permissions = useMemo(() => {
    const permissionsList: PermissionRecord[] = [];

    // Combine each module with each action to create permissions
    modules.forEach((module: { id?: number | string; module?: string; name?: string }) => {
      const moduleName = module.module || module.name || "";
      if (!moduleName) return;

      actions.forEach((action: { id?: number | string; action?: string; name?: string }) => {
        const actionName = action.action || action.name || "";
        if (!actionName) return;

        // Create permission record: module.action
        permissionsList.push({
          id: `${moduleName}:${actionName}`, // Unique ID for the permission
          name: `${moduleName}.${actionName}`, // Display name: "user.create"
          code: `${moduleName}.${actionName}`, // Code: "user.create"
          module: moduleName, // Module: "user"
          action: actionName, // Action: "create"
          description: `Permission to ${actionName} ${moduleName}`,
        });
      });
    });

    // Filter by search if provided
    if (!permissionSearch) return permissionsList;
    const searchLower = permissionSearch.toLowerCase();
    return permissionsList.filter((permission: PermissionRecord) => {
      const target =
        `${permission.name || ""} ${permission.code || ""} ${permission.module || ""} ${permission.action || ""}`.toLowerCase();
      return target.includes(searchLower);
    });
  }, [modules, actions, permissionSearch]);

  const groupedPermissions = useMemo(() => {
    const grouped = new Map<string, PermissionRecord[]>();
    permissions.forEach((permission: PermissionRecord) => {
      const category = permission.module || "General";
      if (!grouped.has(category)) grouped.set(category, []);
      grouped.get(category)!.push(permission);
    });
    return grouped;
  }, [permissions]);

  // Store selected permissions as "module:action" strings
  const togglePermission = (module: string, action: string) => {
    const permissionKey = `${module}:${action}`;
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(permissionKey)) {
        next.delete(permissionKey);
      } else {
        next.add(permissionKey);
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
        message: "Please sign in again to assign permissions.",
      });
      return;
    }
    if (!roleId) {
      showAlert({
        variant: "error",
        title: "Role required",
        message: "Select a role before assigning permissions.",
      });
      return;
    }
    if (selectedPermissions.size === 0) {
      showAlert({
        variant: "error",
        title: "No permissions selected",
        message: "Choose at least one permission to assign.",
      });
      return;
    }

    try {
      await Promise.all(
        Array.from(selectedPermissions).map((permissionKey) => {
          // permissionKey format: "module:action"
          const [module, permission] = permissionKey.split(":");
          return assignMutation.mutateAsync({
            data: {
              role_id: roleId,
              module: module,
              permission: permission, // This is the action name
            },
            apiKey,
          });
        })
      );
      // Refetch roles to update the table with new permissions count
      await refetchRoles();

      showAlert({
        variant: "success",
        title: "Permissions assigned",
        message: "Selected permissions were assigned successfully.",
      });
      setSelectedPermissions(new Set());
      setPermissionSearch("");
    } catch {
      // individual mutation handles alert; additional alerts not required
    }
  };

  const isSubmitting = assignMutation.isPending;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="rounded-xl border border-blue-200/50 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 p-6 shadow-sm dark:border-blue-800/50 md:p-8">
        <div className="mb-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="rounded-xl bg-blue-500 p-2 shadow-md sm:p-3">
              <Key className="h-5 w-5 text-white sm:h-6 sm:w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                Assign Permissions to Role
              </h1>
              <p className="text-muted-foreground mt-1 text-sm dark:text-gray-400 sm:text-base">
                Choose a role and select permissions to assign
              </p>
            </div>
          </div>
          <Link href="/admin/roles">
            <Button variant="outline" className="h-10 rounded-xl border-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Roles
            </Button>
          </Link>
        </div>
      </div>

      <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="p-4 pb-2 sm:p-6">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
            Role Selection
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Select a role to assign permissions
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <CardContent className="flex-1 space-y-6 p-4 pt-0 sm:p-6">
            <div className="space-y-2">
              <Label htmlFor="role_id">Role *</Label>
              <Select value={roleId} onValueChange={setRoleId}>
                <SelectTrigger className="h-10 rounded-xl border-2">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.length === 0 ? (
                    <SelectItem value="" disabled>
                      No roles available
                    </SelectItem>
                  ) : (
                    roles.map(
                      (role: {
                        id?: string | number;
                        role_id?: string | number;
                        name?: string;
                        role_name?: string;
                      }) => (
                        <SelectItem
                          key={String(role.id ?? role.role_id ?? "")}
                          value={String(role.id ?? role.role_id ?? "")}
                        >
                          {String(role.name ?? role.role_name ?? `Role ${role.id ?? ""}`)}
                        </SelectItem>
                      )
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-900/40 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
                    Permissions catalogue
                  </h3>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    Filter by name, module or action then tick the permissions to assign.
                  </p>
                </div>
                <div className="text-muted-foreground text-xs sm:text-sm">
                  {selectedPermissions.size} selected
                </div>
              </div>
              <div className="relative">
                <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  value={permissionSearch}
                  onChange={(event) => setPermissionSearch(event.target.value)}
                  placeholder="Search permission catalogue..."
                  className="h-10 rounded-xl border-2 pl-9"
                />
              </div>
              <div className="max-h-72 divide-y divide-gray-100 overflow-y-auto rounded-xl border border-gray-200 bg-white dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-950/60">
                {isLoadingPermissions ? (
                  <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-10">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    Loading permissions...
                  </div>
                ) : permissions.length === 0 ? (
                  <div className="text-muted-foreground py-10 text-center text-sm">
                    No permissions available for this search.
                  </div>
                ) : (
                  Array.from(groupedPermissions.entries()).map(([category, perms]) => (
                    <div key={category} className="p-3 sm:p-4">
                      <h4 className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wide">
                        {category}
                      </h4>
                      <div className="space-y-2">
                        {perms.map((permission) => {
                          // Use module:action as the key
                          const module = permission.module || "General";
                          const action =
                            permission.action || permission.name || permission.code || "";
                          const permissionKey = `${module}:${action}`;
                          const checked = selectedPermissions.has(permissionKey);
                          return (
                            <label
                              key={permissionKey}
                              className="flex items-start gap-3 rounded-xl border border-transparent p-3 hover:border-gray-200 dark:hover:border-gray-800"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() => togglePermission(module, action)}
                                className="mt-1 h-4 w-4"
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {permission.name || permission.code || "Unnamed permission"}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  {permission.description || "No description available."}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {permission.code && (
                                    <span className="text-muted-foreground inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-[10px] font-medium dark:bg-gray-900">
                                      Code: {permission.code}
                                    </span>
                                  )}
                                  {permission.action && (
                                    <span className="text-muted-foreground inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-[10px] font-medium dark:bg-gray-900">
                                      Action: {permission.action}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="mt-auto border-t border-gray-200 p-4 pt-0 dark:border-gray-800 sm:p-6">
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-muted-foreground text-xs">
                Assigning permissions takes effect immediately for all users mapped to the role.
              </div>
              <div className="flex gap-3">
                <Link href="/admin/roles">
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
                  disabled={isSubmitting || !roleId || selectedPermissions.size === 0}
                  className="h-10 rounded-xl bg-blue-600 px-6 text-white shadow-md shadow-blue-500/15 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <Key className="mr-2 h-4 w-4" />
                      Assign permissions
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
