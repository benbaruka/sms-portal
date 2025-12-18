import axios from "axios";
import { auth } from "../../api/constant/apiLink";
import { VerifyOtpRequest, VerifyOtpResponse, ResendOtpRequest, ResendOtpResponse } from "@/types";
import { baseURL } from "@/controller/api/config/baseUrl";

const handleAxiosError = (error: unknown, fallbackMessage: string) => {
  // If it's already an Error (not an Axios error), re-throw it
  if (error instanceof Error && !axios.isAxiosError(error)) {
    throw error;
  }

  // Check for axios error structure (works with both real and mocked axios errors)
  const axiosError = error as any;

  // Check if error has a response property (works for both real and mocked axios errors)
  if (axiosError && typeof axiosError === "object" && axiosError.response) {
    const status = axiosError.response.status;
    const errorData = axiosError.response.data;
    let message = fallbackMessage;

    if (typeof errorData === "string") {
      message = errorData;
    } else if (typeof errorData === "object" && errorData !== null) {
      const errorObj = errorData as { message?: string; error?: string };
      message = errorObj.message || errorObj.error || message;
    }

    if (status === 400) {
      throw new Error(message || "Invalid request body");
    } else if (status === 404) {
      throw new Error(message || "User not found");
    } else if (status === 422) {
      throw new Error(message || "Validation error");
    } else if (status === 500) {
      throw new Error(message || "Internal server error");
    } else {
      throw new Error(message);
    }
  }

  // Handle network errors (request made but no response)
  if (axiosError && typeof axiosError === "object" && axiosError.request && !axiosError.response) {
    throw new Error("No server response");
  }

  throw new Error(fallbackMessage);
};

export const verifyOtp = async (data: VerifyOtpRequest): Promise<VerifyOtpResponse | undefined> => {
  try {
    if (!data.email && !data.msisdn) {
      throw new Error("Email or phone number is required");
    }
    if (!data.verification_code) {
      throw new Error("Verification code is required");
    }

    const response = await axios.post<VerifyOtpResponse>(`${baseURL}${auth.verifyOtp}`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response?.data) {
      throw new Error("No server response for OTP verification.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error verifying OTP code.");
  }
};

export const resendOtp = async (data: ResendOtpRequest): Promise<ResendOtpResponse | undefined> => {
  try {
    if (!data.email && !data.msisdn) {
      throw new Error("Email or phone number is required");
    }

    const response = await axios.post<ResendOtpResponse>(`${baseURL}${auth.resendOtp}`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response?.data) {
      throw new Error("No server response for resending OTP.");
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error resending OTP code.");
  }
};
