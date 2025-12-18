import axios from "axios";
import { documents } from "../../api/constant/apiLink";
import { baseURL } from "../../api/config/baseUrl";
import { billingApiRequest } from "../../api/config/config";
import {
  DocumentTypesResponse,
  PresignedUrlResponse,
  DocumentCreateRequest,
  DocumentCreateResponse,
  MyDocumentsRequest,
  MyDocumentsResponse,
} from "@/types";
export const getActiveDocumentTypes = async (): Promise<DocumentTypesResponse | undefined> => {
  try {
    const response = await axios.post<DocumentTypesResponse>(
      `${baseURL}${documents.getActiveTypes}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response?.data) {
      throw new Error("No server response for document types.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error retrieving document types.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("Server error while retrieving document types.");
  }
};
export const generatePresignedUrl = async (
  fileExtension: string,
  fileType: string = "documents",
  token?: string | null
): Promise<PresignedUrlResponse | undefined> => {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add Authorization header if token is provided
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await axios.post<PresignedUrlResponse>(
      `${baseURL}${documents.generateUploadUrl}`,
      {
        file_extension: fileExtension,
        file_type: fileType,
      },
      {
        headers,
      }
    );
    if (!response?.data) {
      throw new Error("No server response for upload URL.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || "Error generating upload URL.";
        if (status === 401) {
          throw new Error("Unauthorized. Please check your token.");
        }
        throw new Error(message);
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("Server error while generating upload URL.");
  }
};
/**
 * Upload file to S3 using presigned URL
 * Falls back to proxy API route if SSL certificate error occurs
 */
const uploadViaProxy = async (file: File, presignedUrl: string): Promise<void> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("presignedUrl", presignedUrl);

  const response = await fetch("/api/upload-s3", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(
      errorData.message || errorData.error || `Proxy upload failed: ${response.status}`
    );
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || "Upload failed via proxy");
  }
};

export const uploadFileToS3 = async (file: File, presignedUrl: string): Promise<void> => {
  try {
    let fixedUrl = presignedUrl;
    try {
      const url = new URL(presignedUrl);
      if (url.pathname.includes("store-int.dev.dadanadagroup.com")) {
        const cleanPath = url.pathname.replace(/\/store-int\.dev\.dadanadagroup\.com/, "");
        fixedUrl = `${url.protocol}//${url.host}${cleanPath}${url.search}`;
      }
    } catch {}

    // Parse the presigned URL to check which headers are signed
    let signedHeaders: string[] = [];
    try {
      const url = new URL(fixedUrl);
      const signedHeadersParam = url.searchParams.get("X-Amz-SignedHeaders");
      if (signedHeadersParam) {
        // SignedHeaders can be space-separated or semicolon-separated
        signedHeaders = signedHeadersParam
          .split(/[;\s]+/)
          .map((h) => h.toLowerCase().trim())
          .filter((h) => h);
      }
    } catch (error) {}

    // Only include headers that are in the SignedHeaders list (case-insensitive)
    // If only 'host' is signed, don't send Content-Type as it will cause signature mismatch
    // S3 will reject the request if we send headers that aren't in the signature
    const headers: Record<string, string> = {};
    const hasContentTypeInSignature = signedHeaders.some((h) => h.toLowerCase() === "content-type");

    if (hasContentTypeInSignature) {
      let contentType = file.type;
      if (!contentType) {
        const extension = file.name.split(".").pop()?.toLowerCase();
        const mimeTypes: Record<string, string> = {
          pdf: "application/pdf",
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          png: "image/png",
          doc: "application/msword",
          docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        };
        contentType = mimeTypes[extension || ""] || "application/octet-stream";
      }
      headers["Content-Type"] = contentType;
    } else {
    }

    // For S3 presigned URLs, if only 'host' is signed, we must not send any custom headers
    // The browser will automatically send the 'host' header, which is what S3 expects
    let response: Response;
    try {
      response = await fetch(fixedUrl, {
        method: "PUT",
        body: file,
        // Only send headers if Content-Type is in the signature, otherwise send nothing
        // This ensures we don't break the signature validation
        ...(Object.keys(headers).length > 0 ? { headers } : {}),
      });
    } catch (fetchError) {
      // Handle network errors, including SSL certificate errors
      const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);

      // Check for SSL certificate errors - fallback to proxy
      if (
        errorMessage.includes("ERR_CERT") ||
        errorMessage.includes("certificate") ||
        errorMessage.includes("SSL") ||
        errorMessage.includes("Failed to fetch")
      ) {
        return uploadViaProxy(file, presignedUrl);
      }

      // Re-throw other network errors
      throw new Error(`Network error during upload: ${errorMessage}`);
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // Provide more specific error messages
      if (response.status === 403) {
        throw new Error(
          `S3 Access Denied (403). The presigned URL may be invalid or expired. Check signature: ${errorText.substring(0, 200)}`
        );
      } else if (response.status === 400) {
        throw new Error(
          `S3 Bad Request (400). Signature mismatch or invalid request. ${errorText.substring(0, 200)}`
        );
      }

      throw new Error(
        `Failed to upload file to S3: ${response.status} ${response.statusText} - ${errorText.substring(0, 300)}`
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error uploading file to S3.");
  }
};
// Alias for backward compatibility with tests
export const createDocument = async (documentData: {
  document_type_id: number;
  document_number: string;
  file_key: string;
}): Promise<unknown> => {
  // This is a simplified wrapper for tests
  // In real usage, use createDocuments with proper token
  try {
    const response = await axios.post(
      `${baseURL}${documents.create}`,
      {
        documents: [
          {
            document_type_id: documentData.document_type_id,
            document_number: documentData.document_number,
            file_path: documentData.file_key,
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw new Error("Error creating document.");
  }
};

export const createDocuments = async (
  documentsData: DocumentCreateRequest,
  apiKey: string
): Promise<DocumentCreateResponse | undefined> => {
  try {
    const response = await billingApiRequest<DocumentCreateRequest, DocumentCreateResponse>({
      method: "POST",
      endpoint: documents.create,
      data: documentsData,
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for document creation.");
    }
    if (response.status === 201) {
      return response.data;
    } else if (response.status === 400) {
      const errorMessage =
        typeof response.data === "object" && response.data !== null
          ? (response.data && typeof response.data === "object" && "message" in response.data
              ? (response.data as { message?: string }).message
              : undefined) || "Validation error. Please check your data."
          : "Validation error. Please check your data.";
      throw new Error(errorMessage);
    } else if (response.status === 409) {
      // Extract detailed error message from backend
      const errorMessage =
        typeof response.data === "object" && response.data !== null
          ? response.data && typeof response.data === "object" && "message" in response.data
            ? (response.data as { message?: string }).message
            : undefined
          : undefined;
      throw new Error(
        errorMessage ||
          "Some documents of these types already exist for this client. Please update existing documents instead of creating new ones."
      );
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || "Error creating documents.";
        if (status === 400) {
          throw new Error(`Validation failed: ${message}`);
        } else if (status === 401) {
          throw new Error("Unauthorized: Your API key is invalid. Please check your API key.");
        } else if (status === 409) {
          // Use the detailed message from backend
          throw new Error(
            message ||
              "Some documents of these types already exist for this client. Please update existing documents instead of creating new ones."
          );
        } else {
          throw new Error(message);
        }
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Server error while creating documents.");
  }
};
export const getMyDocuments = async (
  params: MyDocumentsRequest,
  apiKey: string
): Promise<MyDocumentsResponse | undefined> => {
  try {
    // Backend expects VueTable format: page, per_page, sort, search, status (no 'order' field)
    // Sort format: "table.column|direction" (e.g., "ced.id|desc") or just "column|direction"
    let sortValue = params.sort || "ced.id";
    if (params.order && params.sort) {
      // Combine sort and order into VueTable format: "column|direction"
      sortValue = `${params.sort}|${params.order}`;
    } else if (params.order && !params.sort) {
      // Default sort column if order provided without sort
      sortValue = `ced.id|${params.order}`;
    }

    const response = await billingApiRequest<MyDocumentsRequest, MyDocumentsResponse>({
      method: "POST",
      endpoint: documents.myDocuments,
      data: {
        page: params.page || 1,
        per_page: params.per_page || 10,
        search: params.search || "",
        sort: sortValue, // VueTable format: "column|direction"
        // Note: 'order' field is not part of VueTable, use sort format instead
      },
      apiKey,
    });
    if (!response?.data) {
      throw new Error("No server response for documents.");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error retrieving documents.");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("Server error while retrieving documents.");
  }
};
