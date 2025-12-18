"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, FileText, MessageSquare } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import DLRSummaryReport from "./components/DLRSummaryReport";
import PromotionalReport from "./components/PromotionalReport";
import TransactionalReport from "./components/TransactionalReport";

const VALID_TABS = ["dlr-summary", "transactional", "promotional"] as const;

export default function ReportsPage() {
  const searchParams = useSearchParams();

  // Get tab from URL params or default to dlr-summary
  const tabFromUrl = searchParams.get("tab");
  const initialTab =
    tabFromUrl && VALID_TABS.includes(tabFromUrl as (typeof VALID_TABS)[number])
      ? tabFromUrl
      : "dlr-summary";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Update active tab when URL params change
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && VALID_TABS.includes(tabFromUrl as (typeof VALID_TABS)[number])) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="rounded-xl border border-brand-200/50 bg-gradient-to-r from-brand-500/10 via-blue-light-500/10 to-brand-500/10 p-6 shadow-sm dark:border-brand-800/50 md:p-8">
        <div className="mb-3 flex items-center gap-4">
          <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 p-3 shadow-md">
            <BarChart3 className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white md:text-3xl">
              Reports
            </h1>
            <p className="text-muted-foreground mt-2 dark:text-gray-400">
              View and analyze your SMS performance reports
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent flex h-auto w-full justify-start overflow-x-auto rounded-lg border border-gray-200 bg-gray-100 p-1.5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <TabsTrigger
            value="dlr-summary"
            className="flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-orange-400 sm:px-4"
          >
            <BarChart3 className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">DLR Summary</span>
            <span className="sm:hidden">DLR</span>
          </TabsTrigger>
          <TabsTrigger
            value="transactional"
            className="flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-blue-400 sm:px-4"
          >
            <FileText className="h-4 w-4 flex-shrink-0" />
            <span>Transactional</span>
          </TabsTrigger>
          <TabsTrigger
            value="promotional"
            className="flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-pink-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-pink-400 sm:px-4"
          >
            <MessageSquare className="h-4 w-4 flex-shrink-0" />
            <span>Promotional</span>
          </TabsTrigger>
        </TabsList>

        {/* DLR Summary Report */}
        <TabsContent value="dlr-summary" className="space-y-6">
          <DLRSummaryReport />
        </TabsContent>

        {/* Transactional Report */}
        <TabsContent value="transactional" className="space-y-6">
          <TransactionalReport />
        </TabsContent>

        {/* Promotional Report */}
        <TabsContent value="promotional" className="space-y-6">
          <PromotionalReport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
