"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Send, Clock, Users, AlertCircle } from "lucide-react";
import SendTransactionalForm from "../components/SendTransactionalForm";
import SendPromotionalForm from "../components/SendPromotionalForm";
import SendScheduledForm from "../components/SendScheduledForm";
import SendBulkForm from "../components/SendBulkForm";
import SendContactGroupForm from "../components/SendContactGroupForm";

export default function SendMessagesPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // Get tab from URL params or default to transactional
  const tabFromUrl = searchParams.get("tab");
  const validTabs = useMemo(
    () => ["transactional", "promotional", "scheduled", "bulk", "contact-group"],
    []
  );
  const initialTab = tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : "transactional";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

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
      <div className="rounded-xl border border-brand-200/50 bg-gradient-to-r from-brand-500/10 via-blue-light-500/10 to-brand-500/10 p-6 shadow-sm dark:border-brand-800/50 md:p-8">
        <div className="mb-3 flex items-center gap-4">
          <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 p-3 shadow-md">
            <Send className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white md:text-3xl">
              Send Messages
            </h1>
            <p className="text-muted-foreground mt-2 dark:text-gray-400">
              Send SMS messages to your contacts
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent flex h-auto w-full justify-start overflow-x-auto rounded-lg border border-gray-200 bg-gray-100 p-1.5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <TabsTrigger
            value="transactional"
            className="flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-brand-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-brand-400"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Transactional</span>
          </TabsTrigger>
          <TabsTrigger
            value="promotional"
            className="flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-light-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-blue-light-400"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Promotional</span>
          </TabsTrigger>
          <TabsTrigger
            value="scheduled"
            className="flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-warning-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-warning-400"
          >
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Scheduled</span>
          </TabsTrigger>
          <TabsTrigger
            value="bulk"
            className="flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-success-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-success-400"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Bulk</span>
          </TabsTrigger>
          <TabsTrigger
            value="contact-group"
            className="data-[state=active]:text-theme-purple-600 dark:data-[state=active]:text-theme-purple-400 flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Contact Group</span>
          </TabsTrigger>
        </TabsList>

        {/* Send Transactional SMS */}
        <TabsContent value="transactional" className="space-y-6">
          <SendTransactionalForm apiKey={apiKey} />
        </TabsContent>

        {/* Send Promotional SMS */}
        <TabsContent value="promotional" className="space-y-6">
          <SendPromotionalForm apiKey={apiKey} />
        </TabsContent>

        {/* Send Scheduled SMS */}
        <TabsContent value="scheduled" className="space-y-6">
          <SendScheduledForm apiKey={apiKey} />
        </TabsContent>

        {/* Send Bulk SMS */}
        <TabsContent value="bulk" className="space-y-6">
          <SendBulkForm apiKey={apiKey} />
        </TabsContent>

        {/* Send to Contact Group */}
        <TabsContent value="contact-group" className="space-y-6">
          <SendContactGroupForm apiKey={apiKey} />
        </TabsContent>
      </Tabs>

      {!apiKey && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            API Key is required. Please generate an API key to send SMS messages.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
