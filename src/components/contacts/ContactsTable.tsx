"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader, TableSkeleton } from "@/components/ui/loader";
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
  User,
  Phone,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Volume2,
  VolumeX,
  Eye,
} from "lucide-react";
import { useContactGroupListContacts } from "@/controller/query/contacts/useContacts";
import { GetContactGroupListRequest } from "@/types";
import { format } from "date-fns";
interface ContactsTableProps {
  contactGroupId: number | null;
  apiKey: string | null;
  title?: string;
  description?: string;
  defaultSort?: string;
  defaultPerPage?: number;
  showSearch?: boolean;
  className?: string;
  onContactUpdate?: (contact: Record<string, unknown>) => void;
  onContactDelete?: (contact: Record<string, unknown>) => void;
  onContactStatusChange?: (contact: Record<string, unknown>) => void;
}
export function ContactsTable({
  contactGroupId,
  apiKey,
  title = "Contacts",
  description = "A list of contacts in this group",
  defaultSort = "contact_group_msisdn.id|desc",
  defaultPerPage = 25,
  showSearch = true,
  className = "",
  onContactUpdate,
  onContactDelete,
  onContactStatusChange,
}: ContactsTableProps) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(defaultPerPage);
  const [search, setSearch] = useState("");
  const requestData = useMemo<GetContactGroupListRequest | null>(() => {
    if (!contactGroupId) return null;
    return {
      sort: "contact_group_msisdn.id|desc",
      page: page,
      per_page: perPage,
      service: "sms",
      route: "contact/group/list",
      id: contactGroupId,
      filter: search.trim() || "",
    };
  }, [contactGroupId, page, perPage, search]);
  const {
    data: listData,
    isLoading,
    isError,
    error,
    refetch,
  } = useContactGroupListContacts(requestData!, apiKey, !!apiKey && !!requestData);

  // Auto-refresh when contactGroupId changes (but avoid infinite loop)
  useEffect(() => {
    if (contactGroupId && apiKey && requestData) {
      // Small delay to ensure queries are invalidated first
      const timeoutId = setTimeout(() => {
        refetch();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [contactGroupId, apiKey]); // Only refetch when group or apiKey changes
  const { contacts, pagination } = useMemo(() => {
    if (!listData) return { contacts: [], pagination: null };
    const contactsList = listData.data || [];
    const paginationData = {
      current_page: listData.current_page,
      per_page: listData.per_page,
      total: listData.total,
      total_pages: listData.last_page,
      last_page: listData.last_page,
      from: listData.from,
      to: listData.to,
    };
    return {
      contacts: Array.isArray(contactsList) ? contactsList : [],
      pagination: paginationData,
    };
  }, [listData]);
  const filteredContacts = contacts;
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
  if (!contactGroupId) {
    return (
      <Card
        className={`border-border/50 bg-card border-2 shadow-lg dark:border-gray-700 ${className}`}
      >
        <CardContent className="p-8 md:p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <User className="mb-4 h-12 w-12 text-gray-400 md:h-16 md:w-16" />
            <p className="text-sm text-gray-500 dark:text-gray-400 md:text-base">
              Select a contact group to view its contacts
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card
      className={`border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 ${className}`}
    >
      <CardHeader className="border-b border-gray-200 px-6 py-5 dark:border-gray-800">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
              {description}
              {pagination && (
                <span className="ml-2 text-gray-500 dark:text-gray-500">
                  ({pagination.total || 0} contacts)
                </span>
              )}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isLoading}
            className="h-9 w-9"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Search and Filters Bar */}
        <div className="mb-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          {showSearch && (
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder="Search contacts by phone, name, email..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="h-10 border border-gray-300 bg-white pl-10 text-sm focus:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-gray-600"
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-[120px]">
              <Select
                value={perPage.toString()}
                onValueChange={(value) => {
                  setPerPage(parseInt(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-10 w-full border border-gray-300 bg-white text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
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
          </div>
        </div>
        {}
        {isLoading ? (
          <TableSkeleton rows={perPage} />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-8 md:py-12">
            <XCircle className="mb-3 h-8 w-8 text-red-400 md:mb-4 md:h-10 md:w-10 lg:h-12 lg:w-12" />
            <p className="px-4 text-center text-xs text-red-500 dark:text-red-400 md:text-sm lg:text-base">
              Error loading contacts: {error instanceof Error ? error.message : "Unknown error"}
            </p>
            <Button onClick={() => refetch()} variant="outline" className="mt-4">
              Try Again
            </Button>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 md:py-12">
            <User className="mb-3 h-8 w-8 text-gray-400 md:mb-4 md:h-10 md:w-10 lg:h-12 lg:w-12" />
            <p className="px-4 text-center text-xs text-gray-500 dark:text-gray-400 md:text-sm lg:text-base">
              {search ? "No contacts found matching your search" : "No contacts in this group"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
              <div className="w-full overflow-x-auto">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className="border-b border-gray-200 bg-gray-50 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50 dark:hover:bg-gray-800/50">
                      <TableHead className="w-[80px] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        ID
                      </TableHead>
                      <TableHead className="w-[150px] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        Phone Number
                      </TableHead>
                      <TableHead className="w-[140px] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        First Name
                      </TableHead>
                      <TableHead className="hidden w-[140px] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 md:table-cell">
                        Last Name
                      </TableHead>
                      <TableHead className="w-[110px] px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        Status
                      </TableHead>
                      <TableHead className="hidden w-[160px] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 md:table-cell">
                        Created Date
                      </TableHead>
                      <TableHead className="w-[140px] px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContacts.map((contact: Record<string, unknown>, idx: number) => {
                      const contactId = contact.contact_group_msisdn_id || contact.id || idx;
                      const isActive = contact.status === 1 || contact.status === undefined;
                      return (
                        <TableRow
                          key={contactId}
                          className="border-b border-gray-200 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                        >
                          <TableCell className="px-4 py-3">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {contact.contact_group_msisdn_id || contactId}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {contact.msisdn || "N/A"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {contact.first_name || "N/A"}
                            </span>
                          </TableCell>
                          <TableCell className="hidden px-4 py-3 md:table-cell">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {contact.last_name || "—"}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <div className="flex justify-center">
                              {isActive ? (
                                <Badge
                                  variant="outline"
                                  className="border-green-200 bg-green-50 text-xs text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400"
                                >
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                  Active
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="border-gray-300 bg-gray-50 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400"
                                >
                                  <XCircle className="mr-1 h-3 w-3" />
                                  Muted
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden px-4 py-3 md:table-cell">
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {formatDate(contact.created)}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800"
                                title="View contact details"
                                onClick={() => onContactUpdate?.(contact)}
                              >
                                <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800"
                                title={isActive ? "Mute contact" : "Unmute contact"}
                                onClick={() => onContactStatusChange?.(contact)}
                              >
                                {isActive ? (
                                  <VolumeX className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                ) : (
                                  <Volume2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-red-50 dark:hover:bg-red-950/20"
                                title="Delete contact"
                                onClick={() => onContactDelete?.(contact)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
            {}
            {pagination && pagination.total_pages > 1 && (
              <div className="mt-4 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-4 dark:border-gray-800 sm:flex-row">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing{" "}
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {pagination.from || 0}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {pagination.to || 0}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {pagination.total || 0}
                  </span>{" "}
                  contacts
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className="h-9 w-9 p-0"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-9 px-3"
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Prev
                  </Button>
                  <div className="px-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Page {page} of {pagination.total_pages || 1}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(pagination.total_pages || 1, p + 1))}
                    disabled={page >= (pagination.total_pages || 1)}
                    className="h-9 px-3"
                  >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(pagination.total_pages || 1)}
                    disabled={page >= (pagination.total_pages || 1)}
                    className="h-9 w-9 p-0"
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
