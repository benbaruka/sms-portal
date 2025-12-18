"use client";

import { useRouter } from "next/navigation";
import { _login, _signup, forgotPassword, resetPassword } from "./auth.service";
import { setCookie } from "cookies-next";
import { useMutation } from "@tanstack/react-query";
import { saveAuthToken } from "../../hook/authToken";
import { useAuth } from "@/context/AuthProvider";
import { CredentialsAuthWithPwd, SignupData } from "@/types";
import { useAlert } from "@/context/AlertProvider";
import { isSuperAdmin as isSuperAdminUtil } from "@/utils/userUtils";
export const useLogin = () => {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { setIsAuthenticated, setUser } = useAuth();
  return useMutation({
    mutationFn: (credentials: CredentialsAuthWithPwd) => _login(credentials),
    retry: false, // Prevent automatic retries that could cause double requests
    onSuccess: (data) => {
      const token = data?.message?.token;
      const apiKey =
        (data && typeof data === "object" && "apiKey" in data
          ? (data as { apiKey?: string }).apiKey
          : undefined) || null;
      const hasDocuments = data?.message?.has_documents ?? 1;
      const userStatus = data?.message?.user?.status ?? 1;
      const clientData = data?.message?.client;
      // Super admin: account_type === "root" OR id === 1 (cohérent avec le backend)
      const isSuperAdmin = isSuperAdminUtil(clientData);
      saveAuthToken(token!);
      localStorage.setItem("user-session", JSON.stringify(data));
      if (apiKey) {
        localStorage.setItem("apiKey", apiKey);
      }
      localStorage.setItem("isSuperAdmin", JSON.stringify(isSuperAdmin));
      setIsAuthenticated(true);
      setUser(data!);
      setCookie("authToken", token, {
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
        sameSite: "lax",
      });
      localStorage.removeItem("documents_upload_skipped");

      // Check if user status is 0 (not verified) - redirect to OTP verification
      if (userStatus === 0) {
        // Store email/phone for OTP verification
        const email = data?.message?.user?.email;
        const msisdn = data?.message?.user?.msisdn;
        if (email) {
          localStorage.setItem("pending-verification-email", email);
        }
        if (msisdn) {
          localStorage.setItem("pending-verification-msisdn", msisdn);
        }
        router.push("/verify-otp");
        showAlert({
          variant: "warning",
          title: "Verification Required",
          message: "Please verify your account with the OTP code sent to your email or phone.",
        });
        return;
      }

      const redirectUrl =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("redirect")
          : null;
      if (hasDocuments === 0) {
        router.push("/upload-documents");
        showAlert({
          variant: "warning",
          title: "Documents Required",
          message: "Please upload your documents to continue using the platform.",
        });
      } else if (
        redirectUrl &&
        redirectUrl.startsWith("/") &&
        !redirectUrl.startsWith("/signin") &&
        !redirectUrl.startsWith("/signup")
      ) {
        router.push(redirectUrl);
        showAlert({
          variant: "success",
          title: "Success",
          message: "Logged in successfully.",
        });
      } else {
        router.push("/dashboard");
        showAlert({
          variant: "success",
          title: "Success",
          message: "Logged in successfully.",
        });
      }
    },
    onError: (error) => {
      // Vérifier si c'est l'erreur "account is not verified"
      const errorWithExtras = error as Error & {
        isAccountNotVerified?: boolean;
        credentials?: CredentialsAuthWithPwd;
      };
      const isAccountNotVerified = errorWithExtras?.isAccountNotVerified;
      const credentials = errorWithExtras?.credentials;

      if (isAccountNotVerified && credentials) {
        // Extraire email ou msisdn depuis les credentials
        const email = credentials.email;
        const msisdn = credentials.msisdn;

        // Stocker dans localStorage pour la page OTP
        if (email) {
          localStorage.setItem("pending-verification-email", email);
        }
        if (msisdn) {
          localStorage.setItem("pending-verification-msisdn", msisdn);
        }

        // Stocker un flag pour indiquer qu'on doit rediriger (localStorage et cookie)
        localStorage.setItem("needs-otp-verification", "true");
        // Définir aussi un cookie pour que le middleware puisse le détecter
        setCookie("needs-otp-verification", "true", {
          maxAge: 60 * 60, // 1 heure
          path: "/",
          sameSite: "lax",
        });

        // Afficher un message informatif
        showAlert({
          variant: "warning",
          title: "Account Verification Required",
          message:
            "Your account is not verified. Please verify your account with the OTP code sent to your email or phone number.",
        });

        // Rediriger vers la page OTP immédiatement
        // Utiliser router.replace pour éviter d'ajouter à l'historique
        router.replace("/verify-otp");
        return;
      }

      // Pour les autres erreurs, afficher le message d'erreur normal
      const errorMessage =
        error?.message || error?.toString() || "An error occurred during authentication.";
      showAlert({
        variant: "error",
        title: "Authentication Failed",
        message: errorMessage,
      });
    },
  });
};
export const useSignup = () => {
  const { showAlert } = useAlert();
  return useMutation({
    retry: false, // Prevent automatic retries that could cause double requests
    mutationFn: async (signupData: SignupData) => {
      // Only do signup, no automatic login
      const signupResult = await _signup(signupData);
      return signupResult;
    },
    onSuccess: (data) => {
      const message =
        typeof data?.message === "string"
          ? data.message
          : "Your account has been created successfully. Please verify your account with the OTP code sent to your email or phone.";
      showAlert({
        variant: "success",
        title: "Signup Successful",
        message,
      });
      return data;
    },
    onError: (error) => {
      const errorMessage =
        error?.message || error?.toString() || "An error occurred during signup.";
      showAlert({
        variant: "error",
        title: "Signup Failed",
        message: errorMessage,
      });
    },
  });
};
export const useForgotPassword = () => {
  const { showAlert } = useAlert();
  const router = useRouter();
  return useMutation({
    mutationFn: (email: string) => forgotPassword(email),
    onSuccess: () => {
      showAlert({
        variant: "success",
        title: "Email Sent",
        message: "A reset link has been sent to your email address.",
      });
      router.push("/forgot-password?sent=true");
    },
    onError: (error) => {
      const errorMessage =
        error?.message || error?.toString() || "An error occurred while requesting password reset.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};
export const useResetPassword = () => {
  const { showAlert } = useAlert();
  const router = useRouter();
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      resetPassword(token, newPassword),
    onSuccess: () => {
      showAlert({
        variant: "success",
        title: "Password Reset",
        message: "Your password has been reset successfully. You can now sign in.",
      });
      router.push("/signin");
    },
    onError: (error) => {
      const errorMessage =
        error?.message || error?.toString() || "An error occurred while resetting your password.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};
