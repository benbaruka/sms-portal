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
  useAdminRolePermissions,
  useAdminRolesList,
  useRevokePermissionFromRole,
} from "@/controller/query/admin/roles/useAdminRoles";
import type { AdminRole, AdminRolePermission } from "@/types";

interface PermissionRecord {
  id?: number | string;
  name?: string;
  code?: string;
  description?: string;
  module?: string;
  action?: string;
  assigned?: boolean;
}

export default function RevokePermissionPage() {
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

  const { data: rolesResponse } = useAdminRolesList({ page: 1, per_page: 100 }, apiKey, !!apiKey);

  const { data: permissionsResponse, isLoading: isLoadingPermissions } = useAdminRolePermissions(
    roleId || null,
    apiKey,
    !!apiKey && !!roleId
  );

  const revokeMutation = useRevokePermissionFromRole();

  const roles = useMemo(() => {
    const payload: unknown =
      rolesResponse?.roles ||
      rolesResponse?.data?.roles ||
      rolesResponse?.data?.data ||
      rolesResponse?.message?.roles ||
      rolesResponse?.message?.data ||
      rolesResponse?.message ||
      [];
    return Array.isArray(payload) ? (payload as AdminRole[]) : [];
  }, [rolesResponse]);

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

  const groupedPermissions = useMemo(() => {
    const grouped = new Map<string, PermissionRecord[]>();
    permissions.forEach((permission: PermissionRecord) => {
      const category = permission.module || "General";
      if (!grouped.has(category)) grouped.set(category, []);
      grouped.get(category)!.push(permission);
    });
    return grouped;
  }, [permissions]);

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(permissionId)) {
        next.delete(permissionId);
      } else {
        next.add(permissionId);
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
        message: "Please sign in again to revoke permissions.",
      });
      return;
    }
    if (!roleId) {
      showAlert({
        variant: "error",
        title: "Role required",
        message: "Select a role before revoking permissions.",
      });
      return;
    }
    if (selectedPermissions.size === 0) {
      showAlert({
        variant: "error",
        title: "No permissions selected",
        message: "Choose at least one permission to revoke.",
      });
      return;
    }

    try {
      await Promise.all(
        Array.from(selectedPermissions).map((permission) =>
          revokeMutation.mutateAsync({
            data: {
              role_id: roleId,
              permission_id: permission,
            },
            apiKey,
          })
        )
      );
      showAlert({
        variant: "success",
        title: "Permissions revoked",
        message: "Selected permissions were revoked successfully.",
      });
      setSelectedPermissions(new Set());
      setPermissionSearch("");
    } catch {
      // alerts already handled in mutation
    }
  };

  const isSubmitting = revokeMutation.isPending;

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
                Revoke permissions from a role
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed dark:text-gray-300 sm:text-base">
                Select a role to review its current permissions and uncheck the ones that should no
                longer apply.
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
            Role selection
          </CardTitle>
          <CardDescription className="mt-1 text-sm text-gray-600 dark:text-gray-400 sm:mt-2">
            Choose the role whose permissions you want to review.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <CardContent className="flex-1 space-y-6 p-4 pt-0 sm:p-6">
            <div className="space-y-2">
              <Label htmlFor="role_id">Role *</Label>
              <Select
                value={roleId}
                onValueChange={(value) => {
                  setRoleId(value);
                  setSelectedPermissions(new Set());
                }}
              >
                <SelectTrigger className="h-11 rounded-2xl border-2">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.length === 0 ? (
                    <SelectItem value="" disabled>
                      No roles available
                    </SelectItem>
                  ) : (
                    roles.map((role: AdminRole) => (
                      <SelectItem
                        key={String(role.id ?? role.role_id ?? "")}
                        value={String(role.id ?? role.role_id ?? "")}
                      >
                        {String(role.name ?? role.role_name ?? `Role ${role.id ?? ""}`)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-900/40 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
                    Permissions currently granted
                  </h3>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    Uncheck the permissions you want to revoke from this role.
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
                  placeholder="Search assigned permissions..."
                  className="h-10 rounded-xl border-2 pl-9"
                />
              </div>
              <div className="max-h-72 divide-y divide-gray-100 overflow-y-auto rounded-xl border border-gray-200 bg-white dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-950/60">
                {roleId === "" ? (
                  <div className="text-muted-foreground py-10 text-center text-sm">
                    Select a role to load its permissions.
                  </div>
                ) : isLoadingPermissions ? (
                  <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-10">
                    <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
                    Loading assigned permissions...
                  </div>
                ) : permissions.length === 0 ? (
                  <div className="text-muted-foreground py-10 text-center text-sm">
                    This role currently has no permissions.
                  </div>
                ) : (
                  Array.from(groupedPermissions.entries()).map(([category, perms]) => (
                    <div key={category} className="p-3 sm:p-4">
                      <h4 className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wide">
                        {category}
                      </h4>
                      <div className="space-y-2">
                        {perms.map((permission) => {
                          const id = String(permission.id ?? permission.code ?? permission.name);
                          const checked = selectedPermissions.has(id);
                          return (
                            <label
                              key={id}
                              className="flex items-start gap-3 rounded-xl border border-transparent p-3 hover:border-gray-200 dark:hover:border-gray-800"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() => togglePermission(id)}
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
          <CardFooter className="mt-auto border-t border-gray-100 p-4 pt-0 dark:border-gray-800 sm:p-6">
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-muted-foreground text-xs">
                Revoked permissions take effect immediately. Users may need to refresh their session
                to see the changes.
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
                  variant="destructive"
                  disabled={isSubmitting || !roleId || selectedPermissions.size === 0}
                  className="h-10 rounded-xl px-6 shadow-md shadow-brand-500/15"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Revoking...
                    </>
                  ) : (
                    <>
                      <Key className="mr-2 h-4 w-4" />
                      Revoke permissions
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
