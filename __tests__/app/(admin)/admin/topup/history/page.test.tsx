
import {
  fireEvent as testingLibraryFireEvent,
  screen as testingLibraryScreen,
} from "@testing-library/react";
import AdminTopupHistoryPage from "../../../../../../src/app/(admin)/admin/topup/history/page";
import { renderWithProviders, waitFor } from "../../../../../test-utils";

// Use screen and fireEvent directly from @testing-library/react for proper TypeScript types
const screen: typeof testingLibraryScreen = testingLibraryScreen;
const fireEvent: typeof testingLibraryFireEvent = testingLibraryFireEvent;

const mockRefetch = jest.fn();

jest.mock("@/controller/query/topup/useTopup", () => ({
  useGetManualTopupRequests: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

import * as hooks from "../../../../../../src/controller/query/topup/useTopup";

describe("app/(admin)/admin/topup/history/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
    mockRefetch.mockResolvedValue({});

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useGetManualTopupRequests as jest.MockedFunction<any>).mockReturnValue({
      data: {
        message: {
          data: [
            {
              id: 1,
              amount: 100,
              currency: "USD",
              status: "approved",
              invoice_number: "INV-001",
              created_at: "2024-01-15T10:00:00Z",
            },
          ],
          pagination: {
            total: 1,
            total_pages: 1,
            current_page: 1,
            from: 1,
            to: 1,
          },
        },
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
  });

  it("module loads", () => {
    expect(AdminTopupHistoryPage).toBeDefined();
  });

  it("renders topup history page", async () => {
    renderWithProviders(<AdminTopupHistoryPage />);
    await waitFor(
      () => {
        expect(screen.getByRole("heading", { name: /Top-up History/i })).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders header with title and description", async () => {
    renderWithProviders(<AdminTopupHistoryPage />);
    await waitFor(
      () => {
        expect(screen.getByRole("heading", { name: /Top-up History/i })).toBeInTheDocument();
        expect(screen.queryByText(/View all top-up transaction history/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders search input", async () => {
    renderWithProviders(<AdminTopupHistoryPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const searchInput = screen.queryByPlaceholderText(/Search/i);
        expect(searchInput).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles search input change", async () => {
    renderWithProviders(<AdminTopupHistoryPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const searchInput = screen.queryByPlaceholderText(/Search/i);
        if (searchInput) {
          fireEvent.change(searchInput, { target: { value: "INV" } });
          expect(searchInput).toHaveValue("INV");
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles refresh button", async () => {
    renderWithProviders(<AdminTopupHistoryPage />);
    await waitFor(
      () => {
        const refreshBtn = screen.queryByText(/Refresh/i);
        if (refreshBtn) {
          fireEvent.click(refreshBtn);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        expect(mockRefetch).toHaveBeenCalled();
      },
      { timeout: 10000 }
    );
  });

  it("renders requests table", async () => {
    renderWithProviders(<AdminTopupHistoryPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("INV-001")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("shows loading state", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useGetManualTopupRequests as jest.MockedFunction<any>).mockReturnValue({
      data: null,
      isLoading: true,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<AdminTopupHistoryPage />);
    expect(screen.queryByText("Loading top-up history...")).toBeInTheDocument();
  });

  it("shows empty state", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useGetManualTopupRequests as jest.MockedFunction<any>).mockReturnValue({
      data: { message: { data: [] } },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<AdminTopupHistoryPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/No top-up history found/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles pagination", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useGetManualTopupRequests as jest.MockedFunction<any>).mockReturnValue({
      data: {
        message: {
          data: [{ id: 1, amount: 100, status: "approved" }],
          pagination: {
            total: 25,
            total_pages: 3,
            current_page: 1,
            from: 1,
            to: 10,
          },
        },
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<AdminTopupHistoryPage />);
    await waitFor(
      () => {
        const nextBtn = screen.queryByText(/Next/i);
        if (nextBtn && !nextBtn.hasAttribute("disabled")) {
          fireEvent.click(nextBtn);
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles different response formats", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useGetManualTopupRequests as jest.MockedFunction<any>).mockReturnValue({
      data: {
        data: {
          data: [{ id: 2, amount: 200, status: "approved" }],
        },
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<AdminTopupHistoryPage />);
    await waitFor(
      () => {
        expect(screen.getByRole("heading", { name: /Top-up History/i })).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles missing apiKey", () => {
    localStorage.removeItem("apiKey");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useGetManualTopupRequests as jest.MockedFunction<any>).mockReturnValue({
      data: null,
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<AdminTopupHistoryPage />);
    expect(screen.getByRole("heading", { name: /Top-up History/i })).toBeInTheDocument();
  });
});
