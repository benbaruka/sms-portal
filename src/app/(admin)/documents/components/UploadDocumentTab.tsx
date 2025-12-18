"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, FileText, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAlert } from "@/context/AlertProvider";
import {
  useGetActiveDocumentTypes,
  useUploadMultipleDocuments,
  useGetMyDocuments,
} from "@/controller/query/documents/useDocuments";
import { DocumentType } from "@/types";
import { getCookie } from "cookies-next";
import { getToken } from "@/controller/hook/useGetToken";

export default function UploadDocumentTab() {
  const router = useRouter();
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<
    Record<
      number,
      { file: File; documentNumber: string; filePath?: string; uploadProgress?: number } | null
    >
  >({});
  const [isLoading, setIsLoading] = useState(false);

  // Get document types from API
  const { data: documentTypesData, isLoading: isLoadingDocTypes } = useGetActiveDocumentTypes();

  // Upload documents mutation
  const uploadDocumentsMutation = useUploadMultipleDocuments();

  // Get API Key for documents endpoint
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  // Get my documents query to check which documents already exist
  // Only fetch if we have an API key, and handle errors gracefully
  // Note: Disabled by default to avoid 500 errors on tab load, will fetch only when needed
  const {
    data: myDocumentsData,
    refetch: refetchMyDocuments,
    error: myDocumentsError,
    isError: isMyDocumentsError,
  } = useGetMyDocuments(
    { page: 1, per_page: 100, sort: "ced.id", order: "desc" }, // Get all documents to check what's already uploaded
    apiKey || "",
    false // Disabled by default - we'll refetch manually after successful upload
  );

  // Extract already uploaded document type IDs
  // Return empty array if there's an error or no data
  const uploadedDocumentTypeIds = useMemo(() => {
    // If there's an error fetching documents, return empty array to show all document types
    // This allows users to still upload documents even if there's a backend error
    if (isMyDocumentsError || myDocumentsError || !myDocumentsData) {
      return [];
    }

    const response = myDocumentsData as any;
    let docsList: unknown[] = [];

    // Handle different response structures
    if (response.total !== undefined || response.current_page !== undefined) {
      // Direct format: { data: [...], total, current_page, ... }
      docsList = response.data || [];
    } else if (response.message) {
      // Structure: { message: { data: [...], pagination: {...} } }
      docsList = response.message.data || response.message.documents || [];
    } else if (response.data) {
      // Structure: { data: { data: [...], pagination: {...} } } or { data: [...] }
      if (Array.isArray(response.data)) {
        docsList = response.data;
      } else {
        docsList = response.data.data || response.data.documents || [];
      }
    } else if (Array.isArray(response)) {
      // Direct array
      docsList = response;
    }

    // Extract document_type_id from uploaded documents and normalize to numbers
    const ids = docsList
      .map((doc: any) => {
        const typeId = doc.document_type_id;
        // Convert to number if it's a string
        if (typeof typeId === "string") {
          return parseInt(typeId, 10);
        }
        return typeId;
      })
      .filter((id: unknown): id is number => typeof id === "number" && !isNaN(id));

    return ids;
  }, [myDocumentsData, myDocumentsError, isMyDocumentsError]);

  useEffect(() => {
    // Get token from multiple sources (cookie, localStorage, or user-session)
    const cookieToken = getCookie("authToken");
    if (cookieToken && typeof cookieToken === "string") {
      setAuthToken(cookieToken);
    } else {
      // Use the improved getToken function that checks multiple sources
      const token = getToken();
      if (token) {
        setAuthToken(token);
      } else {
      }
    }
  }, [user]); // Re-run when user changes

  // Fetch uploaded documents when component mounts and API key is available
  // This is done manually to avoid 500 errors on initial load
  // Only fetch once when we have an API key and haven't fetched/errored yet
  useEffect(() => {
    if (apiKey && !myDocumentsData && !isMyDocumentsError && !myDocumentsError) {
      // Silently fetch - errors are handled in the hook itself
      refetchMyDocuments().catch(() => {
        // Silently handle errors - we'll show all document types if fetch fails
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  // Filter document types to show only those that haven't been uploaded yet
  const documentTypes = useMemo(() => {
    const allTypes =
      documentTypesData &&
      typeof documentTypesData === "object" &&
      documentTypesData !== null &&
      "message" in documentTypesData &&
      documentTypesData.message
        ? (documentTypesData.message as DocumentType[])
        : [];

    // Normalize type IDs to numbers for comparison
    const uploadedIds = new Set(uploadedDocumentTypeIds.map((id) => Number(id)));

    // Filter out document types that have already been uploaded
    // If there was an error fetching uploaded documents, show all types (safer approach)
    const filtered =
      isMyDocumentsError || myDocumentsError
        ? allTypes
        : allTypes.filter((type) => {
            const typeId = Number(type.id);
            const isUploaded = uploadedIds.has(typeId);
            return !isUploaded;
          });

    return filtered;
  }, [documentTypesData, uploadedDocumentTypeIds, isMyDocumentsError, myDocumentsError]);

  const [documentNumbers, setDocumentNumbers] = useState<Record<number, string>>({});
  const [uploadingDocId, setUploadingDocId] = useState<number | null>(null);

  const validateFile = (file: File): boolean => {
    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      showAlert({
        variant: "error",
        title: "Invalid File Type",
        message: "Please select a valid file (PDF, JPG, PNG, DOC, DOCX).",
      });
      return false;
    }

    if (file.size > maxSize) {
      showAlert({
        variant: "error",
        title: "File Too Large",
        message: "File size must be less than 10MB.",
      });
      return false;
    }

    return true;
  };

  const handleFileChange = async (docId: number, file: File | null) => {
    if (file) {
      // Validate file first
      if (!validateFile(file)) {
        return;
      }

      // Check if document number is provided
      const documentNumber = documentNumbers[docId]?.trim();
      if (!documentNumber) {
        showAlert({
          variant: "warning",
          title: "Document Number Required",
          message: "Please enter the document number before uploading.",
        });
        return;
      }

      // Set uploading state
      setUploadingDocId(docId);
      setUploadedFiles((prev) => ({
        ...prev,
        [docId]: { file, documentNumber, uploadProgress: 0 },
      }));

      try {
        // Step 1: Get presigned URL
        const fileExtension = file.name.split(".").pop()?.toLowerCase() || "pdf";
        const { generatePresignedUrl, uploadFileToS3 } =
          await import("@/controller/query/documents/document.service");

        const presignedUrlResponse = await generatePresignedUrl(
          fileExtension,
          "documents",
          authToken
        );
        if (
          !presignedUrlResponse?.message?.upload_url ||
          !presignedUrlResponse?.message?.file_path
        ) {
          throw new Error("Failed to get upload URL");
        }

        const { upload_url, file_path } = presignedUrlResponse.message;

        // Update progress
        setUploadedFiles((prev) => ({
          ...prev,
          [docId]: prev[docId] ? { ...prev[docId]!, uploadProgress: 25 } : null,
        }));

        // Step 2: Upload to S3
        await uploadFileToS3(file, upload_url);

        // Update progress and store file path
        setUploadedFiles((prev) => ({
          ...prev,
          [docId]: prev[docId]
            ? {
                ...prev[docId]!,
                filePath: file_path,
                uploadProgress: 100,
              }
            : null,
        }));

        setUploadingDocId(null);
        showAlert({
          variant: "success",
          title: "Upload Successful",
          message: "File uploaded successfully. Click 'Upload Documents' to save.",
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to upload document.";
        setUploadingDocId(null);
        setUploadedFiles((prev) => {
          const newFiles = { ...prev };
          delete newFiles[docId];
          return newFiles;
        });
        showAlert({
          variant: "error",
          title: "Upload Failed",
          message: error?.message || "Failed to upload document. Please try again.",
        });
      }
    } else {
      setUploadedFiles((prev) => {
        const newFiles = { ...prev };
        delete newFiles[docId];
        return newFiles;
      });
      setDocumentNumbers((prev) => {
        const newNumbers = { ...prev };
        delete newNumbers[docId];
        return newNumbers;
      });
    }
  };

  const handleDocumentNumberChange = (docId: number, documentNumber: string) => {
    setDocumentNumbers((prev) => ({
      ...prev,
      [docId]: documentNumber,
    }));
  };

  const handleUpload = async () => {
    if (!apiKey) {
      showAlert({
        variant: "error",
        title: "Error",
        message: "API key is missing. Please check your API key.",
      });
      return;
    }

    // Prepare documents for submission (only uploaded ones with file_path)
    const documentsToSubmit = Object.entries(uploadedFiles)
      .filter(([_, value]) => value !== null && value.uploadProgress === 100 && value.filePath)
      .map(([docId, value]) => {
        const docType = documentTypes.find((dt) => dt.id === parseInt(docId));
        return {
          document_type_id: parseInt(docId.toString()),
          file_path: value!.filePath!,
          document_name: docType?.name || `Document ${docId}`,
          document_number: value!.documentNumber,
        };
      });

    if (documentsToSubmit.length === 0) {
      showAlert({
        variant: "warning",
        title: "No Documents",
        message: "Please upload at least one document before submitting.",
      });
      return;
    }

    // Validate that all uploaded documents have numbers
    const missingNumbers = documentsToSubmit.filter((doc) => !doc.document_number?.trim());
    if (missingNumbers.length > 0) {
      showAlert({
        variant: "warning",
        title: "Document Numbers Required",
        message: "Please enter document numbers for all uploaded documents.",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Verify API key is available
      if (!apiKey || apiKey.trim() === "") {
        throw new Error("API key is missing. Please check your API key.");
      }

      // Step 3: Create documents in DB
      const { createDocuments } = await import("@/controller/query/documents/document.service");

      await createDocuments({ documents: documentsToSubmit }, apiKey);

      // Refresh my documents
      await refetchMyDocuments();

      // Update user session to reflect that documents have been uploaded
      const storedUser = localStorage.getItem("user-session");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          parsedUser.message.has_documents = 1;
          localStorage.setItem("user-session", JSON.stringify(parsedUser));
        } catch (error) {}
      }

      showAlert({
        variant: "success",
        title: "Success",
        message: "Documents uploaded successfully!",
      });

      // Refresh and switch to my-documents tab
      setTimeout(() => {
        router.push("/documents?tab=my-documents");
        router.refresh();
      }, 1500);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to upload document.";
      setIsLoading(false);

      // If unauthorized, clear token and redirect to login
      if (
        errorMessage.includes("Unauthorized") ||
        errorMessage.includes("401") ||
        errorMessage.includes("authorization failed")
      ) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user-session");
        showAlert({
          variant: "error",
          title: "Session Expired",
          message: "Your session has expired. Please log in again.",
        });
        setTimeout(() => {
          router.push("/signin");
        }, 1500);
        return;
      }

      // Handle 409 Conflict - documents already exist
      if (
        errorMessage.includes("already exists") ||
        errorMessage.includes("Document validation failed")
      ) {
        showAlert({
          variant: "error",
          title: "Documents Already Exist",
          message:
            errorMessage +
            " Please delete existing documents first or update them using the 'My Documents' tab.",
        });
        return;
      }

      // Other errors are already handled by the service
    }
  };

  return (
    <Card className="border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
          <Upload className="h-4 w-4 text-brand-500 sm:h-5 sm:w-5" />
          Required Documents
        </CardTitle>
        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
          {isMyDocumentsError || myDocumentsError
            ? "Select and upload the required documents for verification"
            : uploadedDocumentTypeIds.length > 0
              ? `${uploadedDocumentTypeIds.length} document${uploadedDocumentTypeIds.length > 1 ? "s" : ""} already uploaded. Upload remaining required documents below.`
              : "Select and upload the required documents for verification"}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {isLoadingDocTypes ? (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="mb-3 h-10 w-10 animate-spin text-brand-500" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading document requirements...
            </p>
          </div>
        ) : documentTypes.length === 0 ? (
          <div className="flex flex-col items-center py-8">
            <CheckCircle2 className="mb-3 h-10 w-10 text-green-500" />
            <p className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
              All required documents have been uploaded
            </p>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              {uploadedDocumentTypeIds.length > 0
                ? "You have already uploaded all required documents. View them in the 'My Documents' tab."
                : "No document types available. Please try again later."}
            </p>
            <Button
              onClick={() => router.push("/documents?tab=my-documents")}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              View My Documents
            </Button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <div className="custom-scroll max-h-[400px] space-y-3 overflow-y-auto pr-2">
              {documentTypes.map((doc) => (
                <div
                  key={doc.id}
                  className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900 sm:p-4"
                >
                  <div className="mb-2 flex items-start justify-between gap-2 sm:items-center">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {doc.name}
                      </h4>
                      {doc.description && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {doc.description}
                        </p>
                      )}
                    </div>
                    {uploadedFiles[doc.id] && (
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-500" />
                    )}
                  </div>
                  {/* Document Number Input - REQUIRED BEFORE UPLOAD */}
                  <div className="mb-3 space-y-2">
                    <Label
                      htmlFor={`doc-number-${doc.id}`}
                      className="text-xs text-gray-600 dark:text-gray-400"
                    >
                      Document Number *
                    </Label>
                    <Input
                      id={`doc-number-${doc.id}`}
                      type="text"
                      value={documentNumbers[doc.id] || ""}
                      onChange={(e) => handleDocumentNumberChange(doc.id, e.target.value)}
                      placeholder="Enter document number (e.g., PASS-2024-001)"
                      disabled={
                        uploadedFiles[doc.id]?.uploadProgress === 100 || uploadingDocId === doc.id
                      }
                      className="h-9 text-sm"
                      required
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Enter the document number before uploading
                    </p>
                  </div>

                  {/* File Input */}
                  <div className="space-y-2">
                    <Label
                      htmlFor={`file-${doc.id}`}
                      className="text-xs text-gray-600 dark:text-gray-400"
                    >
                      Select File
                    </Label>
                    <div className="relative">
                      <Input
                        id={`file-${doc.id}`}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        disabled={
                          uploadedFiles[doc.id]?.uploadProgress === 100 ||
                          uploadingDocId === doc.id ||
                          !documentNumbers[doc.id]?.trim()
                        }
                        className="h-10 cursor-pointer text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100 disabled:cursor-not-allowed dark:file:bg-brand-900 dark:file:text-brand-300"
                        onChange={(e) => handleFileChange(doc.id, e.target.files?.[0] || null)}
                      />
                      {uploadedFiles[doc.id]?.uploadProgress === 100 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 text-red-600 hover:text-red-700 dark:text-red-400"
                          onClick={() => handleFileChange(doc.id, null)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
                    </p>
                  </div>

                  {/* Upload Progress */}
                  {uploadingDocId === doc.id && uploadedFiles[doc.id] && (
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">
                          Uploading to storage...
                        </span>
                        <span className="font-medium text-brand-600 dark:text-brand-400">
                          {uploadedFiles[doc.id]?.uploadProgress || 0}%
                        </span>
                      </div>
                      <Progress
                        value={uploadedFiles[doc.id]?.uploadProgress || 0}
                        className="h-2"
                      />
                    </div>
                  )}

                  {/* Uploaded File Info */}
                  {uploadedFiles[doc.id]?.uploadProgress === 100 && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-2 dark:border-green-800 dark:bg-green-900/20">
                      <FileText className="h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                      <span className="flex-1 truncate text-xs text-gray-700 dark:text-gray-300">
                        {uploadedFiles[doc.id]?.file.name}
                      </span>
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col items-stretch justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700 sm:flex-row sm:items-center sm:gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // Allow user to skip
                  localStorage.setItem("documents_upload_skipped", "true");
                  router.push("/documents?tab=my-documents");
                }}
                disabled={isLoading || uploadDocumentsMutation.isPending}
                className="h-10 w-full sm:w-auto"
              >
                Skip for Now
              </Button>
              <Button
                type="button"
                onClick={handleUpload}
                disabled={
                  isLoading ||
                  uploadDocumentsMutation.isPending ||
                  uploadingDocId !== null ||
                  Object.keys(uploadedFiles).filter(
                    (id) => uploadedFiles[parseInt(id)]?.uploadProgress === 100
                  ).length === 0
                }
                className="h-10 w-full bg-brand-500 text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {isLoading || uploadDocumentsMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">Submitting...</span>
                    <span className="sm:hidden">Submitting</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Submit Documents</span>
                    <span className="sm:hidden">Submit</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
