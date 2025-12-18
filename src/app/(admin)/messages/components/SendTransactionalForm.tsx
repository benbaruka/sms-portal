"use client";

import React, { useState, useRef } from "react";
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
import { Loader2, Send } from "lucide-react";
import { useAlert } from "@/context/AlertProvider";
import { useSendTransactionalSMS } from "@/controller/query/messages/useMessages";
import { useClientSenderIdsListForMessages } from "@/controller/query/senders/useSenders";
import { useMemo } from "react";

interface SendTransactionalFormProps {
  apiKey: string | null;
}

export default function SendTransactionalForm({ apiKey }: SendTransactionalFormProps) {
  const { showAlert } = useAlert();
  const [formData, setFormData] = useState({
    msisdn: "",
    message: "",
    sender_id: "",
    callback_url: "",
    country_code: "CD",
  });
  const isSubmittingRef = useRef(false);

  const sendTransactionalSMS = useSendTransactionalSMS();

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

    // Prevent double submission
    if (isSubmittingRef.current || sendTransactionalSMS.isPending) {
      return;
    }

    if (!apiKey) {
      showAlert({
        variant: "error",
        title: "Error",
        message: "API Key is required",
      });
      return;
    }

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

    isSubmittingRef.current = true;
    try {
      const result = await sendTransactionalSMS.mutateAsync(
        {
          data: {
            msisdn: formData.msisdn.trim(),
            message: formData.message.trim(),
            sender_id: formData.sender_id.trim(),
            callback_url: formData.callback_url.trim() || undefined,
            country_code: formData.country_code || undefined,
          },
          apiKey,
        },
        {
          onSettled: () => {
            // Reset submitting state after mutation completes (success or error)
            isSubmittingRef.current = false;
          },
        }
      );

      // Only reset form if request was successful
      if (result) {
        setFormData({
          msisdn: "",
          message: "",
          sender_id: "",
          callback_url: "",
          country_code: "CD",
        });
      }
    } catch {
      // Error is already handled by the hook
      isSubmittingRef.current = false;
    }
  };

  return (
    <Card className="border-border/50 dark:border-border/30 bg-card border-2 shadow-xl transition-all duration-300 hover:shadow-2xl dark:bg-gray-900/50">
      <CardHeader className="border-border/50 dark:border-border/30 border-b-2 bg-gradient-to-r from-brand-50/50 to-blue-light-50/50 px-6 py-6 dark:from-brand-950/30 dark:to-blue-light-950/30">
        <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900 dark:text-white">
          <Send className="h-5 w-5 text-brand-500" />
          Transactional SMS Form
        </CardTitle>
        <CardDescription className="mt-2 text-gray-600 dark:text-gray-400">
          Send single transactional SMS (OTP, notifications, etc.)
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
                className="border-border/50 h-12 border-2 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-500"
              />
              <p className="text-muted-foreground text-xs dark:text-gray-400">
                Include country code (e.g., +243974096458)
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
                    className="border-border/50 h-12 w-full border-2 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-500"
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
                          const senderIdName = (sender.code || sender.sender_id || "").toString();
                          const senderIdValue = senderIdName; // Use code (name) as value, not ID
                          const carrierName =
                            sender.carrier_name ||
                            sender.connector_name ||
                            sender.connectors?.[0]?.name ||
                            "";
                          return (
                            <SelectItem key={String(sender.id ?? "")} value={senderIdValue}>
                              {senderIdName}
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
                  className="border-border/50 h-12 border-2 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-500"
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
                className="border-border/50 h-12 border-2 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-500"
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
              placeholder="Your verification code is 123456"
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              maxLength={160}
              className="border-border/50 resize-none border-2 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-500"
            />
            <p className="text-muted-foreground text-xs dark:text-gray-400">
              {formData.message.length}/160 characters{" "}
              {formData.message.length > 160 ? "(SMS will be split)" : ""}
            </p>
          </div>

          <div className="border-border/50 dark:border-border/30 mt-6 flex items-center justify-end gap-4 border-t-2 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setFormData({
                  msisdn: "",
                  message: "",
                  sender_id: "",
                  callback_url: "",
                  country_code: "CD",
                })
              }
              className="border-border/50 h-11 border-2 px-6 hover:bg-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800"
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={sendTransactionalSMS.isPending || !apiKey || isSubmittingRef.current}
              className="h-11 bg-gradient-to-r from-brand-500 to-brand-600 px-8 font-semibold text-white shadow-lg transition-all duration-200 hover:from-brand-600 hover:to-brand-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sendTransactionalSMS.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send SMS
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
