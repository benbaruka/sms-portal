"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useDeleteAllNotifications,
  useDeleteNotification,
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotificationsList,
  useUpdateNotificationPreferences,
} from "@/controller/query/notifications/useNotifications";
import { Notification } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  Clock,
  Eye,
  Info,
  Loader2,
  Mail,
  MessageSquare,
  RefreshCw,
  Settings,
  Shield,
  Trash2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "settings">("all");
  const [page] = useState(1);
  const [perPage] = useState(20);

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  // Notification preferences state
  const [preferences, setPreferences] = useState({
    email: {
      enabled: true,
      transactional: true,
      promotional: true,
      system: true,
      security: true,
    },
    sms: {
      enabled: true,
      transactional: true,
      promotional: false,
      system: false,
      security: true,
    },
    push: {
      enabled: true,
      transactional: true,
      promotional: false,
      system: true,
      security: true,
    },
    general: {
      sound: true,
      desktop: true,
      quietHours: false,
      quietStart: "22:00",
      quietEnd: "08:00",
    },
  });

  const {
    data: notificationsResponse,
    isLoading,
    isFetching,
    refetch,
  } = useNotificationsList(
    {
      page,
      per_page: perPage,
      read: activeTab === "unread" ? false : undefined,
    },
    apiKey,
    !!apiKey && activeTab !== "settings"
  );

  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteMutation = useDeleteNotification();
  const deleteAllMutation = useDeleteAllNotifications();
  const updatePreferencesMutation = useUpdateNotificationPreferences();

  const notifications = useMemo(() => {
    if (!notificationsResponse) return [] as Notification[];
    const data =
      notificationsResponse.notifications ||
      notificationsResponse.message?.notifications ||
      notificationsResponse.message?.data ||
      notificationsResponse.data?.notifications ||
      notificationsResponse.data?.data ||
      [];
    return Array.isArray(data) ? data : [];
  }, [notificationsResponse]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read || n.read === 0).length;
  }, [notifications]);

  const handleMarkAsRead = async (id: number | string | undefined) => {
    if (!apiKey || !id) return;
    try {
      await markAsReadMutation.mutateAsync({
        data: { notification_id: id },
        apiKey,
      });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      await refetch();
    } catch {
      // Error handled in mutation
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!apiKey) return;
    try {
      await markAllAsReadMutation.mutateAsync({ apiKey });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      await refetch();
    } catch {
      // Error handled in mutation
    }
  };

  const handleDelete = async (id: number | string | undefined) => {
    if (!apiKey || !id) return;
    try {
      await deleteMutation.mutateAsync({ notificationId: id, apiKey });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      await refetch();
    } catch {
      // Error handled in mutation
    }
  };

  const handleDeleteAll = async () => {
    if (!apiKey) return;
    try {
      await deleteAllMutation.mutateAsync({ apiKey });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      await refetch();
    } catch {
      // Error handled in mutation
    }
  };

  const handlePreferenceChange = async (category: string, key: string, value: boolean) => {
    if (!apiKey) return;
    const newPreferences = {
      ...preferences,
      [category]: {
        ...preferences[category as keyof typeof preferences],
        [key]: value,
      },
    };
    setPreferences(newPreferences);
    try {
      await updatePreferencesMutation.mutateAsync({
        data: newPreferences,
        apiKey,
      });
    } catch {
      // Error handled in mutation, revert on error
      setPreferences(preferences);
    }
  };

  const getNotificationIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "email":
        return <Mail className="h-5 w-5" />;
      case "sms":
        return <MessageSquare className="h-5 w-5" />;
      case "push":
        return <Bell className="h-5 w-5" />;
      case "system":
        return <Info className="h-5 w-5" />;
      case "security":
        return <Shield className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getNotificationColor = (type?: string, priority?: string) => {
    if (priority?.toLowerCase() === "high") {
      return "text-red-600 dark:text-red-400 bg-red-500/10 dark:bg-red-500/20";
    }
    if (priority?.toLowerCase() === "medium") {
      return "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 dark:bg-yellow-500/20";
    }
    return "text-blue-600 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/20";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);

      if (hours < 1) return "Just now";
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const unreadNotifications = useMemo(() => {
    return notifications.filter((n) => !n.read || n.read === 0);
  }, [notifications]);

  const isRefreshing = isFetching && !isLoading;
  const isLoadingAny =
    isLoading ||
    isRefreshing ||
    markAsReadMutation.isPending ||
    markAllAsReadMutation.isPending ||
    deleteMutation.isPending ||
    deleteAllMutation.isPending;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="rounded-xl border border-brand-200/50 bg-gradient-to-r from-brand-500/10 via-blue-light-500/10 to-brand-500/10 p-6 shadow-sm dark:border-brand-800/50 md:p-8">
        <div className="mb-3 flex items-center gap-4">
          <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 p-3 shadow-md">
            <Bell className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white md:text-3xl">
              Notifications
            </h1>
            <p className="text-muted-foreground mt-2 dark:text-gray-400">
              Manage your notifications, preferences, and stay updated on important events
            </p>
          </div>
        </div>
      </div>

      {/* Alert: Fonctionnalité non disponible */}
      <Alert className="border-yellow-500/50 bg-yellow-50 dark:border-yellow-500/30 dark:bg-yellow-500/10">
        <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        <AlertTitle className="text-yellow-800 dark:text-yellow-200">
          Fonctionnalité en cours de développement
        </AlertTitle>
        <AlertDescription className="text-yellow-700 dark:text-yellow-300">
          La fonctionnalité de notifications n&apos;est pas encore disponible. Les endpoints backend
          sont en cours d&apos;implémentation. Cette page sera fonctionnelle une fois les API
          disponibles.
        </AlertDescription>
      </Alert>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "all" | "unread" | "settings")}
        className="space-y-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent flex h-auto w-full justify-start overflow-x-auto rounded-lg border border-gray-200 bg-gray-100 p-1.5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <TabsTrigger
              value="all"
              className="flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-brand-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-brand-400 sm:px-4"
            >
              <Bell className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">All</span>
              <span className="sm:hidden">All</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="unread"
              className="flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-blue-400 sm:px-4"
            >
              <Eye className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Unread</span>
              <span className="sm:hidden">Unread</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-purple-400 sm:px-4"
            >
              <Settings className="h-4 w-4 flex-shrink-0" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Action Buttons */}
          {(unreadCount > 0 || notifications.length > 0) && (
            <div className="flex flex-wrap gap-2 sm:flex-nowrap">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  onClick={handleMarkAllAsRead}
                  disabled={isLoadingAny}
                  size="sm"
                  className="h-9 rounded-lg border-2"
                >
                  {markAllAsReadMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Marking...
                    </>
                  ) : (
                    <>
                      <CheckCheck className="mr-2 h-3 w-3" />
                      Mark All Read
                    </>
                  )}
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleDeleteAll}
                  disabled={isLoadingAny}
                  size="sm"
                  className="h-9 rounded-lg border-2"
                >
                  {deleteAllMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-3 w-3" />
                      Clear All
                    </>
                  )}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={isLoadingAny}
                size="sm"
                className="h-9 rounded-lg border-2"
              >
                {isRefreshing ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Refresh
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* All Notifications */}
        <TabsContent value="all" className="space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 className="mb-4 h-8 w-8 animate-spin text-brand-500" />
              <p className="text-muted-foreground text-sm">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
                  <Bell className="h-12 w-12 text-gray-400 dark:text-gray-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  No notifications
                </h3>
                <p className="text-muted-foreground max-w-md text-center text-sm dark:text-gray-400">
                  You don&apos;t have any notifications yet. When you receive notifications,
                  they&apos;ll appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const isUnread = !notification.read || notification.read === 0;
                return (
                  <Card
                    key={notification.id}
                    className={`group relative overflow-hidden rounded-3xl border transition-all hover:shadow-lg ${
                      isUnread
                        ? "border-l-4 border-gray-200 border-l-brand-500 bg-gradient-to-r from-brand-50/50 to-white dark:border-gray-800 dark:border-l-brand-500/50 dark:from-brand-500/10 dark:to-gray-900"
                        : "border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
                    }`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm transition-all group-hover:scale-105 ${getNotificationColor(
                            notification.type,
                            notification.priority
                          )}`}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="mb-1 flex items-center gap-2">
                                <h3
                                  className={`truncate text-base font-semibold text-gray-900 dark:text-white ${isUnread ? "font-bold" : ""}`}
                                >
                                  {notification.title || "Notification"}
                                </h3>
                                {isUnread && (
                                  <div className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-brand-500"></div>
                                )}
                              </div>
                              <p className="line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                                {notification.message || ""}
                              </p>
                              <div className="mt-3 flex items-center gap-3">
                                {notification.priority && (
                                  <Badge
                                    variant={
                                      notification.priority?.toLowerCase() === "high"
                                        ? "destructive"
                                        : "secondary"
                                    }
                                    className="text-xs font-medium"
                                  >
                                    {notification.priority}
                                  </Badge>
                                )}
                                <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                  <Clock className="h-3 w-3" />
                                  {formatDate(notification.created_at || notification.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 border-t border-gray-100 pt-2 dark:border-gray-800">
                            {(notification.action_url || notification.actionUrl) && (
                              <Button variant="outline" size="sm" asChild className="h-8 text-xs">
                                <a
                                  href={notification.action_url || notification.actionUrl}
                                  className="flex items-center gap-1"
                                >
                                  <Eye className="h-3 w-3" />
                                  View Details
                                </a>
                              </Button>
                            )}
                            {isUnread && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification.id)}
                                disabled={isLoadingAny}
                                className="h-8 text-xs"
                              >
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Mark as read
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(notification.id)}
                              disabled={isLoadingAny}
                              className="ml-auto h-8 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Unread Notifications */}
        <TabsContent value="unread" className="space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 className="mb-4 h-8 w-8 animate-spin text-brand-500" />
              <p className="text-muted-foreground text-sm">Loading unread notifications...</p>
            </div>
          ) : unreadNotifications.length === 0 ? (
            <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="mb-4 rounded-full bg-green-100 p-4 dark:bg-green-500/20">
                  <CheckCircle2 className="h-12 w-12 text-green-500 dark:text-green-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  All caught up!
                </h3>
                <p className="text-muted-foreground max-w-md text-center text-sm dark:text-gray-400">
                  You don&apos;t have any unread notifications.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {unreadNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className="group relative overflow-hidden rounded-3xl border border-l-4 border-gray-200 border-l-brand-500 bg-gradient-to-r from-brand-50/50 to-white transition-all hover:shadow-lg dark:border-gray-800 dark:border-l-brand-500/50 dark:from-brand-500/10 dark:to-gray-900"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm transition-all group-hover:scale-105 ${getNotificationColor(
                          notification.type,
                          notification.priority
                        )}`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <h3 className="truncate text-base font-bold text-gray-900 dark:text-white">
                                {notification.title || "Notification"}
                              </h3>
                              <div className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-brand-500"></div>
                            </div>
                            <p className="line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                              {notification.message || ""}
                            </p>
                            <div className="mt-3 flex items-center gap-3">
                              {notification.priority && (
                                <Badge
                                  variant={
                                    notification.priority?.toLowerCase() === "high"
                                      ? "destructive"
                                      : "secondary"
                                  }
                                  className="text-xs font-medium"
                                >
                                  {notification.priority}
                                </Badge>
                              )}
                              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <Clock className="h-3 w-3" />
                                {formatDate(notification.created_at || notification.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 border-t border-gray-100 pt-2 dark:border-gray-800">
                          {(notification.action_url || notification.actionUrl) && (
                            <Button variant="outline" size="sm" asChild className="h-8 text-xs">
                              <a
                                href={notification.action_url || notification.actionUrl}
                                className="flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                View Details
                              </a>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            disabled={isLoadingAny}
                            className="h-8 text-xs"
                          >
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Mark as read
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(notification.id)}
                            disabled={isLoadingAny}
                            className="ml-auto h-8 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-6">
          {/* Email Notifications */}
          <Card className="overflow-hidden rounded-3xl border-0 bg-white/80 shadow-xl backdrop-blur-sm dark:bg-gray-900/80">
            <CardHeader className="border-b border-gray-200/50 bg-gradient-to-r from-blue-50/50 to-blue-100/50 p-6 dark:border-gray-800/50 dark:from-blue-950/50 dark:to-blue-900/50 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 shadow-lg">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
                    Email Notifications
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                    Configure which email notifications you want to receive
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-6 sm:p-8">
              <div className="flex items-center justify-between rounded-xl border-2 border-gray-200 bg-gradient-to-r from-gray-50/50 to-gray-100/50 p-4 transition-all duration-200 hover:shadow-lg dark:border-gray-700 dark:from-gray-800/50 dark:to-gray-900/50 sm:p-5">
                <div className="flex-1">
                  <Label
                    htmlFor="email-enabled"
                    className="mb-1 block text-base font-semibold text-gray-900 dark:text-white"
                  >
                    Enable Email Notifications
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  id="email-enabled"
                  checked={preferences.email.enabled}
                  onCheckedChange={(checked) => handlePreferenceChange("email", "enabled", checked)}
                />
              </div>
              <div className="space-y-3 pl-4">
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white/50 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800">
                  <Label
                    htmlFor="email-transactional"
                    className="cursor-pointer text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Transactional
                  </Label>
                  <Switch
                    id="email-transactional"
                    checked={preferences.email.transactional}
                    disabled={!preferences.email.enabled}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange("email", "transactional", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white/50 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800">
                  <Label
                    htmlFor="email-promotional"
                    className="cursor-pointer text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Promotional
                  </Label>
                  <Switch
                    id="email-promotional"
                    checked={preferences.email.promotional}
                    disabled={!preferences.email.enabled}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange("email", "promotional", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white/50 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800">
                  <Label
                    htmlFor="email-system"
                    className="cursor-pointer text-sm font-medium text-gray-900 dark:text-white"
                  >
                    System Updates
                  </Label>
                  <Switch
                    id="email-system"
                    checked={preferences.email.system}
                    disabled={!preferences.email.enabled}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange("email", "system", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white/50 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800">
                  <Label
                    htmlFor="email-security"
                    className="cursor-pointer text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Security Alerts
                  </Label>
                  <Switch
                    id="email-security"
                    checked={preferences.email.security}
                    disabled={!preferences.email.enabled}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange("email", "security", checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SMS Notifications */}
          <Card className="overflow-hidden rounded-3xl border-0 bg-white/80 shadow-xl backdrop-blur-sm dark:bg-gray-900/80">
            <CardHeader className="border-b border-gray-200/50 bg-gradient-to-r from-green-50/50 to-green-100/50 p-6 dark:border-gray-800/50 dark:from-green-950/50 dark:to-green-900/50 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-3 shadow-lg">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
                    SMS Notifications
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                    Configure which SMS notifications you want to receive
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-6 sm:p-8">
              <div className="flex items-center justify-between rounded-xl border-2 border-gray-200 bg-gradient-to-r from-gray-50/50 to-gray-100/50 p-4 transition-all duration-200 hover:shadow-lg dark:border-gray-700 dark:from-gray-800/50 dark:to-gray-900/50 sm:p-5">
                <div className="flex-1">
                  <Label
                    htmlFor="sms-enabled"
                    className="mb-1 block text-base font-semibold text-gray-900 dark:text-white"
                  >
                    Enable SMS Notifications
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive notifications via SMS
                  </p>
                </div>
                <Switch
                  id="sms-enabled"
                  checked={preferences.sms.enabled}
                  onCheckedChange={(checked) => handlePreferenceChange("sms", "enabled", checked)}
                />
              </div>
              <div className="space-y-3 pl-4">
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white/50 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800">
                  <Label
                    htmlFor="sms-transactional"
                    className="cursor-pointer text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Transactional
                  </Label>
                  <Switch
                    id="sms-transactional"
                    checked={preferences.sms.transactional}
                    disabled={!preferences.sms.enabled}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange("sms", "transactional", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white/50 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800">
                  <Label
                    htmlFor="sms-promotional"
                    className="cursor-pointer text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Promotional
                  </Label>
                  <Switch
                    id="sms-promotional"
                    checked={preferences.sms.promotional}
                    disabled={!preferences.sms.enabled}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange("sms", "promotional", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white/50 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800">
                  <Label
                    htmlFor="sms-system"
                    className="cursor-pointer text-sm font-medium text-gray-900 dark:text-white"
                  >
                    System Updates
                  </Label>
                  <Switch
                    id="sms-system"
                    checked={preferences.sms.system}
                    disabled={!preferences.sms.enabled}
                    onCheckedChange={(checked) => handlePreferenceChange("sms", "system", checked)}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white/50 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800">
                  <Label
                    htmlFor="sms-security"
                    className="cursor-pointer text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Security Alerts
                  </Label>
                  <Switch
                    id="sms-security"
                    checked={preferences.sms.security}
                    disabled={!preferences.sms.enabled}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange("sms", "security", checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Push Notifications */}
          <Card className="overflow-hidden rounded-3xl border-0 bg-white/80 shadow-xl backdrop-blur-sm dark:bg-gray-900/80">
            <CardHeader className="border-b border-gray-200/50 bg-gradient-to-r from-purple-50/50 to-purple-100/50 p-6 dark:border-gray-800/50 dark:from-purple-950/50 dark:to-purple-900/50 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-3 shadow-lg">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
                    Push Notifications
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                    Configure which push notifications you want to receive
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-6 sm:p-8">
              <div className="flex items-center justify-between rounded-xl border-2 border-gray-200 bg-gradient-to-r from-gray-50/50 to-gray-100/50 p-4 transition-all duration-200 hover:shadow-lg dark:border-gray-700 dark:from-gray-800/50 dark:to-gray-900/50 sm:p-5">
                <div className="flex-1">
                  <Label
                    htmlFor="push-enabled"
                    className="mb-1 block text-base font-semibold text-gray-900 dark:text-white"
                  >
                    Enable Push Notifications
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive notifications in your browser
                  </p>
                </div>
                <Switch
                  id="push-enabled"
                  checked={preferences.push.enabled}
                  onCheckedChange={(checked) => handlePreferenceChange("push", "enabled", checked)}
                />
              </div>
              <div className="space-y-3 pl-4">
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white/50 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800">
                  <Label
                    htmlFor="push-transactional"
                    className="cursor-pointer text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Transactional
                  </Label>
                  <Switch
                    id="push-transactional"
                    checked={preferences.push.transactional}
                    disabled={!preferences.push.enabled}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange("push", "transactional", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white/50 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800">
                  <Label
                    htmlFor="push-promotional"
                    className="cursor-pointer text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Promotional
                  </Label>
                  <Switch
                    id="push-promotional"
                    checked={preferences.push.promotional}
                    disabled={!preferences.push.enabled}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange("push", "promotional", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white/50 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800">
                  <Label
                    htmlFor="push-system"
                    className="cursor-pointer text-sm font-medium text-gray-900 dark:text-white"
                  >
                    System Updates
                  </Label>
                  <Switch
                    id="push-system"
                    checked={preferences.push.system}
                    disabled={!preferences.push.enabled}
                    onCheckedChange={(checked) => handlePreferenceChange("push", "system", checked)}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white/50 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800">
                  <Label
                    htmlFor="push-security"
                    className="cursor-pointer text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Security Alerts
                  </Label>
                  <Switch
                    id="push-security"
                    checked={preferences.push.security}
                    disabled={!preferences.push.enabled}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange("push", "security", checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* General Settings */}
          <Card className="overflow-hidden rounded-3xl border-0 bg-white/80 shadow-xl backdrop-blur-sm dark:bg-gray-900/80">
            <CardHeader className="border-b border-gray-200/50 bg-gradient-to-r from-amber-50/50 to-amber-100/50 p-6 dark:border-gray-800/50 dark:from-amber-950/50 dark:to-amber-900/50 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 p-3 shadow-lg">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
                    General Settings
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                    Configure general notification preferences
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-6 sm:p-8">
              <div className="flex items-center justify-between rounded-xl border-2 border-gray-200 bg-gradient-to-r from-gray-50/50 to-gray-100/50 p-4 transition-all duration-200 hover:shadow-lg dark:border-gray-700 dark:from-gray-800/50 dark:to-gray-900/50 sm:p-5">
                <div className="flex flex-1 items-center gap-4">
                  <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 shadow-md">
                    {preferences.general.sound ? (
                      <Volume2 className="h-5 w-5 text-white" />
                    ) : (
                      <VolumeX className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Label
                      htmlFor="sound"
                      className="mb-1 block cursor-pointer text-base font-semibold text-gray-900 dark:text-white"
                    >
                      Sound
                    </Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Play sound when receiving notifications
                    </p>
                  </div>
                </div>
                <Switch
                  id="sound"
                  checked={preferences.general.sound}
                  onCheckedChange={(checked) => handlePreferenceChange("general", "sound", checked)}
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border-2 border-gray-200 bg-gradient-to-r from-gray-50/50 to-gray-100/50 p-4 transition-all duration-200 hover:shadow-lg dark:border-gray-700 dark:from-gray-800/50 dark:to-gray-900/50 sm:p-5">
                <div className="flex flex-1 items-center gap-4">
                  <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-3 shadow-md">
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <Label
                      htmlFor="desktop"
                      className="mb-1 block cursor-pointer text-base font-semibold text-gray-900 dark:text-white"
                    >
                      Desktop Notifications
                    </Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Show desktop notifications
                    </p>
                  </div>
                </div>
                <Switch
                  id="desktop"
                  checked={preferences.general.desktop}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange("general", "desktop", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
