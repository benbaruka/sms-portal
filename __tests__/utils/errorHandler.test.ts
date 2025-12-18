import axios from "axios";

import { handleAxiosError } from "../../src/utils/errorHandler";

describe("utils/errorHandler.ts", () => {
  it("module loads", () => {
    expect(handleAxiosError).toBeDefined();
    expect(typeof handleAxiosError).toBe("function");
  });

  it("throws error with response data message", () => {
    const error = {
      response: {
        data: {
          message: "Custom error message",
        },
      },
      isAxiosError: true,
    };

    // Mock isAxiosError to return true for this error
    jest.spyOn(axios, "isAxiosError").mockReturnValue(true);

    expect(() => {
      handleAxiosError(error, "Fallback message");
    }).toThrow("Custom error message");
  });

  it("throws fallback message when response has no message", () => {
    const error = {
      response: {
        data: {},
      },
      isAxiosError: true,
    };

    jest.spyOn(axios, "isAxiosError").mockReturnValue(true);

    expect(() => {
      handleAxiosError(error, "Fallback message");
    }).toThrow("Fallback message");
  });

  it("throws network error message for request without response", () => {
    const error = {
      request: {},
      isAxiosError: true,
    };

    jest.spyOn(axios, "isAxiosError").mockReturnValue(true);

    expect(() => {
      handleAxiosError(error, "Fallback message");
    }).toThrow("No server response. Please check your internet connection.");
  });

  it("throws fallback message for axios error without response or request", () => {
    const error = {
      isAxiosError: true,
    };

    jest.spyOn(axios, "isAxiosError").mockReturnValue(true);

    expect(() => {
      handleAxiosError(error, "Fallback message");
    }).toThrow("Fallback message");
  });

  it("throws fallback message for non-axios errors", () => {
    const error = new Error("Some error");

    jest.spyOn(axios, "isAxiosError").mockReturnValue(false);

    expect(() => {
      handleAxiosError(error, "Fallback message");
    }).toThrow("Fallback message");
  });
});
