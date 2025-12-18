// Comprehensive tests for baseUrl.ts
describe("controller/api/config/baseUrl.ts - Comprehensive Tests", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    jest.resetModules();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe("baseURL export", () => {
    it("should export NEXT_PUBLIC_API_BASE_URL when set", () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
      const { baseURL } = require("../../../../src/controller/api/config/baseUrl");
      expect(baseURL).toBe("https://api.example.com");
    });

    it("should be undefined when NEXT_PUBLIC_API_BASE_URL is not set", () => {
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
      const { baseURL } = require("../../../../src/controller/api/config/baseUrl");
      expect(baseURL).toBeUndefined();
    });
  });

  describe("getBillingBaseURL", () => {
    describe("Success scenarios", () => {
      it("should return NEXT_PUBLIC_API_BASE_URL when set", () => {
        process.env.NEXT_PUBLIC_API_BASE_URL = "https://billing.example.com";
        const { getBillingBaseURL } = require("../../../../src/controller/api/config/baseUrl");
        expect(getBillingBaseURL()).toBe("https://billing.example.com");
      });

      it("should return default URL in Jest environment when env var not set", () => {
        delete process.env.NEXT_PUBLIC_API_BASE_URL;
        process.env.JEST_WORKER_ID = "1";
        const { getBillingBaseURL } = require("../../../../src/controller/api/config/baseUrl");
        expect(getBillingBaseURL()).toBe("https://api.test.com");
      });

      it("should return default URL in test NODE_ENV when env var not set", () => {
        delete process.env.NEXT_PUBLIC_API_BASE_URL;
        delete process.env.JEST_WORKER_ID;
        process.env.NODE_ENV = "test";
        const { getBillingBaseURL } = require("../../../../src/controller/api/config/baseUrl");
        expect(getBillingBaseURL()).toBe("https://api.test.com");
      });

      it("should return default URL in development when env var not set", () => {
        delete process.env.NEXT_PUBLIC_API_BASE_URL;
        delete process.env.JEST_WORKER_ID;
        process.env.NODE_ENV = "development";
        const { getBillingBaseURL } = require("../../../../src/controller/api/config/baseUrl");
        expect(getBillingBaseURL()).toBe("https://api.test.com");
      });

      it("should return default URL when NODE_ENV is undefined", () => {
        delete process.env.NEXT_PUBLIC_API_BASE_URL;
        delete process.env.JEST_WORKER_ID;
        delete process.env.NODE_ENV;
        const { getBillingBaseURL } = require("../../../../src/controller/api/config/baseUrl");
        expect(getBillingBaseURL()).toBe("https://api.test.com");
      });
    });

    describe("Error scenarios", () => {
      it("should throw error in production when env var not set", () => {
        delete process.env.NEXT_PUBLIC_API_BASE_URL;
        delete process.env.JEST_WORKER_ID;
        process.env.NODE_ENV = "production";
        const { getBillingBaseURL } = require("../../../../src/controller/api/config/baseUrl");
        expect(() => getBillingBaseURL()).toThrow("NEXT_PUBLIC_API_BASE_URL must be set in .env");
      });
    });

    describe("Conditional branches", () => {
      it("should detect Jest environment via JEST_WORKER_ID", () => {
        delete process.env.NEXT_PUBLIC_API_BASE_URL;
        process.env.JEST_WORKER_ID = "2";
        process.env.NODE_ENV = "production"; // Even in production, Jest env takes precedence
        const { getBillingBaseURL } = require("../../../../src/controller/api/config/baseUrl");
        expect(getBillingBaseURL()).toBe("https://api.test.com");
      });

      it("should detect Jest environment via NODE_ENV=test", () => {
        delete process.env.NEXT_PUBLIC_API_BASE_URL;
        delete process.env.JEST_WORKER_ID;
        process.env.NODE_ENV = "test";
        const { getBillingBaseURL } = require("../../../../src/controller/api/config/baseUrl");
        expect(getBillingBaseURL()).toBe("https://api.test.com");
      });

      it("should detect Jest environment via global.jest", () => {
        delete process.env.NEXT_PUBLIC_API_BASE_URL;
        delete process.env.JEST_WORKER_ID;
        delete process.env.NODE_ENV;
        (global as any).jest = {};
        const { getBillingBaseURL } = require("../../../../src/controller/api/config/baseUrl");
        const result = getBillingBaseURL();
        delete (global as any).jest;
        expect(result).toBe("https://api.test.com");
      });

      it("should prioritize env var over Jest environment detection", () => {
        process.env.NEXT_PUBLIC_API_BASE_URL = "https://custom.api.com";
        process.env.JEST_WORKER_ID = "1";
        const { getBillingBaseURL } = require("../../../../src/controller/api/config/baseUrl");
        expect(getBillingBaseURL()).toBe("https://custom.api.com");
      });
    });
  });

  describe("getSmsBaseURL re-export", () => {
    it("should re-export getSmsBaseURL from smsApiConfig", () => {
      process.env.NEXT_PUBLIC_SMS_API_BASE_URL = "https://sms.example.com";
      const { getSmsBaseURL } = require("../../../../src/controller/api/config/baseUrl");
      expect(typeof getSmsBaseURL).toBe("function");
      expect(getSmsBaseURL()).toBe("https://sms.example.com");
    });
  });
});


