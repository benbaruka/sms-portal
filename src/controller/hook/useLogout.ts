import { useRouter } from "next/navigation";
import { deleteCookie } from "cookies-next";
import { useAuth } from "@/context/AuthProvider";
import { useAlert } from "@/context/AlertProvider";
import { useQueryClient } from "@tanstack/react-query";
export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setIsAuthenticated, setUser } = useAuth();
  const { showAlert } = useAlert();
  const logout = async () => {
    deleteCookie("authToken");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user-session");
    setIsAuthenticated(false);
    setUser(null);
    queryClient.clear();
    showAlert({
      variant: "success",
      title: "Logged Out",
      message: "You have been logged out successfully.",
    });
    setTimeout(() => {
      router.replace("/signin");
    }, 100);
  };
  return logout;
};
