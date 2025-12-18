"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthProvider";
import { Key, List, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

// Import components for each tab
import { isSuperAdmin as isSuperAdminUtil } from "@/utils/userUtils";
import CreateLiveTokenTab from "./components/CreateLiveTokenTab";
import DeleteTokenTab from "./components/DeleteTokenTab";
import KYBStatusTab from "./components/KYBStatusTab";
import ListTokensTab from "./components/ListTokensTab";

export default function TokensPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  // Valid tabs - all clients can access these tabs
  const validTabs = useMemo(() => ["create-live", "list", "delete", "kyb-status"], []);

  // Check if user is super admin
  const clientData = user?.message?.client;
  const isSuperAdmin = isSuperAdminUtil(clientData);

  // Get tab from URL params or default to create-live
  const tabFromUrl = searchParams.get("tab");
  const initialTab = tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : "create-live";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Redirect super admin to admin tokens page
  useEffect(() => {
    if (isSuperAdmin) {
      router.replace("/admin/tokens/all");
    }
  }, [isSuperAdmin, router]);

  // Update active tab when URL params change
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && validTabs.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, validTabs]);

  // Don't render anything if super admin (will be redirected)
  if (isSuperAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-brand-200/50 bg-gradient-to-r from-brand-500/10 via-brand-600/10 to-brand-500/10 p-6 shadow-sm dark:border-brand-800/50 md:p-8">
        <div className="mb-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="rounded-xl bg-brand-500 p-2 shadow-md sm:p-3">
            <Key className="h-5 w-5 text-white sm:h-6 sm:w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              Token Management
            </h1>
            <p className="text-muted-foreground mt-1 text-sm dark:text-gray-400 sm:text-base">
              Manage your API tokens and check KYB status
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent flex h-auto w-full justify-start overflow-x-auto rounded-lg border border-gray-200 bg-gray-100 p-1.5 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
          <TabsTrigger
            value="create-live"
            className="flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-brand-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-brand-400"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create Live Token</span>
            <span className="sm:hidden">Create</span>
          </TabsTrigger>
          <TabsTrigger
            value="list"
            className="flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-brand-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-brand-400"
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">List Tokens</span>
            <span className="sm:hidden">List</span>
          </TabsTrigger>
          <TabsTrigger
            value="delete"
            className="flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-brand-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-brand-400"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Delete Token</span>
            <span className="sm:hidden">Delete</span>
          </TabsTrigger>
          <TabsTrigger
            value="kyb-status"
            className="flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-brand-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-brand-400"
          >
            <ShieldCheck className="h-4 w-4" />
            <span className="hidden sm:inline">KYB Status</span>
            <span className="sm:hidden">KYB</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create-live" className="mt-6">
          <CreateLiveTokenTab />
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <ListTokensTab />
        </TabsContent>

        <TabsContent value="delete" className="mt-6">
          <DeleteTokenTab />
        </TabsContent>

        <TabsContent value="kyb-status" className="mt-6">
          <KYBStatusTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
