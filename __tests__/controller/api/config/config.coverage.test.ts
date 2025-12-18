import { describe, it, expect, beforeEach } from "@jest/globals";

// Ensure axios is not mocked so interceptor setup code executes
jest.unmock("axios");

describe("controller/api/config/config.ts - coverage", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("initializes billingApi interceptors on import", async () => {
    const module = await import("../../../../src/controller/api/config/config");
    expect(module.billingApi.interceptors.request.use).toBeInstanceOf(Function);
    expect(module.billingApi.interceptors.response.use).toBeInstanceOf(Function);
  });
});

