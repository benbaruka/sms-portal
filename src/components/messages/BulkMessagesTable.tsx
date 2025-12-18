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
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  FileText,
  DollarSign,
} from "lucide-react";
import { useMessagesTable } from "@/controller/query/messages/useMessagesTable";
import { MessagesTableRequest } from "@/controller/query/messages/messagesTable.service";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { format, startOfYear, endOfDay } from "date-fns";
import { getMessageStatusBadge } from "@/utils/messageStatus";
interface BulkMessagesTableProps {
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
export function BulkMessagesTable({
  route,
  apiKey,
  title = "Bulk Messages History",
  description = "View and manage all your bulk SMS campaigns",
  defaultSort = "bulk_sms.id|desc",
  defaultPerPage = 25,
  showDateFilter = true,
  showSearch = true,
  className = "",
}: BulkMessagesTableProps) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(defaultPerPage);
  const [sort, setSort] = useState<string>(defaultSort);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(() => startOfYear(new Date()));
  const [endDate, setEndDate] = useState<Date | undefined>(() => endOfDay(new Date()));
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(null);
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
  const { campaigns, pagination } = useMemo(() => {
    if (!tableData) return { campaigns: [], pagination: null };
    const tableDataAny = tableData as Record<string, unknown>;
    const data = (tableDataAny.data as unknown[]) || [];
    const paginationData: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
      from: number;
      to: number;
    } = {
      current_page: typeof tableDataAny.current_page === "number" ? tableDataAny.current_page : 1,
      last_page: typeof tableDataAny.last_page === "number" ? tableDataAny.last_page : 1,
      per_page: typeof tableDataAny.per_page === "number" ? tableDataAny.per_page : perPage,
      total: typeof tableDataAny.total === "number" ? tableDataAny.total : 0,
      from: typeof tableDataAny.from === "number" ? tableDataAny.from : 0,
      to: typeof tableDataAny.to === "number" ? tableDataAny.to : 0,
    };
    return {
      campaigns: Array.isArray(data) ? data : [],
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
          {showSearch && (
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder="Search by campaign name, message..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="h-10 border-2 border-gray-300 bg-white pl-10 text-xs shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-brand-500 md:h-11 md:text-sm"
              />
            </div>
          )}
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
          <div className="flex-1 md:w-[100px] md:flex-initial lg:w-[120px]">
            <Select
              value={perPage.toString()}
              onValueChange={(value) => {
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
              Error loading campaigns: {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 md:py-12">
            <MessageSquare className="mb-3 h-8 w-8 text-gray-400 md:mb-4 md:h-10 md:w-10 lg:h-12 lg:w-12" />
            <p className="px-4 text-center text-xs text-gray-500 dark:text-gray-400 md:text-sm lg:text-base">
              No campaigns found for the selected filters
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
                          onClick={() => handleSort("bulk_sms.id")}
                          className="flex items-center gap-1 transition-colors hover:text-brand-500"
                        >
                          ID
                          {(() => {
                            const direction = getSortDirection("bulk_sms.id");
                            if (direction === "asc") return <ArrowUp className="h-3 w-3" />;
                            if (direction === "desc") return <ArrowDown className="h-3 w-3" />;
                            return <ArrowUpDown className="h-3 w-3 opacity-50" />;
                          })()}
                        </button>
                      </TableHead>
                      <TableHead className="w-[180px] px-2 py-3 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 md:py-4 md:text-sm">
                        Campaign Name
                      </TableHead>
                      <TableHead className="hidden w-[120px] px-2 py-3 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 sm:table-cell md:py-4 md:text-sm">
                        Sender ID
                      </TableHead>
                      <TableHead className="w-[140px] px-2 py-3 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 md:py-4 md:text-sm">
                        Recipients
                      </TableHead>
                      <TableHead className="w-[110px] px-2 py-3 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 md:py-4 md:text-sm">
                        Status
                      </TableHead>
                      <TableHead className="hidden w-[160px] px-2 py-3 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 md:table-cell md:py-4 md:text-sm">
                        <button
                          onClick={() => handleSort("bulk_sms.created")}
                          className="flex items-center gap-1 transition-colors hover:text-brand-500"
                        >
                          Date
                          {(() => {
                            const direction = getSortDirection("bulk_sms.created");
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
                    {(campaigns as Array<Record<string, unknown>>).map(
                      (campaign: Record<string, unknown>, idx: number) => {
                        const campaignId = String(campaign.id || idx);
                        const isExpanded = expandedCampaignId === campaignId;
                        const stats = (campaign.statistics as Record<string, unknown>) || {};
                        return (
                          <React.Fragment key={campaignId}>
                            <TableRow className="group border-b border-gray-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-50/50 dark:border-gray-800/50 dark:hover:from-gray-800/50 dark:hover:to-gray-800/30">
                              <TableCell className="px-2 py-3 text-xs font-semibold text-gray-900 dark:text-gray-100 md:py-4 md:text-sm">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-brand-100 text-xs font-bold text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                                  {campaignId}
                                </span>
                              </TableCell>
                              <TableCell className="px-2 py-3 text-xs font-medium text-gray-900 dark:text-gray-100 md:py-4 md:text-sm">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-brand-500" />
                                  <span className="block max-w-[150px] truncate font-semibold md:max-w-none">
                                    {(campaign.campaign_name as string) || "N/A"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="hidden px-2 py-3 text-xs text-gray-600 dark:text-gray-400 sm:table-cell md:py-4 md:text-sm">
                                <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                  {(campaign.sender_id as string) || "N/A"}
                                </span>
                              </TableCell>
                              <TableCell className="px-2 py-3 md:py-4">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-blue-500" />
                                  <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 md:text-sm">
                                    {typeof campaign.recipients === "number"
                                      ? campaign.recipients
                                      : 0}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="px-2 py-3 md:py-4">
                                {getMessageStatusBadge(
                                  typeof campaign.status === "number" ? campaign.status : 0
                                )}
                              </TableCell>
                              <TableCell className="hidden px-2 py-3 text-xs text-gray-600 dark:text-gray-400 md:table-cell md:py-4 md:text-sm">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                  <span className="font-medium">
                                    {formatDate(campaign.created as string | undefined)}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="px-2 py-3 text-center md:py-4">
                                <button
                                  onClick={() =>
                                    setExpandedCampaignId(isExpanded ? null : campaignId)
                                  }
                                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-500 to-blue-light-500 px-2.5 py-1.5 text-xs font-semibold text-white shadow-md transition-all duration-200 hover:scale-105 hover:from-brand-600 hover:to-blue-light-600 hover:shadow-lg"
                                >
                                  <TrendingUp className="h-3 w-3" />
                                  <span className="hidden sm:inline">Stats</span>
                                  <ChevronDown
                                    className={`h-3 w-3 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                                  />
                                </button>
                              </TableCell>
                            </TableRow>
                            {isExpanded && (
                              <TableRow className="border-b border-gray-200 bg-gradient-to-r from-gray-50/80 via-gray-50/60 to-gray-50/80 dark:border-gray-700 dark:from-gray-800/40 dark:via-gray-800/30 dark:to-gray-800/40">
                                <TableCell colSpan={7} className="px-4 py-4 md:px-6 md:py-6">
                                  <div className="space-y-4 md:space-y-6">
                                    {}
                                    <div className="rounded-lg border-2 border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/50 md:p-6">
                                      <div className="mb-4 flex items-start gap-3 md:gap-4">
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
                                              {(campaign.message as string) || "N/A"}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-4">
                                      <div className="rounded-lg border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-4 shadow-sm dark:border-green-700 dark:from-green-900/20 dark:to-green-800/20">
                                        <div className="mb-2 flex items-center justify-between">
                                          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                          <span className="text-xs font-semibold uppercase text-green-700 dark:text-green-300">
                                            Delivered
                                          </span>
                                        </div>
                                        <p className="text-2xl font-bold text-green-700 dark:text-green-400 md:text-3xl">
                                          {typeof campaign.delivered === "number"
                                            ? campaign.delivered
                                            : 0}
                                        </p>
                                      </div>
                                      {}
                                      <div className="rounded-lg border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100 p-4 shadow-sm dark:border-red-700 dark:from-red-900/20 dark:to-red-800/20">
                                        <div className="mb-2 flex items-center justify-between">
                                          <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                          <span className="text-xs font-semibold uppercase text-red-700 dark:text-red-300">
                                            Failed
                                          </span>
                                        </div>
                                        <p className="text-2xl font-bold text-red-700 dark:text-red-400 md:text-3xl">
                                          {typeof campaign.failed === "number"
                                            ? campaign.failed
                                            : 0}
                                        </p>
                                      </div>
                                      {}
                                      <div className="rounded-lg border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 shadow-sm dark:border-yellow-700 dark:from-yellow-900/20 dark:to-yellow-800/20">
                                        <div className="mb-2 flex items-center justify-between">
                                          <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                          <span className="text-xs font-semibold uppercase text-yellow-700 dark:text-yellow-300">
                                            Pending
                                          </span>
                                        </div>
                                        <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400 md:text-3xl">
                                          {typeof campaign.pending === "number"
                                            ? campaign.pending
                                            : 0}
                                        </p>
                                      </div>
                                      {}
                                      <div className="rounded-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4 shadow-sm dark:border-blue-700 dark:from-blue-900/20 dark:to-blue-800/20">
                                        <div className="mb-2 flex items-center justify-between">
                                          <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                          <span className="text-xs font-semibold uppercase text-blue-700 dark:text-blue-300">
                                            Cost
                                          </span>
                                        </div>
                                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-400 md:text-3xl">
                                          {typeof campaign.sms_cost === "number"
                                            ? campaign.sms_cost
                                            : 0}
                                        </p>
                                      </div>
                                    </div>
                                    {}
                                    {Array.isArray(stats.categories) &&
                                      stats.categories.length > 0 && (
                                        <div className="rounded-lg border-2 border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/50 md:p-6">
                                          <h4 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 md:text-sm">
                                            <TrendingUp className="h-4 w-4 text-brand-500" />
                                            Network Statistics
                                          </h4>
                                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-4">
                                            {(stats.categories as string[]).map(
                                              (category: string, idx: number) => {
                                                const contactsArray = stats.contacts as unknown[];
                                                const smsArray = stats.sms as unknown[];
                                                const costArray = stats.cost as unknown[];
                                                return (
                                                  <div
                                                    key={idx}
                                                    className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50"
                                                  >
                                                    <p className="mb-1 text-xs font-semibold text-gray-600 dark:text-gray-400">
                                                      {category}
                                                    </p>
                                                    <div className="space-y-1">
                                                      {contactsArray &&
                                                        contactsArray[idx] !== undefined && (
                                                          <p className="text-xs text-gray-700 dark:text-gray-300">
                                                            Contacts:{" "}
                                                            <span className="font-bold">
                                                              {String(contactsArray[idx])}
                                                            </span>
                                                          </p>
                                                        )}
                                                      {smsArray && smsArray[idx] !== undefined && (
                                                        <p className="text-xs text-gray-700 dark:text-gray-300">
                                                          SMS:{" "}
                                                          <span className="font-bold">
                                                            {String(smsArray[idx])}
                                                          </span>
                                                        </p>
                                                      )}
                                                      {costArray &&
                                                        costArray[idx] !== undefined && (
                                                          <p className="text-xs text-gray-700 dark:text-gray-300">
                                                            Cost:{" "}
                                                            <span className="font-bold">
                                                              {String(costArray[idx])}
                                                            </span>
                                                          </p>
                                                        )}
                                                    </div>
                                                  </div>
                                                );
                                              }
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    {}
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50 md:p-4">
                                        <p className="mb-1 text-xs font-semibold text-gray-600 dark:text-gray-400">
                                          Message Size
                                        </p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                          {typeof campaign.message_size === "number"
                                            ? campaign.message_size
                                            : 0}{" "}
                                          parts
                                        </p>
                                      </div>
                                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50 md:p-4">
                                        <p className="mb-1 text-xs font-semibold text-gray-600 dark:text-gray-400">
                                          Contact Type
                                        </p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                          {campaign.contact_type === 5
                                            ? "File Upload"
                                            : typeof campaign.contact_type === "number" ||
                                                typeof campaign.contact_type === "string"
                                              ? String(campaign.contact_type)
                                              : "N/A"}
                                        </p>
                                      </div>
                                    </div>
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
                  {pagination.total || 0} campaigns
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
