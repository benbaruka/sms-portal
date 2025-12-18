"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Key, Settings2, Shield } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ActionsTab from "./components/ActionsTab";
import ModulesTab from "./components/ModulesTab";
import RolesTab from "./components/RolesTab";

export default function RolesPage() {
  const searchParams = useSearchParams();

  // Valid tabs
  const validTabs = useMemo(() => {
    return ["roles", "modules", "actions"];
  }, []);

  // Get tab from URL params or default
  const tabFromUrl = searchParams.get("tab");
  const defaultTab = "roles";
  const initialTab = tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : defaultTab;
  const [activeTab, setActiveTab] = useState(initialTab);

  // Update active tab when URL params change
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && validTabs.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    } else if (!validTabs.includes(activeTab)) {
      setActiveTab(defaultTab);
    }
  }, [searchParams, validTabs, activeTab]);

  // Handle tab change and update URL
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", value);
      window.history.pushState({}, "", url.toString());
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="rounded-xl border border-blue-200/50 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 p-6 shadow-sm dark:border-blue-800/50 md:p-8">
        <div className="mb-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="rounded-xl bg-blue-500 p-2 shadow-md sm:p-3">
              <Shield className="h-5 w-5 text-white sm:h-6 sm:w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                Roles & Permissions
              </h1>
              <p className="text-muted-foreground mt-1 text-sm dark:text-gray-400 sm:text-base">
                Manage user roles, modules, and actions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent flex h-auto w-full justify-start overflow-x-auto rounded-lg border border-gray-200 bg-gray-100 p-1.5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <TabsTrigger
            value="roles"
            className="flex cursor-pointer items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-blue-400"
          >
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Roles</span>
            <span className="sm:hidden">Roles</span>
          </TabsTrigger>
          <TabsTrigger
            value="modules"
            className="flex cursor-pointer items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-blue-400"
          >
            <Settings2 className="h-4 w-4" />
            <span className="hidden sm:inline">Modules</span>
            <span className="sm:hidden">Modules</span>
          </TabsTrigger>
          <TabsTrigger
            value="actions"
            className="flex cursor-pointer items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-blue-400"
          >
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">Actions</span>
            <span className="sm:hidden">Actions</span>
          </TabsTrigger>
        </TabsList>

        {/* Roles Tab */}
        <TabsContent value="roles" className="mt-0 space-y-6">
          <RolesTab />
        </TabsContent>

        {/* Modules Tab */}
        <TabsContent value="modules" className="mt-0 space-y-6">
          <ModulesTab />
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="mt-0 space-y-6">
          <ActionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
