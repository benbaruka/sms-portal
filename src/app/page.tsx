"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RedirectToSignin() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push("/signin");
    }, 2000); // Allow time to see the animation

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="redirect-page relative flex h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="redirect-particle redirect-particle-1"></div>
        <div className="redirect-particle redirect-particle-2"></div>
        <div className="redirect-particle redirect-particle-3"></div>
        <div className="redirect-particle redirect-particle-4"></div>
        <div className="redirect-particle redirect-particle-5"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Message bubbles animation */}
        <div className="redirect-message-container">
          <div className="redirect-message-bubble redirect-message-bubble-1">
            <div className="redirect-message-dot"></div>
            <div className="redirect-message-dot"></div>
            <div className="redirect-message-dot"></div>
          </div>
          <div className="redirect-message-bubble redirect-message-bubble-2">
            <svg
              className="redirect-message-icon"
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
          <div className="redirect-message-bubble redirect-message-bubble-3">
            <div className="redirect-message-check">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M20 6L9 17L4 12"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Text with fade animation */}
        <p className="redirect-animate-fade-in mt-8 text-base font-medium text-gray-700 dark:text-gray-200">
          Redirecting to sign in page...
        </p>

        {/* Progress bar */}
        <div className="mt-4 h-1 w-48 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div className="redirect-progress-bar"></div>
        </div>
      </div>
    </div>
  );
}
