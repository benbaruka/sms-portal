"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  CreditCard,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  DollarSign,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { useGetManualTopupRequestDetails } from "@/controller/query/topup/useTopup";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";

export default function TopupRequestDetailsPage() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get("id");
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const {
    data: requestData,
    isLoading,
    isError,
    error,
  } = useGetManualTopupRequestDetails(
    {
      request_id: requestId ? parseInt(requestId) : 0,
    },
    apiKey,
    !!apiKey && !!requestId
  );

  const request = requestData?.message || requestData?.data || null;

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "completed":
      case "success":
        return (
          <Badge variant="default" className="bg-green-500 text-white">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        );
      case "pending":
      case "processing":
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case "rejected":
      case "failed":
      case "error":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status || "Unknown"}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm:ss");
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  if (!requestId) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Top-up Request Details
            </h1>
            <p className="text-muted-foreground mt-1 dark:text-gray-400">
              View details of a top-up request
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
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-muted-foreground dark:text-gray-400">No request ID provided</p>
              <Link href="/admin/topup/requests">
                <Button variant="outline" className="mt-4">
                  Go to Requests
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Top-up Request Details
            </h1>
            <p className="text-muted-foreground mt-1 dark:text-gray-400">
              View details of a top-up request
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
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                Loading request details...
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !request) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Top-up Request Details
            </h1>
            <p className="text-muted-foreground mt-1 dark:text-gray-400">
              View details of a top-up request
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
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-muted-foreground dark:text-gray-400">
                {error?.message || "Failed to load request details"}
              </p>
              <Link href="/admin/topup/requests">
                <Button variant="outline" className="mt-4">
                  Go to Requests
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Top-up Request Details
          </h1>
          <p className="text-muted-foreground mt-1 dark:text-gray-400">
            View details of top-up request #{request.id}
          </p>
        </div>
        <Link href="/admin/topup/requests">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Requests
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <CreditCard className="h-5 w-5 text-brand-500" />
              Request Information
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Top-up request details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Request ID
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                #{request.id}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</span>
              {getStatusBadge(request.status)}
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Amount</span>
              <span className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                <DollarSign className="h-4 w-4 text-brand-500" />
                {formatCurrency(request.amount || 0, request.currency || "USD")}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Currency</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {request.currency || "USD"}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Connector ID
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {request.connector_id || "N/A"}
              </span>
            </div>
            {request.connector_name && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Connector Name
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {request.connector_name}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <FileText className="h-5 w-5 text-brand-500" />
              Invoice Information
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Invoice details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Invoice Number
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {request.invoice_number || "N/A"}
              </span>
            </div>
            <Separator />
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Invoice Path
              </span>
              <span className="max-w-[200px] break-words text-right text-sm font-semibold text-gray-900 dark:text-white">
                {request.invoice_path || "N/A"}
              </span>
            </div>
            {request.description && (
              <>
                <Separator />
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Description
                  </span>
                  <span className="max-w-[200px] break-words text-right text-sm font-semibold text-gray-900 dark:text-white">
                    {request.description}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Calendar className="h-5 w-5 text-brand-500" />
            Timestamps
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Request timestamps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Created At</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatDate(request.created_at || "")}
            </span>
          </div>
          {request.updated_at && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Updated At
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatDate(request.updated_at)}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
