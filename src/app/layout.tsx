"use client";
import { Poppins } from "next/font/google";
import "./globals.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AlertProvider } from "@/context/AlertProvider";
import { AuthProvider } from "@/context/AuthProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { CookiesProvider } from "react-cookie";
import { Toaster } from "@/components/ui/toaster";
const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans dark:bg-gray-900`}>
        <QueryProvider>
          <ThemeProvider>
            <Toaster />
            <CookiesProvider>
              <AuthProvider>
                <AlertProvider>
                  <SidebarProvider>{children}</SidebarProvider>
                </AlertProvider>
              </AuthProvider>
            </CookiesProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
