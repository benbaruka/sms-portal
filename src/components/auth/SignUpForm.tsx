"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAlert } from "@/context/AlertProvider";
import { _login } from "@/controller/query/auth/auth.service";
import { useSignup } from "@/controller/query/auth/useAuthCredential";
import { useResendOtp, useVerifyOtp } from "@/controller/query/auth/useOtp";
import {
  useGetActiveDocumentTypes,
  useGetMyDocuments,
  useUploadMultipleDocuments,
} from "@/controller/query/documents/useDocuments";
import { DocumentType, SignupData } from "@/types";
import { deleteCookie } from "cookies-next";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Mail,
  Phone,
  Search,
  Shield,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";

// Liste des pays avec codes et drapeaux
const COUNTRIES = [
  { code: "CD", name: "Congo (DRC)", dialCode: "+243", flag: "🇨🇩" },
  { code: "CG", name: "Congo (Brazzaville)", dialCode: "+242", flag: "🇨🇬" },
  { code: "KE", name: "Kenya", dialCode: "+254", flag: "🇰🇪" },
];

interface KYBDocument {
  id: number;
  name: string;
  type: string;
  required: boolean;
  document_type_id: number;
}

export default function SignUpForm({ setIsSignUp }: { setIsSignUp?: (value: boolean) => void }) {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [kybDocuments, setKybDocuments] = useState<KYBDocument[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<
    Record<
      number,
      { file: File; documentNumber: string; filePath?: string; uploadProgress?: number } | null
    >
  >({});
  const [documentNumbers, setDocumentNumbers] = useState<Record<number, string>>({});
  const [uploadingDocId, setUploadingDocId] = useState<number | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const isSubmittingRef = useRef(false);
  const [selectedCountry, setSelectedCountry] = useState("CD");
  const [countrySearch, setCountrySearch] = useState("");
  const [orgData, setOrgData] = useState({
    organizationName: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    country: "",
    password: "",
    confirmPassword: "",
  });

  const signupMutation = useSignup();
  const verifyOtpMutation = useVerifyOtp();
  const resendOtpMutation = useResendOtp();
  const { showAlert } = useAlert();
  const { data: documentTypesData, isLoading: isLoadingDocTypes } = useGetActiveDocumentTypes();
  const uploadDocumentsMutation = useUploadMultipleDocuments();

  // Get my documents after upload
  const { refetch: refetchMyDocuments } = useGetMyDocuments(
    { page: 1, per_page: 10 },
    authToken || "",
    step === 5 && !!authToken
  );

  useEffect(() => {
    const completed = localStorage.getItem("onboarding_completed");
    if (completed === "true") router.push("/dashboard");
  }, [router]);

  // Filtrer les pays selon la recherche
  const filteredCountries = useMemo(() => {
    if (!countrySearch) return COUNTRIES;
    const search = countrySearch.toLowerCase();
    return COUNTRIES.filter(
      (country) =>
        country.name.toLowerCase().includes(search) ||
        country.dialCode.includes(search) ||
        country.code.toLowerCase().includes(search)
    );
  }, [countrySearch]);

  const selectedCountryData = COUNTRIES.find((c) => c.code === selectedCountry) || COUNTRIES[0];

  const handleCountrySelectChange = (value: string) => {
    setSelectedCountry(value);
    setCountrySearch("");
  };

  // Load document types when step 4 is reached
  useEffect(() => {
    if (
      step === 4 &&
      documentTypesData &&
      typeof documentTypesData === "object" &&
      documentTypesData !== null &&
      "message" in documentTypesData &&
      documentTypesData.message &&
      kybDocuments.length === 0
    ) {
      const docs: KYBDocument[] = (documentTypesData.message as DocumentType[]).map(
        (doc: DocumentType) => ({
          id: doc.id,
          name: doc.name,
          type: doc.description || "",
          required: true, // You can adjust this based on your business logic
          document_type_id: doc.id,
        })
      );
      setKybDocuments(docs);
    }
  }, [step, documentTypesData, kybDocuments.length]);

  const handleNext = async () => {
    if (step === 1) {
      // Validate step 1 before proceeding to step 2
      if (!validateStep1()) {
        showAlert({
          variant: "error",
          title: "Validation Error",
          message: "Please fill in all required fields.",
        });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Prevent double submission
      if (isSubmittingRef.current || signupMutation.isPending || isLoading) {
        return;
      }

      // Validate step 2 before proceeding to step 3 (OTP)
      if (!validateStep2()) {
        return;
      }

      // Do signup only (no auto-login) - OTP will be sent automatically
      isSubmittingRef.current = true;
      setIsLoading(true);
      const signupData = mapToSignupData();

      try {
        await signupMutation.mutateAsync(signupData);
        // Move to step 3 (OTP verification) after successful signup
        setStep(3);
        setIsLoading(false);
      } catch {
        // Error is handled by mutation's onError callback
        setIsLoading(false);
      } finally {
        isSubmittingRef.current = false;
      }
    } else if (step === 3) {
      // OTP verification - handled separately in handleVerifyOtp
    } else if (step === 4) {
      // Documents upload happens when user clicks "Submit Documents" in step 4
      // After upload, user is redirected to signin page (handled in submit handler)
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    } else if (step === 4) {
      setStep(3);
    }
  };

  // Update OTP code when digits change
  useEffect(() => {
    const code = otpDigits.join("");
    setOtpCode(code);
  }, [otpDigits]);

  // Focus first input when step 3 is reached
  useEffect(() => {
    if (step === 3 && otpInputRefs.current[0]) {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  const handleOtpDigitChange = (index: number, value: string) => {
    // Only allow numbers
    const digit = value.replace(/\D/g, "").slice(0, 1);

    if (digit) {
      const newDigits = [...otpDigits];
      newDigits[index] = digit;
      setOtpDigits(newDigits);

      // Auto-focus next input
      if (index < 5 && otpInputRefs.current[index + 1]) {
        otpInputRefs.current[index + 1]?.focus();
      }
    } else {
      // Clear current digit
      const newDigits = [...otpDigits];
      newDigits[index] = "";
      setOtpDigits(newDigits);
    }
  };

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
    // Handle paste
    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const digits = text.replace(/\D/g, "").slice(0, 6).split("");
        const newDigits = [...otpDigits];
        digits.forEach((digit, i) => {
          if (i < 6) newDigits[i] = digit;
        });
        setOtpDigits(newDigits);
        // Focus last filled input or last input
        const lastIndex = Math.min(digits.length - 1, 5);
        otpInputRefs.current[lastIndex]?.focus();
      });
    }
  };

  const handleVerifyOtp = async () => {
    const code = otpDigits.join("");
    if (!code || code.length !== 6) {
      return;
    }

    setIsLoading(true);

    try {
      // Verify OTP with email or phone
      const otpData: { verification_code: string; email?: string; msisdn?: string } = {
        verification_code: code,
      };

      if (orgData.email) {
        otpData.email = orgData.email.trim();
      } else if (orgData.phone) {
        otpData.msisdn = formatPhoneNumber(orgData.phone);
      }

      await verifyOtpMutation.mutateAsync(otpData);

      // After OTP verification, do login to get token for documents step
      const loginData: { password: string; email?: string; msisdn?: string } = {
        password: orgData.password,
      };

      if (orgData.email) {
        loginData.email = orgData.email.trim();
      } else if (orgData.phone) {
        loginData.msisdn = formatPhoneNumber(orgData.phone);
      }

      // Use _login service directly (without hook to avoid auto-redirect)
      const loginResult = await _login(loginData);

      if (loginResult?.message?.token) {
        const token = loginResult.message.token;
        setAuthToken(token);
        // Move to step 4 (documents) after successful OTP verification and login
        setStep(4);
      }
      setIsLoading(false);
    } catch {
      // Error is handled by mutation's onError callback
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const resendData: { email?: string; msisdn?: string } = {};

      if (orgData.email) {
        resendData.email = orgData.email.trim();
      } else if (orgData.phone) {
        resendData.msisdn = formatPhoneNumber(orgData.phone);
      }

      await resendOtpMutation.mutateAsync(resendData);
      setOtpDigits(["", "", "", "", "", ""]); // Clear OTP inputs
      setOtpCode(""); // Clear OTP code
      // Focus first input after resend
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch {
      // Error is handled by mutation's onError callback
    }
  };

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
      } catch (error) {
        setUploadingDocId(null);
        setUploadedFiles((prev) => {
          const newFiles = { ...prev };
          delete newFiles[docId];
          return newFiles;
        });
        showAlert({
          variant: "error",
          title: "Upload Failed",
          message:
            error instanceof Error ? error.message : "Failed to upload document. Please try again.",
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

  // Calculate progress based on step (1-4 steps: 25%, 50%, 75%, 100%)
  const progress = step === 1 ? 25 : step === 2 ? 50 : step === 3 ? 75 : step === 4 ? 100 : 0;

  // Country mapping: country name to country code
  const countryCodeMap: Record<string, string> = {
    "United States": "us",
    "United Kingdom": "gb",
    Canada: "ca",
    France: "fr",
    Germany: "de",
    Spain: "es",
    Italy: "it",
    Nigeria: "ng",
    India: "in",
    Japan: "jp",
    Kenya: "ke",
    Congo: "cd",
    "South Africa": "za",
    Ghana: "gh",
    Tanzania: "tz",
    Uganda: "ug",
    Rwanda: "rw",
  };

  const countries = [
    "United States",
    "United Kingdom",
    "Canada",
    "France",
    "Germany",
    "Spain",
    "Italy",
    "Nigeria",
    "India",
    "Japan",
    "Kenya",
    "Congo",
    "South Africa",
    "Ghana",
    "Tanzania",
    "Uganda",
    "Rwanda",
  ];

  // Helper function to format phone number with country code
  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return "";
    // Si le numéro ne commence pas par +, ajouter le code pays
    if (!phone.startsWith("+")) {
      // Retirer les zéros en début si présents
      const cleanedPhone = phone.replace(/^0+/, "");
      return selectedCountryData.dialCode + cleanedPhone;
    }
    return phone;
  };

  // Validate step 1 form data (basic info)
  const validateStep1 = (): boolean => {
    if (!orgData.organizationName.trim()) {
      return false;
    }
    if (!orgData.contactName.trim()) {
      return false;
    }
    if (!orgData.email.trim() || !orgData.email.includes("@")) {
      return false;
    }
    if (!orgData.phone.trim()) {
      return false;
    }
    if (!orgData.address.trim()) {
      return false;
    }
    if (!orgData.country) {
      return false;
    }
    return true;
  };

  // Validate step 2 form data (password)
  const validateStep2 = (): boolean => {
    if (!orgData.password || orgData.password.length < 6) {
      return false;
    }
    if (orgData.password !== orgData.confirmPassword) {
      return false;
    }
    return true;
  };

  // Map form data to SignupData format
  const mapToSignupData = (): SignupData => {
    const countryCode =
      countryCodeMap[orgData.country] || orgData.country.toLowerCase().slice(0, 2);
    const formattedPhone = formatPhoneNumber(orgData.phone);

    return {
      company_name: orgData.organizationName.trim(),
      full_name: orgData.contactName.trim(),
      msisdn: formattedPhone,
      email: orgData.email.trim(),
      country_code: countryCode,
      address: orgData.address.trim(),
      password: orgData.password,
    };
  };

  return (
    <div className="flex w-full text-gray-900 dark:text-white">
      {/* Left column - Branding */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-700 via-brand-500 to-blue-light-25 dark:from-brand-950 dark:via-brand-800 dark:to-brand-700 lg:flex lg:w-1/2">
        <div className="opacity-18 absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoMnYyaC0yem0wLTZoMnYyaC0yem02IDZoMnYyaC0yem0wLTZoMnYyaC0yem0tMTIgNmgydjJoLTJ6bTAtNmgydjJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')]" />{" "}
        <div className="relative z-10 flex w-full flex-col items-center justify-center p-12 text-gray-900 dark:text-white">
          <div className="max-w-md space-y-8">
            <div className="mb-12 flex items-center space-x-3">
              <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm dark:bg-white/10">
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold">SMS Platform</h1>
                <p className="text-sm text-gray-700 dark:text-white/90">
                  Enterprise Messaging Solutions
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-4xl font-bold leading-tight">
                Streamline Your Business Communications
              </h2>
              <p className="text-lg text-gray-700 dark:text-white/90">
                Connect with your customers instantly through our reliable SMS delivery platform.
                Trusted by businesses worldwide.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-8">
              <div className="rounded-xl bg-white/10 p-6 backdrop-blur-sm dark:bg-white/5">
                <div className="mb-2 text-3xl font-bold">99.9%</div>
                <div className="text-sm text-gray-600 dark:text-white/80">Delivery Rate</div>
              </div>
              <div className="rounded-xl bg-white/10 p-6 backdrop-blur-sm dark:bg-white/5">
                <div className="mb-2 text-3xl font-bold">24/7</div>
                <div className="text-sm text-gray-600 dark:text-white/80">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right column - Form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          <Card className="rounded-2xl border border-gray-100 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-800">
            <CardHeader className="space-y-3 pb-6 text-center">
              <div className="mb-2 flex justify-center">
                <div className="rounded-full bg-white/20 p-3 shadow-theme-sm dark:bg-gray-900">
                  <Image
                    src="/images/logo.png"
                    alt="Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-brand-500 dark:text-brand-300">
                Create Your Account
              </CardTitle>
              <CardDescription className="text-muted-foreground text-base dark:text-gray-300">
                Get started with your onboarding process
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="mb-6 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    Step {step} of 4
                  </span>
                  <span className="font-semibold text-brand-600 dark:text-brand-400">
                    {progress}%
                  </span>
                </div>
                <Progress value={progress} className="h-2.5" />
              </div>

              {/* Step 1 */}
              {step === 1 && (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Organization Name</Label>
                      <Input
                        placeholder="Acme Corporation"
                        className="h-12 rounded-xl border-2 border-gray-100 bg-white focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:focus:border-brand-400"
                        value={orgData.organizationName}
                        onChange={(e) =>
                          setOrgData({ ...orgData, organizationName: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Person</Label>
                      <Input
                        className="h-12 rounded-xl border-2 border-gray-100 bg-white focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:focus:border-brand-400"
                        placeholder="John Doe"
                        value={orgData.contactName}
                        onChange={(e) => setOrgData({ ...orgData, contactName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input
                        className="h-12 rounded-xl border-2 border-gray-100 bg-white focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:focus:border-brand-400"
                        type="email"
                        placeholder="john@acme.com"
                        value={orgData.email}
                        onChange={(e) => setOrgData({ ...orgData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <div className="group relative">
                        {/* Icône Phone à gauche */}
                        <div className="pointer-events-none absolute bottom-0 left-3.5 top-0 z-10 flex items-center justify-center">
                          <Phone className="h-4 w-4 text-gray-400 transition-colors group-focus-within:text-brand-500" />
                        </div>

                        {/* Sélecteur de pays intégré */}
                        <div className="absolute bottom-0 left-8 top-0 z-20 flex items-center">
                          <Select value={selectedCountry} onValueChange={handleCountrySelectChange}>
                            <SelectTrigger className="h-full w-auto min-w-0 cursor-pointer gap-1 rounded-none border-0 bg-transparent px-2 py-0 shadow-none transition-colors hover:bg-gray-50/50 focus:ring-0 focus:ring-offset-0 dark:hover:bg-gray-800/50">
                              <SelectValue>
                                <span className="flex items-center gap-1">
                                  <span className="text-sm leading-none">
                                    {selectedCountryData.flag}
                                  </span>
                                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                    {selectedCountryData.dialCode}
                                  </span>
                                </span>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="z-[100] max-h-[300px] w-[320px]">
                              <div className="sticky top-0 z-10 border-b border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900">
                                <div className="relative">
                                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                  <Input
                                    type="text"
                                    placeholder="Search country..."
                                    value={countrySearch}
                                    onChange={(e) => setCountrySearch(e.target.value)}
                                    className="h-9 rounded-lg border border-gray-200 bg-white pl-9 text-sm dark:border-gray-700 dark:bg-gray-800"
                                    onClick={(e) => e.stopPropagation()}
                                    onFocus={(e) => e.stopPropagation()}
                                  />
                                </div>
                              </div>
                              <div className="max-h-[240px] overflow-y-auto">
                                {filteredCountries.length > 0 ? (
                                  filteredCountries.map((country) => (
                                    <SelectItem
                                      key={country.code}
                                      value={country.code}
                                      className="cursor-pointer"
                                    >
                                      <div className="flex w-full min-w-0 items-center gap-3">
                                        <span className="flex-shrink-0 text-lg">
                                          {country.flag}
                                        </span>
                                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-700 dark:text-gray-300">
                                          {country.name}
                                        </span>
                                        <span className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
                                          {country.dialCode}
                                        </span>
                                      </div>
                                    </SelectItem>
                                  ))
                                ) : (
                                  <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                                    No country found
                                  </div>
                                )}
                              </div>
                            </SelectContent>
                          </Select>
                          {/* Séparateur vertical */}
                          <div className="mx-1 h-10 w-[1px] bg-gray-200 dark:bg-gray-700" />
                        </div>

                        {/* Champ de saisie */}
                        <Input
                          type="tel"
                          placeholder="number"
                          value={orgData.phone}
                          onChange={(e) => setOrgData({ ...orgData, phone: e.target.value })}
                          className="h-12 rounded-xl border-2 border-gray-100 bg-white pl-[135px] pr-4 text-gray-900 transition-all placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-brand-400 dark:focus:ring-brand-400/10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Business Address</Label>
                    <Textarea
                      className="h-12 rounded-xl border-2 border-gray-100 bg-white focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:focus:border-brand-400"
                      placeholder="123 Business St, Suite 100"
                      rows={3}
                      value={orgData.address}
                      onChange={(e) => setOrgData({ ...orgData, address: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Select
                      value={orgData.country}
                      onValueChange={(v) => setOrgData({ ...orgData, country: v })}
                      searchable={true}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleNext}
                    disabled={!validateStep1()}
                    className="h-12 w-full rounded-xl bg-brand-500 text-base font-semibold text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next Step
                  </Button>

                  <p className="mt-4 text-center text-xs text-gray-600 dark:text-gray-400">
                    By signing up, you agree to our{" "}
                    <Link href="/terms" className="font-medium text-brand-500 hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="font-medium text-brand-500 hover:underline">
                      Privacy Policy
                    </Link>
                  </p>
                </div>
              )}

              {/* Step 2 - Password */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password (min 6 characters)"
                        className="h-12 rounded-xl border-2 border-gray-100 bg-white pr-10 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:focus:border-brand-400"
                        value={orgData.password}
                        onChange={(e) => setOrgData({ ...orgData, password: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {orgData.password && orgData.password.length < 6 && (
                      <p className="text-xs text-red-500">Password must be at least 6 characters</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className="h-12 rounded-xl border-2 border-gray-100 bg-white focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:focus:border-brand-400"
                      value={orgData.confirmPassword}
                      onChange={(e) => setOrgData({ ...orgData, confirmPassword: e.target.value })}
                    />
                    {orgData.password &&
                      orgData.confirmPassword &&
                      orgData.password !== orgData.confirmPassword && (
                        <p className="text-xs text-red-500">Passwords do not match</p>
                      )}
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={handleBack} className="h-12 rounded-xl">
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={isLoading || signupMutation.isPending || !validateStep2()}
                      className="h-12 rounded-xl bg-brand-500 text-base font-semibold text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isLoading || signupMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Next Step"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3 - OTP Verification */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="mb-6 flex flex-col items-center space-y-4">
                    <div className="rounded-full bg-gradient-to-br from-brand-500 to-brand-600 p-5 shadow-lg shadow-brand-500/20">
                      <Shield className="h-10 w-10 text-white" />
                    </div>
                    <div className="space-y-2 text-center">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Verify Your Account
                      </h3>
                      <p className="max-w-sm text-sm text-gray-600 dark:text-gray-400">
                        We&apos;ve sent a 6-digit verification code to your{" "}
                        {orgData.email ? "email address" : "phone number"}
                      </p>
                      <div className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800/50">
                        {orgData.email ? (
                          <>
                            <Mail className="h-4 w-4 text-brand-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {orgData.email}
                            </span>
                          </>
                        ) : (
                          <>
                            <Phone className="h-4 w-4 text-brand-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {formatPhoneNumber(orgData.phone)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="block text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Enter Verification Code
                    </Label>
                    <div className="flex items-center justify-center gap-3">
                      {otpDigits.map((digit, index) => (
                        <Input
                          key={index}
                          ref={(el) => {
                            otpInputRefs.current[index] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="h-16 w-16 rounded-xl border-2 border-gray-200 bg-white text-center text-3xl font-bold text-gray-900 transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-400/20"
                        />
                      ))}
                    </div>
                    {otpCode && otpCode.length !== 6 && (
                      <p className="text-center text-xs text-red-500">Please enter all 6 digits</p>
                    )}
                  </div>

                  <div className="flex items-center justify-center pt-2">
                    <Button
                      variant="ghost"
                      onClick={handleResendOtp}
                      disabled={resendOtpMutation.isPending}
                      className="text-sm text-brand-500 hover:bg-brand-50 hover:text-brand-600 dark:text-brand-400 dark:hover:bg-brand-900/20 dark:hover:text-brand-300"
                    >
                      {resendOtpMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Didn&apos;t receive the code?{" "}
                          <span className="ml-1 font-semibold">Resend</span>
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="flex justify-between gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      className="h-12 flex-1 rounded-xl border-2"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleVerifyOtp}
                      disabled={isLoading || verifyOtpMutation.isPending || otpCode.length !== 6}
                      className="h-12 flex-1 rounded-xl bg-brand-500 text-base font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isLoading || verifyOtpMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify & Continue"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4 - Documents Upload */}
              {step === 4 && (
                <div className="relative">
                  {isLoadingDocTypes ? (
                    <div className="flex flex-col items-center py-8">
                      <Loader2 className="mb-3 h-10 w-10 animate-spin text-brand-500" />
                      <p className="text-sm text-gray-500 dark:text-gray-300">
                        Loading document requirements...
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                          Upload Required Documents
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Please upload the required documents to complete your account
                          verification.
                        </p>
                      </div>

                      <div className="custom-scroll mb-4 max-h-[400px] space-y-3 overflow-y-auto pr-2">
                        {kybDocuments.length === 0 ? (
                          <div className="flex flex-col items-center py-8">
                            <AlertCircle className="mb-3 h-10 w-10 text-yellow-500" />
                            <p className="text-center text-sm text-gray-500 dark:text-gray-300">
                              No document types available. Please try again later.
                            </p>
                          </div>
                        ) : (
                          kybDocuments.map((doc) => {
                            const isUploading = uploadingDocId === doc.id;
                            const isUploaded =
                              uploadedFiles[doc.id] &&
                              uploadedFiles[doc.id]!.uploadProgress === 100;
                            const uploadProgress = uploadedFiles[doc.id]?.uploadProgress || 0;

                            return (
                              <div
                                key={doc.id}
                                className={`rounded-xl border-2 bg-white p-4 transition-all dark:bg-gray-900 ${
                                  isUploaded
                                    ? "border-green-500 bg-green-50/50 dark:border-green-500/50 dark:bg-green-900/10"
                                    : isUploading
                                      ? "border-brand-500 dark:border-brand-500/50"
                                      : "border-gray-200 dark:border-gray-700"
                                }`}
                              >
                                <div className="mb-3 flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="mb-1 flex items-center gap-2">
                                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {doc.name}
                                      </h4>
                                      {doc.required && (
                                        <span className="text-xs font-medium text-red-500">
                                          * Required
                                        </span>
                                      )}
                                      {isUploaded && (
                                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                                      )}
                                    </div>
                                    {doc.type && (
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {doc.type}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Document Number Input - REQUIRED BEFORE UPLOAD */}
                                <div className="mb-3 space-y-2">
                                  <Label
                                    htmlFor={`doc-number-${doc.id}`}
                                    className="text-xs font-medium text-gray-700 dark:text-gray-300"
                                  >
                                    Document/Certificate Number{" "}
                                    <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id={`doc-number-${doc.id}`}
                                    type="text"
                                    placeholder="Enter document number (e.g., PASS-2024-001)"
                                    value={documentNumbers[doc.id] || ""}
                                    onChange={(e) => {
                                      setDocumentNumbers({
                                        ...documentNumbers,
                                        [doc.id]: e.target.value,
                                      });
                                    }}
                                    disabled={isUploaded || isUploading}
                                    className="h-9 rounded-lg border-2 text-sm focus:border-brand-500 dark:focus:border-brand-400"
                                    required
                                  />
                                </div>

                                {/* File Input */}
                                <div className="space-y-2">
                                  <Label
                                    htmlFor={`file-${doc.id}`}
                                    className="text-xs font-medium text-gray-700 dark:text-gray-300"
                                  >
                                    Select File
                                  </Label>
                                  <div className="relative">
                                    <Input
                                      id={`file-${doc.id}`}
                                      type="file"
                                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                      disabled={
                                        isUploaded ||
                                        isUploading ||
                                        !documentNumbers[doc.id]?.trim()
                                      }
                                      className="h-9 cursor-pointer text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-700 hover:file:bg-brand-100 disabled:cursor-not-allowed dark:file:bg-brand-900 dark:file:text-brand-300"
                                      onChange={(e) =>
                                        handleFileChange(doc.id, e.target.files?.[0] || null)
                                      }
                                    />
                                    {isUploaded && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleFileChange(doc.id, null)}
                                        className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 p-0 text-red-600 hover:text-red-700 dark:text-red-400"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Accepted: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
                                  </p>
                                </div>

                                {/* Upload Progress */}
                                {isUploading && (
                                  <div className="mt-3 space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-gray-600 dark:text-gray-400">
                                        Uploading...
                                      </span>
                                      <span className="font-medium text-brand-600 dark:text-brand-400">
                                        {uploadProgress}%
                                      </span>
                                    </div>
                                    <Progress value={uploadProgress} className="h-2" />
                                  </div>
                                )}

                                {/* Uploaded File Info */}
                                {isUploaded && uploadedFiles[doc.id] && (
                                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-2 dark:border-green-800 dark:bg-green-900/20">
                                    <FileText className="h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                                    <span className="flex-1 truncate text-xs text-gray-700 dark:text-gray-300">
                                      {uploadedFiles[doc.id]?.file.name}
                                    </span>
                                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Validation: Check if all required documents are uploaded */}
                      {(() => {
                        const requiredDocs = kybDocuments.filter((d) => d.required);
                        const uploadedCount = Object.keys(uploadedFiles).filter(
                          (id) => uploadedFiles[parseInt(id)]?.uploadProgress === 100
                        ).length;
                        const allRequiredUploaded = requiredDocs.every(
                          (doc) => uploadedFiles[doc.id]?.uploadProgress === 100
                        );

                        return (
                          <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                            <Button
                              variant="outline"
                              onClick={handleBack}
                              className="h-10 rounded-xl"
                            >
                              Back
                            </Button>
                            <div className="flex items-center gap-3">
                              {!allRequiredUploaded && (
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {requiredDocs.length - uploadedCount} required document
                                  {requiredDocs.length - uploadedCount !== 1 ? "s" : ""} remaining
                                </p>
                              )}
                              <Button
                                onClick={async () => {
                                  if (!authToken) {
                                    showAlert({
                                      variant: "error",
                                      title: "Error",
                                      message: "Authentication token is missing.",
                                    });
                                    return;
                                  }

                                  // Prepare documents for submission (only uploaded ones with file_path)
                                  const documentsToSubmit = Object.entries(uploadedFiles)
                                    .filter(
                                      ([, value]) =>
                                        value !== null &&
                                        value.uploadProgress === 100 &&
                                        value.filePath
                                    )
                                    .map(([docId, value]) => {
                                      const docType = kybDocuments.find(
                                        (d) => d.id === parseInt(docId)
                                      );
                                      return {
                                        document_type_id: parseInt(docId),
                                        file_path: value!.filePath!,
                                        document_name: docType?.name || `Document ${docId}`,
                                        document_number: value!.documentNumber,
                                      };
                                    });

                                  if (documentsToSubmit.length === 0) {
                                    showAlert({
                                      variant: "warning",
                                      title: "No Documents",
                                      message:
                                        "Please upload at least one document before continuing.",
                                    });
                                    return;
                                  }

                                  // Validate that all required documents have numbers
                                  const missingNumbers = requiredDocs.filter(
                                    (doc) => !documentNumbers[doc.id]?.trim()
                                  );

                                  if (missingNumbers.length > 0) {
                                    showAlert({
                                      variant: "warning",
                                      title: "Document Numbers Required",
                                      message: `Please enter document numbers for: ${missingNumbers.map((d) => d.name).join(", ")}`,
                                    });
                                    return;
                                  }

                                  setIsLoading(true);

                                  try {
                                    const { createDocuments } =
                                      await import("@/controller/query/documents/document.service");

                                    // Step 3: Create documents in DB
                                    await createDocuments(
                                      { documents: documentsToSubmit },
                                      authToken
                                    );

                                    // Refresh my documents
                                    await refetchMyDocuments();

                                    // After successful document upload, redirect to login page
                                    showAlert({
                                      variant: "success",
                                      title: "Documents Uploaded",
                                      message:
                                        "Your documents have been uploaded successfully. Please sign in to continue.",
                                    });

                                    // Clear auth token and redirect to signin
                                    setAuthToken(null);
                                    deleteCookie("authToken");
                                    localStorage.removeItem("apiKey");

                                    // Redirect to signin page after a short delay
                                    setTimeout(() => {
                                      router.push("/signin");
                                    }, 1500);
                                    setIsLoading(false);
                                  } catch {
                                    setIsLoading(false);
                                    // Error is handled by the service
                                  }
                                }}
                                disabled={
                                  isLoading ||
                                  uploadDocumentsMutation.isPending ||
                                  uploadingDocId !== null ||
                                  !allRequiredUploaded
                                }
                                className="h-10 rounded-xl bg-brand-500 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isLoading || uploadDocumentsMutation.isPending ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Submit Documents
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>
              )}

              {/* Sign in link */}
              {step < 5 && (
                <div className="pt-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-4 text-gray-500 dark:bg-gray-800">
                        Already have an account?
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setIsSignUp && setIsSignUp(false)}
                    className="mt-4 h-12 w-full rounded-xl border-2 border-brand-500 text-base font-semibold text-brand-500 hover:bg-brand-25 dark:border-brand-300 dark:text-brand-300 dark:hover:bg-gray-900"
                  >
                    Sign In
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
