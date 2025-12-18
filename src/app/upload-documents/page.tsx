"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Shield,
  FileCheck,
  ArrowRight,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAlert } from "@/context/AlertProvider";
import {
  useGetActiveDocumentTypes,
  useGetMyDocuments,
} from "@/controller/query/documents/useDocuments";
import { DocumentType } from "@/types";
import { getCookie } from "cookies-next";
import { getToken } from "@/controller/hook/useGetToken";

export default function UploadDocumentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<
    Record<
      number,
      { file: File; documentNumber: string; filePath?: string; uploadProgress?: number } | null
    >
  >({});
  const [isLoading, setIsLoading] = useState(false);

  // Get document types from API
  const { data: documentTypesData, isLoading: isLoadingDocTypes } = useGetActiveDocumentTypes();

  // Get my documents query
  const { refetch: refetchMyDocuments } = useGetMyDocuments(
    { page: 1, per_page: 10 },
    apiKey || "",
    false
  );

  useEffect(() => {
    // Get token from multiple sources (for presigned URL)
    const cookieToken = getCookie("authToken");
    if (cookieToken && typeof cookieToken === "string") {
      setAuthToken(cookieToken);
    } else {
      const token = getToken();
      if (token) {
        setAuthToken(token);
      }
    }

    // Get API key from localStorage (for createDocuments endpoint)
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, [user]);

  // Redirect if user has documents already
  useEffect(() => {
    const hasDocuments = user?.message?.has_documents ?? 1;
    if (hasDocuments === 1) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const documentTypes =
    documentTypesData &&
    typeof documentTypesData === "object" &&
    documentTypesData !== null &&
    "message" in documentTypesData &&
    documentTypesData.message
      ? (documentTypesData.message as DocumentType[])
      : [];

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
      if (!validateFile(file)) {
        return;
      }

      const documentNumber = documentNumbers[docId]?.trim();
      if (!documentNumber) {
        showAlert({
          variant: "warning",
          title: "Document Number Required",
          message: "Please enter the document number before uploading.",
        });
        return;
      }

      setUploadingDocId(docId);
      setUploadedFiles((prev) => ({
        ...prev,
        [docId]: { file, documentNumber, uploadProgress: 0 },
      }));

      try {
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

        setUploadedFiles((prev) => ({
          ...prev,
          [docId]: prev[docId] ? { ...prev[docId]!, uploadProgress: 25 } : null,
        }));

        await uploadFileToS3(file, upload_url);

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
          message: "File uploaded successfully. Click 'Submit Documents' to save.",
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
          message: errorMessage,
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
        message: "API key is missing. Please log in again.",
      });
      router.push("/signin");
      return;
    }

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
      if (!apiKey || apiKey.trim() === "") {
        throw new Error("API key is missing or invalid. Please log in again.");
      }

      const { createDocuments } = await import("@/controller/query/documents/document.service");

      await createDocuments({ documents: documentsToSubmit }, apiKey);

      await refetchMyDocuments();

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
        message: "Documents uploaded successfully! Redirecting to dashboard...",
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to upload document.";
      setIsLoading(false);

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
    }
  };

  const uploadedCount = Object.values(uploadedFiles).filter(
    (f) => f?.uploadProgress === 100
  ).length;
  const totalRequired = documentTypes.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Animated background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-96 w-96 animate-pulse rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-900/20"></div>
        <div className="absolute bottom-0 right-1/4 h-96 w-96 animate-pulse rounded-full bg-purple-200/30 blur-3xl delay-1000 dark:bg-purple-900/20"></div>
      </div>

      <div className="container relative z-10 mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 text-center md:mb-12">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg md:h-24 md:w-24">
            <Shield className="h-10 w-10 text-white md:h-12 md:w-12" />
          </div>
          <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl lg:text-5xl">
            Complete Your Profile
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300 md:text-xl">
            Upload your required documents to verify your identity and start using our platform
          </p>
          {totalRequired > 0 && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-md backdrop-blur-sm dark:bg-gray-800/80">
              <FileCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {uploadedCount} of {totalRequired} documents uploaded
              </span>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-4xl">
          {isLoadingDocTypes ? (
            <Card className="border-2 border-gray-200 bg-white/80 shadow-xl backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/80">
              <CardContent className="p-12">
                <div className="flex flex-col items-center py-12">
                  <Loader2 className="mb-4 h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Loading document requirements...
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : documentTypes.length === 0 ? (
            <Card className="border-2 border-gray-200 bg-white/80 shadow-xl backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/80">
              <CardContent className="p-12">
                <div className="flex flex-col items-center py-12">
                  <AlertCircle className="mb-4 h-12 w-12 text-yellow-500" />
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    No document types available. Please try again later.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-gray-200 bg-white/80 shadow-xl backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/80">
              <CardContent className="p-6 md:p-8">
                <div className="space-y-6">
                  {documentTypes.map((doc) => (
                    <div
                      key={doc.id}
                      className={`rounded-xl border-2 p-5 transition-all duration-300 md:p-6 ${
                        uploadedFiles[doc.id]?.uploadProgress === 100
                          ? "border-green-500 bg-green-50/50 dark:bg-green-900/10"
                          : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
                      }`}
                    >
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-3">
                            <div
                              className={`rounded-lg p-2 ${
                                uploadedFiles[doc.id]?.uploadProgress === 100
                                  ? "bg-green-100 dark:bg-green-900/30"
                                  : "bg-blue-100 dark:bg-blue-900/30"
                              }`}
                            >
                              <FileText
                                className={`h-5 w-5 ${
                                  uploadedFiles[doc.id]?.uploadProgress === 100
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-blue-600 dark:text-blue-400"
                                }`}
                              />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {doc.name}
                            </h3>
                            {uploadedFiles[doc.id]?.uploadProgress === 100 && (
                              <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-green-500" />
                            )}
                          </div>
                          {doc.description && (
                            <p className="ml-11 text-sm text-gray-600 dark:text-gray-400">
                              {doc.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Document Number Input */}
                      <div className="mb-4 space-y-2">
                        <Label
                          htmlFor={`doc-number-${doc.id}`}
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Document Number *
                        </Label>
                        <Input
                          id={`doc-number-${doc.id}`}
                          type="text"
                          value={documentNumbers[doc.id] || ""}
                          onChange={(e) => handleDocumentNumberChange(doc.id, e.target.value)}
                          placeholder="Enter document number"
                          disabled={
                            uploadedFiles[doc.id]?.uploadProgress === 100 ||
                            uploadingDocId === doc.id
                          }
                          className="h-11"
                          required
                        />
                      </div>

                      {/* File Input */}
                      <div className="space-y-2">
                        <Label
                          htmlFor={`file-${doc.id}`}
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
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
                            className="h-11 cursor-pointer file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 disabled:cursor-not-allowed dark:file:bg-blue-900/30 dark:file:text-blue-300"
                            onChange={(e) => handleFileChange(doc.id, e.target.files?.[0] || null)}
                          />
                          {uploadedFiles[doc.id]?.uploadProgress === 100 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2 text-red-600 hover:text-red-700 dark:text-red-400"
                              onClick={() => handleFileChange(doc.id, null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Accepted: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
                        </p>
                      </div>

                      {/* Upload Progress */}
                      {uploadingDocId === doc.id && uploadedFiles[doc.id] && (
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600 dark:text-gray-400">Uploading...</span>
                            <span className="font-medium text-blue-600 dark:text-blue-400">
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
                        <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                          <FileText className="h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                          <span className="flex-1 truncate text-sm text-gray-700 dark:text-gray-300">
                            {uploadedFiles[doc.id]?.file.name}
                          </span>
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-col items-stretch justify-end gap-4 border-t border-gray-200 pt-8 dark:border-gray-700 sm:flex-row sm:items-center">
                  <Button
                    type="button"
                    onClick={handleUpload}
                    disabled={isLoading || uploadingDocId !== null || uploadedCount === 0}
                    className="flex h-12 w-full items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Documents</span>
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
