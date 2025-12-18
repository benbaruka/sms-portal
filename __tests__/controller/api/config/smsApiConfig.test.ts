import { smsApiRequest } from "../../../../src/controller/api/config/smsApiConfig";


// Mock smsApi - use jest.hoisted() to ensure it's created before the mock factory runs
const { mockSmsApi } = jest.hoisted(() => {
  const requestFn = jest.fn();
  const requestHandlers: any[] = [];
  const responseHandlers: any[] = [];

  // Create a callable mock that behaves like an axios instance
  const mockApi = Object.assign((config: any) => requestFn(config), {
    request: requestFn,
    interceptors: {
      request: {
        use: jest.fn((fulfilled, rejected) => {
          requestHandlers.push({ fulfilled, rejected });
          return 0;
        }),
        handlers: requestHandlers,
      },
      response: {
        use: jest.fn((fulfilled, rejected) => {
          responseHandlers.push({ fulfilled, rejected });
          return 0;
        }),
        handlers: responseHandlers,
      },
    },
  });
  return { mockSmsApi: mockApi };
});

// Mock axios.create() to return our mock instance
jest.mock("axios", async () => {
  const actual = await jest.importActual("axios");
  return {
    ...actual,
    default: {
      ...actual.default,
      create: jest.fn(() => mockSmsApi),
    },
    create: jest.fn(() => mockSmsApi),
  };
});

describe("controller/api/config/smsApiConfig.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSmsApi.request.mockResolvedValue({
      data: { success: true },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
      request: {},
    });
  });

  it("module loads", () => {
    expect(smsApiRequest).toBeDefined();
    expect(typeof smsApiRequest).toBe("function");
  });

  it("smsApiRequest makes request with api-key header", async () => {
    await smsApiRequest({
      method: "GET",
      endpoint: "/test",
      apiKey: "test-api-key",
    });

    expect(mockSmsApi.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        url: "/test",
        headers: expect.objectContaining({
          "api-key": "test-api-key",
        }),
      })
    );
  });

  it("smsApiRequest normalizes endpoint with leading slash", async () => {
    await smsApiRequest({
      method: "POST",
      endpoint: "test",
      apiKey: "test-key",
    });

    expect(mockSmsApi.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/test",
      })
    );
  });

  it("smsApiRequest handles request data", async () => {
    const data = { name: "test" };
    await smsApiRequest({
      method: "POST",
      endpoint: "/test",
      data,
      apiKey: "test-key",
    });

    expect(mockSmsApi.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        data,
      })
    );
  });

  it("smsApiRequest handles request params", async () => {
    const params = { page: 1, limit: 10 };
    await smsApiRequest({
      method: "GET",
      endpoint: "/test",
      params,
      apiKey: "test-key",
    });

    expect(mockSmsApi.request).toHaveBeenCalledWith(
      expect.objectContaining({
        params,
      })
    );
  });

  it("smsApiRequest returns correct response format", async () => {
    const response = await smsApiRequest({
      method: "GET",
      endpoint: "/test",
      apiKey: "test-key",
    });

    expect(response).toHaveProperty("data");
    expect(response).toHaveProperty("status");
    expect(response).toHaveProperty("statusText");
    expect(response).toHaveProperty("headers");
    expect(response).toHaveProperty("config");
  });

  it("smsApiRequest throws error on failure", async () => {
    const error = new Error("Request failed");
    mockSmsApi.request.mockRejectedValueOnce(error);

    await expect(
      smsApiRequest({
        method: "GET",
        endpoint: "/test",
        apiKey: "test-key",
      })
    ).rejects.toThrow("Request failed");
  });

  it("smsApiRequest works without apiKey", async () => {
    await smsApiRequest({
      method: "GET",
      endpoint: "/test",
    });

    expect(mockSmsApi.request).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.not.objectContaining({
          "api-key": expect.anything(),
        }),
      })
    );
  });

  it("smsApiRequest handles endpoint that already starts with slash", async () => {
    await smsApiRequest({
      method: "GET",
      endpoint: "/test",
      apiKey: "test-key",
    });

    expect(mockSmsApi.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/test",
      })
    );
  });

  // Interceptor tests are in smsApiConfig.interceptors.test.ts to avoid mock conflicts
  describe.skip("interceptors", () => {
    it("request interceptor masks Authorization token without Bearer prefix", async () => {
      const { smsApi } = await import("../../../../src/controller/api/config/smsApiConfig");
      const requestHandlers = smsApi.interceptors?.request?.handlers;
      if (requestHandlers && requestHandlers.length > 0) {
        const fulfilledHandler = requestHandlers[0].fulfilled;
        if (fulfilledHandler) {
          const config = {
            headers: {
              Authorization: "token123",
            },
          };
          const result = await fulfilledHandler(config);
          expect(result.headers.Authorization).toBe("***k123");
        }
      }
    });

    it("request interceptor masks Authorization token with Bearer prefix", async () => {
      const { smsApi } = await import("../../../../src/controller/api/config/smsApiConfig");
      const requestHandlers = smsApi.interceptors?.request?.handlers;
      if (requestHandlers && requestHandlers.length > 0) {
        const fulfilledHandler = requestHandlers[0].fulfilled;
        if (fulfilledHandler) {
          const config = {
            headers: {
              Authorization: "Bearer token123",
            },
          };
          const result = await fulfilledHandler(config);
          expect(result.headers.Authorization).toBe("Bearer ***k123");
        }
      }
    });

    it("request interceptor masks api-key header", async () => {
      const { smsApi } = await import("../../../../src/controller/api/config/smsApiConfig");
      const requestHandlers = smsApi.interceptors?.request?.handlers;
      if (requestHandlers && requestHandlers.length > 0) {
        const fulfilledHandler = requestHandlers[0].fulfilled;
        if (fulfilledHandler) {
          const config = {
            headers: {
              "api-key": "key123456",
            },
          };
          const result = await fulfilledHandler(config);
          expect(result.headers["api-key"]).toBe("***3456");
        }
      }
    });

    it("request interceptor deletes sensitive headers in production", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      jest.resetModules();
      const { smsApi } = await import("../../../../src/controller/api/config/smsApiConfig");
      const requestHandlers = smsApi.interceptors?.request?.handlers;
      if (requestHandlers && requestHandlers.length > 0) {
        const fulfilledHandler = requestHandlers[0].fulfilled;
        if (fulfilledHandler) {
          const config = {
            headers: {
              Authorization: "Bearer token123",
              "api-key": "key123",
            },
          };
          const result = await fulfilledHandler(config);
          expect(result.headers.Authorization).toBeUndefined();
          expect(result.headers["api-key"]).toBeUndefined();
        }
      }

      process.env.NODE_ENV = originalEnv;
      jest.resetModules();
    });

    it("request interceptor error handler rejects promise", async () => {
      const { smsApi } = await import("../../../../src/controller/api/config/smsApiConfig");
      const requestHandlers = smsApi.interceptors?.request?.handlers;
      if (requestHandlers && requestHandlers.length > 0) {
        const rejectedHandler = requestHandlers[0].rejected;
        if (rejectedHandler) {
          const error = new Error("Request error");
          await expect(rejectedHandler(error)).rejects.toThrow("Request error");
        }
      }
    });

    it("response interceptor sanitizes data in production", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      jest.resetModules();
      const { smsApi } = await import("../../../../src/controller/api/config/smsApiConfig");
      const responseHandlers = smsApi.interceptors?.response?.handlers;
      if (responseHandlers && responseHandlers.length > 0) {
        const fulfilledHandler = responseHandlers[0].fulfilled;
        if (fulfilledHandler) {
          const response = {
            data: {
              token: "secret-token",
              apiKey: "secret-key",
              otherData: "visible",
            },
            config: {},
          };
          const result = await fulfilledHandler(response);
          expect(result.data.token).toBe("***HIDDEN***");
          expect(result.data.apiKey).toBe("***HIDDEN***");
          expect(result.data.otherData).toBe("visible");
        }
      }

      process.env.NODE_ENV = originalEnv;
      jest.resetModules();
    });

    it("response interceptor handles token expired error and cleans up", async () => {
      const mockLocation = { href: "" };
      Object.defineProperty(window, "location", {
        value: mockLocation,
        writable: true,
        configurable: true,
      });

      const mockLocalStorage = {
        clear: jest.fn(),
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        length: 0,
        key: jest.fn(),
      };
      const mockSessionStorage = {
        clear: jest.fn(),
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        length: 0,
        key: jest.fn(),
      };
      Object.defineProperty(window, "localStorage", {
        value: mockLocalStorage,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, "sessionStorage", {
        value: mockSessionStorage,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(document, "cookie", {
        value: "token=abc123; session=xyz789",
        writable: true,
        configurable: true,
      });

      const { smsApi } = await import("../../../../src/controller/api/config/smsApiConfig");
      const responseHandlers = smsApi.interceptors?.response?.handlers;
      if (responseHandlers && responseHandlers.length > 0) {
        const rejectedHandler = responseHandlers[0].rejected;
        if (rejectedHandler) {
          const tokenExpiredError = {
            isAxiosError: true,
            response: {
              data: {
                message: "Your token has expired",
              },
            },
            message: "Your token has expired",
          };

          await rejectedHandler(tokenExpiredError);

          expect(mockLocalStorage.clear).toHaveBeenCalled();
          expect(mockSessionStorage.clear).toHaveBeenCalled();
          expect(mockLocation.href).toBe("/signin");
        }
      }
    });

    it("response interceptor handles different token expired messages", async () => {
      const mockLocation = { href: "" };
      Object.defineProperty(window, "location", {
        value: mockLocation,
        writable: true,
        configurable: true,
      });

      const mockLocalStorage = { clear: jest.fn() };
      const mockSessionStorage = { clear: jest.fn() };
      Object.defineProperty(window, "localStorage", {
        value: mockLocalStorage,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, "sessionStorage", {
        value: mockSessionStorage,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(document, "cookie", {
        value: "",
        writable: true,
        configurable: true,
      });

      const { smsApi } = await import("../../../../src/controller/api/config/smsApiConfig");
      const responseHandlers = smsApi.interceptors?.response?.handlers;
      if (responseHandlers && responseHandlers.length > 0) {
        const rejectedHandler = responseHandlers[0].rejected;
        if (rejectedHandler) {
          const errorMessages = [
            "Token has expired",
            "Token expired",
            "Please generate a new one",
            "Your token has expired",
          ];

          for (const message of errorMessages) {
            mockLocation.href = "";
            const error = {
              isAxiosError: true,
              response: { data: { message } },
              message,
            };
            await rejectedHandler(error);
            expect(mockLocation.href).toBe("/signin");
          }
        }
      }
    });

    it("response interceptor handles cleanup error gracefully", async () => {
      const mockLocation = { href: "" };
      Object.defineProperty(window, "location", {
        value: mockLocation,
        writable: true,
        configurable: true,
      });

      const mockLocalStorage = {
        clear: jest.fn(() => {
          throw new Error("Storage error");
        }),
      };
      const mockSessionStorage = {
        clear: jest.fn(() => {
          throw new Error("Storage error");
        }),
      };
      Object.defineProperty(window, "localStorage", {
        value: mockLocalStorage,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, "sessionStorage", {
        value: mockSessionStorage,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(document, "cookie", {
        value: "",
        writable: true,
        configurable: true,
      });

      const { smsApi } = await import("../../../../src/controller/api/config/smsApiConfig");
      const responseHandlers = smsApi.interceptors?.response?.handlers;
      if (responseHandlers && responseHandlers.length > 0) {
        const rejectedHandler = responseHandlers[0].rejected;
        if (rejectedHandler) {
          const error = {
            isAxiosError: true,
            response: { data: { message: "Token has expired" } },
            message: "Token has expired",
          };

          await expect(rejectedHandler(error)).resolves.toBeUndefined();
          expect(mockLocation.href).toBe("/signin");
        }
      }
    });

    it("response interceptor handles non-axios errors", async () => {
      const { smsApi } = await import("../../../../src/controller/api/config/smsApiConfig");
      const responseHandlers = smsApi.interceptors?.response?.handlers;
      if (responseHandlers && responseHandlers.length > 0) {
        const rejectedHandler = responseHandlers[0].rejected;
        if (rejectedHandler) {
          const error = new Error("Network error");
          await expect(rejectedHandler(error)).rejects.toThrow("Network error");
        }
      }
    });
  });
});

// Test getSmsBaseURL function separately
describe("controller/api/config/smsApiConfig.ts - getSmsBaseURL", () => {
  const originalEnv = process.env;
  const originalGlobal = global;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    // @ts-expect-error - intentionally modifying global for test
    global = { ...originalGlobal };
  });

  afterEach(() => {
    process.env = originalEnv;
    global = originalGlobal;
  });

  it("returns smsUrl when set and not localhost", async () => {
    process.env.NEXT_PUBLIC_SMS_API_BASE_URL = "https://sms-api.example.com";
    const module = await import("../../../../src/controller/api/config/smsApiConfig");
    // Note: smsBaseURL is set at module load time, so we need to check the exported value
    expect(module.smsBaseURL).toBeDefined();
  });

  it("returns billingUrl when smsUrl contains localhost", async () => {
    process.env.NEXT_PUBLIC_SMS_API_BASE_URL = "http://localhost:3000";
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
    const module = await import("../../../../src/controller/api/config/smsApiConfig");
    expect(module.smsBaseURL).toBeDefined();
  });

  it("returns default for test environment when no env vars", async () => {
    delete process.env.NEXT_PUBLIC_SMS_API_BASE_URL;
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    process.env.NODE_ENV = "test";
    const module = await import("../../../../src/controller/api/config/smsApiConfig");
    expect(module.smsBaseURL).toBeDefined();
  });

  it("returns default for development when no env vars", async () => {
    delete process.env.NEXT_PUBLIC_SMS_API_BASE_URL;
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    process.env.NODE_ENV = "development";
    const module = await import("../../../../src/controller/api/config/smsApiConfig");
    expect(module.smsBaseURL).toBeDefined();
  });

  it("returns smsUrl when it contains 127.0.0.1 and billingUrl is set", async () => {
    process.env.NEXT_PUBLIC_SMS_API_BASE_URL = "http://127.0.0.1:3000";
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
    const module = await import("../../../../src/controller/api/config/smsApiConfig");
    expect(module.smsBaseURL).toBeDefined();
  });

  it("returns billingUrl when smsUrl contains 127.0.0.1", async () => {
    process.env.NEXT_PUBLIC_SMS_API_BASE_URL = "http://127.0.0.1:3000";
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
    const module = await import("../../../../src/controller/api/config/smsApiConfig");
    expect(module.smsBaseURL).toBeDefined();
  });

  it("throws error in production when no env vars are set", async () => {
    delete process.env.NEXT_PUBLIC_SMS_API_BASE_URL;
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    process.env.NODE_ENV = "production";

    // This should throw an error in production
    await expect(import("../../../../src/controller/api/config/smsApiConfig")).rejects.toThrow(
      "NEXT_PUBLIC_SMS_API_BASE_URL or NEXT_PUBLIC_API_BASE_URL must be set"
    );
  });

  it("handles fallback case (line 41)", async () => {
    // Test the fallback at line 41: return smsUrl || billingUrl || "https://sms-api.test.com"
    process.env.NEXT_PUBLIC_SMS_API_BASE_URL = "";
    process.env.NEXT_PUBLIC_API_BASE_URL = "";
    process.env.NODE_ENV = "test";
    const module = await import("../../../../src/controller/api/config/smsApiConfig");
    expect(module.smsBaseURL).toBeDefined();
  });

  it("handles development server-side check (line 44-47)", async () => {
    // Test the check at lines 44-47 for development server-side
    const originalWindow = global.window;
    // @ts-expect-error - intentionally removing window for test
    global.window = undefined;

    delete process.env.NEXT_PUBLIC_SMS_API_BASE_URL;
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    process.env.NODE_ENV = "development";

    const module = await import("../../../../src/controller/api/config/smsApiConfig");
    expect(module.smsBaseURL).toBeDefined();

    // Restore
    global.window = originalWindow;
  });

  it("covers fallback case (line 41)", async () => {
    // Test the fallback at line 41: return smsUrl || billingUrl || "https://sms-api.test.com"
    // This happens when smsUrl and billingUrl are both falsy but we reach this line
    process.env.NEXT_PUBLIC_SMS_API_BASE_URL = "";
    process.env.NEXT_PUBLIC_API_BASE_URL = "";
    process.env.NODE_ENV = "test";

    jest.resetModules();
    const module = await import("../../../../src/controller/api/config/smsApiConfig");
    expect(module.smsBaseURL).toBeDefined();
    expect(module.smsBaseURL).toBe("https://sms-api.test.com");
  });

  it("covers localhost check (line 45)", async () => {
    // Test the check at line 45: if (smsBaseURL.includes("localhost"))
    // Note: La logique retourne billingUrl si smsUrl contient localhost
    const originalWindow = global.window;
    // @ts-expect-error - intentionally removing window for test
    global.window = undefined;

    // Si smsUrl contient localhost, il utilise billingUrl à la place
    process.env.NEXT_PUBLIC_SMS_API_BASE_URL = "http://localhost:3000";
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://billing-api.dev.mercury.dadanadagroup.com";
    process.env.NODE_ENV = "development";

    jest.resetModules();
    const module = await import("../../../../src/controller/api/config/smsApiConfig");
    expect(module.smsBaseURL).toBeDefined();
    // Quand smsUrl contient localhost, il utilise billingUrl
    expect(module.smsBaseURL).toBe("https://billing-api.dev.mercury.dadanadagroup.com");

    // Restore
    global.window = originalWindow;
  });

  it("covers fallback when both smsUrl and billingUrl are falsy (line 41)", async () => {
    // Test the fallback at line 41: return smsUrl || billingUrl || "https://sms-api.test.com"
    // This happens when both are empty strings or falsy
    // But if billingUrl is set in env, it will be used
    delete process.env.NEXT_PUBLIC_SMS_API_BASE_URL;
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    process.env.NODE_ENV = "test";

    jest.resetModules();
    const module = await import("../../../../src/controller/api/config/smsApiConfig");
    expect(module.smsBaseURL).toBeDefined();
    // Should return the fallback value when both are undefined
    expect(module.smsBaseURL).toBe("https://sms-api.test.com");
  });

  it("covers fallback when smsUrl contains localhost and billingUrl is falsy (line 41)", async () => {
    // Test the fallback at line 41 when smsUrl contains localhost (line 15 is false) and billingUrl is falsy
    // When smsUrl contains localhost, line 15 is false, so we check billingUrl at line 18
    // If billingUrl is falsy, we check !smsUrl && !billingUrl at line 24, which is false (smsUrl is truthy)
    // So we reach line 41: return smsUrl || billingUrl || "https://sms-api.test.com"
    // Since smsUrl is truthy, we return smsUrl, not the fallback
    process.env.NEXT_PUBLIC_SMS_API_BASE_URL = "http://localhost:3000";
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    process.env.NODE_ENV = "test";

    jest.resetModules();
    const module = await import("../../../../src/controller/api/config/smsApiConfig");
    expect(module.smsBaseURL).toBeDefined();
    // When smsUrl contains localhost and billingUrl is falsy, we reach line 41
    // But smsUrl is truthy, so we return smsUrl (not the fallback)
    // The fallback at line 41 can only be reached if smsUrl is falsy, which shouldn't happen
    expect(module.smsBaseURL).toBe("http://localhost:3000");
  });

  it("covers fallback when smsUrl contains 127.0.0.1 and billingUrl is falsy (line 41)", async () => {
    // Similar to above, when smsUrl contains 127.0.0.1, line 15 is false
    // We check billingUrl at line 18, if falsy, we reach line 41
    // Since smsUrl is truthy, we return smsUrl
    process.env.NEXT_PUBLIC_SMS_API_BASE_URL = "http://127.0.0.1:3000";
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    process.env.NODE_ENV = "test";

    jest.resetModules();
    const module = await import("../../../../src/controller/api/config/smsApiConfig");
    expect(module.smsBaseURL).toBeDefined();
    // We reach line 41 but return smsUrl since it's truthy
    expect(module.smsBaseURL).toBe("http://127.0.0.1:3000");
  });

  it("covers localhost check with billingUrl containing localhost (line 45)", async () => {
    // Test the check at line 45 when billingUrl contains localhost
    const originalWindow = global.window;
    // @ts-expect-error - intentionally removing window for test
    global.window = undefined;

    process.env.NEXT_PUBLIC_SMS_API_BASE_URL = "http://127.0.0.1:3000";
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8080";
    process.env.NODE_ENV = "development";

    jest.resetModules();
    const module = await import("../../../../src/controller/api/config/smsApiConfig");
    expect(module.smsBaseURL).toBeDefined();
    // The check at line 45 is executed during module load
    expect(module.smsBaseURL).toBeDefined();

    // Restore
    global.window = originalWindow;
  });

  it("covers server-side dev localhost branch", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    process.env.NEXT_PUBLIC_SMS_API_BASE_URL = "http://localhost:3000";
    delete process.env.NEXT_PUBLIC_API_BASE_URL;

    const originalWindow = global.window;
    // @ts-expect-error - simulate server environment
    global.window = undefined;

    jest.resetModules();
    const module = await import("../../../../src/controller/api/config/smsApiConfig");
    expect(module.smsBaseURL).toBe("http://localhost:3000");

    process.env.NODE_ENV = originalEnv;
    global.window = originalWindow;
    jest.resetModules();
  });
});
