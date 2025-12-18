import axios from "axios";
import { auth } from "../../api/constant/apiLink";
import {
  CredentialsAuthWithPwd,
  ResponseLog,
  SignupData,
  ForgotPasswordResponse,
  ResetPasswordResponse,
} from "@/types";
import { baseURL } from "@/controller/api/config/baseUrl";

interface ErrorResponse {
  message?: string;
  error?: string;
  [key: string]: unknown;
}
export const _login = async (
  itemData: CredentialsAuthWithPwd
): Promise<ResponseLog | undefined> => {
  try {
    const response = await axios.post<ResponseLog>(`${baseURL}${auth?.login}`, itemData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const token = response?.data?.message?.token;
    if (!token) {
      throw new Error("Token missing after login");
    }
    // Le backend GetToken() retourne le token tel quel depuis Authorization header
    // checkAuthApi() valide le JWT, donc on doit envoyer juste le token JWT sans "Bearer"
    // car le backend ne retire pas "Bearer" avant de valider
    const historyRes = await axios.get(`${baseURL}${auth?.gen}`, {
      headers: {
        "Content-Type": "application/json",
        // Envoyer juste le token JWT, pas "Bearer {token}" car le backend valide le token tel quel
        Authorization: token.startsWith("Bearer ") ? token.replace("Bearer ", "") : token,
      },
    });

    if (!historyRes.data) {
      throw new Error("Error fetching histories");
    }
    const histories = historyRes.data;
    const apiKey = histories?.token || null;
    return {
      ...response.data,
      histories: histories,
      apiKey: apiKey,
    };
  } catch (error) {
    // Check if it's an Error instance (like validation errors) and re-throw
    if (error instanceof Error && !axios.isAxiosError(error)) {
      throw error;
    }

    // Check for axios error structure (works with both real and mocked axios errors)
    const axiosError = error as any;

    // Check if error has a response property (works for both real and mocked axios errors)
    if (axiosError && typeof axiosError === "object" && axiosError.response) {
      const status = axiosError.response.status;
      const errorData = axiosError.response.data;
      let message = "Authentication error";
      if (typeof errorData === "string") {
        message = errorData;
      } else if (typeof errorData === "object" && errorData !== null) {
        message = errorData.message || errorData.error || message;
      }
      if (status === 401) {
        throw new Error("Invalid email/phone or password");
      } else if (status === 404) {
        throw new Error("User not found");
      } else if (status === 422) {
        // Vérifier si c'est l'erreur "account is not verified"
        const lowerMessage = message.toLowerCase();

        // Vérifier plusieurs variantes du message d'erreur
        const isAccountNotVerified =
          lowerMessage.includes("account is not verified") ||
          lowerMessage.includes("not verified") ||
          lowerMessage.includes("verify your account") ||
          lowerMessage.includes("please verify") ||
          lowerMessage.includes("otp code sent") ||
          lowerMessage.includes("resend otp");

        if (isAccountNotVerified) {
          // Créer une exception spéciale avec les credentials pour redirection vers OTP
          const accountNotVerifiedError = new Error(message) as Error & {
            isAccountNotVerified: boolean;
            credentials: CredentialsAuthWithPwd;
          };
          accountNotVerifiedError.isAccountNotVerified = true;
          accountNotVerifiedError.credentials = itemData;
          throw accountNotVerifiedError;
        }
        throw new Error(`Validation error: ${message}`);
      } else if (status === 500) {
        throw new Error("Server error. Please try again later.");
      } else {
        throw new Error(message);
      }
      return; // Exit early if we handled the error
    }

    // Handle network errors (request made but no response)
    if (
      axiosError &&
      typeof axiosError === "object" &&
      axiosError.request &&
      !axiosError.response
    ) {
      throw new Error("No server response. Please check your internet connection.");
    }

    // Re-throw if it's already an Error
    if (error instanceof Error) {
      throw error;
    }

    // Fallback for unexpected errors
    throw new Error("Server error during authentication.");
  }
};
export const generateApiKey = async (token: string): Promise<string | undefined> => {
  try {
    // Le backend GetToken() retourne le token tel quel depuis Authorization header
    // checkAuthApi() valide le JWT, donc on doit envoyer juste le token JWT sans "Bearer"
    // car le backend ne retire pas "Bearer" avant de valider le JWT
    const response = await axios.get(`${baseURL}${auth?.gen}`, {
      headers: {
        "Content-Type": "application/json",
        // Envoyer juste le token JWT, pas "Bearer {token}" car le backend valide le token tel quel
        Authorization: token.startsWith("Bearer ") ? token.replace("Bearer ", "") : token,
      },
    });
    if (!response.data) {
      throw new Error("Error generating API key");
    }
    const data = response.data;
    return data?.token || null;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const errorMessage =
          error.response.data?.message || error.response.data?.error || "Error generating API key";
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Server error during API key generation.");
  }
};
export const _signup = async (itemData: SignupData): Promise<ResponseLog | undefined> => {
  try {
    if (
      !itemData.company_name ||
      !itemData.full_name ||
      !itemData.msisdn ||
      !itemData.email ||
      !itemData.country_code ||
      !itemData.address ||
      !itemData.password
    ) {
      throw new Error("All fields are required for signup.");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(itemData.email)) {
      throw new Error("Invalid email format.");
    }
    if (!itemData.msisdn.startsWith("+")) {
      throw new Error("Phone number must include country code (e.g., +254712345678).");
    }
    const response = await axios.post<ResponseLog>(`${baseURL}${auth?.signup}`, itemData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response?.data) {
      throw new Error("No server response after account creation.");
    }
    if (response.status === 201) {
      return response.data;
    } else if (response.status === 400) {
      const errorMessage =
        typeof response.data === "object" && response.data !== null
          ? (response.data as unknown as ErrorResponse).message ||
            "Validation error. Please check your data."
          : "Validation error. Please check your data.";
      throw new Error(errorMessage);
    } else if (response.status === 422) {
      const errorMessage =
        typeof response.data === "object" && response.data !== null
          ? (response.data as unknown as ErrorResponse).message || "Invalid data format."
          : "Invalid data format.";
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        let message = "Signup error.";
        if (typeof errorData === "string") {
          message = errorData;
        } else if (typeof errorData === "object" && errorData !== null) {
          const errorObj = errorData as ErrorResponse;
          message = errorObj.message || errorObj.error || message;
        }
        if (status === 400) {
          throw new Error(`Validation failed: ${message}`);
        } else if (status === 401) {
          throw new Error("Unauthorized. Please check your credentials.");
        } else if (status === 409) {
          throw new Error("An account with this email or phone number already exists.");
        } else if (status === 422) {
          throw new Error(`Invalid data format: ${message}`);
        } else if (status === 500) {
          throw new Error("Server error. Please try again later.");
        } else {
          throw new Error(message);
        }
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      } else {
        throw new Error(error.message || "Request configuration error.");
      }
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Server error during signup.");
  }
};
export const forgotPassword = async (
  email: string
): Promise<ForgotPasswordResponse | undefined> => {
  try {
    if (!email || email.trim() === "") {
      throw new Error("Email is required.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      throw new Error("Invalid email format.");
    }

    // Le backend attend { email: string } ou { msisdn: string } ou les deux
    // S'assurer que l'email est en minuscules et sans espaces
    const cleanedEmail = email.trim().toLowerCase();

    // NOTE: Il y a un bug dans le backend (user_view.go ligne 117)
    // Le backend vérifie IsValidEmail(msisdn) au lieu de IsValidEmail(email)
    // On envoie seulement email, sans msisdn, pour que le backend utilise le bon chemin
    const requestBody: { email: string } = {
      email: cleanedEmail,
    };

    // Debug: logger la requête en développement

    const response = await axios.post<ForgotPasswordResponse>(
      `${baseURL}${auth.forgotPassword}`,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response?.data) {
      throw new Error("No server response for password reset request.");
    }
    return response.data;
  } catch (error) {
    // Check if it's an Error instance (like validation errors) and re-throw
    if (error instanceof Error && !axios.isAxiosError(error)) {
      throw error;
    }

    // Check for axios error structure (works with both real and mocked axios errors)
    const axiosError = error as any;

    // Check if error has a response property (works for both real and mocked axios errors)
    if (axiosError && typeof axiosError === "object" && axiosError.response) {
      const status = axiosError.response.status;
      const errorData = axiosError.response.data;
      let message = "Error requesting password reset.";
      if (typeof errorData === "string") {
        message = errorData;
      } else if (typeof errorData === "object" && errorData !== null) {
        const errorObj = errorData as ErrorResponse;
        message = errorObj.message || errorObj.error || message;
      }
      if (status === 400) {
        throw new Error(`Validation failed: ${message}`);
      } else if (status === 404) {
        throw new Error("No account found with this email");
      } else if (status === 422) {
        // Le backend retourne 422 avec "Missing email or mobile number" si l'utilisateur n'existe pas
        if (message.toLowerCase().includes("missing email or mobile number")) {
          throw new Error(
            "No account found with this email address. Please check your email and try again."
          );
        }
        throw new Error(message);
      } else if (status === 500) {
        throw new Error("Server error. Please try again later.");
      } else {
        throw new Error(message);
      }
      return; // Exit early if we handled the error
    }

    // Handle network errors (request made but no response)
    if (
      axiosError &&
      typeof axiosError === "object" &&
      axiosError.request &&
      !axiosError.response
    ) {
      throw new Error("No server response. Please check your internet connection.");
    }

    // Re-throw if it's already an Error
    if (error instanceof Error) {
      throw error;
    }

    // Fallback for unexpected errors
    throw new Error("Server error during password reset request.");
  }
};
export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<ResetPasswordResponse | undefined> => {
  try {
    if (!token || token.trim() === "") {
      throw new Error("Reset token is required.");
    }
    if (!newPassword || newPassword.length < 6) {
      throw new Error("Password must contain at least 6 characters.");
    }
    const response = await axios.post<ResetPasswordResponse>(
      `${baseURL}${auth.resetPassword}`,
      {
        token,
        new_password: newPassword,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response?.data) {
      throw new Error("No server response for password reset.");
    }
    return response.data;
  } catch (error) {
    // Check if it's an Error instance (like validation errors) and re-throw
    if (error instanceof Error && !axios.isAxiosError(error)) {
      throw error;
    }

    // Check for axios error structure (works with both real and mocked axios errors)
    const axiosError = error as any;

    // Check if error has a response property (works for both real and mocked axios errors)
    if (axiosError && typeof axiosError === "object" && axiosError.response) {
      const status = axiosError.response.status;
      const errorData = axiosError.response.data;
      let message = "Error resetting password.";
      if (typeof errorData === "string") {
        message = errorData;
      } else if (typeof errorData === "object" && errorData !== null) {
        const errorObj = errorData as ErrorResponse;
        message = errorObj.message || errorObj.error || message;
      }
      if (status === 400) {
        throw new Error(`Validation failed: ${message}`);
      } else if (status === 401) {
        throw new Error("Invalid or expired token");
      } else if (status === 404) {
        throw new Error("Reset token not found.");
      } else if (status === 500) {
        throw new Error("Server error. Please try again later.");
      } else {
        throw new Error(message);
      }
      return; // Exit early if we handled the error
    }

    // Handle network errors (request made but no response)
    if (
      axiosError &&
      typeof axiosError === "object" &&
      axiosError.request &&
      !axiosError.response
    ) {
      throw new Error("No server response. Please check your internet connection.");
    }

    // Re-throw if it's already an Error
    if (error instanceof Error) {
      throw error;
    }

    // Fallback for unexpected errors
    throw new Error("Server error during password reset.");
  }
};
