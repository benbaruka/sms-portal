"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { History, Clock, Repeat } from "lucide-react";
import { MessagesTable } from "@/components/messages/MessagesTable";
import { BulkMessagesTable } from "@/components/messages/BulkMessagesTable";
import { ScheduledMessagesTable } from "@/components/messages/ScheduledMessagesTable";

export default function MessageHistoryPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("transactional");

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="rounded-xl border border-blue-light-200/50 bg-gradient-to-r from-blue-light-500/10 via-brand-500/10 to-blue-light-500/10 p-6 shadow-sm dark:border-blue-light-800/50 md:p-8">
        <div className="mb-3 flex items-center gap-4">
          <div className="rounded-xl bg-gradient-to-br from-blue-light-500 to-blue-light-600 p-3 shadow-md">
            <History className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white md:text-3xl">
              Message History
            </h1>
            <p className="text-muted-foreground mt-2 dark:text-gray-400">
              View and manage all your SMS message history
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent flex h-auto w-full justify-start overflow-x-auto rounded-lg border border-gray-200 bg-gray-100 p-1.5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <TabsTrigger
            value="transactional"
            className="flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-brand-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-brand-400 sm:px-4"
          >
            <History className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Transactional</span>
            <span className="sm:hidden">Txn</span>
          </TabsTrigger>
          <TabsTrigger
            value="promotional"
            className="flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-light-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-blue-light-400 sm:px-4"
          >
            <History className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Promotional</span>
            <span className="sm:hidden">Promo</span>
          </TabsTrigger>
          <TabsTrigger
            value="bulk"
            className="flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-success-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-success-400 sm:px-4"
          >
            <History className="h-4 w-4 flex-shrink-0" />
            <span>Bulk</span>
          </TabsTrigger>
          <TabsTrigger
            value="scheduled"
            className="flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-warning-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-warning-400 sm:px-4"
          >
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Scheduled</span>
            <span className="sm:hidden">Schedule</span>
          </TabsTrigger>
          <TabsTrigger
            value="recurring"
            className="flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-light-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-blue-light-400 sm:px-4"
          >
            <Repeat className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Recurring</span>
            <span className="sm:hidden">Repeat</span>
          </TabsTrigger>
        </TabsList>

        {/* Transactional Messages History */}
        <TabsContent value="transactional" className="space-y-6">
          <MessagesTable
            route="message/all/transactional"
            apiKey={apiKey}
            title="Transactional Messages History"
            description="View and manage all your transactional SMS messages"
            defaultSort="sms_outbox.id|desc"
            defaultPerPage={25}
            showDateFilter={true}
            showSearch={true}
          />
        </TabsContent>

        {/* Promotional Messages History */}
        <TabsContent value="promotional" className="space-y-6">
          <MessagesTable
            route="message/all/promotional"
            apiKey={apiKey}
            title="Promotional Messages History"
            description="View and manage all your promotional SMS messages"
            defaultSort="sms_outbox_promotional.id|desc"
            defaultPerPage={25}
            showDateFilter={true}
            showSearch={true}
          />
        </TabsContent>

        {/* Bulk Messages History */}
        <TabsContent value="bulk" className="space-y-6">
          <BulkMessagesTable
            route="message/bulk"
            apiKey={apiKey}
            title="Bulk Messages History"
            description="View and manage all your bulk SMS campaigns with detailed statistics"
            defaultSort="bulk_sms.id|desc"
            defaultPerPage={25}
            showDateFilter={true}
            showSearch={true}
          />
        </TabsContent>

        {/* Scheduled Messages History */}
        <TabsContent value="scheduled" className="space-y-6">
          <ScheduledMessagesTable
            route="message/all/scheduled"
            apiKey={apiKey}
            title="Scheduled Messages History"
            description="View and manage all your scheduled SMS messages"
            defaultSort="bulk_sms.id|desc"
            defaultPerPage={25}
            showDateFilter={true}
            showSearch={true}
          />
        </TabsContent>

        {/* Recurring Messages History */}
        <TabsContent value="recurring" className="space-y-6">
          <MessagesTable
            route="message/all/recurring"
            apiKey={apiKey}
            title="Recurring Messages History"
            description="View and manage all your recurring SMS messages"
            defaultSort="sms_recurring_campaign.id|desc"
            defaultPerPage={25}
            showDateFilter={true}
            showSearch={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
