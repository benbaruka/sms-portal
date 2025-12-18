import React, { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import {
  useMpesaPaymentRequest,
  useGetMNOProviders,
  useMNOSelfTopup,
  useMNOTopupHistory,
  useCreateManualTopup,
  useGetManualTopupRequests,
  useGetManualTopupRequestDetails,
  useGetAvailableConnectors,
} from "../../../../src/controller/query/topup/useTopup";
import * as topupService from "../../../../src/controller/query/topup/topup.service";

const mockShowAlert = jest.fn();

jest.mock("@/context/AlertProvider", () => ({
  useAlert: () => ({
    showAlert: mockShowAlert,
  }),
}));

jest.mock("../../../../src/controller/query/topup/topup.service");

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

describe("controller/query/topup/useTopup.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockShowAlert.mockClear();
  });

  describe("useMpesaPaymentRequest", () => {
    it("returns mutation hook", () => {
      const { result } = renderHook(() => useMpesaPaymentRequest(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBeDefined();
      expect(result.current.mutate).toBeDefined();
      expect(result.current.mutateAsync).toBeDefined();
    });

    it("calls mutation function with correct parameters", async () => {
      const mockData = { amount: 100, phone: "+1234567890" };
      const mockResponse = { message: "Payment successful" };
      jest.mocked(topupService.mpesaPaymentRequest).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useMpesaPaymentRequest(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ data: mockData, apiKey: "test-api-key" });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      }, { timeout: 10000 });

      expect(topupService.mpesaPaymentRequest).toHaveBeenCalledWith(mockData, "test-api-key");
    });

    it("calls onSuccess callback and shows success alert", async () => {
      const mockData = { amount: 100, phone: "+1234567890" };
      const mockResponse = { message: "Payment successful" };
      jest.mocked(topupService.mpesaPaymentRequest).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useMpesaPaymentRequest(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ data: mockData, apiKey: "test-api-key" });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      }, { timeout: 10000 });

      await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith({
          variant: "success",
          title: "Success",
          message: "Payment successful",
        });
      });
    });

    it("calls onSuccess callback with default message when data has no message", async () => {
      const mockData = { amount: 100, phone: "+1234567890" };
      const mockResponse = {};
      jest.mocked(topupService.mpesaPaymentRequest).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useMpesaPaymentRequest(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ data: mockData, apiKey: "test-api-key" });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      }, { timeout: 10000 });

      await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith({
          variant: "success",
          title: "Success",
          message: "MPESA payment request submitted successfully!",
        });
      });
    });

    it("calls onError callback and shows error alert", async () => {
      const mockData = { amount: 100, phone: "+1234567890" };
      const error = new Error("Payment failed");
      jest.mocked(topupService.mpesaPaymentRequest).mockRejectedValue(error);

      const { result } = renderHook(() => useMpesaPaymentRequest(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ data: mockData, apiKey: "test-api-key" });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      }, { timeout: 10000 });

      await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith({
          variant: "error",
          title: "Error",
          message: "Payment failed",
        });
      });
    });

    it("calls onError callback with default message when error has no message", async () => {
      const mockData = { amount: 100, phone: "+1234567890" };
      const error = new Error();
      jest.mocked(topupService.mpesaPaymentRequest).mockRejectedValue(error);

      const { result } = renderHook(() => useMpesaPaymentRequest(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ data: mockData, apiKey: "test-api-key" });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      }, { timeout: 10000 });

      await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith({
          variant: "error",
          title: "Error",
          message: "Failed to submit MPESA payment request.",
        });
      });
    });
  });

  describe("useGetMNOProviders", () => {
    it("returns query hook", async () => {
      const mockData = { status: 200, message: [] };
      jest.mocked(topupService.getMNOProviders).mockResolvedValue(mockData as any);

      const { result } = renderHook(() => useGetMNOProviders("test-api-key", true), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      }, { timeout: 10000 });
    });

    it("requires apiKey", () => {
      const { result } = renderHook(() => useGetMNOProviders(null, true), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
    });

    it("respects enabled flag", () => {
      const { result } = renderHook(() => useGetMNOProviders("test-api-key", false), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
    });

    it("validates apiKey in query function", async () => {
      jest.mocked(topupService.getMNOProviders).mockRejectedValue(new Error("API key is required"));

      const { result } = renderHook(() => useGetMNOProviders("test-api-key", true), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      }, { timeout: 10000 });
    });
  });

  describe("useMNOSelfTopup", () => {
    it("returns mutation hook", () => {
      const { result } = renderHook(() => useMNOSelfTopup(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBeDefined();
      expect(result.current.mutate).toBeDefined();
      expect(result.current.mutateAsync).toBeDefined();
    });

    it("calls mutation function with correct parameters", async () => {
      const mockData = { provider: "AIRTEL", amount: 100, phone: "+1234567890" };
      const mockResponse = { message: "Topup successful" };
      jest.mocked(topupService.mnoSelfTopup).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useMNOSelfTopup(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ data: mockData, apiKey: "test-api-key" });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      }, { timeout: 10000 });

      expect(topupService.mnoSelfTopup).toHaveBeenCalledWith(mockData, "test-api-key");
    });

    it("calls onSuccess callback and shows success alert", async () => {
      const mockData = { provider: "AIRTEL", amount: 100, phone: "+1234567890" };
      const mockResponse = { message: "Topup successful" };
      jest.mocked(topupService.mnoSelfTopup).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useMNOSelfTopup(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ data: mockData, apiKey: "test-api-key" });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      }, { timeout: 10000 });

      await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith({
          variant: "success",
          title: "Success",
          message: "Topup successful",
        });
      });
    });

    it("calls onSuccess callback with default message when data has no message", async () => {
      const mockData = { provider: "AIRTEL", amount: 100, phone: "+1234567890" };
      const mockResponse = {};
      jest.mocked(topupService.mnoSelfTopup).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useMNOSelfTopup(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ data: mockData, apiKey: "test-api-key" });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      }, { timeout: 10000 });

      await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith({
          variant: "success",
          title: "Success",
          message: "MNO topup request submitted successfully!",
        });
      });
    });

    it("calls onError callback and shows error alert", async () => {
      const mockData = { provider: "AIRTEL", amount: 100, phone: "+1234567890" };
      const error = new Error("Topup failed");
      jest.mocked(topupService.mnoSelfTopup).mockRejectedValue(error);

      const { result } = renderHook(() => useMNOSelfTopup(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ data: mockData, apiKey: "test-api-key" });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      }, { timeout: 10000 });

      await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith({
          variant: "error",
          title: "Error",
          message: "Topup failed",
        });
      });
    });

    it("calls onError callback with default message when error has no message", async () => {
      const mockData = { provider: "AIRTEL", amount: 100, phone: "+1234567890" };
      const error = new Error();
      jest.mocked(topupService.mnoSelfTopup).mockRejectedValue(error);

      const { result } = renderHook(() => useMNOSelfTopup(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ data: mockData, apiKey: "test-api-key" });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      }, { timeout: 10000 });

      await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith({
          variant: "error",
          title: "Error",
          message: "Failed to submit MNO topup request.",
        });
      });
    });
  });

  describe("useMNOTopupHistory", () => {
    it("returns query hook", async () => {
      const mockData = { status: 200, message: { history: [] } };
      jest.mocked(topupService.getMNOTopupHistory).mockResolvedValue(mockData as any);

      const { result } = renderHook(
        () => useMNOTopupHistory({ page: 1, limit: 10 }, "test-api-key", true),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      }, { timeout: 10000 });
    });

    it("requires apiKey", () => {
      const { result } = renderHook(
        () => useMNOTopupHistory({ page: 1, limit: 10 }, null, true),
        { wrapper: createWrapper() }
      );

      expect(result.current.isFetching).toBe(false);
    });

    it("respects enabled flag", () => {
      const { result } = renderHook(
        () => useMNOTopupHistory({ page: 1, limit: 10 }, "test-api-key", false),
        { wrapper: createWrapper() }
      );

      expect(result.current.isFetching).toBe(false);
    });

    it("validates apiKey in query function", async () => {
      jest
        .mocked(topupService.getMNOTopupHistory)
        .mockRejectedValue(new Error("API key is required"));

      const { result } = renderHook(
        () => useMNOTopupHistory({ page: 1, limit: 10 }, "test-api-key", true),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      }, { timeout: 10000 });
    });
  });

  describe("useCreateManualTopup", () => {
    it("returns mutation hook", () => {
      const { result } = renderHook(() => useCreateManualTopup(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBeDefined();
      expect(result.current.mutate).toBeDefined();
      expect(result.current.mutateAsync).toBeDefined();
    });

    it("calls mutation function with correct parameters", async () => {
      const mockData = { amount: 100, connectorId: "conn-1" };
      const mockResponse = { message: "Topup created" };
      jest.mocked(topupService.createManualTopup).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useCreateManualTopup(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ data: mockData, apiKey: "test-api-key" });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      }, { timeout: 10000 });

      expect(topupService.createManualTopup).toHaveBeenCalledWith(mockData, "test-api-key");
    });

    it("calls onSuccess callback and shows success alert", async () => {
      const mockData = { amount: 100, connectorId: "conn-1" };
      const mockResponse = { message: "Topup created" };
      jest.mocked(topupService.createManualTopup).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useCreateManualTopup(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ data: mockData, apiKey: "test-api-key" });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      }, { timeout: 10000 });

      await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith({
          variant: "success",
          title: "Success",
          message: "Topup created",
        });
      });
    });

    it("calls onSuccess callback with default message when data has no message", async () => {
      const mockData = { amount: 100, connectorId: "conn-1" };
      const mockResponse = {};
      jest.mocked(topupService.createManualTopup).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useCreateManualTopup(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ data: mockData, apiKey: "test-api-key" });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      }, { timeout: 10000 });

      await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith({
          variant: "success",
          title: "Success",
          message: "Manual topup request created successfully!",
        });
      });
    });

    it("calls onError callback and shows error alert", async () => {
      const mockData = { amount: 100, connectorId: "conn-1" };
      const error = new Error("Creation failed");
      jest.mocked(topupService.createManualTopup).mockRejectedValue(error);

      const { result } = renderHook(() => useCreateManualTopup(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ data: mockData, apiKey: "test-api-key" });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      }, { timeout: 10000 });

      await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith({
          variant: "error",
          title: "Error",
          message: "Creation failed",
        });
      });
    });

    it("calls onError callback with default message when error has no message", async () => {
      const mockData = { amount: 100, connectorId: "conn-1" };
      const error = new Error();
      jest.mocked(topupService.createManualTopup).mockRejectedValue(error);

      const { result } = renderHook(() => useCreateManualTopup(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ data: mockData, apiKey: "test-api-key" });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      }, { timeout: 10000 });

      await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith({
          variant: "error",
          title: "Error",
          message: "Failed to create manual topup request.",
        });
      });
    });
  });

  describe("useGetManualTopupRequests", () => {
    it("returns query hook", async () => {
      const mockData = { status: 200, message: { requests: [] } };
      jest.mocked(topupService.getManualTopupRequests).mockResolvedValue(mockData as any);

      const { result } = renderHook(
        () => useGetManualTopupRequests({ page: 1, limit: 10 }, "test-api-key", true),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      }, { timeout: 10000 });
    });

    it("requires apiKey", () => {
      const { result } = renderHook(
        () => useGetManualTopupRequests({ page: 1, limit: 10 }, null, true),
        { wrapper: createWrapper() }
      );

      expect(result.current.isFetching).toBe(false);
    });

    it("respects enabled flag", () => {
      const { result } = renderHook(
        () => useGetManualTopupRequests({ page: 1, limit: 10 }, "test-api-key", false),
        { wrapper: createWrapper() }
      );

      expect(result.current.isFetching).toBe(false);
    });

    it("validates apiKey in query function", async () => {
      jest
        .mocked(topupService.getManualTopupRequests)
        .mockRejectedValue(new Error("API key is required"));

      const { result } = renderHook(
        () => useGetManualTopupRequests({ page: 1, limit: 10 }, "test-api-key", true),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      }, { timeout: 10000 });
    });
  });

  describe("useGetManualTopupRequestDetails", () => {
    it("returns query hook", async () => {
      const mockData = { status: 200, message: {} };
      jest.mocked(topupService.getManualTopupRequestDetails).mockResolvedValue(mockData as any);

      const { result } = renderHook(
        () => useGetManualTopupRequestDetails({ id: 1 }, "test-api-key", true),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      }, { timeout: 10000 });
    });

    it("requires apiKey", () => {
      const { result } = renderHook(
        () => useGetManualTopupRequestDetails({ id: 1 }, null, true),
        { wrapper: createWrapper() }
      );

      expect(result.current.isFetching).toBe(false);
    });

    it("respects enabled flag", () => {
      const { result } = renderHook(
        () => useGetManualTopupRequestDetails({ id: 1 }, "test-api-key", false),
        { wrapper: createWrapper() }
      );

      expect(result.current.isFetching).toBe(false);
    });

    it("validates apiKey in query function", async () => {
      jest
        .mocked(topupService.getManualTopupRequestDetails)
        .mockRejectedValue(new Error("API key is required"));

      const { result } = renderHook(
        () => useGetManualTopupRequestDetails({ id: 1 }, "test-api-key", true),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      }, { timeout: 10000 });
    });
  });

  describe("useGetAvailableConnectors", () => {
    it("returns query hook", async () => {
      const mockData = { status: 200, message: { connectors: [] } };
      jest.mocked(topupService.getAvailableConnectors).mockResolvedValue(mockData as any);

      const { result } = renderHook(() => useGetAvailableConnectors("test-api-key", true), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      }, { timeout: 10000 });
    });

    it("requires apiKey", () => {
      const { result } = renderHook(() => useGetAvailableConnectors(null, true), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
    });

    it("respects enabled flag", () => {
      const { result } = renderHook(() => useGetAvailableConnectors("test-api-key", false), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
    });

    it("handles errors silently in useEffect", async () => {
      const error = new Error("Connectors fetch failed");
      jest.mocked(topupService.getAvailableConnectors).mockRejectedValue(error);

      const { result } = renderHook(() => useGetAvailableConnectors("test-api-key", true), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      }, { timeout: 10000 });

      // Should not show alert for this hook
      expect(mockShowAlert).not.toHaveBeenCalled();
    });

    it("validates apiKey in query function", async () => {
      jest
        .mocked(topupService.getAvailableConnectors)
        .mockRejectedValue(new Error("API key is required"));

      const { result } = renderHook(() => useGetAvailableConnectors("test-api-key", true), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      }, { timeout: 10000 });
    });
  });
});
