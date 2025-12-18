"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Hash, List, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import NotFound from "@/app/not-found";
import MySendersPage from "./my-senders/page";
import CreateSenderPage from "./create/page";
import { isSuperAdmin as isSuperAdminUtil } from "@/utils/userUtils";

const VALID_TABS = ["my-senders", "create"] as const;
type TabValue = (typeof VALID_TABS)[number];

export default function SendersPage() {
  const { user, isAuthenticated, checkingAuth } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  // Check if user is admin (super admin: account_type === "root" OR id === 1)
  const isAdmin = useMemo(() => {
    return isSuperAdminUtil(user?.message?.client);
  }, [user]);

  // Get tab from URL params or default to my-senders
  const tabFromUrl = searchParams.get("tab");

  // For admins, allow all tabs; for clients, only "my-senders" (but they won't access anyway)
  const validTabForUser = isAdmin
    ? tabFromUrl && VALID_TABS.includes(tabFromUrl as TabValue)
      ? tabFromUrl
      : "my-senders"
    : "my-senders";

  const [activeTab, setActiveTab] = useState(validTabForUser);

  // Check authorization
  useEffect(() => {
    if (checkingAuth) {
      return;
    }

    // If not authenticated, not authorized
    if (!isAuthenticated || !user) {
      setIsChecking(false);
      return;
    }

    // Only super admin can access senders page
    setIsChecking(false);
  }, [user, isAuthenticated, checkingAuth]);

  // Update active tab when URL params change (only for admins)
  useEffect(() => {
    if (!isAdmin) return;

    const tabFromUrl = searchParams.get("tab");

    if (tabFromUrl && VALID_TABS.includes(tabFromUrl as TabValue)) {
      setActiveTab(tabFromUrl);
    } else {
      setActiveTab("my-senders");
    }
  }, [searchParams, isAdmin]);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    // Prevent clients from accessing "create" tab
    if (value === "create" && !isAdmin) {
      return;
    }
    setActiveTab(value);
    router.push(`/senders?tab=${value}`);
  };

  // Show loading state while checking
  if (isChecking || checkingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Vérification des permissions...
          </p>
        </div>
      </div>
    );
  }

  // If not super admin, show not-found page
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-[9999] bg-gray-50 dark:bg-gray-900">
        <NotFound />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="rounded-xl border border-brand-200/50 bg-gradient-to-r from-brand-500/10 via-blue-light-500/10 to-brand-500/10 p-6 shadow-sm dark:border-brand-800/50 md:p-8">
        <div className="mb-3 flex items-center gap-4">
          <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 p-3 shadow-md">
            <Hash className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white md:text-3xl">
              Senders
            </h1>
            <p className="text-muted-foreground mt-2 dark:text-gray-400">
              Manage your sender IDs and create new requests
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList
          className={`grid w-full ${isAdmin ? "grid-cols-2" : "grid-cols-1"} h-auto rounded-lg border border-gray-200 bg-gray-100 p-1.5 shadow-sm dark:border-gray-700 dark:bg-gray-800`}
        >
          <TabsTrigger
            value="my-senders"
            className="flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-brand-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-brand-400"
          >
            <List className="h-4 w-4" />
            <span>My Sender IDs</span>
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger
              value="create"
              className="flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-brand-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-brand-400"
            >
              <Plus className="h-4 w-4" />
              <span>Create Sender</span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* My Senders Tab */}
        <TabsContent value="my-senders" className="space-y-6">
          <MySendersPage />
        </TabsContent>

        {/* Create Sender Tab - Only visible for admins */}
        {isAdmin && (
          <TabsContent value="create" className="space-y-6">
            <CreateSenderPage />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
