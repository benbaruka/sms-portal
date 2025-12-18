"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  FileCheck,
} from "lucide-react";
import { useAlert } from "@/context/AlertProvider";
import { useClientKYBStatus } from "@/controller/query/client/tokens/useClientTokens";
import { format } from "date-fns";

type KYBStatus = "APPROVED" | "PENDING" | "REJECTED" | "LEGACY" | "UNKNOWN";

const normalizeKybStatus = (status: string | undefined): KYBStatus => {
  if (!status) return "UNKNOWN";
  const normalized = status.toString().toUpperCase();
  if (["APPROVED", "VALIDATED", "VERIFIED"].includes(normalized)) return "APPROVED";
  if (["PENDING", "IN_REVIEW", "REVIEWING"].includes(normalized)) return "PENDING";
  if (["REJECTED", "DECLINED", "FAILED"].includes(normalized)) return "REJECTED";
  if (["LEGACY"].includes(normalized)) return "LEGACY";
  return "UNKNOWN";
};

const kybBadge = (status: KYBStatus) => {
  switch (status) {
    case "APPROVED":
      return (
        <Badge variant="default" className="gap-1 bg-emerald-500 text-white">
          <CheckCircle2 className="h-3 w-3" />
          Approved
        </Badge>
      );
    case "PENDING":
      return (
        <Badge variant="secondary" className="gap-1 bg-amber-500 text-white">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>
      );
    case "LEGACY":
      return (
        <Badge variant="default" className="gap-1 bg-blue-500 text-white">
          <ShieldCheck className="h-3 w-3" />
          Legacy
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="gap-1">
          <ShieldAlert className="h-3 w-3" />
          Unknown
        </Badge>
      );
  }
};

const formatDate = (value?: string) => {
  if (!value) return "--";
  try {
    return format(new Date(value), "dd MMM yyyy, HH:mm");
  } catch {
    return value;
  }
};

export default function KYBStatusTab() {
  const { showAlert } = useAlert();
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const {
    data: kybStatusResponse,
    isLoading,
    isFetching,
    refetch,
  } = useClientKYBStatus(apiKey, !!apiKey);

  // Extraire les données depuis message (structure actuelle du backend)
  const kybData = useMemo(() => {
    if (!kybStatusResponse) return null;
    return (kybStatusResponse.message || kybStatusResponse.data || kybStatusResponse) as {
      can_generate_tokens?: boolean;
      client_id?: number | string;
      client_name?: string;
      created?: string;
      kyb_status?: string;
      live_tokens?: number;
      test_tokens?: number;
      verified_at?: string;
      updated_at?: string;
      [key: string]: unknown;
    };
  }, [kybStatusResponse]);

  const kybStatus = useMemo(() => {
    if (!kybData) return "UNKNOWN";
    const status = kybData.kyb_status || kybData.status;
    return status ? normalizeKybStatus(status.toString()) : "UNKNOWN";
  }, [kybData]);

  const canGenerateTokens = useMemo(() => {
    return kybData?.can_generate_tokens ?? false;
  }, [kybData]);

  const clientName = useMemo(() => {
    return kybData?.client_name || "—";
  }, [kybData]);

  const liveTokens = useMemo(() => {
    return kybData?.live_tokens ?? 0;
  }, [kybData]);

  const testTokens = useMemo(() => {
    return kybData?.test_tokens ?? 0;
  }, [kybData]);

  const createdDate = useMemo(() => {
    return kybData?.created || kybData?.verified_at || kybData?.updated_at;
  }, [kybData]);

  const isRefreshing = isFetching && !isLoading;

  const handleRefresh = async () => {
    try {
      await refetch();
      showAlert({
        variant: "success",
        title: "Status refreshed",
        message: "KYB status has been updated.",
      });
    } catch (error) {
      showAlert({
        variant: "error",
        title: "Refresh failed",
        message: error instanceof Error ? error.message : "Unable to refresh KYB status.",
      });
    }
  };

  return (
    <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
              <ShieldCheck className="h-5 w-5 text-brand-500" />
              KYB Status
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm dark:text-gray-400">
              Check your Know Your Business (KYB) verification status. Live tokens require approved
              KYB status.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            className="h-10 w-full rounded-xl border-2 sm:w-auto"
          >
            {isLoading || isRefreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-gray-600 dark:text-gray-300" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 sm:p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Loader2 className="h-10 w-10 animate-spin text-brand-500 dark:text-brand-400" />
            <p className="text-muted-foreground text-sm dark:text-gray-400">
              Loading KYB status...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase dark:text-gray-400">
                  KYB Status
                </p>
                <div className="flex items-center gap-3">
                  {kybStatus ? (
                    kybBadge(kybStatus)
                  ) : (
                    <Badge
                      variant="secondary"
                      className="gap-1 dark:bg-gray-700 dark:text-gray-200"
                    >
                      <ShieldAlert className="h-3 w-3" />
                      Unknown
                    </Badge>
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase dark:text-gray-400">
                  Client Name
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{clientName}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase dark:text-gray-400">
                  Live Tokens
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{liveTokens}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase dark:text-gray-400">
                  Test Tokens
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{testTokens}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase dark:text-gray-400">
                  Can Generate Tokens
                </p>
                <div className="flex items-center gap-2">
                  {canGenerateTokens ? (
                    <Badge variant="default" className="gap-1 bg-emerald-500 text-white">
                      <CheckCircle2 className="h-3 w-3" />
                      Yes
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="gap-1 dark:bg-gray-700 dark:text-gray-200"
                    >
                      <XCircle className="h-3 w-3" />
                      No
                    </Badge>
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase dark:text-gray-400">
                  Created
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {createdDate ? formatDate(createdDate.toString()) : "—"}
                </p>
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800/60 dark:bg-blue-950/30">
              <div className="flex items-start gap-3">
                <FileCheck className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                    KYB Verification
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    {kybStatus === "APPROVED" || kybStatus === "LEGACY"
                      ? canGenerateTokens
                        ? "Your business has been verified. You can create and use live tokens for production API access."
                        : "Your business is verified but you cannot generate new tokens at this time. Please contact support."
                      : kybStatus === "PENDING"
                        ? "Your KYB verification is currently under review. Once approved, you'll be able to create live tokens."
                        : kybStatus === "REJECTED"
                          ? "Your KYB verification was rejected. Please contact support or resubmit your documents."
                          : "Your KYB status is unknown. Please contact support for assistance."}
                  </p>
                </div>
              </div>
            </div>

            {(kybStatus === "APPROVED" || kybStatus === "LEGACY") && canGenerateTokens && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
                <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
                  ✓ You can now create live tokens and use them for production API access.
                </p>
              </div>
            )}

            {(kybStatus === "APPROVED" || kybStatus === "LEGACY") && !canGenerateTokens && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                  ⚠️ Your account is verified but you cannot generate new tokens. Please contact
                  support for assistance.
                </p>
              </div>
            )}

            {kybStatus === "PENDING" && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                  ⏳ Your verification is being reviewed. This process typically takes 1-3 business
                  days.
                </p>
              </div>
            )}

            {kybStatus === "REJECTED" && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
                <p className="text-sm font-medium text-red-900 dark:text-red-200">
                  ✗ Your verification was rejected. Please review your submitted documents and
                  contact support if you have questions.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
