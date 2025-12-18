import { beforeEach, describe, expect, it } from "@jest/globals";
import { renderHook, act, waitFor } from "@testing-library/react";
import {
  useAdminClientsList,
  useAdminClientDetails,
  useCreateAdminClient,
  useUpdateAdminClient,
  useChangeAdminClientStatus,
  useAdminClientAccountTypes,
  useAdminClientCountries,
  useCreditClientTopup,
  useUpdateClientBillingRate,
  useClientSMSBilling,
} from "../../../../../src/controller/query/admin/clients/useAdminClients";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import * as clientsService from "../../../../../src/controller/query/admin/clients/clients.service";

const mockShowAlert = jest.fn();

jest.mock("@/context/AlertProvider", () => ({
  useAlert: () => ({
    showAlert: mockShowAlert,
  }),
}));

jest.mock("../../../../../src/controller/query/admin/clients/clients.service");

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("controller/query/admin/clients/useAdminClients.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(useAdminClientsList).toBeDefined();
    expect(useAdminClientDetails).toBeDefined();
    expect(useCreateAdminClient).toBeDefined();
    expect(useUpdateAdminClient).toBeDefined();
    expect(useChangeAdminClientStatus).toBeDefined();
    expect(useAdminClientAccountTypes).toBeDefined();
    expect(useAdminClientCountries).toBeDefined();
  });

  describe("useAdminClientsList", () => {
    it("returns query hook", async () => {
    const mockData = { message: { data: [] } };
    jest.mocked(clientsService.getAdminClientsList).mockResolvedValue(mockData as any);

    const { result } = renderHook(
      () => useAdminClientsList({ page: 1, limit: 10 }, "test-api-key", true),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
  });

    it("requires apiKey", () => {
    const { result } = renderHook(() => useAdminClientsList({ page: 1 }, null, true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isEnabled).toBe(false);
  });

    it("shows error alert on error", async () => {
      const error = new Error("Test error");
      jest.mocked(clientsService.getAdminClientsList).mockRejectedValue(error);

      renderHook(
        () => useAdminClientsList({ page: 1 }, "test-api-key", true),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: "error",
            title: "Error",
          })
        );
      });
    });
  });

  describe("useAdminClientDetails", () => {
    it("returns query hook", async () => {
    const mockData = { message: {} };
    jest.mocked(clientsService.getAdminClientDetails).mockResolvedValue(mockData as any);

    const { result } = renderHook(
      () => useAdminClientDetails({ client_id: 1 }, "test-api-key", true),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
  });

    it("requires client_id", () => {
    const { result } = renderHook(() => useAdminClientDetails(null, "test-api-key", true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isEnabled).toBe(false);
  });

    it("shows error alert on error", async () => {
      const error = new Error("Test error");
      jest.mocked(clientsService.getAdminClientDetails).mockRejectedValue(error);

      renderHook(
        () => useAdminClientDetails({ client_id: 1 }, "test-api-key", true),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalled();
      });
    });
  });

  describe("useCreateAdminClient", () => {
    it("returns mutation hook", () => {
    const { result } = renderHook(() => useCreateAdminClient(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
    });

    it("calls service on mutation", async () => {
      const mockData = { status: 200, message: "Created" };
      jest.mocked(clientsService.createAdminClient).mockResolvedValue(mockData as any);

      const { result } = renderHook(() => useCreateAdminClient(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          data: { company_name: "Test", email: "test@example.com" },
          apiKey: "test-key",
        });
      });

      expect(clientsService.createAdminClient).toHaveBeenCalled();
    });

    it("shows success alert on success", async () => {
      const mockData = { status: 200, message: "Created" };
      jest.mocked(clientsService.createAdminClient).mockResolvedValue(mockData as any);

      const { result } = renderHook(() => useCreateAdminClient(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          data: { company_name: "Test", email: "test@example.com" },
          apiKey: "test-key",
        });
      });

      await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: "success",
          })
        );
      });
    });
  });

  describe("useUpdateAdminClient", () => {
    it("returns mutation hook", () => {
      const { result } = renderHook(() => useUpdateAdminClient(), {
        wrapper: createWrapper(),
      });

      expect(result.current.mutate).toBeDefined();
    });

    it("calls service on mutation", async () => {
      const mockData = { status: 200, message: "Updated" };
      jest.mocked(clientsService.updateAdminClient).mockResolvedValue(mockData as any);

      const { result } = renderHook(() => useUpdateAdminClient(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          data: { client_id: "1", name: "Updated" },
          apiKey: "test-key",
        });
      });

      expect(clientsService.updateAdminClient).toHaveBeenCalled();
    });
  });

  describe("useChangeAdminClientStatus", () => {
    it("returns mutation hook", () => {
      const { result } = renderHook(() => useChangeAdminClientStatus(), {
        wrapper: createWrapper(),
      });

      expect(result.current.mutate).toBeDefined();
    });

    it("calls service on mutation", async () => {
      const mockData = { status: 200, message: "Status changed" };
      jest.mocked(clientsService.changeAdminClientStatus).mockResolvedValue(mockData as any);

      const { result } = renderHook(() => useChangeAdminClientStatus(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          data: { client_id: "1", status: "ACTIVE" },
          apiKey: "test-key",
        });
      });

      expect(clientsService.changeAdminClientStatus).toHaveBeenCalled();
    });
  });

  describe("useAdminClientAccountTypes", () => {
    it("returns query hook", () => {
      const mockData = { data: [{ id: 1, name: "Premium" }] };
      jest.mocked(clientsService.getAdminClientAccountTypes).mockResolvedValue(mockData as any);

      const { result } = renderHook(
        () => useAdminClientAccountTypes("test-api-key", true),
        { wrapper: createWrapper() }
      );

      expect(result.current.isLoading).toBe(true);
    });

    it("requires apiKey", () => {
      const { result } = renderHook(() => useAdminClientAccountTypes(null, true), {
        wrapper: createWrapper(),
      });

      expect(result.current.isEnabled).toBe(false);
    });
  });

  describe("useAdminClientCountries", () => {
    it("returns query hook", () => {
      const mockData = { data: [{ code: "CD", name: "Congo" }] };
      jest.mocked(clientsService.getAdminClientCountryCodes).mockResolvedValue(mockData as any);

      const { result } = renderHook(
        () => useAdminClientCountries("test-api-key", true),
        { wrapper: createWrapper() }
      );

      expect(result.current.isLoading).toBe(true);
    });

    it("requires apiKey", () => {
      const { result } = renderHook(() => useAdminClientCountries(null, true), {
        wrapper: createWrapper(),
      });

      expect(result.current.isEnabled).toBe(false);
    });
  });

  describe("useClientSMSBilling", () => {
    it("returns query hook", () => {
      const mockData = { data: [] };
      jest.mocked(clientsService.getClientSMSBilling).mockResolvedValue(mockData as any);

      const { result } = renderHook(
        () => useClientSMSBilling(1, "test-api-key", true),
        { wrapper: createWrapper() }
      );

      expect(result.current.isLoading).toBe(true);
    });

    it("requires apiKey and clientId", () => {
      const { result } = renderHook(() => useClientSMSBilling(null, "test-api-key", true), {
        wrapper: createWrapper(),
      });

      expect(result.current.isEnabled).toBe(false);
    });
  });

  describe("useUpdateClientBillingRate", () => {
    it("returns mutation hook", () => {
      const { result } = renderHook(() => useUpdateClientBillingRate(), {
        wrapper: createWrapper(),
      });

      expect(result.current.mutate).toBeDefined();
    });

    it("calls service on mutation", async () => {
      const mockData = { status: 200, message: "Updated" };
      jest.mocked(clientsService.updateClientBillingRate).mockResolvedValue(mockData as any);

      const { result } = renderHook(() => useUpdateClientBillingRate(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          data: { id: 1, billing_rate: [{ connector_id: 1, billing_rate: 0.05 }] },
          apiKey: "test-key",
        });
      });

      expect(clientsService.updateClientBillingRate).toHaveBeenCalled();
    });
  });

  describe("useCreditClientTopup", () => {
    it("returns mutation hook", () => {
      const { result } = renderHook(() => useCreditClientTopup(), {
        wrapper: createWrapper(),
      });

      expect(result.current.mutate).toBeDefined();
    });

    it("calls service on mutation", async () => {
      const mockData = { status: 200, message: "Credited" };
      jest.mocked(clientsService.creditClientTopup).mockResolvedValue(mockData as any);

      const { result } = renderHook(() => useCreditClientTopup(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          data: { client_id: 1, amount: 100 },
          apiKey: "test-key",
        });
      });

      expect(clientsService.creditClientTopup).toHaveBeenCalled();
    });
  });
});