"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAlert } from "@/context/AlertProvider";
import {
  useAdminClientAccountTypes,
  useAdminClientsList,
  useChangeAdminClientStatus,
  useUpdateAdminClient,
} from "@/controller/query/admin/clients/useAdminClients";
import type { AdminClient, AdminClientAccountType } from "@/types";
import { getCountryFlag } from "@/utils/countryFlags";
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit,
  Globe2,
  Hash,
  Landmark,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Save,
  Search,
  ToggleLeft,
  ToggleRight,
  XCircle,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All status" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

const normalizeStatus = (status: number | string | undefined): StatusFilter => {
  if (typeof status === "number") {
    return status === 1 ? "ACTIVE" : "INACTIVE";
  }
  const normalized = (status || "").toString().toUpperCase();
  if (["ACTIVE", "ENABLED", "APPROVED"].includes(normalized)) return "ACTIVE";
  if (["INACTIVE", "DISABLED", "SUSPENDED", "BLOCKED"].includes(normalized)) return "INACTIVE";
  return "INACTIVE";
};

const statusBadge = (status: StatusFilter) => {
  if (status === "ACTIVE") {
    return (
      <Badge variant="default" className="gap-1 bg-emerald-500 text-white">
        <CheckCircle2 className="h-3 w-3" />
        Active
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="gap-1">
      <XCircle className="h-3 w-3" />
      Inactive
    </Badge>
  );
};

const sanitizePhone = (value: string) => value.replace(/\s+/g, "");

// Pays mockés partagés - toujours disponibles
const MOCK_COUNTRIES = [
  { code: "CD", name: "Congo (DRC)", dial_code: "+243" },
  { code: "CG", name: "Congo (Brazzaville)", dial_code: "+242" },
  { code: "KE", name: "Kenya", dial_code: "+254" },
  { code: "UG", name: "Uganda", dial_code: "+256" },
  { code: "TZ", name: "Tanzania", dial_code: "+255" },
  { code: "RW", name: "Rwanda", dial_code: "+250" },
  { code: "BI", name: "Burundi", dial_code: "+257" },
  { code: "SO", name: "Somalia", dial_code: "+252" },
  { code: "ET", name: "Ethiopia", dial_code: "+251" },
  { code: "SS", name: "South Sudan", dial_code: "+211" },
  { code: "ER", name: "Eritrea", dial_code: "+291" },
  { code: "DJ", name: "Djibouti", dial_code: "+253" },
  { code: "CM", name: "Cameroon", dial_code: "+237" },
  { code: "NG", name: "Nigeria", dial_code: "+234" },
  { code: "GH", name: "Ghana", dial_code: "+233" },
  { code: "ZA", name: "South Africa", dial_code: "+27" },
  { code: "EG", name: "Egypt", dial_code: "+20" },
  { code: "MA", name: "Morocco", dial_code: "+212" },
  { code: "DZ", name: "Algeria", dial_code: "+213" },
  { code: "TN", name: "Tunisia", dial_code: "+216" },
  { code: "LY", name: "Libya", dial_code: "+218" },
  { code: "SD", name: "Sudan", dial_code: "+249" },
  { code: "TD", name: "Chad", dial_code: "+235" },
  { code: "NE", name: "Niger", dial_code: "+227" },
  { code: "ML", name: "Mali", dial_code: "+223" },
  { code: "BF", name: "Burkina Faso", dial_code: "+226" },
  { code: "SN", name: "Senegal", dial_code: "+221" },
  { code: "CI", name: "Ivory Coast", dial_code: "+225" },
  { code: "GN", name: "Guinea", dial_code: "+224" },
  { code: "SL", name: "Sierra Leone", dial_code: "+232" },
  { code: "LR", name: "Liberia", dial_code: "+231" },
  { code: "GM", name: "Gambia", dial_code: "+220" },
  { code: "GW", name: "Guinea-Bissau", dial_code: "+245" },
  { code: "MR", name: "Mauritania", dial_code: "+222" },
  { code: "CV", name: "Cape Verde", dial_code: "+238" },
  { code: "ST", name: "Sao Tome and Principe", dial_code: "+239" },
  { code: "GQ", name: "Equatorial Guinea", dial_code: "+240" },
  { code: "GA", name: "Gabon", dial_code: "+241" },
  { code: "AO", name: "Angola", dial_code: "+244" },
  { code: "ZM", name: "Zambia", dial_code: "+260" },
  { code: "MW", name: "Malawi", dial_code: "+265" },
  { code: "MZ", name: "Mozambique", dial_code: "+258" },
  { code: "ZW", name: "Zimbabwe", dial_code: "+263" },
  { code: "BW", name: "Botswana", dial_code: "+267" },
  { code: "NA", name: "Namibia", dial_code: "+264" },
  { code: "LS", name: "Lesotho", dial_code: "+266" },
  { code: "SZ", name: "Eswatini", dial_code: "+268" },
  { code: "MG", name: "Madagascar", dial_code: "+261" },
  { code: "MU", name: "Mauritius", dial_code: "+230" },
  { code: "SC", name: "Seychelles", dial_code: "+248" },
  { code: "KM", name: "Comoros", dial_code: "+269" },
  { code: "CF", name: "Central African Republic", dial_code: "+236" },
  { code: "BJ", name: "Benin", dial_code: "+229" },
  { code: "TG", name: "Togo", dial_code: "+228" },
];

export default function ClientsTab() {
  const { showAlert } = useAlert();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>("ALL");
  const [countryFilter, setCountryFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [perPage] = useState(100); // Augmenter pour récupérer plus de clients par page

  // Modal state for update
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<AdminClient | null>(null); // Store full client data
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

  const { data: accountTypesData } = useAdminClientAccountTypes(apiKey, !!apiKey);

  // Update client functionality
  // On utilise les données déjà présentes dans la liste pour pré-remplir le formulaire
  // Cela évite un appel API supplémentaire et rend l'ouverture du modal instantanée

  const updateClientMutation = useUpdateAdminClient();
  const changeStatusMutation = useChangeAdminClientStatus();

  // Pays pour le formulaire d'update - TOUJOURS retourner les pays mockés
  const countryOptionsForUpdate = MOCK_COUNTRIES;

  const handleOpenUpdateModal = (clientId: string | number | null | undefined) => {
    if (!clientId) return;
    setSelectedClientId(String(clientId));
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedClientId(null);
    setSelectedClient(null);
    setFormData({
      name: "",
      email: "",
      msisdn: "",
      account_type: "",
      country_code: "",
      address: "",
    });
  };

  const handleUpdateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiKey || !selectedClientId) {
      showAlert({
        variant: "error",
        title: "Missing API key",
        message: "Please sign in again to modify client records.",
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
      await refetch();
      handleCloseUpdateModal();
    } catch {
      // Alert handled in mutation
    }
  };

  const handleStatusToggle = async (client: {
    id?: number | string;
    client_id?: number | string;
    email?: string;
    status?: number | string;
  }) => {
    if (!apiKey) {
      showAlert({
        variant: "error",
        title: "Missing API key",
        message: "Please sign in again to change client statuses.",
      });
      return;
    }
    const currentStatus = normalizeStatus(client.status);
    const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const clientId = (client.id ?? client.client_id ?? client.email) as
        | string
        | number
        | undefined;
      if (!clientId) return;
      await changeStatusMutation.mutateAsync({
        data: {
          client_id: clientId,
          status: nextStatus,
        },
        apiKey,
      });
      await refetch();
    } catch {
      // Alert handled by mutation
    }
  };

  const {
    data: clientsResponse,
    isLoading,
    isFetching,
    refetch,
  } = useAdminClientsList(
    {
      page,
      per_page: perPage,
      // Ne pas envoyer search au backend si on fait le filtrage côté frontend
      // Le backend peut ne pas supporter tous les filtres, donc on les applique uniquement côté frontend
      search: undefined, // Filtrage côté frontend uniquement
      status: undefined, // Filtrage côté frontend uniquement
      account_type: undefined, // Filtrage côté frontend uniquement
      country_code: undefined, // Filtrage côté frontend uniquement
    },
    apiKey,
    !!apiKey
  );

  const clients = useMemo(() => {
    if (!clientsResponse) return [];
    const responseData = clientsResponse as Record<string, unknown>;

    // Essayer différents chemins pour trouver les clients
    let clientsArray: AdminClient[] = [];

    // Format 1: response.data (array direct - format /client/table avec Pagination)
    // Si data est un array, c'est les clients directement
    if (Array.isArray((responseData as { data?: unknown[] }).data)) {
      clientsArray = (responseData as { data: AdminClient[] }).data;
    }
    // Format 2: response.data.data (Pagination standard depuis /client/table)
    // Si data est un objet avec une propriété data qui est un array
    else if (Array.isArray((responseData as { data?: { data?: unknown[] } }).data?.data)) {
      clientsArray = (responseData as { data: { data: AdminClient[] } }).data.data;
    }
    // Format 3: response.clients (format depuis /client/all transformé)
    else if (Array.isArray((responseData as { clients?: unknown[] }).clients)) {
      clientsArray = (responseData as { clients: AdminClient[] }).clients;
    }
    // Format 4: response.message (array direct depuis /client/all)
    else if (Array.isArray((responseData as { message?: unknown[] }).message)) {
      clientsArray = (responseData as { message: AdminClient[] }).message;
    }
    // Format 5: response.message.data
    else if (Array.isArray((responseData as { message?: { data?: unknown[] } }).message?.data)) {
      clientsArray = (responseData as { message: { data: AdminClient[] } }).message.data;
    }
    // Format 6: response.message.clients
    else if (
      Array.isArray((responseData as { message?: { clients?: unknown[] } }).message?.clients)
    ) {
      clientsArray = (responseData as { message: { clients: AdminClient[] } }).message.clients;
    }

    // Filtrer les clients avec account_type = "root" (admin) et appliquer TOUS les filtres
    // Le backend peut ne pas supporter tous les filtres, donc on les applique uniquement côté frontend
    const filtered = clientsArray.filter((client: AdminClient) => {
      // Toujours exclure les clients root
      const accountType = client?.account_type || client?.accountType || "";
      if (accountType === "root") return false;

      // Appliquer le filtre de recherche (search)
      if (search && search.trim()) {
        const searchLower = search.toLowerCase().trim();
        const clientName = String(client.name || client.company_name || "").toLowerCase();
        const clientEmail = (client.email || "").toLowerCase();
        const clientPhone = String(client.msisdn || client.phone || "").toLowerCase();
        const clientId = String(client.id || client.client_id || "").toLowerCase();

        if (
          !clientName.includes(searchLower) &&
          !clientEmail.includes(searchLower) &&
          !clientPhone.includes(searchLower) &&
          !clientId.includes(searchLower)
        ) {
          return false;
        }
      }

      // Appliquer le filtre status
      if (statusFilter && statusFilter !== "ALL") {
        const clientStatus = normalizeStatus(client.status);
        if (clientStatus !== statusFilter) {
          return false;
        }
      }

      // Appliquer le filtre account_type si spécifié
      if (accountTypeFilter && accountTypeFilter !== "ALL") {
        const clientAccountType = String(accountType || "")
          .toLowerCase()
          .trim();
        const filterAccountType = String(accountTypeFilter).toLowerCase().trim();

        // Comparaison flexible: accepter la valeur exacte ou une correspondance partielle
        // Le filtre peut être un id, code, ou name, donc on compare avec toutes les variations possibles
        const clientAccountTypeVariations = [
          clientAccountType,
          String(accountType || "").trim(), // Version originale (non lowercase)
        ];

        const filterAccountTypeVariations = [
          filterAccountType,
          String(accountTypeFilter).trim(), // Version originale (non lowercase)
        ];

        // Vérifier si une des variations correspond
        const matches = clientAccountTypeVariations.some((clientVal) =>
          filterAccountTypeVariations.some(
            (filterVal) =>
              clientVal === filterVal ||
              clientVal === filterVal.toLowerCase() ||
              clientVal === filterVal.toUpperCase()
          )
        );

        if (!matches) {
          return false;
        }
      }

      // Appliquer le filtre country_code si spécifié (comparaison case-insensitive)
      if (countryFilter && countryFilter !== "ALL") {
        const clientCountryRaw = client?.country_code || client?.country || "";
        if (!clientCountryRaw || String(clientCountryRaw).trim() === "") {
          return false; // Si le client n'a pas de pays, exclure
        }

        // Normaliser les deux valeurs pour comparaison (en majuscules, sans espaces)
        const clientCountry = String(clientCountryRaw).toUpperCase().trim().replace(/\s+/g, "");
        const filterCountry = String(countryFilter).toUpperCase().trim().replace(/\s+/g, "");

        // Comparaison exacte (case-insensitive) - simple et directe
        if (clientCountry !== filterCountry) {
          return false;
        }
      }

      return true;
    });

    // Debug logs en développement
    if (
      process.env.NODE_ENV === "development" &&
      filtered.length === 0 &&
      clientsArray.length > 0
    ) {
      // No clients match the filters
    }

    return filtered;
  }, [clientsResponse, search, statusFilter, accountTypeFilter, countryFilter]);

  // Extraire les account types depuis la liste des clients (après la définition de clients)
  const accountTypeOptionsForUpdate = useMemo(() => {
    const source = accountTypesData?.data || accountTypesData?.message || [];
    const baseTypes = Array.isArray(source) ? source : [];

    // Extraire les account types uniques depuis la liste des clients
    const accountTypesFromClients = new Set<string>();
    if (clients && Array.isArray(clients)) {
      clients.forEach((client: AdminClient) => {
        const accountType = client.account_type || client.accountType;
        if (accountType && accountType !== "root") {
          accountTypesFromClients.add(String(accountType));
        }
      });
    }

    // Créer des options depuis les types extraits
    const extractedTypes = Array.from(accountTypesFromClients).map((type) => ({
      id: type,
      name: type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      code: type,
    }));

    // Combiner avec les types de base
    const allTypes = [...baseTypes];
    extractedTypes.forEach((type) => {
      if (
        !allTypes.find(
          (t: AdminClientAccountType) =>
            String(t.code || t.name || t.id || "") === String(type.code)
        )
      ) {
        allTypes.push(type);
      }
    });

    return allTypes.length > 0
      ? allTypes
      : [
          { id: "normal", name: "normal", label: "Normal", code: "normal" },
          { id: "premium", name: "premium", label: "Premium", code: "premium" },
          { id: "enterprise", name: "enterprise", label: "Enterprise", code: "enterprise" },
        ];
  }, [accountTypesData, clients]);

  // Load client details when modal opens - utiliser les données de la liste
  // Ce useEffect doit être après la définition de `clients`
  useEffect(() => {
    if (!isUpdateModalOpen || !selectedClientId || !clientsResponse) {
      if (!isUpdateModalOpen) {
        // Reset form when modal closes
        setFormData({
          name: "",
          email: "",
          msisdn: "",
          account_type: "",
          country_code: "",
          address: "",
        });
      }
      return;
    }

    // Extraire les clients de la réponse (même logique que dans le useMemo)
    const responseData = clientsResponse as Record<string, unknown>;
    let clientsArray: AdminClient[] = [];

    if (Array.isArray((responseData as { data?: unknown[] }).data)) {
      clientsArray = (responseData as { data: AdminClient[] }).data;
    } else if (Array.isArray((responseData as { data?: { data?: unknown[] } }).data?.data)) {
      clientsArray = (responseData as { data: { data: AdminClient[] } }).data.data;
    } else if (Array.isArray((responseData as { clients?: unknown[] }).clients)) {
      clientsArray = (responseData as { clients: AdminClient[] }).clients;
    } else if (Array.isArray((responseData as { message?: unknown[] }).message)) {
      clientsArray = (responseData as { message: AdminClient[] }).message;
    } else if (Array.isArray((responseData as { message?: { data?: unknown[] } }).message?.data)) {
      clientsArray = (responseData as { message: { data: AdminClient[] } }).message.data;
    } else if (
      Array.isArray((responseData as { message?: { clients?: unknown[] } }).message?.clients)
    ) {
      clientsArray = (responseData as { message: { clients: AdminClient[] } }).message.clients;
    }

    // Filtrer les root clients et trouver le client sélectionné
    const filteredClients = clientsArray.filter((c: AdminClient) => {
      const accountType = c?.account_type || c?.accountType || "";
      return accountType !== "root";
    });

    const client = filteredClients.find((c: AdminClient) => {
      const clientId = c.id || c.client_id;
      return clientId && String(clientId) === String(selectedClientId);
    });

    if (client) {
      // Store full client data for display
      setSelectedClient(client);

      // Pré-remplir le formulaire avec les données du client
      // Utiliser les données du client comme valeurs par défaut
      const nameValue = (client.name || client.company_name || "").toString().trim();
      const emailValue = (client.email || "").toString().trim();
      const msisdnValue = client.msisdn || client.phone || "";
      const msisdnString =
        typeof msisdnValue === "number"
          ? String(msisdnValue)
          : typeof msisdnValue === "string"
            ? msisdnValue.trim()
            : "";
      // Pour account_type, utiliser le code correspondant au type de compte
      const accountTypeValue = client.account_type || "";
      let accountTypeString = "";
      if (accountTypeValue) {
        const accountTypeStr = String(accountTypeValue).trim().toLowerCase();
        // Chercher le type correspondant dans les options pour obtenir le code
        const matchingType = accountTypeOptionsForUpdate?.find((t: AdminClientAccountType) => {
          const typeCode = (t.code || "").toLowerCase();
          const typeName = (t.name || "").toLowerCase();
          const typeId = String(t.id ?? "").toLowerCase();
          return (
            typeCode === accountTypeStr || typeName === accountTypeStr || typeId === accountTypeStr
          );
        });
        // Utiliser le code en priorité, puis name, puis la valeur originale
        accountTypeString = matchingType
          ? matchingType.code || matchingType.name || String(matchingType.id ?? "")
          : accountTypeStr;
      }

      // Normaliser le country_code en majuscules pour correspondre aux options
      const countryCodeValue = client.country_code || client.country || "";
      let normalizedCountryCode = "";
      if (countryCodeValue && String(countryCodeValue).trim()) {
        const codeStr = String(countryCodeValue).trim();
        // Chercher dans les options pour trouver la correspondance exacte
        const matchingCountry = countryOptionsForUpdate.find(
          (c: { code?: string; dial_code?: string; name?: string }) => {
            const codeMatch = c.code && c.code.toLowerCase() === codeStr.toLowerCase();
            const dialCodeMatch =
              c.dial_code && c.dial_code.replace("+", "").toLowerCase() === codeStr.toLowerCase();
            const nameMatch = c.name && c.name.toLowerCase() === codeStr.toLowerCase();
            return codeMatch || dialCodeMatch || nameMatch;
          }
        );
        // IMPORTANT: Utiliser TOUJOURS le code du pays en majuscules comme valeur
        // pour correspondre exactement aux valeurs des SelectItem
        normalizedCountryCode = matchingCountry
          ? matchingCountry.code
            ? matchingCountry.code.toUpperCase()
            : String(
                matchingCountry.code ?? matchingCountry.dial_code ?? matchingCountry.name
              ).toUpperCase()
          : codeStr.toUpperCase();
      }

      const addressValue = (client.address || "").toString().trim();

      // Toujours remplir le formulaire avec les données du client
      setFormData({
        name: nameValue,
        email: emailValue,
        msisdn: msisdnString,
        account_type: accountTypeString,
        country_code: normalizedCountryCode,
        address: addressValue,
      });
    }
  }, [
    isUpdateModalOpen,
    selectedClientId,
    clientsResponse,
    countryOptionsForUpdate,
    accountTypeOptionsForUpdate,
  ]);

  const pagination = useMemo(() => {
    if (!clientsResponse) return null;
    const responseData = clientsResponse as Record<string, unknown> & {
      total?: number;
      per_page?: number;
      current_page?: number;
      last_page?: number;
      total_pages?: number;
      from?: number;
      to?: number;
      data?:
        | unknown[]
        | {
            total?: number;
            per_page?: number;
            current_page?: number;
            last_page?: number;
            total_pages?: number;
            from?: number;
            to?: number;
            pagination?: unknown;
            data?: unknown[];
          };
      clients?: unknown[];
      message?: unknown[] | { data?: unknown[]; clients?: unknown[]; pagination?: unknown };
      pagination?: unknown;
    };

    // Format 1: Pagination directe (response est directement l'objet Pagination)
    // Format: { total, per_page, current_page, last_page, from, to, data: [...] }
    if (
      typeof responseData === "object" &&
      "total" in responseData &&
      Array.isArray(responseData.data)
    ) {
      return {
        total: (responseData.total as number) || 0,
        per_page: (responseData.per_page as number) || 10,
        current_page: (responseData.current_page as number) || 1,
        last_page: (responseData.last_page as number) || 1,
        total_pages:
          (responseData.last_page as number) || (responseData.total_pages as number) || 1,
        from: (responseData.from as number) || 0,
        to: (responseData.to as number) || 0,
      };
    }

    // Format 2: Pagination dans response.data (format enveloppé)
    if (
      responseData?.data &&
      typeof responseData.data === "object" &&
      !Array.isArray(responseData.data) &&
      "total" in responseData.data
    ) {
      const dataObj = responseData.data as {
        total?: number;
        per_page?: number;
        current_page?: number;
        last_page?: number;
        total_pages?: number;
        from?: number;
        to?: number;
      };
      return {
        total: dataObj.total || 0,
        per_page: dataObj.per_page || 10,
        current_page: dataObj.current_page || 1,
        last_page: dataObj.last_page || 1,
        total_pages: dataObj.last_page || dataObj.total_pages || 1,
        from: dataObj.from || 0,
        to: dataObj.to || 0,
      };
    }

    // Format 3: Pas de pagination (format /client/all qui retourne directement un array)
    // Créer une pagination fictive pour indiquer qu'on a tous les clients
    const clientsCount = Array.isArray(responseData?.data)
      ? responseData.data.length
      : Array.isArray(responseData?.clients)
        ? responseData.clients.length
        : Array.isArray(responseData?.message)
          ? responseData.message.length
          : 0;

    if (clientsCount > 0) {
      return {
        total: clientsCount,
        per_page: clientsCount,
        current_page: 1,
        last_page: 1,
        total_pages: 1,
        from: 1,
        to: clientsCount,
      };
    }

    // Fallback: chercher pagination ailleurs
    return (
      responseData.pagination ||
      (responseData.data &&
      typeof responseData.data === "object" &&
      !Array.isArray(responseData.data)
        ? (responseData.data as { pagination?: unknown }).pagination
        : null) ||
      (responseData.message &&
      typeof responseData.message === "object" &&
      !Array.isArray(responseData.message)
        ? (responseData.message as { pagination?: unknown }).pagination
        : null) ||
      null
    );
  }, [clientsResponse]);

  const accountTypeOptions = useMemo(() => {
    const source = accountTypesData?.data || accountTypesData?.message || [];
    return Array.isArray(source) ? source : [];
  }, [accountTypesData]);

  // Options de pays pour le filtre - Utiliser les pays mockés + extraire depuis les clients
  const countryOptions = useMemo(() => {
    // Base: pays mockés (toujours disponibles)
    const allCountries = new Map<string, { code?: string; name?: string; dial_code?: string }>();

    // Ajouter les pays mockés
    MOCK_COUNTRIES.forEach((country) => {
      if (country.code) {
        allCountries.set(country.code.toUpperCase(), country);
      }
    });

    // Extraire les pays uniques depuis la réponse brute (avant filtrage) pour les ajouter
    if (clientsResponse) {
      const responseData = clientsResponse as Record<string, unknown>;
      let allClientsArray: AdminClient[] = [];

      // Extraire tous les clients (sans filtrage)
      if (Array.isArray((responseData as { data?: unknown[] }).data)) {
        allClientsArray = (responseData as { data: AdminClient[] }).data;
      } else if (Array.isArray((responseData as { data?: { data?: unknown[] } }).data?.data)) {
        allClientsArray = (responseData as { data: { data: AdminClient[] } }).data.data;
      } else if (Array.isArray((responseData as { clients?: unknown[] }).clients)) {
        allClientsArray = (responseData as { clients: AdminClient[] }).clients;
      } else if (Array.isArray((responseData as { message?: unknown[] }).message)) {
        allClientsArray = (responseData as { message: AdminClient[] }).message;
      } else if (
        Array.isArray((responseData as { message?: { data?: unknown[] } }).message?.data)
      ) {
        allClientsArray = (responseData as { message: { data: AdminClient[] } }).message.data;
      } else if (
        Array.isArray((responseData as { message?: { clients?: unknown[] } }).message?.clients)
      ) {
        allClientsArray = (responseData as { message: { clients: AdminClient[] } }).message.clients;
      }

      // Extraire les pays depuis tous les clients
      allClientsArray.forEach((client: AdminClient) => {
        const accountType = client?.account_type || client?.accountType || "";
        if (accountType === "root") return; // Exclure les admins

        const countryCode = client.country_code || client.country || "";
        if (countryCode && String(countryCode).trim()) {
          const normalizedCode = String(countryCode).toUpperCase().trim();
          if (normalizedCode && !allCountries.has(normalizedCode)) {
            // Chercher dans les pays mockés pour obtenir le nom et dial_code
            const mockCountry = MOCK_COUNTRIES.find(
              (c) => c.code?.toUpperCase() === normalizedCode
            );
            allCountries.set(normalizedCode, {
              code: normalizedCode,
              name: mockCountry?.name || normalizedCode,
              dial_code: mockCountry?.dial_code,
            });
          }
        }
      });
    }

    return Array.from(allCountries.values()).sort((a, b) => {
      const nameA = (a.name || a.code || "").toLowerCase();
      const nameB = (b.name || b.code || "").toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [clientsResponse]);

  const stats = useMemo<{
    total: number;
    active: number;
    inactive: number;
    accounts: Set<string>;
    countries: Set<string>;
  }>(() => {
    const initialValue = {
      total: 0,
      active: 0,
      inactive: 0,
      accounts: new Set<string>(),
      countries: new Set<string>(),
    };
    return clients.reduce(
      (
        acc: {
          total: number;
          active: number;
          inactive: number;
          accounts: Set<string>;
          countries: Set<string>;
        },
        client: AdminClient
      ) => {
        const status = normalizeStatus(client.status);
        acc.total += 1;
        if (status === "ACTIVE") acc.active += 1;
        if (status === "INACTIVE") acc.inactive += 1;
        if (client.account_type) {
          acc.accounts.add(String(client.account_type));
        }
        if (client.country_code) {
          acc.countries.add(String(client.country_code));
        }
        return acc;
      },
      initialValue
    );
  }, [clients]);

  const isRefreshing = isFetching && !isLoading;

  const handleRefresh = async () => {
    try {
      await refetch();
      showAlert({
        variant: "success",
        title: "Clients refreshed",
        message: "The latest client directory has been loaded successfully.",
      });
    } catch (error: unknown) {
      showAlert({
        variant: "error",
        title: "Refresh failed",
        message: error instanceof Error ? error.message : "Unable to refresh the clients list.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <Building2 className="h-9 w-9 rounded-xl bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide dark:text-gray-400">
                Total clients
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-muted-foreground text-xs dark:text-gray-400">Active + inactive</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 className="h-9 w-9 rounded-xl bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-300" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide dark:text-gray-400">
                Active
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.active}</p>
              <p className="text-muted-foreground text-xs dark:text-gray-400">Live tenants</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <XCircle className="h-9 w-9 rounded-xl bg-amber-500/10 p-2 text-amber-600 dark:text-amber-300" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide dark:text-gray-400">
                Inactive
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.inactive}
              </p>
              <p className="text-muted-foreground text-xs dark:text-gray-400">Suspended</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <Globe2 className="h-9 w-9 rounded-xl bg-purple-500/10 p-2 text-purple-600 dark:text-purple-300" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide dark:text-gray-400">
                Countries
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.countries.size}
              </p>
              <p className="text-muted-foreground text-xs dark:text-gray-400">Markets covered</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Filters and Search */}
      <Card className="rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="p-4 pb-4 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
                <Building2 className="h-5 w-5 text-blue-500" />
                Client Directory
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm dark:text-gray-400">
                Search and filter clients by status, account tier or geography
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading || isRefreshing}
              className="h-10 rounded-xl border-2"
            >
              {isLoading || isRefreshing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </>
              )}
            </Button>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <div className="relative">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 dark:text-gray-500" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by client name, email or phone..."
                className="h-11 rounded-xl border-2 pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value as StatusFilter);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-11 rounded-xl border-2">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={accountTypeFilter}
              onValueChange={(value) => {
                setAccountTypeFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-11 rounded-xl border-2">
                <SelectValue placeholder="Account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All tiers</SelectItem>
                {accountTypeOptions.map(
                  (type: {
                    id?: number | string;
                    code?: string;
                    name?: string;
                    label?: string;
                  }) => (
                    <SelectItem
                      key={String(type.id ?? type.code ?? type.name)}
                      value={String(type.id ?? type.code ?? type.name)}
                    >
                      {type.name || type.label || type.code || `Type ${type.id}`}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            <Select
              value={countryFilter}
              onValueChange={(value) => {
                setCountryFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-11 rounded-xl border-2">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All countries</SelectItem>
                {countryOptions.length > 0
                  ? countryOptions.map(
                      (country: { code?: string; dial_code?: string; name?: string }) => {
                        // Utiliser le code du pays en majuscules comme valeur pour correspondre au format stocké
                        const countryValue = country.code
                          ? country.code.toUpperCase()
                          : String(country.dial_code ?? country.name ?? "").toUpperCase();
                        return (
                          <SelectItem key={countryValue} value={countryValue}>
                            {country.code || country.dial_code || country.name}
                          </SelectItem>
                        );
                      }
                    )
                  : null}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500 dark:text-blue-400" />
              <p className="text-muted-foreground text-sm dark:text-gray-400">Loading clients...</p>
            </div>
          ) : clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
              <Building2 className="text-muted-foreground h-10 w-10 dark:text-gray-500" />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                No clients match the current filters.
              </p>
              <p className="text-muted-foreground text-sm dark:text-gray-400">
                Adjust the filters to see more results.
              </p>
            </div>
          ) : (
            <>
              {/* Modern Grid Layout */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {clients.map((client: AdminClient) => {
                  const status = normalizeStatus(client.status);
                  const clientId = client.id || client.client_id;
                  const clientName = client.name || client.company_name || "Unnamed Client";
                  const clientEmail = client.email || "--";
                  const clientPhone = client.msisdn || client.phone || "--";
                  const accountType =
                    client.account_type_label ||
                    client.account_type_name ||
                    client.account_type ||
                    "—";
                  const country = client.country_code || client.country || "—";
                  const createdAt: string | undefined =
                    typeof (client.created_at || client.created || client.createdOn) === "string"
                      ? ((client.created_at || client.created || client.createdOn) as string)
                      : undefined;

                  return (
                    <Card
                      key={String(clientId || client.email || "")}
                      className="rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-blue-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-700"
                    >
                      <CardHeader className="p-4 pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <div
                              className={`rounded-xl p-2.5 ${
                                status === "ACTIVE" ? "bg-emerald-500/10" : "bg-gray-500/10"
                              }`}
                            >
                              <Building2
                                className={`h-5 w-5 ${
                                  status === "ACTIVE"
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-gray-600 dark:text-gray-400"
                                }`}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="truncate font-semibold text-gray-900 dark:text-white">
                                {String(clientName || "")}
                              </h3>
                              <div className="mt-1">{statusBadge(status)}</div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 p-4 pt-0">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="text-muted-foreground h-4 w-4 flex-shrink-0 dark:text-gray-500" />
                            <span className="text-muted-foreground truncate dark:text-gray-400">
                              {String(clientEmail || "")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="text-muted-foreground h-4 w-4 flex-shrink-0 dark:text-gray-500" />
                            <span className="text-muted-foreground dark:text-gray-400">
                              {String(clientPhone || "")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Briefcase className="text-muted-foreground h-4 w-4 flex-shrink-0 dark:text-gray-500" />
                            <span className="text-muted-foreground truncate dark:text-gray-400">
                              {String(accountType || "")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Globe2 className="text-muted-foreground h-4 w-4 flex-shrink-0 dark:text-gray-500" />
                            <span className="text-muted-foreground dark:text-gray-400">
                              {String(country || "")}
                            </span>
                          </div>
                          {createdAt && (
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="text-muted-foreground h-4 w-4 flex-shrink-0 dark:text-gray-500" />
                              <span className="text-muted-foreground text-xs dark:text-gray-400">
                                {new Date(createdAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                        {/* Action buttons */}
                        <div className="flex items-center gap-2 border-t border-gray-100 pt-2 dark:border-gray-800">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusToggle(client)}
                            disabled={changeStatusMutation.isPending || isRefreshing}
                            className="h-8 flex-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                          >
                            {status === "ACTIVE" ? (
                              <>
                                <ToggleLeft className="mr-1.5 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-xs text-emerald-600 dark:text-emerald-400">
                                  Suspend
                                </span>
                              </>
                            ) : (
                              <>
                                <ToggleRight className="mr-1.5 h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                <span className="text-xs text-amber-600 dark:text-amber-400">
                                  Activate
                                </span>
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleOpenUpdateModal(
                                clientId
                                  ? typeof clientId === "string"
                                    ? clientId
                                    : String(clientId)
                                  : null
                              )
                            }
                            className="h-8 flex-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20"
                          >
                            <Edit className="mr-1.5 h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                            <span className="text-xs text-blue-600 dark:text-blue-400">Edit</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination &&
                (pagination && typeof pagination === "object" && "total_pages" in pagination
                  ? (pagination as { total_pages?: number }).total_pages || 0
                  : 0) > 1 && (
                  <div className="mt-6 flex flex-col gap-4 border-t border-gray-200 pt-6 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-muted-foreground text-sm dark:text-gray-400">
                      Showing{" "}
                      {(pagination && typeof pagination === "object" && "from" in pagination
                        ? (pagination as { from?: number }).from
                        : null) || (page - 1) * perPage + 1}{" "}
                      to{" "}
                      {(pagination && typeof pagination === "object" && "to" in pagination
                        ? (pagination as { to?: number }).to
                        : null) ||
                        Math.min(
                          page * perPage,
                          (pagination && typeof pagination === "object" && "total" in pagination
                            ? (pagination as { total?: number }).total
                            : null) || clients.length
                        )}{" "}
                      of{" "}
                      {(pagination && typeof pagination === "object" && "total" in pagination
                        ? (pagination as { total?: number }).total
                        : null) || clients.length}{" "}
                      clients
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        disabled={page <= 1 || isLoading}
                        className="rounded-xl border-2"
                      >
                        Previous
                      </Button>
                      <span className="px-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                        Page {page} of{" "}
                        {(pagination &&
                        typeof pagination === "object" &&
                        "total_pages" in pagination
                          ? (pagination as { total_pages?: number }).total_pages
                          : null) ||
                          (pagination && typeof pagination === "object" && "last_page" in pagination
                            ? (pagination as { last_page?: number }).last_page
                            : null) ||
                          1}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setPage((prev) =>
                            Math.min(
                              prev + 1,
                              (pagination &&
                              typeof pagination === "object" &&
                              "total_pages" in pagination
                                ? (pagination as { total_pages?: number }).total_pages
                                : null) ||
                                (pagination &&
                                typeof pagination === "object" &&
                                "last_page" in pagination
                                  ? (pagination as { last_page?: number }).last_page
                                  : null) ||
                                prev + 1
                            )
                          )
                        }
                        disabled={
                          page >=
                            ((pagination &&
                            typeof pagination === "object" &&
                            "total_pages" in pagination
                              ? (pagination as { total_pages?: number }).total_pages
                              : null) ||
                              (pagination &&
                              typeof pagination === "object" &&
                              "last_page" in pagination
                                ? (pagination as { last_page?: number }).last_page
                                : null) ||
                              1) || isLoading
                        }
                        className="rounded-xl border-2"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Update Client Modal */}
      <Dialog
        open={isUpdateModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseUpdateModal();
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto rounded-3xl border-2 border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
          <DialogHeader className="space-y-3 border-b border-gray-200 pb-4 dark:border-gray-800">
            <DialogTitle className="flex items-center gap-3 text-2xl font-semibold text-gray-900 dark:text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30">
                <Edit className="h-5 w-5 text-white" />
              </div>
              Update Client Profile
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 dark:text-gray-400">
              Modify client information. All changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>

          {/* Client Information Section (Read-only) */}
          {selectedClient &&
            (() => {
              // Trouver le type de compte depuis accountTypesData
              const clientAccountType = String(selectedClient.account_type || "");
              const foundAccountType = accountTypeOptionsForUpdate?.find(
                (t: AdminClientAccountType) => {
                  const typeValue = t.code || t.name || String(t.id ?? "");
                  return typeValue === clientAccountType;
                }
              );
              const accountTypeLabel = foundAccountType
                ? String(
                    foundAccountType.label ||
                      foundAccountType.name ||
                      foundAccountType.code ||
                      `Tier ${foundAccountType.id}`
                  )
                : clientAccountType || "—";

              // Trouver le pays
              const countryCode = String(selectedClient.country_code || "");
              const foundCountry = countryOptionsForUpdate.find(
                (c: { code?: string; dial_code?: string; name?: string }) =>
                  (c.code && c.code.toUpperCase() === countryCode.toUpperCase()) ||
                  (c.dial_code &&
                    c.dial_code.replace("+", "").toUpperCase() === countryCode.toUpperCase())
              );
              const countryName = foundCountry
                ? String(foundCountry.name || foundCountry.code || countryCode)
                : countryCode || "—";
              const countryFlag = foundCountry
                ? getCountryFlag(foundCountry.code || countryCode)
                : getCountryFlag(countryCode);

              // Trouver la date de création
              const createdAtValue =
                selectedClient.created_at || selectedClient.created || selectedClient.registered_at;
              const createdAt =
                createdAtValue && typeof createdAtValue === "string"
                  ? new Date(createdAtValue).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : createdAtValue && typeof createdAtValue === "number"
                    ? new Date(createdAtValue * 1000).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "—";

              // Trouver la date de mise à jour
              const updatedAtValue = selectedClient.updated_at || selectedClient.updated;
              const updatedAt =
                updatedAtValue && typeof updatedAtValue === "string"
                  ? new Date(updatedAtValue).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : updatedAtValue && typeof updatedAtValue === "number"
                    ? new Date(updatedAtValue * 1000).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "—";

              // KYB Status
              const kybStatus = selectedClient.kyb_status || selectedClient.kybStatus || "—";
              const complianceStatus =
                selectedClient.compliance_status || selectedClient.complianceStatus || "—";

              return (
                <div className="mb-6 rounded-2xl border-2 border-blue-200/60 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 p-6 shadow-lg dark:border-gray-700 dark:from-blue-950/40 dark:via-cyan-950/40 dark:to-blue-950/40">
                  <h3 className="mb-5 flex items-center gap-2.5 text-base font-semibold text-gray-900 dark:text-white">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 dark:bg-blue-400/20">
                      <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    Client Information
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <div className="min-w-0">
                      <p className="text-muted-foreground mb-2 text-xs font-medium dark:text-gray-400">
                        Client ID
                      </p>
                      <p className="flex items-center gap-1.5 break-words text-sm font-semibold text-gray-900 dark:text-white">
                        <Hash className="h-3.5 w-3.5 flex-shrink-0 text-blue-500 dark:text-blue-400" />
                        <span className="truncate">
                          {String(selectedClient.id || selectedClient.client_id || "—")}
                        </span>
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-muted-foreground mb-2 text-xs font-medium dark:text-gray-400">
                        Status
                      </p>
                      <div className="flex items-center">
                        {normalizeStatus(selectedClient.status) === "ACTIVE" ? (
                          <Badge
                            variant="default"
                            className="w-fit gap-1 bg-emerald-500 text-white"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="w-fit gap-1">
                            <XCircle className="h-3 w-3" />
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-muted-foreground mb-2 text-xs font-medium dark:text-gray-400">
                        Account Type
                      </p>
                      <p className="flex items-center gap-1.5 break-words text-sm font-semibold text-gray-900 dark:text-white">
                        <Briefcase className="h-3.5 w-3.5 flex-shrink-0 text-blue-500 dark:text-blue-400" />
                        <span className="truncate">{accountTypeLabel}</span>
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-muted-foreground mb-2 text-xs font-medium dark:text-gray-400">
                        Balance
                      </p>
                      <p className="flex items-center gap-1.5 break-words text-sm font-semibold text-gray-900 dark:text-white">
                        <DollarSign className="h-3.5 w-3.5 flex-shrink-0 text-green-600 dark:text-green-400" />
                        <span className="truncate">
                          {selectedClient.balance !== undefined && selectedClient.balance !== null
                            ? Number(selectedClient.balance).toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                              })
                            : "—"}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-1 gap-4 border-t border-blue-200/50 pt-5 dark:border-gray-700 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <div className="min-w-0">
                      <p className="text-muted-foreground mb-2 text-xs font-medium dark:text-gray-400">
                        Email
                      </p>
                      <p className="flex items-start gap-1.5 break-words text-sm font-semibold text-gray-900 dark:text-white">
                        <Mail className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-blue-500 dark:text-blue-400" />
                        <span className="break-all">{String(selectedClient.email || "—")}</span>
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-muted-foreground mb-2 text-xs font-medium dark:text-gray-400">
                        Phone
                      </p>
                      <p className="flex items-center gap-1.5 break-words text-sm font-semibold text-gray-900 dark:text-white">
                        <Phone className="h-3.5 w-3.5 flex-shrink-0 text-blue-500 dark:text-blue-400" />
                        <span className="truncate">
                          {String(selectedClient.msisdn || selectedClient.phone || "—")}
                        </span>
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-muted-foreground mb-2 text-xs font-medium dark:text-gray-400">
                        Country
                      </p>
                      <p className="flex items-center gap-1.5 break-words text-sm font-semibold text-gray-900 dark:text-white">
                        <Globe2 className="h-3.5 w-3.5 flex-shrink-0 text-blue-500 dark:text-blue-400" />
                        <span className="mr-1">{countryFlag}</span>
                        <span className="truncate">{countryName}</span>
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-muted-foreground mb-2 text-xs font-medium dark:text-gray-400">
                        Address
                      </p>
                      <p className="flex items-start gap-1.5 break-words text-sm font-semibold text-gray-900 dark:text-white">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-blue-500 dark:text-blue-400" />
                        <span className="break-words">{String(selectedClient.address || "—")}</span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-1 gap-4 border-t border-blue-200/50 pt-5 dark:border-gray-700 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <div className="min-w-0">
                      <p className="text-muted-foreground mb-2 text-xs font-medium dark:text-gray-400">
                        KYB Status
                      </p>
                      <p className="break-words text-sm font-semibold text-gray-900 dark:text-white">
                        {String(kybStatus)}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-muted-foreground mb-2 text-xs font-medium dark:text-gray-400">
                        Compliance
                      </p>
                      <p className="break-words text-sm font-semibold text-gray-900 dark:text-white">
                        {String(complianceStatus)}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-muted-foreground mb-2 text-xs font-medium dark:text-gray-400">
                        Created
                      </p>
                      <p className="flex items-center gap-1.5 break-words text-sm font-semibold text-gray-900 dark:text-white">
                        <Clock className="h-3.5 w-3.5 flex-shrink-0 text-blue-500 dark:text-blue-400" />
                        <span className="truncate">{createdAt}</span>
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-muted-foreground mb-2 text-xs font-medium dark:text-gray-400">
                        Updated
                      </p>
                      <p className="flex items-center gap-1.5 break-words text-sm font-semibold text-gray-900 dark:text-white">
                        <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-blue-500 dark:text-blue-400" />
                        <span className="truncate">{updatedAt}</span>
                      </p>
                    </div>
                  </div>
                  {((selectedClient.billing_mode !== undefined &&
                    selectedClient.billing_mode !== null) ||
                    selectedClient.credit_limit !== undefined) && (
                    <div className="mt-5 grid grid-cols-1 gap-4 border-t border-blue-200/50 pt-5 dark:border-gray-700 sm:grid-cols-2">
                      {selectedClient.billing_mode !== undefined &&
                        selectedClient.billing_mode !== null &&
                        (() => {
                          const billingModeValue =
                            typeof selectedClient.billing_mode === "string"
                              ? selectedClient.billing_mode
                              : typeof selectedClient.billing_mode === "number"
                                ? String(selectedClient.billing_mode)
                                : null;
                          return billingModeValue ? (
                            <div className="min-w-0">
                              <p className="text-muted-foreground mb-2 text-xs font-medium dark:text-gray-400">
                                Billing Mode
                              </p>
                              <p className="break-words text-sm font-semibold text-gray-900 dark:text-white">
                                {billingModeValue}
                              </p>
                            </div>
                          ) : null;
                        })()}
                      {selectedClient.credit_limit !== undefined &&
                        selectedClient.credit_limit !== null && (
                          <div className="min-w-0">
                            <p className="text-muted-foreground mb-2 text-xs font-medium dark:text-gray-400">
                              Credit Limit
                            </p>
                            <p className="break-words text-sm font-semibold text-gray-900 dark:text-white">
                              {Number(selectedClient.credit_limit).toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                              })}
                            </p>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              );
            })()}

          <form onSubmit={handleUpdateSubmit} className="space-y-6">
            <div className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 shadow-sm dark:border-gray-800 dark:from-gray-900/50 dark:to-gray-800/30">
              <h4 className="mb-5 flex items-center gap-2.5 text-base font-semibold text-gray-900 dark:text-white">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 dark:bg-brand-400/20">
                  <Edit className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                </div>
                Editable Information
              </h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="update-name" className="text-gray-900 dark:text-white">
                    Company name *
                  </Label>
                  <div className="relative">
                    <Landmark className="text-muted-foreground absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 dark:text-gray-500" />
                    <Input
                      id="update-name"
                      value={formData.name}
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, name: event.target.value }))
                      }
                      placeholder="Company name"
                      required
                      disabled={updateClientMutation.isPending}
                      className="h-11 rounded-xl border-2 pl-10 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-400"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="update-email" className="text-gray-900 dark:text-white">
                    Primary email *
                  </Label>
                  <div className="relative">
                    <Mail className="text-muted-foreground absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 dark:text-gray-500" />
                    <Input
                      id="update-email"
                      type="email"
                      value={formData.email}
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, email: event.target.value }))
                      }
                      placeholder="contact@company.com"
                      required
                      disabled={updateClientMutation.isPending}
                      className="h-11 rounded-xl border-2 pl-10 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-400"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="update-msisdn" className="text-gray-900 dark:text-white">
                  Phone number *
                </Label>
                <div className="relative">
                  {formData.country_code && (
                    <span className="text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 text-lg">
                      {getCountryFlag(
                        countryOptionsForUpdate.find(
                          (c: { code?: string; dial_code?: string; name?: string }) =>
                            (c.code &&
                              c.code.toUpperCase() === formData.country_code.toUpperCase()) ||
                            (c.dial_code &&
                              c.dial_code.replace("+", "").toUpperCase() ===
                                formData.country_code.toUpperCase())
                        )?.code || formData.country_code
                      )}
                    </span>
                  )}
                  <Phone
                    className={`absolute ${formData.country_code ? "left-10" : "left-3.5"} text-muted-foreground top-1/2 h-4 w-4 -translate-y-1/2 dark:text-gray-500`}
                  />
                  <Input
                    id="update-msisdn"
                    value={formData.msisdn}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, msisdn: event.target.value }))
                    }
                    placeholder={
                      countryOptionsForUpdate.find(
                        (c: { code?: string; dial_code?: string; name?: string }) =>
                          (c.code &&
                            c.code.toUpperCase() === formData.country_code.toUpperCase()) ||
                          (c.dial_code &&
                            c.dial_code.replace("+", "").toUpperCase() ===
                              formData.country_code.toUpperCase())
                      )?.dial_code || "+243900000000"
                    }
                    required
                    disabled={updateClientMutation.isPending}
                    className={`${formData.country_code ? "pl-14" : "pl-10"} h-11 rounded-xl border-2 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-400`}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="update-account_type" className="text-gray-900 dark:text-white">
                    Account tier *
                  </Label>
                  <Select
                    value={formData.account_type}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, account_type: value }))
                    }
                  >
                    <SelectTrigger
                      className="h-11 rounded-xl border-2 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-400"
                      disabled={updateClientMutation.isPending}
                    >
                      <SelectValue placeholder="Select account tier">
                        {formData.account_type
                          ? (() => {
                              const selectedType = accountTypeOptionsForUpdate?.find(
                                (t: AdminClientAccountType) => {
                                  const typeValue = t.code || t.name || String(t.id ?? "");
                                  return typeValue === formData.account_type;
                                }
                              );
                              return selectedType
                                ? selectedType.label ||
                                    selectedType.name ||
                                    selectedType.code ||
                                    `Tier ${selectedType.id}`
                                : formData.account_type;
                            })()
                          : "Select account tier"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {accountTypeOptionsForUpdate && accountTypeOptionsForUpdate.length > 0 ? (
                        accountTypeOptionsForUpdate.map((type: AdminClientAccountType) => {
                          // Utiliser le code en priorité, puis name, puis id comme valeur
                          // Cela garantit que "premium" sera envoyé au backend
                          const value = type.code || type.name || String(type.id ?? "");
                          const label = type.label || type.name || type.code || `Tier ${type.id}`;
                          return (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          );
                        })
                      ) : (
                        <SelectItem value="" disabled>
                          No account types available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="update-address" className="text-gray-900 dark:text-white">
                    Head office (optional)
                  </Label>
                  <div className="relative">
                    <MapPin className="text-muted-foreground absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 dark:text-gray-500" />
                    <Input
                      id="update-address"
                      value={formData.address}
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, address: event.target.value }))
                      }
                      placeholder="Street, city, building"
                      disabled={updateClientMutation.isPending}
                      className="h-11 rounded-xl border-2 pl-10 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 dark:border-gray-800 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseUpdateModal}
                disabled={updateClientMutation.isPending}
                className="h-11 w-full rounded-xl border-2 font-medium transition-all hover:bg-gray-50 dark:hover:bg-gray-800 sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateClientMutation.isPending}
                className="h-11 w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-8 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-cyan-700 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-50 dark:from-blue-500 dark:to-cyan-500 dark:hover:from-blue-600 dark:hover:to-cyan-600 sm:w-auto"
              >
                {updateClientMutation.isPending ? (
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
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
