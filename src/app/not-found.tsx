"use client";

import Link from "next/link";
import React from "react";
import { useAuth } from "@/context/AuthProvider";
import { Home, MessageSquare, AlertCircle, LayoutDashboard } from "lucide-react";

export default function NotFound() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="not-found-page relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="not-found-particle not-found-particle-1"></div>
        <div className="not-found-particle not-found-particle-2"></div>
        <div className="not-found-particle not-found-particle-3"></div>
        <div className="not-found-particle not-found-particle-4"></div>
        <div className="not-found-particle not-found-particle-5"></div>
        <div className="not-found-particle not-found-particle-6"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* 404 Number with message bubbles */}
        <div className="not-found-number-container mb-8">
          <div className="not-found-number">4</div>
          <div className="not-found-message-bubble not-found-message-bubble-center">
            <AlertCircle className="not-found-alert-icon" />
          </div>
          <div className="not-found-number">4</div>
        </div>

        {/* Floating message bubbles around 404 */}
        <div className="not-found-floating-bubbles">
          <div className="not-found-message-bubble not-found-message-bubble-1">
            <MessageSquare className="not-found-message-icon" />
          </div>
          <div className="not-found-message-bubble not-found-message-bubble-2">
            <div className="not-found-message-dot"></div>
            <div className="not-found-message-dot"></div>
            <div className="not-found-message-dot"></div>
          </div>
          <div className="not-found-message-bubble not-found-message-bubble-3">
            <svg
              className="not-found-message-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Error message */}
        <h1 className="not-found-title mb-4 text-3xl font-bold text-gray-800 dark:text-white/90 sm:text-4xl md:text-5xl">
          Page Not Found
        </h1>

        <p className="not-found-description mb-8 max-w-md px-4 text-base text-gray-600 dark:text-gray-300 sm:text-lg">
          Sorry, the page you are looking for does not exist or has been removed.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="not-found-button-primary inline-flex transform items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3.5 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-blue-600 hover:to-indigo-700"
            >
              <LayoutDashboard className="h-4 w-4" />
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/"
                className="not-found-button-primary inline-flex transform items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3.5 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-blue-600 hover:to-indigo-700"
              >
                <Home className="h-4 w-4" />
                Back to Home
              </Link>

              <Link
                href="/signin"
                className="not-found-button-secondary inline-flex items-center justify-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-6 py-3.5 text-sm font-medium text-gray-700 shadow-md transition-all duration-200 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <MessageSquare className="h-4 w-4" />
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-sm text-gray-500 dark:text-gray-400">
        &copy; {new Date().getFullYear()} - SMS Portail
      </p>
    </div>
  );
}
