import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider } from "@/context/ThemeContext";
import { AlertProvider } from "@/context/AlertProvider";
import { AuthProvider } from "@/context/AuthProvider";
import { SidebarProvider } from "@/context/SidebarContext";
import { CookiesProvider } from "react-cookie";

// React 19 doesn't export act from 'react' directly
// Testing Library handles act internally, so we don't need to polyfill it

// Mock all providers for testing
const AllProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryProvider>
      <ThemeProvider>
        <CookiesProvider>
          <AuthProvider>
            <AlertProvider>
              <SidebarProvider>{children}</SidebarProvider>
            </AlertProvider>
          </AuthProvider>
        </CookiesProvider>
      </ThemeProvider>
    </QueryProvider>
  );
};

// Custom render function that includes all providers
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => {
  return render(ui, { wrapper: AllProviders, ...options });
};

// Re-export everything from @testing-library/react
export * from "@testing-library/react";
// Explicitly export screen for better TypeScript support
import { screen as testingLibraryScreen } from "@testing-library/react";
export const screen = testingLibraryScreen;
