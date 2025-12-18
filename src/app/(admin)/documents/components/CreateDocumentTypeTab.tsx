"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, FileText, Save, ArrowLeft } from "lucide-react";
import { useAlert } from "@/context/AlertProvider";
import { useCreateAdminDocumentType } from "@/controller/query/admin/documents/useAdminDocuments";

export default function CreateDocumentTypeTab() {
  const { showAlert } = useAlert();
  const router = useRouter();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    required: false,
    active: true,
  });

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const createTypeMutation = useCreateAdminDocumentType();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiKey) {
      showAlert({
        variant: "error",
        title: "Missing API key",
        message: "Please sign in again to create document types.",
      });
      return;
    }

    try {
      await createTypeMutation.mutateAsync({
        data: {
          name: formData.name.trim(),
          description: formData.description.trim(),
          required: formData.required,
          status: formData.active ? "ACTIVE" : "INACTIVE",
        },
        apiKey,
      });
      setFormData({
        name: "",
        description: "",
        required: false,
        active: true,
      });
      // Redirect to document types tab after creation
      setTimeout(() => {
        router.push("/documents?tab=document-types");
      }, 1000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create document type.";
      // alert handled by mutation
    }
  };

  const isSubmitting = createTypeMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
            Create Document Type
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Define the documents required during onboarding or KYB review
          </p>
        </div>
        <Button
          onClick={() => router.push("/documents?tab=document-types")}
          variant="outline"
          className="h-10 w-full rounded-xl border-2 sm:h-11 sm:w-auto"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to catalogue
        </Button>
      </div>
      <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:gap-3 sm:text-xl">
            <FileText className="h-4 w-4 text-brand-500 sm:h-5 sm:w-5" />
            Document type information
          </CardTitle>
          <CardDescription className="mt-1 text-sm text-gray-600 dark:text-gray-400 sm:mt-2">
            Provide a name and a clear description so other administrators understand when to
            request this document.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <CardContent className="flex-1 space-y-6 p-4 pt-0 sm:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Document name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Example: Passport, National ID, Business license"
                  required
                  className="h-11 rounded-2xl border-2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, description: event.target.value }))
                  }
                  placeholder="Explain why this document is required and what the reviewer should verify."
                  rows={4}
                  required
                  className="rounded-2xl border-2"
                />
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-900/40 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="required">Required document</Label>
                  <p className="text-muted-foreground text-sm">
                    Toggle on if clients must provide this document to pass KYB.
                  </p>
                </div>
                <Switch
                  id="required"
                  checked={formData.required}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, required: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="active">Active status</Label>
                  <p className="text-muted-foreground text-sm">
                    Disable to keep it hidden until the compliance team approves it.
                  </p>
                </div>
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, active: checked }))
                  }
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="mt-auto border-t border-gray-100 p-4 pt-0 dark:border-gray-800 sm:p-6">
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-muted-foreground text-xs">
                You can edit this document type later or deactivate it without losing history.
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => router.push("/documents?tab=document-types")}
                  className="h-10 rounded-xl border-2"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.name || !formData.description}
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
                      Create document type
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
