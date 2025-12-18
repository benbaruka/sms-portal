"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Upload, FileText, ArrowLeft, Download } from "lucide-react";
import { useAlert } from "@/context/AlertProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUploadContacts, useContactGroupList } from "@/controller/query/contacts/useContacts";
import { UploadContactsRequest, ContactGroup } from "@/types";

export default function UploadContactsPage() {
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const router = useRouter();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [group_id, setGroup_id] = useState<string>("");

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  // Fetch contact groups list
  const { data: groupsData, isLoading: isLoadingGroups } = useContactGroupList(
    { page: 1, limit: 100 },
    apiKey,
    !!apiKey
  );

  // Extract groups from response
  const groups = useMemo(() => {
    if (!groupsData) return [];
    const response = groupsData;
    const groupsList = response.message?.groups || response.data?.groups || response.groups || [];
    return Array.isArray(groupsList) ? groupsList : [];
  }, [groupsData]);

  const uploadContacts = useUploadContacts();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      showAlert({
        variant: "error",
        title: "Error",
        message: "Please select a file to upload",
      });
      return;
    }

    if (!apiKey) {
      showAlert({
        variant: "error",
        title: "Error",
        message: "API key is required",
      });
      return;
    }

    try {
      const payload: UploadContactsRequest = {
        file,
        contact_group_id: group_id ? parseInt(group_id) : undefined,
      };

      await uploadContacts.mutateAsync({
        data: payload,
        apiKey,
      });

      // Reset form on success
      setFile(null);
      setGroup_id("");

      // Reset file input
      const fileInput = document.getElementById("file") as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }

      // Optionally redirect to groups page
      // router.push("/contacts/groups");
    } catch (error) {
      // Error is already handled by the hook
    }
  };

  const handleDownloadTemplate = () => {
    // Create CSV template content
    const csvContent =
      "first_name,other_name,last_name,msisdn,email\nJohn,Doe,Smith,254712345678,john@example.com\nJane,Smith,Williams,254798765432,jane@example.com";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contacts_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Header */}
      <div className="rounded-xl border border-indigo-200/50 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 p-8 shadow-sm dark:border-indigo-800/50">
        <div className="mb-3 flex items-center gap-4">
          <div className="rounded-xl bg-indigo-500 p-3 shadow-md">
            <Upload className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Upload Contacts
            </h1>
            <p className="text-muted-foreground mt-2 dark:text-gray-400">
              Upload contacts from a CSV or Excel file
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Card */}
        <Card className="border-border/50 dark:border-border/30 bg-card border-2 shadow-xl transition-all duration-300 hover:shadow-2xl dark:bg-gray-900/50">
          <CardHeader className="border-border/50 dark:border-border/30 border-b-2 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 px-6 py-6 dark:from-indigo-950/30 dark:to-purple-950/30">
            <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900 dark:text-white">
              <Upload className="h-5 w-5 text-indigo-500" />
              Upload File
            </CardTitle>
            <CardDescription className="mt-2 text-gray-600 dark:text-gray-400">
              Upload a CSV or Excel file with contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label
                  htmlFor="file"
                  className="text-sm font-semibold text-gray-900 dark:text-white"
                >
                  Select File *
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="file"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="border-border/50 h-12 cursor-pointer border-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-500"
                    required
                  />
                  {file && (
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                      <FileText className="h-4 w-4 text-indigo-500" />
                      <span>{file.name}</span>
                      <span className="text-muted-foreground text-xs dark:text-gray-400">
                        ({(file.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground text-xs dark:text-gray-400">
                  Supported formats: CSV, XLSX, XLS
                </p>
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="group_id"
                  className="text-sm font-semibold text-gray-900 dark:text-white"
                >
                  Assign to Contact Group (Optional)
                </Label>
                {isLoadingGroups ? (
                  <div className="border-border/50 bg-muted/50 flex h-12 items-center gap-2 rounded-lg border-2 px-4 dark:border-gray-700 dark:bg-gray-800">
                    <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
                    <span className="text-muted-foreground text-sm dark:text-gray-400">
                      Loading contact groups...
                    </span>
                  </div>
                ) : (
                  <Select value={group_id} onValueChange={setGroup_id}>
                    <SelectTrigger
                      id="group_id"
                      className="border-border/50 h-12 border-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-500"
                    >
                      <SelectValue placeholder="Select a contact group (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.length > 0 ? (
                        groups.map((group: ContactGroup) => (
                          <SelectItem key={group.id} value={group.id.toString()}>
                            {group.name}
                            {group.description ? ` - ${group.description}` : ""}
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
                {groups.length === 0 && !isLoadingGroups && (
                  <p className="text-muted-foreground text-xs dark:text-gray-400">
                    No contact groups found.{" "}
                    <Link href="/contacts/groups" className="text-indigo-500 hover:underline">
                      Create one first
                    </Link>
                  </p>
                )}
              </div>

              <div className="border-border/50 flex items-center justify-end gap-4 border-t pt-4 dark:border-gray-700">
                <Link href="/contacts/groups">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploadContacts.isPending}
                    className="border-border/50 h-11 border-2 px-6 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={uploadContacts.isPending || !file || !apiKey}
                  className="h-11 bg-indigo-500 px-8 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-indigo-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploadContacts.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Contacts
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Format Card */}
        <Card className="border-border/50 dark:border-border/30 bg-card border-2 shadow-xl transition-all duration-300 hover:shadow-2xl dark:bg-gray-900/50">
          <CardHeader className="border-border/50 dark:border-border/30 border-b-2 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 px-6 py-6 dark:from-indigo-950/30 dark:to-purple-950/30">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              File Format
            </CardTitle>
            <CardDescription className="mt-2 text-gray-600 dark:text-gray-400">
              Download the template file to see the required format
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-6 py-8">
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Your CSV or Excel file should contain the following columns:
              </p>
              <ul className="list-inside list-disc space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>
                  <span className="font-semibold">first_name</span> (required)
                </li>
                <li>
                  <span className="font-semibold">other_name</span> (optional)
                </li>
                <li>
                  <span className="font-semibold">last_name</span> (optional)
                </li>
                <li>
                  <span className="font-semibold">msisdn</span> (required) - Phone number without
                  country code
                </li>
                <li>
                  <span className="font-semibold">email</span> (optional)
                </li>
              </ul>
            </div>
            <div className="border-border/50 rounded-lg border bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <p className="font-mono mb-2 text-xs text-gray-600 dark:text-gray-400">
                Example CSV format:
              </p>
              <pre className="overflow-x-auto text-xs text-gray-700 dark:text-gray-300">
                {`first_name,other_name,last_name,msisdn,email
John,Doe,Smith,254712345678,john@example.com
Jane,Smith,Williams,254798765432,jane@example.com`}
              </pre>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadTemplate}
              className="border-border/50 h-11 w-full border-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
