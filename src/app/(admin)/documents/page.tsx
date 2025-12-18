"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthProvider";
import { FileText, FolderOpen, Settings, Upload } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

// Import components for each tab
import { isSuperAdmin as isSuperAdminUtil } from "@/utils/userUtils";
import ClientDocumentsTab from "./components/ClientDocumentsTab";
import DocumentTypesTab from "./components/DocumentTypesTab";
import MyDocumentsTab from "./components/MyDocumentsTab";
import UploadDocumentTab from "./components/UploadDocumentTab";

export default function DocumentsPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Check if user is super admin (account_type === "root" OR id === 1)
  const clientData = user?.message?.client;
  const isSuperAdmin = isSuperAdminUtil(clientData);

  // Valid tabs based on user role
  // Super admins cannot upload documents, so they only see client-documents and document-types
  // Regular clients can upload documents, so they see my-documents and upload
  const validTabs = useMemo(() => {
    return isSuperAdmin ? ["client-documents", "document-types"] : ["my-documents", "upload"];
  }, [isSuperAdmin]);

  // Get tab from URL params or default based on role
  // For better UX, default to document-types for admins (easier to find documents)
  const tabFromUrl = searchParams.get("tab");
  const defaultTab = isSuperAdmin ? "document-types" : "my-documents";
  const initialTab = tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : defaultTab;
  const [activeTab, setActiveTab] = useState(initialTab);

  // Update active tab when URL params change or when role changes
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && validTabs.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    } else if (!validTabs.includes(activeTab)) {
      // If current tab is not valid for current role, switch to default
      const defaultTab = isSuperAdmin ? "document-types" : "my-documents";
      setActiveTab(defaultTab);
    }
  }, [searchParams, validTabs, activeTab, isSuperAdmin]);

  // Handle tab change and update URL
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Optionally update URL without navigation
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
        <div className="mb-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="rounded-xl bg-blue-500 p-2 shadow-md sm:p-3">
            <FileText className="h-5 w-5 text-white sm:h-6 sm:w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              Documents
            </h1>
            <p className="text-muted-foreground mt-1 text-sm dark:text-gray-400 sm:text-base">
              Manage and upload your documents
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent flex h-auto w-full justify-start overflow-x-auto rounded-lg border border-gray-200 bg-gray-100 p-1.5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          {!isSuperAdmin && (
            <>
              <TabsTrigger
                value="my-documents"
                className="flex cursor-pointer items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-blue-400"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">My Documents</span>
                <span className="sm:hidden">My Docs</span>
              </TabsTrigger>
              <TabsTrigger
                value="upload"
                className="flex cursor-pointer items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-blue-400"
              >
                <Upload className="h-4 w-4" />
                Upload
              </TabsTrigger>
            </>
          )}
          {isSuperAdmin && (
            <>
              <TabsTrigger
                value="document-types"
                className="flex cursor-pointer items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-blue-400"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Document Types</span>
                <span className="sm:hidden">Types</span>
              </TabsTrigger>
              <TabsTrigger
                value="client-documents"
                className="flex cursor-pointer items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-blue-400"
              >
                <FolderOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Client Documents</span>
                <span className="sm:hidden">Clients</span>
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* My Documents Tab (Regular clients only) */}
        {!isSuperAdmin && (
          <TabsContent value="my-documents" className="mt-0 space-y-6">
            <MyDocumentsTab />
          </TabsContent>
        )}

        {/* Upload Document Tab (Regular clients only) */}
        {!isSuperAdmin && (
          <TabsContent value="upload" className="mt-0 space-y-6">
            <UploadDocumentTab />
          </TabsContent>
        )}

        {/* Client Documents Tab (Admin only) */}
        {isSuperAdmin && (
          <TabsContent value="client-documents" className="mt-0 space-y-6">
            <ClientDocumentsTab />
          </TabsContent>
        )}

        {/* Document Types Tab (Admin only) */}
        {isSuperAdmin && (
          <TabsContent value="document-types" className="mt-0 space-y-6">
            <DocumentTypesTab />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
