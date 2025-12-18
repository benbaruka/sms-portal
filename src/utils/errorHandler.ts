import axios from "axios";

/**
 * Handle axios errors and throw appropriate error messages
 * @param error - The error object (unknown type)
 * @param fallbackMessage - The fallback message to use if error details are not available
 */
export const handleAxiosError = (error: unknown, fallbackMessage: string): never => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      throw new Error(error.response.data?.message || fallbackMessage);
    }
    if (error.request) {
      throw new Error("No server response. Please check your internet connection.");
    }
  }
  throw new Error(fallbackMessage);
};
