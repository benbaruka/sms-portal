"use client";

import { useAuth } from "@/context/AuthProvider";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import NotFound from "@/app/not-found";
import { isSuperAdmin as isSuperAdminUtil } from "@/utils/userUtils";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, checkingAuth } = useAuth();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // ✅ Les pages de tokens sont accessibles à tous les utilisateurs authentifiés
  // Pas besoin d'être super admin pour /admin/tokens/*
  const isTokensRoute = pathname?.startsWith("/admin/tokens");

  useEffect(() => {
    // Wait for auth checking to complete
    if (checkingAuth) {
      return;
    }

    // If not authenticated at all, not authorized
    if (!isAuthenticated || !user) {
      setIsAuthorized(false);
      setIsChecking(false);
      return;
    }

    // ✅ Si c'est une route de tokens, tous les utilisateurs authentifiés peuvent accéder
    if (isTokensRoute) {
      setIsAuthorized(true);
      setIsChecking(false);
      return;
    }

    // Pour les autres routes admin, vérifier si user est super admin (account_type === "root" OR id === 1)
    const isSuperAdmin = isSuperAdminUtil(user?.message?.client);

    setIsAuthorized(isSuperAdmin === true);
    setIsChecking(false);
  }, [user, isAuthenticated, checkingAuth, isTokensRoute]);

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

  // If not super admin, show not-found page (full screen, bypassing parent layout)
  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 z-[9999] bg-gray-50 dark:bg-gray-900">
        <NotFound />
      </div>
    );
  }

  // If super admin, show the page
  return <>{children}</>;
}
