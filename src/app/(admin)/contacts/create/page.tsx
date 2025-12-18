"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  UserPlus,
  Save,
  ArrowLeft,
  Upload,
  Download,
  X,
  Plus,
  FileText,
} from "lucide-react";
import { useAlert } from "@/context/AlertProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUploadContacts, useContactGroupsSimple } from "@/controller/query/contacts/useContacts";
import axios from "axios";
import { smsBaseURL } from "@/controller/api/config/smsApiConfig";
import { contacts } from "@/controller/api/constant/apiLink";

interface Person {
  country_code: string;
  msisdn: string;
  first_name: string;
  other_name: string;
}

export default function CreateContactPage() {
  const { showAlert } = useAlert();
  const router = useRouter();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"quick" | "upload">("quick");
  const [groupName, setGroupName] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [persons, setPersons] = useState<Person[]>([
    { country_code: "ke", msisdn: "", first_name: "", other_name: "" },
  ]);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  // Fetch contact groups list
  const { data: groupsData, isLoading: isLoadingGroups } = useContactGroupsSimple(apiKey, !!apiKey);

  // Extract groups from response
  const groups = useMemo(() => {
    if (!groupsData) return [];
    const response = groupsData;
    const groupsList = response.message || [];
    return Array.isArray(groupsList) ? groupsList : [];
  }, [groupsData]);

  // Handle group selection
  const handleGroupSelect = (value: string) => {
    if (value === "create-new") {
      setIsCreatingNew(true);
      setSelectedGroupId(null);
      setGroupName("");
    } else {
      setIsCreatingNew(false);
      const selectedGroup = groups.find((group: { id?: number }) => group.id?.toString() === value);
      if (selectedGroup) {
        setGroupName((selectedGroup as { name?: string }).name || "");
        setSelectedGroupId((selectedGroup as { id?: number }).id || null);
      }
    }
  };

  const uploadContacts = useUploadContacts();

  // Add person
  const addPerson = () => {
    setPersons([...persons, { country_code: "ke", msisdn: "", first_name: "", other_name: "" }]);
  };

  // Remove person
  const removePerson = (index: number) => {
    if (persons.length > 1) {
      setPersons(persons.filter((_, i) => i !== index));
    }
  };

  // Update person field
  const updatePerson = (index: number, field: keyof Person, value: string) => {
    const updated = [...persons];
    updated[index] = { ...updated[index], [field]: value };
    setPersons(updated);
  };

  // Handle Quick Contact submit
  const handleQuickContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!apiKey) {
      showAlert({
        variant: "error",
        title: "Error",
        message: "API key is required",
      });
      return;
    }

    if (!groupName.trim()) {
      showAlert({
        variant: "error",
        title: "Error",
        message: "Group name is required",
      });
      return;
    }

    // Validate persons
    const validPersons = persons.filter((p) => p.msisdn.trim() && p.first_name.trim());

    if (validPersons.length === 0) {
      showAlert({
        variant: "error",
        title: "Error",
        message: "At least one contact with phone number and first name is required",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create group with contacts
      // Backend expects: { id?: int64, name: string, contacts: [{ Msisdn, FirstName, OtherName, CountryCode }] }
      const payload = {
        id: selectedGroupId || 0, // 0 means create new, > 0 means add to existing
        name: groupName.trim(),
        contacts: validPersons.map((p) => ({
          Msisdn: p.msisdn.trim(), // Backend expects capital M
          FirstName: p.first_name.trim(), // Backend expects capital F
          OtherName: p.other_name.trim() || "", // Backend expects capital O
          CountryCode: p.country_code, // Backend expects capital C
        })),
      };

      // Backend expects: { id?: int64, name: string, contacts: [{ Msisdn, FirstName, OtherName, CountryCode }] }
      const response = await axios.post(`${smsBaseURL}${contacts.create}`, payload, {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      });

      if (response.data) {
        showAlert({
          variant: "success",
          title: "Success",
          message: response.data.message || "Contact group created successfully!",
        });

        // Reset form
        setGroupName("");
        setPersons([{ country_code: "ke", msisdn: "", first_name: "", other_name: "" }]);

        // Redirect to groups page
        setTimeout(() => {
          router.push("/contacts/groups");
        }, 1500);
      }
    } catch (error) {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data
          ? typeof error.response.data === "object" &&
            error.response.data !== null &&
            "message" in error.response.data
            ? String(error.response.data.message)
            : typeof error.response.data === "string"
              ? error.response.data
              : "Failed to create contact group"
          : error instanceof Error
            ? error.message
            : "Failed to create contact group";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Upload submit
  const handleUploadSubmit = async (e: React.FormEvent) => {
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
      // Backend expects: FormData with "file", "id" (optional, for existing group), "name" (optional, for new group), "country_code" (optional)
      const formData = new FormData();
      formData.append("file", file);

      // If group ID is provided, use it; otherwise use name to create new group
      if (selectedGroupId) {
        formData.append("id", selectedGroupId.toString());
      } else if (groupName.trim()) {
        formData.append("name", groupName.trim());
      }

      // Use the uploadContacts service for consistency
      await uploadContacts.mutateAsync({
        data: {
          file,
          contact_group_id: selectedGroupId || undefined,
          name: !selectedGroupId && groupName.trim() ? groupName.trim() : undefined,
        },
        apiKey,
      });

      // Reset form
      setGroupName("");
      setFile(null);
      const fileInput = document.getElementById("upload-file") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      // Redirect to groups page
      setTimeout(() => {
        router.push("/contacts/groups");
      }, 1500);
    } catch (error) {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data
          ? typeof error.response.data === "object" &&
            error.response.data !== null &&
            "message" in error.response.data
            ? String(error.response.data.message)
            : typeof error.response.data === "string"
              ? error.response.data
              : "Failed to upload contacts"
          : error instanceof Error
            ? error.message
            : "Failed to upload contacts";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      "first_name,other_name,msisdn\nJohn,Doe,254712345678\nJane,Smith,254798765432";
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Header */}
      <div className="rounded-xl border border-indigo-200/50 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 p-8 shadow-sm dark:border-indigo-800/50">
        <div className="mb-3 flex items-center gap-4">
          <div className="rounded-xl bg-indigo-500 p-3 shadow-md">
            <UserPlus className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Create Contact Group
            </h1>
            <p className="text-muted-foreground mt-2 dark:text-gray-400">
              Add contacts manually or upload from a CSV file
            </p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <Card className="border-2 border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
        <CardHeader className="border-b-2 border-gray-200 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 px-6 py-6 dark:border-gray-700">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-white">
            <div className="rounded-lg bg-indigo-500 p-2 shadow-sm">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            New Contact Group
          </CardTitle>
          <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Create a new contact group and add contacts
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-8">
          {/* Group Name - Select or Create */}
          <div className="mb-8">
            <Label
              htmlFor="group_name"
              className="mb-3 block text-sm font-bold text-gray-900 dark:text-white"
            >
              Name of Contact Group *
            </Label>
            {!isCreatingNew ? (
              <Select value={selectedGroupId?.toString() || ""} onValueChange={handleGroupSelect}>
                <SelectTrigger
                  className="h-12 border-2 border-gray-300 bg-white shadow-sm focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-500"
                  disabled={isLoadingGroups}
                >
                  <SelectValue
                    placeholder={
                      isLoadingGroups ? "Loading groups..." : "Select existing group or create new"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="create-new"
                    className="font-medium text-indigo-600 dark:text-indigo-400"
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Create New Group
                    </div>
                  </SelectItem>
                  {groups.length > 0 && (
                    <>
                      <div className="border-b border-gray-200 px-2 py-1.5 text-xs font-semibold text-gray-500 dark:border-gray-700 dark:text-gray-400">
                        Existing Groups
                      </div>
                      {groups.map((group: { id?: number; name?: string }) => (
                        <SelectItem key={group.id} value={group.id?.toString() || ""}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    id="group_name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Enter the name of your new group"
                    required
                    className="h-12 border-2 border-gray-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-500"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreatingNew(false);
                      setGroupName("");
                      setSelectedGroupId(null);
                    }}
                    className="h-12"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Creating a new group</p>
              </div>
            )}
            {selectedGroupId && !isCreatingNew && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Using existing group</p>
            )}
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "quick" | "upload")}
            className="w-full"
          >
            <TabsList className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent mb-6 flex h-12 w-full justify-start overflow-x-auto rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
              <TabsTrigger
                value="quick"
                className="flex-shrink-0 whitespace-nowrap font-semibold transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Quick Contact
              </TabsTrigger>
              <TabsTrigger
                value="upload"
                className="flex-shrink-0 whitespace-nowrap font-semibold transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Contacts
              </TabsTrigger>
            </TabsList>

            {/* Quick Contact Tab */}
            <TabsContent value="quick" className="space-y-6">
              <form onSubmit={handleQuickContactSubmit} className="space-y-6">
                <div className="space-y-4">
                  {persons.map((person, index) => (
                    <div
                      key={index}
                      className="space-y-4 rounded-xl border-2 border-gray-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                    >
                      <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          Contact {index + 1}
                        </span>
                        {persons.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePerson(index)}
                            className="h-8 w-8 rounded-lg p-0 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid gap-4 md:grid-cols-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Country Code
                          </Label>
                          <Select
                            value={person.country_code}
                            onValueChange={(value) => updatePerson(index, "country_code", value)}
                          >
                            <SelectTrigger className="h-11 border-2 border-gray-300 bg-white shadow-sm focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:focus:border-indigo-500">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ke">🇰🇪 Kenya (+254)</SelectItem>
                              <SelectItem value="ug">🇺🇬 Uganda (+256)</SelectItem>
                              <SelectItem value="tz">🇹🇿 Tanzania (+255)</SelectItem>
                              <SelectItem value="za">🇿🇦 South Africa (+27)</SelectItem>
                              <SelectItem value="rw">🇷🇼 Rwanda (+250)</SelectItem>
                              <SelectItem value="cd">🇨🇩 DRC (+243)</SelectItem>
                              <SelectItem value="bi">🇧🇮 Burundi (+257)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Mobile Number *
                          </Label>
                          <Input
                            type="tel"
                            value={person.msisdn}
                            onChange={(e) => updatePerson(index, "msisdn", e.target.value)}
                            placeholder="0700000000"
                            required
                            className="h-11 border-2 border-gray-300 bg-white shadow-sm focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:focus:border-indigo-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            First Name *
                          </Label>
                          <Input
                            value={person.first_name}
                            onChange={(e) => updatePerson(index, "first_name", e.target.value)}
                            placeholder="First Name"
                            required
                            className="h-11 border-2 border-gray-300 bg-white shadow-sm focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:focus:border-indigo-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Other Name
                          </Label>
                          <Input
                            value={person.other_name}
                            onChange={(e) => updatePerson(index, "other_name", e.target.value)}
                            placeholder="Other Name"
                            className="h-11 border-2 border-gray-300 bg-white shadow-sm focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addPerson}
                    className="h-12 w-full border-2 border-dashed border-indigo-300 font-semibold text-indigo-600 shadow-sm transition-all duration-200 hover:bg-indigo-50 hover:shadow-md dark:border-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add More Contacts
                  </Button>
                </div>

                <div className="flex items-center justify-end gap-4 border-t border-gray-200 pt-6 dark:border-gray-700">
                  <Link href="/contacts/groups">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isSubmitting}
                      className="h-11 border-2 border-gray-300 px-6 font-medium shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !apiKey || !groupName.trim()}
                    className="h-11 bg-gradient-to-r from-indigo-500 to-purple-500 px-8 font-bold text-white shadow-lg transition-all duration-200 hover:from-indigo-600 hover:to-purple-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Create Contact Group
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Upload Contacts Tab */}
            <TabsContent value="upload" className="space-y-6">
              <form onSubmit={handleUploadSubmit} className="space-y-6">
                <div className="space-y-5">
                  <div className="rounded-xl border-2 border-dashed border-indigo-300 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-8 text-center shadow-sm transition-all duration-200 hover:border-indigo-400 hover:shadow-md dark:border-indigo-700 dark:from-indigo-900/20 dark:to-purple-900/20 dark:hover:border-indigo-600">
                    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-indigo-500 p-4 shadow-lg">
                      <Upload className="mx-auto h-8 w-8 text-white" />
                    </div>
                    <Label htmlFor="upload-file" className="cursor-pointer">
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {file ? file.name : "Click to upload or drag and drop"}
                        </p>
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          CSV, XLSX, XLS (Max 10MB)
                        </p>
                      </div>
                    </Label>
                    <Input
                      id="upload-file"
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileChange}
                      className="hidden"
                      required
                    />
                    {file && (
                      <div className="mt-5 flex items-center justify-center gap-3 rounded-lg border-2 border-indigo-200 bg-white p-3 shadow-sm dark:border-indigo-800 dark:bg-gray-800">
                        <FileText className="h-5 w-5 text-indigo-500" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {file.name}
                        </span>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          ({(file.size / 1024).toFixed(2)} KB)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 shadow-sm dark:border-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-blue-500 p-2 shadow-sm">
                        <FileText className="h-5 w-5 flex-shrink-0 text-white" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
                          File Format Instructions
                        </p>
                        <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                          Your CSV file should contain the following columns:
                        </p>
                        <ul className="list-inside list-disc space-y-1.5 text-xs text-blue-700 dark:text-blue-300">
                          <li>
                            <span className="font-bold">first_name</span> (required)
                          </li>
                          <li>
                            <span className="font-bold">other_name</span> (optional)
                          </li>
                          <li>
                            <span className="font-bold">msisdn</span> (required) - Phone number with
                            country code
                          </li>
                        </ul>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadTemplate}
                          className="mt-3 h-9 border-2 border-blue-300 text-xs font-semibold text-blue-600 shadow-sm hover:bg-blue-100 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/30"
                        >
                          <Download className="mr-1.5 h-3 w-3" />
                          Download Template
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4 border-t border-gray-200 pt-6 dark:border-gray-700">
                  <Link href="/contacts/groups">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploadContacts.isPending || isSubmitting}
                      className="h-11 border-2 border-gray-300 px-6 font-medium shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={uploadContacts.isPending || isSubmitting || !file || !apiKey}
                    className="h-11 bg-gradient-to-r from-indigo-500 to-purple-500 px-8 font-bold text-white shadow-lg transition-all duration-200 hover:from-indigo-600 hover:to-purple-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {uploadContacts.isPending || isSubmitting ? (
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
