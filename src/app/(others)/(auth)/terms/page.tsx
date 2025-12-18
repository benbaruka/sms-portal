"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function TermsOfServicePage() {
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
              <h2 className="text-4xl font-bold leading-tight">Terms of Service</h2>
              <p className="text-lg text-gray-700 dark:text-white/90">
                Understand our terms and conditions for using our SMS messaging platform.
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
                Terms of Service
              </CardTitle>
              <CardDescription className="text-muted-foreground text-base dark:text-gray-300">
                Last updated: {new Date().toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-6 pb-6">
              <div className="space-y-6">
                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    1. Acceptance of Terms
                  </h2>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    By accessing and using the SMS Platform service, you accept and agree to be
                    bound by the terms and provision of this agreement.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    2. Use License
                  </h2>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    Permission is granted to temporarily use the SMS Platform for personal and
                    commercial purposes. This is the grant of a license, not a transfer of title,
                    and under this license you may not:
                  </p>
                  <ul className="list-disc space-y-2 pl-6 text-sm text-gray-600 dark:text-gray-400">
                    <li>Modify or copy the materials</li>
                    <li>Use the materials for any commercial purpose or for any public display</li>
                    <li>Attempt to decompile or reverse engineer any software</li>
                    <li>Remove any copyright or other proprietary notations</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    3. Service Description
                  </h2>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    The SMS Platform provides messaging services that allow you to send SMS messages
                    to recipients. You are responsible for:
                  </p>
                  <ul className="list-disc space-y-2 pl-6 text-sm text-gray-600 dark:text-gray-400">
                    <li>Ensuring you have proper authorization to send messages to recipients</li>
                    <li>Complying with all applicable laws and regulations</li>
                    <li>Maintaining the security of your account credentials</li>
                    <li>Using the service in a lawful manner</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    4. User Account
                  </h2>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    You are responsible for maintaining the confidentiality of your account and
                    password. You agree to accept responsibility for all activities that occur under
                    your account.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    5. Prohibited Uses
                  </h2>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    You may not use our service:
                  </p>
                  <ul className="list-disc space-y-2 pl-6 text-sm text-gray-600 dark:text-gray-400">
                    <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                    <li>
                      To violate any international, federal, provincial, or state regulations,
                      rules, laws, or local ordinances
                    </li>
                    <li>To transmit any viruses or any code of a destructive nature</li>
                    <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    6. Payment Terms
                  </h2>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    Payment for services is required in advance. All fees are non-refundable unless
                    otherwise stated. We reserve the right to change our pricing at any time.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    7. Limitation of Liability
                  </h2>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    In no event shall SMS Platform or its suppliers be liable for any damages
                    (including, without limitation, damages for loss of data or profit, or due to
                    business interruption) arising out of the use or inability to use the materials
                    on SMS Platform.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    8. Changes to Terms
                  </h2>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    SMS Platform may revise these terms of service at any time without notice. By
                    using this service you are agreeing to be bound by the then current version of
                    these terms of service.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    9. Contact Information
                  </h2>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    If you have any questions about these Terms of Service, please contact us
                    through our support channels.
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
