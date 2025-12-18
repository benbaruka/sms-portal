import { useMutation } from "@tanstack/react-query";
import { useAlert } from "@/context/AlertProvider";
import { smsApiRequest } from "../../api/config/smsApiConfig";

interface UpdateProfileRequest {
  credentials: {
    email?: string;
    full_name?: string;
    phone_number?: string;
  };
}

interface ChangePasswordRequest {
  credentials: {
    old_password: string;
    password: string;
    password_confirmation: string;
  };
}

export const useProfileUser = (apiKey: string | null) => {
  const { showAlert } = useAlert();

  return useMutation({
    mutationFn: async (data: UpdateProfileRequest) => {
      if (!apiKey) {
        throw new Error("API key is required");
      }
      // This is a placeholder - the actual endpoint should be implemented
      const response = await smsApiRequest<UpdateProfileRequest["credentials"], unknown>({
        method: "POST",
        endpoint: `/user/profile/update`,
        data: data.credentials,
        apiKey,
      });
      return response.data;
    },
    onSuccess: () => {
      showAlert({
        variant: "success",
        title: "Success",
        message: "Profile updated successfully.",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Error updating profile.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};

export const useUpdateChangePwd = (apiKey: string | null) => {
  const { showAlert } = useAlert();

  return useMutation({
    mutationFn: async (data: ChangePasswordRequest) => {
      if (!apiKey) {
        throw new Error("API key is required");
      }
      // This is a placeholder - the actual endpoint should be implemented
      const response = await smsApiRequest<ChangePasswordRequest["credentials"], unknown>({
        method: "POST",
        endpoint: `/user/password/change`,
        data: data.credentials,
        apiKey,
      });
      return response.data;
    },
    onSuccess: () => {
      showAlert({
        variant: "success",
        title: "Success",
        message: "Password changed successfully.",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Error changing password.";
      showAlert({
        variant: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });
};
