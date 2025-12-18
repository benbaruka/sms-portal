"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Search,
  ShieldCheck,
  ShieldAlert,
  FileCheck,
} from "lucide-react";
import { useAlert } from "@/context/AlertProvider";
import { useAdminKYBDetails, useApproveAdminKYB } from "@/controller/query/admin/kyb/useAdminKYB";
import { AdminKYBRecord } from "@/types";
import { format } from "date-fns";

export default function ApproveKYBPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryKybId = searchParams.get("id");
  const { showAlert } = useAlert();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [searchId, setSearchId] = useState(queryKybId || "");
  const [selectedId, setSelectedId] = useState<string | null>(queryKybId);
  const [notes, setNotes] = useState("Working papers verified. No outstanding issues.");

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const {
    data: kybDetailsResponse,
    isLoading,
    isFetching,
    refetch,
  } = useAdminKYBDetails(
    selectedId ? { kyb_id: selectedId } : null,
    apiKey,
    !!apiKey && !!selectedId
  );

  const approveMutation = useApproveAdminKYB();

  const kybDetails = useMemo<AdminKYBRecord | null>(() => {
    if (!kybDetailsResponse) return null;
    return (
      (kybDetailsResponse.message as AdminKYBRecord | undefined) ||
      (kybDetailsResponse.data as AdminKYBRecord | undefined) ||
      null
    );
  }, [kybDetailsResponse]);

  useEffect(() => {
    if (!kybDetails) return;
    setNotes((prev) => prev || kybDetails.notes || "");
  }, [kybDetails]);

  const isDetailsLoading = (isLoading || isFetching) && !!selectedId;

  const handleSearch = () => {
    if (!searchId.trim()) {
      showAlert({
        variant: "error",
        title: "Missing KYB ID",
        message: "Enter a KYB identifier before searching.",
      });
      return;
    }
    setSelectedId(searchId.trim());
  };

  const handleApprove = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!apiKey) {
      showAlert({
        variant: "error",
        title: "Missing API key",
        message: "Please sign in again to approve KYB requests.",
      });
      return;
    }
    if (!selectedId) {
      showAlert({
        variant: "error",
        title: "No KYB selected",
        message: "Search and select a KYB request first.",
      });
      return;
    }

    try {
      await approveMutation.mutateAsync({
        data: {
          kyb_id: selectedId,
          notes: notes.trim() || undefined,
        },
        apiKey,
      });
      await refetch();
      router.push("/admin/kyb/history");
    } catch {
      // Alerts handled in mutation
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

  const formatDocuments = (value?: number) => {
    if (!value) return "0 document";
    return `${value} document${value > 1 ? "s" : ""}`;
  };

  const renderDetails = () => {
    if (!selectedId) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <ShieldAlert className="text-muted-foreground h-10 w-10" />
          <p className="text-muted-foreground text-sm">
            Search a KYB ID to load its details and continue the approval flow.
          </p>
        </div>
      );
    }

    if (isDetailsLoading) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <p className="text-muted-foreground text-sm">Fetching KYB details...</p>
        </div>
      );
    }

    if (!kybDetails) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <ShieldAlert className="text-muted-foreground h-10 w-10" />
          <p className="text-muted-foreground text-sm">
            No KYB request found for the provided identifier.
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/40">
            <p className="text-muted-foreground text-xs font-semibold uppercase">Client</p>
            <p className="text-base font-medium text-gray-900 dark:text-white">
              {kybDetails.client_name || "--"}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              KYB ID: {kybDetails.id || selectedId}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <p className="text-muted-foreground text-xs font-semibold uppercase">Submitted on</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(kybDetails.submitted_at)}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <p className="text-muted-foreground text-xs font-semibold uppercase">Documents</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDocuments(kybDetails.documents_count)}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <p className="text-muted-foreground text-xs font-semibold uppercase">
                Current status
              </p>
              <p className="text-sm font-medium capitalize text-gray-900 dark:text-white">
                {kybDetails.status || "pending"}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <p className="text-muted-foreground text-xs font-semibold uppercase">
                Assigned reviewer
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {kybDetails.reviewer || "—"}
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-muted-foreground text-xs font-semibold uppercase">Latest update</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {formatDate(kybDetails.updated_at)}
            </p>
            <p className="text-muted-foreground mt-2 text-xs">
              Notes: {kybDetails.notes || "No reviewer note provided"}
            </p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
            <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
              Validate that business identity documents reflect the latest legal name and
              registration numbers before you approve.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 px-4 py-4 sm:space-y-10 sm:px-6 sm:py-6">
      <header className="rounded-3xl border border-gray-200 bg-white shadow-xl shadow-brand-500/15 dark:border-gray-900 dark:bg-gray-950">
        <div className="flex flex-col gap-6 px-6 py-6 sm:px-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 p-3 shadow-lg shadow-brand-500/40 sm:p-4">
              <ShieldCheck className="h-6 w-6 text-white sm:h-8 sm:w-8" />
            </div>
            <div>
              <h1 className="text-[28px] font-semibold tracking-tight text-gray-900 dark:text-white sm:text-[32px]">
                Approve KYB request
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed dark:text-gray-300 sm:text-base">
                Load a KYB submission, verify supporting documents, and provide final approval notes
                for the client.
              </p>
            </div>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/kyb/pending")}
              className="h-10 w-full rounded-xl border-2 sm:h-11 sm:w-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to queue
            </Button>
          </div>
        </div>
      </header>

      <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
            <Search className="h-5 w-5 text-brand-500" />
            Locate KYB submission
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Enter a KYB identifier from the pending queue to load details instantly.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-4 pt-0 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="Enter KYB ID"
              value={searchId}
              onChange={(event) => setSearchId(event.target.value)}
              className="h-11 rounded-2xl border-2"
            />
            <Button
              onClick={handleSearch}
              disabled={!searchId.trim()}
              className="h-11 rounded-2xl sm:w-[160px]"
            >
              <Search className="mr-2 h-4 w-4" />
              Load request
            </Button>
          </div>
          {selectedId && (
            <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-800/60 dark:bg-blue-950/30 dark:text-blue-200">
              <FileCheck className="mt-0.5 h-5 w-5" />
              <div>
                <p className="font-medium">Current selection: {selectedId}</p>
                <p className="mt-1 text-xs">
                  If the wrong request was loaded, search again or return to the pending list.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
            <ShieldAlert className="h-5 w-5 text-brand-500" />
            KYB dossier
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Review all submission details before confirming your approval.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6">{renderDetails()}</CardContent>
      </Card>

      <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
            <CheckCircle2 className="h-5 w-5 text-brand-500" />
            Approval notes
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Confirm final approval and leave internal notes if needed.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6">
          <form onSubmit={handleApprove} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="approval-notes">Internal notes (optional)</Label>
              <Textarea
                id="approval-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
                placeholder="Document your checklist, verification tools, or outstanding follow-ups."
                className="rounded-2xl border-2"
              />
              <p className="text-muted-foreground text-xs">
                Notes are shared with the rest of the compliance team but not with the client.
              </p>
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                <div>
                  <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
                    Final verification
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    Approving grants full production access and notifies the client automatically.
                  </p>
                </div>
              </div>
              <Button
                type="submit"
                disabled={approveMutation.isPending || !selectedId || !kybDetails || !apiKey}
                className="h-11 rounded-xl bg-emerald-600 px-6 text-white hover:bg-emerald-700"
              >
                {approveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve KYB
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
