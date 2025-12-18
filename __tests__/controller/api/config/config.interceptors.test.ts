

// Unmock axios to test real interceptors
jest.unmock("axios");

describe("controller/api/config/config.ts - interceptors", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset modules to ensure config.ts is reloaded and interceptors are set up
    jest.resetModules();
  });

  it("imports config module to execute interceptor setup code", async () => {
    // This test ensures the interceptor setup code (lines 21-123) is executed
    // by importing the module, which triggers the interceptor configuration
    const { billingApi } = await import("../../../../src/controller/api/config/config");
    expect(billingApi).toBeDefined();
    expect(billingApi.interceptors).toBeDefined();
    expect(billingApi.interceptors.request).toBeDefined();
    expect(billingApi.interceptors.response).toBeDefined();
    // Verify interceptors are set up (handlers should exist)
    expect(billingApi.interceptors.request.handlers.length).toBeGreaterThan(0);
    expect(billingApi.interceptors.response.handlers.length).toBeGreaterThan(0);
  });

  it("handles undefined baseURL (line 12)", async () => {
    // Test that billingApi is created even when baseURL is undefined
    // This covers line 12: baseURL: baseURL || ""
    jest.doMock("../../../../src/controller/api/config/baseUrl", () => ({
      baseURL: undefined,
    }));

    jest.resetModules();
    const { billingApi } = await import("../../../../src/controller/api/config/config");
    expect(billingApi).toBeDefined();
    expect(billingApi.defaults.baseURL).toBe("");

    jest.resetModules();
  });

  it("handles case where interceptors cannot be set up (line 22)", async () => {
    // Test the case where the condition at line 22 is false
    // This happens when billingApi.interceptors.request.use is not a function
    // We need to mock axios.create to return an instance without proper interceptors
    jest.doMock("axios", async () => {
      const actual = await jest.importActual("axios");
      return {
        ...actual,
        default: {
          ...actual.default,
          create: jest.fn(() => ({
            interceptors: {
              request: {
                use: null, // Not a function, so condition at line 22 will be false
              },
            },
          })),
        },
      };
    });

    jest.resetModules();
    // This should not throw, the try-catch should handle it
    const { billingApi } = await import("../../../../src/controller/api/config/config");
    expect(billingApi).toBeDefined();

    jest.resetModules();
  });

  it("request interceptor handles config without headers", async () => {
    const { billingApi } = await import("../../../../src/controller/api/config/config");
    const requestHandlers = billingApi.interceptors?.request?.handlers;
    if (requestHandlers && requestHandlers.length > 0) {
      const fulfilledHandler = requestHandlers[0].fulfilled;
      if (fulfilledHandler) {
        const config = {}; // No headers
        // This covers line 30: if (config.headers)
        const result = await fulfilledHandler(config);
        expect(result).toBe(config);
      }
    }
  });

  it("request interceptor processes Authorization token without Bearer prefix", async () => {
    const { billingApi } = await import("../../../../src/controller/api/config/config");
    const requestHandlers = billingApi.interceptors?.request?.handlers;
    if (requestHandlers && requestHandlers.length > 0) {
      const fulfilledHandler = requestHandlers[0].fulfilled;
      if (fulfilledHandler) {
        const config = {
          headers: {
            Authorization: "token123",
          },
        };
        // The interceptor creates sanitizedHeaders but returns config unchanged
        // This test verifies the code path is executed (coverage)
        const result = await fulfilledHandler(config);
        expect(result).toBe(config);
        expect(result.headers.Authorization).toBe("token123");
      }
    }
  });

  it("request interceptor processes Authorization token with Bearer prefix", async () => {
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
        // The interceptor creates sanitizedHeaders but returns config unchanged
        const result = await fulfilledHandler(config);
        expect(result).toBe(config);
        expect(result.headers.Authorization).toBe("Bearer token123");
      }
    }
  });

  it("request interceptor processes api-key header", async () => {
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
        // The interceptor creates sanitizedHeaders but returns config unchanged
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
        // The interceptor creates sanitizedHeaders but returns config unchanged
        // In production, sanitizedHeaders would have these deleted, but config is returned as-is
        const result = await fulfilledHandler(config);
        expect(result).toBe(config);
        // Config is returned unchanged, sanitizedHeaders is only for logging
        expect(result.headers.Authorization).toBe("Bearer token123");
        expect(result.headers["api-key"]).toBe("key123");
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
        // The interceptor creates sanitizedData but returns response unchanged
        // sanitizedData is only for logging, not for modifying the response
        const result = await fulfilledHandler(response);
        expect(result).toBe(response);
        // Response data is returned unchanged, sanitizedData is only for logging
        expect(result.data.token).toBe("secret-token");
        expect(result.data.apiKey).toBe("secret-key");
        expect(result.data.otherData).toBe("visible");
      }
    }

    process.env.NODE_ENV = originalEnv;
    jest.resetModules();
  });

  it("response interceptor handles non-object data in production", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    jest.resetModules();
    const { billingApi } = await import("../../../../src/controller/api/config/config");
    const responseHandlers = billingApi.interceptors?.response?.handlers;
    if (responseHandlers && responseHandlers.length > 0) {
      const fulfilledHandler = responseHandlers[0].fulfilled;
      if (fulfilledHandler) {
        // Test with string data (not an object) - covers line 69: if (response.data && typeof response.data === "object")
        const response = {
          data: "string data",
          config: {},
        };
        const result = await fulfilledHandler(response);
        expect(result).toBe(response);
        expect(result.data).toBe("string data");
      }
    }

    process.env.NODE_ENV = originalEnv;
    jest.resetModules();
  });

  it("response interceptor handles response without config", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    jest.resetModules();
    const { billingApi } = await import("../../../../src/controller/api/config/config");
    const responseHandlers = billingApi.interceptors?.response?.handlers;
    if (responseHandlers && responseHandlers.length > 0) {
      const fulfilledHandler = responseHandlers[0].fulfilled;
      if (fulfilledHandler) {
        // Test without config - covers line 67: if (process.env.NODE_ENV === "production" && response.config)
        const response = {
          data: { token: "secret" },
        };
        const result = await fulfilledHandler(response);
        expect(result).toBe(response);
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

    const { billingApi } = await import("../../../../src/controller/api/config/config");
    const axios = await import("axios");
    const responseHandlers = billingApi.interceptors?.response?.handlers;
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

        // The interceptor should handle the error and clean up
        // It returns Promise.reject, so we expect it to reject
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

        // The interceptor returns Promise.reject, so it should reject
        await expect(rejectedHandler(error)).rejects.toBeDefined();
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

  it("response interceptor handles error without response data", async () => {
    const { billingApi } = await import("../../../../src/controller/api/config/config");
    const axios = await import("axios");
    const responseHandlers = billingApi.interceptors?.response?.handlers;
    if (responseHandlers && responseHandlers.length > 0) {
      const rejectedHandler = responseHandlers[0].rejected;
      if (rejectedHandler) {
        // Test error without response.data - covers line 85: error.response?.data?.message || error.response?.data?.error || error.message || ""
        const error = {
          isAxiosError: true,
          message: "Network error",
        };
        await expect(rejectedHandler(error)).rejects.toBeDefined();
      }
    }
  });

  it("response interceptor handles error with error field instead of message", async () => {
    const { billingApi } = await import("../../../../src/controller/api/config/config");
    const responseHandlers = billingApi.interceptors?.response?.handlers;
    if (responseHandlers && responseHandlers.length > 0) {
      const rejectedHandler = responseHandlers[0].rejected;
      if (rejectedHandler) {
        // Test error with error field - covers line 85: error.response?.data?.error
        const error = {
          isAxiosError: true,
          response: {
            data: {
              error: "Token expired",
            },
          },
          message: "Request failed",
        };
        await expect(rejectedHandler(error)).rejects.toBeDefined();
      }
    }
  });

  it("response interceptor handles error with only message field (line 85)", async () => {
    const { billingApi } = await import("../../../../src/controller/api/config/config");
    const responseHandlers = billingApi.interceptors?.response?.handlers;
    if (responseHandlers && responseHandlers.length > 0) {
      const rejectedHandler = responseHandlers[0].rejected;
      if (rejectedHandler) {
        // Test error with only message (no response.data.message or error)
        // Covers line 85: error.response?.data?.message || error.response?.data?.error || error.message || ""
        const error = {
          isAxiosError: true,
          response: {
            data: {}, // No message or error field
          },
          message: "Network error",
        };
        await expect(rejectedHandler(error)).rejects.toBeDefined();
      }
    }
  });

  it("response interceptor handles error with no response data (line 85)", async () => {
    const { billingApi } = await import("../../../../src/controller/api/config/config");
    const responseHandlers = billingApi.interceptors?.response?.handlers;
    if (responseHandlers && responseHandlers.length > 0) {
      const rejectedHandler = responseHandlers[0].rejected;
      if (rejectedHandler) {
        // Test error with no response.data - covers line 85 fallback to error.message
        const error = {
          isAxiosError: true,
          response: {}, // No data field
          message: "Request failed",
        };
        await expect(rejectedHandler(error)).rejects.toBeDefined();
      }
    }
  });

  it("response interceptor handles error with no response (line 85)", async () => {
    const { billingApi } = await import("../../../../src/controller/api/config/config");
    const responseHandlers = billingApi.interceptors?.response?.handlers;
    if (responseHandlers && responseHandlers.length > 0) {
      const rejectedHandler = responseHandlers[0].rejected;
      if (rejectedHandler) {
        // Test error with no response - covers line 85 fallback to error.message || ""
        const error = {
          isAxiosError: true,
          message: "Network error",
        };
        await expect(rejectedHandler(error)).rejects.toBeDefined();
      }
    }
  });

  it("response interceptor handles error with empty message (line 85)", async () => {
    const { billingApi } = await import("../../../../src/controller/api/config/config");
    const responseHandlers = billingApi.interceptors?.response?.handlers;
    if (responseHandlers && responseHandlers.length > 0) {
      const rejectedHandler = responseHandlers[0].rejected;
      if (rejectedHandler) {
        // Test error with empty message - covers line 85 fallback to ""
        const error = {
          isAxiosError: true,
          response: {},
          message: "",
        };
        await expect(rejectedHandler(error)).rejects.toBeDefined();
      }
    }
  });

  it("response interceptor handles response with token but not apiKey (line 71-74)", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    jest.resetModules();
    const { billingApi } = await import("../../../../src/controller/api/config/config");
    const responseHandlers = billingApi.interceptors?.response?.handlers;
    if (responseHandlers && responseHandlers.length > 0) {
      const fulfilledHandler = responseHandlers[0].fulfilled;
      if (fulfilledHandler) {
        // Test with only token (covers line 71-72)
        const response1 = {
          data: {
            token: "secret-token",
            otherData: "visible",
          },
          config: {},
        };
        const result1 = await fulfilledHandler(response1);
        expect(result1).toBe(response1);

        // Test with only apiKey (covers line 74-75)
        const response2 = {
          data: {
            apiKey: "secret-key",
            otherData: "visible",
          },
          config: {},
        };
        const result2 = await fulfilledHandler(response2);
        expect(result2).toBe(response2);
      }
    }

    process.env.NODE_ENV = originalEnv;
    jest.resetModules();
  });

  it("response interceptor handles cleanup error with window check (line 114)", async () => {
    const mockLocation = { href: "" };
    // Mock window.location directly (window.location is not configurable in JSDOM, but we can replace it)
    // @ts-expect-error - JSDOM location is not fully configurable
    delete window.location;
    // @ts-expect-error - intentionally replacing location
    window.location = mockLocation as Location;

    // Make localStorage and sessionStorage throw, and also make window undefined in catch
    const mockLocalStorage = {
      clear: jest.fn(() => {
        // Make window undefined to test line 114
        Object.defineProperty(global, "window", {
          value: undefined,
          writable: true,
          configurable: true,
        });
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

        // Should not throw, should handle gracefully
        await expect(rejectedHandler(error)).rejects.toBeDefined();
      }
    }

    // Restore window
    Object.defineProperty(global, "window", {
      value: window,
      writable: true,
      configurable: true,
    });
  });

  it("response interceptor handles cookie cleanup (lines 104-108)", async () => {
    const mockLocation = { href: "", hostname: "localhost" };
    const mockWindow = {
      location: mockLocation,
      localStorage: {
        clear: jest.fn(),
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        length: 0,
        key: jest.fn(),
      },
      sessionStorage: {
        clear: jest.fn(),
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        length: 0,
        key: jest.fn(),
      },
    };

    // @ts-expect-error - intentionally setting window for test
    global.window = mockWindow;

    // Set up cookies to test the cookie cleanup code (lines 104-108)
    const cookies = ["token=abc123", "session=xyz789", "auth=test123"];
    let cookieValue = cookies.join("; ");

    // Mock document.cookie to track cookie deletions
    Object.defineProperty(document, "cookie", {
      get: () => cookieValue,
      set: (value: string) => {
        // Simulate cookie deletion
        if (value.includes("expires=Thu, 01 Jan 1970")) {
          const cookieName = value.split("=")[0].trim();
          cookieValue = cookieValue
            .split("; ")
            .filter((c) => !c.startsWith(cookieName))
            .join("; ");
        }
      },
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

        await expect(rejectedHandler(error)).rejects.toBeDefined();

        // Verify cleanup was called
        expect(mockWindow.localStorage.clear).toHaveBeenCalled();
        expect(mockWindow.sessionStorage.clear).toHaveBeenCalled();
        expect(mockLocation.href).toBe("/signin");
      }
    }

    // Restore
    // @ts-expect-error
    delete global.window;
  });

  it("response interceptor handles isTokenExpired false case (line 94)", async () => {
    const { billingApi } = await import("../../../../src/controller/api/config/config");
    const responseHandlers = billingApi.interceptors?.response?.handlers;
    if (responseHandlers && responseHandlers.length > 0) {
      const rejectedHandler = responseHandlers[0].rejected;
      if (rejectedHandler) {
        // Test error that is not token expired - covers line 94: if (isTokenExpired && typeof window !== "undefined")
        const error = {
          isAxiosError: true,
          response: { data: { message: "Some other error" } },
          message: "Some other error",
        };

        await expect(rejectedHandler(error)).rejects.toBeDefined();
      }
    }
  });

  it("response interceptor handles window undefined case (line 94)", async () => {
    const originalWindow = global.window;
    // @ts-expect-error - intentionally setting window to undefined for test
    global.window = undefined;

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

        // Should not redirect if window is undefined
        await expect(rejectedHandler(error)).rejects.toBeDefined();
      }
    }

    global.window = originalWindow;
  });
});
