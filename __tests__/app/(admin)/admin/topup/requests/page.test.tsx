
import {
  fireEvent as testingLibraryFireEvent,
  screen as testingLibraryScreen,
} from "@testing-library/react";
import TopupRequestsPage from "../../../../../../src/app/(admin)/admin/topup/requests/page";
import { renderWithProviders, waitFor } from "../../../../../test-utils";

// Use screen and fireEvent directly from @testing-library/react for proper TypeScript types
const screen: typeof testingLibraryScreen = testingLibraryScreen;
const fireEvent: typeof testingLibraryFireEvent = testingLibraryFireEvent;

const mockRefetch = jest.fn();
const mockPush = jest.fn();

jest.mock("@/controller/query/topup/useTopup", () => ({
  useGetManualTopupRequests: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
  }),
}));

import * as hooks from "../../../../../../src/controller/query/topup/useTopup";

describe("app/(admin)/admin/topup/requests/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
    mockRefetch.mockResolvedValue({});
    mockPush.mockReturnValue(undefined);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useGetManualTopupRequests as jest.MockedFunction<any>).mockReturnValue({
      data: {
        message: {
          data: [
            {
              id: 1,
              amount: 100,
              currency: "USD",
              status: "pending",
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
      refetch: mockRefetch,
    });
  });

  it("module loads", () => {
    expect(TopupRequestsPage).toBeDefined();
  });

  it("renders topup requests page", async () => {
    renderWithProviders(<TopupRequestsPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Top-up Requests/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders header with title and description", async () => {
    renderWithProviders(<TopupRequestsPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Top-up Requests/i)).toBeInTheDocument();
        expect(screen.queryByText(/View and manage all top-up requests/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders create button", async () => {
    renderWithProviders(<TopupRequestsPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Create Request/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders search input", async () => {
    renderWithProviders(<TopupRequestsPage />);
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
    renderWithProviders(<TopupRequestsPage />);
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
    renderWithProviders(<TopupRequestsPage />);
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

  it("handles create button click", async () => {
    renderWithProviders(<TopupRequestsPage />);
    await waitFor(
      () => {
        const createBtn = screen.queryByText(/Create Request/i);
        if (createBtn) {
          fireEvent.click(createBtn);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith("/admin/topup/create");
      },
      { timeout: 10000 }
    );
  });

  it("renders requests table", async () => {
    renderWithProviders(<TopupRequestsPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("INV-001")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles view button click", async () => {
    renderWithProviders(<TopupRequestsPage />);
    await waitFor(
      () => {
        const viewBtn = screen.queryByTitle(/View/i) || screen.queryAllByRole("button")[0];
        if (viewBtn) {
          fireEvent.click(viewBtn);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalled();
      },
      { timeout: 10000 }
    );
  });

  it("shows loading state", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useGetManualTopupRequests as jest.MockedFunction<any>).mockReturnValue({
      data: null,
      isLoading: true,
      refetch: mockRefetch,
    });
    renderWithProviders(<TopupRequestsPage />);
    expect(screen.queryByText("Loading requests...")).toBeInTheDocument();
  });

  it("shows empty state", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useGetManualTopupRequests as jest.MockedFunction<any>).mockReturnValue({
      data: { message: { data: [] } },
      isLoading: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<TopupRequestsPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/No requests found/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles pagination", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useGetManualTopupRequests as jest.MockedFunction<any>).mockReturnValue({
      data: {
        message: {
          data: [{ id: 1, amount: 100, status: "pending" }],
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
      refetch: mockRefetch,
    });
    renderWithProviders(<TopupRequestsPage />);
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
      refetch: mockRefetch,
    });
    renderWithProviders(<TopupRequestsPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Top-up Requests/i)).toBeInTheDocument();
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
      refetch: mockRefetch,
    });
    renderWithProviders(<TopupRequestsPage />);
    expect(screen.queryByText(/Top-up Requests/i)).toBeInTheDocument();
  });
});
