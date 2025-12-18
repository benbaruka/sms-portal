import React, { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import {
  useClientSenderIdsList,
  useClientSenderIdsListForMessages,
  useCreateSenderIdRequest,
} from "../../../../src/controller/query/senders/useSenders";
import * as sendersService from "../../../../src/controller/query/senders/senders.service";

const mockShowAlert = jest.fn();

jest.mock("@/context/AlertProvider", () => ({
  useAlert: () => ({
    showAlert: mockShowAlert,
  }),
}));

jest.mock("../../../../src/controller/query/senders/senders.service");

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

describe("controller/query/senders/useSenders.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockShowAlert.mockClear();
  });

  describe("useClientSenderIdsList", () => {
    it("returns query hook", async () => {
      const mockData = { message: { data: [] } };
      jest.mocked(sendersService.getClientSenderIdsList).mockResolvedValue(mockData as any);

      const { result } = renderHook(() => useClientSenderIdsList({}, "test-api-key", true), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });
    });

    it("requires apiKey", () => {
      const { result } = renderHook(() => useClientSenderIdsList({}, null, true), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBeDefined();
    });

    it("respects enabled flag", () => {
      const { result } = renderHook(() => useClientSenderIdsList({}, "test-api-key", false), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBeDefined();
    });

    it("shows error alert on query error", async () => {
      const error = new Error("Failed to fetch");
      jest.mocked(sendersService.getClientSenderIdsList).mockRejectedValue(error);

      const { result } = renderHook(() => useClientSenderIdsList({}, "test-api-key", true), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current?.isError).toBe(true);
      }, { timeout: 10000 });

      await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith({
          variant: "error",
          title: "Error",
          message: "Failed to fetch",
        });
      });
    });

    it("shows default error message when error is not an Error instance", async () => {
      const error = { message: "Unknown error" };
      jest.mocked(sendersService.getClientSenderIdsList).mockRejectedValue(error);

      const { result } = renderHook(() => useClientSenderIdsList({}, "test-api-key", true), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current?.isError).toBe(true);
      }, { timeout: 10000 });

      await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith({
          variant: "error",
          title: "Error",
          message: "Error retrieving sender IDs list.",
        });
      });
    });
  });

  describe("useClientSenderIdsListForMessages", () => {
    it("returns query hook", async () => {
      const mockData = { message: { data: [] } };
      jest.mocked(sendersService.getClientSenderIdsListForMessages).mockResolvedValue(mockData as any);

      const { result } = renderHook(
        () => useClientSenderIdsListForMessages({}, "test-api-key", true),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });
    });

    it("requires apiKey", () => {
      const { result } = renderHook(
        () => useClientSenderIdsListForMessages({}, null, true),
        { wrapper: createWrapper() }
      );

      expect(result.current).toBeDefined();
    });

    it("respects enabled flag", () => {
      const { result } = renderHook(
        () => useClientSenderIdsListForMessages({}, "test-api-key", false),
        { wrapper: createWrapper() }
      );

      expect(result.current).toBeDefined();
    });

    it("shows error alert on query error", async () => {
      const error = new Error("Failed to fetch");
      jest.mocked(sendersService.getClientSenderIdsListForMessages).mockRejectedValue(error);

      const { result } = renderHook(
        () => useClientSenderIdsListForMessages({}, "test-api-key", true),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current?.isError).toBe(true);
      }, { timeout: 10000 });

      await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith({
          variant: "error",
          title: "Error",
          message: "Failed to fetch",
        });
      });
    });

    it("shows default error message when error is not an Error instance", async () => {
      const error = { message: "Unknown error" };
      jest.mocked(sendersService.getClientSenderIdsListForMessages).mockRejectedValue(error);

      const { result } = renderHook(
        () => useClientSenderIdsListForMessages({}, "test-api-key", true),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current?.isError).toBe(true);
      }, { timeout: 10000 });

      await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith({
          variant: "error",
          title: "Error",
          message: "Error retrieving sender IDs list.",
        });
      });
    });
  });

  describe("useCreateSenderIdRequest", () => {
    it("returns mutation hook", () => {
      const { result } = renderHook(() => useCreateSenderIdRequest(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBeDefined();
      expect(result.current.mutate).toBeDefined();
      expect(result.current.mutateAsync).toBeDefined();
    });

    it("calls mutation function with correct parameters", async () => {
      const mockData = { sender_id: "TEST123" };
      const mockResponse = { message: "Request created" };
      jest.mocked(sendersService.createSenderIdRequest).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useCreateSenderIdRequest(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      result.current?.mutate({ data: mockData, apiKey: "test-api-key" });

      await waitFor(() => {
        expect(result.current?.isSuccess).toBe(true);
      }, { timeout: 10000 });

      expect(sendersService.createSenderIdRequest).toHaveBeenCalledWith(mockData, "test-api-key");
    });

    it("calls onSuccess callback and shows success alert", async () => {
      const mockData = { sender_id: "TEST123" };
      const mockResponse = { message: "Request created" };
      jest.mocked(sendersService.createSenderIdRequest).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useCreateSenderIdRequest(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      result.current?.mutate({ data: mockData, apiKey: "test-api-key" });

      await waitFor(() => {
        expect(result.current?.isSuccess).toBe(true);
      }, { timeout: 10000 });

      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "success",
          title: "Sender ID requested",
          message: "Request created",
        })
      );
    });

    it("calls onSuccess callback with default message when data has no message", async () => {
      const mockData = { sender_id: "TEST123" };
      const mockResponse = {};
      jest.mocked(sendersService.createSenderIdRequest).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useCreateSenderIdRequest(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      result.current?.mutate({ data: mockData, apiKey: "test-api-key" });

      await waitFor(() => {
        expect(result.current?.isSuccess).toBe(true);
      }, { timeout: 10000 });

      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "success",
          title: "Sender ID requested",
          message: "Your sender ID request has been submitted successfully.",
        })
      );
    });

    it("calls onError callback and shows error alert", async () => {
      const mockData = { sender_id: "TEST123" };
      const error = new Error("Creation failed");
      jest.mocked(sendersService.createSenderIdRequest).mockRejectedValue(error);

      const { result } = renderHook(() => useCreateSenderIdRequest(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      result.current?.mutate({ data: mockData, apiKey: "test-api-key" });

      await waitFor(() => {
        expect(result.current?.isError).toBe(true);
      }, { timeout: 10000 });

      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "error",
          title: "Error",
          message: "Creation failed",
        })
      );
    });

    it("calls onError callback with default message when error has no message", async () => {
      const mockData = { sender_id: "TEST123" };
      const error = new Error();
      jest.mocked(sendersService.createSenderIdRequest).mockRejectedValue(error);

      const { result } = renderHook(() => useCreateSenderIdRequest(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      result.current?.mutate({ data: mockData, apiKey: "test-api-key" });

      await waitFor(() => {
        expect(result.current?.isError).toBe(true);
      }, { timeout: 10000 });

      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "error",
          title: "Error",
          message: "Failed to request sender ID.",
        })
      );
    });
  });
});
