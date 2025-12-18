"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  CreditCard,
  Save,
  FileText,
  DollarSign,
  Hash,
  Link as LinkIcon,
} from "lucide-react";
import { useAlert } from "@/context/AlertProvider";
import { useCreateManualTopup, useGetAvailableConnectors } from "@/controller/query/topup/useTopup";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

export default function CreateTopupTab() {
  const { showAlert } = useAlert();
  const router = useRouter();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const createManualTopup = useCreateManualTopup();
  const [formData, setFormData] = useState({
    amount: "",
    currency: "USD",
    connector_id: "",
    invoice_path: "",
    invoice_number: "",
    description: "",
  });

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const {
    data: connectorsData,
    isLoading: isLoadingConnectors,
    error: connectorsError,
  } = useGetAvailableConnectors(apiKey, !!apiKey);

  const connectors = useMemo(() => {
    if (!connectorsData) return [];

    // Debug: log the structure

    // Backend returns: { success: true, message: "Connectors retrieved successfully", connectors: [...] }
    // The connectors are at the root level of the response
    const response = connectorsData as { connectors?: unknown[]; [key: string]: unknown };

    // Try to get connectors from root level
    if (Array.isArray(response.connectors)) {
      return response.connectors;
    }

    // Fallback: check if data is directly an array
    if (Array.isArray(connectorsData)) {
      return connectorsData;
    }

    // Additional fallback: check common response structures
    const data = (response as { data?: { connectors?: unknown[] } })?.data;
    if (data && Array.isArray(data.connectors)) {
      return data.connectors;
    }

    return [];
  }, [connectorsData]);

  // Debug log in development
  useEffect(() => {}, [connectorsData, connectors, isLoadingConnectors, connectorsError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!apiKey) {
      showAlert({
        variant: "error",
        title: "Error",
        message: "API key is required",
      });
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      showAlert({
        variant: "error",
        title: "Error",
        message: "Please enter a valid amount",
      });
      return;
    }

    if (!formData.connector_id || parseInt(formData.connector_id) <= 0) {
      showAlert({
        variant: "error",
        title: "Error",
        message: "Please enter a valid connector ID",
      });
      return;
    }

    if (!formData.invoice_path || formData.invoice_path.trim() === "") {
      showAlert({
        variant: "error",
        title: "Error",
        message: "Please enter an invoice path",
      });
      return;
    }

    if (!formData.invoice_number || formData.invoice_number.trim() === "") {
      showAlert({
        variant: "error",
        title: "Error",
        message: "Please enter an invoice number",
      });
      return;
    }

    try {
      await createManualTopup.mutateAsync({
        data: {
          amount: parseFloat(formData.amount),
          currency: formData.currency,
          connector_id: parseInt(formData.connector_id),
          invoice_path: formData.invoice_path.trim(),
          invoice_number: formData.invoice_number.trim(),
          description: formData.description.trim() || undefined,
        },
        apiKey,
      });
      setFormData({
        amount: "",
        currency: "USD",
        connector_id: "",
        invoice_path: "",
        invoice_number: "",
        description: "",
      });
      showAlert({
        variant: "success",
        title: "Success",
        message: "Top-up request created successfully!",
      });
      // Switch to requests tab after successful creation
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("tab", "requests");
        window.history.pushState({}, "", url.toString());
        window.location.reload();
      }
    } catch {
      // Error is handled by the hook
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="p-4 pb-2 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
            <CreditCard className="h-5 w-5 text-blue-500" />
            Create Top-up Request
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Enter the top-up details below to create a new manual top-up request
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-500" />
                  Amount *
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Enter amount"
                  className="h-11 rounded-xl border-2"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency *</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger className="h-11 rounded-xl border-2">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="connector_id">Connector *</Label>
                {isLoadingConnectors ? (
                  <div className="flex h-11 items-center gap-2 rounded-xl border-2 border-gray-200 px-3 dark:border-gray-800">
                    <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
                    <span className="text-muted-foreground text-sm">Loading connectors...</span>
                  </div>
                ) : connectors.length > 0 && !connectorsError ? (
                  <div className="space-y-2">
                    <Select
                      value={formData.connector_id}
                      onValueChange={(value) => setFormData({ ...formData, connector_id: value })}
                    >
                      <SelectTrigger className="h-11 rounded-xl border-2">
                        <SelectValue placeholder="Select a connector" />
                      </SelectTrigger>
                      <SelectContent>
                        {connectors.map(
                          (connector: { id: number; name: string; [key: string]: unknown }) => (
                            <SelectItem key={connector.id} value={String(connector.id)}>
                              {connector.name || `Connector ${connector.id}`}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
                      <span className="text-muted-foreground px-2 text-xs">or</span>
                      <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                    <Input
                      id="connector_id_manual"
                      type="number"
                      min="1"
                      value={formData.connector_id}
                      onChange={(e) => setFormData({ ...formData, connector_id: e.target.value })}
                      placeholder="Or enter connector ID manually"
                      className="h-11 rounded-xl border-2"
                    />
                  </div>
                ) : (
                  <Input
                    id="connector_id"
                    type="number"
                    min="1"
                    value={formData.connector_id}
                    onChange={(e) => setFormData({ ...formData, connector_id: e.target.value })}
                    placeholder="Enter connector ID"
                    className="h-11 rounded-xl border-2"
                    required
                  />
                )}
                <p className="text-muted-foreground text-xs">
                  {connectors.length > 0 && !connectorsError
                    ? "Select from the list or enter connector ID manually"
                    : connectorsError
                      ? "Unable to load connectors. Please enter connector ID manually."
                      : "Enter the connector ID for this top-up"}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice_number" className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-blue-500" />
                  Invoice Number *
                </Label>
                <Input
                  id="invoice_number"
                  value={formData.invoice_number}
                  onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                  placeholder="e.g., INV-2024-001"
                  className="h-11 rounded-xl border-2"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice_path" className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-blue-500" />
                Invoice Path *
              </Label>
              <Input
                id="invoice_path"
                value={formData.invoice_path}
                onChange={(e) => setFormData({ ...formData, invoice_path: e.target.value })}
                placeholder="e.g., invoices/topup_20241104_001.pdf"
                className="h-11 rounded-xl border-2"
                required
              />
              <p className="text-muted-foreground text-xs">Path to the invoice file (S3 path)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Manual top-up for client balance"
                className="min-h-[100px] rounded-xl border-2"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-end gap-4 border-t border-gray-200 pt-4 dark:border-gray-800">
              <Button
                type="submit"
                disabled={createManualTopup.isPending || !apiKey}
                className="h-11 rounded-xl bg-blue-600 px-6 text-white shadow-md shadow-blue-500/15 hover:bg-blue-700"
              >
                {createManualTopup.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Top-up Request
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
