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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Hash, Save, Plug, ShieldCheck, Info, ArrowLeft } from "lucide-react";
import { useAlert } from "@/context/AlertProvider";
import { useAuth } from "@/context/AuthProvider";
import { useCreateSenderIdRequest } from "@/controller/query/senders/useSenders";
import { useGetAllConnectors } from "@/controller/query/connectors/useConnectors";

export default function AdminCreateSenderPage() {
  const { showAlert } = useAlert();
  const { user } = useAuth();
  const router = useRouter();
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
    if (!formData.sender.trim()) {
      showAlert({
        variant: "error",
        title: "Sender ID required",
        message: "Please enter a sender ID code.",
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

      // Redirect to senders list after successful creation
      router.push("/admin/senders");
    } catch (error: unknown) {
      // Alerts handled in mutation onError
    }
  };

  const isSubmitting = createSenderIdMutation.isPending;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="rounded-xl border border-brand-200/50 bg-gradient-to-r from-brand-500/10 via-blue-light-500/10 to-brand-500/10 p-6 shadow-sm dark:border-brand-800/50 md:p-8">
        <div className="mb-3 flex items-center gap-4">
          <Link href="/admin/senders">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Senders
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 p-3 shadow-md">
            <Hash className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white md:text-3xl">
              Create Sender ID
            </h1>
            <p className="text-muted-foreground mt-2 dark:text-gray-400">
              Request a new sender ID for SMS messaging
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="p-6">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
            <ShieldCheck className="h-5 w-5 text-blue-500" />
            Sender ID Request Form
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm dark:text-gray-400">
            Fill in the details below to request a new sender ID. All requests will be reviewed by
            the admin team.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 p-6">
            {/* Sender ID Code */}
            <div className="space-y-2">
              <Label htmlFor="sender" className="text-sm font-medium text-gray-900 dark:text-white">
                Sender ID Code *
              </Label>
              <Input
                id="sender"
                type="text"
                value={formData.sender}
                onChange={(e) => setFormData({ ...formData, sender: e.target.value.toUpperCase() })}
                placeholder="e.g., COMPANY"
                maxLength={11}
                required
                className="h-11 rounded-xl border-2"
                disabled={isSubmitting}
              />
              <p className="text-muted-foreground text-xs dark:text-gray-400">
                Maximum 11 characters. Only letters and numbers allowed.
              </p>
            </div>

            {/* Connector Selection */}
            <div className="space-y-2">
              <Label
                htmlFor="connector"
                className="text-sm font-medium text-gray-900 dark:text-white"
              >
                Operator / Connector *
              </Label>
              <Select
                value={formData.connectorId}
                onValueChange={(value) => setFormData({ ...formData, connectorId: value })}
              >
                <SelectTrigger
                  id="connector"
                  className="h-11 rounded-xl border-2"
                  disabled={isSubmitting || isLoadingConnectors}
                >
                  <SelectValue placeholder="Select a connector" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingConnectors ? (
                    <SelectItem value="loading" disabled>
                      Loading connectors...
                    </SelectItem>
                  ) : connectorOptions.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No connectors available
                    </SelectItem>
                  ) : (
                    connectorOptions.map((connector: { id: number; name: string }) => (
                      <SelectItem key={connector.id} value={String(connector.id)}>
                        {connector.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs dark:text-gray-400">
                Select the mobile network operator that will host this sender ID.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-sm font-medium text-gray-900 dark:text-white"
              >
                Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the purpose of this sender ID..."
                rows={4}
                required
                className="rounded-xl border-2"
                disabled={isSubmitting}
              />
              <p className="text-muted-foreground text-xs dark:text-gray-400">
                Explain how this sender ID will be used for your business communications.
              </p>
            </div>

            {/* Use Case */}
            <div className="space-y-2">
              <Label
                htmlFor="useCase"
                className="text-sm font-medium text-gray-900 dark:text-white"
              >
                Use Case (Optional)
              </Label>
              <Textarea
                id="useCase"
                value={formData.useCase}
                onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
                placeholder="e.g., Transactional notifications, Marketing campaigns..."
                rows={3}
                className="rounded-xl border-2"
                disabled={isSubmitting}
              />
              <p className="text-muted-foreground text-xs dark:text-gray-400">
                Optional: Provide additional context about the use case for this sender ID.
              </p>
            </div>

            {/* Info Alert */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Approval Process
                  </p>
                  <p className="text-muted-foreground text-xs dark:text-blue-200">
                    Your sender ID request will be reviewed by the admin team. You will be notified
                    once the request is approved or rejected. Approval typically takes 1-2 business
                    days.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-end gap-3 border-t border-gray-200 p-6 dark:border-gray-800">
            <Link href="/admin/senders">
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                isLoadingConnectors ||
                !formData.sender.trim() ||
                !formData.connectorId
              }
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Submit Request
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
