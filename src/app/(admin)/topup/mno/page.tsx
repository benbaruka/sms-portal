"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Smartphone,
  CreditCard,
  Wallet,
  DollarSign,
  Phone,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useGetMNOProviders, useMNOSelfTopup } from "@/controller/query/topup/useTopup";

type AllowedMNO = "AIRTEL" | "ORANGE" | "VODACOM" | "AFRICELL";

const createInitialFormState = (msisdn?: string) => ({
  mno_wallet_type: "" as AllowedMNO | "",
  msisdn: msisdn ?? "",
  amount: "",
  currency: "USD",
  narration: "",
});

export default function MNOTopupPage() {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [formData, setFormData] = useState(createInitialFormState());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  useEffect(() => {
    if (!formData.msisdn && user?.message?.user?.msisdn) {
      setFormData((prev) => ({ ...prev, msisdn: user.message.user.msisdn || "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.message?.user?.msisdn]);

  const { data: providersData, isLoading: isLoadingProviders } = useGetMNOProviders(
    apiKey,
    !!apiKey
  );
  const mnoSelfTopup = useMNOSelfTopup();

  const providers = useMemo(() => {
    if (!providersData?.message && !providersData?.data) return [];
    const list = providersData.message || providersData.data || [];
    return Array.isArray(list) ? list : [];
  }, [providersData]);

  const fallbackNetworks = [
    { code: "ORANGE", name: "Orange", description: "Orange RDC" },
    { code: "VODACOM", name: "Vodacom", description: "Vodacom RDC" },
    { code: "AIRTEL", name: "Airtel", description: "Airtel RDC" },
    { code: "AFRICELL", name: "Africell", description: "Africell RDC" },
  ];

  const availableNetworks = providers.length
    ? providers.map((p: { code?: string; id?: string; name?: string; description?: string }) => ({
        code: p.code || p.id || "",
        name: p.name || "",
        description: p.description || `${p.name || ""} RDC`,
      }))
    : fallbackNetworks;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!apiKey) {
      setErrorMessage("API key missing. Please sign in again.");
      return;
    }

    if (!formData.mno_wallet_type) {
      setErrorMessage("Please select a mobile operator.");
      return;
    }

    if (!formData.msisdn?.trim()) {
      setErrorMessage("Please enter a wallet phone number.");
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setErrorMessage("Please enter a valid amount (minimum 1 USD).");
      return;
    }

    try {
      await mnoSelfTopup.mutateAsync({
        data: {
          amount: parseFloat(formData.amount),
          msisdn: formData.msisdn.trim(),
          mno_wallet_type: formData.mno_wallet_type as AllowedMNO,
          currency: formData.currency,
          narration: formData.narration || `Self topup via ${formData.mno_wallet_type}`,
        },
        apiKey,
      });
      setFormData(createInitialFormState(user?.message?.user?.msisdn));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Échec de la soumission du topup.";
      setErrorMessage(message);
    }
  };

  const formatCurrency = (amount: number, currency: string = "USD") =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

  const selectedNetwork = availableNetworks.find(
    (network) => network.code === formData.mno_wallet_type
  );

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-sm text-red-600 dark:text-red-200">{errorMessage}</p>
        </div>
      )}

      <section className="grid gap-4 xl:grid-cols-4">
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <Wallet className="h-9 w-9 rounded-xl bg-brand-500/10 p-2 text-brand-600 dark:text-brand-400" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide dark:text-gray-400">
                Active networks
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {availableNetworks.length}
              </p>
              <p className="text-muted-foreground text-xs dark:text-gray-400">
                Configured MNO wallets
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <Phone className="h-9 w-9 rounded-xl bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide dark:text-gray-400">
                Wallet phone
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formData.msisdn || user?.message?.user?.msisdn || "--"}
              </p>
              <p className="text-muted-foreground text-xs dark:text-gray-400">
                Pre-filled from your profile
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <DollarSign className="h-9 w-9 rounded-xl bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide dark:text-gray-400">
                Draft amount
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formData.amount && parseFloat(formData.amount) > 0
                  ? formatCurrency(parseFloat(formData.amount))
                  : "--"}
              </p>
              <p className="text-muted-foreground text-xs dark:text-gray-400">
                Amount to be charged
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <ShieldCheck className="h-9 w-9 rounded-xl bg-green-500/10 p-2 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide dark:text-gray-400">
                Security
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">USSD approval</p>
              <p className="text-muted-foreground text-xs dark:text-gray-400">
                No top up without your confirmation
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.85fr_1fr]">
        <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:gap-3 sm:text-xl">
              <Smartphone className="h-4 w-4 text-brand-500 sm:h-5 sm:w-5" />
              Initiate Wallet Top Up
            </CardTitle>
            <CardDescription className="mt-1 text-sm text-gray-600 dark:text-gray-400 sm:mt-2">
              Enter the wallet details and amount. A mobile money prompt will appear on the
              registered phone once you submit.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit} className="flex flex-col">
            <CardContent className="flex-1 space-y-6 p-4 pt-0 sm:p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="mno_wallet_type">Mobile operator *</Label>
                  {isLoadingProviders ? (
                    <div className="flex h-11 items-center gap-2 rounded-2xl border-2 border-gray-300 bg-gray-50 px-4 dark:border-gray-700 dark:bg-gray-800">
                      <Loader2 className="h-4 w-4 animate-spin text-brand-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Loading operators...
                      </span>
                    </div>
                  ) : (
                    <Select
                      value={formData.mno_wallet_type}
                      onValueChange={(value) => {
                        setFormData({ ...formData, mno_wallet_type: value as AllowedMNO | "" });
                        setErrorMessage(null);
                      }}
                    >
                      <SelectTrigger id="mno_wallet_type" className="h-11 rounded-2xl border-2">
                        <SelectValue placeholder="Select operator" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableNetworks.map((network) => (
                          <SelectItem key={network.code} value={network.code}>
                            {network.name} — {network.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <p className="text-muted-foreground text-xs dark:text-gray-400">
                    Pick the wallet that will be charged.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="msisdn">Wallet phone number *</Label>
                  <Input
                    id="msisdn"
                    value={formData.msisdn}
                    onChange={(e) => {
                      setFormData({ ...formData, msisdn: e.target.value });
                      setErrorMessage(null);
                    }}
                    placeholder="e.g. +243900000000"
                    required
                    className="h-11 rounded-2xl border-2"
                  />
                  <p className="text-muted-foreground text-xs dark:text-gray-400">
                    This number will receive the mobile money confirmation prompt.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (USD) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="1"
                    value={formData.amount}
                    onChange={(e) => {
                      setFormData({ ...formData, amount: e.target.value });
                      setErrorMessage(null);
                    }}
                    placeholder="e.g. 250"
                    required
                    className="h-11 rounded-2xl border-2"
                  />
                  {formData.amount && parseFloat(formData.amount) > 0 && (
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      Amount to debit: {formatCurrency(parseFloat(formData.amount))}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="narration">Memo (optional)</Label>
                  <Input
                    id="narration"
                    value={formData.narration}
                    onChange={(e) => setFormData({ ...formData, narration: e.target.value })}
                    placeholder="Example: January campaign top up"
                    className="h-11 rounded-2xl border-2"
                  />
                  <p className="text-muted-foreground text-xs dark:text-gray-400">
                    This note will appear in your top up history.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="mt-auto border-t border-gray-100 p-4 pt-0 dark:border-gray-800 sm:p-6">
              <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-muted-foreground flex items-center gap-2 text-xs dark:text-gray-400">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Every top up is confirmed by your mobile money provider.
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormData(createInitialFormState(user?.message?.user?.msisdn))}
                    className="h-10 rounded-xl border-2"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Clear form
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      mnoSelfTopup.isPending ||
                      !formData.mno_wallet_type ||
                      !formData.msisdn ||
                      !formData.amount ||
                      !apiKey
                    }
                    className="h-10 rounded-xl bg-blue-600 px-6 text-white shadow-md shadow-brand-500/15 hover:bg-blue-700 disabled:bg-blue-400 disabled:text-white"
                  >
                    {mnoSelfTopup.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing top up...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Submit top up request
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardFooter>
          </form>
        </Card>
        <div className="space-y-6">
          <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <CardHeader className="p-4 pb-2 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
                <Wallet className="h-4 w-4 text-brand-500" />
                Network overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-2 sm:p-6">
              {selectedNetwork ? (
                <div className="space-y-2 rounded-2xl border border-brand-500/20 bg-brand-500/5 p-4 dark:bg-brand-500/10">
                  <p className="text-sm font-semibold text-brand-700 dark:text-brand-200">
                    {selectedNetwork.name}
                  </p>
                  <p className="text-xs text-brand-600/90 dark:text-brand-200/80">
                    {selectedNetwork.description}
                  </p>
                  <div className="text-muted-foreground text-[11px] uppercase tracking-wide dark:text-gray-400">
                    Wallet code: <span className="ml-1 font-medium">{selectedNetwork.code}</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 p-5 text-center dark:border-gray-700">
                  <p className="text-muted-foreground text-sm dark:text-gray-400">
                    Select an operator to view its information panel.
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide dark:text-gray-400">
                  Available operators
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableNetworks.map((network) => (
                    <Badge
                      key={network.code}
                      variant={network.code === formData.mno_wallet_type ? "default" : "outline"}
                      className="cursor-pointer rounded-xl px-3 py-1 text-xs transition"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          mno_wallet_type: network.code as AllowedMNO | "",
                        })
                      }
                    >
                      {network.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <CardHeader className="p-4 pb-2 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
                <ShieldCheck className="h-4 w-4 text-brand-500" />
                Best practices
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-3 p-4 pt-2 text-sm dark:text-gray-400 sm:p-6">
              <ol className="list-inside list-decimal space-y-2">
                <li>Choose the wallet that matches your operator.</li>
                <li>Double-check the phone number before submitting.</li>
                <li>Enter the amount in USD (minimum 1 USD).</li>
                <li>Approve the USSD / mobile money request on your phone.</li>
              </ol>
              <div className="rounded-xl bg-blue-50 p-3 text-xs leading-relaxed text-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
                Once confirmed, credits usually appear in your SMS balance within a few minutes.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-3xl border border-brand-500/20 bg-gradient-to-r from-brand-500/10 via-blue-500/10 to-brand-500/10 px-6 py-4 shadow-sm dark:border-brand-500/30 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 h-6 w-6 text-brand-600 dark:text-brand-300" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white sm:text-base">
              Need documentation or reports?
            </p>
            <p className="text-muted-foreground text-xs dark:text-gray-300 sm:text-sm">
              Access detailed statements and export options in the top up history page.
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
