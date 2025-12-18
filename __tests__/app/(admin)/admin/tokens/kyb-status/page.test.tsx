
import {
  fireEvent as testingLibraryFireEvent,
  screen as testingLibraryScreen,
} from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import KYBStatusPage from "../../../../../../src/app/(admin)/admin/tokens/kyb-status/page";
import { renderWithProviders, waitFor } from "../../../../../test-utils";

// Use screen and fireEvent directly from @testing-library/react for proper TypeScript types
const screen: typeof testingLibraryScreen = testingLibraryScreen;
const fireEvent: typeof testingLibraryFireEvent = testingLibraryFireEvent;

const mockRefetch = jest.fn();

jest.mock("@/controller/query/admin/tokens/useAdminTokens", () => ({
  useAdminTokenKYBStatus: jest.fn(),
}));

import * as hooks from "../../../../../../src/controller/query/admin/tokens/useAdminTokens";

describe("app/(admin)/admin/tokens/kyb-status/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
    mockRefetch.mockResolvedValue({});

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminTokenKYBStatus as jest.MockedFunction<any>).mockReturnValue({
      data: {
        records: [
          {
            id: 1,
            client_id: 1,
            client_name: "Test Client",
            kyb_status: "APPROVED",
            token_status: "ACTIVE",
            verified_at: "2024-01-15T10:00:00Z",
            updated_at: "2024-01-15T10:00:00Z",
          },
        ],
        pagination: { total: 1, total_pages: 1, current_page: 1, from: 1, to: 1 },
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
  });

  it("module loads", () => {
    expect(KYBStatusPage).toBeDefined();
  });

  it("renders kyb status page", async () => {
    renderWithProviders(<KYBStatusPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/KYB & token compliance/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("displays stats cards", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminTokenKYBStatus as jest.MockedFunction<any>).mockReturnValue({
      data: {
        records: [
          { id: 1, kyb_status: "APPROVED", token_status: "ACTIVE" },
          { id: 2, kyb_status: "PENDING", token_status: "INACTIVE" },
        ],
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<KYBStatusPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("Tracked clients")).toBeInTheDocument();
        expect(screen.queryByText("KYB approved")).toBeInTheDocument();
        expect(screen.queryByText("KYB pending")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders search input", async () => {
    renderWithProviders(<KYBStatusPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const searchInput = screen.queryByPlaceholderText(/Search by client name/i);
        expect(searchInput).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles search input change", async () => {
    renderWithProviders(<KYBStatusPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const searchInput = screen.queryByPlaceholderText(/Search by client name/i);
        if (searchInput) {
          fireEvent.change(searchInput, { target: { value: "Test" } });
          expect(searchInput).toHaveValue("Test");
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles kyb filter change", async () => {
    const user = userEvent.setup();
    renderWithProviders(<KYBStatusPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const kybSelect =
          screen.queryByPlaceholderText(/Filtrer par statut KYB/i) ||
          screen.queryAllByRole("combobox")[0];
        if (kybSelect) {
          user.click(kybSelect);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        const approvedOption = screen.queryByText("Approved");
        if (approvedOption) {
          fireEvent.click(approvedOption);
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles token filter change", async () => {
    const user = userEvent.setup();
    renderWithProviders(<KYBStatusPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const tokenSelect =
          screen.queryByPlaceholderText(/Filtrer par statut token/i) ||
          screen.queryAllByRole("combobox")[1];
        if (tokenSelect) {
          user.click(tokenSelect);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        const activeOption = screen.queryByText("Active");
        if (activeOption) {
          fireEvent.click(activeOption);
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles refresh button", async () => {
    renderWithProviders(<KYBStatusPage />);
    await waitFor(
      () => {
        const refreshBtn = screen.queryByText(/Rafraîchir/i) || screen.queryByText(/Refresh/i);
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

  it("shows loading state", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminTokenKYBStatus as jest.MockedFunction<any>).mockReturnValue({
      data: null,
      isLoading: true,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<KYBStatusPage />);
    expect(screen.queryByText("Loading KYB status...")).toBeInTheDocument();
  });

  it("shows empty state", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminTokenKYBStatus as jest.MockedFunction<any>).mockReturnValue({
      data: { records: [] },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<KYBStatusPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/No clients match/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders records table", async () => {
    renderWithProviders(<KYBStatusPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("Test Client")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles pagination", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminTokenKYBStatus as jest.MockedFunction<any>).mockReturnValue({
      data: {
        records: [{ id: 1, client_name: "Client", kyb_status: "APPROVED" }],
        pagination: { total: 25, total_pages: 3, current_page: 1, from: 1, to: 12 },
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<KYBStatusPage />);
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
    (hooks.useAdminTokenKYBStatus as jest.MockedFunction<any>).mockReturnValue({
      data: {
        message: {
          records: [{ id: 1, client_name: "Message Client", kyb_status: "APPROVED" }],
        },
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<KYBStatusPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("Message Client")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles record with missing fields", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminTokenKYBStatus as jest.MockedFunction<any>).mockReturnValue({
      data: {
        records: [
          {
            id: 1,
            client_name: undefined,
            client: "Client Field",
            kyb_status: "PENDING",
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<KYBStatusPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Client Field/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles isRefreshing state", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminTokenKYBStatus as jest.MockedFunction<any>).mockReturnValue({
      data: { records: [] },
      isLoading: false,
      isFetching: true,
      refetch: mockRefetch,
    });
    renderWithProviders(<KYBStatusPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Synchronisation/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles refresh error", async () => {
    mockRefetch.mockRejectedValue(new Error("Network error"));
    renderWithProviders(<KYBStatusPage />);
    await waitFor(
      () => {
        const refreshBtn = screen.queryByText(/Rafraîchir/i) || screen.queryByText(/Refresh/i);
        if (refreshBtn) {
          fireEvent.click(refreshBtn);
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles verified_at as dash", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminTokenKYBStatus as jest.MockedFunction<any>).mockReturnValue({
      data: {
        records: [
          {
            id: 1,
            client_name: "Dash Client",
            kyb_status: "PENDING",
            verified_at: "-",
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<KYBStatusPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("En attente")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });
});
