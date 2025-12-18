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
  XCircle,
  ArrowLeft,
  Search,
  ShieldAlert,
  ShieldBan,
  FileWarning,
  AlertTriangle,
} from "lucide-react";
import { useAlert } from "@/context/AlertProvider";
import { useAdminKYBDetails, useRejectAdminKYB } from "@/controller/query/admin/kyb/useAdminKYB";
import { AdminKYBRecord } from "@/types";
import { format } from "date-fns";

export default function RejectKYBPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryKybId = searchParams.get("id");
  const { showAlert } = useAlert();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [searchId, setSearchId] = useState(queryKybId || "");
  const [selectedId, setSelectedId] = useState<string | null>(queryKybId);
  const [rejectionReason, setRejectionReason] = useState(
    "Missing corporate registry certificate and proof of address."
  );

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

  const rejectMutation = useRejectAdminKYB();

  const kybDetails = useMemo<AdminKYBRecord | null>(() => {
    if (!kybDetailsResponse) return null;
    return (
      (kybDetailsResponse.message as AdminKYBRecord | undefined) ||
      (kybDetailsResponse.data as AdminKYBRecord | undefined) ||
      null
    );
  }, [kybDetailsResponse]);

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

  const handleReject = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!apiKey) {
      showAlert({
        variant: "error",
        title: "Missing API key",
        message: "Please sign in again to reject KYB requests.",
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
    if (!rejectionReason.trim()) {
      showAlert({
        variant: "error",
        title: "Reason required",
        message: "Provide a clear rejection reason for the client.",
      });
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        data: {
          kyb_id: selectedId,
          notes: rejectionReason.trim(),
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

  const renderDetails = () => {
    if (!selectedId) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <ShieldAlert className="text-muted-foreground h-10 w-10" />
          <p className="text-muted-foreground text-sm">
            Search a KYB ID to load its dossier before issuing a rejection.
          </p>
        </div>
      );
    }

    if (isDetailsLoading) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <p className="text-muted-foreground text-sm">Loading KYB dossier...</p>
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
              <p className="text-muted-foreground text-xs font-semibold uppercase">
                Documents provided
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {(kybDetails.documents_count ?? 0).toLocaleString()} file(s)
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
              <p className="text-muted-foreground text-xs font-semibold uppercase">Last updated</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(kybDetails.updated_at)}
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-muted-foreground text-xs font-semibold uppercase">Reviewer notes</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {kybDetails.notes || "No internal note yet"}
            </p>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
            <p className="text-sm font-medium text-red-900 dark:text-red-200">
              Double-check missing documents or discrepancies before rejecting. Communicate clearly
              what is required to proceed.
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
            <div className="rounded-2xl bg-gradient-to-br from-red-500 via-red-600 to-red-700 p-3 shadow-lg shadow-red-500/40 sm:p-4">
              <ShieldBan className="h-6 w-6 text-white sm:h-8 sm:w-8" />
            </div>
            <div>
              <h1 className="text-[28px] font-semibold tracking-tight text-gray-900 dark:text-white sm:text-[32px]">
                Reject KYB request
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed dark:text-gray-300 sm:text-base">
                Provide a clear explanation of missing requirements to help the client resolve KYB
                blockers quickly.
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
            Enter a KYB identifier from the pending list to fetch the dossier.
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
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
              <FileWarning className="mt-0.5 h-5 w-5" />
              <div>
                <p className="font-medium">Current selection: {selectedId}</p>
                <p className="mt-1 text-xs">
                  Ensure the dossier is fully reviewed before sending a rejection notice.
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
            Review the information submitted by the client before rejecting the request.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6">{renderDetails()}</CardContent>
      </Card>

      <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
            <XCircle className="h-5 w-5 text-brand-500" />
            Rejection notice
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Detail the actions the client must take to resume the KYB process.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6">
          <form onSubmit={handleReject} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Reason for rejection *</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                rows={4}
                placeholder="Explain what is missing, expired, or inconsistent."
                className="rounded-2xl border-2"
                required
              />
              <p className="text-muted-foreground text-xs">
                This message is sent to the client. Be precise about the documents or steps
                required.
              </p>
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-300" />
                <div>
                  <p className="text-sm font-medium text-red-900 dark:text-red-200">
                    Client access remains limited
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300">
                    The client can only resubmit once all requested documents are provided.
                  </p>
                </div>
              </div>
              <Button
                type="submit"
                variant="destructive"
                disabled={
                  rejectMutation.isPending ||
                  !selectedId ||
                  !kybDetails ||
                  !apiKey ||
                  !rejectionReason.trim()
                }
                className="h-11 rounded-xl px-6"
              >
                {rejectMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject KYB
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
