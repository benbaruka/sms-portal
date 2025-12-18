import { ResponseLog } from "@/types";
import { getCookie } from "cookies-next";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";
const PageLoader = dynamic(() => import("../global/loader/PageLoader"), {
  ssr: false,
});
type AuthContextType = {
  user: ResponseLog | null;
  isAuthenticated: boolean;
  checkingAuth: boolean;
  setIsAuthenticated: (value: boolean) => void;
  setUser: (user: ResponseLog | null) => void;
  logout: () => void;
  setShouldRedirect: React.Dispatch<React.SetStateAction<boolean>>;
};
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<ResponseLog | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const cookieToken = getCookie("authToken");
        const storedUser = localStorage.getItem("user-session");
        const publicPages = [
          "/signin",
          "/signup",
          "/forgot-password",
          "/verify-otp",
          "/terms",
          "/privacy",
          "/",
          "/upload-documents",
        ];
        const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
        const isPublicPage = publicPages.includes(currentPath);

        // Vérifier si on doit rediriger vers OTP (cas où le login a échoué avec account not verified)
        const needsOtpVerification =
          typeof window !== "undefined" &&
          localStorage.getItem("needs-otp-verification") === "true";
        if (needsOtpVerification && currentPath !== "/verify-otp") {
          const hasPendingVerification =
            typeof window !== "undefined" &&
            (localStorage.getItem("pending-verification-email") ||
              localStorage.getItem("pending-verification-msisdn"));
          if (hasPendingVerification) {
            router.push("/verify-otp");
            return;
          }
        }
        if (cookieToken && storedUser) {
          try {
            const parsedUser: ResponseLog = JSON.parse(storedUser);
            setUser(parsedUser);
            setIsAuthenticated(true);
            if (!isPublicPage) {
              // First check: Verify OTP status (status === 0 means not verified)
              const userStatus = parsedUser?.message?.user?.status ?? 1;
              const isOnVerifyOtpPage = currentPath === "/verify-otp";

              if (userStatus === 0 && !isOnVerifyOtpPage) {
                // Store email/phone for OTP verification
                const email = parsedUser?.message?.user?.email;
                const msisdn = parsedUser?.message?.user?.msisdn;
                if (email) {
                  localStorage.setItem("pending-verification-email", email);
                }
                if (msisdn) {
                  localStorage.setItem("pending-verification-msisdn", msisdn);
                }
                const lastRedirect = sessionStorage.getItem("last_otp_redirect");
                const now = Date.now();
                if (!lastRedirect || now - parseInt(lastRedirect) > 1000) {
                  sessionStorage.setItem("last_otp_redirect", now.toString());
                  router.push("/verify-otp");
                }
                return; // Don't check documents if OTP is not verified
              }

              // Check documents after OTP verification
              const hasDocuments = parsedUser?.message?.has_documents ?? 1;
              const skipped = localStorage.getItem("documents_upload_skipped");
              const isOnUploadPage = currentPath === "/upload-documents";

              if (hasDocuments === 0 && !skipped && !isOnUploadPage) {
                const lastRedirect = sessionStorage.getItem("last_document_redirect");
                const now = Date.now();
                if (!lastRedirect || now - parseInt(lastRedirect) > 1000) {
                  sessionStorage.setItem("last_document_redirect", now.toString());
                  router.push("/upload-documents");
                }
                return;
              }
            }
          } catch (error) {
            localStorage.removeItem("user-session");
            if (typeof document !== "undefined") {
              document.cookie = "authToken=; path=/; max-age=0";
            }
            setUser(null);
            setIsAuthenticated(false);
          }
        } else if (cookieToken && !storedUser) {
          if (typeof document !== "undefined") {
            document.cookie = "authToken=; path=/; max-age=0";
          }
          setUser(null);
          setIsAuthenticated(false);
        } else if (!cookieToken && storedUser) {
          localStorage.removeItem("user-session");
          localStorage.removeItem("authToken");
          setUser(null);
          setIsAuthenticated(false);
        } else {
          // Vérifier si on doit rediriger vers OTP (cas où le login a échoué avec account not verified)
          const needsOtpVerification =
            typeof window !== "undefined" &&
            localStorage.getItem("needs-otp-verification") === "true";
          const hasPendingVerification =
            typeof window !== "undefined" &&
            (localStorage.getItem("pending-verification-email") ||
              localStorage.getItem("pending-verification-msisdn"));

          // Si on a besoin de vérification OTP et qu'on n'est pas déjà sur la page OTP, rediriger
          if (needsOtpVerification && hasPendingVerification && currentPath !== "/verify-otp") {
            router.push("/verify-otp");
            setUser(null);
            setIsAuthenticated(false);
            setCheckingAuth(false);
            return;
          }

          // Si on est sur verify-otp avec des credentials en attente, permettre l'accès
          if (hasPendingVerification && currentPath === "/verify-otp") {
            // Ne pas mettre isAuthenticated à false pour permettre l'accès à la page OTP
            // Mais ne pas mettre à true non plus car l'utilisateur n'est pas vraiment authentifié
            setUser(null);
            setIsAuthenticated(false);
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, [router]);
  const logout = () => {
    try {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user-email");
      localStorage.removeItem("otp-timer");
      localStorage.removeItem("otp-sent");
      localStorage.removeItem("user-session");
      localStorage.removeItem("user");
      localStorage.removeItem("apiKey");
      localStorage.removeItem("isSuperAdmin");
      localStorage.removeItem("documents_upload_skipped");
      sessionStorage.removeItem("last_document_redirect");
      if (typeof document !== "undefined") {
        document.cookie = "authToken=; path=/; max-age=0; SameSite=Lax";
      }
      setUser(null);
      setIsAuthenticated(false);
      router.push("/signin");
    } catch (error) {
      router.push("/signin");
    }
  };
  useEffect(() => {
    if (!checkingAuth && shouldRedirect) {
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
      const publicPages = [
        "/signin",
        "/signup",
        "/forgot-password",
        "/verify-otp",
        "/terms",
        "/privacy",
        "/",
      ];
      const isPublicPage = publicPages.includes(currentPath);

      // Vérifier si on doit rediriger vers OTP (cas où le login a échoué avec account not verified)
      const needsOtpVerification =
        typeof window !== "undefined" && localStorage.getItem("needs-otp-verification") === "true";
      const hasPendingVerification =
        typeof window !== "undefined" &&
        (localStorage.getItem("pending-verification-email") ||
          localStorage.getItem("pending-verification-msisdn"));

      // Si on a besoin de vérification OTP, rediriger vers /verify-otp
      if (needsOtpVerification && hasPendingVerification && currentPath !== "/verify-otp") {
        router.push("/verify-otp");
        setShouldRedirect(false);
        return;
      }

      // Si on est sur verify-otp avec des credentials en attente, permettre l'accès même sans session
      if (currentPath === "/verify-otp" && hasPendingVerification) {
        // Ne pas rediriger, permettre l'accès à la page OTP
        setShouldRedirect(false);
        return;
      }

      if ((!user || !isAuthenticated) && !isPublicPage) {
        router.push("/signin");
      } else if (user && isAuthenticated && isPublicPage) {
        router.push("/dashboard");
      }
      setShouldRedirect(false);
    }
  }, [user, isAuthenticated, checkingAuth, shouldRedirect, router]);
  if (checkingAuth) {
    return (
      <div className="bg-primary flex h-[100vh] w-full items-center justify-center">
        <PageLoader />
      </div>
    );
  }
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        checkingAuth,
        logout,
        setIsAuthenticated,
        setUser,
        setShouldRedirect,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
};
