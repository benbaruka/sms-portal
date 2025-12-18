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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DatePicker } from "@/components/ui/date-picker";
import { Loader2, Send, CheckCircle2, AlertCircle, Clock, Calendar } from "lucide-react";
import { useAlert } from "@/context/AlertProvider";
import { useSendPromotionalSMS } from "@/controller/query/messages/useMessages";
import { useClientSenderIdsListForMessages } from "@/controller/query/senders/useSenders";
import { format } from "date-fns";
import { useMemo } from "react";

interface SendPromotionalFormProps {
  apiKey: string | null;
}

export default function SendPromotionalForm({ apiKey }: SendPromotionalFormProps) {
  const { showAlert } = useAlert();
  const [schedule, setSchedule] = useState(false);
  const [repeatType, setRepeatType] = useState("NO_REPEAT");
  const [formData, setFormData] = useState({
    msisdn: "",
    message: "",
    sender_id: "",
    callback_url: "",
    country_code: "CD",
    send_date: "",
    send_time: "",
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const sendPromotionalSMS = useSendPromotionalSMS();

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
    if (!formData.msisdn.trim()) {
      showAlert({
        variant: "error",
        title: "Error",
        message: "Phone number is required",
      });
      return;
    }

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

    if (schedule && ((!selectedDate && !formData.send_date) || !formData.send_time)) {
      showAlert({
        variant: "error",
        title: "Error",
        message: "Please provide schedule date and time",
      });
      return;
    }

    try {
      // Get date from selectedDate or formData.send_date
      const dateValue = selectedDate
        ? selectedDate.toISOString().split("T")[0]
        : formData.send_date;

      // Build request data (matching the provided payload structure)
      const requestData: {
        msisdn: string;
        message: string;
        sender_id: string;
        callback_url?: string;
        country_code: string;
        schedule: boolean;
        route: string;
        service: string;
        send_date?: string;
        send_time?: string;
      } = {
        msisdn: formData.msisdn.trim(),
        message: formData.message.trim(),
        sender_id: formData.sender_id.trim(),
        callback_url: formData.callback_url.trim() || undefined,
        country_code: formData.country_code || "KE",
        schedule: schedule ? true : false,
        route: "message/send/promotional",
        service: "sms",
      };

      // For scheduled messages, add all required fields
      if (schedule && dateValue && formData.send_time) {
        // Normalize send_time to HH:mm format (2 parts only, as per payload)
        let timeValue = formData.send_time.trim();
        const inputParts = timeValue
          .split(":")
          .filter((part) => part !== "" && part !== null && part !== undefined);

        let normalizedTime: string;
        if (inputParts.length >= 2) {
          // Take only first 2 parts (HH:mm)
          normalizedTime = `${String(inputParts[0]).padStart(2, "0")}:${String(inputParts[1]).padStart(2, "0")}`;
        } else if (inputParts.length === 1) {
          normalizedTime = `${String(inputParts[0]).padStart(2, "0")}:00`;
        } else {
          normalizedTime = "00:00";
        }

        // Generate campaign_name automatically (format: "SMS Created at 06 Nov 25 2:56 pm")
        const now = new Date();
        const campaignName = `SMS Created at ${format(now, "dd MMM yy h:mm a")}`;

        requestData.send_date = dateValue;
        requestData.send_time = normalizedTime; // Format: "HH:mm" (not "HH:mm:ss")
        requestData.date = dateValue; // Same as send_date
        requestData.repeat_type = repeatType;
        requestData.campaign_name = campaignName;
      }

      await sendPromotionalSMS.mutateAsync({
        data: requestData,
        apiKey,
      });

      // Reset form on success
      setFormData({
        msisdn: "",
        message: "",
        sender_id: "",
        callback_url: "",
        country_code: "CD",
        send_date: "",
        send_time: "",
      });
      setSelectedDate(undefined);
      setSchedule(false);
    } catch (error) {
      // Error is already handled by the hook
    }
  };

  return (
    <Card className="border-border/50 dark:border-border/30 bg-card border-2 shadow-xl transition-all duration-300 hover:shadow-2xl dark:bg-gray-900/50">
      <CardHeader className="border-border/50 dark:border-border/30 border-b-2 bg-gradient-to-r from-blue-light-50/50 to-brand-50/50 px-6 py-6 dark:from-blue-light-950/30 dark:to-brand-950/30">
        <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900 dark:text-white">
          <Send className="h-5 w-5 text-blue-light-500" />
          Promotional SMS Form
        </CardTitle>
        <CardDescription className="mt-2 text-gray-600 dark:text-gray-400">
          Fill in the details to send a promotional SMS message
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Label
                htmlFor="msisdn"
                className="text-sm font-semibold text-gray-900 dark:text-white"
              >
                Phone Number (MSISDN) *
              </Label>
              <Input
                id="msisdn"
                placeholder="+243974096458"
                value={formData.msisdn}
                onChange={(e) => setFormData({ ...formData, msisdn: e.target.value })}
                required
                className="border-border/50 h-12 border-2 focus:border-blue-light-500 focus:ring-2 focus:ring-blue-light-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-light-500"
              />
            </div>

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
                    className="border-border/50 h-12 w-full border-2 focus:border-blue-light-500 focus:ring-2 focus:ring-blue-light-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-light-500"
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
                htmlFor="country_code"
                className="text-sm font-semibold text-gray-900 dark:text-white"
              >
                Country Code
              </Label>
              <Select
                value={formData.country_code}
                onValueChange={(value) => setFormData({ ...formData, country_code: value })}
              >
                <SelectTrigger
                  id="country_code"
                  className="border-border/50 h-12 border-2 focus:border-blue-light-500 focus:ring-2 focus:ring-blue-light-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-light-500"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CD">CD (Congo)</SelectItem>
                  <SelectItem value="KE">KE (Kenya)</SelectItem>
                  <SelectItem value="UG">UG (Uganda)</SelectItem>
                  <SelectItem value="TZ">TZ (Tanzania)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="callback_url"
                className="text-sm font-semibold text-gray-900 dark:text-white"
              >
                Callback URL (Optional)
              </Label>
              <Input
                id="callback_url"
                type="url"
                placeholder="https://yourapp.com/callback"
                value={formData.callback_url}
                onChange={(e) => setFormData({ ...formData, callback_url: e.target.value })}
                className="border-border/50 h-12 border-2 focus:border-blue-light-500 focus:ring-2 focus:ring-blue-light-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-light-500"
              />
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
              placeholder="Special offer: 50% off on all products!"
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              maxLength={160}
              className="border-border/50 resize-none border-2 focus:border-blue-light-500 focus:ring-2 focus:ring-blue-light-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-light-500"
            />
            <p className="text-muted-foreground text-xs dark:text-gray-400">
              {formData.message.length}/160 characters{" "}
              {formData.message.length > 160 ? "(SMS will be split)" : ""}
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
            <div className="space-y-6 rounded-xl border-2 border-blue-light-200/50 bg-gradient-to-r from-blue-light-50/50 to-brand-50/50 p-8 shadow-lg dark:border-blue-light-800/50 dark:from-blue-light-950/30 dark:to-brand-950/30">
              <div className="mb-4 flex items-center gap-3">
                <Clock className="h-6 w-6 text-blue-light-500" />
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
                    className="border-border/50 h-12 border-2 focus:border-blue-light-500 focus:ring-2 focus:ring-blue-light-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-light-500"
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
                    <Calendar className="h-4 w-4 text-blue-light-500" />
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
                    <Clock className="h-4 w-4 text-blue-light-500" />
                    Schedule Time *
                  </Label>
                  <Input
                    id="send_time"
                    type="time"
                    value={formData.send_time}
                    onChange={(e) => {
                      // Normalize time immediately on input change
                      let timeValue = e.target.value.trim();
                      const parts = timeValue
                        .split(":")
                        .filter((p) => p !== "" && p !== null && p !== undefined);

                      // Force to exactly HH:mm format (input type="time" returns HH:mm)
                      if (parts.length >= 2) {
                        timeValue = `${String(parts[0]).padStart(2, "0")}:${String(parts[1]).padStart(2, "0")}`;
                      } else if (parts.length === 1) {
                        timeValue = `${String(parts[0]).padStart(2, "0")}:00`;
                      } else {
                        timeValue = "00:00";
                      }

                      setFormData({ ...formData, send_time: timeValue });
                    }}
                    required={schedule}
                    step="1"
                    className="border-border/50 h-12 rounded-lg border-2 bg-white text-gray-900 focus:border-blue-light-500 focus:ring-2 focus:ring-blue-light-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-light-500"
                  />
                </div>
              </div>
              {(selectedDate || formData.send_date) && formData.send_time && (
                <div className="mt-4 rounded-lg border-2 border-blue-light-200/50 bg-blue-light-100/50 p-4 shadow-sm dark:border-blue-light-800/50 dark:bg-blue-light-900/30">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Scheduled for:
                    </span>{" "}
                    {new Date(
                      `${selectedDate ? selectedDate.toISOString().split("T")[0] : formData.send_date}T${formData.send_time}`
                    ).toLocaleString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="border-border/50 dark:border-border/30 mt-6 flex items-center justify-end gap-4 border-t-2 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData({
                  msisdn: "",
                  message: "",
                  sender_id: "",
                  callback_url: "",
                  country_code: "CD",
                  send_date: "",
                  send_time: "",
                });
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
              disabled={sendPromotionalSMS.isPending || !apiKey}
              className={`h-11 px-8 font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 ${
                schedule
                  ? "bg-gradient-to-r from-warning-500 to-warning-600 hover:from-warning-600 hover:to-warning-700"
                  : "bg-gradient-to-r from-blue-light-500 to-blue-light-600 hover:from-blue-light-600 hover:to-blue-light-700"
              }`}
            >
              {sendPromotionalSMS.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {schedule ? "Scheduling..." : "Sending..."}
                </>
              ) : (
                <>
                  {schedule ? (
                    <Clock className="mr-2 h-4 w-4" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  {schedule ? "Schedule SMS" : "Send SMS"}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
