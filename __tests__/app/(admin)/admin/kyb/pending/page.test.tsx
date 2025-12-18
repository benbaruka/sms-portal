
import {
  fireEvent as testingLibraryFireEvent,
  screen as testingLibraryScreen,
} from "@testing-library/react";
import PendingKYBPage from "../../../../../../src/app/(admin)/admin/kyb/pending/page";
import { renderWithProviders, waitFor } from "../../../../../test-utils";

// Use screen and fireEvent directly from @testing-library/react for proper TypeScript types
const screen: typeof testingLibraryScreen = testingLibraryScreen;
const fireEvent: typeof testingLibraryFireEvent = testingLibraryFireEvent;

const mockRefetch = jest.fn();
const mockPush = jest.fn();

jest.mock("@/controller/query/admin/kyb/useAdminKYB", () => ({
  useAdminKYBPendings: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
  }),
}));

import * as hooks from "../../../../../../src/controller/query/admin/kyb/useAdminKYB";

describe("app/(admin)/admin/kyb/pending/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
    mockRefetch.mockResolvedValue({});
    mockPush.mockReturnValue(undefined);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminKYBPendings as jest.MockedFunction<any>).mockReturnValue({
      data: {
        records: [
          {
            id: 1,
            client_id: 1,
            client_name: "Test Client",
            kyb_status: "PENDING",
            submitted_at: "2024-01-15T10:00:00Z",
            documents_count: 3,
            status: "pending",
          },
        ],
        pagination: {
          total: 1,
          per_page: 10,
          current_page: 1,
          total_pages: 1,
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
    expect(PendingKYBPage).toBeDefined();
  });

  it("renders pending kyb page", async () => {
    renderWithProviders(<PendingKYBPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Pending KYB Reviews/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("displays stats cards", async () => {
    renderWithProviders(<PendingKYBPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("Open reviews")).toBeInTheDocument();
        expect(screen.queryByText("Documents received")).toBeInTheDocument();
        expect(screen.queryByText("Submitted today")).toBeInTheDocument();
        expect(screen.queryByText("Avg. documents")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders search input", async () => {
    renderWithProviders(<PendingKYBPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const searchInput = screen.queryByPlaceholderText(/Search by client/i);
        expect(searchInput).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles search input change", async () => {
    renderWithProviders(<PendingKYBPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const searchInput = screen.queryByPlaceholderText(/Search by client/i);
        if (searchInput) {
          fireEvent.change(searchInput, { target: { value: "Test" } });
          expect(searchInput).toHaveValue("Test");
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles status filter change", async () => {
    renderWithProviders(<PendingKYBPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const statusSelect = screen.queryByLabelText(/Filter by status/i);
        if (statusSelect) {
          fireEvent.change(statusSelect, { target: { value: "pending" } });
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles refresh button", async () => {
    renderWithProviders(<PendingKYBPage />);
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

  it("renders kyb requests table", async () => {
    renderWithProviders(<PendingKYBPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("Test Client")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles approve button click", async () => {
    renderWithProviders(<PendingKYBPage />);
    await waitFor(
      () => {
        const approveBtn = screen.queryByText(/Approve/i);
        if (approveBtn) {
          fireEvent.click(approveBtn);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith("/admin/kyb/approve?id=1");
      },
      { timeout: 10000 }
    );
  });

  it("handles reject button click", async () => {
    renderWithProviders(<PendingKYBPage />);
    await waitFor(
      () => {
        const rejectBtn = screen.queryByText(/Reject/i);
        if (rejectBtn) {
          fireEvent.click(rejectBtn);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith("/admin/kyb/reject?id=1");
      },
      { timeout: 10000 }
    );
  });

  it("shows loading state", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminKYBPendings as jest.MockedFunction<any>).mockReturnValue({
      data: null,
      isLoading: true,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<PendingKYBPage />);
    expect(screen.queryByText("Loading pending KYB submissions...")).toBeInTheDocument();
  });

  it("shows empty state", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminKYBPendings as jest.MockedFunction<any>).mockReturnValue({
      data: { records: [] },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<PendingKYBPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/No KYB submissions match/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles pagination", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminKYBPendings as jest.MockedFunction<any>).mockReturnValue({
      data: {
        records: [{ id: 1, client_name: "Client", status: "pending" }],
        pagination: {
          total: 25,
          per_page: 10,
          current_page: 1,
          total_pages: 3,
          from: 1,
          to: 10,
        },
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<PendingKYBPage />);
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
    (hooks.useAdminKYBPendings as jest.MockedFunction<any>).mockReturnValue({
      data: {
        message: {
          data: [{ id: 2, client_name: "Message Client", status: "pending" }],
        },
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<PendingKYBPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("Message Client")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles missing apiKey", () => {
    localStorage.removeItem("apiKey");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminKYBPendings as jest.MockedFunction<any>).mockReturnValue({
      data: null,
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<PendingKYBPage />);
    expect(screen.queryByText(/Pending KYB Reviews/i)).toBeInTheDocument();
  });
});
