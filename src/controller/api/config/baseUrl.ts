export const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getBillingBaseURL = () => {
  const billingUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Check if we're in a Jest/test environment
  const isJestEnvironment =
    typeof process !== "undefined" &&
    (process.env.JEST_WORKER_ID !== undefined ||
      process.env.NODE_ENV === "test" ||
      (typeof global !== "undefined" && "jest" in global));

  if (billingUrl) {
    return billingUrl;
  }

  // If no env var is set, provide defaults for non-production environments
  // In Jest/test environment, always use default
  if (isJestEnvironment) {
    return "https://api.test.com";
  }

  // Only throw error in explicit production environment
  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_API_BASE_URL must be set in .env");
  }

  // Default for development/undefined environments
  return "https://api.test.com";
};

// Re-export getSmsBaseURL from smsApiConfig
export { getSmsBaseURL } from "./smsApiConfig";
