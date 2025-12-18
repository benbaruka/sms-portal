import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, AlertCircle, Wallet } from "lucide-react";
export interface MessageStatusBadgeProps {
  status: unknown;
  className?: string;
}
export function getMessageStatusBadge(status: unknown, className?: string): React.ReactElement {
  let statusValue: number | string | null = null;
  if (status != null) {
    const strStatus = String(status);
    if (strStatus === "") {
      statusValue = null;
    } else {
      const numStatus = Number(status);
      if (!isNaN(numStatus) && strStatus.trim() !== "") {
        statusValue = numStatus;
      } else {
        statusValue = strStatus.toLowerCase();
      }
    }
  }
  if (typeof statusValue === "number") {
    switch (statusValue) {
      case 2:
        return (
          <Badge
            variant="default"
            className={`bg-green-500 text-xs text-white hover:bg-green-600 ${className || ""}`}
          >
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Delivered
          </Badge>
        );
      case 1:
        return (
          <Badge
            variant="secondary"
            className={`bg-blue-500 text-xs text-white hover:bg-blue-600 ${className || ""}`}
          >
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case 0:
        return (
          <Badge
            variant="secondary"
            className={`bg-yellow-500 text-xs text-white hover:bg-yellow-600 ${className || ""}`}
          >
            <Clock className="mr-1 h-3 w-3" />
            Queued
          </Badge>
        );
      case -1:
      case 3:
        return (
          <Badge
            variant="destructive"
            className={`bg-red-500 text-xs text-white hover:bg-red-600 ${className || ""}`}
          >
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        );
      case 401:
        return (
          <Badge
            variant="destructive"
            className={`bg-orange-500 text-xs text-white hover:bg-orange-600 ${className || ""}`}
          >
            <Wallet className="mr-1 h-3 w-3" />
            Insufficient Balance
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className={`text-xs ${className || ""}`}>
            <AlertCircle className="mr-1 h-3 w-3" />
            Status: {statusValue}
          </Badge>
        );
    }
  }
  if (typeof statusValue === "string") {
    switch (statusValue) {
      case "delivered":
      case "success":
      case "successful":
      case "send":
        return (
          <Badge
            variant="default"
            className={`bg-green-500 text-xs text-white hover:bg-green-600 ${className || ""}`}
          >
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Delivered
          </Badge>
        );
      case "pending":
      case "processing":
        return (
          <Badge
            variant="secondary"
            className={`bg-blue-500 text-xs text-white hover:bg-blue-600 ${className || ""}`}
          >
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case "queued":
        return (
          <Badge
            variant="secondary"
            className={`bg-yellow-500 text-xs text-white hover:bg-yellow-600 ${className || ""}`}
          >
            <Clock className="mr-1 h-3 w-3" />
            Queued
          </Badge>
        );
      case "failed":
      case "error":
      case "sending_failed":
        return (
          <Badge
            variant="destructive"
            className={`bg-red-500 text-xs text-white hover:bg-red-600 ${className || ""}`}
          >
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        );
      case "insufficient_balance":
      case "insufficient_credits":
        return (
          <Badge
            variant="destructive"
            className={`bg-orange-500 text-xs text-white hover:bg-orange-600 ${className || ""}`}
          >
            <Wallet className="mr-1 h-3 w-3" />
            Insufficient Balance
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className={`text-xs ${className || ""}`}>
            {statusValue}
          </Badge>
        );
    }
  }
  return (
    <Badge variant="outline" className={`text-xs ${className || ""}`}>
      Unknown
    </Badge>
  );
}
export function getMessageStatusLabel(status: unknown): string {
  if (status == null) return "Unknown";
  const strStatus = String(status);
  if (strStatus === "") return "Unknown";
  const numStatus = Number(status);
  if (!isNaN(numStatus) && strStatus.trim() !== "") {
    switch (numStatus) {
      case 2:
        return "Delivered";
      case 1:
        return "Pending";
      case 0:
        return "Queued";
      case -1:
        return "Failed";
      case 401:
        return "Insufficient Balance";
      default:
        return `Status: ${numStatus}`;
    }
  }
  const statusStr = strStatus.toLowerCase();
  switch (statusStr) {
    case "delivered":
    case "success":
    case "successful":
    case "send":
      return "Delivered";
    case "pending":
    case "processing":
      return "Pending";
    case "queued":
      return "Queued";
    case "failed":
    case "error":
    case "sending_failed":
      return "Failed";
    case "insufficient_balance":
    case "insufficient_credits":
      return "Insufficient Balance";
    default:
      return statusStr;
  }
}
