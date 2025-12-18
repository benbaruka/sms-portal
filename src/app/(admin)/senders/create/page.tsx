"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Hash, Save, Plug, ShieldCheck, Info } from "lucide-react";
import { useAlert } from "@/context/AlertProvider";
import { useAuth } from "@/context/AuthProvider";
import { useCreateSenderIdRequest } from "@/controller/query/senders/useSenders";
import { useGetAllConnectors } from "@/controller/query/connectors/useConnectors";
import { isSuperAdmin as isSuperAdminUtil } from "@/utils/userUtils";

export default function CreateSenderPage() {
  const { showAlert } = useAlert();
  const { user } = useAuth();
  const router = useRouter();

  // Check if user is admin (super admin: account_type === "root" OR id === 1)
  const isAdmin = useMemo(() => {
    return isSuperAdminUtil(user?.message?.client);
  }, [user]);

  // Redirect clients to my-senders page
  useEffect(() => {
    if (user && !isAdmin) {
      router.replace("/senders?tab=my-senders");
      showAlert({
        variant: "error",
        title: "Access Denied",
        message: "Only administrators can create sender IDs.",
      });
    }
  }, [user, isAdmin, router, showAlert]);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    sender: "",
    description: "",
    useCase: "",
    connectorId: "",
  });

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  // Fetch all connectors using /connector/all endpoint
  const { data: connectorsData, isLoading: isLoadingConnectors } = useGetAllConnectors(
    { page: 1, limit: 100 },
    true
  );

  // Extract connectors from response
  const connectorOptions = useMemo(() => {
    if (!connectorsData?.message && !connectorsData?.data) return [];
    const list = connectorsData.message || connectorsData.data || [];
    return Array.isArray(list)
      ? list
          .map((connector: { id?: number; name?: string }) => ({
            id: connector.id || 0,
            name: connector.name || "",
          }))
          .filter((c: { id: number; name: string }) => c.id > 0 && c.name)
      : [];
  }, [connectorsData]);

  const createSenderIdMutation = useCreateSenderIdRequest();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiKey) {
      showAlert({
        variant: "error",
        title: "Missing API key",
        message: "Please authenticate again to submit a sender ID request.",
      });
      return;
    }
    if (!formData.connectorId) {
      showAlert({
        variant: "error",
        title: "Connector required",
        message: "Select the operator / connector that should host this sender ID.",
      });
      return;
    }

    try {
      await createSenderIdMutation.mutateAsync({
        data: {
          code: formData.sender.trim().toUpperCase(),
          connector_id: Number(formData.connectorId),
          description: formData.description.trim(),
          use_case: formData.useCase.trim() || undefined,
        },
        apiKey,
      });

      setFormData({
        sender: "",
        description: "",
        useCase: "",
        connectorId: "",
      });
    } catch (error: unknown) {
      // Alerts handled in mutation onError
    }
  };

  const isSubmitting = createSenderIdMutation.isPending;

  // Don't render the form if user is not admin
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:gap-3 sm:text-xl">
            <Plug className="h-4 w-4 text-brand-500 sm:h-5 sm:w-5" />
            Sender ID details
          </CardTitle>
          <CardDescription className="mt-1 text-sm text-gray-600 dark:text-gray-400 sm:mt-2">
            Complete the form with accurate information. Incomplete requests may be rejected.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <CardContent className="flex-1 space-y-6 p-4 pt-0 sm:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sender">Sender ID *</Label>
                <Input
                  id="sender"
                  value={formData.sender}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      sender: event.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="SMSAPP (max 11 characters)"
                  maxLength={11}
                  required
                  className="h-11 rounded-2xl border-2"
                />
                <p className="text-muted-foreground text-xs dark:text-gray-400">
                  Use alphanumeric characters only. Avoid spacing and special symbols.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="connector">Operator / Connector *</Label>
                <div className="relative">
                  <select
                    id="connector"
                    value={formData.connectorId}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        connectorId: event.target.value,
                      }))
                    }
                    disabled={isLoadingConnectors}
                    className="h-11 w-full rounded-2xl border-2 border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                    required
                  >
                    <option value="">Select an operator</option>
                    {connectorOptions.map((connector) => (
                      <option key={connector.id} value={connector.id}>
                        {connector.name}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-muted-foreground text-xs dark:text-gray-400">
                  Choose the SMS route that should host this sender ID.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="description">Business justification *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Describe how this sender ID will be used in your campaigns."
                  rows={5}
                  required
                  className="rounded-2xl border-2"
                />
                <p className="text-muted-foreground text-xs dark:text-gray-400">
                  Provide clear details to speed up compliance approval.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="useCase">Use case (optional)</Label>
                <Textarea
                  id="useCase"
                  value={formData.useCase}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      useCase: event.target.value,
                    }))
                  }
                  placeholder="Optional: add sample messages or campaign context"
                  rows={5}
                  className="rounded-2xl border-2"
                />
                <div className="text-muted-foreground flex items-start gap-2 text-xs dark:text-gray-400">
                  <Info className="mt-0.5 h-3.5 w-3.5 text-blue-500" />
                  Including sample SMS templates helps us validate regulatory compliance faster.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-blue-50 p-4 text-sm leading-relaxed text-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Compliance review</p>
                <p>
                  Sender IDs are activated once our compliance and MNO partners approve the request.
                  You will receive an email notification with the decision.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="mt-auto border-t border-gray-100 p-4 pt-0 dark:border-gray-800 sm:p-6">
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-muted-foreground text-xs dark:text-gray-400">
                Make sure the sender ID does not infringe on registered trademarks without
                authorization.
              </div>
              <div className="flex gap-3">
                <Link href="/senders?tab=my-senders">
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
                  disabled={
                    isSubmitting ||
                    !formData.sender ||
                    !formData.description ||
                    !formData.connectorId
                  }
                  className="h-10 rounded-xl px-6 shadow-md shadow-brand-500/15"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Submit request
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
