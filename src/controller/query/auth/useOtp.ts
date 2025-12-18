import { useMutation } from "@tanstack/react-query";
import { useAlert } from "@/context/AlertProvider";
import { useAuth } from "@/context/AuthProvider";
import { verifyOtp, resendOtp } from "./otp.service";
import { VerifyOtpRequest, ResendOtpRequest, ResponseLog } from "@/types";

export const useVerifyOtp = () => {
  const { showAlert } = useAlert();
  const { user, setUser } = useAuth();
  return useMutation({
    mutationFn: async (data: VerifyOtpRequest) => {
      return verifyOtp(data);
    },
    onSuccess: (data) => {
      // Update user status in session after successful verification
      if (user) {
        const updatedUser: ResponseLog = {
          ...user,
          message: {
            ...user.message,
            user: {
              ...user.message.user,
              status: 1, // Set status to verified
            },
          },
        };
        localStorage.setItem("user-session", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }

      showAlert({
        variant: "success",
        title: "Account verified",
        message: data?.message || "Account verified successfully. You can now login.",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to verify OTP code.";
      showAlert({
        variant: "error",
        title: "Verification failed",
        message: errorMessage,
      });
    },
  });
};

export const useResendOtp = () => {
  const { showAlert } = useAlert();
  return useMutation({
    mutationFn: async (data: ResendOtpRequest) => {
      return resendOtp(data);
    },
    onSuccess: (data) => {
      showAlert({
        variant: "success",
        title: "OTP resent",
        message: data?.message || "Verification code has been resent to your email and phone.",
      });
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to resend OTP code.";
      showAlert({
        variant: "error",
        title: "Resend failed",
        message: errorMessage,
      });
    },
  });
};
