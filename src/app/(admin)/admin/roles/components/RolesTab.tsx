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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAlert } from "@/context/AlertProvider";
import {
  useAdminAvailablePermissions,
  useAdminRolesList,
  useChangeAdminRoleStatus,
  useCreateAdminRole,
} from "@/controller/query/admin/roles/useAdminRoles";
import type { AdminRole, AdminRolePermission } from "@/types";
import {
  Calendar,
  CheckCircle2,
  Eye,
  Key,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings2,
  Shield,
  Tag,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

interface PermissionRecord {
  id?: number | string;
  name?: string;
  code?: string;
  description?: string;
  module?: string;
  action?: string;
}

export default function RolesTab() {
  const { showAlert } = useAlert();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AdminRole | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    role_type: "MANAGEMENT" as "MANAGEMENT" | "CLIENT" | "CLIENT_USER",
    description: "", // Kept for display purposes but not sent to backend
  });
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [permissionSearch, setPermissionSearch] = useState("");

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const {
    data: rolesResponse,
    isLoading,
    isFetching,
    refetch,
  } = useAdminRolesList(
    {
      page,
      per_page: perPage,
      // Note: Backend RoleAll doesn't support search parameter, filtering is done on frontend
      search: undefined,
    },
    apiKey,
    !!apiKey
  );

  const { data: permissionsResponse, isLoading: isLoadingPermissions } =
    useAdminAvailablePermissions(apiKey, !!apiKey && isCreateDialogOpen);

  const createRoleMutation = useCreateAdminRole();
  const changeStatusMutation = useChangeAdminRoleStatus();

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

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
    setFormData({ name: "", role_type: "MANAGEMENT", description: "" });
    setSelectedPermissions(new Set());
    setPermissionSearch("");
  };

  const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
      // Create the role first
      await createRoleMutation.mutateAsync({
        data: {
          name: formData.name.trim(),
          role_type: formData.role_type,
        },
        apiKey,
      });

      // TODO: Assign permissions after role creation
      // The backend requires separate API calls for each permission
      // Each permission needs: role_id, module, and permission (action)
      // This would require getting the created role ID and then assigning permissions

      await refetch();
      handleCloseCreateDialog();
    } catch {
      // Alert handled inside mutation
    }
  };

  const roles = useMemo(() => {
    if (!rolesResponse) return [];
    const payload: unknown =
      rolesResponse.roles ||
      rolesResponse.data?.roles ||
      rolesResponse.data?.data ||
      rolesResponse.message?.roles ||
      rolesResponse.message?.data ||
      rolesResponse.message;
    let allRoles: AdminRole[] = [];
    if (Array.isArray(payload)) {
      allRoles = payload as AdminRole[];
    } else if (payload && typeof payload === "object" && "data" in payload) {
      const data = (payload as { data?: unknown }).data;
      if (Array.isArray(data)) {
        allRoles = data as AdminRole[];
      }
    }

    // Filter by search term on frontend since backend doesn't support search
    if (!search || search.trim().length === 0) {
      return allRoles;
    }

    const searchLower = search.toLowerCase().trim();
    return allRoles.filter((role: AdminRole) => {
      const name = (role.name || "").toLowerCase();
      const roleType = String(role.role_type || "").toLowerCase();
      const description = (role.description || "").toLowerCase();

      return (
        name.includes(searchLower) ||
        roleType.includes(searchLower) ||
        description.includes(searchLower)
      );
    });
  }, [rolesResponse, search]);

  const pagination = useMemo(() => {
    if (!rolesResponse) return null;
    return (
      rolesResponse.pagination ||
      rolesResponse.data?.pagination ||
      rolesResponse.message?.pagination ||
      null
    );
  }, [rolesResponse]);

  const stats = useMemo(() => {
    // Helper function to safely extract numeric value from role object
    const getNumericValue = (role: AdminRole, ...keys: string[]): number => {
      for (const key of keys) {
        const value = (role as Record<string, unknown>)[key];
        if (value !== undefined && value !== null) {
          const num = Number(value);
          if (!isNaN(num)) return num;
        }
      }
      return 0;
    };

    // Debug: log first role to see structure
    if (process.env.NODE_ENV === "development" && roles.length > 0) {
    }

    const result = roles.reduce(
      (
        acc: {
          total: number;
          totalPermissions: number;
          totalUsers: number;
          maxPermissions: { count: number; role: string };
        },
        role: AdminRole
      ) => {
        acc.total += 1;

        // Try multiple possible field names for permissions count
        const permissionsCount = getNumericValue(
          role,
          "permissions_count",
          "permissionsCount",
          "permission_count",
          "permissionCount"
        );

        // Try multiple possible field names for users count
        const usersCount = getNumericValue(
          role,
          "users_count",
          "usersCount",
          "user_count",
          "userCount"
        );

        acc.totalPermissions += permissionsCount;
        acc.totalUsers += usersCount;

        if (permissionsCount >= acc.maxPermissions.count) {
          // If same count, prefer the one with a name, otherwise update if higher
          if (permissionsCount > acc.maxPermissions.count || !acc.maxPermissions.role) {
            acc.maxPermissions = {
              count: permissionsCount,
              role: String(role.name || role.role_name || ""),
            };
          }
        }
        return acc;
      },
      {
        total: 0,
        totalPermissions: 0,
        totalUsers: 0,
        maxPermissions: { count: 0, role: "" },
      }
    );

    // If no role name found but we have roles, use the first role's name
    if (!result.maxPermissions.role && roles.length > 0) {
      const firstRole = roles[0];
      result.maxPermissions.role = String(firstRole.name || firstRole.role_name || "N/A");
    }

    // Ensure role is always a string
    if (!result.maxPermissions.role) {
      result.maxPermissions.role = "N/A";
    }

    return result;
  }, [roles]);

  const isRefreshing = isFetching && !isLoading;

  const handleRefresh = async () => {
    try {
      await refetch();
      showAlert({
        variant: "success",
        title: "Roles refreshed",
        message: "Latest role directory has been loaded successfully.",
      });
    } catch (error) {
      showAlert({
        variant: "error",
        title: "Refresh failed",
        message: error instanceof Error ? error.message : "Unable to refresh roles.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <section className="grid gap-4 xl:grid-cols-4">
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <Shield className="h-9 w-9 rounded-xl bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Total roles
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-muted-foreground text-xs">Security templates</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <Key className="h-9 w-9 rounded-xl bg-blue-500/10 p-2 text-blue-600 dark:text-blue-300" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Total permissions
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.totalPermissions}
              </p>
              <p className="text-muted-foreground text-xs">Across all roles</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <Users className="h-9 w-9 rounded-xl bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-300" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Users mapped
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.totalUsers}
              </p>
              <p className="text-muted-foreground text-xs">Total members</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <Settings2 className="h-9 w-9 rounded-xl bg-purple-500/10 p-2 text-purple-600 dark:text-purple-300" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Most granular
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.maxPermissions.role || "N/A"}
              </p>
              <p className="text-muted-foreground text-xs">
                {stats.maxPermissions.count} permission{stats.maxPermissions.count !== 1 ? "s" : ""}{" "}
                attached
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Roles Table */}
      <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="p-4 pb-2 sm:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
                  <Shield className="h-5 w-5 text-blue-500" />
                  Manage role catalogue
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm">
                  Search by role name or description.
                </CardDescription>
              </div>
            </div>
            <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full flex-1 sm:min-w-[300px] sm:max-w-[500px]">
                <Search className="text-muted-foreground absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2" />
                <Input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by role name or description..."
                  className="h-10 w-full rounded-xl border-2 bg-white pl-10 pr-4 dark:bg-gray-900"
                />
              </div>
              <div className="flex items-center gap-2">
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
                <Link href="/admin/roles/assign-permission">
                  <Button
                    variant="outline"
                    className="h-10 w-full rounded-xl border-2 border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:bg-blue-950/50 sm:w-auto"
                  >
                    <Key className="mr-2 h-4 w-4" />
                    Assign Permissions
                  </Button>
                </Link>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="h-10 w-full rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/15 hover:bg-blue-700 sm:w-auto"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Role
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
              <p className="text-muted-foreground text-sm">Loading roles...</p>
            </div>
          ) : roles.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
              <Shield className="text-muted-foreground h-10 w-10" />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                No roles match the current search.
              </p>
              <p className="text-muted-foreground text-sm">
                Try adjusting the query or create a new role.
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
                          <Shield className="h-4 w-4 text-blue-500" />
                          Role Name
                        </div>
                      </TableHead>
                      <TableHead className="min-w-[140px] py-4 font-semibold text-gray-900 dark:text-gray-100">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-orange-500" />
                          Type
                        </div>
                      </TableHead>
                      <TableHead className="min-w-[100px] py-4 font-semibold text-gray-900 dark:text-gray-100">
                        Status
                      </TableHead>
                      <TableHead className="min-w-[280px] py-4 font-semibold text-gray-900 dark:text-gray-100">
                        Description
                      </TableHead>
                      <TableHead className="min-w-[200px] py-4 font-semibold text-gray-900 dark:text-gray-100">
                        <div className="flex items-center gap-2">
                          <Key className="h-4 w-4 text-purple-500" />
                          Permissions
                        </div>
                      </TableHead>
                      <TableHead className="min-w-[100px] py-4 font-semibold text-gray-900 dark:text-gray-100">
                        Actions
                      </TableHead>
                      <TableHead className="min-w-[140px] py-4 font-semibold text-gray-900 dark:text-gray-100">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-emerald-500" />
                          Users
                        </div>
                      </TableHead>
                      <TableHead className="min-w-[180px] py-4 font-semibold text-gray-900 dark:text-gray-100">
                        Created
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role: AdminRole) => {
                      const roleId = String(role.id ?? role.role_id ?? role.name ?? "");
                      const roleName = String(role.name ?? role.role_name ?? "--");
                      const roleDescription = String(
                        role.description ?? "No description provided."
                      );
                      const roleType =
                        (role.role_type as "MANAGEMENT" | "CLIENT" | "CLIENT_USER") || "MANAGEMENT";
                      const status = role.status ?? 1;
                      const isActive = status === 1;
                      // Helper function to safely extract numeric value
                      const getNumericValue = (obj: AdminRole, ...keys: string[]): number => {
                        for (const key of keys) {
                          const value = (obj as Record<string, unknown>)[key];
                          if (value !== undefined && value !== null) {
                            const num = Number(value);
                            if (!isNaN(num)) return num;
                          }
                        }
                        return 0;
                      };

                      // Try multiple possible field names
                      const permissionsCount = getNumericValue(
                        role,
                        "permissions_count",
                        "permissionsCount",
                        "permission_count",
                        "permissionCount"
                      );
                      const usersCount = getNumericValue(
                        role,
                        "users_count",
                        "usersCount",
                        "user_count",
                        "userCount"
                      );
                      const createdAt = role.created_at || role.created || role.createdOn;
                      const createdDate = createdAt
                        ? new Date(String(createdAt)).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "--";

                      // Extract permissions details if available
                      const permissions =
                        (role.permissions as Array<{
                          id?: number | string;
                          module?: string;
                          actions?: Array<{ id?: number | string; name?: string }>;
                        }>) || [];

                      const modulesCount = permissions.length;
                      const totalActions = permissions.reduce(
                        (sum, perm) => sum + (perm.actions?.length || 0),
                        0
                      );

                      return (
                        <TableRow
                          key={roleId}
                          className="group border-b border-gray-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/30 dark:border-gray-800/50 dark:hover:from-blue-950/20 dark:hover:to-cyan-950/10"
                        >
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 transition-transform duration-200 group-hover:scale-110 dark:from-blue-500/20 dark:to-cyan-500/20">
                                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {roleName}
                                </p>
                                <p className="text-muted-foreground mt-0.5 text-xs">
                                  ID: {String(role.id ?? role.role_id ?? "N/A")}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge
                              variant="outline"
                              className={`rounded-lg px-3 py-1 font-medium ${
                                roleType === "MANAGEMENT"
                                  ? "border-blue-200 bg-blue-50/50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300"
                                  : roleType === "CLIENT"
                                    ? "border-green-200 bg-green-50/50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-300"
                                    : "border-purple-200 bg-purple-50/50 text-purple-700 dark:border-purple-800 dark:bg-purple-950/30 dark:text-purple-300"
                              }`}
                            >
                              <Tag className="mr-1.5 h-3 w-3" />
                              {roleType === "MANAGEMENT"
                                ? "Management"
                                : roleType === "CLIENT"
                                  ? "Client"
                                  : "Client User"}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4">
                            <Switch
                              checked={isActive}
                              onCheckedChange={async (checked) => {
                                if (!apiKey) {
                                  showAlert({
                                    variant: "error",
                                    title: "Missing API key",
                                    message: "Please sign in again to change role status.",
                                  });
                                  return;
                                }
                                const nextStatus = checked ? 1 : 0;
                                try {
                                  await changeStatusMutation.mutateAsync({
                                    data: {
                                      role_id: roleId,
                                      status: nextStatus,
                                    },
                                    apiKey,
                                  });
                                  await refetch();
                                } catch {
                                  // Alert handled by mutation
                                }
                              }}
                              disabled={changeStatusMutation.isPending}
                            />
                          </TableCell>
                          <TableCell className="py-4">
                            <p className="text-muted-foreground line-clamp-2 max-w-md text-sm dark:text-gray-300">
                              {roleDescription}
                            </p>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex flex-col gap-1">
                              <Badge
                                variant="outline"
                                className="rounded-lg border-purple-200 bg-purple-50/50 px-3 py-1 font-medium text-purple-700 dark:border-purple-800 dark:bg-purple-950/30 dark:text-purple-300"
                              >
                                <Key className="mr-1.5 h-3 w-3" />
                                {permissionsCount > 0 ? permissionsCount : totalActions} total
                              </Badge>
                              {modulesCount > 0 && (
                                <p className="text-muted-foreground mt-1 text-xs">
                                  {modulesCount} module{modulesCount !== 1 ? "s" : ""} •{" "}
                                  {totalActions} action{totalActions !== 1 ? "s" : ""}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge
                              variant="outline"
                              className="rounded-lg border-emerald-200 bg-emerald-50/50 px-3 py-1 font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                            >
                              <Users className="mr-1.5 h-3 w-3" />
                              {usersCount.toLocaleString()}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="text-muted-foreground flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                              <span className="whitespace-nowrap">{createdDate}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center gap-2">
                              <Link href={`/admin/roles/assign-permission?role_id=${roleId}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 rounded-lg border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:bg-blue-950/50"
                                  title="Assign permissions to this role"
                                >
                                  <Key className="mr-1.5 h-3.5 w-3.5" />
                                  Permissions
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedRole(role);
                                  setIsDetailsDialogOpen(true);
                                }}
                                className="h-8 rounded-lg border-2 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {pagination && (pagination?.total_pages || 0) > 1 && (
                <div className="flex flex-col gap-4 border-t border-gray-200 px-4 py-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-muted-foreground text-sm">
                    Showing {pagination.from || (page - 1) * perPage + 1} to{" "}
                    {pagination.to || Math.min(page * perPage, pagination.total || roles.length)} of{" "}
                    {pagination.total || roles.length} roles
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
                      Page {page} of {pagination.total_pages || pagination.last_page || 1}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((prev) =>
                          Math.min(
                            prev + 1,
                            pagination.total_pages || pagination.last_page || prev + 1
                          )
                        )
                      }
                      disabled={
                        page >= (pagination.total_pages || pagination.last_page || 1) || isLoading
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

      {/* Create Role Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={(open) => !open && handleCloseCreateDialog()}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-semibold text-gray-900 dark:text-white">
              <Shield className="h-6 w-6 text-blue-500" />
              Create New Role
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Define a security profile by naming the role, describing its scope and selecting the
              exact permissions it should grant.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-6">
            {/* Role Details */}
            <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/50">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                <Shield className="h-4 w-4 text-blue-500" />
                Role Details
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="create-name" className="text-gray-900 dark:text-white">
                    Role name *
                  </Label>
                  <Input
                    id="create-name"
                    value={formData.name}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, name: event.target.value }))
                    }
                    placeholder="Example: Finance Manager"
                    required
                    className="h-11 rounded-xl border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-role-type" className="text-gray-900 dark:text-white">
                    Role Type *
                  </Label>
                  <Select
                    value={formData.role_type}
                    onValueChange={(value: string) =>
                      setFormData((prev) => ({
                        ...prev,
                        role_type: value as "MANAGEMENT" | "CLIENT" | "CLIENT_USER",
                      }))
                    }
                  >
                    <SelectTrigger id="create-role-type" className="h-11 rounded-xl border-2">
                      <SelectValue placeholder="Select role type">
                        {formData.role_type === "MANAGEMENT"
                          ? "Management"
                          : formData.role_type === "CLIENT"
                            ? "Client"
                            : formData.role_type === "CLIENT_USER"
                              ? "Client User"
                              : "Select role type"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="!z-[9999999]">
                      <SelectItem value="MANAGEMENT">Management</SelectItem>
                      <SelectItem value="CLIENT">Client</SelectItem>
                      <SelectItem value="CLIENT_USER">Client User</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-muted-foreground text-xs">
                    Management roles are for admin users. Client roles are for client-level access.
                  </p>
                </div>
              </div>
            </div>

            {/* Permissions Selection */}
            <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/50">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                    <Key className="h-4 w-4 text-purple-500" />
                    Attach Permissions
                  </h3>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Select one or more permissions. The selected set will be granted to any user
                    assigned to this role.
                  </p>
                </div>
                <Badge variant="outline" className="rounded-xl px-3 py-1.5">
                  <Key className="mr-1.5 h-3.5 w-3.5" />
                  {selectedPermissions.size} selected
                </Badge>
              </div>
              <div className="relative">
                <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  value={permissionSearch}
                  onChange={(event) => setPermissionSearch(event.target.value)}
                  placeholder="Search permission by name, module, or code..."
                  className="h-11 rounded-xl border-2 pl-9"
                />
              </div>
              <div className="max-h-80 divide-y divide-gray-100 overflow-y-auto rounded-xl border border-gray-200 bg-white dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-950/60">
                {isLoadingPermissions ? (
                  <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    <p className="text-sm">Loading permissions...</p>
                  </div>
                ) : permissions.length === 0 ? (
                  <div className="text-muted-foreground py-12 text-center text-sm">
                    No permissions match this search.
                  </div>
                ) : (
                  permissions.map((permission: PermissionRecord) => {
                    const id = String(permission.id ?? permission.code ?? permission.name);
                    const isChecked = selectedPermissions.has(id);
                    return (
                      <label
                        key={id}
                        className="flex cursor-pointer items-start gap-3 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/40"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(id)}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {permission.name || permission.code || "Unnamed permission"}
                          </p>
                          <p className="text-muted-foreground mt-0.5 text-xs">
                            {permission.description || "No description provided."}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {permission.module && (
                              <Badge variant="outline" className="rounded-lg px-2 py-0.5 text-xs">
                                Module: {permission.module}
                              </Badge>
                            )}
                            {permission.action && (
                              <Badge variant="outline" className="rounded-lg px-2 py-0.5 text-xs">
                                Action: {permission.action}
                              </Badge>
                            )}
                            {permission.code && (
                              <Badge variant="outline" className="rounded-lg px-2 py-0.5 text-xs">
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

            <DialogFooter className="border-t border-gray-200 pt-4 dark:border-gray-800">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseCreateDialog}
                disabled={createRoleMutation.isPending}
                className="h-10 rounded-xl border-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createRoleMutation.isPending || !formData.name.trim() || !formData.role_type
                }
                className="h-10 rounded-xl bg-blue-600 px-6 text-white shadow-md shadow-blue-500/15 hover:bg-blue-700"
              >
                {createRoleMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Role
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Role Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-semibold text-gray-900 dark:text-white">
              <Shield className="h-6 w-6 text-blue-500" />
              Role Details
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              View all modules and permissions assigned to this role.
            </DialogDescription>
          </DialogHeader>

          {selectedRole && (
            <div className="space-y-6">
              {/* Role Information */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/50">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                  <Shield className="h-4 w-4 text-blue-500" />
                  Role Information
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-muted-foreground text-xs font-medium uppercase">Role Name</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                      {selectedRole.name || "--"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs font-medium uppercase">Role ID</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                      {String(selectedRole.id ?? "N/A")}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs font-medium uppercase">Role Type</p>
                    <div className="mt-1">
                      <Badge
                        variant="outline"
                        className={`rounded-lg px-3 py-1 font-medium ${
                          (selectedRole.role_type as string) === "MANAGEMENT"
                            ? "border-blue-200 bg-blue-50/50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300"
                            : (selectedRole.role_type as string) === "CLIENT"
                              ? "border-green-200 bg-green-50/50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-300"
                              : "border-purple-200 bg-purple-50/50 text-purple-700 dark:border-purple-800 dark:bg-purple-950/30 dark:text-purple-300"
                        }`}
                      >
                        <Tag className="mr-1.5 h-3 w-3" />
                        {(selectedRole.role_type as string) === "MANAGEMENT"
                          ? "Management"
                          : (selectedRole.role_type as string) === "CLIENT"
                            ? "Client"
                            : "Client User"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs font-medium uppercase">Status</p>
                    <div className="mt-1">
                      <Badge
                        variant="outline"
                        className={`rounded-lg px-3 py-1 font-medium ${
                          (selectedRole.status ?? 1) === 1
                            ? "border-emerald-200 bg-emerald-50/50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                            : "border-red-200 bg-red-50/50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
                        }`}
                      >
                        {(selectedRole.status ?? 1) === 1 ? (
                          <CheckCircle2 className="mr-1.5 h-3 w-3" />
                        ) : (
                          <XCircle className="mr-1.5 h-3 w-3" />
                        )}
                        {(selectedRole.status ?? 1) === 1 ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  {selectedRole.description && (
                    <div className="md:col-span-2">
                      <p className="text-muted-foreground text-xs font-medium uppercase">
                        Description
                      </p>
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                        {selectedRole.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Permissions by Module */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                  <Key className="h-4 w-4 text-purple-500" />
                  Permissions by Module
                </h3>

                {(() => {
                  const permissions =
                    (selectedRole.permissions as Array<{
                      id?: number | string;
                      module?: string;
                      actions?: Array<{ id?: number | string; name?: string }>;
                    }>) || [];

                  if (permissions.length === 0) {
                    return (
                      <div className="text-muted-foreground rounded-xl border border-gray-200 bg-gray-50/50 p-8 text-center dark:border-gray-800 dark:bg-gray-900/50">
                        <Key className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
                        <p className="text-sm">No permissions assigned to this role.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {permissions.map((permission, index) => {
                        const moduleName = permission.module || "Unknown Module";
                        const actions = permission.actions || [];
                        const moduleId = permission.id || index;

                        return (
                          <div
                            key={String(moduleId)}
                            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/50"
                          >
                            <div className="mb-3 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                  <Settings2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {moduleName}
                                  </p>
                                  <p className="text-muted-foreground text-xs">
                                    Module ID: {String(permission.id ?? "N/A")}
                                  </p>
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className="rounded-lg border-purple-200 bg-purple-50/50 px-2.5 py-0.5 text-xs font-medium text-purple-700 dark:border-purple-800 dark:bg-purple-950/30 dark:text-purple-300"
                              >
                                {actions.length} action{actions.length !== 1 ? "s" : ""}
                              </Badge>
                            </div>

                            {actions.length > 0 ? (
                              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                                {actions.map((action, actionIndex) => (
                                  <div
                                    key={String(action.id ?? actionIndex)}
                                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800/50"
                                  >
                                    <div className="flex h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                                    <span className="text-xs font-medium capitalize text-gray-700 dark:text-gray-300">
                                      {action.name || "Unknown"}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted-foreground mt-2 text-xs italic">
                                No actions assigned to this module.
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-gray-200 pt-4 dark:border-gray-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDetailsDialogOpen(false)}
              className="h-10 rounded-xl border-2"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
