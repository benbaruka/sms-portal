import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React, { ReactNode } from "react";

import * as smsApiConfig from "../../../../src/controller/api/config/smsApiConfig";
import {
  useProfileUser,
  useUpdateChangePwd,
} from "../../../../src/controller/query/profile/useProfile";

const mockShowAlert = jest.fn();

jest.mock("@/context/AlertProvider", () => ({
  useAlert: () => ({
    showAlert: mockShowAlert,
  }),
}));

jest.mock("../../../../src/controller/api/config/smsApiConfig");

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe("controller/query/profile/useProfile.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockShowAlert.mockClear();
  });

  describe("useProfileUser", () => {
    it("returns mutation hook", async () => {
      jest.mocked(smsApiConfig.smsApiRequest).mockResolvedValue({ data: {} } as any);

      const { result } = renderHook(() => useProfileUser("test-api-key"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current.mutate).toBeDefined();
        expect(result.current.mutateAsync).toBeDefined();
      }, { timeout: 10000 });
    });

    it("requires apiKey", async () => {
      const { result } = renderHook(() => useProfileUser(null), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current.mutateAsync).toBeDefined();
      }, { timeout: 10000 });

      try {
        await result.current.mutateAsync({
          credentials: { email: "test@example.com" },
        });
      } catch (error: any) {
        expect(error.message).toContain("API key is required");
      }
    });

    it("calls mutation function with correct parameters", async () => {
      const mockResponse = { data: { message: "Updated" } };
      jest.mocked(smsApiConfig.smsApiRequest).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useProfileUser("test-api-key"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current.mutate).toBeDefined();
      }, { timeout: 10000 });

      result.current.mutate({
        credentials: {
          email: "test@example.com",
          full_name: "Test User",
          phone_number: "1234567890",
        },
      });

      await waitFor(
        () => {
          expect(result.current.isSuccess).toBe(true);
        },
        { timeout: 10000 }
      );

      expect(smsApiConfig.smsApiRequest).toHaveBeenCalledWith({
        method: "POST",
        endpoint: "/user/profile/update",
        data: {
          email: "test@example.com",
          full_name: "Test User",
          phone_number: "1234567890",
        },
        apiKey: "test-api-key",
      });
    });

    it("calls onSuccess callback and shows success alert", async () => {
      const mockResponse = { data: { message: "Updated" } };
      jest.mocked(smsApiConfig.smsApiRequest).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useProfileUser("test-api-key"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current.mutate).toBeDefined();
      }, { timeout: 10000 });

      result.current.mutate({
        credentials: { email: "test@example.com" },
      });

      await waitFor(
        () => {
          expect(result.current.isSuccess).toBe(true);
        },
        { timeout: 10000 }
      );

      await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: "success",
            title: "Success",
            message: "Profile updated successfully.",
          })
        );
      });
    });

    it("calls onError callback and shows error alert", async () => {
      const error = new Error("Update failed");
      jest.mocked(smsApiConfig.smsApiRequest).mockRejectedValue(error);

      const { result } = renderHook(() => useProfileUser("test-api-key"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current.mutate).toBeDefined();
      }, { timeout: 10000 });

      result.current.mutate({
        credentials: { email: "test@example.com" },
      });

      await waitFor(
        () => {
          expect(result.current.isError).toBe(true);
        },
        { timeout: 10000 }
      );

      await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: "error",
            title: "Error",
            message: "Update failed",
          })
        );
      });
    });

    it("calls onError callback with default message when error has no message", async () => {
      const error = new Error();
      jest.mocked(smsApiConfig.smsApiRequest).mockRejectedValue(error);

      const { result } = renderHook(() => useProfileUser("test-api-key"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current.mutate).toBeDefined();
      }, { timeout: 10000 });

      result.current.mutate({
        credentials: { email: "test@example.com" },
      });

      await waitFor(
        () => {
          expect(result.current.isError).toBe(true);
        },
        { timeout: 10000 }
      );

      await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: "error",
            title: "Error",
            message: "Error updating profile.",
          })
        );
      });
    });
  });

  describe("useUpdateChangePwd", () => {
    it("returns mutation hook", async () => {
      jest.mocked(smsApiConfig.smsApiRequest).mockResolvedValue({ data: {} } as any);

      const { result } = renderHook(() => useUpdateChangePwd("test-api-key"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current.mutate).toBeDefined();
        expect(result.current.mutateAsync).toBeDefined();
      }, { timeout: 10000 });
    });

    it("requires apiKey", async () => {
      const { result } = renderHook(() => useUpdateChangePwd(null), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current.mutateAsync).toBeDefined();
      }, { timeout: 10000 });

      try {
        await result.current.mutateAsync({
          credentials: {
            old_password: "old",
            password: "new",
            password_confirmation: "new",
          },
        });
      } catch (error: any) {
        expect(error.message).toContain("API key is required");
      }
    });

    it("calls mutation function with correct parameters", async () => {
      const mockResponse = { data: { message: "Password changed" } };
      jest.mocked(smsApiConfig.smsApiRequest).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useUpdateChangePwd("test-api-key"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current.mutate).toBeDefined();
      }, { timeout: 10000 });

      result.current.mutate({
        credentials: {
          old_password: "old",
          password: "new",
          password_confirmation: "new",
        },
      });

      await waitFor(
        () => {
          expect(result.current.isSuccess).toBe(true);
        },
        { timeout: 10000 }
      );

      expect(smsApiConfig.smsApiRequest).toHaveBeenCalledWith({
        method: "POST",
        endpoint: "/user/password/change",
        data: {
          old_password: "old",
          password: "new",
          password_confirmation: "new",
        },
        apiKey: "test-api-key",
      });
    });

    it("calls onSuccess callback and shows success alert", async () => {
      const mockResponse = { data: { message: "Password changed" } };
      jest.mocked(smsApiConfig.smsApiRequest).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useUpdateChangePwd("test-api-key"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current.mutate).toBeDefined();
      }, { timeout: 10000 });

      result.current.mutate({
        credentials: {
          old_password: "old",
          password: "new",
          password_confirmation: "new",
        },
      });

      await waitFor(
        () => {
          expect(result.current.isSuccess).toBe(true);
        },
        { timeout: 10000 }
      );

      await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: "success",
            title: "Success",
            message: "Password changed successfully.",
          })
        );
      });
    });

    it("calls onError callback and shows error alert", async () => {
      const error = new Error("Password change failed");
      jest.mocked(smsApiConfig.smsApiRequest).mockRejectedValue(error);

      const { result } = renderHook(() => useUpdateChangePwd("test-api-key"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current.mutate).toBeDefined();
      }, { timeout: 10000 });

      result.current.mutate({
        credentials: {
          old_password: "old",
          password: "new",
          password_confirmation: "new",
        },
      });

      await waitFor(
        () => {
          expect(result.current.isError).toBe(true);
        },
        { timeout: 10000 }
      );

      await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: "error",
            title: "Error",
            message: "Password change failed",
          })
        );
      });
    });

    it("calls onError callback with default message when error has no message", async () => {
      const error = new Error();
      jest.mocked(smsApiConfig.smsApiRequest).mockRejectedValue(error);

      const { result } = renderHook(() => useUpdateChangePwd("test-api-key"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current.mutate).toBeDefined();
      }, { timeout: 10000 });

      result.current.mutate({
        credentials: {
          old_password: "old",
          password: "new",
          password_confirmation: "new",
        },
      });

      await waitFor(
        () => {
          expect(result.current.isError).toBe(true);
        },
        { timeout: 10000 }
      );

      await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: "error",
            title: "Error",
            message: "Error changing password.",
          })
        );
      });
    });
  });
});
