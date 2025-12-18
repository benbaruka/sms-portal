"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex w-full text-gray-900 dark:text-white">
      {/* Left column - Branding */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-700 via-brand-500 to-blue-light-25 dark:from-brand-950 dark:via-brand-800 dark:to-brand-700 lg:flex lg:w-1/2">
        <div className="opacity-18 absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoMnYyaC0yem0wLTZoMnYyaC0yem02IDZoMnYyaC0yem0wLTZoMnYyaC0yem0tMTIgNmgydjJoLTJ6bTAtNmgydjJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')]" />
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
              <h2 className="text-4xl font-bold leading-tight">Privacy Policy</h2>
              <p className="text-lg text-gray-700 dark:text-white/90">
                Learn how we collect, use, and protect your personal information.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right column - Content */}
      <div className="flex flex-1 items-start justify-center overflow-y-auto p-8 pt-16">
        <div className="w-full max-w-3xl">
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
                Privacy Policy
              </CardTitle>
              <CardDescription className="text-muted-foreground text-base dark:text-gray-300">
                Last updated: {new Date().toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-6 pb-6">
              <div className="space-y-6">
                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    1. Information We Collect
                  </h2>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    We collect information that you provide directly to us, including:
                  </p>
                  <ul className="list-disc space-y-2 pl-6 text-sm text-gray-600 dark:text-gray-400">
                    <li>Account information (name, email, phone number)</li>
                    <li>Payment information (processed securely through third-party providers)</li>
                    <li>Usage data and analytics</li>
                    <li>Communication data when you contact our support</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    2. How We Use Your Information
                  </h2>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    We use the information we collect to:
                  </p>
                  <ul className="list-disc space-y-2 pl-6 text-sm text-gray-600 dark:text-gray-400">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Process transactions and send related information</li>
                    <li>Send technical notices and support messages</li>
                    <li>Respond to your comments and questions</li>
                    <li>Monitor and analyze trends and usage</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    3. Information Sharing
                  </h2>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    We do not sell, trade, or rent your personal information to third parties. We
                    may share your information only:
                  </p>
                  <ul className="list-disc space-y-2 pl-6 text-sm text-gray-600 dark:text-gray-400">
                    <li>With service providers who assist us in operating our platform</li>
                    <li>When required by law or to protect our rights</li>
                    <li>In connection with a business transfer or merger</li>
                    <li>With your consent</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    4. Data Security
                  </h2>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    We implement appropriate technical and organizational security measures to
                    protect your personal information. However, no method of transmission over the
                    Internet is 100% secure.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    5. Your Rights
                  </h2>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    You have the right to:
                  </p>
                  <ul className="list-disc space-y-2 pl-6 text-sm text-gray-600 dark:text-gray-400">
                    <li>Access your personal information</li>
                    <li>Correct inaccurate data</li>
                    <li>Request deletion of your data</li>
                    <li>Object to processing of your data</li>
                    <li>Data portability</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    6. Cookies and Tracking
                  </h2>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    We use cookies and similar tracking technologies to track activity on our
                    service and hold certain information. You can instruct your browser to refuse
                    all cookies or to indicate when a cookie is being sent.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    7. Data Retention
                  </h2>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    We retain your personal information for as long as necessary to provide our
                    services and fulfill the purposes outlined in this privacy policy, unless a
                    longer retention period is required by law.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    8. Children&apos;s Privacy
                  </h2>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    Our service is not intended for children under the age of 18. We do not
                    knowingly collect personal information from children.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    9. Changes to This Policy
                  </h2>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    We may update our Privacy Policy from time to time. We will notify you of any
                    changes by posting the new Privacy Policy on this page and updating the
                    &quot;Last updated&quot; date.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    10. Contact Us
                  </h2>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    If you have any questions about this Privacy Policy, please contact us through
                    our support channels.
                  </p>
                </section>
              </div>

              <div className="flex justify-center border-t border-gray-200 pt-6 dark:border-gray-700">
                <Button variant="outline" asChild className="rounded-xl">
                  <Link href="/signin">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Sign In
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
