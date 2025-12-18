"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { useAlert } from "@/context/AlertProvider";
import {
  useAdminClientAccountTypes,
  useAdminClientCountries,
  useCreateAdminClient,
} from "@/controller/query/admin/clients/useAdminClients";
import {
  useAdminUserClients,
  useAdminUserRoles,
  useCreateAdminUser,
} from "@/controller/query/admin/users/useAdminUsers";
import { getCountryFlag, getCountryName } from "@/utils/countryFlags";
import {
  Building2,
  Info,
  KeyRound,
  Landmark,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  UserIcon,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

const sanitizePhone = (value: string) => value.replace(/\s+/g, "");

export default function CreateTab() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [createType, setCreateType] = useState<"client" | "user">("client");
  const [notes, setNotes] = useState("");

  // Client form data
  const [clientFormData, setClientFormData] = useState({
    name: "",
    email: "",
    msisdn: "",
    account_type: "",
    country_code: "",
    address: "",
  });

  // User form data
  const [userFormData, setUserFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    msisdn: "",
    role_id: "",
    client_id: "",
  });

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  // Client hooks
  const { data: accountTypesData, isLoading: isLoadingAccountTypes } = useAdminClientAccountTypes(
    apiKey,
    !!apiKey && createType === "client"
  );
  const { data: countriesData, isLoading: isLoadingCountries } = useAdminClientCountries(
    apiKey,
    !!apiKey && createType === "client"
  );
  const createClientMutation = useCreateAdminClient();

  // User hooks
  const { data: rolesData, isLoading: isLoadingRoles } = useAdminUserRoles(
    apiKey,
    !!apiKey && createType === "user"
  );
  const { data: clientsData, isLoading: isLoadingClients } = useAdminUserClients(
    apiKey,
    !!apiKey && createType === "user"
  );
  const createUserMutation = useCreateAdminUser();

  const accountTypeOptions = useMemo(() => {
    const source = accountTypesData?.data || accountTypesData?.message || [];
    return Array.isArray(source) ? source : [];
  }, [accountTypesData]);

  const countryOptions = useMemo(() => {
    const source = countriesData?.data || countriesData?.message || [];
    return Array.isArray(source) ? source : [];
  }, [countriesData]);

  const roleOptions = useMemo(() => {
    const source = rolesData?.data || rolesData?.message || [];
    return Array.isArray(source) ? source : [];
  }, [rolesData]);

  const clientOptions = useMemo(() => {
    const source = clientsData?.data || clientsData?.message || [];
    return Array.isArray(source) ? source : [];
  }, [clientsData]);

  const handleClientSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiKey) {
      showAlert({
        variant: "error",
        title: "Missing API key",
        message: "Please sign in again to create a new client.",
      });
      return;
    }

    // Validation des champs requis
    if (!clientFormData.country_code || clientFormData.country_code.trim() === "") {
      showAlert({
        variant: "error",
        title: "Country required",
        message: "Please select a country.",
      });
      return;
    }

    try {
      await createClientMutation.mutateAsync({
        data: {
          name: clientFormData.name.trim(),
          email: clientFormData.email.trim(),
          msisdn: sanitizePhone(clientFormData.msisdn.trim()),
          account_type: clientFormData.account_type,
          country_code: clientFormData.country_code,
          address: clientFormData.address.trim(),
        },
        apiKey,
      });

      setClientFormData({
        name: "",
        email: "",
        msisdn: "",
        account_type: "",
        country_code: "",
        address: "",
      });
      setNotes("");
      router.push("/admin/clients?tab=clients");
    } catch {
      // Alert handled in mutation
    }
  };

  const handleUserSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiKey) {
      showAlert({
        variant: "error",
        title: "Missing API key",
        message: "Please sign in again to create a new user.",
      });
      return;
    }

    if (!userFormData.password || userFormData.password.length < 6) {
      showAlert({
        variant: "error",
        title: "Password too short",
        message: "Please provide a password with at least 6 characters.",
      });
      return;
    }

    try {
      // Convertir role_id et client_id en nombres si nécessaire
      const roleId = userFormData.role_id
        ? typeof userFormData.role_id === "string"
          ? parseInt(userFormData.role_id, 10)
          : Number(userFormData.role_id)
        : "";
      const clientId = userFormData.client_id
        ? typeof userFormData.client_id === "string"
          ? parseInt(userFormData.client_id, 10)
          : Number(userFormData.client_id)
        : "";

      if (!roleId || isNaN(Number(roleId))) {
        showAlert({
          variant: "error",
          title: "Invalid role",
          message: "Please select a valid role.",
        });
        return;
      }

      if (!clientId || isNaN(Number(clientId))) {
        showAlert({
          variant: "error",
          title: "Invalid client",
          message: "Please select a valid client.",
        });
        return;
      }

      await createUserMutation.mutateAsync({
        data: {
          full_name: userFormData.full_name.trim(),
          email: userFormData.email.trim(),
          password: userFormData.password,
          msisdn: sanitizePhone(userFormData.msisdn.trim()),
          role_id: roleId,
          client_id: clientId,
        },
        apiKey,
      });

      setUserFormData({
        full_name: "",
        email: "",
        password: "",
        msisdn: "",
        role_id: "",
        client_id: "",
      });
      setNotes("");
      router.push("/admin/clients?tab=users");
    } catch {
      // Alert handled in mutation
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:gap-3 sm:text-xl">
            <Users className="h-4 w-4 text-blue-500 dark:text-blue-400 sm:h-5 sm:w-5" />
            Create New
          </CardTitle>
          <CardDescription className="mt-1 text-sm text-gray-600 dark:text-gray-400 sm:mt-2">
            Choose what you want to create: a new client organization or a new user account.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6">
          <Tabs value={createType} onValueChange={(v) => setCreateType(v as "client" | "user")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="client" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Client
              </TabsTrigger>
              <TabsTrigger value="user" className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                User
              </TabsTrigger>
            </TabsList>

            <TabsContent value="client" className="mt-6">
              <form onSubmit={handleClientSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="client-name" className="text-gray-900 dark:text-white">
                      Company name *
                    </Label>
                    <div className="relative">
                      <Landmark className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 dark:text-gray-500" />
                      <Input
                        id="client-name"
                        value={clientFormData.name}
                        onChange={(event) =>
                          setClientFormData((prev) => ({ ...prev, name: event.target.value }))
                        }
                        placeholder="Example: SMS Portail SARL"
                        required
                        className="h-11 rounded-2xl border-2 pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-email" className="text-gray-900 dark:text-white">
                      Primary email *
                    </Label>
                    <div className="relative">
                      <Mail className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 dark:text-gray-500" />
                      <Input
                        id="client-email"
                        type="email"
                        value={clientFormData.email}
                        onChange={(event) =>
                          setClientFormData((prev) => ({ ...prev, email: event.target.value }))
                        }
                        placeholder="finance@company.com"
                        required
                        className="h-11 rounded-2xl border-2 pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="client-country_code" className="text-gray-900 dark:text-white">
                      Country *
                    </Label>
                    <Select
                      value={clientFormData.country_code}
                      onValueChange={(value) => {
                        setClientFormData((prev) => ({ ...prev, country_code: value }));
                      }}
                    >
                      <SelectTrigger
                        id="client-country_code"
                        className="h-11 rounded-2xl border-2"
                        disabled={isLoadingCountries}
                      >
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {countryOptions.length === 0 ? (
                          <SelectItem value="" disabled>
                            {isLoadingCountries
                              ? "Loading countries..."
                              : "No country codes available"}
                          </SelectItem>
                        ) : (
                          countryOptions
                            .sort(
                              (
                                a: { name?: string; code?: string },
                                b: { name?: string; code?: string }
                              ) => {
                                const nameA = (a.name || a.code || "").toLowerCase();
                                const nameB = (b.name || b.code || "").toLowerCase();
                                return nameA.localeCompare(nameB);
                              }
                            )
                            .map(
                              (country: { code?: string; dial_code?: string; name?: string }) => {
                                const countryCode =
                                  country.code ||
                                  country.dial_code?.replace("+", "") ||
                                  country.name ||
                                  "";
                                const flag = getCountryFlag(country.code || countryCode);
                                const displayName = getCountryName(countryCode, country);
                                const dialCode = country.dial_code || country.code || "";

                                return (
                                  <SelectItem
                                    key={country.code ?? country.dial_code ?? country.name}
                                    value={String(
                                      country.code ?? country.dial_code ?? country.name
                                    )}
                                    className="flex items-center gap-2"
                                  >
                                    <span className="flex w-full items-center gap-2">
                                      <span className="text-lg">{flag}</span>
                                      <span className="flex-1">{displayName}</span>
                                      {dialCode && (
                                        <span className="text-muted-foreground text-sm">
                                          {dialCode}
                                        </span>
                                      )}
                                    </span>
                                  </SelectItem>
                                );
                              }
                            )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-msisdn" className="text-gray-900 dark:text-white">
                      Phone number *
                    </Label>
                    <div className="relative">
                      <Phone className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 dark:text-gray-500" />
                      <Input
                        id="client-msisdn"
                        value={clientFormData.msisdn}
                        onChange={(event) =>
                          setClientFormData((prev) => ({ ...prev, msisdn: event.target.value }))
                        }
                        placeholder="+243900000000"
                        required
                        className="h-11 rounded-2xl border-2 pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="client-account_type" className="text-gray-900 dark:text-white">
                      Account tier *
                    </Label>
                    <Select
                      value={clientFormData.account_type}
                      onValueChange={(value) =>
                        setClientFormData((prev) => ({ ...prev, account_type: value }))
                      }
                    >
                      <SelectTrigger
                        id="client-account_type"
                        className="h-11 rounded-2xl border-2"
                        disabled={isLoadingAccountTypes}
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
                          accountTypeOptions.map(
                            (type: {
                              id?: number | string;
                              code?: string;
                              name?: string;
                              label?: string;
                            }) => {
                              const value = type.code || type.name || String(type.id ?? "");
                              const label =
                                type.label || type.name || type.code || `Tier ${type.id}`;
                              return (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              );
                            }
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-address" className="text-gray-900 dark:text-white">
                      Head office (optional)
                    </Label>
                    <div className="relative">
                      <MapPin className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 dark:text-gray-500" />
                      <Input
                        id="client-address"
                        value={clientFormData.address}
                        onChange={(event) =>
                          setClientFormData((prev) => ({ ...prev, address: event.target.value }))
                        }
                        placeholder="Street, city, building"
                        className="h-11 rounded-2xl border-2 pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-notes" className="text-gray-900 dark:text-white">
                    Internal notes (optional)
                  </Label>
                  <Textarea
                    id="client-notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Add context for the billing team, special pricing, or documents collected."
                    rows={4}
                    className="rounded-2xl border-2"
                  />
                  <div className="text-muted-foreground flex items-start gap-2 text-xs dark:text-gray-400">
                    <Info className="mt-0.5 h-4 w-4 text-blue-500 dark:text-blue-400" />
                    Notes stay internal for your team and are not sent with the API request.
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={
                      createClientMutation.isPending ||
                      !clientFormData.name ||
                      !clientFormData.email ||
                      !clientFormData.msisdn ||
                      !clientFormData.account_type ||
                      !clientFormData.country_code
                    }
                    className="h-10 rounded-xl bg-brand-500 px-6 text-white shadow-md shadow-brand-500/15 hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600"
                  >
                    {createClientMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Create client
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="user" className="mt-6">
              <form onSubmit={handleUserSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="user-full_name" className="text-gray-900 dark:text-white">
                      Full name *
                    </Label>
                    <div className="relative">
                      <UserIcon className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 dark:text-gray-500" />
                      <Input
                        id="user-full_name"
                        value={userFormData.full_name}
                        onChange={(event) =>
                          setUserFormData((prev) => ({ ...prev, full_name: event.target.value }))
                        }
                        placeholder="Jane Doe"
                        required
                        className="h-11 rounded-2xl border-2 pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-email" className="text-gray-900 dark:text-white">
                      Email *
                    </Label>
                    <div className="relative">
                      <Mail className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 dark:text-gray-500" />
                      <Input
                        id="user-email"
                        type="email"
                        value={userFormData.email}
                        onChange={(event) =>
                          setUserFormData((prev) => ({ ...prev, email: event.target.value }))
                        }
                        placeholder="jane.doe@company.com"
                        required
                        className="h-11 rounded-2xl border-2 pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="user-password" className="text-gray-900 dark:text-white">
                      Temporary password *
                    </Label>
                    <div className="relative">
                      <KeyRound className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 dark:text-gray-500" />
                      <Input
                        id="user-password"
                        type="password"
                        value={userFormData.password}
                        onChange={(event) =>
                          setUserFormData((prev) => ({ ...prev, password: event.target.value }))
                        }
                        placeholder="Minimum 6 characters"
                        required
                        className="h-11 rounded-2xl border-2 pl-9"
                      />
                    </div>
                    <p className="text-muted-foreground text-xs dark:text-gray-400">
                      They will be prompted to change it on first login if the policy requires it.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-msisdn" className="text-gray-900 dark:text-white">
                      Phone number *
                    </Label>
                    <div className="relative">
                      <Phone className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 dark:text-gray-500" />
                      <Input
                        id="user-msisdn"
                        value={userFormData.msisdn}
                        onChange={(event) =>
                          setUserFormData((prev) => ({ ...prev, msisdn: event.target.value }))
                        }
                        placeholder="+243900000000"
                        required
                        className="h-11 rounded-2xl border-2 pl-9"
                      />
                    </div>
                    <p className="text-muted-foreground text-xs dark:text-gray-400">
                      Use the international format. This is used for OTP and top-up workflows.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="user-role_id" className="text-gray-900 dark:text-white">
                      Role *
                    </Label>
                    <Select
                      value={userFormData.role_id}
                      onValueChange={(value) =>
                        setUserFormData((prev) => ({ ...prev, role_id: value }))
                      }
                    >
                      <SelectTrigger
                        id="user-role_id"
                        className="h-11 rounded-2xl border-2"
                        disabled={isLoadingRoles}
                      >
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.length === 0 ? (
                          <SelectItem value="" disabled>
                            {isLoadingRoles ? "Loading roles..." : "No roles available"}
                          </SelectItem>
                        ) : (
                          roleOptions.map((role: any) => (
                            <SelectItem
                              key={role.id ?? role.name}
                              value={String(role.id ?? role.name)}
                            >
                              {role.name || role.label || role.title || `Role ${role.id}`}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-client_id" className="text-gray-900 dark:text-white">
                      Client space *
                    </Label>
                    <Select
                      value={userFormData.client_id}
                      onValueChange={(value) =>
                        setUserFormData((prev) => ({ ...prev, client_id: value }))
                      }
                    >
                      <SelectTrigger
                        id="user-client_id"
                        className="h-11 rounded-2xl border-2"
                        disabled={isLoadingClients}
                      >
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientOptions.length === 0 ? (
                          <SelectItem value="" disabled>
                            {isLoadingClients ? "Loading clients..." : "No clients available"}
                          </SelectItem>
                        ) : (
                          clientOptions.map((client: any) => (
                            <SelectItem
                              key={client.id ?? client.name}
                              value={String(client.id ?? client.name)}
                            >
                              {client.name || client.label || `Client ${client.id}`}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-notes" className="text-gray-900 dark:text-white">
                    Internal notes (optional)
                  </Label>
                  <Textarea
                    id="user-notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Add extra context for this account (e.g. department, special permissions...)"
                    rows={4}
                    className="rounded-2xl border-2"
                  />
                  <div className="text-muted-foreground flex items-start gap-2 text-xs dark:text-gray-400">
                    <Info className="mt-0.5 h-4 w-4 text-blue-500 dark:text-blue-400" />
                    This field is not sent with the request but helps your team keep track
                    internally.
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={
                      createUserMutation.isPending ||
                      !userFormData.full_name ||
                      !userFormData.email ||
                      !userFormData.password ||
                      !userFormData.msisdn ||
                      !userFormData.role_id ||
                      !userFormData.client_id
                    }
                    className="h-10 rounded-xl bg-brand-500 px-6 text-white shadow-md shadow-brand-500/15 hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600"
                  >
                    {createUserMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Create user
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
