import { screen as testingLibraryScreen } from "@testing-library/react";

import TopupRequestDetailsPage from "../../../../../../src/app/(admin)/admin/topup/request/view/page";
import { renderWithProviders, waitFor } from "../../../../../test-utils";

// Use screen directly from @testing-library/react for proper TypeScript types
const screen: typeof testingLibraryScreen = testingLibraryScreen;

const mockGet = jest.fn();

jest.mock("@/controller/query/topup/useTopup", () => ({
  useGetManualTopupRequestDetails: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

import * as hooks from "../../../../../../src/controller/query/topup/useTopup";

describe("app/(admin)/admin/topup/request/view/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
    mockGet.mockReturnValue("1");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useGetManualTopupRequestDetails as jest.MockedFunction<any>).mockReturnValue({
      data: {
        message: {
          id: 1,
          amount: 100,
          currency: "USD",
          status: "approved",
          invoice_number: "INV-001",
          invoice_path: "/path/to/invoice.pdf",
          description: "Test topup",
          created_at: "2024-01-15T10:00:00Z",
        },
      },
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  it("module loads", () => {
    expect(TopupRequestDetailsPage).toBeDefined();
  });

  it("renders topup request details page", async () => {
    renderWithProviders(<TopupRequestDetailsPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Top-up Request Details/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders back button", async () => {
    renderWithProviders(<TopupRequestDetailsPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Back to Requests/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("displays request details", async () => {
    renderWithProviders(<TopupRequestDetailsPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("INV-001")).toBeInTheDocument();
        expect(screen.queryByText("100")).toBeInTheDocument();
        expect(screen.queryByText("USD")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("shows loading state", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useGetManualTopupRequestDetails as jest.MockedFunction<any>).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      error: null,
    });
    renderWithProviders(<TopupRequestDetailsPage />);
    expect(screen.queryByText("Loading request details...")).toBeInTheDocument();
  });

  it("shows error state", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useGetManualTopupRequestDetails as jest.MockedFunction<any>).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: new Error("Request not found"),
    });
    renderWithProviders(<TopupRequestDetailsPage />);
    await waitFor(
      () => {
        expect(
          screen.queryByText(/Request not found/i) || screen.queryByText(/Error/i)
        ).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles missing request id", () => {
    mockGet.mockReturnValue(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useGetManualTopupRequestDetails as jest.MockedFunction<any>).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
    });
    renderWithProviders(<TopupRequestDetailsPage />);
    expect(screen.queryByText(/Top-up Request Details/i)).toBeInTheDocument();
  });

  it("handles different response formats", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useGetManualTopupRequestDetails as jest.MockedFunction<any>).mockReturnValue({
      data: {
        data: {
          id: 2,
          amount: 200,
          currency: "EUR",
          status: "pending",
        },
      },
      isLoading: false,
      isError: false,
      error: null,
    });
    renderWithProviders(<TopupRequestDetailsPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Top-up Request Details/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles missing apiKey", () => {
    localStorage.removeItem("apiKey");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useGetManualTopupRequestDetails as jest.MockedFunction<any>).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
    });
    renderWithProviders(<TopupRequestDetailsPage />);
    expect(screen.queryByText(/Top-up Request Details/i)).toBeInTheDocument();
  });
});
