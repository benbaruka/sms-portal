"use client";

import NotFound from "@/app/not-found";
import { useAuth } from "@/context/AuthProvider";
import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import { isSuperAdmin as isSuperAdminUtil } from "@/utils/userUtils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { user, isAuthenticated, checkingAuth } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(true);

  // Check if user is trying to access admin routes (except /admin/tokens/*)
  const isAdminRoute = pathname?.startsWith("/admin/");
  const isTokensRoute = pathname?.startsWith("/admin/tokens");
  const isAdminRouteButNotTokens = isAdminRoute && !isTokensRoute;

  useEffect(() => {
    // Wait for auth checking to complete
    if (checkingAuth) {
      return;
    }

    // If not authenticated, not authorized
    if (!isAuthenticated || !user) {
      setIsAuthorized(false);
      setIsChecking(false);
      return;
    }

    // If accessing admin routes (except tokens), check if user is super admin (account_type === "root" OR id === 1)
    if (isAdminRouteButNotTokens) {
      const isSuperAdmin = isSuperAdminUtil(user?.message?.client);
      setIsAuthorized(isSuperAdmin === true);
      setIsChecking(false);
      return;
    }

    // For all other routes, authorized
    setIsAuthorized(true);
    setIsChecking(false);
  }, [user, isAuthenticated, checkingAuth, isAdminRouteButNotTokens, pathname]);

  // Check if we're on the upload page and user doesn't have documents
  // Only show full screen modal when specifically on upload tab or base /documents path
  const isOnDocumentsPage = pathname === "/documents" || pathname.startsWith("/documents");
  const currentTab = searchParams?.get("tab");
  const isUploadPage = isOnDocumentsPage && (!currentTab || currentTab === "upload");
  const hasDocuments = user?.message?.has_documents ?? 1;
  const showFullScreenUpload = isUploadPage && hasDocuments === 0;

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

  // If not authorized (client simple trying to access admin route), show not-found
  if (!isAuthorized && isAdminRouteButNotTokens) {
    return (
      <div className="fixed inset-0 z-[9999] bg-gray-50 dark:bg-gray-900">
        <NotFound />
      </div>
    );
  }

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[260px]"
      : "lg:ml-[80px]";

  // If on upload page without documents, show full screen modal style
  // Hide sidebar and header completely, show blurred background
  if (showFullScreenUpload) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        {/* Blurred background - shows dashboard behind but blurred */}
        <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-xl"></div>

        {/* Upload modal centered */}
        <div className="relative m-4 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border-2 border-gray-200/50 bg-white shadow-2xl dark:border-gray-800/50 dark:bg-gray-900">
          <div className="p-6 md:p-8">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 xl:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />
      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <div className="mx-auto w-full max-w-screen-2xl p-4 md:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
