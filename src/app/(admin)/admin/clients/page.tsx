"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Plus, UserIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

// Import components for each tab
import ClientsTab from "./components/ClientsTab";
import CreateTab from "./components/CreateTab";
import UsersTab from "./components/UsersTab";

export default function ClientsPage() {
  const searchParams = useSearchParams();

  // Valid tabs
  const validTabs = useMemo(() => {
    return ["clients", "users", "create"];
  }, []);

  // Get tab from URL params or default to "clients"
  const tabFromUrl = searchParams.get("tab");
  const initialTab = tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : "clients";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Update active tab when URL params change
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && validTabs.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, validTabs]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="rounded-xl border border-blue-200/50 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 p-6 shadow-sm dark:border-blue-800/50 md:p-8">
        <div className="mb-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="rounded-xl bg-blue-500 p-2 shadow-md sm:p-3">
            <Building2 className="h-5 w-5 text-white sm:h-6 sm:w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              Client & User Management
            </h1>
            <p className="text-muted-foreground mt-1 text-sm dark:text-gray-400 sm:text-base">
              Manage clients and users, create new accounts, and update profiles
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid h-auto w-full grid-cols-3 rounded-lg border border-gray-200 bg-gray-100 p-1.5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <TabsTrigger
            value="clients"
            className="flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-blue-400"
          >
            <Building2 className="h-4 w-4" />
            <span>Clients</span>
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-blue-400"
          >
            <UserIcon className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger
            value="create"
            className="flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-blue-400"
          >
            <Plus className="h-4 w-4" />
            Create
          </TabsTrigger>
        </TabsList>

        {/* Clients Tab - includes all, update, and status functionality */}
        <TabsContent value="clients" className="mt-0 space-y-6">
          <ClientsTab />
        </TabsContent>

        {/* Users Tab - includes all, update, and status functionality */}
        <TabsContent value="users" className="mt-0 space-y-6">
          <UsersTab />
        </TabsContent>

        {/* Create Tab - can switch between create client and create user */}
        <TabsContent value="create" className="mt-0 space-y-6">
          <CreateTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
