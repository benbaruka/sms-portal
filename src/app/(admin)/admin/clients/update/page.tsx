"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Loader2,
  Building2,
  Save,
  ArrowLeft,
  Search,
  Mail,
  Phone,
  MapPin,
  Landmark,
  Info,
} from "lucide-react";
import { useAlert } from "@/context/AlertProvider";
import {
  useAdminClientAccountTypes,
  useAdminClientCountries,
  useAdminClientDetails,
  useUpdateAdminClient,
} from "@/controller/query/admin/clients/useAdminClients";
import { useSearchParams } from "next/navigation";
import type { AdminClient, AdminClientAccountType, AdminClientCountry } from "@/types";

const sanitizePhone = (value: string) => value.replace(/\s+/g, "");

export default function UpdateClientPage() {
  const { showAlert } = useAlert();
  const searchParams = useSearchParams();
  const initialClientId = searchParams.get("id") || "";

  const [apiKey, setApiKey] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState(initialClientId);
  const [selectedClientId, setSelectedClientId] = useState(initialClientId);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    msisdn: "",
    account_type: "",
    country_code: "",
    address: "",
  });

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const { data: accountTypesData, isLoading: isLoadingAccountTypes } = useAdminClientAccountTypes(
    apiKey,
    !!apiKey
  );
  const { data: countriesData, isLoading: isLoadingCountries } = useAdminClientCountries(
    apiKey,
    !!apiKey
  );

  const {
    data: clientDetails,
    isLoading: isLoadingDetails,
    refetch: refetchDetails,
  } = useAdminClientDetails(
    selectedClientId ? { client_id: selectedClientId } : null,
    apiKey,
    !!apiKey && !!selectedClientId
  );

  const updateClientMutation = useUpdateAdminClient();

  const accountTypeOptions = useMemo(() => {
    const source = accountTypesData?.data || accountTypesData?.message || [];
    return Array.isArray(source) ? source : [];
  }, [accountTypesData]);

  const countryOptions = useMemo(() => {
    const source = countriesData?.data || countriesData?.message || [];
    return Array.isArray(source) ? source : [];
  }, [countriesData]);

  useEffect(() => {
    if (clientDetails?.message || clientDetails?.data) {
      const payload = (clientDetails.message || clientDetails.data) as
        | AdminClient
        | { [key: string]: unknown };
      if (payload) {
        setFormData({
          name: (payload.name || payload.company_name || "") as string,
          email: (payload.email || "") as string,
          msisdn: (payload.msisdn || payload.phone || "") as string,
          account_type: payload.account_type_id
            ? String(payload.account_type_id)
            : ((payload.account_type || "") as string),
          country_code: (payload.country_code || "") as string,
          address: (payload.address || payload.location || "") as string,
        });
      }
    }
  }, [clientDetails]);

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      showAlert({
        variant: "error",
        title: "Client ID required",
        message: "Please enter an ID, email or reference to load the client.",
      });
      return;
    }
    setSelectedClientId(searchValue.trim());
    await refetchDetails();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiKey) {
      showAlert({
        variant: "error",
        title: "Missing API key",
        message: "Please sign in again to modify client records.",
      });
      return;
    }
    if (!selectedClientId) {
      showAlert({
        variant: "error",
        title: "Select a client first",
        message: "Search for a client before attempting to update the account.",
      });
      return;
    }

    try {
      await updateClientMutation.mutateAsync({
        data: {
          client_id: selectedClientId,
          name: formData.name.trim(),
          email: formData.email.trim(),
          msisdn: sanitizePhone(formData.msisdn.trim()),
          account_type: formData.account_type || undefined,
          country_code: formData.country_code || undefined,
          address: formData.address.trim() || undefined,
        },
        apiKey,
      });
      await refetchDetails();
    } catch {
      // Alert handled in mutation
    }
  };

  const isSubmitting = updateClientMutation.isPending;

  return (
    <div className="space-y-8 px-4 py-4 sm:space-y-10 sm:px-6 sm:py-6">
      <header className="rounded-3xl border border-gray-200 bg-white shadow-xl shadow-brand-500/10 dark:border-gray-900 dark:bg-gray-950">
        <div className="flex flex-col gap-6 px-6 py-6 sm:px-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 p-3 shadow-lg shadow-brand-500/40 sm:p-4">
              <Building2 className="h-6 w-6 text-white sm:h-8 sm:w-8" />
            </div>
            <div>
              <h1 className="text-[28px] font-semibold tracking-tight text-gray-900 dark:text-white sm:text-[32px]">
                Update client profile
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed dark:text-gray-300 sm:text-base">
                Locate a tenant by ID or email, adjust their details, or move them to a new account
                tier while keeping a complete audit trail.
              </p>
            </div>
          </div>
          <Link href="/admin/clients/all" className="w-full sm:w-auto">
            <Button variant="outline" className="h-10 w-full rounded-xl border-2 sm:h-11 sm:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to clients
            </Button>
          </Link>
        </div>
      </header>

      <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="p-4 pb-2 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
            <Search className="h-5 w-5 text-brand-500" />
            Locate client account
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Provide an internal ID, email or reference to load the client profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              placeholder="Client ID or email..."
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="h-11 rounded-xl border-2 sm:flex-1"
            />
            <Button
              onClick={handleSearch}
              disabled={!searchValue.trim() || isLoadingDetails}
              className="h-11 rounded-xl sm:w-[180px]"
            >
              {isLoadingDetails ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search client
                </>
              )}
            </Button>
          </div>
          <p className="text-muted-foreground mt-2 text-xs">
            Search is exact. Paste the identifier retrieved from the clients directory or API logs.
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:gap-3 sm:text-xl">
            <Landmark className="h-4 w-4 text-brand-500 sm:h-5 sm:w-5" />
            Client information
          </CardTitle>
          <CardDescription className="mt-1 text-sm text-gray-600 dark:text-gray-400 sm:mt-2">
            Edit the company details below. Fields stay locked until a client is loaded.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <CardContent className="flex-1 space-y-6 p-4 pt-0 sm:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Company name *</Label>
                <div className="relative">
                  <Landmark className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, name: event.target.value }))
                    }
                    placeholder="Company name"
                    required
                    disabled={!selectedClientId || isLoadingDetails}
                    className="h-11 rounded-2xl border-2 pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Primary email *</Label>
                <div className="relative">
                  <Mail className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, email: event.target.value }))
                    }
                    placeholder="contact@company.com"
                    required
                    disabled={!selectedClientId || isLoadingDetails}
                    className="h-11 rounded-2xl border-2 pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="country_code">Country code *</Label>
                <Select
                  value={formData.country_code}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, country_code: value }))
                  }
                >
                  <SelectTrigger
                    className="h-11 rounded-2xl border-2"
                    disabled={!selectedClientId || isLoadingCountries || isLoadingDetails}
                  >
                    <SelectValue placeholder="Select country code" />
                  </SelectTrigger>
                  <SelectContent>
                    {countryOptions.length === 0 ? (
                      <SelectItem value="" disabled>
                        {isLoadingCountries ? "Loading countries..." : "No country codes available"}
                      </SelectItem>
                    ) : (
                      countryOptions.map((country: AdminClientCountry) => (
                        <SelectItem
                          key={country.code ?? country.dial_code ?? country.name}
                          value={String(country.code ?? country.dial_code ?? country.name)}
                        >
                          {country.code || country.dial_code || country.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="msisdn">Phone number *</Label>
                <div className="relative">
                  <Phone className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="msisdn"
                    value={formData.msisdn}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, msisdn: event.target.value }))
                    }
                    placeholder="+243900000000"
                    required
                    disabled={!selectedClientId || isLoadingDetails}
                    className="h-11 rounded-2xl border-2 pl-9"
                  />
                </div>
                <p className="text-muted-foreground text-xs">
                  This number receives billing notifications and mobile money confirmations.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="account_type">Account tier *</Label>
                <Select
                  value={formData.account_type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, account_type: value }))
                  }
                >
                  <SelectTrigger
                    className="h-11 rounded-2xl border-2"
                    disabled={!selectedClientId || isLoadingAccountTypes || isLoadingDetails}
                  >
                    <SelectValue placeholder="Select account tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTypeOptions.length === 0 ? (
                      <SelectItem value="" disabled>
                        {isLoadingAccountTypes
                          ? "Loading account types..."
                          : "No account types available"}
                      </SelectItem>
                    ) : (
                      accountTypeOptions.map((type: AdminClientAccountType) => (
                        <SelectItem
                          key={type.id ?? type.code ?? type.name}
                          value={String(type.id ?? type.code ?? type.name)}
                        >
                          {type.name || type.label || type.code || `Tier ${type.id}`}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Head office (optional)</Label>
                <div className="relative">
                  <MapPin className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, address: event.target.value }))
                    }
                    placeholder="Street, city, building"
                    disabled={!selectedClientId || isLoadingDetails}
                    className="h-11 rounded-2xl border-2 pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-2xl border border-blue-100 bg-blue-50/80 px-4 py-3 text-xs text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/20 dark:text-blue-200">
              <Info className="mt-0.5 h-4 w-4" />
              Fields stay locked until a client profile is loaded. Account tier changes can impact
              pricing and credit limits.
            </div>
          </CardContent>
          <CardFooter className="mt-auto border-t border-gray-100 p-4 pt-0 dark:border-gray-800 sm:p-6">
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-muted-foreground text-xs">
                Every update is recorded. Ensure you keep the billing team informed about major
                changes.
              </div>
              <div className="flex gap-3">
                <Link href="/admin/clients/all">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    className="h-10 rounded-xl border-2"
                  >
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    isLoadingDetails ||
                    !selectedClientId ||
                    !formData.name ||
                    !formData.email ||
                    !formData.msisdn ||
                    !formData.account_type ||
                    !formData.country_code
                  }
                  className="h-10 rounded-xl px-6 shadow-md shadow-brand-500/15"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update client
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
