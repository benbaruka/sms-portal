// Coverage target: 100% lines, branches, functions

// Use manual mock from __mocks__/next/server.ts
jest.mock("next/server");

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import proxy, { config } from "../src/proxy";

// Access the mocked functions from the manual mock
const mockNext = NextResponse.next as jest.Mock;
const mockRedirect = NextResponse.redirect as jest.Mock;

describe("proxy.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(proxy).toBeDefined();
    expect(typeof proxy).toBe("function");
    expect(config).toBeDefined();
  });

  it("config has correct matcher", () => {
    expect(config.matcher).toBeDefined();
    expect(Array.isArray(config.matcher)).toBe(true);
    expect(config.matcher.length).toBeGreaterThan(0);
    expect(config.matcher[0]).toContain("_next");
  });

  describe("public paths access", () => {
    const publicPaths = [
      "/signin",
      "/signup",
      "/forgot-password",
      "/verify-otp",
      "/terms",
      "/privacy",
      "/",
    ];

    it.each(publicPaths)("allows unauthenticated access to public path: %s", (pathname) => {
      const url = new URL(`http://localhost:3000${pathname}`);
      const request = {
        cookies: {
          get: jest.fn(() => undefined),
        },
        nextUrl: {
          pathname,
        },
        url: url.toString(),
      } as unknown as NextRequest;

      const response = proxy(request);
      expect(response).toBeDefined();
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("authenticated user redirects", () => {
    const createAuthenticatedRequest = (pathname: string): NextRequest => {
      const url = new URL(`http://localhost:3000${pathname}`);
      return {
        cookies: {
          get: jest.fn((name: string) => {
            if (name === "authToken") {
              return { value: "test-token" };
            }
            return undefined;
          }),
        },
        nextUrl: {
          pathname,
        },
        url: url.toString(),
      } as unknown as NextRequest;
    };

    it("redirects authenticated user from /signin to dashboard", () => {
      const request = createAuthenticatedRequest("/signin");
      const response = proxy(request);

      expect(mockRedirect).toHaveBeenCalled();
      const redirectUrl = mockRedirect.mock.calls[0][0] as URL;
      expect(redirectUrl.pathname).toBe("/dashboard");
      expect(response.type).toBe("redirect");
    });

    it("redirects authenticated user from /signup to dashboard", () => {
      const request = createAuthenticatedRequest("/signup");
      const response = proxy(request);

      expect(mockRedirect).toHaveBeenCalled();
      const redirectUrl = mockRedirect.mock.calls[0][0] as URL;
      expect(redirectUrl.pathname).toBe("/dashboard");
      expect(response.type).toBe("redirect");
    });

    it("redirects authenticated user from root (/) to dashboard", () => {
      const request = createAuthenticatedRequest("/");
      const response = proxy(request);

      expect(mockRedirect).toHaveBeenCalled();
      const redirectUrl = mockRedirect.mock.calls[0][0] as URL;
      expect(redirectUrl.pathname).toBe("/dashboard");
      expect(response.type).toBe("redirect");
    });

    it("allows authenticated user to access protected paths", () => {
      const request = createAuthenticatedRequest("/dashboard");
      const response = proxy(request);

      expect(mockNext).toHaveBeenCalled();
      expect(response.type).toBe("next");
    });

    it("allows authenticated user to access other protected paths", () => {
      const request = createAuthenticatedRequest("/admin/clients");
      const response = proxy(request);

      expect(mockNext).toHaveBeenCalled();
      expect(response.type).toBe("next");
    });
  });

  describe("verify-otp access logic", () => {
    it("allows access to /verify-otp when needs-otp-verification cookie is true", () => {
      const url = new URL("http://localhost:3000/verify-otp");
      const request = {
        cookies: {
          get: jest.fn((name: string) => {
            if (name === "needs-otp-verification") {
              return { value: "true" };
            }
            return undefined;
          }),
        },
        nextUrl: {
          pathname: "/verify-otp",
        },
        url: url.toString(),
      } as unknown as NextRequest;

      const response = proxy(request);
      expect(mockNext).toHaveBeenCalled();
      expect(response.type).toBe("next");
    });

    it("allows unauthenticated access to /verify-otp without needs-otp-verification cookie (public path)", () => {
      const url = new URL("http://localhost:3000/verify-otp");
      const request = {
        cookies: {
          get: jest.fn(() => undefined),
        },
        nextUrl: {
          pathname: "/verify-otp",
        },
        url: url.toString(),
      } as unknown as NextRequest;

      const response = proxy(request);
      expect(mockNext).toHaveBeenCalled();
      expect(response.type).toBe("next");
    });

    it("allows authenticated user to access /verify-otp when no needs-otp-verification (public path)", () => {
      const url = new URL("http://localhost:3000/verify-otp");
      const request = {
        cookies: {
          get: jest.fn((name: string) => {
            if (name === "authToken") {
              return { value: "test-token" };
            }
            return undefined;
          }),
        },
        nextUrl: {
          pathname: "/verify-otp",
        },
        url: url.toString(),
      } as unknown as NextRequest;

      const response = proxy(request);
      // Branch: isAuthenticated && (pathname === "/signin" || pathname === "/signup" || pathname === "/") is false
      // Branch: pathname === "/verify-otp" && needsOtpVerification is false
      // Branch: !isAuthenticated && !isPublicPath is false (isAuthenticated is true, isPublicPath is true)
      // So it returns NextResponse.next()
      expect(mockNext).toHaveBeenCalled();
      expect(response.type).toBe("next");
    });
  });

  describe("unauthenticated user redirects", () => {
    const createUnauthenticatedRequest = (pathname: string): NextRequest => {
      const url = new URL(`http://localhost:3000${pathname}`);
      return {
        cookies: {
          get: jest.fn(() => undefined),
        },
        nextUrl: {
          pathname,
        },
        url: url.toString(),
      } as unknown as NextRequest;
    };

    it("redirects unauthenticated user from protected path to signin with redirect param", () => {
      const request = createUnauthenticatedRequest("/dashboard");
      const response = proxy(request);

      expect(mockRedirect).toHaveBeenCalled();
      expect(response.type).toBe("redirect");
      // Branch: pathname !== "/signin" is true, so redirect param is added
      const redirectCall = mockRedirect.mock.calls[0][0] as URL;
      expect(redirectCall.searchParams.get("redirect")).toBe("/dashboard");
    });

    it("redirects unauthenticated user from other protected path with redirect param", () => {
      const request = createUnauthenticatedRequest("/admin/clients");
      const response = proxy(request);

      expect(mockRedirect).toHaveBeenCalled();
      expect(response.type).toBe("redirect");
      // Branch: pathname !== "/signin" is true
      const redirectCall = mockRedirect.mock.calls[0][0] as URL;
      expect(redirectCall.searchParams.get("redirect")).toBe("/admin/clients");
    });

    it("does not add redirect param when already on signin page", () => {
      const request = createUnauthenticatedRequest("/signin");
      const response = proxy(request);

      expect(mockNext).toHaveBeenCalled();
      expect(response.type).toBe("next");
      // Branch: pathname !== "/signin" is false, so redirect param is not added
      // Branch: !isAuthenticated && !isPublicPath is false (isPublicPath is true)
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    it("handles cookie with empty value (falsy token)", () => {
      const url = new URL("http://localhost:3000/dashboard");
      const request = {
        cookies: {
          get: jest.fn((name: string) => {
            if (name === "authToken") {
              return { value: "" };
            }
            return undefined;
          }),
        },
        nextUrl: {
          pathname: "/dashboard",
        },
        url: url.toString(),
      } as unknown as NextRequest;

      const response = proxy(request);
      // Branch: Boolean("") is false, so isAuthenticated is false
      // Branch: !isAuthenticated && !isPublicPath is true
      expect(mockRedirect).toHaveBeenCalled();
      expect(response.type).toBe("redirect");
    });

    it("handles needs-otp-verification cookie with value 'false'", () => {
      const url = new URL("http://localhost:3000/verify-otp");
      const request = {
        cookies: {
          get: jest.fn((name: string) => {
            if (name === "needs-otp-verification") {
              return { value: "false" };
            }
            return undefined;
          }),
        },
        nextUrl: {
          pathname: "/verify-otp",
        },
        url: url.toString(),
      } as unknown as NextRequest;

      const response = proxy(request);
      // Branch: needsOtpVerification = "false" === "true" is false
      // So it falls through to public path logic
      expect(mockNext).toHaveBeenCalled();
      expect(response.type).toBe("next");
    });

    it("handles needs-otp-verification cookie with undefined value", () => {
      const url = new URL("http://localhost:3000/verify-otp");
      const request = {
        cookies: {
          get: jest.fn((name: string) => {
            if (name === "needs-otp-verification") {
              return undefined;
            }
            return undefined;
          }),
        },
        nextUrl: {
          pathname: "/verify-otp",
        },
        url: url.toString(),
      } as unknown as NextRequest;

      const response = proxy(request);
      // Branch: needsOtpVerification = undefined?.value === "true" is false
      expect(mockNext).toHaveBeenCalled();
      expect(response.type).toBe("next");
    });
  });
});
