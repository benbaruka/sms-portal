"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Wallet, History, Smartphone } from "lucide-react";
import BalancePage from "./balance/page";
import TopupHistoryPage from "./history/page";
import MNOTopupPage from "./mno/page";

const VALID_TABS = ["balance", "history", "mno"] as const;
type TabValue = (typeof VALID_TABS)[number];

export default function TopupPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get tab from URL params or default to balance
  const tabFromUrl = searchParams.get("tab");
  const initialTab =
    tabFromUrl && VALID_TABS.includes(tabFromUrl as TabValue) ? tabFromUrl : "balance";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Update active tab when URL params change
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && VALID_TABS.includes(tabFromUrl as TabValue)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/topup?tab=${value}`);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="rounded-xl border border-brand-200/50 bg-gradient-to-r from-brand-500/10 via-blue-light-500/10 to-brand-500/10 p-6 shadow-sm dark:border-brand-800/50 md:p-8">
        <div className="mb-3 flex items-center gap-4">
          <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 p-3 shadow-md">
            <Wallet className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white md:text-3xl">
              Topup
            </h1>
            <p className="text-muted-foreground mt-2 dark:text-gray-400">
              Manage your account balance and topup options
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent flex h-auto w-full justify-start overflow-x-auto rounded-lg border border-gray-200 bg-gray-100 p-1.5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <TabsTrigger
            value="balance"
            className="flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-brand-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-brand-400 sm:px-4"
          >
            <Wallet className="h-4 w-4 flex-shrink-0" />
            <span>Balance</span>
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-brand-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-brand-400 sm:px-4"
          >
            <History className="h-4 w-4 flex-shrink-0" />
            <span>History</span>
          </TabsTrigger>
          <TabsTrigger
            value="mno"
            className="flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-brand-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-brand-400 sm:px-4"
          >
            <Smartphone className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">MNO Topup</span>
            <span className="sm:hidden">MNO</span>
          </TabsTrigger>
        </TabsList>

        {/* Balance Tab */}
        <TabsContent value="balance" className="space-y-6">
          <BalancePage />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <TopupHistoryPage />
        </TabsContent>

        {/* MNO Topup Tab */}
        <TabsContent value="mno" className="space-y-6">
          <MNOTopupPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
