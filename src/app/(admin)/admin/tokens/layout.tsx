"use client";

import { useAuth } from "@/context/AuthProvider";
import { useEffect, useState } from "react";
import NotFound from "@/app/not-found";

/**
 * Layout pour les pages de tokens
 * Override le SuperAdminLayout parent pour permettre l'accès à TOUS les utilisateurs authentifiés
 * (pas seulement super admin avec account_type === "root")
 */
export default function TokensLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, checkingAuth } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

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

    // ✅ TOUS les utilisateurs authentifiés peuvent accéder aux pages de tokens
    // Pas besoin d'être super admin (account_type === "root")
    setIsAuthorized(true);
    setIsChecking(false);
  }, [user, isAuthenticated, checkingAuth]);

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

  // If not authenticated, show not-found page (full screen, bypassing parent layout)
  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 z-[9999] bg-gray-50 dark:bg-gray-900">
        <NotFound />
      </div>
    );
  }

  // ✅ Si authentifié (même pas super admin), afficher la page
  // Ce layout override le SuperAdminLayout parent qui bloque les non-super-admins
  return <>{children}</>;
}
