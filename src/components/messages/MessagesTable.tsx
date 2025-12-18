"use client";
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableSkeleton } from "@/components/ui/loader";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Calendar,
  MessageSquare,
  ChevronDown,
  Phone,
} from "lucide-react";
import { useMessagesTable } from "@/controller/query/messages/useMessagesTable";
import { MessagesTableRequest } from "@/controller/query/messages/messagesTable.service";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { format } from "date-fns";
import { getMessageStatusBadge } from "@/utils/messageStatus";
interface MessagesTableProps {
  route: string;
  apiKey: string | null;
  title?: string;
  description?: string;
  defaultSort?: string;
  defaultPerPage?: number;
  showDateFilter?: boolean;
  showSearch?: boolean;
  className?: string;
}
export function MessagesTable({
  route,
  apiKey,
  title = "Messages",
  description = "A list of your SMS messages",
  defaultSort = "sms_outbox.id|desc",
  defaultPerPage = 25,
  showDateFilter = true,
  showSearch = true,
  className = "",
}: MessagesTableProps) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(defaultPerPage);
  const [sort, setSort] = useState<string>(defaultSort);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);
  const requestParams = useMemo<MessagesTableRequest>(() => {
    const params: MessagesTableRequest = {
      page,
      per_page: perPage,
      sort,
      service: "sms",
    };
    if (startDate) {
      params.start = format(startDate, "yyyy-MM-dd");
    }
    if (endDate) {
      params.end = format(endDate, "yyyy-MM-dd");
    }
    if (search.trim()) {
      params.filter = search.trim();
    }
    return params;
  }, [page, perPage, sort, search, startDate, endDate]);
  const {
    data: tableData,
    isLoading,
    isError,
    error,
    refetch,
  } = useMessagesTable(route, requestParams, apiKey, !!apiKey);
  const { messages, pagination } = useMemo(() => {
    if (!tableData) return { messages: [], pagination: null };
    const tableDataAny = tableData as Record<string, unknown>;
    const data =
      (tableDataAny.data as unknown[]) ||
      ((tableDataAny.message as Record<string, unknown>)?.data as unknown[]) ||
      ((tableDataAny.message as Record<string, unknown>)?.messages as unknown[]) ||
      [];
    const messageData = (tableDataAny.message as Record<string, unknown>) || {};
    const messagePagination = (messageData.pagination as Record<string, unknown>) || {};
    const paginationData: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
      from: number;
      to: number;
    } = {
      current_page:
        typeof messagePagination.current_page === "number"
          ? messagePagination.current_page
          : typeof tableDataAny.current_page === "number"
            ? tableDataAny.current_page
            : typeof messageData.current_page === "number"
              ? messageData.current_page
              : 1,
      last_page:
        typeof messagePagination.last_page === "number"
          ? messagePagination.last_page
          : typeof tableDataAny.last_page === "number"
            ? tableDataAny.last_page
            : typeof messageData.last_page === "number"
              ? messageData.last_page
              : 1,
      per_page:
        typeof messagePagination.per_page === "number"
          ? messagePagination.per_page
          : typeof tableDataAny.per_page === "number"
            ? tableDataAny.per_page
            : typeof messageData.per_page === "number"
              ? messageData.per_page
              : perPage,
      total:
        typeof messagePagination.total === "number"
          ? messagePagination.total
          : typeof tableDataAny.total === "number"
            ? tableDataAny.total
            : typeof messageData.total === "number"
              ? messageData.total
              : 0,
      from:
        typeof messagePagination.from === "number"
          ? messagePagination.from
          : typeof tableDataAny.from === "number"
            ? tableDataAny.from
            : typeof messageData.from === "number"
              ? messageData.from
              : 0,
      to:
        typeof messagePagination.to === "number"
          ? messagePagination.to
          : typeof tableDataAny.to === "number"
            ? tableDataAny.to
            : typeof messageData.to === "number"
              ? messageData.to
              : 0,
    };
    return {
      messages: Array.isArray(data) ? data : [],
      pagination: paginationData,
    };
  }, [tableData, perPage]);
  const handleSort = (field: string) => {
    const [currentField, currentDirection] = sort.split("|");
    if (currentField === field) {
      const newDirection = currentDirection === "desc" ? "asc" : "desc";
      setSort(`${field}|${newDirection}`);
    } else {
      setSort(`${field}|desc`);
    }
    setPage(1);
  };
  const getSortDirection = (field: string): "asc" | "desc" | null => {
    const [currentField, direction] = sort.split("|");
    if (currentField === field) {
      return direction as "asc" | "desc";
    }
    return null;
  };
  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };
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
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white md:gap-3 md:text-lg lg:text-xl">
              <MessageSquare className="h-4 w-4 text-brand-500 md:h-5 md:w-5" />
              {title}
            </CardTitle>
            <CardDescription className="mt-1 text-xs text-gray-600 dark:text-gray-400 md:mt-2 md:text-sm lg:text-base">
              {description}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isLoading}
            className="h-9 w-9 border-2 border-gray-300 hover:bg-brand-50 dark:border-gray-600 dark:hover:bg-gray-800"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3 md:p-4 lg:p-6">
        {}
        <div className="mb-4 flex flex-col items-stretch gap-2 md:mb-6 md:flex-row md:items-end md:gap-3">
          {}
          {showSearch && (
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder="Search by phone, message, sender..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="h-10 border-2 border-gray-300 bg-white pl-10 text-xs shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-brand-500 md:h-11 md:text-sm"
              />
            </div>
          )}
          {}
          {showDateFilter && (
            <>
              <div className="flex-1 md:w-[240px] md:flex-initial lg:w-[280px]">
                <DateRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(start, end) => {
                    setStartDate(start);
                    setEndDate(end);
                    setPage(1);
                  }}
                  placeholder="Select date range"
                  className="h-10 border-2 border-gray-300 bg-white text-xs shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-brand-500 md:h-11 md:text-sm"
                  minDate={new Date(2020, 0, 1)}
                  maxDate={new Date()}
                />
              </div>
              {(startDate || endDate) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setStartDate(undefined);
                    setEndDate(undefined);
                    setPage(1);
                  }}
                  className="h-10 flex-shrink-0 whitespace-nowrap border-2 border-gray-300 text-xs hover:border-red-500 hover:bg-red-50 dark:border-gray-600 dark:hover:border-red-500 dark:hover:bg-red-900/20 md:h-11 md:text-sm"
                >
                  Clear
                </Button>
              )}
            </>
          )}
          {}
          <div className="flex-1 md:w-[100px] md:flex-initial lg:w-[120px]">
            <Select
              value={perPage.toString()}
              onValueChange={(value: string) => {
                setPerPage(parseInt(value));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-full border-2 border-gray-300 bg-white text-xs shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-brand-500 md:h-11 md:text-sm">
                <SelectValue placeholder="Per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {}
          <div className="flex-shrink-0">
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              disabled={isLoading}
              className="h-10 w-10 border-2 border-gray-300 shadow-sm hover:border-brand-500 hover:bg-brand-50 dark:border-gray-600 dark:hover:border-brand-500 dark:hover:bg-gray-800 md:h-11 md:w-11"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
        {}
        {isLoading ? (
          <TableSkeleton rows={perPage} />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-8 md:py-12">
            <MessageSquare className="mb-3 h-8 w-8 text-red-400 md:mb-4 md:h-10 md:w-10 lg:h-12 lg:w-12" />
            <p className="px-4 text-center text-xs text-red-500 dark:text-red-400 md:text-sm lg:text-base">
              Error loading messages: {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 md:py-12">
            <MessageSquare className="mb-3 h-8 w-8 text-gray-400 md:mb-4 md:h-10 md:w-10 lg:h-12 lg:w-12" />
            <p className="px-4 text-center text-xs text-gray-500 dark:text-gray-400 md:text-sm lg:text-base">
              No messages found for the selected filters
            </p>
          </div>
        ) : (
          <>
            <div className="-mx-3 overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900/50 md:mx-0">
              <div className="w-full overflow-x-auto">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 via-gray-50/50 to-gray-50 dark:border-gray-700 dark:from-gray-800 dark:via-gray-800/50 dark:to-gray-800">
                      <TableHead className="w-[70px] px-2 py-3 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 md:py-4 md:text-sm">
                        <button
                          onClick={() => {
                            const sortField = route.includes("promotional")
                              ? "sms_outbox_promotional.id"
                              : route.includes("transactional")
                                ? "sms_outbox.id"
                                : "sms_outbox.id";
                            handleSort(sortField);
                          }}
                          className="flex items-center gap-1 transition-colors hover:text-brand-500"
                        >
                          ID
                          {(() => {
                            const sortField = route.includes("promotional")
                              ? "sms_outbox_promotional.id"
                              : route.includes("transactional")
                                ? "sms_outbox.id"
                                : "sms_outbox.id";
                            const direction = getSortDirection(sortField);
                            if (direction === "asc") return <ArrowUp className="h-3 w-3" />;
                            if (direction === "desc") return <ArrowDown className="h-3 w-3" />;
                            return <ArrowUpDown className="h-3 w-3 opacity-50" />;
                          })()}
                        </button>
                      </TableHead>
                      <TableHead className="w-[140px] px-2 py-3 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 md:py-4 md:text-sm">
                        <button
                          onClick={() => {
                            const sortField = route.includes("promotional")
                              ? "sms_outbox_promotional.msisdn"
                              : route.includes("transactional")
                                ? "sms_outbox.msisdn"
                                : "sms_outbox.msisdn";
                            handleSort(sortField);
                          }}
                          className="flex items-center gap-1 transition-colors hover:text-brand-500"
                        >
                          Phone
                          {(() => {
                            const sortField = route.includes("promotional")
                              ? "sms_outbox_promotional.msisdn"
                              : route.includes("transactional")
                                ? "sms_outbox.msisdn"
                                : "sms_outbox.msisdn";
                            const direction = getSortDirection(sortField);
                            if (direction === "asc") return <ArrowUp className="h-3 w-3" />;
                            if (direction === "desc") return <ArrowDown className="h-3 w-3" />;
                            return <ArrowUpDown className="h-3 w-3 opacity-50" />;
                          })()}
                        </button>
                      </TableHead>
                      <TableHead className="hidden w-[120px] px-2 py-3 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 sm:table-cell md:py-4 md:text-sm">
                        <button
                          onClick={() => {
                            const sortField = route.includes("promotional")
                              ? "sms_outbox_promotional.sender_id"
                              : route.includes("transactional")
                                ? "sms_outbox.sender_id"
                                : "sms_outbox.sender_id";
                            handleSort(sortField);
                          }}
                          className="flex items-center gap-1 transition-colors hover:text-brand-500"
                        >
                          Sender ID
                          {(() => {
                            const sortField = route.includes("promotional")
                              ? "sms_outbox_promotional.sender_id"
                              : route.includes("transactional")
                                ? "sms_outbox.sender_id"
                                : "sms_outbox.sender_id";
                            const direction = getSortDirection(sortField);
                            if (direction === "asc") return <ArrowUp className="h-3 w-3" />;
                            if (direction === "desc") return <ArrowDown className="h-3 w-3" />;
                            return <ArrowUpDown className="h-3 w-3 opacity-50" />;
                          })()}
                        </button>
                      </TableHead>
                      <TableHead className="w-[110px] px-2 py-3 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 md:py-4 md:text-sm">
                        Status
                      </TableHead>
                      <TableHead className="hidden w-[160px] px-2 py-3 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 md:table-cell md:py-4 md:text-sm">
                        <button
                          onClick={() => {
                            const sortField = route.includes("promotional")
                              ? "sms_outbox_promotional.created_at"
                              : route.includes("transactional")
                                ? "sms_outbox.created_at"
                                : "sms_outbox.created_at";
                            handleSort(sortField);
                          }}
                          className="flex items-center gap-1 transition-colors hover:text-brand-500"
                        >
                          Date
                          {(() => {
                            const sortField = route.includes("promotional")
                              ? "sms_outbox_promotional.created_at"
                              : route.includes("transactional")
                                ? "sms_outbox.created_at"
                                : "sms_outbox.created_at";
                            const direction = getSortDirection(sortField);
                            if (direction === "asc") return <ArrowUp className="h-3 w-3" />;
                            if (direction === "desc") return <ArrowDown className="h-3 w-3" />;
                            return <ArrowUpDown className="h-3 w-3 opacity-50" />;
                          })()}
                        </button>
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
                                  onClick={() =>
                                    setExpandedMessageId(isExpanded ? null : messageId)
                                  }
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
            {}
            {pagination && pagination.total > 0 && (
              <div className="border-border/50 mt-4 flex flex-col items-center justify-between gap-4 border-t pt-4 dark:border-gray-700 sm:flex-row md:mt-6">
                <div className="text-xs text-gray-600 dark:text-gray-400 md:text-sm">
                  Displaying {pagination.from || 0} to {pagination.to || 0} of{" "}
                  {pagination.total || 0} messages
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage(1)}
                    disabled={page === 1 || isLoading}
                    className="h-9 w-9 border-2 border-gray-300 shadow-sm hover:border-brand-500 hover:bg-brand-50 dark:border-gray-600 dark:hover:border-brand-500 dark:hover:bg-gray-800 md:h-10 md:w-10"
                    title="First page"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1 || isLoading}
                    className="h-9 w-9 border-2 border-gray-300 shadow-sm hover:border-brand-500 hover:bg-brand-50 dark:border-gray-600 dark:hover:border-brand-500 dark:hover:bg-gray-800 md:h-10 md:w-10"
                    title="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="px-3 text-xs font-medium text-gray-700 dark:text-gray-300 md:px-4 md:text-sm">
                    Page {pagination.current_page || page} of {pagination.last_page || 1}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= (pagination.last_page || 1) || isLoading}
                    className="h-9 w-9 border-2 border-gray-300 shadow-sm hover:border-brand-500 hover:bg-brand-50 dark:border-gray-600 dark:hover:border-brand-500 dark:hover:bg-gray-800 md:h-10 md:w-10"
                    title="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage(pagination.last_page || 1)}
                    disabled={page >= (pagination.last_page || 1) || isLoading}
                    className="h-9 w-9 border-2 border-gray-300 shadow-sm hover:border-brand-500 hover:bg-brand-50 dark:border-gray-600 dark:hover:border-brand-500 dark:hover:bg-gray-800 md:h-10 md:w-10"
                    title="Last page"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
