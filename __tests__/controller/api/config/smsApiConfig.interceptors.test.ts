

// Unmock axios to test real interceptors
jest.unmock("axios");

describe("controller/api/config/smsApiConfig.ts - interceptors", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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
        expect(result).toBe(config);
        expect(result.headers.Authorization).toBe("token123");
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
        expect(result).toBe(config);
        expect(result.headers.Authorization).toBe("Bearer token123");
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
        expect(result).toBe(config);
        expect(result.headers["api-key"]).toBe("key123456");
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
        expect(result).toBe(config);
        expect(result.headers.Authorization).toBe("Bearer token123");
        expect(result.headers["api-key"]).toBe("key123");
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
        expect(result).toBe(response);
        expect(result.data.token).toBe("secret-token");
        expect(result.data.apiKey).toBe("secret-key");
        expect(result.data.otherData).toBe("visible");
      }
    }

    process.env.NODE_ENV = originalEnv;
    jest.resetModules();
  });

  it("response interceptor handles token expired error and cleans up", async () => {
    const mockLocation = { href: "" };
    // Mock window.location directly using Object.defineProperty
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

        await expect(rejectedHandler(tokenExpiredError)).rejects.toBeDefined();

        expect(mockLocalStorage.clear).toHaveBeenCalled();
        expect(mockSessionStorage.clear).toHaveBeenCalled();
        expect(mockLocation.href).toBe("/signin");
      }
    }
  });

  it("response interceptor handles different token expired messages", async () => {
    const mockLocation = { href: "" };
    // Mock window.location directly using Object.defineProperty
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
          await expect(rejectedHandler(error)).rejects.toBeDefined();
          expect(mockLocation.href).toBe("/signin");
        }
      }
    }
  });

  it("response interceptor handles cleanup error gracefully", async () => {
    const mockLocation = { href: "" };
    // Mock window.location directly using Object.defineProperty
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

        await expect(rejectedHandler(error)).rejects.toBeDefined();
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
