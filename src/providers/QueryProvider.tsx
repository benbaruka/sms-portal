"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";

// Conditionally import devtools only in development
let ReactQueryDevtools: React.ComponentType<{
  initialIsOpen?: boolean;
  position?: string;
  buttonPosition?: string;
}> = () => null;

// QueryClient configuration
const queryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
      retry: 1,
      refetchOnMount: true,
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    },
    mutations: {
      retry: 1,
    },
  },
};

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create QueryClient using useState with lazy initialization
  // This ensures it's only created once per component instance
  // This is the recommended pattern for React Query with Next.js App Router
  const [queryClient] = useState<QueryClient>(() => {
    const client = new QueryClient(queryClientConfig);
    return client;
  });

  // Ensure queryClient is defined before rendering
  if (!queryClient) {
    return <>{children}</>;
  }

  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* React Query DevTools - Only in development */}
      {isDevelopment && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom-right"
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}
