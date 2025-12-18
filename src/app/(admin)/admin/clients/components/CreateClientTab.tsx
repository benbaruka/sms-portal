"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAlert } from "@/context/AlertProvider";
import {
  useAdminClientAccountTypes,
  useAdminClientCountries,
  useCreateAdminClient,
} from "@/controller/query/admin/clients/useAdminClients";
import { getCountryFlag, getCountryName } from "@/utils/countryFlags";
import { Info, Landmark, Loader2, Mail, MapPin, Phone, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

const sanitizePhone = (value: string) => value.replace(/\s+/g, "");

export default function CreateClientTab() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
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

  const createClientMutation = useCreateAdminClient();

  const accountTypeOptions = useMemo(() => {
    const source = accountTypesData?.data || accountTypesData?.message || [];
    return Array.isArray(source) ? source : [];
  }, [accountTypesData]);

  const countryOptions = useMemo(() => {
    const source = countriesData?.data || countriesData?.message || [];
    return Array.isArray(source) ? source : [];
  }, [countriesData]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiKey) {
      showAlert({
        variant: "error",
        title: "Missing API key",
        message: "Please sign in again to create a new client.",
      });
      return;
    }

    try {
      await createClientMutation.mutateAsync({
        data: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          msisdn: sanitizePhone(formData.msisdn.trim()),
          account_type: formData.account_type,
          country_code: formData.country_code,
          address: formData.address.trim(),
        },
        apiKey,
      });

      // Réinitialiser le formulaire
      setFormData({
        name: "",
        email: "",
        msisdn: "",
        account_type: "",
        country_code: "",
        address: "",
      });
      setNotes("");

      // Naviguer vers l'onglet "clients" pour voir le nouveau client
      // Le refetch sera automatique grâce à l'invalidation du cache dans useCreateAdminClient
      router.push("/admin/clients?tab=clients");
    } catch {
      // Alert handled in mutation
    }
  };

  const isSubmitting = createClientMutation.isPending;

  return (
    <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:gap-3 sm:text-xl">
          <Landmark className="h-4 w-4 text-blue-500 dark:text-blue-400 sm:h-5 sm:w-5" />
          Create New Client
        </CardTitle>
        <CardDescription className="mt-1 text-sm text-gray-600 dark:text-gray-400 sm:mt-2">
          Provide the legal entity information and choose the corresponding account tier.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <CardContent className="flex-1 space-y-6 p-4 pt-0 sm:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-900 dark:text-white">
                Company name *
              </Label>
              <div className="relative">
                <Landmark className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 dark:text-gray-500" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Example: SMS Portail SARL"
                  required
                  className="h-11 rounded-2xl border-2 pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-900 dark:text-white">
                Primary email *
              </Label>
              <div className="relative">
                <Mail className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 dark:text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, email: event.target.value }))
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
              <Label htmlFor="country_code" className="text-gray-900 dark:text-white">
                Country *
              </Label>
              <Select
                value={formData.country_code}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, country_code: value }));
                  // Mettre à jour le préfixe du numéro de téléphone si nécessaire
                  const selectedCountry = countryOptions.find(
                    (c: { code?: string; dial_code?: string; name?: string }) =>
                      String(c.code ?? c.dial_code ?? c.name) === value
                  );
                  if (
                    selectedCountry?.dial_code &&
                    !formData.msisdn.startsWith(selectedCountry.dial_code)
                  ) {
                    setFormData((prev) => ({
                      ...prev,
                      country_code: value,
                      msisdn: selectedCountry.dial_code || prev.msisdn,
                    }));
                  }
                }}
              >
                <SelectTrigger className="h-11 rounded-2xl border-2" disabled={isLoadingCountries}>
                  <SelectValue placeholder="Select country">
                    {formData.country_code &&
                      (() => {
                        const selectedCountry = countryOptions.find(
                          (c: { code?: string; dial_code?: string; name?: string }) =>
                            String(c.code ?? c.dial_code ?? c.name) === formData.country_code
                        );
                        if (!selectedCountry) return formData.country_code;
                        const flag = getCountryFlag(selectedCountry.code || formData.country_code);
                        const name = getCountryName(formData.country_code, selectedCountry);
                        return (
                          <span className="flex items-center gap-2">
                            <span className="text-lg">{flag}</span>
                            <span>{name}</span>
                            {selectedCountry.dial_code && (
                              <span className="text-muted-foreground text-sm">
                                {selectedCountry.dial_code}
                              </span>
                            )}
                          </span>
                        );
                      })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {countryOptions.length === 0 ? (
                    <SelectItem value="" disabled>
                      {isLoadingCountries ? "Loading countries..." : "No country codes available"}
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
                      .map((country: { code?: string; dial_code?: string; name?: string }) => {
                        const countryCode =
                          country.code || country.dial_code?.replace("+", "") || country.name || "";
                        const flag = getCountryFlag(country.code || countryCode);
                        const displayName = getCountryName(countryCode, country);
                        const dialCode = country.dial_code || country.code || "";

                        return (
                          <SelectItem
                            key={country.code ?? country.dial_code ?? country.name}
                            value={String(country.code ?? country.dial_code ?? country.name)}
                            className="flex items-center gap-2"
                          >
                            <span className="flex w-full items-center gap-2">
                              <span className="text-lg">{flag}</span>
                              <span className="flex-1">{displayName}</span>
                              {dialCode && (
                                <span className="text-muted-foreground text-sm">{dialCode}</span>
                              )}
                            </span>
                          </SelectItem>
                        );
                      })
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="msisdn" className="text-gray-900 dark:text-white">
                Phone number *
              </Label>
              <div className="relative">
                {formData.country_code && (
                  <span className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 text-lg">
                    {getCountryFlag(
                      countryOptions.find(
                        (c: { code?: string; dial_code?: string; name?: string }) =>
                          String(c.code ?? c.dial_code ?? c.name) === formData.country_code
                      )?.code || formData.country_code
                    )}
                  </span>
                )}
                <Phone
                  className={`absolute ${formData.country_code ? "left-9" : "left-3"} text-muted-foreground top-1/2 h-4 w-4 -translate-y-1/2 dark:text-gray-500`}
                />
                <Input
                  id="msisdn"
                  value={formData.msisdn}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, msisdn: event.target.value }))
                  }
                  placeholder={
                    countryOptions.find(
                      (c: { code?: string; dial_code?: string; name?: string }) =>
                        String(c.code ?? c.dial_code ?? c.name) === formData.country_code
                    )?.dial_code || "+243900000000"
                  }
                  required
                  className={`${formData.country_code ? "pl-14" : "pl-9"} h-11 rounded-2xl border-2`}
                />
              </div>
              <p className="text-muted-foreground text-xs dark:text-gray-400">
                This phone number receives OTPs, billing alerts and top-up confirmations.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="account_type" className="text-gray-900 dark:text-white">
                Account tier *
              </Label>
              <Select
                value={formData.account_type}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, account_type: value }))}
              >
                <SelectTrigger
                  className="h-11 rounded-2xl border-2"
                  disabled={isLoadingAccountTypes}
                >
                  <SelectValue placeholder="Select account tier">
                    {formData.account_type &&
                      (() => {
                        const selectedType = accountTypeOptions.find(
                          (type: {
                            id?: number | string;
                            code?: string;
                            name?: string;
                            label?: string;
                          }) => {
                            const typeValue = String(type.code ?? type.name ?? type.id ?? "");
                            return typeValue === formData.account_type;
                          }
                        );
                        return selectedType
                          ? selectedType.label ||
                              selectedType.name ||
                              selectedType.code ||
                              `Tier ${selectedType.id}`
                          : formData.account_type;
                      })()}
                  </SelectValue>
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
                        // Utiliser le code en priorité, puis name, puis id comme valeur
                        // Cela garantit que "premium" sera envoyé au backend
                        const value = type.code || type.name || String(type.id ?? "");
                        const label = type.label || type.name || type.code || `Tier ${type.id}`;
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
              <Label htmlFor="address" className="text-gray-900 dark:text-white">
                Head office (optional)
              </Label>
              <div className="relative">
                <MapPin className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 dark:text-gray-500" />
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, address: event.target.value }))
                  }
                  placeholder="Street, city, building"
                  className="h-11 rounded-2xl border-2 pl-9"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-gray-900 dark:text-white">
              Internal notes (optional)
            </Label>
            <Textarea
              id="notes"
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
        </CardContent>
        <CardFooter className="mt-auto border-t border-gray-100 p-4 pt-0 dark:border-gray-800 sm:p-6">
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-muted-foreground text-xs dark:text-gray-400">
              Ensure KYB documents are collected after creation to unlock higher traffic volume.
            </div>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.name ||
                !formData.email ||
                !formData.msisdn ||
                !formData.account_type ||
                !formData.country_code
              }
              className="h-10 rounded-xl bg-brand-500 px-6 text-white shadow-md shadow-brand-500/15 hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600"
            >
              {isSubmitting ? (
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
        </CardFooter>
      </form>
    </Card>
  );
}
