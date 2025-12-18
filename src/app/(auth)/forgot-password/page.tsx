"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForgotPassword, useResetPassword } from "@/controller/query/auth/useAuthCredential";
import { useAlert } from "@/context/AlertProvider";
import SpinnerLoader from "@/global/spinner/SpinnerLoader";
import { Mail, Lock, Eye, EyeOff, CheckCircle2, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sent = searchParams.get("sent");
  const token = searchParams.get("token");

  const [step, setStep] = useState<"email" | "sent" | "reset">(
    token ? "reset" : sent ? "sent" : "email"
  );
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetToken, setResetToken] = useState(token || "");

  const { mutate: forgotPassword, isPending: isForgotPasswordLoading } = useForgotPassword();
  const { mutate: resetPassword, isPending: isResetPasswordLoading } = useResetPassword();
  const { showAlert } = useAlert();

  useEffect(() => {
    if (token) {
      setResetToken(token);
      setStep("reset");
    } else if (sent) {
      setStep("sent");
    }
  }, [token, sent]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      showAlert({
        variant: "error",
        title: "Email Required",
        message: "Please enter your email address.",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      showAlert({
        variant: "error",
        title: "Invalid Format",
        message: "Please enter a valid email address.",
      });
      return;
    }

    forgotPassword(trimmedEmail);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetToken) {
      showAlert({
        variant: "error",
        title: "Token Required",
        message: "Reset token is required.",
      });
      return;
    }

    if (!newPassword || !confirmPassword) {
      showAlert({
        variant: "error",
        title: "Fields Required",
        message: "Please fill in all fields.",
      });
      return;
    }

    if (newPassword.length < 6) {
      showAlert({
        variant: "error",
        title: "Password Too Short",
        message: "Password must contain at least 6 characters.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert({
        variant: "error",
        title: "Passwords Don't Match",
        message: "Passwords do not match.",
      });
      return;
    }

    resetPassword({ token: resetToken, newPassword });
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        {/* Email Step */}
        {step === "email" && (
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
                Forgot Password?
              </CardTitle>
              <CardDescription className="text-muted-foreground text-base dark:text-gray-300">
                Enter your email address and we'll send you a reset link
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-semibold text-gray-700 dark:text-gray-200"
                  >
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.trim())}
                      className="h-12 rounded-xl border-2 border-gray-100 bg-white pl-11 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:focus:border-brand-400"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="h-12 w-full rounded-xl bg-brand-500 text-base font-semibold text-white hover:bg-brand-600 dark:bg-brand-400 dark:hover:bg-brand-300"
                  disabled={isForgotPasswordLoading}
                >
                  {isForgotPasswordLoading ? <SpinnerLoader /> : "Send Reset Link"}
                </Button>
              </form>

              <div className="text-center">
                <Link
                  href="/signin"
                  className="flex items-center justify-center gap-2 font-semibold text-brand-500 hover:text-brand-600 dark:text-brand-300 dark:hover:text-brand-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sent Confirmation Step */}
        {step === "sent" && (
          <Card className="rounded-2xl border border-gray-100 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-800">
            <CardHeader className="space-y-3 pb-6 text-center">
              <div className="mb-2 flex justify-center">
                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
                Email Sent!
              </CardTitle>
              <CardDescription className="text-muted-foreground text-base dark:text-gray-300">
                We've sent a reset link to your email address. Please check your inbox.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                <p className="text-sm text-blue-900 dark:text-blue-300">
                  <strong>Note:</strong> If you don't see the email, check your spam folder. The
                  reset link expires after some time.
                </p>
              </div>

              <div className="space-y-4 text-center">
                <Button
                  onClick={() => {
                    setStep("email");
                    setEmail("");
                    router.push("/forgot-password");
                  }}
                  variant="outline"
                  className="h-12 w-full rounded-xl text-base font-semibold"
                >
                  Resend Email
                </Button>
                <Link
                  href="/signin"
                  className="flex items-center justify-center gap-2 font-semibold text-brand-500 hover:text-brand-600 dark:text-brand-300 dark:hover:text-brand-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reset Password Step */}
        {step === "reset" && (
          <Card className="rounded-2xl border border-gray-100 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-800">
            <CardHeader className="space-y-3 pb-6 text-center">
              <div className="mb-2 flex justify-center">
                <div className="rounded-full bg-white/20 p-3 shadow-theme-sm dark:bg-gray-900">
                  <Lock className="h-8 w-8 text-brand-500" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-brand-500 dark:text-brand-300">
                Reset Password
              </CardTitle>
              <CardDescription className="text-muted-foreground text-base dark:text-gray-300">
                Enter your new password
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="newPassword"
                    className="text-sm font-semibold text-gray-700 dark:text-gray-200"
                  >
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-12 rounded-xl border-2 border-gray-100 bg-white pl-11 pr-11 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:focus:border-brand-400"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-semibold text-gray-700 dark:text-gray-200"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-12 rounded-xl border-2 border-gray-100 bg-white pl-11 pr-11 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:focus:border-brand-400"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="h-12 w-full rounded-xl bg-brand-500 text-base font-semibold text-white hover:bg-brand-600 dark:bg-brand-400 dark:hover:bg-brand-300"
                  disabled={isResetPasswordLoading}
                >
                  {isResetPasswordLoading ? <SpinnerLoader /> : "Reset Password"}
                </Button>
              </form>

              <div className="text-center">
                <Link
                  href="/signin"
                  className="flex items-center justify-center gap-2 font-semibold text-brand-500 hover:text-brand-600 dark:text-brand-300 dark:hover:text-brand-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
