"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  FileText,
  RefreshCw,
  Download,
  BarChart3,
  Calendar,
  Network,
  Send,
} from "lucide-react";
import { useAlert } from "@/context/AlertProvider";
import { exportReportToPDF } from "@/utils/exportPDF";
import { useClientReports } from "@/controller/query/dashboard/useDashboard";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Label } from "@/components/ui/label";
import { endOfDay, format, startOfDay, startOfMonth, startOfYear, subDays } from "date-fns";

type DateRangePreset = "today" | "week" | "month" | "year" | "custom";
type ReportView = "network" | "sender";

const DEFAULT_RANGE: DateRangePreset = "week";

export default function TransactionalReport() {
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [apiKey, setApiKey] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRangePreset>(DEFAULT_RANGE);
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
  const [reportView, setReportView] = useState<ReportView>("network");

  const clientId = user?.message?.client?.id;

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const getDateRange = useMemo(() => {
    const today = endOfDay(new Date());
    let start: Date = startOfDay(today);
    let end: Date = today;

    switch (dateRange) {
      case "today":
        start = startOfDay(today);
        break;
      case "week":
        start = startOfDay(subDays(today, 7));
        break;
      case "month":
        start = startOfMonth(today);
        break;
      case "year":
        start = startOfYear(today);
        break;
      case "custom":
        if (customStartDate) {
          start = startOfDay(customStartDate);
        }
        if (customEndDate) {
          end = endOfDay(customEndDate);
        }
        break;
      default:
        start = startOfDay(subDays(today, 7));
    }

    return {
      id: clientId,
      start: format(start, "yyyy-MM-dd"),
      end: format(end, "yyyy-MM-dd"),
    };
  }, [clientId, customEndDate, customStartDate, dateRange]);

  const dateRangeLabel = useMemo(() => {
    if (dateRange === "custom" && customStartDate && customEndDate) {
      return `${format(customStartDate, "yyyy-MM-dd")} to ${format(customEndDate, "yyyy-MM-dd")}`;
    }
    switch (dateRange) {
      case "today":
        return "Today";
      case "week":
        return "Last 7 Days";
      case "month":
        return "Last 30 Days";
      case "year":
        return "This Year";
      default:
        return "";
    }
  }, [customEndDate, customStartDate, dateRange]);

  const reportType = reportView === "network" ? "connector" : "sender";

  const {
    data: reportsData,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useClientReports(reportType, getDateRange, apiKey, !!apiKey && !!clientId);

  const currentReportData = useMemo(() => {
    if (!reportsData?.message || !Array.isArray(reportsData.message)) {
      return [];
    }
    return reportsData.message;
  }, [reportsData]);

  const totalSent = useMemo(
    () => currentReportData.reduce((sum, item) => sum + (item.sent || 0), 0),
    [currentReportData]
  );
  const totalDelivered = useMemo(
    () => currentReportData.reduce((sum, item) => sum + (item.delivered || 0), 0),
    [currentReportData]
  );
  const totalFailed = useMemo(
    () => currentReportData.reduce((sum, item) => sum + (item.failed || 0), 0),
    [currentReportData]
  );
  const totalPending = useMemo(
    () => currentReportData.reduce((sum, item) => sum + (item.pending || 0), 0),
    [currentReportData]
  );

  const successRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(2) : "--";

  const handleRefresh = useCallback(async () => {
    try {
      await refetch();
      showAlert({
        variant: "success",
        title: "Success",
        message: "Report refreshed successfully!",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to refresh report";
      showAlert({
        variant: "error",
        title: "Error",
        message,
      });
    }
  }, [refetch, showAlert]);

  const handleExport = useCallback(() => {
    if (!currentReportData.length) {
      showAlert({
        variant: "warning",
        title: "No Data",
        message: "No data available to export.",
      });
      return;
    }

    try {
      exportReportToPDF({
        title: "Transactional SMS Report",
        reportType: reportView,
        dateRange,
        startDate: getDateRange.start,
        endDate: getDateRange.end,
        summaryStats: {
          totalSent,
          totalDelivered,
          totalFailed,
          totalPending,
        },
        reportData: currentReportData,
        pageColor: "#3b82f6",
      });

      showAlert({
        variant: "success",
        title: "Success",
        message: "Report exported to PDF successfully!",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to export report to PDF.";
      showAlert({
        variant: "error",
        title: "Error",
        message,
      });
    }
  }, [
    currentReportData,
    dateRange,
    getDateRange,
    reportView,
    showAlert,
    totalDelivered,
    totalFailed,
    totalPending,
    totalSent,
  ]);

  const handleDateRangeChange = useCallback((value: DateRangePreset) => {
    setDateRange(value);
    if (value !== "custom") {
      setCustomStartDate(undefined);
      setCustomEndDate(undefined);
    }
  }, []);

  const handleReportViewChange = useCallback((view: ReportView) => {
    setReportView(view);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
              {totalSent.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Delivered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 md:text-3xl">
              {totalDelivered.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400 md:text-3xl">
              {totalFailed.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 md:text-3xl">
              {successRate === "--" ? "--" : `${successRate}%`}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:gap-3 sm:text-xl">
                <FileText className="h-4 w-4 text-blue-500 sm:h-5 sm:w-5" />
                {reportView === "network"
                  ? "Transactional SMS by Network"
                  : "Transactional SMS by Sender ID"}
              </CardTitle>
              <CardDescription className="mt-1 text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                Detailed SMS statistics grouped by{" "}
                {reportView === "network" ? "network connector" : "sender ID"}
              </CardDescription>
            </div>
            <div className="text-muted-foreground flex items-center gap-2 text-xs dark:text-gray-400 sm:text-sm">
              <Calendar className="h-4 w-4" />
              <span>{dateRangeLabel}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 rounded-xl border border-blue-200/60 bg-white/80 px-2 py-1 shadow-sm dark:border-blue-800/60 dark:bg-gray-900/60 sm:px-3 sm:py-1.5">
              <Button
                variant={reportView === "network" ? "default" : "ghost"}
                size="sm"
                className={`flex h-9 items-center gap-2 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm ${
                  reportView === "network"
                    ? "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
                onClick={() => handleReportViewChange("network")}
              >
                <Network className="h-3 w-3 sm:h-4 sm:w-4" />
                Network
              </Button>
              <Button
                variant={reportView === "sender" ? "default" : "ghost"}
                size="sm"
                className={`flex h-9 items-center gap-2 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm ${
                  reportView === "sender"
                    ? "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
                onClick={() => handleReportViewChange("sender")}
              >
                <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                Sender ID
              </Button>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <Select
                value={dateRange}
                onValueChange={(value) => handleDateRangeChange(value as DateRangePreset)}
              >
                <SelectTrigger className="border-border/50 h-9 w-full rounded-xl border-2 text-xs dark:border-gray-700 sm:h-10 sm:w-[180px] sm:text-sm">
                  <SelectValue placeholder="Date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Date</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button
                  onClick={handleRefresh}
                  disabled={isLoading || isFetching || !apiKey || !clientId}
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-xl border-2 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm"
                >
                  {isLoading || isFetching ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin sm:h-4 sm:w-4" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Refresh
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={!currentReportData.length || isLoading || isFetching}
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-xl border-2 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm"
                >
                  <Download className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {dateRange === "custom" && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/40 sm:p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-end">
                <div className="flex-1">
                  <Label className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 sm:text-sm">
                    <Calendar className="h-3 w-3 text-blue-500 sm:h-4 sm:w-4" />
                    Select Date Range
                  </Label>
                  <DateRangePicker
                    startDate={customStartDate}
                    endDate={customEndDate}
                    onChange={(start, end) => {
                      setCustomStartDate(start);
                      setCustomEndDate(end);
                    }}
                    placeholder="Click to choose a start and end date"
                    className="w-full"
                    minDate={new Date(2020, 0, 1)}
                    maxDate={new Date()}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleDateRangeChange("week");
                    setCustomStartDate(undefined);
                    setCustomEndDate(undefined);
                  }}
                  className="h-9 rounded-xl border-2 text-xs sm:h-10 sm:text-sm"
                >
                  Clear
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 className="mb-4 h-8 w-8 animate-spin text-blue-500" />
              <p className="text-muted-foreground text-sm">Loading report data...</p>
            </div>
          )}

          {isError && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BarChart3 className="mb-4 h-10 w-10 text-red-500" />
              <p className="text-muted-foreground text-sm">
                Unable to load report data. Please try again later.
              </p>
              <Button onClick={handleRefresh} className="mt-4" variant="outline">
                Retry
              </Button>
            </div>
          )}

          {!isLoading && !isError && currentReportData.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BarChart3 className="text-muted-foreground mb-4 h-10 w-10 dark:text-gray-400" />
              <p className="text-muted-foreground text-sm dark:text-gray-400">
                No report data available for the selected date range.
              </p>
            </div>
          )}

          {!isLoading && !isError && currentReportData.length > 0 && (
            <div className="border-border/50 overflow-hidden rounded-lg border-2 dark:border-gray-700">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                    <TableHead className="font-semibold text-gray-900 dark:text-white">
                      {reportView === "network" ? "Connector" : "Sender ID"}
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-white">
                      Sent
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-white">
                      Delivered
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-white">
                      Failed
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-white">
                      Pending
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-white">
                      % DLR
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentReportData.map((item, index) => {
                    const total = item.sent || 0;
                    const delivered = item.delivered || 0;
                    const deliveryRate =
                      total > 0 && isFinite(delivered / total)
                        ? ((delivered / total) * 100).toFixed(2)
                        : "--";
                    const identifier =
                      reportView === "network" ? item.connector_name : item.sender_id;
                    const displayIdentifier = identifier ?? "N/A";

                    return (
                      <TableRow
                        key={`${displayIdentifier}-${index}`}
                        className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <TableCell className="font-medium text-gray-900 dark:text-white">
                          {displayIdentifier}
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">
                          {total.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="default"
                            className="bg-green-500 text-white hover:bg-green-600"
                          >
                            {(item.delivered || 0).toLocaleString()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="destructive"
                            className="bg-red-500 text-white hover:bg-red-600"
                          >
                            {(item.failed || 0).toLocaleString()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{(item.pending || 0).toLocaleString()}</Badge>
                        </TableCell>
                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                          {deliveryRate === "--" ? "--" : `${deliveryRate}%`}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
