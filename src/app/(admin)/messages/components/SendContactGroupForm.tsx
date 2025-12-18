"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
import { Loader2, Send, Users, Clock, Calendar } from "lucide-react";
import { useAlert } from "@/context/AlertProvider";
import { useSendContactGroupSMS } from "@/controller/query/messages/useMessages";
import { useClientSenderIdsListForMessages } from "@/controller/query/senders/useSenders";
import { useContactGroupsSimple } from "@/controller/query/contacts/useContacts";
import { useQueryClient } from "@tanstack/react-query";

interface SendContactGroupFormProps {
  apiKey: string | null;
}

export default function SendContactGroupForm({ apiKey }: SendContactGroupFormProps) {
  const { showAlert } = useAlert();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [isCustom, setIsCustom] = useState(false);
  const [schedule, setSchedule] = useState(false);
  const [repeatType, setRepeatType] = useState("NO_REPEAT");
  const [formData, setFormData] = useState({
    contact_group_id: "",
    message: "",
    sender_id: "",
    campaign_name: "",
    sms_type: "PLAIN",
    send_date: "",
    send_time: "",
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const sendContactGroupSMS = useSendContactGroupSMS();

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

  // Fetch contact groups list
  const { data: contactGroupsData, isLoading: isLoadingContactGroups } = useContactGroupsSimple(
    apiKey,
    !!apiKey
  );

  // Extract contact groups from response
  const contactGroups = useMemo(() => {
    if (!contactGroupsData?.message) return [];
    const list = contactGroupsData.message || [];
    return Array.isArray(list)
      ? list.map(
          (group: {
            id?: string | number;
            name?: string;
            contacts?: number;
            active?: number;
            [key: string]: unknown;
          }) => ({
            id: String(group.id),
            name: group.name,
            contacts: group.contacts || 0,
            active: group.active || 0,
          })
        )
      : [];
  }, [contactGroupsData]);

  // Handle group_id from URL params
  useEffect(() => {
    const groupIdFromUrl = searchParams.get("group_id");
    if (groupIdFromUrl && contactGroups.length > 0) {
      // Find the group by ID and use its name
      const group = contactGroups.find((g) => String(g.id) === String(groupIdFromUrl));
      if (group) {
        setFormData((prev) => ({
          ...prev,
          contact_group_id: group.name || "",
        }));
      }
    }
  }, [searchParams, contactGroups]);

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
    if (!formData.contact_group_id.trim()) {
      showAlert({
        variant: "error",
        title: "Error",
        message: "Please select a contact group",
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

    if (!formData.campaign_name.trim()) {
      showAlert({
        variant: "error",
        title: "Error",
        message: "Campaign name is required",
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

    // Get date from selectedDate or formData.send_date
    const dateValue = selectedDate ? selectedDate.toISOString().split("T")[0] : formData.send_date;

    try {
      // Convert contact_group_id from ID to name if needed
      let contactGroupName = formData.contact_group_id.trim();
      // If it's a numeric ID, find the corresponding group name
      if (contactGroupName && /^\d+$/.test(contactGroupName)) {
        const group = contactGroups.find((g) => String(g.id) === contactGroupName);
        if (group && group.name) {
          contactGroupName = group.name;
        }
      }

      // Build request data
      const requestData = {
        contact_group_id: contactGroupName,
        message: formData.message.trim(),
        sender_id: formData.sender_id.trim(),
        campaign_name: formData.campaign_name.trim(),
        sms_type: (isCustom ? "CUSTOM" : "PLAIN") as "PLAIN" | "CUSTOM",
        schedule: schedule ? true : false,
        route: "message/send/contact-group",
        service: "sms",
        date: undefined as string | undefined,
        send_time: undefined as string | undefined,
        repeat_type: undefined as string | undefined,
      };

      // For scheduled messages, add all required fields
      if (schedule && dateValue && formData.send_time) {
        // Normalize send_time to HH:mm format
        const timeValue = formData.send_time.trim();
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

        requestData.date = dateValue;
        requestData.send_time = normalizedTime;
        requestData.repeat_type = repeatType;
      }

      await sendContactGroupSMS.mutateAsync({
        data: requestData,
        apiKey,
      });

      // Invalidate contact groups queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ["contact-groups-simple"] });
      queryClient.invalidateQueries({ queryKey: ["contact-groups-list"] });

      // Reset form on success
      setFormData({
        contact_group_id: "",
        message: "",
        sender_id: "",
        campaign_name: "",
        sms_type: "PLAIN",
        send_date: "",
        send_time: "",
      });
      setIsCustom(false);
      setSelectedDate(undefined);
      setSchedule(false);
      setRepeatType("NO_REPEAT");
    } catch {
      // Error is already handled by the hook
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Send to Contact Group
        </h1>
        <p className="text-muted-foreground mt-2 dark:text-gray-400">
          Send SMS to one or multiple contact groups
        </p>
      </div>

      <Card className="border-border/50 dark:border-border/30 bg-card border-2 shadow-xl transition-all duration-300 hover:shadow-2xl dark:bg-gray-900/50">
        <CardHeader className="from-theme-purple-50/50 dark:from-theme-purple-950/30 border-border/50 dark:border-border/30 border-b-2 bg-gradient-to-r to-brand-50/50 px-6 py-6 dark:to-brand-950/30">
          <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900 dark:text-white">
            <Users className="h-5 w-5 text-theme-purple-500" />
            Contact Group SMS Form
          </CardTitle>
          <CardDescription className="mt-2 text-gray-600 dark:text-gray-400">
            Select contact group(s) and compose your message
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <Label
                  htmlFor="contact_group_id"
                  className="text-sm font-semibold text-gray-900 dark:text-white"
                >
                  Contact Group(s) *
                </Label>
                {isLoadingContactGroups ? (
                  <div className="border-border/50 bg-muted/50 flex h-12 items-center gap-2 rounded-lg border-2 px-4 dark:border-gray-700 dark:bg-gray-800">
                    <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
                    <span className="text-muted-foreground text-sm dark:text-gray-400">
                      Loading contact groups...
                    </span>
                  </div>
                ) : (
                  <Select
                    value={formData.contact_group_id}
                    onValueChange={(value) => setFormData({ ...formData, contact_group_id: value })}
                    searchable={true}
                  >
                    <SelectTrigger
                      id="contact_group_id"
                      className="border-border/50 h-12 border-2 focus:border-theme-purple-500 focus:ring-2 focus:ring-theme-purple-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-theme-purple-500"
                    >
                      <SelectValue placeholder="Select contact group" />
                    </SelectTrigger>
                    <SelectContent>
                      {contactGroups.length > 0 ? (
                        contactGroups.map((group) => (
                          <SelectItem key={group.id} value={group.name || ""}>
                            {group.name} ({group.contacts} contacts, {group.active} active)
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-groups" disabled>
                          No contact groups available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
                {contactGroups.length === 0 && !isLoadingContactGroups && (
                  <p className="text-xs text-warning-500">
                    No contact groups found. Please create a contact group first.
                  </p>
                )}
                <p className="text-muted-foreground text-xs dark:text-gray-400">
                  You can select multiple groups (e.g., 1,2,3)
                </p>
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
                  >
                    <SelectTrigger
                      id="sender_id"
                      className="border-border/50 h-12 w-full border-2 focus:border-theme-purple-500 focus:ring-2 focus:ring-theme-purple-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-theme-purple-500"
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
                  Campaign Name *
                </Label>
                <Input
                  id="campaign_name"
                  placeholder="Group Campaign"
                  value={formData.campaign_name}
                  onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
                  required
                  className="border-border/50 h-12 border-2 focus:border-theme-purple-500 focus:ring-2 focus:ring-theme-purple-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-theme-purple-500"
                />
              </div>
            </div>

            <div className="bg-theme-purple-50/50 dark:bg-theme-purple-950/30 border-theme-purple-200/50 dark:border-theme-purple-800/50 flex items-center space-x-3 rounded-lg border-2 p-4">
              <Checkbox
                id="custom"
                checked={isCustom}
                onCheckedChange={(checked: boolean) => setIsCustom(checked)}
              />
              <Label
                htmlFor="custom"
                className="cursor-pointer text-sm font-semibold leading-none text-gray-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-white"
              >
                Use personalized message (with placeholders like {`{first_name}`}, {`{other_name}`})
              </Label>
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
                placeholder={
                  isCustom
                    ? "Hello {first_name} {other_name}, thank you for your purchase!"
                    : "Message for the group"
                }
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                className="border-border/50 resize-none border-2 focus:border-theme-purple-500 focus:ring-2 focus:ring-theme-purple-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-theme-purple-500"
              />
              {isCustom && (
                <p className="text-muted-foreground text-xs dark:text-gray-400">
                  Use placeholders: {`{first_name}`}, {`{other_name}`} for personalization
                </p>
              )}
            </div>

            <div className="border-border/50 flex items-center space-x-3 rounded-lg border bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <Checkbox
                id="schedule"
                checked={schedule}
                onCheckedChange={(checked: boolean) => setSchedule(checked)}
              />
              <Label
                htmlFor="schedule"
                className="cursor-pointer text-sm font-semibold leading-none text-gray-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-white"
              >
                Schedule this message
              </Label>
            </div>

            {schedule && (
              <div className="from-theme-purple-50/50 dark:from-theme-purple-950/30 border-theme-purple-200/50 dark:border-theme-purple-800/50 space-y-6 rounded-xl border-2 bg-gradient-to-r to-brand-50/50 p-8 shadow-lg dark:to-brand-950/30">
                <div className="mb-4 flex items-center gap-3">
                  <Clock className="h-6 w-6 text-theme-purple-500" />
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
                      className="border-border/50 h-12 border-2 focus:border-theme-purple-500 focus:ring-2 focus:ring-theme-purple-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-theme-purple-500"
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
                      <Calendar className="h-4 w-4 text-theme-purple-500" />
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
                      <Clock className="h-4 w-4 text-theme-purple-500" />
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
                      className="border-border/50 h-12 border-2 focus:border-theme-purple-500 focus:ring-2 focus:ring-theme-purple-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-theme-purple-500"
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
                    contact_group_id: "",
                    message: "",
                    sender_id: "",
                    campaign_name: "",
                    sms_type: "PLAIN",
                    send_date: "",
                    send_time: "",
                  });
                  setIsCustom(false);
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
                disabled={sendContactGroupSMS.isPending || !apiKey}
                className="hover:bg-theme-purple-600 h-11 bg-theme-purple-500 px-8 font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sendContactGroupSMS.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send to Group
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
