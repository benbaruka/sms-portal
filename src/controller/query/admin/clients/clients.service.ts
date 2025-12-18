import { billingApiRequest } from "@/controller/api/config/config";
import { adminClients } from "@/controller/api/constant/apiLink";
import {
  AdminClientAccountTypesResponse,
  AdminClientCountriesResponse,
  AdminClientDetailsRequest,
  AdminClientDetailsResponse,
  AdminClientStatusRequest,
  AdminClientsListRequest,
  AdminClientsListResponse,
  AdminCreateClientRequest,
  AdminSimpleResponse,
  AdminUpdateClientRequest,
} from "@/types";
import axios from "axios";

const handleAxiosError = (error: unknown, fallbackMessage: string) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      throw new Error(error.response.data?.message || fallbackMessage);
    }
    if (error.request) {
      throw new Error("No server response. Please check your internet connection.");
    }
  }
  throw new Error(fallbackMessage);
};

export const getAdminClientsList = async (
  data: AdminClientsListRequest,
  apiKey: string
): Promise<AdminClientsListResponse | undefined> => {
  try {
    // Déterminer s'il y a des filtres actifs (search, status spécifique, account_type, country_code)
    // Note: data.status, data.account_type, data.country_code peuvent être undefined si "ALL" est sélectionné
    const hasFilters = !!(
      (data.search && data.search.trim()) ||
      (data.status !== undefined && data.status !== "ALL" && data.status !== -1) ||
      (data.account_type !== undefined && data.account_type !== "ALL") ||
      (data.country_code !== undefined && data.country_code !== "ALL")
    );

    // Si pas de filtres, utiliser /client/all pour récupérer TOUS les clients d'un coup
    // Sinon, utiliser /client/table pour la pagination avec filtres
    if (!hasFilters) {
      try {
        const response = await billingApiRequest<Record<string, never>, AdminClientsListResponse>({
          method: "POST",
          endpoint: adminClients.list, // /client/all - retourne tous les clients sans pagination
          data: {},
          apiKey,
        });

        if (!response?.data) {
          throw new Error("No server response for admin clients list.");
        }

        // Le backend retourne soit un array directement, soit dans message/data
        let allClients: any[] = [];
        if (Array.isArray(response.data)) {
          allClients = response.data;
        } else if (Array.isArray((response.data as any)?.message)) {
          allClients = (response.data as any).message;
        } else if (Array.isArray((response.data as any)?.data)) {
          allClients = (response.data as any).data;
        }

        // Retourner dans le format attendu par le frontend
        return {
          status: 200,
          clients: allClients,
          data: {
            data: allClients,
            total: allClients.length,
            per_page: allClients.length,
            current_page: 1,
            last_page: 1,
            from: 1,
            to: allClients.length,
          },
          message: { data: allClients },
        } as AdminClientsListResponse;
      } catch (allError) {
        // Si /client/all échoue, fallback sur /client/table
      }
    }

    // Utiliser /client/table avec format VueTable pour la pagination avec filtres
    // Augmenter per_page à 100 pour récupérer plus de clients par page quand pas de filtres spécifiques
    const perPage = hasFilters ? data.per_page || 10 : data.per_page || 100;

    // Construire la recherche combinant search text avec les filtres account_type et country_code
    // Le backend utilise le champ Search pour chercher dans plusieurs colonnes
    const searchQuery = data.search || "";

    // Si on a des filtres account_type ou country_code, on peut les ajouter à la recherche
    // Mais pour l'instant, on les envoie aussi comme paramètres supplémentaires au cas où le backend les supporte
    const vueTablePayload: any = {
      page: data.page || 1,
      per_page: perPage,
      search: searchQuery,
      status: data.status
        ? typeof data.status === "string"
          ? data.status === "ACTIVE"
            ? 1
            : data.status === "INACTIVE"
              ? 0
              : -1
          : Number(data.status)
        : -1,
    };

    // Ajouter account_type et country_code comme paramètres supplémentaires
    // Le backend pourra les utiliser s'ils sont supportés, sinon ils seront ignorés
    if (data.account_type !== undefined && data.account_type !== "ALL") {
      vueTablePayload.account_type =
        typeof data.account_type === "string" ? data.account_type : String(data.account_type);
    }
    if (data.country_code !== undefined && data.country_code !== "ALL") {
      vueTablePayload.country_code =
        typeof data.country_code === "string"
          ? data.country_code.toUpperCase()
          : String(data.country_code).toUpperCase();
    }

    const response = await billingApiRequest<typeof vueTablePayload, AdminClientsListResponse>({
      method: "POST",
      endpoint: adminClients.table, // /client/table avec VueTable format
      data: vueTablePayload,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for admin clients list.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error retrieving admin clients list.");
  }
};

export const createAdminClient = async (
  data: AdminCreateClientRequest,
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    // Le backend attend NewClient avec company_name, full_name, msisdn (string), password, etc.
    // Format exact: { company_name, full_name, msisdn (string), email, country_code, address, password, role_id, billing_mode, credit_limit, account_type }
    // Récupérer l'adresse fournie par l'utilisateur
    const addressValue = data.address?.trim() || "";

    const backendPayload = {
      company_name: data.name.trim(), // Le frontend envoie "name", le backend attend "company_name"
      full_name: data.name.trim(), // full_name est obligatoire, on utilise name
      email: data.email.trim(),
      msisdn: data.msisdn.trim(), // msisdn doit être une string dans NewClient
      country_code: data.country_code?.trim() || "ke", // Par défaut "ke" si non fourni
      address: addressValue, // Adresse principale
      // Utiliser account_type tel quel (devrait être le code: "premium", "normal", etc.)
      // Si c'est vide ou undefined, utiliser "normal" par défaut
      account_type: (data.account_type && String(data.account_type).trim()) || "normal",
      password: "TempPassword123!", // Le backend exige un password, on génère un temporaire
      role_id: 2, // Par défaut role_id = 2 (Administrator)
      billing_mode: "PREPAID",
      credit_limit: 0,
      street: addressValue, // Mettre aussi l'adresse dans street si le backend le préfère
      route: "", // Optionnel
    };

    const response = await billingApiRequest<typeof backendPayload, AdminSimpleResponse>({
      method: "POST",
      endpoint: adminClients.create,
      data: backendPayload,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for admin client creation.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error creating admin client.");
  }
};

export const updateAdminClient = async (
  data: AdminUpdateClientRequest,
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    // Le backend attend UpdateClient avec "id" (pas "client_id") et msisdn en int64
    // Format exact: { id (int), name, email, msisdn (int64), address, billing_mode, credit_limit, account_type }
    // Convertir msisdn de string à int64 en enlevant tous les caractères non numériques
    let msisdnInt64 = 0;
    if (data.msisdn) {
      const msisdnStr = typeof data.msisdn === "string" ? data.msisdn : String(data.msisdn);
      // Enlever tous les caractères non numériques (+ espaces)
      const cleanedMsisdn = msisdnStr.replace(/\D/g, "");
      msisdnInt64 = cleanedMsisdn ? parseInt(cleanedMsisdn, 10) : 0;
    }

    if (msisdnInt64 === 0) {
      throw new Error("Missing or invalid contact person mobile number");
    }

    const backendPayload = {
      id:
        typeof data.client_id === "string" ? parseInt(data.client_id, 10) : Number(data.client_id),
      name: data.name?.trim() || "",
      email: data.email?.trim() || "",
      msisdn: msisdnInt64, // int64 requis par le backend
      address: data.address?.trim() || "Nairobi, Kenya", // Le backend met "Nairobi, Kenya" par défaut si vide
      account_type: data.account_type || "normal",
      billing_mode: "PREPAID", // Par défaut
      credit_limit: 0,
    };

    const response = await billingApiRequest<typeof backendPayload, AdminSimpleResponse>({
      method: "POST",
      endpoint: adminClients.update,
      data: backendPayload,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for admin client update.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error updating admin client.");
  }
};

export const getAdminClientDetails = async (
  data: AdminClientDetailsRequest,
  apiKey: string
): Promise<AdminClientDetailsResponse | undefined> => {
  try {
    // Utiliser /client/table avec client_id dans le payload pour filtrer (VueTable format)
    const clientId =
      typeof data.client_id === "string" ? parseInt(data.client_id) : Number(data.client_id);
    const vueTablePayload = {
      client_id: clientId,
      page: 1,
      per_page: 1,
      search: clientId.toString(), // Rechercher par client_id
    };

    const response = await billingApiRequest<typeof vueTablePayload, AdminClientDetailsResponse>({
      method: "POST",
      endpoint: adminClients.table, // Utiliser /client/table
      data: vueTablePayload,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for admin client details.");
    }
    // Extraire le premier client de la réponse
    const clients =
      (response.data as any)?.data?.data ||
      (response.data as any)?.data?.clients ||
      (response.data as any)?.clients ||
      [];
    const client = Array.isArray(clients) && clients.length > 0 ? clients[0] : null;

    return {
      ...response.data,
      data: client,
      message: client,
    } as AdminClientDetailsResponse;
  } catch (error) {
    handleAxiosError(error, "Error retrieving admin client details.");
  }
};

export const changeAdminClientStatus = async (
  data: AdminClientStatusRequest,
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    // Le backend attend un payload avec "id" (pas "client_id") et "status" en int64 (0 ou 1)
    const statusValue =
      typeof data.status === "string"
        ? data.status.toUpperCase() === "ACTIVE"
          ? 1
          : 0
        : Number(data.status);

    const backendPayload = {
      id: typeof data.client_id === "string" ? parseInt(data.client_id) : Number(data.client_id),
      status: statusValue,
    };

    const response = await billingApiRequest<typeof backendPayload, AdminSimpleResponse>({
      method: "POST",
      endpoint: adminClients.changeStatus,
      data: backendPayload,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for admin client status update.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error updating admin client status.");
  }
};

export const getAdminClientAccountTypes = async (
  apiKey: string
): Promise<AdminClientAccountTypesResponse | undefined> => {
  try {
    // ⚠️ L'endpoint /admin/client/account-types n'existe pas dans le backend
    // Solution temporaire : retourner des valeurs par défaut
    // TODO: Créer cet endpoint dans le backend ou extraire depuis la liste des clients
    const defaultAccountTypes = [
      { id: 1, name: "normal", label: "Normal", code: "normal" },
      { id: 2, name: "premium", label: "Premium", code: "premium" },
      { id: 3, name: "enterprise", label: "Enterprise", code: "enterprise" },
    ];

    return {
      status: 200,
      message: defaultAccountTypes,
      data: defaultAccountTypes,
    } as AdminClientAccountTypesResponse;

    // Ancien code (ne fonctionne pas car l'endpoint n'existe pas) :
    // const response = await billingApiRequest<Record<string, never>, AdminClientAccountTypesResponse>({
    //   method: "POST",
    //   endpoint: adminClients.accountTypes,
    //   data: {},
    //   apiKey,
    // });
    // if (!response?.data) {
    //   throw new Error("No server response for admin client account types.");
    // }
    // return response.data;
  } catch (error) {
    handleAxiosError(error, "Error retrieving client account types.");
  }
};

export const updateClientBillingRate = async (
  data: { id: number; billing_rate: Array<{ connector_id: number; billing_rate: number }> },
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    const response = await billingApiRequest<typeof data, AdminSimpleResponse>({
      method: "POST",
      endpoint: adminClients.billingUpdate,
      data: {
        id: data.id,
        billing_rate: data.billing_rate,
      },
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for updating client billing rate.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error updating client billing rate.");
  }
};

export const getClientSMSBilling = async (
  data: { client_id?: number },
  apiKey: string
): Promise<{ status: number; message: unknown } | undefined> => {
  try {
    const response = await billingApiRequest<typeof data, { status: number; message: unknown }>({
      method: "POST",
      endpoint: adminClients.billingView,
      data: {
        client_id: data.client_id,
      },
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for client SMS billing.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error fetching client SMS billing.");
  }
};

export const creditClientTopup = async (
  data: { client_id: number; amount: number; description?: string },
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    const response = await billingApiRequest<typeof data, AdminSimpleResponse>({
      method: "POST",
      endpoint: adminClients.creditTopup,
      data: {
        client_id: data.client_id,
        amount: data.amount,
        description: data.description,
      },
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for client credit top-up.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error crediting client account.");
  }
};

export const getAdminClientCountryCodes = async (
  apiKey: string
): Promise<AdminClientCountriesResponse | undefined> => {
  try {
    // ⚠️ L'endpoint /admin/client/countries n'existe pas dans le backend
    // Solution temporaire : retourner des valeurs par défaut communes
    // TODO: Créer cet endpoint dans le backend ou extraire depuis la liste des clients
    const defaultCountries = [
      { code: "ke", name: "Kenya", dial_code: "+254" },
      { code: "ug", name: "Uganda", dial_code: "+256" },
      { code: "tz", name: "Tanzania", dial_code: "+255" },
      { code: "rw", name: "Rwanda", dial_code: "+250" },
      { code: "cd", name: "DRC", dial_code: "+243" },
      { code: "et", name: "Ethiopia", dial_code: "+251" },
      { code: "gh", name: "Ghana", dial_code: "+233" },
      { code: "ng", name: "Nigeria", dial_code: "+234" },
      { code: "za", name: "South Africa", dial_code: "+27" },
    ];

    return {
      status: 200,
      message: defaultCountries,
      data: defaultCountries,
    } as AdminClientCountriesResponse;

    // Ancien code (ne fonctionne pas car l'endpoint n'existe pas) :
    // const response = await billingApiRequest<Record<string, never>, AdminClientCountriesResponse>({
    //   method: "POST",
    //   endpoint: adminClients.countryCodes,
    //   data: {},
    //   apiKey,
    // });
    // if (!response?.data) {
    //   throw new Error("No server response for admin client countries.");
    // }
    // return response.data;
  } catch (error) {
    handleAxiosError(error, "Error retrieving client countries.");
  }
};
