"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAlert } from "@/context/AlertProvider";
import { useCreateClientLiveToken } from "@/controller/query/client/tokens/useClientTokens";
import { CheckCircle2, Copy, Loader2, Save, ShieldCheck } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

import { getToken } from "@/controller/hook/useGetToken";
import { useClientKYBStatus } from "@/controller/query/client/tokens/useClientTokens";
import { getCookie } from "cookies-next";

export default function CreateLiveTokenTab() {
  const { showAlert } = useAlert();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
  });
  const [createdToken, setCreatedToken] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer l'API key
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }

    // Récupérer le token Bearer comme fallback
    const cookieToken = getCookie("authToken");
    const storedAuthToken =
      typeof cookieToken === "string" ? cookieToken : localStorage.getItem("authToken");
    if (storedAuthToken) {
      setAuthToken(storedAuthToken);
    } else {
      const token = getToken();
      if (token) {
        setAuthToken(token);
      }
    }
  }, []);

  // Vérifier le statut KYB avant de permettre la création
  const { data: kybStatusData, isLoading: isLoadingKYB } = useClientKYBStatus(apiKey, !!apiKey);

  // Extraire les données KYB depuis message (structure actuelle du backend)
  const kybData = useMemo(() => {
    if (!kybStatusData) return null;
    return (kybStatusData.message || kybStatusData.data || kybStatusData) as {
      can_generate_tokens?: boolean;
      kyb_status?: string;
      client_name?: string;
      live_tokens?: number;
      test_tokens?: number;
      [key: string]: unknown;
    };
  }, [kybStatusData]);

  // Extraire le statut KYB
  const kybStatus = kybData?.kyb_status || kybStatusData?.kyb_status || kybStatusData?.status;
  const canGenerateTokens = kybData?.can_generate_tokens ?? false;

  // Si can_generate_tokens est true, on permet la création même avec LEGACY
  // Le backend peut avoir une logique spéciale pour LEGACY si can_generate_tokens est true
  const isKYBApproved =
    canGenerateTokens ||
    kybStatus === "APPROVED" ||
    kybStatus === "approved" ||
    kybStatus === "VALIDATED" ||
    kybStatus === "validated" ||
    kybStatus === "LEGACY" ||
    kybStatus === "legacy";

  // LEGACY avec can_generate_tokens = true devrait permettre la création
  const isLegacyStatus = kybStatus === "LEGACY" || kybStatus === "legacy";

  const createTokenMutation = useCreateClientLiveToken();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Prévenir les doubles soumissions
    if (isSubmitting) {
      return;
    }

    if (!apiKey) {
      showAlert({
        variant: "error",
        title: "Missing API key",
        message: "Please sign in again to create live tokens.",
      });
      return;
    }

    // Vérifier si l'utilisateur peut générer des tokens
    // Si can_generate_tokens est false, on bloque même si le statut est APPROVED
    if (!canGenerateTokens && !isLoadingKYB) {
      showAlert({
        variant: "error",
        title: "Cannot Generate Tokens",
        message:
          "You cannot generate new tokens at this time. Please contact support for assistance.",
      });
      return;
    }

    try {
      const response = await createTokenMutation.mutateAsync({
        data: {
          name: formData.name.trim() || "LIVE API Token", // name is required by backend
        },
        apiKey: apiKey,
        authToken: authToken || undefined,
      });

      // Extract token from response - backend returns token_value in the response
      // Backend structure: { status: 201, message: { token_id, token_name, token_value, token_type, ... } }
      // or direct: { token_id, token_name, token_value, token_type, ... }
      const token =
        // Check direct response token_value
        (response && typeof response === "object" && "token_value" in response
          ? (response as { token_value?: string }).token_value
          : undefined) ||
        // Check message.token_value (most common structure)
        (typeof response?.message === "object" &&
        response.message !== null &&
        "token_value" in response.message
          ? (response.message as { token_value?: string }).token_value
          : undefined) ||
        // Check message.token (fallback)
        (typeof response?.message === "object" &&
        response.message !== null &&
        "token" in response.message
          ? (response.message as { token?: string }).token
          : undefined) ||
        // Check data.token_value
        (typeof response?.data === "object" &&
        response.data !== null &&
        "token_value" in response.data
          ? (response.data as { token_value?: string }).token_value
          : undefined) ||
        // Check data.token (fallback)
        (typeof response?.data === "object" && response.data !== null && "token" in response.data
          ? (response.data as { token?: string }).token
          : undefined) ||
        // Check direct response.token (fallback)
        response?.token ||
        undefined;
      if (token && typeof token === "string") {
        setCreatedToken(token);
      }

      setFormData({
        name: "",
      });
    } catch {
      // Alert handled in mutation
    }
  };

  const handleCopyToken = () => {
    if (!createdToken) return;
    navigator.clipboard.writeText(createdToken);
    showAlert({
      variant: "success",
      title: "Copied",
      message: "Token copied to clipboard.",
    });
  };

  const isSubmitting = createTokenMutation.isPending;

  return (
    <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:gap-3 sm:text-xl">
          <ShieldCheck className="h-4 w-4 text-brand-500 sm:h-5 sm:w-5" />
          Create Live Token
        </CardTitle>
        <CardDescription className="mt-1 text-sm text-gray-600 dark:text-gray-400 sm:mt-2">
          Generate a new live API token for production use. Make sure to copy and store it securely.
        </CardDescription>
      </CardHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          // Prévenir les doubles soumissions
          if (isSubmitting) return;
          handleSubmit(e);
        }}
        className="flex flex-col"
      >
        <CardContent className="flex-1 space-y-6 p-4 pt-0 text-gray-600 dark:text-gray-400 sm:p-6">
          {/* Afficher le statut KYB */}
          {!isLoadingKYB && apiKey && kybData && (
            <div
              className={`space-y-2 rounded-2xl border p-4 ${
                isKYBApproved
                  ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
                  : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30"
              }`}
            >
              <div
                className={`flex items-center gap-2 ${
                  isKYBApproved
                    ? "text-emerald-900 dark:text-emerald-200"
                    : "text-amber-900 dark:text-amber-200"
                }`}
              >
                <ShieldCheck className="h-5 w-5" />
                <p className="font-semibold">KYB Status: {kybStatus || "Unknown"}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Client: </span>
                  <span className="font-medium">{kybData.client_name || "—"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Can Generate: </span>
                  <span className="font-medium">{canGenerateTokens ? "Yes" : "No"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Live Tokens: </span>
                  <span className="font-medium">{kybData.live_tokens ?? 0}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Test Tokens: </span>
                  <span className="font-medium">{kybData.test_tokens ?? 0}</span>
                </div>
              </div>
              {!canGenerateTokens && (
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  ⚠️ You cannot generate new tokens at this time. Please contact support.
                </p>
              )}
              {canGenerateTokens && isLegacyStatus && (
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  ℹ️ Your account has LEGACY status. You can create tokens, but please contact
                  support to update your verification status to APPROVED for better access.
                </p>
              )}
            </div>
          )}

          {createdToken && (
            <div className="space-y-4 rounded-2xl border-2 border-emerald-400 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-6 shadow-lg dark:border-emerald-500 dark:from-emerald-950/40 dark:to-emerald-900/30">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-emerald-500 p-2 shadow-md">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                      Token Created Successfully!
                    </p>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">
                      Your API token has been generated. Copy it now before continuing.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                    Your API Token:
                  </Label>
                  <Button
                    type="button"
                    onClick={handleCopyToken}
                    className="h-9 rounded-xl bg-emerald-600 px-4 text-white shadow-md hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Token
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                    <Key className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <Input
                    value={createdToken}
                    readOnly
                    className="font-mono h-14 border-2 border-emerald-300 bg-white pl-12 text-sm font-medium text-gray-900 shadow-inner dark:border-emerald-700 dark:bg-gray-900 dark:text-gray-100"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleCopyToken}
                      className="h-10 w-10 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                      title="Copy token"
                    >
                      <Copy className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </Button>
                  </div>
                </div>

                <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-amber-500 p-1">
                      <svg
                        className="h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                        Important: Save This Token Now
                      </p>
                      <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">
                        This is the only time you&apos;ll be able to see this token. Make sure to
                        copy it to a secure location. You won&apos;t be able to retrieve it again
                        for security reasons.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Token Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Example: Production webhook integration"
              required
              className="h-11 rounded-2xl border-2"
            />
            <p className="text-muted-foreground text-xs">
              A descriptive name to help identify this token later. This field is required.
            </p>
          </div>

          <div className="space-y-2 rounded-2xl border border-blue-100 bg-blue-50/80 p-4 text-sm text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/20 dark:text-blue-200">
            <p className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="h-4 w-4" />
              Security reminder
            </p>
            <ul className="list-inside list-disc space-y-1">
              <li>Live tokens grant full access to SMS Portail APIs.</li>
              <li>Store tokens securely and never commit them to version control.</li>
              <li>Revoke unused or compromised tokens immediately.</li>
            </ul>
          </div>
        </CardContent>
        <div className="border-t border-gray-100 p-4 pt-0 dark:border-gray-800 sm:p-6">
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              !formData.name.trim() ||
              !apiKey ||
              (!canGenerateTokens && !isLoadingKYB)
            }
            className="h-10 w-full rounded-xl bg-brand-500 px-6 text-white shadow-md shadow-brand-500/15 hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-gray-600 dark:text-gray-300" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Live Token
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
