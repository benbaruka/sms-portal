"use client";
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/loader";
import { MessageSquare, ChevronDown, Phone, Calendar } from "lucide-react";
import { format, startOfYear, endOfDay } from "date-fns";
import { useMessagesTable } from "@/controller/query/messages/useMessagesTable";
import { MessagesTableRequest } from "@/controller/query/messages/messagesTable.service";
import { getMessageStatusBadge } from "@/utils/messageStatus";
interface RecentMessagesTableProps {
  route: string;
  apiKey: string | null;
  title: string;
  description: string;
  className?: string;
}
export function RecentMessagesTable({
  route,
  apiKey,
  title,
  description,
  className = "",
}: RecentMessagesTableProps) {
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);
  const defaultDateRange = useMemo(() => {
    const now = new Date();
    const startDate = startOfYear(now);
    const endDate = endOfDay(now);
    return {
      start: format(startDate, "yyyy-MM-dd"),
      end: format(endDate, "yyyy-MM-dd"),
    };
  }, []);
  const sortField = useMemo(() => {
    if (route.includes("promotional")) {
      return "sms_outbox_promotional.id|desc";
    }
    return "sms_outbox.id|desc";
  }, [route]);
  const requestParams = useMemo<MessagesTableRequest>(() => {
    return {
      page: 1,
      per_page: 25,
      sort: sortField,
      filter: "",
      start: defaultDateRange.start,
      end: defaultDateRange.end,
      service: "sms",
    };
  }, [sortField, defaultDateRange]);
  const { data: tableData, isLoading } = useMessagesTable(route, requestParams, apiKey, !!apiKey);
  const messages = useMemo(() => {
    if (!tableData) return [];
    const tableDataAny = tableData as Record<string, unknown>;
    const data =
      (tableDataAny.data as unknown[]) ||
      ((tableDataAny.message as Record<string, unknown>)?.data as unknown[]) ||
      ((tableDataAny.message as Record<string, unknown>)?.messages as unknown[]) ||
      [];
    const sortedMessages = (data as Array<Record<string, unknown>>)
      .filter((msg: Record<string, unknown>) => {
        const date = (msg.created || msg.created_at || msg.sent_at || msg.date) as
          | string
          | undefined;
        return date && new Date(date).getTime();
      })
      .sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
        try {
          const dateAStr = (a.created || a.created_at || a.sent_at || a.date) as string | undefined;
          const dateBStr = (b.created || b.created_at || b.sent_at || b.date) as string | undefined;
          if (!dateAStr || !dateBStr) return 0;
          const dateA = new Date(dateAStr).getTime();
          const dateB = new Date(dateBStr).getTime();
          return dateB - dateA;
        } catch {
          return 0;
        }
      })
      .slice(0, 5);
    return sortedMessages;
  }, [tableData]);
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm");
    } catch {
      return dateString;
    }
  };
  return (
    <Card
      className={`border-border/50 bg-card border-2 shadow-lg dark:border-gray-700 ${className}`}
    >
      <CardHeader className="border-border/50 dark:border-border/30 border-b-2 bg-gradient-to-r from-brand-50/50 to-blue-light-50/50 px-4 py-4 dark:from-brand-950/30 dark:to-blue-light-950/30 md:px-6 md:py-6">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white md:gap-3 md:text-lg lg:text-xl">
          <MessageSquare className="h-4 w-4 text-brand-500 md:h-5 md:w-5" />
          {title}
        </CardTitle>
        <CardDescription className="mt-1 text-xs text-gray-600 dark:text-gray-400 md:mt-2 md:text-sm lg:text-base">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 md:p-4 lg:p-6">
        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 md:py-12">
            <MessageSquare className="mb-3 h-8 w-8 text-gray-400 md:mb-4 md:h-10 md:w-10 lg:h-12 lg:w-12" />
            <p className="px-4 text-center text-xs text-gray-500 dark:text-gray-400 md:text-sm lg:text-base">
              No messages found
            </p>
          </div>
        ) : (
          <div className="-mx-3 overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900/50 md:mx-0">
            <div className="w-full overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 via-gray-50/50 to-gray-50 dark:border-gray-700 dark:from-gray-800 dark:via-gray-800/50 dark:to-gray-800">
                    <TableHead className="w-[70px] px-2 py-3 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 md:py-4 md:text-sm">
                      ID
                    </TableHead>
                    <TableHead className="w-[140px] px-2 py-3 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 md:py-4 md:text-sm">
                      Phone
                    </TableHead>
                    <TableHead className="hidden w-[120px] px-2 py-3 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 sm:table-cell md:py-4 md:text-sm">
                      Sender ID
                    </TableHead>
                    <TableHead className="w-[110px] px-2 py-3 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 md:py-4 md:text-sm">
                      Status
                    </TableHead>
                    <TableHead className="hidden w-[160px] px-2 py-3 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 md:table-cell md:py-4 md:text-sm">
                      Date
                    </TableHead>
                    <TableHead className="w-[110px] px-2 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 md:py-4 md:text-sm">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(messages as Array<Record<string, unknown>>).map(
                    (message: Record<string, unknown>, idx: number) => {
                      const messageId = String(
                        message.id ||
                          message.sms_outbox_id ||
                          message.sms_outbox_promotional_id ||
                          idx
                      );
                      const messageText = (message.message ||
                        message.content ||
                        message.text ||
                        "N/A") as string;
                      const messageDate = (message.created ||
                        message.created_at ||
                        message.sent_at ||
                        message.date) as string | undefined;
                      const isExpanded = expandedMessageId === messageId;
                      return (
                        <React.Fragment key={messageId}>
                          <TableRow className="group border-b border-gray-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-50/50 dark:border-gray-800/50 dark:hover:from-gray-800/50 dark:hover:to-gray-800/30">
                            <TableCell className="px-2 py-3 text-xs font-semibold text-gray-900 dark:text-gray-100 md:py-4 md:text-sm">
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-brand-100 text-xs font-bold text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                                {messageId}
                              </span>
                            </TableCell>
                            <TableCell className="px-2 py-3 text-xs font-medium text-gray-900 dark:text-gray-100 md:py-4 md:text-sm">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                  <Phone className="h-3 w-3" />
                                </span>
                                <span className="font-mono block max-w-[100px] truncate md:max-w-none">
                                  {
                                    (message.msisdn ||
                                      message.phone_number ||
                                      message.phone ||
                                      "N/A") as string
                                  }
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="hidden px-2 py-3 text-xs text-gray-600 dark:text-gray-400 sm:table-cell md:py-4 md:text-sm">
                              <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                {(message.sender_id || "N/A") as string}
                              </span>
                            </TableCell>
                            <TableCell className="px-2 py-3 md:py-4">
                              {getMessageStatusBadge(
                                (message.status || message.delivery_status || 0) as number
                              )}
                            </TableCell>
                            <TableCell className="hidden px-2 py-3 text-xs text-gray-600 dark:text-gray-400 md:table-cell md:py-4 md:text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                <span className="font-medium">{formatDate(messageDate)}</span>
                              </div>
                            </TableCell>
                            <TableCell className="px-2 py-3 text-center md:py-4">
                              <button
                                onClick={() => setExpandedMessageId(isExpanded ? null : messageId)}
                                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-500 to-blue-light-500 px-2.5 py-1.5 text-xs font-semibold text-white shadow-md transition-all duration-200 hover:scale-105 hover:from-brand-600 hover:to-blue-light-600 hover:shadow-lg"
                              >
                                <MessageSquare className="h-3 w-3" />
                                <span className="hidden sm:inline">View</span>
                                <span className="sm:hidden">Msg</span>
                                <ChevronDown
                                  className={`h-3 w-3 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                                />
                              </button>
                            </TableCell>
                          </TableRow>
                          {isExpanded && (
                            <TableRow className="border-b border-gray-200 bg-gradient-to-r from-gray-50/80 via-gray-50/60 to-gray-50/80 dark:border-gray-700 dark:from-gray-800/40 dark:via-gray-800/30 dark:to-gray-800/40">
                              <TableCell colSpan={6} className="px-4 py-4 md:px-6 md:py-6">
                                <div className="animate-in slide-in-from-top-2 space-y-3 rounded-lg border-2 border-gray-200 bg-white p-4 shadow-sm duration-200 dark:border-gray-700 dark:bg-gray-900/50 md:space-y-4 md:p-6">
                                  <div className="flex items-start gap-3 md:gap-4">
                                    <div className="mt-1 flex-shrink-0">
                                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30">
                                        <MessageSquare className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                                      </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="mb-2 flex items-center gap-2">
                                        <span className="text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 md:text-sm">
                                          Message Content:
                                        </span>
                                      </div>
                                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50 md:p-4">
                                        <p className="whitespace-pre-wrap break-words text-xs leading-relaxed text-gray-900 dark:text-gray-100 md:text-sm">
                                          {messageText}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  {messageDate && (
                                    <div className="flex items-center gap-2 border-t border-gray-200 pt-2 dark:border-gray-700 md:hidden">
                                      <Calendar className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        Date:
                                      </span>
                                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                        {formatDate(messageDate)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    }
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
