
import {
  fireEvent as testingLibraryFireEvent,
  screen as testingLibraryScreen,
} from "@testing-library/react";
import KYBHistoryPage from "../../../../../../src/app/(admin)/admin/kyb/history/page";
import { renderWithProviders, waitFor } from "../../../../../test-utils";

// Use screen and fireEvent directly from @testing-library/react for proper TypeScript types
const screen: typeof testingLibraryScreen = testingLibraryScreen;
const fireEvent: typeof testingLibraryFireEvent = testingLibraryFireEvent;

const mockRefetch = jest.fn();
const mockPush = jest.fn();

jest.mock("@/controller/query/admin/kyb/useAdminKYB", () => ({
  useAdminKYBHistory: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
  }),
}));

import * as hooks from "../../../../../../src/controller/query/admin/kyb/useAdminKYB";

describe("app/(admin)/admin/kyb/history/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
    mockRefetch.mockResolvedValue({});
    mockPush.mockReturnValue(undefined);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminKYBHistory as jest.MockedFunction<any>).mockReturnValue({
      data: {
        records: [
          {
            id: 1,
            client_id: 101,
            client_name: "Client A",
            status: "approved",
            submitted_at: "2023-01-01T10:00:00Z",
          },
        ],
        pagination: {
          total: 1,
          per_page: 10,
          current_page: 1,
          last_page: 1,
          from: 1,
          to: 1,
        },
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
  });

  it("module loads", () => {
    expect(KYBHistoryPage).toBeDefined();
  });

  it("renders KYB history page", async () => {
    renderWithProviders(<KYBHistoryPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/KYB History/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders header with title and description", async () => {
    renderWithProviders(<KYBHistoryPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/KYB History/i)).toBeInTheDocument();
        expect(screen.queryByText(/View all processed KYB requests/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders search input", async () => {
    renderWithProviders(<KYBHistoryPage />);
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
    renderWithProviders(<KYBHistoryPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const searchInput = screen.queryByPlaceholderText(/Search/i);
        if (searchInput) {
          fireEvent.change(searchInput, { target: { value: "Client A" } });
          expect(searchInput).toHaveValue("Client A");
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles status filter", async () => {
    renderWithProviders(<KYBHistoryPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const statusSelect = screen.queryByLabelText(/Filter by status/i);
        if (statusSelect) {
          fireEvent.change(statusSelect, { target: { value: "approved" } });
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles refresh button", async () => {
    renderWithProviders(<KYBHistoryPage />);
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

  it("renders history records table", async () => {
    renderWithProviders(<KYBHistoryPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("Client A")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles view button click", async () => {
    renderWithProviders(<KYBHistoryPage />);
    await waitFor(
      () => {
        const viewBtn =
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryByTitle(/View/i) ||
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryAllByRole("button")[0];
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
    (hooks.useAdminKYBHistory as jest.MockedFunction<any>).mockReturnValue({
      data: null,
      isLoading: true,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<KYBHistoryPage />);
    expect(screen.queryByText("Loading KYB history...")).toBeInTheDocument();
  });

  it("shows empty state", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminKYBHistory as jest.MockedFunction<any>).mockReturnValue({
      data: { records: [] },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<KYBHistoryPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/No KYB records found/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles pagination", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminKYBHistory as jest.MockedFunction<any>).mockReturnValue({
      data: {
        records: [{ id: 1, client_id: 101, client_name: "Client A", status: "approved" }],
        pagination: {
          total: 25,
          per_page: 10,
          current_page: 1,
          last_page: 3,
          from: 1,
          to: 10,
        },
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<KYBHistoryPage />);
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
    (hooks.useAdminKYBHistory as jest.MockedFunction<any>).mockReturnValue({
      data: {
        message: {
          data: [{ id: 2, client_id: 102, client_name: "Client B", status: "rejected" }],
        },
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<KYBHistoryPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/KYB History/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles missing apiKey", () => {
    localStorage.removeItem("apiKey");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminKYBHistory as jest.MockedFunction<any>).mockReturnValue({
      data: null,
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<KYBHistoryPage />);
    expect(screen.queryByText(/KYB History/i)).toBeInTheDocument();
  });
});
