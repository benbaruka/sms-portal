"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Send,
  AlertCircle,
  Upload,
  FileText,
  Download,
  Clock,
  Calendar,
} from "lucide-react";
import { useAlert } from "@/context/AlertProvider";
import {
  useSendBulkMsisdnSMS,
  useSendUploadFileSMS,
} from "@/controller/query/messages/useMessages";
import { useClientSenderIdsListForMessages } from "@/controller/query/senders/useSenders";
import { format } from "date-fns";
import { useMemo } from "react";

interface SendBulkFormProps {
  apiKey: string | null;
}

export default function SendBulkForm({ apiKey }: SendBulkFormProps) {
  const { showAlert } = useAlert();
  const [uploadMethod, setUploadMethod] = useState<"list" | "file">("list");
  const [schedule, setSchedule] = useState(false);
  const [repeatType, setRepeatType] = useState("NO_REPEAT");
  const [formData, setFormData] = useState({
    msisdn_list: "",
    message: "",
    sender_id: "",
    campaign_name: "",
    send_date: "",
    send_time: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const sendBulkMsisdnSMS = useSendBulkMsisdnSMS();
  const sendUploadFileSMS = useSendUploadFileSMS();

  // Fetch sender IDs list
  const { data: senderIdsData, isLoading: isLoadingSenderIds } = useClientSenderIdsListForMessages(
    {},
    apiKey,
    !!apiKey
  );

  // Extract sender IDs from response
  const senderIds = useMemo(() => {
    if (!senderIdsData?.message && !senderIdsData?.data) return [];
    const list = senderIdsData.message || senderIdsData.data || [];
    return Array.isArray(list) ? list : [];
  }, [senderIdsData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        showAlert({
          variant: "error",
          title: "Error",
          message: "Please upload a CSV file",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) {
      showAlert({
        variant: "error",
        title: "Error",
        message: "API Key is required",
      });
      return;
    }

    // Validate required fields
    if (!formData.message.trim()) {
      showAlert({
        variant: "error",
        title: "Error",
        message: "Message is required",
      });
      return;
    }

    if (!formData.sender_id.trim()) {
      showAlert({
        variant: "error",
        title: "Error",
        message: "Sender ID is required",
      });
      return;
    }

    // Validate schedule fields if schedule is enabled
    if (schedule && ((!selectedDate && !formData.send_date) || !formData.send_time)) {
      showAlert({
        variant: "error",
        title: "Error",
        message: "Please provide schedule date and time",
      });
      return;
    }

    // Generate campaign_name if not provided (as per sms-portal-ui)
    let campaignName = formData.campaign_name.trim();
    if (!campaignName) {
      campaignName = `Bulk SMS Created at ${new Date().toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}`;
    }

    // Get date from selectedDate or formData.send_date
    const dateValue = selectedDate ? selectedDate.toISOString().split("T")[0] : formData.send_date;

    if (uploadMethod === "list") {
      if (!formData.msisdn_list.trim()) {
        showAlert({
          variant: "error",
          title: "Error",
          message: "Please provide MSISDN list",
        });
        return;
      }

      try {
        // Convert comma-separated string to array and clean up
        const msisdnArray = formData.msisdn_list
          .split(",")
          .map((msisdn) => msisdn.trim())
          .filter((msisdn) => msisdn.length > 0);

        if (msisdnArray.length === 0) {
          showAlert({
            variant: "error",
            title: "Error",
            message: "Please provide at least one valid MSISDN number",
          });
          return;
        }

        // Build request data
        const requestData: {
          msisdn_list: string[];
          message: string;
          sender_id: string;
          campaign_name: string;
          schedule: boolean;
          route: string;
          service: string;
          send_date?: string;
          send_time?: string;
        } = {
          msisdn_list: msisdnArray,
          message: formData.message.trim(),
          sender_id: formData.sender_id.trim(),
          campaign_name: campaignName,
          schedule: schedule ? true : false,
          route: "message/send/bulk-msisdn",
          service: "sms",
        };

        // For scheduled messages, add all required fields
        if (schedule && dateValue && formData.send_time) {
          // Normalize send_time to HH:mm format
          let timeValue = formData.send_time.trim();
          const inputParts = timeValue
            .split(":")
            .filter((part) => part !== "" && part !== null && part !== undefined);

          let normalizedTime: string;
          if (inputParts.length >= 2) {
            normalizedTime = `${String(inputParts[0]).padStart(2, "0")}:${String(inputParts[1]).padStart(2, "0")}`;
          } else if (inputParts.length === 1) {
            normalizedTime = `${String(inputParts[0]).padStart(2, "0")}:00`;
          } else {
            normalizedTime = "00:00";
          }

          requestData.send_date = dateValue;
          requestData.send_time = normalizedTime;
          requestData.date = dateValue;
          requestData.repeat_type = repeatType;
        }

        await sendBulkMsisdnSMS.mutateAsync({
          data: requestData,
          apiKey,
        });

        // Reset form on success
        setFormData({
          msisdn_list: "",
          message: "",
          sender_id: "",
          campaign_name: "",
          send_date: "",
          send_time: "",
        });
        setSelectedDate(undefined);
        setSchedule(false);
        setRepeatType("NO_REPEAT");
      } catch (error) {
        // Error is already handled by the hook
      }
    } else {
      // File upload method
      if (!selectedFile) {
        showAlert({
          variant: "error",
          title: "Error",
          message: "Please upload a CSV file",
        });
        return;
      }

      try {
        // Build request data
        const requestData: {
          file: File;
          message: string;
          sender_id: string;
          campaign_name: string;
          route: string;
          service: string;
          schedule: boolean;
          send_date?: string;
          send_time?: string;
        } = {
          file: selectedFile,
          message: formData.message.trim(),
          sender_id: formData.sender_id.trim(),
          campaign_name: campaignName,
          route: "message/send/upload-file",
          service: "sms",
          schedule: schedule ? true : false,
        };

        // For scheduled messages, add all required fields
        if (schedule && dateValue && formData.send_time) {
          // Normalize send_time to HH:mm format
          let timeValue = formData.send_time.trim();
          const inputParts = timeValue
            .split(":")
            .filter((part) => part !== "" && part !== null && part !== undefined);

          let normalizedTime: string;
          if (inputParts.length >= 2) {
            normalizedTime = `${String(inputParts[0]).padStart(2, "0")}:${String(inputParts[1]).padStart(2, "0")}`;
          } else if (inputParts.length === 1) {
            normalizedTime = `${String(inputParts[0]).padStart(2, "0")}:00`;
          } else {
            normalizedTime = "00:00";
          }

          requestData.send_date = dateValue;
          requestData.send_time = normalizedTime;
          requestData.date = dateValue;
          requestData.repeat_type = repeatType;
        }

        await sendUploadFileSMS.mutateAsync({
          data: requestData,
          apiKey,
        });

        // Reset form on success
        setFormData({
          msisdn_list: "",
          message: "",
          sender_id: "",
          campaign_name: "",
          send_date: "",
          send_time: "",
        });
        setSelectedFile(null);
        setSelectedDate(undefined);
        setSchedule(false);
        setRepeatType("NO_REPEAT");
      } catch (error) {
        // Error is already handled by the hook
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Send Bulk SMS
        </h1>
        <p className="text-muted-foreground mt-2 dark:text-gray-400">
          Send SMS to multiple recipients via list or file upload
        </p>
      </div>

      <Card className="border-border/50 dark:border-border/30 bg-card border-2 shadow-xl transition-all duration-300 hover:shadow-2xl dark:bg-gray-900/50">
        <CardHeader className="border-border/50 dark:border-border/30 border-b-2 bg-success-50 px-6 py-6 dark:bg-success-950/30">
          <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900 dark:text-white">
            <Send className="h-5 w-5 text-success-500" />
            Bulk SMS Form
          </CardTitle>
          <CardDescription className="mt-2 text-gray-600 dark:text-gray-400">
            Choose upload method and fill in the details
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex gap-4">
              <Button
                type="button"
                variant={uploadMethod === "list" ? "default" : "outline"}
                onClick={() => setUploadMethod("list")}
                className={
                  uploadMethod === "list"
                    ? "bg-success-500 text-white shadow-md hover:bg-success-600"
                    : "text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800"
                }
              >
                MSISDN List
              </Button>
              <Button
                type="button"
                variant={uploadMethod === "file" ? "default" : "outline"}
                onClick={() => setUploadMethod("file")}
                className={
                  uploadMethod === "file"
                    ? "bg-success-500 text-white shadow-md hover:bg-success-600"
                    : "text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800"
                }
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload CSV File
              </Button>
            </div>

            {uploadMethod === "list" ? (
              <div className="space-y-3">
                <Label
                  htmlFor="msisdn_list"
                  className="text-sm font-semibold text-gray-900 dark:text-white"
                >
                  MSISDN List *
                </Label>
                <Textarea
                  id="msisdn_list"
                  placeholder="254712345678,254723456789,254734567890"
                  rows={5}
                  value={formData.msisdn_list}
                  onChange={(e) => setFormData({ ...formData, msisdn_list: e.target.value })}
                  required
                  className="border-border/50 resize-none border-2 focus:border-success-500 focus:ring-2 focus:ring-success-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-success-500"
                />
                <p className="text-muted-foreground text-xs dark:text-gray-400">
                  Separate phone numbers with commas (include country code)
                </p>
              </div>
            ) : (
              <div className="space-y-5 rounded-xl border-2 border-success-300/60 bg-gradient-to-br from-success-50 via-green-50/80 to-emerald-50/60 p-6 shadow-xl dark:border-success-700/60 dark:from-success-950/40 dark:via-green-950/30 dark:to-emerald-950/20">
                <div className="mb-5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-success-500/10 p-2.5 dark:bg-success-500/20">
                      <Upload className="h-5 w-5 text-success-600 dark:text-success-400" />
                    </div>
                    <div>
                      <Label
                        htmlFor="file"
                        className="text-base font-bold text-gray-900 dark:text-white"
                      >
                        CSV File Upload *
                      </Label>
                      <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                        Upload your contacts file
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Create CSV template with phone column including country code
                      const csvContent = "phone\n254700000000\n254711111111\n254722222222";
                      const blob = new Blob([csvContent], { type: "text/csv" });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "bulk_sms_template.csv";
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      window.URL.revokeObjectURL(url);
                    }}
                    className="h-10 border-2 border-success-400 px-5 font-semibold text-success-700 shadow-md transition-all duration-200 hover:bg-success-100 hover:shadow-lg dark:border-success-600 dark:text-success-300 dark:hover:bg-success-900/40"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Template
                  </Button>
                </div>

                <div className="flex flex-col items-stretch gap-3 rounded-lg border-2 border-success-200 bg-white/80 p-4 shadow-inner dark:border-success-800 dark:bg-gray-800/60 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <Input
                      id="file"
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="h-11 cursor-pointer border-2 border-success-300 font-medium focus:border-success-500 focus:ring-2 focus:ring-success-500/30 dark:border-success-700 dark:bg-gray-800 dark:text-white dark:focus:border-success-500"
                    />
                  </div>
                  {selectedFile && (
                    <div className="flex items-center gap-2.5 rounded-lg border border-success-300 bg-success-100/80 px-4 py-2.5 dark:border-success-700 dark:bg-success-900/30">
                      <FileText className="h-4 w-4 text-success-700 dark:text-success-300" />
                      <span className="text-sm font-semibold text-success-700 dark:text-success-300">
                        {selectedFile.name}
                      </span>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border-2 border-success-200 bg-white p-5 shadow-lg dark:border-success-800 dark:bg-gray-800/70">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-5 w-1 rounded-full bg-success-500"></div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      CSV File Format
                    </p>
                  </div>
                  <div className="mb-4 space-y-2.5 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 font-bold text-success-600 dark:text-success-400">
                        •
                      </span>
                      <p>
                        Required column:{" "}
                        <code className="font-mono rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          phone
                        </code>
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 font-bold text-success-600 dark:text-success-400">
                        •
                      </span>
                      <p>One phone number per line</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 font-bold text-success-600 dark:text-success-400">
                        •
                      </span>
                      <p>
                        Format:{" "}
                        <code className="font-mono rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          254700000000
                        </code>{" "}
                        (with country code)
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 border-t-2 border-success-200 pt-4 dark:border-success-700">
                    <p className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                      <FileText className="h-4 w-4 text-success-600 dark:text-success-400" />
                      Example CSV:
                    </p>
                    <div className="rounded-lg border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-4 shadow-inner dark:border-gray-700 dark:from-gray-900 dark:to-gray-800">
                      <pre className="font-mono overflow-x-auto text-xs leading-relaxed text-gray-800 dark:text-gray-200">
                        {`phone
254700000000
254711111111
254722222222`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <Label
                  htmlFor="sender_id"
                  className="text-sm font-semibold text-gray-900 dark:text-white"
                >
                  Sender ID *
                </Label>
                {isLoadingSenderIds ? (
                  <div className="border-border/50 bg-muted/50 flex h-12 items-center gap-2 rounded-lg border-2 px-4 dark:border-gray-700 dark:bg-gray-800">
                    <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
                    <span className="text-muted-foreground text-sm dark:text-gray-400">
                      Loading sender IDs...
                    </span>
                  </div>
                ) : (
                  <Select
                    value={formData.sender_id}
                    onValueChange={(value) => setFormData({ ...formData, sender_id: value })}
                    required
                  >
                    <SelectTrigger
                      id="sender_id"
                      className="border-border/50 h-12 w-full border-2 focus:border-success-500 focus:ring-2 focus:ring-success-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-success-500"
                    >
                      <SelectValue placeholder="Select Sender ID" />
                    </SelectTrigger>
                    <SelectContent>
                      {senderIds.length > 0 ? (
                        senderIds.map(
                          (sender: {
                            code?: string;
                            sender_id?: string;
                            id?: string | number;
                            carrier_name?: string;
                            connector_name?: string;
                            connectors?: Array<{ id?: number; name?: string }>;
                            [key: string]: unknown;
                          }) => {
                            const senderIdCode = (sender.code || sender.sender_id || "").toString();
                            const senderIdValue = senderIdCode; // Use code (name) as value, not ID
                            const carrierName =
                              sender.carrier_name ||
                              sender.connector_name ||
                              sender.connectors?.[0]?.name ||
                              "";
                            return (
                              <SelectItem key={String(sender.id ?? "")} value={senderIdValue}>
                                {senderIdCode}
                                {carrierName ? ` - ${carrierName}` : ""}
                              </SelectItem>
                            );
                          }
                        )
                      ) : (
                        <SelectItem value="no-senders" disabled>
                          No sender IDs available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
                {senderIds.length === 0 && !isLoadingSenderIds && (
                  <p className="text-xs text-warning-500">
                    No sender IDs found. Please create a sender ID first.
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="campaign_name"
                  className="text-sm font-semibold text-gray-900 dark:text-white"
                >
                  Campaign Name (Optional)
                </Label>
                <Input
                  id="campaign_name"
                  placeholder="Campaign 2025 (auto-generated if empty)"
                  value={formData.campaign_name}
                  onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
                  className="border-border/50 h-12 border-2 focus:border-success-500 focus:ring-2 focus:ring-success-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-success-500"
                />
                <p className="text-muted-foreground text-xs dark:text-gray-400">
                  Leave empty to auto-generate a campaign name
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="message"
                className="text-sm font-semibold text-gray-900 dark:text-white"
              >
                Message *
              </Label>
              <Textarea
                id="message"
                placeholder="Hello! Thank you for your purchase!"
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                className="border-border/50 resize-none border-2 focus:border-theme-purple-500 focus:ring-2 focus:ring-theme-purple-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-theme-purple-500"
              />
              <p className="text-muted-foreground text-xs dark:text-gray-400">
                Enter your message. The same message will be sent to all recipients in the CSV file.
              </p>
            </div>

            <div className="border-border/50 flex items-center space-x-3 rounded-lg border bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <Checkbox
                id="schedule"
                checked={schedule}
                onCheckedChange={(checked) => setSchedule(checked as boolean)}
              />
              <Label
                htmlFor="schedule"
                className="cursor-pointer text-sm font-semibold leading-none text-gray-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-white"
              >
                Schedule this message
              </Label>
            </div>

            {schedule && (
              <div className="space-y-6 rounded-xl border-2 border-success-200/50 bg-gradient-to-r from-success-50/50 to-green-50/50 p-8 shadow-lg dark:border-success-800/50 dark:from-success-950/30 dark:to-green-950/30">
                <div className="mb-4 flex items-center gap-3">
                  <Clock className="h-6 w-6 text-success-500" />
                  <Label className="text-lg font-semibold text-gray-900 dark:text-white">
                    Schedule Date & Time
                  </Label>
                </div>
                <div className="space-y-3">
                  <Label
                    htmlFor="repeat_type"
                    className="text-sm font-semibold text-gray-900 dark:text-white"
                  >
                    Repeat Type *
                  </Label>
                  <Select value={repeatType} onValueChange={setRepeatType}>
                    <SelectTrigger
                      id="repeat_type"
                      className="border-border/50 h-12 border-2 focus:border-success-500 focus:ring-2 focus:ring-success-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-success-500"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NO_REPEAT">Send Only Once</SelectItem>
                      <SelectItem value="EVERY_DAY">Repeat Every Day</SelectItem>
                      <SelectItem value="EVERY_WEEK">Repeat Every Week</SelectItem>
                      <SelectItem value="EVERY_MONTH">Repeat Every Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <Label
                      htmlFor="send_date"
                      className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      <Calendar className="h-4 w-4 text-success-500" />
                      Schedule Date *
                    </Label>
                    <DatePicker
                      value={selectedDate}
                      onChange={(date) => {
                        setSelectedDate(date);
                        if (date) {
                          setFormData({ ...formData, send_date: date.toISOString().split("T")[0] });
                        } else {
                          setFormData({ ...formData, send_date: "" });
                        }
                      }}
                      placeholder="Pick a date"
                      disabled={!schedule}
                      minDate={new Date()}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label
                      htmlFor="send_time"
                      className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      <Clock className="h-4 w-4 text-success-500" />
                      Schedule Time *
                    </Label>
                    <Input
                      id="send_time"
                      type="time"
                      placeholder="HH:mm"
                      value={formData.send_time}
                      onChange={(e) => setFormData({ ...formData, send_time: e.target.value })}
                      required={schedule}
                      disabled={!schedule}
                      className="border-border/50 h-12 border-2 focus:border-success-500 focus:ring-2 focus:ring-success-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-success-500"
                    />
                    <p className="text-muted-foreground text-xs dark:text-gray-400">
                      Format: HH:mm (24-hour format)
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="border-border/50 dark:border-border/30 mt-6 flex items-center justify-end gap-4 border-t-2 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData({
                    msisdn_list: "",
                    message: "",
                    sender_id: "",
                    campaign_name: "",
                    send_date: "",
                    send_time: "",
                  });
                  setSelectedFile(null);
                  setSelectedDate(undefined);
                  setSchedule(false);
                  setRepeatType("NO_REPEAT");
                }}
                className="border-border/50 h-11 border-2 px-6 hover:bg-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800"
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={
                  (uploadMethod === "list"
                    ? sendBulkMsisdnSMS.isPending
                    : sendUploadFileSMS.isPending) || !apiKey
                }
                className="!h-11 !bg-success-500 !px-8 !font-semibold !text-white !shadow-lg transition-all duration-200 hover:!bg-success-600 hover:!shadow-xl disabled:!cursor-not-allowed disabled:!opacity-50 [&_*]:!text-white"
              >
                {(uploadMethod === "list" && sendBulkMsisdnSMS.isPending) ||
                (uploadMethod === "file" && sendUploadFileSMS.isPending) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin !text-white" />
                    <span className="!text-white">Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4 !text-white" />
                    <span className="!text-white">Send Bulk SMS</span>
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
