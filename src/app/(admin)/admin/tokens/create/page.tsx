"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
import { Loader2, Key, Save, ArrowLeft, Info, ShieldCheck, ShieldOff } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useAlert } from "@/context/AlertProvider";
import {
  useAdminTokenClients,
  useCreateAdminToken,
} from "@/controller/query/admin/tokens/useAdminTokens";
import type { AdminClient } from "@/types";

export default function CreateTokenPage() {
  const { showAlert } = useAlert();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [formData, setFormData] = useState({
    client_id: "",
    token_type: "LIVE",
    label: "",
    ip_whitelist: "",
  });

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const { data: clientsData, isLoading: isLoadingClients } = useAdminTokenClients(apiKey, !!apiKey);

  const createTokenMutation = useCreateAdminToken();

  const clientOptions = useMemo((): AdminClient[] => {
    if (!clientsData) return [];
    if (Array.isArray(clientsData)) {
      return clientsData;
    }
    const data = clientsData as any; // Type assertion to handle various response formats
    const raw =
      data.clients || data.data?.clients || data.data || data.message?.clients || data.message;
    return Array.isArray(raw) ? raw : [];
  }, [clientsData]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiKey) {
      showAlert({
        variant: "error",
        title: "Missing API key",
        message: "Please sign in again to create live tokens.",
      });
      return;
    }

    try {
      await createTokenMutation.mutateAsync({
        data: {
          client_id: formData.client_id,
          token_type: formData.token_type,
          label: formData.label.trim() || undefined,
        },
        apiKey,
      });
      setFormData({
        client_id: "",
        token_type: "LIVE",
        label: "",
        ip_whitelist: "",
      });
      setNotes("");
    } catch {
      // Alert handled in mutation
    }
  };

  const isSubmitting = createTokenMutation.isPending;

  return (
    <div className="space-y-8 px-4 py-4 sm:space-y-10 sm:px-6 sm:py-6">
      <header className="rounded-3xl border border-gray-200 bg-white shadow-xl shadow-brand-500/10 dark:border-gray-900 dark:bg-gray-950">
        <div className="flex flex-col gap-6 px-6 py-6 sm:px-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 p-3 shadow-lg shadow-brand-500/40 sm:p-4">
              <Key className="h-6 w-6 text-white sm:h-8 sm:w-8" />
            </div>
            <div>
              <h1 className="text-[28px] font-semibold tracking-tight text-gray-900 dark:text-white sm:text-[32px]">
                Create a live API token
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed dark:text-gray-300 sm:text-base">
                Issue a production credential for a verified client. Ensure KYB requirements are
                validated before provisioning full access.
              </p>
            </div>
          </div>
          <Link href="/admin/tokens/all" className="w-full sm:w-auto">
            <Button variant="outline" className="h-10 w-full rounded-xl border-2 sm:h-11 sm:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to tokens
            </Button>
          </Link>
        </div>
      </header>

      <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:gap-3 sm:text-xl">
            <ShieldCheck className="h-4 w-4 text-brand-500 sm:h-5 sm:w-5" />
            Token parameters
          </CardTitle>
          <CardDescription className="mt-1 text-sm text-gray-600 dark:text-gray-400 sm:mt-2">
            Select the client tenant and confirm the environment. A notification will be sent once
            the token is activated.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <CardContent className="flex-1 space-y-6 p-4 pt-0 sm:p-6">
            <div className="space-y-2">
              <Label htmlFor="client_id">Client *</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, client_id: value }))}
              >
                <SelectTrigger className="h-11 rounded-2xl border-2" disabled={isLoadingClients}>
                  <SelectValue
                    placeholder={isLoadingClients ? "Loading clients..." : "Select a client"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {clientOptions.length === 0 ? (
                    <SelectItem value="" disabled>
                      {isLoadingClients ? "Loading clients..." : "No clients available"}
                    </SelectItem>
                  ) : (
                    clientOptions.map((client: AdminClient) => {
                      const clientId = client.id ?? client.client_id ?? client.name;
                      const clientName = client.name || client.client_name || `Client ${clientId}`;
                      return (
                        <SelectItem key={String(clientId ?? "")} value={String(clientId ?? "")}>
                          {clientName}
                        </SelectItem>
                      );
                    })
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="token_type">Environment *</Label>
                <Select
                  value={formData.token_type}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, token_type: value }))}
                >
                  <SelectTrigger className="h-11 rounded-2xl border-2">
                    <SelectValue placeholder="Choose environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LIVE">Live</SelectItem>
                    <SelectItem value="TEST">Test</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="label">Label (optionnel)</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, label: event.target.value }))
                  }
                  placeholder="Example: Production webhook integration"
                  className="h-11 rounded-2xl border-2"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Internal notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Add context for the support team: use case, IP restrictions, expiry date..."
                rows={4}
                className="rounded-2xl border-2"
              />
              <div className="text-muted-foreground flex items-start gap-2 text-xs">
                <Info className="mt-0.5 h-4 w-4 text-blue-500" />
                These notes are not sent through the API; they only serve as an internal log for
                your team.
              </div>
            </div>

            <div className="space-y-2 rounded-2xl border border-blue-100 bg-blue-50/80 p-4 text-sm text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/20 dark:text-blue-200">
              <p className="flex items-center gap-2 font-semibold">
                <ShieldOff className="h-4 w-4" />
                Security reminder
              </p>
              <ul className="list-inside list-disc space-y-1">
                <li>Live tokens grant full access to SMS Portail APIs.</li>
                <li>Issue them only for clients with a validated KYB profile.</li>
                <li>Revoke unused or compromised tokens immediately.</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="mt-auto border-t border-gray-100 p-4 pt-0 dark:border-gray-800 sm:p-6">
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-muted-foreground text-xs">
                Une notification automatique est envoyée au client avec les instructions de
                connexion.
              </div>
              <div className="flex gap-3">
                <Link href="/admin/tokens/all">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    className="h-10 rounded-xl border-2"
                  >
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.client_id || !formData.token_type}
                  className="h-10 rounded-xl px-6 shadow-md shadow-brand-500/15"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create token
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
