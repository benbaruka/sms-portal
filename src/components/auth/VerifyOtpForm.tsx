"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAlert } from "@/context/AlertProvider";
import { useAuth } from "@/context/AuthProvider";
import { useResendOtp, useVerifyOtp } from "@/controller/query/auth/useOtp";
import { Loader2, Mail, Phone } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

export default function VerifyOtpForm() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { user, setUser } = useAuth();
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const verifyOtpMutation = useVerifyOtp();
  const resendOtpMutation = useResendOtp();

  // Get email or phone from localStorage or user session
  const email =
    typeof window !== "undefined"
      ? localStorage.getItem("pending-verification-email") || user?.message?.user?.email || ""
      : "";
  const msisdn =
    typeof window !== "undefined"
      ? localStorage.getItem("pending-verification-msisdn") || user?.message?.user?.msisdn || ""
      : "";

  // Redirect if no email/phone found
  useEffect(() => {
    if (!email && !msisdn) {
      router.push("/signin");
    }
  }, [email, msisdn, router]);

  // Update OTP code when digits change
  useEffect(() => {
    const code = otpDigits.join("");
    setOtpCode(code);
  }, [otpDigits]);

  // Auto-send OTP when component mounts (if not already sent recently)
  useEffect(() => {
    if (email || msisdn) {
      const lastOtpSent = localStorage.getItem("otp-sent-timestamp");
      const now = Date.now();
      // Only send if not sent in the last 30 seconds
      if (!lastOtpSent || now - parseInt(lastOtpSent) > 30000) {
        const sendOtp = async () => {
          try {
            const resendData: { email?: string; msisdn?: string } = {};
            if (email) {
              resendData.email = email.trim();
            } else if (msisdn) {
              resendData.msisdn = msisdn;
            }
            await resendOtpMutation.mutateAsync(resendData);
            localStorage.setItem("otp-sent-timestamp", now.toString());
          } catch {
            // Error is handled by mutation's onError callback
          }
        };
        sendOtp();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Focus first input when component mounts
  useEffect(() => {
    if (otpInputRefs.current[0]) {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, []);

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
      showAlert({
        variant: "error",
        title: "Invalid Code",
        message: "Please enter all 6 digits of the verification code.",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Verify OTP with email or phone
      const otpData: { verification_code: string; email?: string; msisdn?: string } = {
        verification_code: code,
      };

      if (email) {
        otpData.email = email.trim();
      } else if (msisdn) {
        otpData.msisdn = msisdn;
      }

      await verifyOtpMutation.mutateAsync(otpData);

      // Clear pending verification data
      localStorage.removeItem("pending-verification-email");
      localStorage.removeItem("pending-verification-msisdn");
      localStorage.removeItem("needs-otp-verification");
      // Clear cookie aussi
      if (typeof document !== "undefined") {
        document.cookie = "needs-otp-verification=; path=/; max-age=0; SameSite=Lax";
      }

      // Update user session with verified status (useOtp hook already does this, but ensure it's persisted)
      if (user) {
        const storedUser = localStorage.getItem("user-session");
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.message?.user) {
              parsedUser.message.user.status = 1; // Verified
              localStorage.setItem("user-session", JSON.stringify(parsedUser));
              setUser(parsedUser);
            }
          } catch (error) {}
        }
      }

      // After successful OTP verification, check if documents are required
      const hasDocuments = user?.message?.has_documents ?? 1;
      const shouldRedirectToDocuments = hasDocuments === 0;

      showAlert({
        variant: "success",
        title: "Verification Successful",
        message: "Your account has been verified successfully. Redirecting...",
      });

      setTimeout(() => {
        if (shouldRedirectToDocuments) {
          router.push("/upload-documents");
        } else {
          router.push("/dashboard");
        }
      }, 1500);
      setIsLoading(false);
    } catch {
      // Error is handled by mutation's onError callback
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const resendData: { email?: string; msisdn?: string } = {};

      if (email) {
        resendData.email = email.trim();
      } else if (msisdn) {
        resendData.msisdn = msisdn;
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

  // Helper function to format phone number (same as in SignUpForm)
  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return "";
    // Si le numéro ne commence pas par +, ajouter le code pays par défaut
    if (!phone.startsWith("+")) {
      return `+243${phone.replace(/^0+/, "")}`;
    }
    return phone;
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-brand-50 to-blue-light-50 px-8 py-8 dark:from-gray-900 dark:to-gray-800">
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
              Verify Your Account
            </CardTitle>
            <CardDescription className="text-muted-foreground text-base dark:text-gray-300">
              Enter the verification code sent to your {email ? "email" : "phone"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-6 pb-6">
            <div className="space-y-6">
              <div className="mb-6 flex flex-col items-center space-y-4">
                <div className="space-y-1 text-center">
                  <p className="max-w-sm text-sm text-gray-600 dark:text-gray-400">
                    We&apos;ve sent a 6-digit verification code to your{" "}
                    {email ? "email address" : "phone number"}
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800/50">
                    {email ? (
                      <>
                        <Mail className="h-4 w-4 text-brand-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {email}
                        </span>
                      </>
                    ) : (
                      <>
                        <Phone className="h-4 w-4 text-brand-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {formatPhoneNumber(msisdn)}
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
                <div className="flex items-center justify-center gap-3 px-4">
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
                  onClick={() => router.push("/signin")}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
