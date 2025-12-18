// Mock axios.create to return a mock instance
// Store mock references in a global object accessible from tests
(global as any).__mockBillingApiRequestFn = jest.fn();
(global as any).__mockBillingApi = jest.fn((config: any) => (global as any).__mockBillingApiRequestFn(config));
(global as any).__mockBillingApi.request = (global as any).__mockBillingApiRequestFn;
(global as any).__mockBillingApi.interceptors = {
  request: {
    use: jest.fn(),
    handlers: [],
  },
  response: {
    use: jest.fn(),
    handlers: [],
  },
};

jest.mock("axios", () => {
  const actual = jest.requireActual("axios");
  return {
    ...actual,
    default: {
      ...actual.default,
      create: jest.fn(() => (global as any).__mockBillingApi),
    },
    create: jest.fn(() => (global as any).__mockBillingApi),
  };
});

// Reset modules and import after mocking
jest.resetModules();
const { billingApiRequest, billingApi } = require("../../../../src/controller/api/config/config");
const apiRequest = require("../../../../src/controller/api/config/config").default;

describe("controller/api/config/config.ts - Comprehensive Tests", () => {
  let mockRequestFn: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // Get mockRequestFn from global
    mockRequestFn = (global as any).__mockBillingApiRequestFn;
  });

  describe("billingApiRequest", () => {
    describe("Success scenarios", () => {
      it("should make successful request with all parameters", async () => {
        const mockResponse = {
          data: { id: 1, name: "test" },
          status: 200,
          statusText: "OK",
          headers: { "content-type": "application/json" },
          config: {},
          request: {},
        };

        mockRequestFn.mockResolvedValueOnce(mockResponse);

        const result = await billingApiRequest<{ name: string }, { id: number; name: string }>({
          method: "POST",
          endpoint: "/test",
          data: { name: "test" },
          params: { page: 1 },
          apiKey: "test-api-key",
        });

        expect(mockRequestFn).toHaveBeenCalledWith({
          method: "POST",
          url: "/test",
          headers: {
            "Content-Type": "application/json",
            "api-key": "test-api-key",
          },
          data: { name: "test" },
          params: { page: 1 },
        });

        expect(result).toEqual({
          data: mockResponse.data,
          status: mockResponse.status,
          statusText: mockResponse.statusText,
          headers: mockResponse.headers,
          config: mockResponse.config,
          request: mockResponse.request,
        });
      });

      it("should make successful request without apiKey", async () => {
        const mockResponse = {
          data: { success: true },
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };

        mockRequestFn.mockResolvedValueOnce(mockResponse);

        const result = await billingApiRequest({
          method: "GET",
          endpoint: "/test",
        });

        expect(mockRequestFn).toHaveBeenCalledWith({
          method: "GET",
          url: "/test",
          headers: {
            "Content-Type": "application/json",
          },
          data: undefined,
          params: undefined,
        });

        expect(result.data).toEqual({ success: true });
      });

      it("should normalize endpoint without leading slash", async () => {
        const mockResponse = {
          data: {},
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };

        mockRequestFn.mockResolvedValueOnce(mockResponse);

        await billingApiRequest({
          method: "GET",
          endpoint: "test",
          apiKey: "key",
        });

        expect(mockRequestFn).toHaveBeenCalledWith(
          expect.objectContaining({
            url: "/test",
          })
        );
      });

      it("should handle endpoint with leading slash", async () => {
        const mockResponse = {
          data: {},
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };

        mockRequestFn.mockResolvedValueOnce(mockResponse);

        await billingApiRequest({
          method: "GET",
          endpoint: "/test",
          apiKey: "key",
        });

        expect(mockRequestFn).toHaveBeenCalledWith(
          expect.objectContaining({
            url: "/test",
          })
        );
      });
    });

    describe("API error scenarios", () => {
      it("should throw error when API returns error response", async () => {
        const axiosError = {
          isAxiosError: true,
          response: {
            status: 400,
            data: { message: "Bad Request" },
          },
          message: "Request failed with status code 400",
        };

        mockRequestFn.mockRejectedValueOnce(axiosError);

        await expect(
          billingApiRequest({
            method: "POST",
            endpoint: "/test",
            apiKey: "key",
          })
        ).rejects.toEqual(axiosError);
      });

      it("should throw error when API returns 500 error", async () => {
        const axiosError = {
          isAxiosError: true,
          response: {
            status: 500,
            data: { error: "Internal Server Error" },
          },
          message: "Request failed with status code 500",
        };

        mockRequestFn.mockRejectedValueOnce(axiosError);

        await expect(
          billingApiRequest({
            method: "GET",
            endpoint: "/test",
            apiKey: "key",
          })
        ).rejects.toEqual(axiosError);
      });

      it("should throw error when API returns 401 unauthorized", async () => {
        const axiosError = {
          isAxiosError: true,
          response: {
            status: 401,
            data: { message: "Unauthorized" },
          },
          message: "Request failed with status code 401",
        };

        mockRequestFn.mockRejectedValueOnce(axiosError);

        await expect(
          billingApiRequest({
            method: "GET",
            endpoint: "/test",
            apiKey: "key",
          })
        ).rejects.toEqual(axiosError);
      });
    });

    describe("Empty response scenarios", () => {
      it("should handle empty response data", async () => {
        const mockResponse = {
          data: null,
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };

        mockRequestFn.mockResolvedValueOnce(mockResponse);

        const result = await billingApiRequest({
          method: "GET",
          endpoint: "/test",
          apiKey: "key",
        });

        expect(result.data).toBeNull();
        expect(result.status).toBe(200);
      });

      it("should handle empty object response", async () => {
        const mockResponse = {
          data: {},
          status: 204,
          statusText: "No Content",
          headers: {},
          config: {},
          request: {},
        };

        mockRequestFn.mockResolvedValueOnce(mockResponse);

        const result = await billingApiRequest({
          method: "DELETE",
          endpoint: "/test",
          apiKey: "key",
        });

        expect(result.data).toEqual({});
        expect(result.status).toBe(204);
      });
    });

    describe("Thrown exception scenarios", () => {
      it("should throw non-axios error", async () => {
        const error = new Error("Network error");
        mockRequestFn.mockRejectedValueOnce(error);

        await expect(
          billingApiRequest({
            method: "GET",
            endpoint: "/test",
            apiKey: "key",
          })
        ).rejects.toThrow("Network error");
      });

      it("should throw error when request times out", async () => {
        const timeoutError = new Error("timeout of 30000ms exceeded");
        mockRequestFn.mockRejectedValueOnce(timeoutError);

        await expect(
          billingApiRequest({
            method: "GET",
            endpoint: "/test",
            apiKey: "key",
          })
        ).rejects.toThrow("timeout of 30000ms exceeded");
      });
    });

    describe("Conditional branches", () => {
      it("should include api-key header when apiKey is provided", async () => {
        const mockResponse = {
          data: {},
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };

        mockRequestFn.mockResolvedValueOnce(mockResponse);

        await billingApiRequest({
          method: "GET",
          endpoint: "/test",
          apiKey: "my-api-key",
        });

        expect(mockRequestFn).toHaveBeenCalledWith(
          expect.objectContaining({
            headers: expect.objectContaining({
              "api-key": "my-api-key",
            }),
          })
        );
      });

      it("should not include api-key header when apiKey is not provided", async () => {
        const mockResponse = {
          data: {},
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };

        mockRequestFn.mockResolvedValueOnce(mockResponse);

        await billingApiRequest({
          method: "GET",
          endpoint: "/test",
        });

        expect(mockRequestFn).toHaveBeenCalledWith(
          expect.objectContaining({
            headers: expect.not.objectContaining({
              "api-key": expect.anything(),
            }),
          })
        );
      });

      it("should normalize endpoint when it does not start with slash", async () => {
        const mockResponse = {
          data: {},
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };

        mockRequestFn.mockResolvedValueOnce(mockResponse);

        await billingApiRequest({
          method: "GET",
          endpoint: "test-endpoint",
          apiKey: "key",
        });

        expect(mockRequestFn).toHaveBeenCalledWith(
          expect.objectContaining({
            url: "/test-endpoint",
          })
        );
      });

      it("should keep endpoint as is when it starts with slash", async () => {
        const mockResponse = {
          data: {},
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };

        mockRequestFn.mockResolvedValueOnce(mockResponse);

        await billingApiRequest({
          method: "GET",
          endpoint: "/test-endpoint",
          apiKey: "key",
        });

        expect(mockRequestFn).toHaveBeenCalledWith(
          expect.objectContaining({
            url: "/test-endpoint",
          })
        );
      });
    });
  });

  describe("apiRequest (default export)", () => {
    describe("Success scenarios", () => {
      it("should make successful request with all parameters including id", async () => {
        const mockResponse = {
          data: { id: 1, name: "test" },
          status: 200,
          statusText: "OK",
          headers: { "content-type": "application/json" },
          config: {},
          request: {},
        };

        mockRequestFn.mockResolvedValueOnce(mockResponse);

        const result = await apiRequest<{ name: string }, { id: number; name: string }>({
          method: "PUT",
          endpoint: "/users",
          id: 123,
          data: { name: "test" },
          params: { include: "profile" },
          token: "bearer-token",
        });

        expect(mockRequestFn).toHaveBeenCalledWith({
          method: "PUT",
          url: "/users/123",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer bearer-token",
          },
          data: { name: "test" },
          params: { include: "profile" },
        });

        expect(result).toEqual({
          data: mockResponse.data,
          status: mockResponse.status,
          statusText: mockResponse.statusText,
          headers: mockResponse.headers,
          config: mockResponse.config,
          request: mockResponse.request,
        });
      });

      it("should make successful request without id", async () => {
        const mockResponse = {
          data: { success: true },
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };

        mockRequestFn.mockResolvedValueOnce(mockResponse);

        const result = await apiRequest({
          method: "GET",
          endpoint: "/users",
          token: "token",
        });

        expect(mockRequestFn).toHaveBeenCalledWith({
          method: "GET",
          url: "/users",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer token",
          },
          data: undefined,
          params: undefined,
        });

        expect(result.data).toEqual({ success: true });
      });

      it("should make successful request without token", async () => {
        const mockResponse = {
          data: { public: true },
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };

        mockRequestFn.mockResolvedValueOnce(mockResponse);

        const result = await apiRequest({
          method: "GET",
          endpoint: "/public",
        });

        expect(mockRequestFn).toHaveBeenCalledWith({
          method: "GET",
          url: "/public",
          headers: {
            "Content-Type": "application/json",
          },
          data: undefined,
          params: undefined,
        });

        expect(result.data).toEqual({ public: true });
      });
    });

    describe("API error scenarios", () => {
      it("should throw error when API returns error response", async () => {
        const axiosError = {
          isAxiosError: true,
          response: {
            status: 400,
            data: { message: "Validation failed" },
          },
          message: "Request failed with status code 400",
        };

        mockRequestFn.mockRejectedValueOnce(axiosError);

        await expect(
          apiRequest({
            method: "POST",
            endpoint: "/users",
            token: "token",
          })
        ).rejects.toEqual(axiosError);
      });

      it("should throw error when API returns 404", async () => {
        const axiosError = {
          isAxiosError: true,
          response: {
            status: 404,
            data: { error: "Not Found" },
          },
          message: "Request failed with status code 404",
        };

        mockRequestFn.mockRejectedValueOnce(axiosError);

        await expect(
          apiRequest({
            method: "GET",
            endpoint: "/users",
            id: 999,
            token: "token",
          })
        ).rejects.toEqual(axiosError);
      });

      it("should throw error when API returns 403 forbidden", async () => {
        const axiosError = {
          isAxiosError: true,
          response: {
            status: 403,
            data: { message: "Forbidden" },
          },
          message: "Request failed with status code 403",
        };

        mockRequestFn.mockRejectedValueOnce(axiosError);

        await expect(
          apiRequest({
            method: "DELETE",
            endpoint: "/users",
            id: 1,
            token: "token",
          })
        ).rejects.toEqual(axiosError);
      });
    });

    describe("Empty response scenarios", () => {
      it("should handle empty response data", async () => {
        const mockResponse = {
          data: null,
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };

        mockRequestFn.mockResolvedValueOnce(mockResponse);

        const result = await apiRequest({
          method: "GET",
          endpoint: "/test",
          token: "token",
        });

        expect(result.data).toBeNull();
        expect(result.status).toBe(200);
      });

      it("should handle empty array response", async () => {
        const mockResponse = {
          data: [],
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };

        mockRequestFn.mockResolvedValueOnce(mockResponse);

        const result = await apiRequest({
          method: "GET",
          endpoint: "/items",
          token: "token",
        });

        expect(result.data).toEqual([]);
        expect(result.status).toBe(200);
      });
    });

    describe("Thrown exception scenarios", () => {
      it("should throw non-axios error", async () => {
        const error = new Error("Connection failed");
        mockRequestFn.mockRejectedValueOnce(error);

        await expect(
          apiRequest({
            method: "GET",
            endpoint: "/test",
            token: "token",
          })
        ).rejects.toThrow("Connection failed");
      });

      it("should throw error when request fails", async () => {
        const error = new Error("Request failed");
        mockRequestFn.mockRejectedValueOnce(error);

        await expect(
          apiRequest({
            method: "POST",
            endpoint: "/test",
            data: { test: "data" },
            token: "token",
          })
        ).rejects.toThrow("Request failed");
      });
    });

    describe("Conditional branches", () => {
      it("should append id to endpoint when id is provided", async () => {
        const mockResponse = {
          data: {},
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };

        mockRequestFn.mockResolvedValueOnce(mockResponse);

        await apiRequest({
          method: "GET",
          endpoint: "/users",
          id: 456,
          token: "token",
        });

        expect(mockRequestFn).toHaveBeenCalledWith(
          expect.objectContaining({
            url: "/users/456",
          })
        );
      });

      it("should use endpoint as is when id is not provided", async () => {
        const mockResponse = {
          data: {},
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };

        mockRequestFn.mockResolvedValueOnce(mockResponse);

        await apiRequest({
          method: "GET",
          endpoint: "/users",
          token: "token",
        });

        expect(mockRequestFn).toHaveBeenCalledWith(
          expect.objectContaining({
            url: "/users",
          })
        );
      });

      it("should include Authorization header when token is provided", async () => {
        const mockResponse = {
          data: {},
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };

        mockRequestFn.mockResolvedValueOnce(mockResponse);

        await apiRequest({
          method: "GET",
          endpoint: "/test",
          token: "my-token",
        });

        expect(mockRequestFn).toHaveBeenCalledWith(
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: "Bearer my-token",
            }),
          })
        );
      });

      it("should not include Authorization header when token is not provided", async () => {
        const mockResponse = {
          data: {},
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };

        mockRequestFn.mockResolvedValueOnce(mockResponse);

        await apiRequest({
          method: "GET",
          endpoint: "/test",
        });

        expect(mockRequestFn).toHaveBeenCalledWith(
          expect.objectContaining({
            headers: expect.not.objectContaining({
              Authorization: expect.anything(),
            }),
          })
        );
      });

      it("should handle string id", async () => {
        const mockResponse = {
          data: {},
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };

        mockRequestFn.mockResolvedValueOnce(mockResponse);

        await apiRequest({
          method: "GET",
          endpoint: "/users",
          id: "abc123",
          token: "token",
        });

        expect(mockRequestFn).toHaveBeenCalledWith(
          expect.objectContaining({
            url: "/users/abc123",
          })
        );
      });

      it("should handle number id", async () => {
        const mockResponse = {
          data: {},
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
          request: {},
        };

        mockRequestFn.mockResolvedValueOnce(mockResponse);

        await apiRequest({
          method: "GET",
          endpoint: "/users",
          id: 789,
          token: "token",
        });

        expect(mockRequestFn).toHaveBeenCalledWith(
          expect.objectContaining({
            url: "/users/789",
          })
        );
      });
    });
  });

});
