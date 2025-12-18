"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Wallet,
  DollarSign,
  TrendingUp,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAlert } from "@/context/AlertProvider";
import Link from "next/link";
import { useDashboardSummary } from "@/controller/query/dashboard/useDashboard";

export default function BalancePage() {
  const { showAlert } = useAlert();
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const {
    data: summaryData,
    isLoading: isLoadingSummary,
    refetch: refetchSummary,
  } = useDashboardSummary({}, apiKey, !!apiKey);

  const metrics = useMemo(() => summaryData?.message ?? {}, [summaryData]);

  const balance = Number(metrics.balance ?? 0);
  const creditLimit = Number(metrics.credit_limit ?? 0);
  const bonus = Number(metrics.bonus ?? 0);
  const totalAvailable = balance + bonus;

  const handleRefresh = async () => {
    try {
      await refetchSummary();
      showAlert({
        variant: "success",
        title: "Balance updated",
        message: "Latest wallet and credit information synced successfully.",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to refresh account balance.";
      showAlert({
        variant: "error",
        title: "Refresh failed",
        message,
      });
    }
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-4">
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <Wallet className="h-9 w-9 rounded-xl bg-brand-500/10 p-2 text-brand-600 dark:text-brand-400" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide dark:text-gray-400">
                Available balance
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {isLoadingSummary
                  ? "--"
                  : balance.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </p>
              <p className="text-muted-foreground text-xs dark:text-gray-400">
                Funds ready to spend
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <TrendingUp className="h-9 w-9 rounded-xl bg-blue-500/10 p-2 text-blue-600 dark:text-blue-300" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide dark:text-gray-400">
                Credit limit
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {isLoadingSummary
                  ? "--"
                  : creditLimit.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </p>
              <p className="text-muted-foreground text-xs dark:text-gray-400">
                Maximum outstanding
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <Sparkles className="h-9 w-9 rounded-xl bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-300" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide dark:text-gray-400">
                Bonus credits
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {isLoadingSummary
                  ? "--"
                  : bonus.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </p>
              <p className="text-muted-foreground text-xs dark:text-gray-400">
                Promotional balance
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <DollarSign className="h-9 w-9 rounded-xl bg-purple-500/10 p-2 text-purple-600 dark:text-purple-300" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide dark:text-gray-400">
                Total available
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {isLoadingSummary
                  ? "--"
                  : totalAvailable.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </p>
              <p className="text-muted-foreground text-xs dark:text-gray-400">Balance + bonus</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:border-gray-900">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
              <DollarSign className="h-4 w-4 text-brand-500 sm:h-5 sm:w-5" />
              Balance breakdown
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm dark:text-gray-400">
              Detailed view of your wallet limits, bonus pool and outstanding exposure.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/40">
                <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide dark:text-gray-400">
                  Available balance
                </p>
                <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                  {isLoadingSummary
                    ? "--"
                    : balance.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                </p>
                <p className="text-muted-foreground mt-2 text-xs dark:text-gray-400">
                  Funds ready to be used immediately for SMS traffic.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/40">
                <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide dark:text-gray-400">
                  Credit exposure
                </p>
                <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                  {isLoadingSummary
                    ? "--"
                    : (creditLimit - balance).toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })}
                </p>
                <p className="text-muted-foreground mt-2 text-xs dark:text-gray-400">
                  Remaining headroom before reaching your credit limit.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/40">
                <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide dark:text-gray-400">
                  Bonus credits
                </p>
                <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                  {isLoadingSummary
                    ? "--"
                    : bonus.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                </p>
                <p className="text-muted-foreground mt-2 text-xs dark:text-gray-400">
                  Non-billable credits automatically consumed after cash balance.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/40">
                <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide dark:text-gray-400">
                  Total available funds
                </p>
                <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                  {isLoadingSummary
                    ? "--"
                    : totalAvailable.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })}
                </p>
                <p className="text-muted-foreground mt-2 text-xs dark:text-gray-400">
                  Combination of cash balance and bonus pool ready to spend.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
          <CardHeader className="p-4 pb-2 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
              <ShieldCheck className="h-4 w-4 text-brand-500" />
              Quick actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-2 sm:p-6">
            <div className="grid gap-3">
              <Link href="/topup?tab=mno">
                <Button className="w-full rounded-xl border-2" variant="outline">
                  <Wallet className="mr-2 h-4 w-4" />
                  Top up via mobile wallet
                </Button>
              </Link>
              <Link href="/topup?tab=history">
                <Button className="w-full rounded-xl border-2" variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Review top up history
                </Button>
              </Link>
              <Button
                className="w-full rounded-xl border-2"
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoadingSummary}
              >
                {isLoadingSummary ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh balance
                  </>
                )}
              </Button>
            </div>
            <div className="space-y-1 rounded-2xl border border-brand-500/20 bg-brand-500/5 p-4 dark:bg-brand-500/10">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-200">
                Pro tip
              </p>
              <p className="text-sm leading-relaxed text-brand-700/80 dark:text-brand-100">
                Schedule recurring top ups from the history page to maintain a minimum balance
                automatically.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-3 rounded-3xl border border-brand-500/20 bg-gradient-to-r from-brand-500/10 via-blue-500/10 to-brand-500/10 px-6 py-4 shadow-sm dark:border-brand-500/30 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 h-6 w-6 text-brand-600 dark:text-brand-300" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white sm:text-base">
              Need documentation or reports?
            </p>
            <p className="text-muted-foreground text-xs dark:text-gray-300 sm:text-sm">
              Access downloadable statements and detailed metrics in the top up history section.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Link href="/topup?tab=history">
            <Button variant="default" className="rounded-xl px-4 sm:px-6">
              Go to history
            </Button>
          </Link>
          <Button variant="ghost" className="rounded-xl px-4 sm:px-6">
            Download user guide
          </Button>
        </div>
      </section>
    </div>
  );
}
