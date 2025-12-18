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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAlert } from "@/context/AlertProvider";
import {
  useChangeClientUserStatus,
  useClientUserRoles,
  useClientUsersList,
  useCreateClientUser,
  useUpdateClientUser,
} from "@/controller/query/client/users/useClientUsers";
import type { ClientUser, ClientUserRole } from "@/types";
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  Hash,
  Loader2,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  User,
  Users,
  XCircle,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All status" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

const normalizeStatus = (status: number | string | undefined): StatusFilter => {
  if (typeof status === "number") {
    return status === 1 ? "ACTIVE" : "INACTIVE";
  }
  const normalized = (status || "").toString().toUpperCase();
  if (["ACTIVE", "ENABLED", "APPROVED"].includes(normalized)) return "ACTIVE";
  if (["INACTIVE", "DISABLED", "SUSPENDED", "BLOCKED"].includes(normalized)) return "INACTIVE";
  return "INACTIVE";
};

const statusBadge = (status: StatusFilter) => {
  if (status === "ACTIVE") {
    return (
      <Badge variant="default" className="gap-1 bg-emerald-500 text-white">
        <CheckCircle2 className="h-3 w-3" />
        Active
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="gap-1">
      <XCircle className="h-3 w-3" />
      Inactive
    </Badge>
  );
};

const sanitizePhone = (value: string) => value.replace(/\s+/g, "");

export default function ClientUsersPage() {
  const { showAlert } = useAlert();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [perPage] = useState(100);

  // Modal state for update
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<ClientUser | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    msisdn: "",
    role_id: "",
  });

  // Create form data
  const [createFormData, setCreateFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    msisdn: "",
    role_id: "",
  });

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const { data: rolesData } = useClientUserRoles(apiKey, !!apiKey);

  const {
    data: usersResponse,
    isLoading,
    isFetching,
    refetch,
  } = useClientUsersList(
    {
      page,
      per_page: perPage,
      search: undefined,
      status: undefined,
      role_id: undefined,
    },
    apiKey,
    !!apiKey && activeTab === "list"
  );

  const createUserMutation = useCreateClientUser();
  const updateUserMutation = useUpdateClientUser();
  const changeStatusMutation = useChangeClientUserStatus();

  const handleOpenUpdateModal = (userId: string | number | null | undefined) => {
    if (!userId) return;
    setSelectedUserId(String(userId));
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedUserId(null);
    setSelectedUser(null);
    setFormData({
      full_name: "",
      email: "",
      msisdn: "",
      role_id: "",
    });
  };

  const handleUpdateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiKey || !selectedUserId) {
      showAlert({
        variant: "error",
        title: "Missing API key",
        message: "Please sign in again to modify user records.",
      });
      return;
    }

    try {
      await updateUserMutation.mutateAsync({
        data: {
          user_id: selectedUserId,
          full_name: formData.full_name.trim(),
          email: formData.email.trim(),
          msisdn: sanitizePhone(formData.msisdn.trim()),
          role_id: formData.role_id || undefined,
        },
        apiKey,
      });
      await refetch();
      handleCloseUpdateModal();
    } catch {
      // Alert handled in mutation
    }
  };

  const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiKey) {
      showAlert({
        variant: "error",
        title: "Missing API key",
        message: "Please sign in again to create a new user.",
      });
      return;
    }

    if (!createFormData.password || createFormData.password.length < 6) {
      showAlert({
        variant: "error",
        title: "Password too short",
        message: "Please provide a password with at least 6 characters.",
      });
      return;
    }

    try {
      const roleId = createFormData.role_id
        ? typeof createFormData.role_id === "string"
          ? parseInt(createFormData.role_id, 10)
          : Number(createFormData.role_id)
        : "";

      if (!roleId || isNaN(Number(roleId))) {
        showAlert({
          variant: "error",
          title: "Invalid role",
          message: "Please select a valid role.",
        });
        return;
      }

      await createUserMutation.mutateAsync({
        data: {
          full_name: createFormData.full_name.trim(),
          email: createFormData.email.trim(),
          password: createFormData.password,
          msisdn: sanitizePhone(createFormData.msisdn.trim()),
          role_id: roleId,
        },
        apiKey,
      });

      setCreateFormData({
        full_name: "",
        email: "",
        password: "",
        msisdn: "",
        role_id: "",
      });
      setActiveTab("list");
      await refetch();
    } catch {
      // Alert handled in mutation
    }
  };

  const handleStatusToggle = async (user: {
    id?: number | string;
    user_id?: number | string;
    email?: string;
    status?: number | string;
  }) => {
    if (!apiKey) {
      showAlert({
        variant: "error",
        title: "Missing API key",
        message: "Please sign in again to change user status.",
      });
      return;
    }

    const userId = user.id || user.user_id;
    if (!userId) {
      showAlert({
        variant: "error",
        title: "Invalid user",
        message: "User ID is missing.",
      });
      return;
    }

    const currentStatus = normalizeStatus(user.status);
    const newStatus = currentStatus === "ACTIVE" ? 0 : 1;

    try {
      await changeStatusMutation.mutateAsync({
        data: {
          user_id: String(userId),
          status: newStatus,
        },
        apiKey,
      });
      await refetch();
    } catch {
      // Alert handled in mutation
    }
  };

  const users = useMemo(() => {
    if (!usersResponse) return [];
    const responseData = usersResponse as Record<string, unknown>;

    let usersArray: ClientUser[] = [];

    if (Array.isArray((responseData as { data?: unknown[] }).data)) {
      usersArray = (responseData as { data: ClientUser[] }).data;
    } else if (Array.isArray((responseData as { data?: { data?: unknown[] } }).data?.data)) {
      usersArray = (responseData as { data: { data: ClientUser[] } }).data.data;
    } else if (Array.isArray((responseData as { users?: unknown[] }).users)) {
      usersArray = (responseData as { users: ClientUser[] }).users;
    } else if (Array.isArray((responseData as { message?: unknown[] }).message)) {
      usersArray = (responseData as { message: ClientUser[] }).message;
    } else if (Array.isArray((responseData as { message?: { data?: unknown[] } }).message?.data)) {
      usersArray = (responseData as { message: { data: ClientUser[] } }).message.data;
    } else if (
      Array.isArray((responseData as { message?: { users?: unknown[] } }).message?.users)
    ) {
      usersArray = (responseData as { message: { users: ClientUser[] } }).message.users;
    }

    const filtered = usersArray.filter((user: ClientUser) => {
      if (search && search.trim()) {
        const searchLower = search.toLowerCase().trim();
        const userName = String(user.full_name || user.name || "").toLowerCase();
        const userEmail = (user.email || "").toLowerCase();
        const userPhone = String(user.msisdn || user.phone || "").toLowerCase();
        const userId = String(user.id || user.user_id || "").toLowerCase();

        if (
          !userName.includes(searchLower) &&
          !userEmail.includes(searchLower) &&
          !userPhone.includes(searchLower) &&
          !userId.includes(searchLower)
        ) {
          return false;
        }
      }

      if (statusFilter && statusFilter !== "ALL") {
        const userStatus = normalizeStatus(user.status);
        if (userStatus !== statusFilter) {
          return false;
        }
      }

      if (roleFilter && roleFilter !== "ALL") {
        const userRoleId = String(user.role_id || "")
          .toLowerCase()
          .trim();
        const filterRoleId = String(roleFilter).toLowerCase().trim();
        if (userRoleId !== filterRoleId) {
          return false;
        }
      }

      return true;
    });

    return filtered;
  }, [usersResponse, search, statusFilter, roleFilter]);

  useEffect(() => {
    if (!isUpdateModalOpen || !selectedUserId || !usersResponse) {
      return;
    }

    const responseData = usersResponse as Record<string, unknown>;
    let usersArray: ClientUser[] = [];

    if (Array.isArray((responseData as { data?: unknown[] }).data)) {
      usersArray = (responseData as { data: ClientUser[] }).data;
    } else if (Array.isArray((responseData as { data?: { data?: unknown[] } }).data?.data)) {
      usersArray = (responseData as { data: { data: ClientUser[] } }).data.data;
    } else if (Array.isArray((responseData as { users?: unknown[] }).users)) {
      usersArray = (responseData as { users: ClientUser[] }).users;
    } else if (Array.isArray((responseData as { message?: unknown[] }).message)) {
      usersArray = (responseData as { message: ClientUser[] }).message;
    } else if (Array.isArray((responseData as { message?: { data?: unknown[] } }).message?.data)) {
      usersArray = (responseData as { message: { data: ClientUser[] } }).message.data;
    } else if (
      Array.isArray((responseData as { message?: { users?: unknown[] } }).message?.users)
    ) {
      usersArray = (responseData as { message: { users: ClientUser[] } }).message.users;
    }

    const user = usersArray.find(
      (u: ClientUser) => String(u.id || u.user_id || "") === selectedUserId
    );

    if (user) {
      setSelectedUser(user);
      const msisdnValue = user.msisdn || user.phone || "";
      setFormData({
        full_name: String(user.full_name || user.name || ""),
        email: String(user.email || ""),
        msisdn: msisdnValue ? String(msisdnValue).trim() : "",
        role_id: String(user.role_id || ""),
      });
    }
  }, [isUpdateModalOpen, selectedUserId, usersResponse]);

  const stats = useMemo(() => {
    return users.reduce(
      (acc, user) => {
        const status = normalizeStatus(user.status);
        acc.total += 1;
        if (status === "ACTIVE") acc.active += 1;
        if (status === "INACTIVE") acc.inactive += 1;
        if (user.role_id) acc.roles.add(String(user.role_id));
        return acc;
      },
      {
        total: 0,
        active: 0,
        inactive: 0,
        roles: new Set<string>(),
      }
    );
  }, [users]);

  const roleOptions = useMemo(() => {
    const source = rolesData?.data || rolesData?.message || [];
    return Array.isArray(source) ? source : [];
  }, [rolesData]);

  const isRefreshing = isFetching && !isLoading;

  const handleRefresh = async () => {
    try {
      await refetch();
      showAlert({
        variant: "success",
        title: "Users refreshed",
        message: "The latest users directory has been loaded successfully.",
      });
    } catch (error: unknown) {
      showAlert({
        variant: "error",
        title: "Refresh failed",
        message: error instanceof Error ? error.message : "Unable to refresh the users list.",
      });
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="rounded-xl border border-blue-200/50 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 p-6 shadow-sm dark:border-blue-800/50 md:p-8">
        <div className="mb-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="rounded-xl bg-blue-500 p-2 shadow-md sm:p-3">
            <Users className="h-5 w-5 text-white sm:h-6 sm:w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              User Management
            </h1>
            <p className="text-muted-foreground mt-1 text-sm dark:text-gray-400 sm:text-base">
              Manage your team members, create new accounts, and control access
            </p>
          </div>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "list" | "create")}
        className="space-y-6"
      >
        <TabsList className="grid h-auto w-full grid-cols-2 rounded-lg border border-gray-200 bg-gray-100 p-1.5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <TabsTrigger
            value="list"
            className="flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-blue-400"
          >
            <Users className="h-4 w-4" />
            <span>All Users</span>
          </TabsTrigger>
          <TabsTrigger
            value="create"
            className="flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-blue-400"
          >
            <Plus className="h-4 w-4" />
            <span>Create User</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-0 space-y-6">
          {/* Stats Cards */}
          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <CardContent className="flex items-center gap-3 p-4">
                <Users className="h-9 w-9 rounded-xl bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide dark:text-gray-400">
                    Total users
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {stats.total}
                  </p>
                  <p className="text-muted-foreground text-xs dark:text-gray-400">Account status</p>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <CardContent className="flex items-center gap-3 p-4">
                <CheckCircle2 className="h-9 w-9 rounded-xl bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-300" />
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide dark:text-gray-400">
                    Active
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {stats.active}
                  </p>
                  <p className="text-muted-foreground text-xs dark:text-gray-400">
                    Active accounts
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <CardContent className="flex items-center gap-3 p-4">
                <XCircle className="h-9 w-9 rounded-xl bg-amber-500/10 p-2 text-amber-600 dark:text-amber-300" />
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide dark:text-gray-400">
                    Inactive
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {stats.inactive}
                  </p>
                  <p className="text-muted-foreground text-xs dark:text-gray-400">
                    Disabled accounts
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Filters and Search */}
          <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <CardHeader className="p-4 pb-4 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
                    <Users className="h-5 w-5 text-blue-500" />
                    User Directory
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-sm dark:text-gray-400">
                    Search and filter users by status or role. Status controls account access (not
                    online sessions).
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isLoading || isRefreshing}
                  className="h-10 rounded-xl border-2"
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
              <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
                <div className="relative">
                  <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 dark:text-gray-500" />
                  <Input
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Search by name, email or phone..."
                    className="h-11 rounded-xl border-2 pl-9"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value as StatusFilter);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-11 rounded-xl border-2">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={roleFilter}
                  onValueChange={(value) => {
                    setRoleFilter(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-11 rounded-xl border-2">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All roles</SelectItem>
                    {roleOptions.map((role: ClientUserRole) => (
                      <SelectItem
                        key={String(role.id ?? role.name ?? "")}
                        value={String(role.id ?? role.name ?? "")}
                      >
                        {String(role.name || role.label || role.title || `Role ${role.id ?? ""}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-500 dark:text-blue-400" />
                  <p className="text-muted-foreground text-sm dark:text-gray-400">
                    Loading users...
                  </p>
                </div>
              ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
                  <Users className="text-muted-foreground h-10 w-10 dark:text-gray-500" />
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    No users match the current filters.
                  </p>
                  <p className="text-muted-foreground text-sm dark:text-gray-400">
                    Adjust the filters to see more results.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {users.map((user: ClientUser) => {
                    const status = normalizeStatus(user.status);
                    const userId = user.id || user.user_id;
                    const userName = user.full_name || user.name || "Unnamed User";
                    const userEmail = user.email || "--";
                    const userPhone = user.msisdn || user.phone || "--";
                    const userRole = user.role || user.role_name || "—";
                    const createdAt: string | undefined =
                      typeof (user.created_at || user.created || user.createdOn) === "string"
                        ? ((user.created_at || user.created || user.createdOn) as string)
                        : undefined;

                    return (
                      <Card
                        key={String(userId || user.email || "")}
                        className="rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-blue-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-700"
                      >
                        <CardHeader className="p-4 pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                              <div
                                className={`rounded-xl p-2.5 ${
                                  status === "ACTIVE" ? "bg-emerald-500/10" : "bg-gray-500/10"
                                }`}
                              >
                                <User
                                  className={`h-5 w-5 ${
                                    status === "ACTIVE"
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : "text-gray-600 dark:text-gray-400"
                                  }`}
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="truncate font-semibold text-gray-900 dark:text-white">
                                  {String(userName || "")}
                                </h3>
                                <div className="mt-1">{statusBadge(status)}</div>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3 p-4 pt-0">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="text-muted-foreground h-4 w-4 flex-shrink-0 dark:text-gray-500" />
                              <span className="text-muted-foreground truncate dark:text-gray-400">
                                {String(userEmail || "")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="text-muted-foreground h-4 w-4 flex-shrink-0 dark:text-gray-500" />
                              <span className="text-muted-foreground dark:text-gray-400">
                                {String(userPhone || "")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <ShieldCheck className="text-muted-foreground h-4 w-4 flex-shrink-0 dark:text-gray-500" />
                              <span className="text-muted-foreground truncate dark:text-gray-400">
                                {String(userRole || "")}
                              </span>
                            </div>
                            {createdAt && (
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="text-muted-foreground h-4 w-4 flex-shrink-0 dark:text-gray-500" />
                                <span className="text-muted-foreground text-xs dark:text-gray-400">
                                  {new Date(createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 border-t border-gray-100 pt-2 dark:border-gray-800">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusToggle(user)}
                              disabled={changeStatusMutation.isPending || isRefreshing}
                              className="h-8 flex-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                            >
                              {status === "ACTIVE" ? (
                                <>
                                  <ToggleLeft className="mr-1.5 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                  <span className="text-xs text-emerald-600 dark:text-emerald-400">
                                    Suspend
                                  </span>
                                </>
                              ) : (
                                <>
                                  <ToggleRight className="mr-1.5 h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                  <span className="text-xs text-amber-600 dark:text-amber-400">
                                    Activate
                                  </span>
                                </>
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleOpenUpdateModal(
                                  userId
                                    ? typeof userId === "string"
                                      ? userId
                                      : String(userId)
                                    : null
                                )
                              }
                              className="h-8 flex-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20"
                            >
                              <Edit className="mr-1.5 h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                              <span className="text-xs text-blue-600 dark:text-blue-400">Edit</span>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="mt-0 space-y-6">
          <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
                <Plus className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                Create New User
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm dark:text-gray-400">
                Add a new team member to your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6">
              <form onSubmit={handleCreateSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="create-full_name" className="text-gray-900 dark:text-white">
                      Full name *
                    </Label>
                    <div className="relative">
                      <User className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 dark:text-gray-500" />
                      <Input
                        id="create-full_name"
                        value={createFormData.full_name}
                        onChange={(event) =>
                          setCreateFormData((prev) => ({ ...prev, full_name: event.target.value }))
                        }
                        placeholder="Jane Doe"
                        required
                        className="h-11 rounded-2xl border-2 pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-email" className="text-gray-900 dark:text-white">
                      Email *
                    </Label>
                    <div className="relative">
                      <Mail className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 dark:text-gray-500" />
                      <Input
                        id="create-email"
                        type="email"
                        value={createFormData.email}
                        onChange={(event) =>
                          setCreateFormData((prev) => ({ ...prev, email: event.target.value }))
                        }
                        placeholder="jane.doe@company.com"
                        required
                        className="h-11 rounded-2xl border-2 pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="create-password" className="text-gray-900 dark:text-white">
                      Temporary password *
                    </Label>
                    <div className="relative">
                      <Hash className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 dark:text-gray-500" />
                      <Input
                        id="create-password"
                        type="password"
                        value={createFormData.password}
                        onChange={(event) =>
                          setCreateFormData((prev) => ({ ...prev, password: event.target.value }))
                        }
                        placeholder="Minimum 6 characters"
                        required
                        className="h-11 rounded-2xl border-2 pl-9"
                      />
                    </div>
                    <p className="text-muted-foreground text-xs dark:text-gray-400">
                      They will be prompted to change it on first login if the policy requires it.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-msisdn" className="text-gray-900 dark:text-white">
                      Phone number *
                    </Label>
                    <div className="relative">
                      <Phone className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 dark:text-gray-500" />
                      <Input
                        id="create-msisdn"
                        value={createFormData.msisdn}
                        onChange={(event) =>
                          setCreateFormData((prev) => ({ ...prev, msisdn: event.target.value }))
                        }
                        placeholder="+243900000000"
                        required
                        className="h-11 rounded-2xl border-2 pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-role_id" className="text-gray-900 dark:text-white">
                    Role *
                  </Label>
                  <Select
                    value={createFormData.role_id}
                    onValueChange={(value) =>
                      setCreateFormData((prev) => ({ ...prev, role_id: value }))
                    }
                  >
                    <SelectTrigger className="h-11 rounded-2xl border-2">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.length === 0 ? (
                        <SelectItem value="" disabled>
                          No roles available
                        </SelectItem>
                      ) : (
                        roleOptions.map((role: ClientUserRole) => (
                          <SelectItem
                            key={String(role.id ?? role.name ?? "")}
                            value={String(role.id ?? role.name ?? "")}
                          >
                            {String(
                              role.name || role.label || role.title || `Role ${role.id ?? ""}`
                            )}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={
                      createUserMutation.isPending ||
                      !createFormData.full_name ||
                      !createFormData.email ||
                      !createFormData.password ||
                      !createFormData.msisdn ||
                      !createFormData.role_id
                    }
                    className="h-10 rounded-xl bg-brand-500 px-6 text-white shadow-md shadow-brand-500/15 hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600"
                  >
                    {createUserMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Create user
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Update User Modal */}
      <Dialog
        open={isUpdateModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseUpdateModal();
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto rounded-3xl border-2 border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
          <DialogHeader className="space-y-3 border-b border-gray-200 pb-4 dark:border-gray-800">
            <DialogTitle className="flex items-center gap-3 text-2xl font-semibold text-gray-900 dark:text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30">
                <Edit className="h-5 w-5 text-white" />
              </div>
              Update User Profile
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 dark:text-gray-400">
              Modify user information. All changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="mb-6 rounded-2xl border-2 border-blue-200/60 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 p-6 shadow-lg dark:border-gray-700 dark:from-blue-950/40 dark:via-cyan-950/40 dark:to-blue-950/40">
              <h3 className="mb-5 flex items-center gap-2.5 text-base font-semibold text-gray-900 dark:text-white">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 dark:bg-blue-400/20">
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                User Information
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <div className="min-w-0">
                  <p className="text-muted-foreground mb-2 text-xs font-medium dark:text-gray-400">
                    User ID
                  </p>
                  <p className="flex items-center gap-1.5 break-words text-sm font-semibold text-gray-900 dark:text-white">
                    <Hash className="h-3.5 w-3.5 flex-shrink-0 text-blue-500 dark:text-blue-400" />
                    <span className="truncate">
                      {String(selectedUser.id || selectedUser.user_id || "—")}
                    </span>
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground mb-2 text-xs font-medium dark:text-gray-400">
                    Status
                  </p>
                  <div className="flex items-center">
                    {normalizeStatus(selectedUser.status) === "ACTIVE" ? (
                      <Badge variant="default" className="w-fit gap-1 bg-emerald-500 text-white">
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="w-fit gap-1">
                        <XCircle className="h-3 w-3" />
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground mb-2 text-xs font-medium dark:text-gray-400">
                    Role
                  </p>
                  <p className="flex items-center gap-1.5 break-words text-sm font-semibold text-gray-900 dark:text-white">
                    <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0 text-blue-500 dark:text-blue-400" />
                    <span className="truncate">
                      {String(selectedUser.role || selectedUser.role_name || "—")}
                    </span>
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground mb-2 text-xs font-medium dark:text-gray-400">
                    Client
                  </p>
                  <p className="flex items-center gap-1.5 break-words text-sm font-semibold text-gray-900 dark:text-white">
                    <Building2 className="h-3.5 w-3.5 flex-shrink-0 text-blue-500 dark:text-blue-400" />
                    <span className="truncate">
                      {String(
                        (
                          selectedUser as {
                            client_name?: string;
                            client?: string;
                            client_id?: string | number;
                          }
                        )?.client_name ||
                          (
                            selectedUser as {
                              client_name?: string;
                              client?: string;
                              client_id?: string | number;
                            }
                          )?.client ||
                          "—"
                      )}
                    </span>
                  </p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-4 border-t border-blue-200/50 pt-5 dark:border-gray-700 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <div className="min-w-0">
                  <p className="text-muted-foreground mb-2 text-xs font-medium dark:text-gray-400">
                    Email
                  </p>
                  <p className="flex items-start gap-1.5 break-words text-sm font-semibold text-gray-900 dark:text-white">
                    <Mail className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-blue-500 dark:text-blue-400" />
                    <span className="break-all">{String(selectedUser.email || "—")}</span>
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground mb-2 text-xs font-medium dark:text-gray-400">
                    Phone
                  </p>
                  <p className="flex items-center gap-1.5 break-words text-sm font-semibold text-gray-900 dark:text-white">
                    <Phone className="h-3.5 w-3.5 flex-shrink-0 text-blue-500 dark:text-blue-400" />
                    <span className="truncate">
                      {String(selectedUser.msisdn || selectedUser.phone || "—")}
                    </span>
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground mb-2 text-xs font-medium dark:text-gray-400">
                    Created
                  </p>
                  <p className="flex items-center gap-1.5 break-words text-sm font-semibold text-gray-900 dark:text-white">
                    <Clock className="h-3.5 w-3.5 flex-shrink-0 text-blue-500 dark:text-blue-400" />
                    <span className="truncate">
                      {selectedUser.created_at && typeof selectedUser.created_at === "string"
                        ? new Date(selectedUser.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : selectedUser.created && typeof selectedUser.created === "string"
                          ? new Date(selectedUser.created).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                    </span>
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground mb-2 text-xs font-medium dark:text-gray-400">
                    Updated
                  </p>
                  <p className="flex items-center gap-1.5 break-words text-sm font-semibold text-gray-900 dark:text-white">
                    <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-blue-500 dark:text-blue-400" />
                    <span className="truncate">
                      {selectedUser.updated_at && typeof selectedUser.updated_at === "string"
                        ? new Date(selectedUser.updated_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : selectedUser.updated && typeof selectedUser.updated === "string"
                          ? new Date(selectedUser.updated).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleUpdateSubmit} className="space-y-6">
            <div className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 shadow-sm dark:border-gray-800 dark:from-gray-900/50 dark:to-gray-800/30">
              <h4 className="mb-5 flex items-center gap-2.5 text-base font-semibold text-gray-900 dark:text-white">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 dark:bg-brand-400/20">
                  <Edit className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                </div>
                Editable Information
              </h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="update-full_name" className="text-gray-900 dark:text-white">
                    Full name *
                  </Label>
                  <div className="relative">
                    <User className="text-muted-foreground absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 dark:text-gray-500" />
                    <Input
                      id="update-full_name"
                      value={formData.full_name}
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, full_name: event.target.value }))
                      }
                      placeholder="Full name"
                      required
                      disabled={updateUserMutation.isPending}
                      className="h-11 rounded-xl border-2 pl-10 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-400"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="update-email" className="text-gray-900 dark:text-white">
                    Email *
                  </Label>
                  <div className="relative">
                    <Mail className="text-muted-foreground absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 dark:text-gray-500" />
                    <Input
                      id="update-email"
                      type="email"
                      value={formData.email}
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, email: event.target.value }))
                      }
                      placeholder="user@example.com"
                      required
                      disabled={updateUserMutation.isPending}
                      className="h-11 rounded-xl border-2 pl-10 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-400"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="update-msisdn" className="text-gray-900 dark:text-white">
                  Phone number *
                </Label>
                <div className="relative">
                  <Phone className="text-muted-foreground absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 dark:text-gray-500" />
                  <Input
                    id="update-msisdn"
                    value={formData.msisdn}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, msisdn: event.target.value }))
                    }
                    placeholder="+243900000000"
                    required
                    disabled={updateUserMutation.isPending}
                    className="h-11 rounded-xl border-2 pl-10 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="update-role_id" className="text-gray-900 dark:text-white">
                  Role *
                </Label>
                <Select
                  value={formData.role_id}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, role_id: value }))}
                >
                  <SelectTrigger
                    className="h-11 rounded-xl border-2 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-400"
                    disabled={updateUserMutation.isPending}
                  >
                    <SelectValue placeholder="Select role">
                      {formData.role_id
                        ? (() => {
                            const selectedRole = roleOptions.find(
                              (r: ClientUserRole) => String(r.id ?? "") === formData.role_id
                            );
                            return selectedRole
                              ? String(
                                  selectedRole.name ||
                                    selectedRole.label ||
                                    `Role ${selectedRole.id}`
                                )
                              : formData.role_id;
                          })()
                        : "Select role"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.length > 0 ? (
                      roleOptions.map((role: ClientUserRole) => {
                        const value = String(role.id ?? "");
                        const label = String(
                          role.name || role.label || role.title || `Role ${role.id}`
                        );
                        return (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        );
                      })
                    ) : (
                      <SelectItem value="" disabled>
                        No roles available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 dark:border-gray-800 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseUpdateModal}
                disabled={updateUserMutation.isPending}
                className="h-11 w-full rounded-xl border-2 font-medium transition-all hover:bg-gray-50 dark:hover:bg-gray-800 sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateUserMutation.isPending}
                className="h-11 w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-8 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-cyan-700 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-50 dark:from-blue-500 dark:to-cyan-500 dark:hover:from-blue-600 dark:hover:to-cyan-600 sm:w-auto"
              >
                {updateUserMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update user
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
