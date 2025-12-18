import { renderHook } from "@testing-library/react";

import {
  useBenefitGraph,
  useBenefitByTier,
  useBenefitByClient,
  useBenefitDetails,
} from "../../../../../src/controller/query/admin/benefit/useBenefit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import * as benefitService from "../../../../../src/controller/query/admin/benefit/benefit.service";

jest.mock("@/context/AlertProvider", () => ({
  useAlert: () => ({
    showAlert: jest.fn(),
  }),
}));

jest.mock("../../../../../src/controller/query/admin/benefit/benefit.service");

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

describe("controller/query/admin/benefit/useBenefit.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(useBenefitGraph).toBeDefined();
    expect(useBenefitByTier).toBeDefined();
    expect(useBenefitByClient).toBeDefined();
    expect(useBenefitDetails).toBeDefined();
  });

  it("useBenefitGraph - returns query hook", () => {
    const mockData = { message: { data: [] } };
    jest.mocked(benefitService.getBenefitGraph).mockResolvedValue(mockData as any);

    const { result } = renderHook(() => useBenefitGraph({}, "test-api-key", true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("useBenefitGraph - requires apiKey", () => {
    const { result } = renderHook(() => useBenefitGraph({}, null, true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isEnabled).toBe(false);
  });

  it("useBenefitByTier - returns query hook", () => {
    const mockData = { message: {} };
    jest.mocked(benefitService.getBenefitByTier).mockResolvedValue(mockData as any);

    const { result } = renderHook(
      () => useBenefitByTier({ tier_id: 1 }, "test-api-key", true),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
  });

  it("useBenefitByClient - returns query hook", () => {
    const mockData = { message: {} };
    jest.mocked(benefitService.getBenefitByClient).mockResolvedValue(mockData as any);

    const { result } = renderHook(
      () => useBenefitByClient({ client_id: 1 }, "test-api-key", true),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
  });

  it("useBenefitDetails - returns query hook", () => {
    const mockData = { message: {} };
    jest.mocked(benefitService.getBenefitDetails).mockResolvedValue(mockData as any);

    const { result } = renderHook(
      () => useBenefitDetails({ benefit_id: 1 }, "test-api-key", true),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
  });
});