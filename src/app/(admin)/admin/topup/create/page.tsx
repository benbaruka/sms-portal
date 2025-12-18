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
import { Loader2, CreditCard, Save, ArrowLeft } from "lucide-react";
import { useAlert } from "@/context/AlertProvider";
import Link from "next/link";
import { useCreateManualTopup } from "@/controller/query/topup/useTopup";
import { useRouter } from "next/navigation";

export default function CreateTopupPage() {
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
      router.push("/admin/topup/requests");
    } catch {
      // Error is handled by the hook
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Create Top-up Request
          </h1>
          <p className="text-muted-foreground mt-1 dark:text-gray-400">
            Create a manual top-up request for a client
          </p>
        </div>
        <Link href="/admin/topup/requests">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Requests
          </Button>
        </Link>
      </div>

      <Card className="border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <CreditCard className="h-5 w-5 text-brand-500" />
            Top-up Information
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Enter the top-up details below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency *</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="KES">KES</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="connector_id">Connector ID *</Label>
                <Input
                  id="connector_id"
                  type="number"
                  min="1"
                  value={formData.connector_id}
                  onChange={(e) => setFormData({ ...formData, connector_id: e.target.value })}
                  placeholder="Enter connector ID"
                  required
                />
                <p className="text-muted-foreground text-xs">The connector ID for this top-up</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice_number">Invoice Number *</Label>
                <Input
                  id="invoice_number"
                  value={formData.invoice_number}
                  onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                  placeholder="e.g., INV-2024-001"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice_path">Invoice Path *</Label>
              <Input
                id="invoice_path"
                value={formData.invoice_path}
                onChange={(e) => setFormData({ ...formData, invoice_path: e.target.value })}
                placeholder="e.g., invoices/topup_20241104_001.pdf"
                required
              />
              <p className="text-muted-foreground text-xs">Path to the invoice file</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Manual top-up for client balance"
              />
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
              <Link href="/admin/topup/requests">
                <Button type="button" variant="outline" disabled={createManualTopup.isPending}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={createManualTopup.isPending || !apiKey}>
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
