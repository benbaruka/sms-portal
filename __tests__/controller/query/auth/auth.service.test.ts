import {
  _login,
  generateApiKey,
  _signup,
  forgotPassword,
  resetPassword,
} from "../../../../src/controller/query/auth/auth.service";

import axios from "axios";

jest.mock("axios");
jest.mock("../../../../src/controller/api/config/baseUrl", () => ({
  baseURL: "https://api.test.com",
}));
jest.mock("../../../../src/controller/api/constant/apiLink", () => ({
  auth: {
    login: "/auth/login",
    gen: "/auth/gen",
    signup: "/auth/signup",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
  },
}));

describe("controller/query/auth/auth.service.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(_login).toBeDefined();
    expect(generateApiKey).toBeDefined();
    expect(_signup).toBeDefined();
    expect(forgotPassword).toBeDefined();
    expect(resetPassword).toBeDefined();
  });

  describe("_login", () => {
    it("successfully logs in and generates API key", async () => {
      jest.mocked(axios.post).mockResolvedValue({
        data: { message: { token: "jwt-token-123" } },
      } as any);
      jest.mocked(axios.get).mockResolvedValue({
        data: { token: "api-key-123" },
      } as any);

      const result = await _login({ email: "test@test.com", password: "password" });

      expect(result).toBeDefined();
      expect(result?.apiKey).toBe("api-key-123");
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/auth/login"),
        { email: "test@test.com", password: "password" },
        expect.any(Object)
      );
      expect(axios.get).toHaveBeenCalled();
    });

    it("handles token with Bearer prefix", async () => {
      jest.mocked(axios.post).mockResolvedValue({
        data: { message: { token: "Bearer jwt-token-123" } },
      } as any);
      jest.mocked(axios.get).mockResolvedValue({
        data: { token: "api-key-123" },
      } as any);

      await _login({ email: "test@test.com", password: "password" });

      expect(axios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "jwt-token-123",
          }),
        })
      );
    });

    it("throws error when token is missing", async () => {
      jest.mocked(axios.post).mockResolvedValue({
        data: { message: {} },
      } as any);

      await expect(_login({ email: "test@test.com", password: "password" })).rejects.toThrow(
        "Token missing after login"
      );
    });

    it("handles 401 error", async () => {
      jest.mocked(axios.post).mockRejectedValue({
        isAxiosError: true,
        response: { status: 401, data: { message: "Invalid credentials" } },
      });

      await expect(_login({ email: "test@test.com", password: "password" })).rejects.toThrow(
        "Invalid email/phone or password"
      );
    });

    it("handles 404 error", async () => {
      jest.mocked(axios.post).mockRejectedValue({
        isAxiosError: true,
        response: { status: 404, data: { message: "User not found" } },
      });

      await expect(_login({ email: "test@test.com", password: "password" })).rejects.toThrow(
        "User not found"
      );
    });

    it("handles 422 error with account not verified", async () => {
      const credentials = { email: "test@test.com", password: "password" };
      jest.mocked(axios.post).mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 422,
          data: { message: "Account is not verified. Please verify your account." },
        },
      });

      try {
        await _login(credentials);
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.isAccountNotVerified).toBe(true);
        expect(error.credentials).toEqual(credentials);
      }
    });

    it("handles 422 error with different verification message variants", async () => {
      const credentials = { email: "test@test.com", password: "password" };
      const variants = [
        "account is not verified",
        "not verified",
        "verify your account",
        "please verify",
        "otp code sent",
        "resend otp",
      ];

      for (const variant of variants) {
        jest.mocked(axios.post).mockRejectedValueOnce({
          isAxiosError: true,
          response: {
            status: 422,
            data: { message: variant },
          },
        });

        try {
          await _login(credentials);
          expect.fail("Should have thrown an error");
        } catch (error: any) {
          expect(error.isAccountNotVerified).toBe(true);
        }
      }
    });

    it("handles network error", async () => {
      jest.mocked(axios.post).mockRejectedValue({
        isAxiosError: true,
        request: {},
      });

      await expect(_login({ email: "test@test.com", password: "password" })).rejects.toThrow();
    });

    it("handles error when API key generation fails", async () => {
      jest.mocked(axios.post).mockResolvedValue({
        data: { message: { token: "jwt-token-123" } },
      } as any);
      jest.mocked(axios.get).mockResolvedValue({
        data: null,
      } as any);

      await expect(_login({ email: "test@test.com", password: "password" })).rejects.toThrow(
        "Error fetching histories"
      );
    });
  });

  describe("generateApiKey", () => {
    it("generates API key successfully", async () => {
      jest.mocked(axios.get).mockResolvedValue({
        data: { token: "api-key-123" },
      } as any);

      const result = await generateApiKey("token-123");
      expect(result).toBe("api-key-123");
    });

    it("handles error when response data is missing", async () => {
      jest.mocked(axios.get).mockResolvedValue({
        data: null,
      } as any);

      await expect(generateApiKey("token-123")).rejects.toThrow("Error generating API key");
    });
  });

  describe("_signup", () => {
    it("throws error when required fields are missing", async () => {
      await expect(_signup({} as any)).rejects.toThrow("All fields are required for signup");
    });

    it("throws error for invalid email format", async () => {
      await expect(
        _signup({
          company_name: "Test",
          full_name: "Test User",
          msisdn: "+1234567890",
          email: "invalid-email",
          country_code: "US",
          address: "123 Main St",
          password: "password123",
        })
      ).rejects.toThrow("Invalid email format");
    });

    it("throws error when phone number doesn't start with +", async () => {
      await expect(
        _signup({
          company_name: "Test",
          full_name: "Test User",
          msisdn: "1234567890",
          email: "test@test.com",
          country_code: "US",
          address: "123 Main St",
          password: "password123",
        })
      ).rejects.toThrow("Phone number must include country code");
    });
  });

  describe("forgotPassword", () => {
    it("throws error when email is empty", async () => {
      await expect(forgotPassword("")).rejects.toThrow("Email is required");
    });

    it("throws error for invalid email format", async () => {
      await expect(forgotPassword("invalid-email")).rejects.toThrow("Invalid email format");
    });

    it("handles 404 error", async () => {
      jest.mocked(axios.post).mockRejectedValue({
        isAxiosError: true,
        response: { status: 404, data: { message: "User not found" } },
      });

      await expect(forgotPassword("test@test.com")).rejects.toThrow(
        "No account found with this email"
      );
    });
  });

  describe("resetPassword", () => {
    it("throws error when token is empty", async () => {
      await expect(resetPassword("", "newpassword")).rejects.toThrow("Reset token is required");
    });

    it("throws error when password is too short", async () => {
      await expect(resetPassword("token-123", "12345")).rejects.toThrow(
        "Password must contain at least 6 characters"
      );
    });

    it("handles 401 error", async () => {
      jest.mocked(axios.post).mockRejectedValue({
        isAxiosError: true,
        response: { status: 401, data: { message: "Invalid token" } },
      });

      await expect(resetPassword("token-123", "newpassword123")).rejects.toThrow(
        "Invalid or expired token"
      );
    });
  });
});
