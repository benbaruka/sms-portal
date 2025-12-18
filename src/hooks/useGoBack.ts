import { useRouter } from "next/navigation";

export const useGoBack = () => {
  const router = useRouter();
  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };
  return { goBack };
};

export default useGoBack;
