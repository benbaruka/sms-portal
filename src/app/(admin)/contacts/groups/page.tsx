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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  Users,
  RefreshCw,
  Search,
  Plus,
  Edit,
  Trash2,
  UserPlus,
  Send,
  Download,
  UserPlus as AddContact,
  Save,
} from "lucide-react";
import { useAlert } from "@/context/AlertProvider";
import Link from "next/link";
import {
  useContactGroupsSimple,
  useDeleteContactGroup,
  useUpdateContactGroup,
  useCreateContact,
  useDeleteContactGroupMSISDN,
  useUpdateContactGroupMSISDNStatus,
} from "@/controller/query/contacts/useContacts";
import { CreateContactRequest } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { ContactsTable } from "@/components/contacts/ContactsTable";
import { useRouter } from "next/navigation";

export default function ContactGroupsPage() {
  const { showAlert } = useAlert();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<{
    id?: string | number;
    name?: string;
    [key: string]: unknown;
  } | null>(null);
  const [search, setSearch] = useState("");

  // Modal states
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [editGroupName, setEditGroupName] = useState("");
  const [isDeleteGroupOpen, setIsDeleteGroupOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<number | null>(null);

  // Add Contact form
  const [addContactForm, setAddContactForm] = useState<CreateContactRequest>({
    msisdn: "",
    first_name: "",
    other_name: "",
    last_name: "",
    email: "",
    contact_group_id: undefined,
    country_code: "+254",
  });

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  // Fetch contact groups (simple list for sidebar)
  const {
    data: groupsData,
    isLoading,
    isError,
    error: groupsError,
    refetch,
  } = useContactGroupsSimple(apiKey, !!apiKey);

  // Mutations
  const deleteContactGroup = useDeleteContactGroup();
  const updateContactGroup = useUpdateContactGroup();
  const createContact = useCreateContact();
  const deleteContact = useDeleteContactGroupMSISDN();
  const updateContactStatus = useUpdateContactGroupMSISDNStatus();

  // Extract groups from response
  const groups = useMemo(() => {
    if (!groupsData) return [];
    const response = groupsData;
    const groupsList = response.message || [];
    return Array.isArray(groupsList) ? groupsList : [];
  }, [groupsData]);

  // Filter groups by search (client-side)
  const filteredGroups = useMemo(() => {
    if (!search.trim()) return groups;
    const searchLower = search.toLowerCase();
    return groups.filter(
      (group: { name?: string; [key: string]: unknown }) =>
        typeof group.name === "string" && group.name.toLowerCase().includes(searchLower)
    );
  }, [groups, search]);

  // Select first group on load
  useEffect(() => {
    if (groups.length > 0 && !selectedGroupId) {
      const firstGroup = groups[0];
      setSelectedGroupId(firstGroup.id);
      setSelectedGroup(firstGroup);
    }
  }, [groups, selectedGroupId]);

  // Update selectedGroup when groups data changes (after refetch)
  useEffect(() => {
    if (selectedGroupId && groups.length > 0) {
      const updatedGroup = groups.find(
        (g: { id?: string | number; [key: string]: unknown }) =>
          String(g.id) === String(selectedGroupId)
      );
      if (updatedGroup) {
        setSelectedGroup(updatedGroup);
      }
    }
  }, [groups, selectedGroupId]);

  // Handle group selection
  const handleGroupSelect = (group: { id?: string | number; [key: string]: unknown }) => {
    const groupId =
      typeof group.id === "number"
        ? group.id
        : typeof group.id === "string"
          ? parseInt(group.id, 10)
          : null;
    if (groupId !== null && !isNaN(groupId)) {
      setSelectedGroupId(groupId);
    }
    setSelectedGroup(group);
  };

  const handleRefresh = async () => {
    await refetch();
    queryClient.invalidateQueries({ queryKey: ["contact-group"] });
    showAlert({
      variant: "success",
      title: "Success",
      message: "Contact groups refreshed successfully!",
    });
  };

  const handleDeleteClick = (groupId: number) => {
    setGroupToDelete(groupId);
    setIsDeleteGroupOpen(true);
  };

  const handleDelete = async () => {
    if (!apiKey || !groupToDelete) {
      showAlert({
        variant: "error",
        title: "Error",
        message: "API key is required",
      });
      setIsDeleteGroupOpen(false);
      setGroupToDelete(null);
      return;
    }

    try {
      await deleteContactGroup.mutateAsync({
        data: { contact_group_id: groupToDelete },
        apiKey,
      });
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["contact-groups-simple"] });
      queryClient.invalidateQueries({ queryKey: ["contact-group"] });
      await refetch();

      // If deleted group was selected, select first group
      if (selectedGroupId === groupToDelete) {
        const remainingGroups = groups.filter(
          (g: { id?: string | number; [key: string]: unknown }) => g.id !== groupToDelete
        );
        if (remainingGroups.length > 0) {
          handleGroupSelect(remainingGroups[0]);
        } else {
          setSelectedGroupId(null);
          setSelectedGroup(null);
        }
      }

      setIsDeleteGroupOpen(false);
      setGroupToDelete(null);

      showAlert({
        variant: "success",
        title: "Success",
        message: "Contact group deleted successfully!",
      });
    } catch {
      // Error is already handled by the hook
      setIsDeleteGroupOpen(false);
      setGroupToDelete(null);
    }
  };

  const handleDownload = async () => {
    if (!selectedGroupId || !apiKey) {
      showAlert({
        variant: "error",
        title: "Error",
        message: "Please select a contact group",
      });
      return;
    }

    try {
      // Fetch all contacts
      const { getContactGroupContactsList } =
        await import("@/controller/query/contacts/contacts.service");
      const contactsList = await getContactGroupContactsList(
        {
          sort: "contact_group_msisdn.id|desc",
          page: 1,
          per_page: 10000,
          service: "sms",
          route: "contact/group/list",
          id: selectedGroupId,
          filter: "",
        },
        apiKey
      );

      if (!contactsList?.data || contactsList.data.length === 0) {
        showAlert({
          variant: "info",
          title: "Info",
          message: "No contacts to download",
        });
        return;
      }

      // Create CSV content
      const headers = ["ID", "MSISDN", "First Name", "Other Name", "Status", "Created"];
      const rows = contactsList.data.map(
        (contact: {
          contact_group_msisdn_id?: string | number;
          msisdn?: string;
          first_name?: string;
          other_name?: string | null;
          status?: number;
          created?: string;
          [key: string]: unknown;
        }) => [
          contact.contact_group_msisdn_id || "",
          contact.msisdn || "",
          contact.first_name || "",
          contact.other_name ?? "",
          contact.status === 1 ? "Active" : "Muted",
          contact.created || "",
        ]
      );

      const csvContent = [
        headers.join(","),
        ...rows.map((row: unknown[]) =>
          row.map((cell: unknown) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      // Download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedGroup?.name || "contacts"}_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      showAlert({
        variant: "success",
        title: "Success",
        message: "Contacts downloaded successfully!",
      });
    } catch (error) {
      showAlert({
        variant: "error",
        title: "Error",
        message:
          (error instanceof Error ? error.message : undefined) || "Failed to download contacts",
      });
    }
  };

  const handleSendMessage = () => {
    if (!selectedGroupId) {
      showAlert({
        variant: "error",
        title: "Error",
        message: "Please select a contact group",
      });
      return;
    }
    router.push(`/messages/send?tab=contact-group&group_id=${selectedGroupId}`);
  };

  const handleEditGroup = () => {
    if (!selectedGroup) return;
    setEditGroupName(selectedGroup.name || "");
    setIsEditGroupOpen(true);
  };

  const handleUpdateGroup = async () => {
    if (!apiKey || !selectedGroupId || !editGroupName.trim()) {
      showAlert({
        variant: "error",
        title: "Error",
        message: "Group name is required",
      });
      return;
    }

    try {
      await updateContactGroup.mutateAsync({
        data: {
          contact_group_id: selectedGroupId,
          name: editGroupName.trim(),
        },
        apiKey,
      });

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["contact-groups-simple"] });
      queryClient.invalidateQueries({ queryKey: ["contact-group-list-contacts"] });
      await refetch();

      // Update selected group
      setSelectedGroup({ ...selectedGroup, name: editGroupName.trim() });
      setIsEditGroupOpen(false);
    } catch {
      // Error is already handled by the hook
    }
  };

  const handleAddContact = () => {
    if (!selectedGroupId) {
      showAlert({
        variant: "error",
        title: "Error",
        message: "Please select a contact group",
      });
      return;
    }
    setAddContactForm({
      msisdn: "",
      first_name: "",
      other_name: "",
      last_name: "",
      email: "",
      contact_group_id: selectedGroupId || undefined,
      country_code: "+254",
    });
    setIsAddContactOpen(true);
  };

  const handleSubmitAddContact = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!apiKey) {
      showAlert({
        variant: "error",
        title: "Error",
        message: "API key is required",
      });
      return;
    }

    if (!addContactForm.msisdn.trim() || !addContactForm.first_name.trim()) {
      showAlert({
        variant: "error",
        title: "Error",
        message: "Phone number and first name are required",
      });
      return;
    }

    try {
      // Get group name from selectedGroupId
      const selectedGroupName =
        selectedGroup?.name ||
        groups.find((g: { id?: number | string }) => String(g.id) === String(selectedGroupId))
          ?.name;

      await createContact.mutateAsync({
        data: {
          msisdn: addContactForm.msisdn.trim(),
          first_name: addContactForm.first_name.trim(),
          other_name: addContactForm.other_name?.trim() || undefined,
          last_name: addContactForm.last_name?.trim() || undefined,
          email: addContactForm.email?.trim() || undefined,
          contact_group_id: selectedGroupId || undefined, // Send ID, service will map it
          name: selectedGroupName || undefined, // Send name for backend
          country_code: addContactForm.country_code || undefined,
        },
        apiKey,
      });

      // Invalidate and refetch ALL contact-related queries
      // Use queryClient.refetchQueries to force immediate refetch
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["contact-groups-simple"] }),
        queryClient.invalidateQueries({ queryKey: ["contact-group-list-contacts"] }),
        queryClient.invalidateQueries({ queryKey: ["contact-groups-list"] }),
        queryClient.refetchQueries({ queryKey: ["contact-group-list-contacts"] }), // Force immediate refetch
        refetch(), // Refetch groups to update contact counts
      ]);

      // Reset form and close modal
      setAddContactForm({
        msisdn: "",
        first_name: "",
        other_name: "",
        last_name: "",
        email: "",
        contact_group_id: selectedGroupId || undefined,
        country_code: "+254",
      });
      setIsAddContactOpen(false);
    } catch {
      // Error is already handled by the hook
    }
  };

  // Handle delete contact
  const handleDeleteContact = async (contact: Record<string, unknown>) => {
    if (!apiKey) {
      showAlert({
        variant: "error",
        title: "Error",
        message: "API key is required",
      });
      return;
    }

    const contactId = contact.contact_group_msisdn_id || contact.id;
    if (!contactId) {
      showAlert({
        variant: "error",
        title: "Error",
        message: "Contact ID is required",
      });
      return;
    }

    if (!confirm("Are you sure you want to delete this contact?")) {
      return;
    }

    try {
      await deleteContact.mutateAsync({
        data: {
          contact_group_msisdn_id:
            typeof contactId === "number" ? contactId : parseInt(String(contactId), 10),
        },
        apiKey,
      });

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["contact-group-list-contacts"] });
      queryClient.invalidateQueries({ queryKey: ["contact-groups-simple"] });
      const refetchedData = await refetch();

      // Update selectedGroup with fresh data
      if (refetchedData.data) {
        const groupsList = refetchedData.data.message || [];
        const updatedGroup = Array.isArray(groupsList)
          ? groupsList.find(
              (g: { id?: string | number; [key: string]: unknown }) =>
                String(g.id) === String(selectedGroupId)
            )
          : null;
        if (updatedGroup) {
          setSelectedGroup(updatedGroup);
        }
      }
    } catch {
      // Error is already handled by the hook
    }
  };

  // Handle mute/unmute contact
  const handleMuteContact = async (contact: Record<string, unknown>) => {
    if (!apiKey) {
      showAlert({
        variant: "error",
        title: "Error",
        message: "API key is required",
      });
      return;
    }

    const contactId = contact.contact_group_msisdn_id || contact.id;
    if (!contactId) {
      showAlert({
        variant: "error",
        title: "Error",
        message: "Contact ID is required",
      });
      return;
    }

    // Toggle status: 1 = active, 0 = muted
    const currentStatus = contact.status === 1 || contact.status === undefined ? 1 : 0;
    const newStatus = currentStatus === 1 ? 0 : 1;

    try {
      await updateContactStatus.mutateAsync({
        data: {
          contact_group_msisdn_id:
            typeof contactId === "number" ? contactId : parseInt(String(contactId), 10),
          status: newStatus,
        },
        apiKey,
      });

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["contact-group-list-contacts"] });
      queryClient.invalidateQueries({ queryKey: ["contact-groups-simple"] });
      const refetchedData = await refetch();

      // Update selectedGroup with fresh data
      if (refetchedData.data) {
        const groupsList = refetchedData.data.message || [];
        const updatedGroup = Array.isArray(groupsList)
          ? groupsList.find(
              (g: { id?: string | number; [key: string]: unknown }) =>
                String(g.id) === String(selectedGroupId)
            )
          : null;
        if (updatedGroup) {
          setSelectedGroup(updatedGroup);
        }
      }
    } catch {
      // Error is already handled by the hook
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Header */}
      <div className="rounded-xl border border-indigo-200/50 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 p-8 shadow-sm dark:border-indigo-800/50">
        <div className="mb-3 flex items-center gap-4">
          <div className="rounded-xl bg-indigo-500 p-3 shadow-md">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Contact Groups
            </h1>
            <p className="text-muted-foreground mt-1 dark:text-gray-400">
              Manage and organize your contact groups
            </p>
          </div>
        </div>
      </div>

      {/* Contact Groups Selector */}
      <Card className="overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
        <CardHeader className="border-b-2 border-gray-200 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 px-4 py-4 dark:border-gray-700 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
              Contact Groups
            </CardTitle>
            <Link href="/contacts/create">
              <Button className="h-10 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 font-semibold text-white shadow-md transition-all duration-200 hover:from-indigo-600 hover:to-purple-600 hover:shadow-lg sm:h-11 sm:w-auto sm:px-6">
                <Plus className="mr-2 h-4 w-4" />
                <span>Create New Group</span>
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
            <Input
              placeholder="Search groups by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 rounded-xl border-2 border-gray-300 bg-white pl-10 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-800 dark:focus:border-indigo-500"
            />
          </div>

          {/* Groups List - Horizontal Scroll */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Trash2 className="mb-3 h-10 w-10 text-red-500" />
              <p className="mb-3 text-sm text-red-500">
                {groupsError?.message || "Failed to load groups"}
              </p>
              <Button onClick={() => refetch()} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="mb-3 h-10 w-10 text-gray-400" />
              <p className="mb-3 text-sm text-gray-500">
                {search ? "No groups found" : "No contact groups"}
              </p>
              {!search && (
                <Link href="/contacts/create">
                  <Button size="sm" className="bg-indigo-500 text-white hover:bg-indigo-600">
                    Create Group
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent -mx-2 overflow-x-auto px-2 pb-2">
                <div className="flex min-w-max gap-3">
                  {filteredGroups.map(
                    (group: { id?: string | number; name?: string; [key: string]: unknown }) => (
                      <div
                        key={group.id}
                        onClick={() => handleGroupSelect(group)}
                        className={`relative w-auto min-w-[140px] flex-shrink-0 cursor-pointer rounded-lg border-2 px-3 py-2 transition-all duration-200 sm:min-w-[160px] ${
                          selectedGroupId === group.id
                            ? "scale-[1.02] transform border-indigo-600 bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-xl dark:border-indigo-400"
                            : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-indigo-700 dark:hover:bg-indigo-900/20"
                        } `}
                      >
                        {selectedGroupId === group.id && (
                          <div className="absolute right-1 top-1">
                            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white"></div>
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div
                              className={`truncate text-sm font-bold sm:text-base ${selectedGroupId === group.id ? "text-white" : "text-gray-900 dark:text-white"}`}
                            >
                              {group.name}
                            </div>
                            <div
                              className={`text-xs font-medium ${selectedGroupId === group.id ? "text-white/90" : "text-gray-600 dark:text-gray-400"}`}
                            >
                              <span
                                className={`font-bold ${selectedGroupId === group.id ? "text-white" : "text-indigo-600 dark:text-indigo-400"}`}
                              >
                                {typeof group.contacts === "number" ? group.contacts : 0}
                              </span>{" "}
                              {(typeof group.contacts === "number" ? group.contacts : 0) === 1
                                ? "contact"
                                : "contacts"}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
              {filteredGroups.length > 3 && (
                <p className="pt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                  ← Scroll horizontally to see more groups →
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Manage Contacts */}
      {selectedGroup && (
        <div className="space-y-6">
          <Card className="overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
            <CardHeader className="border-b-2 border-gray-200 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 px-4 py-4 dark:border-gray-700 sm:px-6 sm:py-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <CardTitle className="mb-2 truncate text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                    {selectedGroup.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {typeof selectedGroup.active === "number" ? selectedGroup.active : 0}
                    </span>{" "}
                    active contacts,{" "}
                    <span className="font-medium text-gray-500 dark:text-gray-500">
                      {typeof selectedGroup.inactive === "number" ? selectedGroup.inactive : 0}
                    </span>{" "}
                    muted
                  </CardDescription>
                </div>
                {/* Refresh Button - Top Right */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="h-9 flex-shrink-0 border-2 border-gray-300 px-3 font-medium shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800 sm:h-10 sm:px-4"
                >
                  <RefreshCw className={`h-4 w-4 sm:mr-2 ${isLoading ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-200 pt-4 dark:border-gray-700 sm:gap-2.5">
                <Button
                  onClick={handleAddContact}
                  className="h-9 flex-shrink-0 bg-gradient-to-r from-indigo-500 to-purple-500 px-3 font-semibold text-white shadow-md transition-all duration-200 hover:from-indigo-600 hover:to-purple-600 hover:shadow-lg sm:h-10 sm:px-4"
                >
                  <AddContact className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Add Contact</span>
                  <span className="sm:hidden">Add</span>
                </Button>
                <Button
                  onClick={handleSendMessage}
                  variant="default"
                  className="h-9 flex-shrink-0 bg-indigo-600 px-3 font-semibold text-white shadow-md transition-all duration-200 hover:bg-indigo-700 hover:shadow-lg sm:h-10 sm:px-4"
                >
                  <Send className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Send Message</span>
                  <span className="sm:hidden">Send</span>
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="default"
                  className="h-9 flex-shrink-0 bg-blue-600 px-3 font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg sm:h-10 sm:px-4"
                >
                  <Download className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Download</span>
                  <span className="sm:hidden">Export</span>
                </Button>
                <Button
                  onClick={handleEditGroup}
                  variant="outline"
                  size="sm"
                  className="h-9 flex-shrink-0 border-2 border-orange-300 px-3 font-medium text-orange-600 shadow-sm hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/20 sm:h-10 sm:px-4"
                >
                  <Edit className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Edit</span>
                  <span className="sm:hidden">Edit</span>
                </Button>
                <Button
                  onClick={() => {
                    const groupId =
                      typeof selectedGroup.id === "number"
                        ? selectedGroup.id
                        : typeof selectedGroup.id === "string"
                          ? parseInt(selectedGroup.id, 10)
                          : null;
                    if (groupId !== null && !isNaN(groupId)) {
                      handleDeleteClick(groupId);
                    }
                  }}
                  disabled={deleteContactGroup.isPending}
                  variant="outline"
                  size="sm"
                  className="h-9 flex-shrink-0 border-2 border-red-300 px-3 font-medium text-red-600 shadow-sm hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 sm:h-10 sm:px-4"
                >
                  <Trash2 className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Delete</span>
                  <span className="sm:hidden">Del</span>
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Contacts Table */}
          <ContactsTable
            key={`contacts-table-${selectedGroupId}`}
            contactGroupId={selectedGroupId}
            apiKey={apiKey}
            title={selectedGroup.name}
            description={`Contacts in ${selectedGroup.name}`}
            onContactUpdate={(contact) => {
              // TODO: Implement contact view/edit modal
            }}
            onContactDelete={handleDeleteContact}
            onContactStatusChange={handleMuteContact}
          />
        </div>
      )}

      {/* Add Contact Modal */}
      <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
        <DialogContent className="border-2 border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900 sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
              <UserPlus className="h-5 w-5 text-indigo-500" />
              Add Contact to {selectedGroup?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Add a new contact to this group
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAddContact} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="add_first_name"
                  className="text-sm font-semibold text-gray-900 dark:text-white"
                >
                  First Name *
                </Label>
                <Input
                  id="add_first_name"
                  value={addContactForm.first_name}
                  onChange={(e) =>
                    setAddContactForm({ ...addContactForm, first_name: e.target.value })
                  }
                  placeholder="First Name"
                  required
                  className="h-11 border-2 border-gray-300 bg-white shadow-sm focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:focus:border-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="add_other_name"
                  className="text-sm font-semibold text-gray-900 dark:text-white"
                >
                  Other Name
                </Label>
                <Input
                  id="add_other_name"
                  value={addContactForm.other_name || ""}
                  onChange={(e) =>
                    setAddContactForm({ ...addContactForm, other_name: e.target.value })
                  }
                  placeholder="Other Name"
                  className="h-11 border-2 border-gray-300 bg-white shadow-sm focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="add_country_code"
                  className="text-sm font-semibold text-gray-900 dark:text-white"
                >
                  Country Code
                </Label>
                <Select
                  value={addContactForm.country_code}
                  onValueChange={(value) =>
                    setAddContactForm({ ...addContactForm, country_code: value })
                  }
                >
                  <SelectTrigger className="h-11 border-2 border-gray-300 bg-white shadow-sm focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:focus:border-indigo-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+254">🇰🇪 Kenya (+254)</SelectItem>
                    <SelectItem value="+256">🇺🇬 Uganda (+256)</SelectItem>
                    <SelectItem value="+255">🇹🇿 Tanzania (+255)</SelectItem>
                    <SelectItem value="+27">🇿🇦 South Africa (+27)</SelectItem>
                    <SelectItem value="+250">🇷🇼 Rwanda (+250)</SelectItem>
                    <SelectItem value="+243">🇨🇩 DRC (+243)</SelectItem>
                    <SelectItem value="+257">🇧🇮 Burundi (+257)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="add_msisdn"
                  className="text-sm font-semibold text-gray-900 dark:text-white"
                >
                  Mobile Number *
                </Label>
                <Input
                  id="add_msisdn"
                  type="tel"
                  value={addContactForm.msisdn}
                  onChange={(e) => setAddContactForm({ ...addContactForm, msisdn: e.target.value })}
                  placeholder="0700000000"
                  required
                  className="h-11 border-2 border-gray-300 bg-white shadow-sm focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="add_last_name"
                  className="text-sm font-semibold text-gray-900 dark:text-white"
                >
                  Last Name
                </Label>
                <Input
                  id="add_last_name"
                  value={addContactForm.last_name || ""}
                  onChange={(e) =>
                    setAddContactForm({ ...addContactForm, last_name: e.target.value })
                  }
                  placeholder="Last Name"
                  className="h-11 border-2 border-gray-300 bg-white shadow-sm focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:focus:border-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="add_email"
                  className="text-sm font-semibold text-gray-900 dark:text-white"
                >
                  Email
                </Label>
                <Input
                  id="add_email"
                  type="email"
                  value={addContactForm.email || ""}
                  onChange={(e) => setAddContactForm({ ...addContactForm, email: e.target.value })}
                  placeholder="Email (optional)"
                  className="h-11 border-2 border-gray-300 bg-white shadow-sm focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:focus:border-indigo-500"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddContactOpen(false)}
                disabled={createContact.isPending}
                className="h-11 border-2 border-gray-300 px-6 font-medium shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createContact.isPending || !apiKey}
                className="h-11 bg-gradient-to-r from-indigo-500 to-purple-500 px-8 font-bold text-white shadow-lg transition-all duration-200 hover:from-indigo-600 hover:to-purple-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              >
                {createContact.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Add Contact
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Group Modal */}
      <Dialog open={isEditGroupOpen} onOpenChange={setIsEditGroupOpen}>
        <DialogContent className="border-2 border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900 sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
              <Edit className="h-5 w-5 text-orange-500" />
              Edit Group Name
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Update the name of &quot;{selectedGroup?.name || ""}&quot;
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="edit_group_name"
                className="text-sm font-semibold text-gray-900 dark:text-white"
              >
                New Group Name *
              </Label>
              <Input
                id="edit_group_name"
                value={editGroupName}
                onChange={(e) => setEditGroupName(e.target.value)}
                placeholder="Enter new group name"
                required
                className="h-11 border-2 border-gray-300 bg-white shadow-sm focus:border-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:focus:border-orange-500"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditGroupOpen(false)}
              disabled={updateContactGroup.isPending}
              className="h-11 border-2 border-gray-300 px-6 font-medium shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpdateGroup}
              disabled={updateContactGroup.isPending || !editGroupName.trim() || !apiKey}
              className="h-11 bg-gradient-to-r from-orange-500 to-red-500 px-8 font-bold text-white shadow-lg transition-all duration-200 hover:from-orange-600 hover:to-red-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updateContactGroup.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Group
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Group Confirmation Dialog */}
      <AlertDialog open={isDeleteGroupOpen} onOpenChange={setIsDeleteGroupOpen}>
        <AlertDialogContent className="max-w-md border-2 border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
          <AlertDialogHeader>
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/30">
                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <AlertDialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                Delete Contact Group
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base text-gray-600 dark:text-gray-400">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                &quot;{selectedGroup?.name}&quot;
              </span>
              ? This action cannot be undone and will permanently delete all contacts in this group.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteGroupOpen(false);
                setGroupToDelete(null);
              }}
              className="h-10 border-2 border-gray-300 px-6 font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteContactGroup.isPending}
              className="h-10 bg-red-600 px-6 font-semibold text-white shadow-md transition-all duration-200 hover:bg-red-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleteContactGroup.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Group
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
