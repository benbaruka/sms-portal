import { renderHook } from "@testing-library/react";

import {
  useGetAllConnectors,
  useCreateConnector,
  useUpdateConnector,
  useGetConnectorById,
  useDeleteConnector,
} from "../../../../src/controller/query/connectors/useConnectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import * as connectorsService from "../../../../src/controller/query/connectors/connectors.service";

jest.mock("@/context/AlertProvider", () => ({
  useAlert: () => ({
    showAlert: jest.fn(),
  }),
}));

jest.mock("../../../../src/controller/query/connectors/connectors.service");

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

describe("controller/query/connectors/useConnectors.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(useGetAllConnectors).toBeDefined();
    expect(useCreateConnector).toBeDefined();
    expect(useUpdateConnector).toBeDefined();
    expect(useGetConnectorById).toBeDefined();
    expect(useDeleteConnector).toBeDefined();
  });

  it("useGetAllConnectors - returns query hook", () => {
    const mockData = { message: { data: [] } };
    jest.mocked(connectorsService.getAllConnectors).mockResolvedValue(mockData as any);

    const { result } = renderHook(() => useGetAllConnectors({ page: 1, limit: 50 }, true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("useCreateConnector - returns mutation hook", () => {
    const { result } = renderHook(() => useCreateConnector(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
  });

  it("useUpdateConnector - returns mutation hook", () => {
    const { result } = renderHook(() => useUpdateConnector(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
  });

  it("useGetConnectorById - returns query hook", () => {
    const mockData = { message: {} };
    jest.mocked(connectorsService.getConnectorById).mockResolvedValue(mockData as any);

    const { result } = renderHook(() => useGetConnectorById(1, true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("useGetConnectorById - requires connectorId", () => {
    const { result } = renderHook(() => useGetConnectorById(null, true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isEnabled).toBe(false);
  });

  it("useDeleteConnector - returns mutation hook", () => {
    const { result } = renderHook(() => useDeleteConnector(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
  });

  it("useGetAllConnectors - respects enabled flag", () => {
    const { result } = renderHook(() => useGetAllConnectors({ page: 1, limit: 50 }, false), {
      wrapper: createWrapper(),
    });

    expect(result.current.isEnabled).toBe(false);
  });
});
