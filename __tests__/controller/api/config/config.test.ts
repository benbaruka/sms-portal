import apiRequest, { billingApiRequest } from "../../../../src/controller/api/config/config";


// Mock billingApi - use jest.hoisted() to ensure it's created before the mock factory runs
const { mockBillingApi } = jest.hoisted(() => {
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
  return { mockBillingApi: mockApi };
});

// Mock axios.create() to return our mock instance
jest.mock("axios", async () => {
  const actual = await jest.importActual("axios");
  return {
    ...actual,
    default: {
      ...actual.default,
      create: jest.fn(() => mockBillingApi),
    },
    create: jest.fn(() => mockBillingApi),
  };
});

jest.mock("../../../../src/controller/api/config/baseUrl", () => ({
  baseURL: "https://api.test.com",
}));

describe("controller/api/config/config.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBillingApi.request.mockResolvedValue({
      data: { success: true },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
      request: {},
    });
  });

  it("module loads", () => {
    expect(billingApiRequest).toBeDefined();
    expect(typeof billingApiRequest).toBe("function");
  });

  it("billingApiRequest makes request with api-key header", async () => {
    await billingApiRequest({
      method: "GET",
      endpoint: "/test",
      apiKey: "test-api-key",
    });

    expect(mockBillingApi.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        url: "/test",
        headers: expect.objectContaining({
          "api-key": "test-api-key",
        }),
      })
    );
  });

  it("billingApiRequest normalizes endpoint with leading slash", async () => {
    await billingApiRequest({
      method: "POST",
      endpoint: "test",
      apiKey: "test-key",
    });

    expect(mockBillingApi.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/test",
      })
    );
  });

  it("billingApiRequest handles request data", async () => {
    const data = { name: "test" };
    await billingApiRequest({
      method: "POST",
      endpoint: "/test",
      data,
      apiKey: "test-key",
    });

    expect(mockBillingApi.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        data,
      })
    );
  });

  it("billingApiRequest handles request params", async () => {
    const params = { page: 1, limit: 10 };
    await billingApiRequest({
      method: "GET",
      endpoint: "/test",
      params,
      apiKey: "test-key",
    });

    expect(mockBillingApi.request).toHaveBeenCalledWith(
      expect.objectContaining({
        params,
      })
    );
  });

  it("billingApiRequest returns correct response format", async () => {
    const response = await billingApiRequest({
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

  it("billingApiRequest throws error on failure", async () => {
    const error = new Error("Request failed");
    mockBillingApi.request.mockRejectedValueOnce(error);

    await expect(
      billingApiRequest({
        method: "GET",
        endpoint: "/test",
        apiKey: "test-key",
      })
    ).rejects.toThrow("Request failed");
  });

  it("billingApiRequest works without apiKey", async () => {
    await billingApiRequest({
      method: "GET",
      endpoint: "/test",
    });

    expect(mockBillingApi.request).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.not.objectContaining({
          "api-key": expect.anything(),
        }),
      })
    );
  });

  it("billingApiRequest handles endpoint that already starts with slash", async () => {
    await billingApiRequest({
      method: "GET",
      endpoint: "/test",
      apiKey: "test-key",
    });

    expect(mockBillingApi.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/test",
      })
    );
  });

  // Interceptor tests are in config.interceptors.test.ts to avoid mock conflicts
  describe.skip("interceptors", () => {
    it("request interceptor masks Authorization token without Bearer prefix", async () => {
      // Import billingApi to access interceptors
      const { billingApi } = await import("../../../../src/controller/api/config/config");

      // Get the request interceptor handlers
      const requestHandlers = billingApi.interceptors?.request?.handlers;
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
      const { billingApi } = await import("../../../../src/controller/api/config/config");
      const requestHandlers = billingApi.interceptors?.request?.handlers;
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
      const { billingApi } = await import("../../../../src/controller/api/config/config");
      const requestHandlers = billingApi.interceptors?.request?.handlers;
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
      const { billingApi } = await import("../../../../src/controller/api/config/config");
      const requestHandlers = billingApi.interceptors?.request?.handlers;
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
      const { billingApi } = await import("../../../../src/controller/api/config/config");
      const requestHandlers = billingApi.interceptors?.request?.handlers;
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
      const { billingApi } = await import("../../../../src/controller/api/config/config");
      const responseHandlers = billingApi.interceptors?.response?.handlers;
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
      // Mock window and storage
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

      // Mock document.cookie
      Object.defineProperty(document, "cookie", {
        value: "token=abc123; session=xyz789",
        writable: true,
        configurable: true,
      });

      const { billingApi } = await import("../../../../src/controller/api/config/config");
      const responseHandlers = billingApi.interceptors?.response?.handlers;
      if (responseHandlers && responseHandlers.length > 0) {
        const rejectedHandler = responseHandlers[0].rejected;
        if (rejectedHandler) {
          const axios = await import("axios");
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

      const { billingApi } = await import("../../../../src/controller/api/config/config");
      const responseHandlers = billingApi.interceptors?.response?.handlers;
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

      // Make localStorage.clear throw
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

      const { billingApi } = await import("../../../../src/controller/api/config/config");
      const responseHandlers = billingApi.interceptors?.response?.handlers;
      if (responseHandlers && responseHandlers.length > 0) {
        const rejectedHandler = responseHandlers[0].rejected;
        if (rejectedHandler) {
          const error = {
            isAxiosError: true,
            response: { data: { message: "Token has expired" } },
            message: "Token has expired",
          };

          // Should not throw, should still redirect
          await expect(rejectedHandler(error)).resolves.toBeUndefined();
          expect(mockLocation.href).toBe("/signin");
        }
      }
    });

    it("response interceptor handles non-axios errors", async () => {
      const { billingApi } = await import("../../../../src/controller/api/config/config");
      const responseHandlers = billingApi.interceptors?.response?.handlers;
      if (responseHandlers && responseHandlers.length > 0) {
        const rejectedHandler = responseHandlers[0].rejected;
        if (rejectedHandler) {
          const error = new Error("Network error");
          await expect(rejectedHandler(error)).rejects.toThrow("Network error");
        }
      }
    });
  });

  describe("apiRequest (default export)", () => {
    it("module exports default function", () => {
      expect(apiRequest).toBeDefined();
      expect(typeof apiRequest).toBe("function");
    });

    it("apiRequest makes request with token in Authorization header", async () => {
      await apiRequest({
        method: "GET",
        endpoint: "/test",
        token: "test-token",
      });

      expect(mockBillingApi.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        })
      );
    });

    it("apiRequest works without token", async () => {
      await apiRequest({
        method: "GET",
        endpoint: "/test",
      });

      expect(mockBillingApi.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.anything(),
          }),
        })
      );
    });

    it("apiRequest handles endpoint with id", async () => {
      await apiRequest({
        method: "GET",
        endpoint: "/test",
        id: "123",
        token: "test-token",
      });

      expect(mockBillingApi.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "/test/123",
        })
      );
    });

    it("apiRequest handles endpoint without id", async () => {
      await apiRequest({
        method: "GET",
        endpoint: "/test",
        token: "test-token",
      });

      expect(mockBillingApi.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "/test",
        })
      );
    });

    it("apiRequest handles request data", async () => {
      const data = { name: "test" };
      await apiRequest({
        method: "POST",
        endpoint: "/test",
        data,
        token: "test-token",
      });

      expect(mockBillingApi.request).toHaveBeenCalledWith(
        expect.objectContaining({
          data,
        })
      );
    });

    it("apiRequest handles request params", async () => {
      const params = { page: 1 };
      await apiRequest({
        method: "GET",
        endpoint: "/test",
        params,
        token: "test-token",
      });

      expect(mockBillingApi.request).toHaveBeenCalledWith(
        expect.objectContaining({
          params,
        })
      );
    });

    it("apiRequest returns correct response format", async () => {
      const response = await apiRequest({
        method: "GET",
        endpoint: "/test",
        token: "test-token",
      });

      expect(response).toHaveProperty("data");
      expect(response).toHaveProperty("status");
      expect(response).toHaveProperty("statusText");
      expect(response).toHaveProperty("headers");
      expect(response).toHaveProperty("config");
    });

    it("apiRequest throws error on failure", async () => {
      const error = new Error("Request failed");
      mockBillingApi.request.mockRejectedValueOnce(error);

      await expect(
        apiRequest({
          method: "GET",
          endpoint: "/test",
          token: "test-token",
        })
      ).rejects.toThrow("Request failed");
    });
  });
});
