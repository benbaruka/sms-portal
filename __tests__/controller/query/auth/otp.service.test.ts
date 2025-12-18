import { verifyOtp, resendOtp } from "../../../../src/controller/query/auth/otp.service";

import axios from "axios";

jest.mock("axios");
jest.mock("../../../../src/controller/api/config/baseUrl", () => ({
  baseURL: "https://api.test.com",
}));
jest.mock("../../../../src/controller/api/constant/apiLink", () => ({
  auth: {
    verifyOtp: "/auth/verify-otp",
    resendOtp: "/auth/resend-otp",
  },
}));

describe("controller/query/auth/otp.service.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(verifyOtp).toBeDefined();
    expect(resendOtp).toBeDefined();
    expect(typeof verifyOtp).toBe("function");
    expect(typeof resendOtp).toBe("function");
  });

  describe("verifyOtp", () => {
    it("throws error when email and msisdn are missing", async () => {
      await expect(verifyOtp({ verification_code: "123456" } as any)).rejects.toThrow(
        "Email or phone number is required"
      );
    });

    it("throws error when verification_code is missing", async () => {
      await expect(verifyOtp({ email: "test@test.com" } as any)).rejects.toThrow(
        "Verification code is required"
      );
    });

    it("verifies OTP successfully", async () => {
      jest.mocked(axios.post).mockResolvedValue({
        data: { status: 200, message: "OTP verified" },
      } as any);

      const result = await verifyOtp({
        email: "test@test.com",
        verification_code: "123456",
      });

      expect(result).toBeDefined();
    });

    it("handles 400 error", async () => {
      jest.mocked(axios.post).mockRejectedValue({
        isAxiosError: true,
        response: { status: 400, data: { message: "Invalid code" } },
      });

      await expect(
        verifyOtp({ email: "test@test.com", verification_code: "123456" })
      ).rejects.toThrow("Invalid code");
    });
  });

  describe("resendOtp", () => {
    it("throws error when email and msisdn are missing", async () => {
      await expect(resendOtp({} as any)).rejects.toThrow("Email or phone number is required");
    });

    it("resends OTP successfully", async () => {
      jest.mocked(axios.post).mockResolvedValue({
        data: { status: 200, message: "OTP resent" },
      } as any);

      const result = await resendOtp({
        email: "test@test.com",
      });

      expect(result).toBeDefined();
    });

    it("handles network error", async () => {
      jest.mocked(axios.post).mockRejectedValue({
        isAxiosError: true,
        request: {},
      });

      await expect(resendOtp({ email: "test@test.com" })).rejects.toThrow("No server response");
    });
  });
});
