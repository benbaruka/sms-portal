import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export default function proxy(request: NextRequest): NextResponse {
  const token = request.cookies.get("authToken")?.value;
  const pathname = request.nextUrl.pathname;
  const publicPaths = [
    "/signin",
    "/signup",
    "/forgot-password",
    "/verify-otp",
    "/terms",
    "/privacy",
    "/",
  ];
  const isPublicPath = publicPaths.includes(pathname);
  const isAuthenticated = Boolean(token);

  // Vérifier si on a besoin de vérification OTP (via cookie ou header)
  const needsOtpVerification = request.cookies.get("needs-otp-verification")?.value === "true";

  if (isAuthenticated && (pathname === "/signin" || pathname === "/signup" || pathname === "/")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Permettre l'accès à /verify-otp même sans authentification si on a besoin de vérification OTP
  if (pathname === "/verify-otp" && needsOtpVerification) {
    return NextResponse.next();
  }

  if (!isAuthenticated && !isPublicPath) {
    const signInUrl = new URL("/signin", request.url);
    if (pathname !== "/signin") {
      signInUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|static|favicon.ico|images|api|.*\\..*).*)"],
};
