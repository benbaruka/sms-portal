import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  getActiveDocumentTypes,
  generatePresignedUrl,
  uploadFileToS3,
  createDocuments,
  getMyDocuments,
} from "./document.service";
import { DocumentCreateRequest, MyDocumentsRequest, DocumentType } from "@/types";
import { useAlert } from "@/context/AlertProvider";
export const useGetActiveDocumentTypes = () => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["document-types", "active"],
    queryFn: () => getActiveDocumentTypes(),
  });
  useEffect(() => {
    if (query.isError && query.error) {
      showAlert({
        variant: "error",
        title: "Error",
        message:
          (query.error instanceof Error ? query.error.message : undefined) ||
          "Error retrieving document types.",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.isError, query.error]);
  return query;
};
export const useGeneratePresignedUrl = () => {
  const { showAlert } = useAlert();
  return useMutation({
    mutationFn: ({
      fileExtension,
      fileType,
      token,
    }: {
      fileExtension: string;
      fileType?: string;
      token?: string | null;
    }) => generatePresignedUrl(fileExtension, fileType, token),
    onError: (error) => {
      showAlert({
        variant: "error",
        title: "Error",
        message: error?.message || "Error generating upload URL.",
      });
    },
  });
};
export const useUploadDocument = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      file,
      documentTypeId,
      documentNumber,
      token,
      apiKey,
    }: {
      file: File;
      documentTypeId: number;
      documentNumber: string;
      token: string;
      apiKey: string;
    }) => {
      const fileExtension = file.name.split(".").pop() || "pdf";
      const presignedUrlResponse = await generatePresignedUrl(fileExtension, "documents", token);
      if (!presignedUrlResponse?.message?.upload_url || !presignedUrlResponse?.message?.file_path) {
        throw new Error("Error generating upload URL.");
      }
      const { upload_url, file_path } = presignedUrlResponse.message;
      await uploadFileToS3(file, upload_url);
      const documentName = `Document Type ${documentTypeId}`;
      const documentData: DocumentCreateRequest = {
        documents: [
          {
            document_type_id: documentTypeId,
            file_path: file_path,
            document_name: documentName,
            document_number: documentNumber,
          },
        ],
      };
      const createResult = await createDocuments(documentData, apiKey);
      return { file_path, createResult };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-documents"] });
      showAlert({
        variant: "success",
        title: "Success",
        message: "Document uploaded successfully.",
      });
    },
    onError: (error) => {
      showAlert({
        variant: "error",
        title: "Error",
        message: error?.message || "Error uploading document.",
      });
    },
  });
};
export const useUploadMultipleDocuments = () => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      files,
      documentTypes,
      token,
    }: {
      files: Array<{ file: File; documentTypeId: number; documentNumber: string }>;
      documentTypes: DocumentType[];
      token: string;
    }) => {
      const uploadPromises = files.map(async ({ file, documentTypeId, documentNumber }) => {
        const docType = documentTypes.find((dt) => dt.id === documentTypeId);
        const documentName = docType?.name || `Document ${documentTypeId}`;
        const fileExtension = file.name.split(".").pop()?.toLowerCase() || "pdf";
        const presignedUrlResponse = await generatePresignedUrl(fileExtension, "documents", token);
        if (
          !presignedUrlResponse?.message?.upload_url ||
          !presignedUrlResponse?.message?.file_path
        ) {
          throw new Error(`Failed to get upload URL for ${file.name}`);
        }
        const { upload_url, file_path } = presignedUrlResponse.message;
        await uploadFileToS3(file, upload_url);
        return {
          document_type_id: documentTypeId,
          file_path: file_path,
          document_name: documentName,
          document_number: documentNumber,
        };
      });
      const documentItems = await Promise.all(uploadPromises);
      const documentData: DocumentCreateRequest = {
        documents: documentItems,
      };
      const createResult = await createDocuments(documentData, apiKey);
      return createResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-documents"] });
      showAlert({
        variant: "success",
        title: "Success",
        message: "All documents have been uploaded successfully.",
      });
    },
    onError: (error) => {
      showAlert({
        variant: "error",
        title: "Error",
        message: error?.message || "Error uploading documents.",
      });
    },
  });
};
export const useCreateDocuments = (apiKey: string | null) => {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: DocumentCreateRequest) => {
      if (!apiKey) {
        throw new Error("API key is required");
      }
      return createDocuments(data, apiKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-documents"] });
      showAlert({
        variant: "success",
        title: "Success",
        message: "Documents created successfully.",
      });
    },
    onError: (error) => {
      showAlert({
        variant: "error",
        title: "Error",
        message: error?.message || "Error creating documents.",
      });
    },
  });
};

export const useGetMyDocuments = (
  params: MyDocumentsRequest,
  apiKey: string,
  enabled: boolean = false
) => {
  const { showAlert } = useAlert();
  const query = useQuery({
    queryKey: ["my-documents", params, apiKey],
    queryFn: () => getMyDocuments(params, apiKey),
    enabled: enabled && !!apiKey,
  });
  useEffect(() => {
    if (query.isError && query.error) {
      showAlert({
        variant: "error",
        title: "Error",
        message:
          (query.error instanceof Error ? query.error.message : undefined) ||
          "Error retrieving documents.",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.isError, query.error]);
  return query;
};
