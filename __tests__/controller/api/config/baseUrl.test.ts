import {
  baseURL,
  getBillingBaseURL,
  getSmsBaseURL,
} from "../../../../src/controller/api/config/baseUrl";

describe("controller/api/config/baseUrl.ts", () => {
  const originalEnv = process.env;
  const originalGlobal = global;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    global = { ...originalGlobal } as typeof global;
  });

  afterEach(() => {
    process.env = originalEnv;
    global = originalGlobal;
  });

  describe("baseURL", () => {
    it("module loads", () => {
      expect(baseURL).toBeDefined();
    });

    it("returns NEXT_PUBLIC_API_BASE_URL from env", () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
      jest.resetModules();
      const { baseURL: newBaseURL } = require("../../../../src/controller/api/config/baseUrl");
      expect(newBaseURL).toBe("https://api.example.com");
    });
  });

  describe("getBillingBaseURL", () => {
    it("module loads", () => {
      expect(getBillingBaseURL).toBeDefined();
      expect(typeof getBillingBaseURL).toBe("function");
    });

    it("returns billing URL from env when set", () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = "https://billing.example.com";
      const result = getBillingBaseURL();
      expect(result).toBe("https://billing.example.com");
    });

    it("returns default in Jest environment when no env var", () => {
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
      process.env.JEST_WORKER_ID = "1";
      const result = getBillingBaseURL();
      expect(result).toBe("https://api.test.com");
    });

    it("returns default in test NODE_ENV when no env var", () => {
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
      delete process.env.JEST_WORKER_ID;
      process.env.NODE_ENV = "test";
      const result = getBillingBaseURL();
      expect(result).toBe("https://api.test.com");
    });

    it("returns default in development when no env var", () => {
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
      delete process.env.JEST_WORKER_ID;
      process.env.NODE_ENV = "development";
      const result = getBillingBaseURL();
      expect(result).toBe("https://api.test.com");
    });

    it("throws error in production when no env var", () => {
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
      delete process.env.JEST_WORKER_ID;
      process.env.NODE_ENV = "production";
      expect(() => getBillingBaseURL()).toThrow("NEXT_PUBLIC_API_BASE_URL must be set in .env");
    });
  });

  describe("getSmsBaseURL", () => {
    it("module loads", () => {
      expect(getSmsBaseURL).toBeDefined();
      expect(typeof getSmsBaseURL).toBe("function");
    });

    it("returns SMS URL from env when set and not localhost", () => {
      process.env.NEXT_PUBLIC_SMS_API_BASE_URL = "https://sms.example.com";
      const result = getSmsBaseURL();
      expect(result).toBe("https://sms.example.com");
    });

    it("returns billing URL when SMS URL is localhost", () => {
      process.env.NEXT_PUBLIC_SMS_API_BASE_URL = "http://localhost:3000";
      process.env.NEXT_PUBLIC_API_BASE_URL = "https://billing.example.com";
      const result = getSmsBaseURL();
      expect(result).toBe("https://billing.example.com");
    });

    it("returns billing URL when SMS URL not set", () => {
      delete process.env.NEXT_PUBLIC_SMS_API_BASE_URL;
      process.env.NEXT_PUBLIC_API_BASE_URL = "https://billing.example.com";
      const result = getSmsBaseURL();
      expect(result).toBe("https://billing.example.com");
    });

    it("returns default in Jest environment when no env vars", () => {
      delete process.env.NEXT_PUBLIC_SMS_API_BASE_URL;
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
      process.env.JEST_WORKER_ID = "1";
      const result = getSmsBaseURL();
      expect(result).toBe("https://sms-api.test.com");
    });

    it("returns default in test NODE_ENV when no env vars", () => {
      delete process.env.NEXT_PUBLIC_SMS_API_BASE_URL;
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
      delete process.env.JEST_WORKER_ID;
      process.env.NODE_ENV = "test";
      const result = getSmsBaseURL();
      expect(result).toBe("https://sms-api.test.com");
    });

    it("returns default in development when no env vars", () => {
      delete process.env.NEXT_PUBLIC_SMS_API_BASE_URL;
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
      delete process.env.JEST_WORKER_ID;
      process.env.NODE_ENV = "development";
      const result = getSmsBaseURL();
      expect(result).toBe("https://sms-api.test.com");
    });

    it("throws error in production when no env vars", () => {
      delete process.env.NEXT_PUBLIC_SMS_API_BASE_URL;
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
      delete process.env.JEST_WORKER_ID;
      process.env.NODE_ENV = "production";
      expect(() => getSmsBaseURL()).toThrow(
        "NEXT_PUBLIC_SMS_API_BASE_URL or NEXT_PUBLIC_API_BASE_URL must be set in .env"
      );
    });

    it("returns fallback when both URLs are set but SMS is localhost", () => {
      process.env.NEXT_PUBLIC_SMS_API_BASE_URL = "http://127.0.0.1:3000";
      process.env.NEXT_PUBLIC_API_BASE_URL = "https://billing.example.com";
      const result = getSmsBaseURL();
      expect(result).toBe("https://billing.example.com");
    });
  });
});
