import axios from "axios";
import { billingApiRequest } from "@/controller/api/config/config";
import { adminDocuments } from "@/controller/api/constant/apiLink";
import {
  AdminChangeDocumentTypeStatusRequest,
  AdminCreateDocumentTypeRequest,
  AdminDocumentTypesResponse,
  AdminDocumentsListRequest,
  AdminDocumentsListResponse,
  AdminSimpleResponse,
  AdminUpdateDocumentTypeRequest,
  AdminGetDocumentTypeRequest,
  AdminDeleteDocumentTypeRequest,
  AdminUpdateDocumentContentRequest,
  AdminDeleteDocumentRequest,
  AdminCreateDocumentRequest,
} from "@/types";

const handleAxiosError = (error: unknown, fallbackMessage: string) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      // Extraire le message d'erreur du backend
      let errorMessage = fallbackMessage;
      if (typeof errorData === "string") {
        errorMessage = errorData;
      } else if (errorData && typeof errorData === "object") {
        errorMessage =
          (errorData as { message?: string }).message ||
          (errorData as { error?: string }).error ||
          fallbackMessage;
      }

      // Log détaillé pour debug

      // Messages spécifiques selon le code de statut
      if (status === 401) {
        throw new Error(
          `Unauthorized: ${errorMessage || "You don't have permission to perform this action."}`
        );
      } else if (status === 403) {
        throw new Error(`Forbidden: ${errorMessage || "Access denied."}`);
      } else if (status === 400) {
        throw new Error(`Bad Request: ${errorMessage}`);
      } else if (status === 404) {
        throw new Error(`Not Found: ${errorMessage || "Resource not found."}`);
      } else if (status === 422) {
        throw new Error(`Validation Error: ${errorMessage || "Invalid data provided."}`);
      } else if (status === 500) {
        throw new Error(`Server Error: ${errorMessage}`);
      } else {
        throw new Error(errorMessage);
      }
    }
    if (error.request) {
      throw new Error("No server response. Please check your internet connection.");
    }
  }
  throw new Error(fallbackMessage);
};

export const getAdminDocumentsList = async (
  data: AdminDocumentsListRequest,
  apiKey: string
): Promise<AdminDocumentsListResponse | undefined> => {
  try {
    // Backend GetClientDocumentsByClientID attend VueTable format ET client_id est REQUIRED
    // Si client_id n'est pas fourni, on ne peut pas lister tous les documents
    // Il faut soit fournir un client_id spécifique, soit créer un endpoint dédié dans le backend
    if (!data.client_id || data.client_id === 0) {
      throw new Error("Client ID is required to list documents. Please specify a client_id.");
    }

    // Le backend attend VueTable format avec client_id requis
    // Format: { client_id, page, per_page, search, status, sort, order }
    const clientId =
      typeof data.client_id === "string" ? parseInt(data.client_id, 10) : Number(data.client_id);

    if (isNaN(clientId) || clientId <= 0) {
      throw new Error("Client ID is required and must be a valid positive number.");
    }

    // Construire le payload selon le format exact des tests backend
    // D'après les tests: { client_id, page, per_page, status, search, sort, order }
    // Le backend extrait client_id séparément, puis convertit le reste en VueTable
    // Format VueTable: { page, per_page, search, status, sort, order }
    const payload: Record<string, unknown> = {
      client_id: clientId, // Requis pour GetInt64
      page: data.page || 1,
      per_page: data.per_page || 10,
      status: 0, // 0 = all documents (selon les tests backend)
    };

    // Ajouter search seulement si non vide (ne pas envoyer de chaîne vide)
    if (data.search && typeof data.search === "string" && data.search.trim()) {
      payload.search = data.search.trim();
    } else {
      // Envoyer une chaîne vide plutôt que de ne pas inclure le champ
      payload.search = "";
    }

    // Ajouter sort et order si fournis
    if (data.sort && typeof data.sort === "string") {
      payload.sort = data.sort;
    }
    if (data.order && typeof data.order === "string") {
      payload.order = data.order;
    }

    const response = await billingApiRequest<Record<string, unknown>, AdminDocumentsListResponse>({
      method: "POST",
      endpoint: adminDocuments.list, // /admin/client/documents/by-client
      data: payload,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for admin documents list.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error retrieving admin documents list.");
  }
};

export const getAdminDocumentTypes = async (
  apiKey: string
): Promise<AdminDocumentTypesResponse | undefined> => {
  try {
    // Backend GetDocumentTypes attend VueTable format selon les tests backend
    // Format attendu selon vuetable.go: { page, per_page, status, search }
    // Les tags JSON sont en snake_case: page, per_page, search, status
    // Le backend a des valeurs par défaut: PerPage = 10 si <= 0, Page = 1 si <= 0
    // Selon les tests: { Page: 1, PerPage: 10, Status: 0, Search: "" }
    // Essayer un payload minimal pour éviter les erreurs de parsing
    const payload: Record<string, unknown> = {};

    // Ajouter seulement les champs nécessaires
    payload.page = 1;
    payload.per_page = 1000; // Récupérer tous les types

    const response = await billingApiRequest<Record<string, unknown>, AdminDocumentTypesResponse>({
      method: "POST",
      endpoint: adminDocuments.types, // /admin/document-types/all
      data: payload,
      apiKey,
    });

    if (!response?.data) {
      throw new Error("No server response for admin document types.");
    }

    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error retrieving document types.");
  }
};

export const createAdminDocumentType = async (
  data: AdminCreateDocumentTypeRequest,
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    const response = await billingApiRequest<AdminCreateDocumentTypeRequest, AdminSimpleResponse>({
      method: "POST",
      endpoint: adminDocuments.createType,
      data,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for document type creation.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error creating document type.");
  }
};

export const updateAdminDocumentType = async (
  data: AdminUpdateDocumentTypeRequest,
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    const response = await billingApiRequest<AdminUpdateDocumentTypeRequest, AdminSimpleResponse>({
      method: "POST",
      endpoint: adminDocuments.updateType,
      data,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for document type update.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error updating document type.");
  }
};

export const changeAdminDocumentTypeStatus = async (
  data: AdminChangeDocumentTypeStatusRequest,
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    // Log the data being sent for debugging

    const response = await billingApiRequest<
      AdminChangeDocumentTypeStatusRequest,
      AdminSimpleResponse
    >({
      method: "POST",
      endpoint: adminDocuments.changeTypeStatus,
      data,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for document type status change.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error updating document type status.");
  }
};

export const getAdminDocumentType = async (
  data: AdminGetDocumentTypeRequest,
  apiKey: string
): Promise<AdminDocumentTypesResponse | undefined> => {
  try {
    const response = await billingApiRequest<
      AdminGetDocumentTypeRequest,
      AdminDocumentTypesResponse
    >({
      method: "POST",
      endpoint: adminDocuments.getType,
      data,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for document type details.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error retrieving document type details.");
  }
};

export const deleteAdminDocumentType = async (
  data: AdminDeleteDocumentTypeRequest,
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    const response = await billingApiRequest<AdminDeleteDocumentTypeRequest, AdminSimpleResponse>({
      method: "POST",
      endpoint: adminDocuments.deleteType,
      data,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for document type deletion.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error deleting document type.");
  }
};

export const updateAdminDocumentContent = async (
  data: AdminUpdateDocumentContentRequest,
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    const response = await billingApiRequest<
      AdminUpdateDocumentContentRequest,
      AdminSimpleResponse
    >({
      method: "POST",
      endpoint: adminDocuments.adminUpdateContent,
      data,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for document content update.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error updating document content.");
  }
};

export const deleteAdminDocument = async (
  data: AdminDeleteDocumentRequest,
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    const response = await billingApiRequest<AdminDeleteDocumentRequest, AdminSimpleResponse>({
      method: "POST",
      endpoint: adminDocuments.adminDelete,
      data,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for document deletion.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error deleting document.");
  }
};

export const createAdminDocument = async (
  data: AdminCreateDocumentRequest,
  apiKey: string
): Promise<AdminSimpleResponse | undefined> => {
  try {
    const response = await billingApiRequest<AdminCreateDocumentRequest, AdminSimpleResponse>({
      method: "POST",
      endpoint: adminDocuments.adminCreate,
      data,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for document creation.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error creating document.");
  }
};
