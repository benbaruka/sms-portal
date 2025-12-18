// Mock smsApi similar to billingApi
(global as any).__mockSmsApiRequestFn = jest.fn();
(global as any).__mockSmsApi = jest.fn((config: any) => (global as any).__mockSmsApiRequestFn(config));
(global as any).__mockSmsApi.request = (global as any).__mockSmsApiRequestFn;
(global as any).__mockSmsApi.interceptors = {
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
      create: jest.fn(() => (global as any).__mockSmsApi),
    },
    create: jest.fn(() => (global as any).__mockSmsApi),
  };
});

// Reset modules and import after mocking
jest.resetModules();
const { getSmsBaseURL, smsApiRequest, smsApi } = require("../../../../src/controller/api/config/smsApiConfig");

describe("controller/api/config/smsApiConfig.ts - Comprehensive Tests", () => {
  let mockRequestFn: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequestFn = (global as any).__mockSmsApiRequestFn;
  });

  describe("getSmsBaseURL", () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it("should return SMS URL when set and not localhost", () => {
      process.env.NEXT_PUBLIC_SMS_API_BASE_URL = "https://sms-api.production.com";
      process.env.NEXT_PUBLIC_API_BASE_URL = "https://billing-api.production.com";
      delete process.env.JEST_WORKER_ID;
      delete process.env.NODE_ENV;

      const url = getSmsBaseURL();
      expect(url).toBe("https://sms-api.production.com");
    });

    it("should return billing URL when SMS URL is localhost", () => {
      process.env.NEXT_PUBLIC_SMS_API_BASE_URL = "http://localhost:3000";
      process.env.NEXT_PUBLIC_API_BASE_URL = "https://billing-api.production.com";
      delete process.env.JEST_WORKER_ID;

      const url = getSmsBaseURL();
      expect(url).toBe("https://billing-api.production.com");
    });

    it("should return billing URL when SMS URL contains 127.0.0.1", () => {
      process.env.NEXT_PUBLIC_SMS_API_BASE_URL = "http://127.0.0.1:3000";
      process.env.NEXT_PUBLIC_API_BASE_URL = "https://billing-api.production.com";

      const url = getSmsBaseURL();
      expect(url).toBe("https://billing-api.production.com");
    });

    it("should return default in Jest environment when no env vars set", () => {
      delete process.env.NEXT_PUBLIC_SMS_API_BASE_URL;
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
      process.env.JEST_WORKER_ID = "1";

      const url = getSmsBaseURL();
      expect(url).toBe("https://sms-api.test.com");
    });

    it("should return default in test NODE_ENV when no env vars set", () => {
      delete process.env.NEXT_PUBLIC_SMS_API_BASE_URL;
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
      delete process.env.JEST_WORKER_ID;
      process.env.NODE_ENV = "test";

      const url = getSmsBaseURL();
      expect(url).toBe("https://sms-api.test.com");
    });

    it("should throw error in production when no env vars set", () => {
      delete process.env.NEXT_PUBLIC_SMS_API_BASE_URL;
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
      delete process.env.JEST_WORKER_ID;
      process.env.NODE_ENV = "production";

      expect(() => getSmsBaseURL()).toThrow(
        "NEXT_PUBLIC_SMS_API_BASE_URL or NEXT_PUBLIC_API_BASE_URL must be set in .env"
      );
    });
  });

  describe("smsApiRequest", () => {
    const apiKey = "test-api-key-12345";

    describe("Success scenarios", () => {
      it("should successfully make GET request", async () => {
        const mockResponse = {
          data: { success: true, items: [] },
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
        };
        mockRequestFn.mockResolvedValueOnce(mockResponse);

        const result = await smsApiRequest({
          method: "GET",
          endpoint: "/sms/messages",
          apiKey,
        });

        expect(result.data).toEqual({ success: true, items: [] });
        expect(result.status).toBe(200);
        expect(mockRequestFn).toHaveBeenCalledWith({
          method: "GET",
          url: "/sms/messages",
          headers: {
            "Content-Type": "application/json",
            "api-key": apiKey,
          },
          data: undefined,
          params: undefined,
        });
      });

      it("should successfully make POST request with data", async () => {
        const requestData = { message: "Hello", recipient: "+1234567890" };
        const mockResponse = {
          data: { success: true, id: 123 },
          status: 201,
          statusText: "Created",
          headers: {},
          config: {},
        };
        mockRequestFn.mockResolvedValueOnce(mockResponse);

        const result = await smsApiRequest({
          method: "POST",
          endpoint: "/sms/send",
          data: requestData,
          apiKey,
        });

        expect(result.data).toEqual({ success: true, id: 123 });
        expect(mockRequestFn).toHaveBeenCalledWith(
          expect.objectContaining({
            method: "POST",
            data: requestData,
          })
        );
      });

      it("should normalize endpoint without leading slash", async () => {
        const mockResponse = {
          data: { success: true },
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
        };
        mockRequestFn.mockResolvedValueOnce(mockResponse);

        await smsApiRequest({
          method: "GET",
          endpoint: "sms/messages",
          apiKey,
        });

        expect(mockRequestFn).toHaveBeenCalledWith(
          expect.objectContaining({
            url: "/sms/messages",
          })
        );
      });

      it("should handle endpoint with leading slash", async () => {
        const mockResponse = {
          data: { success: true },
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
        };
        mockRequestFn.mockResolvedValueOnce(mockResponse);

        await smsApiRequest({
          method: "GET",
          endpoint: "/sms/messages",
          apiKey,
        });

        expect(mockRequestFn).toHaveBeenCalledWith(
          expect.objectContaining({
            url: "/sms/messages",
          })
        );
      });

      it("should include params in request", async () => {
        const mockResponse = {
          data: { success: true },
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
        };
        mockRequestFn.mockResolvedValueOnce(mockResponse);

        const params = { page: 1, limit: 10, active: true };

        await smsApiRequest({
          method: "GET",
          endpoint: "/sms/messages",
          params,
          apiKey,
        });

        expect(mockRequestFn).toHaveBeenCalledWith(
          expect.objectContaining({
            params,
          })
        );
      });

      it("should work without apiKey", async () => {
        const mockResponse = {
          data: { success: true },
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
        };
        mockRequestFn.mockResolvedValueOnce(mockResponse);

        await smsApiRequest({
          method: "GET",
          endpoint: "/public/info",
        });

        expect(mockRequestFn).toHaveBeenCalledWith(
          expect.objectContaining({
            headers: {
              "Content-Type": "application/json",
            },
          })
        );
      });
    });

    describe("Error scenarios", () => {
      it("should handle 400 Bad Request error", async () => {
        const error = {
          response: {
            status: 400,
            data: { message: "Invalid request" },
          },
        };
        mockRequestFn.mockRejectedValueOnce(error);

        await expect(
          smsApiRequest({
            method: "POST",
            endpoint: "/sms/send",
            data: {},
            apiKey,
          })
        ).rejects.toEqual(error);
      });

      it("should handle 401 Unauthorized error", async () => {
        const error = {
          response: {
            status: 401,
            data: { message: "Invalid API key" },
          },
        };
        mockRequestFn.mockRejectedValueOnce(error);

        await expect(
          smsApiRequest({
            method: "GET",
            endpoint: "/sms/messages",
            apiKey: "invalid-key",
          })
        ).rejects.toEqual(error);
      });

      it("should handle 403 Forbidden error", async () => {
        const error = {
          response: {
            status: 403,
            data: { message: "Access denied" },
          },
        };
        mockRequestFn.mockRejectedValueOnce(error);

        await expect(
          smsApiRequest({
            method: "DELETE",
            endpoint: "/sms/messages/123",
            apiKey,
          })
        ).rejects.toEqual(error);
      });

      it("should handle 404 Not Found error", async () => {
        const error = {
          response: {
            status: 404,
            data: { message: "Message not found" },
          },
        };
        mockRequestFn.mockRejectedValueOnce(error);

        await expect(
          smsApiRequest({
            method: "GET",
            endpoint: "/sms/messages/999",
            apiKey,
          })
        ).rejects.toEqual(error);
      });

      it("should handle 500 Server Error", async () => {
        const error = {
          response: {
            status: 500,
            data: { message: "Internal server error" },
          },
        };
        mockRequestFn.mockRejectedValueOnce(error);

        await expect(
          smsApiRequest({
            method: "POST",
            endpoint: "/sms/send",
            data: {},
            apiKey,
          })
        ).rejects.toEqual(error);
      });

      it("should handle network errors", async () => {
        const error = new Error("Network Error");
        mockRequestFn.mockRejectedValueOnce(error);

        await expect(
          smsApiRequest({
            method: "GET",
            endpoint: "/sms/messages",
            apiKey,
          })
        ).rejects.toThrow("Network Error");
      });

      it("should handle timeout errors", async () => {
        const error = {
          code: "ECONNABORTED",
          message: "timeout of 30000ms exceeded",
        };
        mockRequestFn.mockRejectedValueOnce(error);

        await expect(
          smsApiRequest({
            method: "GET",
            endpoint: "/sms/messages",
            apiKey,
          })
        ).rejects.toEqual(error);
      });
    });

    describe("Different HTTP methods", () => {
      it("should handle PUT request", async () => {
        const mockResponse = {
          data: { success: true, updated: true },
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
        };
        mockRequestFn.mockResolvedValueOnce(mockResponse);

        await smsApiRequest({
          method: "PUT",
          endpoint: "/sms/messages/123",
          data: { status: "read" },
          apiKey,
        });

        expect(mockRequestFn).toHaveBeenCalledWith(
          expect.objectContaining({
            method: "PUT",
          })
        );
      });

      it("should handle DELETE request", async () => {
        const mockResponse = {
          data: { success: true, deleted: true },
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
        };
        mockRequestFn.mockResolvedValueOnce(mockResponse);

        await smsApiRequest({
          method: "DELETE",
          endpoint: "/sms/messages/123",
          apiKey,
        });

        expect(mockRequestFn).toHaveBeenCalledWith(
          expect.objectContaining({
            method: "DELETE",
          })
        );
      });

      it("should handle PATCH request", async () => {
        const mockResponse = {
          data: { success: true, patched: true },
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
        };
        mockRequestFn.mockResolvedValueOnce(mockResponse);

        await smsApiRequest({
          method: "PATCH",
          endpoint: "/sms/messages/123",
          data: { status: "archived" },
          apiKey,
        });

        expect(mockRequestFn).toHaveBeenCalledWith(
          expect.objectContaining({
            method: "PATCH",
          })
        );
      });
    });
  });
});
