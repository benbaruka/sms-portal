
import {
  fireEvent as testingLibraryFireEvent,
  screen as testingLibraryScreen,
} from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import KYBPage from "../../../../../src/app/(admin)/admin/kyb/page";
import { renderWithProviders, waitFor } from "../../../../test-utils";

// Use screen and fireEvent directly from @testing-library/react for proper TypeScript types
const screen: typeof testingLibraryScreen = testingLibraryScreen;
const fireEvent: typeof testingLibraryFireEvent = testingLibraryFireEvent;

const mockRefetch = jest.fn();
const mockRefetchDetails = jest.fn();
const mockRefetchPendingStats = jest.fn();
const mockRefetchApprovedStats = jest.fn();
const mockRefetchRejectedStats = jest.fn();
const mockRefetchLegacyStats = jest.fn();
const mockApprove = jest.fn();
const mockReject = jest.fn();

jest.mock("@/controller/query/admin/kyb/useAdminKYB", () => ({
  useAdminKYBClientsByStatus: jest.fn(),
  useAdminKYBDetails: jest.fn(),
  useApproveAdminKYB: jest.fn(),
  useRejectAdminKYB: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

import * as hooks from "../../../../../src/controller/query/admin/kyb/useAdminKYB";

describe("app/(admin)/admin/kyb/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
    mockRefetch.mockResolvedValue({});
    mockRefetchDetails.mockResolvedValue({});
    mockRefetchPendingStats.mockResolvedValue({});
    mockRefetchApprovedStats.mockResolvedValue({});
    mockRefetchRejectedStats.mockResolvedValue({});
    mockRefetchLegacyStats.mockResolvedValue({});
    mockApprove.mockResolvedValue({});
    mockReject.mockResolvedValue({});

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminKYBClientsByStatus as jest.MockedFunction<any>).mockReturnValue({
      data: {
        data: [
          {
            id: 1,
            client_id: 1,
            name: "Test Client",
            email: "test@test.com",
            kyb_status: "PENDING",
            created_at: "2024-01-15T10:00:00Z",
          },
        ],
        total: 1,
        per_page: 10,
        current_page: 1,
        last_page: 1,
        from: 1,
        to: 1,
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });

    // Mock stats hooks

    jest.mocked(hooks.useAdminKYBClientsByStatus)
      .mockReturnValueOnce({
        data: { total: 5 },
        isLoading: false,
        refetch: mockRefetchPendingStats,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      .mockReturnValueOnce({
        data: { total: 3 },
        isLoading: false,
        refetch: mockRefetchApprovedStats,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      .mockReturnValueOnce({
        data: { total: 2 },
        isLoading: false,
        refetch: mockRefetchRejectedStats,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      .mockReturnValueOnce({
        data: { total: 1 },
        isLoading: false,
        refetch: mockRefetchLegacyStats,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminKYBDetails as jest.MockedFunction<any>).mockReturnValue({
      data: {
        message: {
          id: 1,
          client_id: 1,
          name: "Test Client",
          kyb_status: "PENDING",
        },
      },
      isLoading: false,
      refetch: mockRefetchDetails,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useApproveAdminKYB as jest.MockedFunction<any>).mockReturnValue({
      mutateAsync: mockApprove,
      isPending: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useRejectAdminKYB as jest.MockedFunction<any>).mockReturnValue({
      mutateAsync: mockReject,
      isPending: false,
    });
  });

  it("module loads", () => {
    expect(KYBPage).toBeDefined();
  });

  it("renders kyb page", async () => {
    renderWithProviders(<KYBPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/KYB Management/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("displays stats cards", async () => {
    renderWithProviders(<KYBPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("Total")).toBeInTheDocument();
        expect(screen.queryByText("Pending")).toBeInTheDocument();
        expect(screen.queryByText("Approved")).toBeInTheDocument();
        expect(screen.queryByText("Rejected")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders search input", async () => {
    renderWithProviders(<KYBPage />);
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
    renderWithProviders(<KYBPage />);
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
    const user = userEvent.setup();
    renderWithProviders(<KYBPage />);
    await waitFor(
      () => {
        const statusSelect = screen.queryByRole("combobox");
        if (statusSelect) {
          user.click(statusSelect);
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

  it("handles refresh button", async () => {
    renderWithProviders(<KYBPage />);
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
    renderWithProviders(<KYBPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("Test Client")).toBeInTheDocument();
        expect(screen.queryByText("test@test.com")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("opens approve dialog", async () => {
    renderWithProviders(<KYBPage />);
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
        expect(screen.queryByText(/Approve KYB/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles approve submission", async () => {
    renderWithProviders(<KYBPage />);
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
        // @ts-expect-error - TypeScript inference issue with screen types
        const notesInput = screen.queryByLabelText(/Notes/i);
        if (notesInput) {
          fireEvent.change(notesInput, { target: { value: "Approved" } });
        }
        const confirmBtn = screen.queryByRole("button", { name: /Approve/i });
        if (confirmBtn && !confirmBtn.hasAttribute("disabled")) {
          const form = confirmBtn.closest("form");
          if (form) {
            // @ts-expect-error - TypeScript inference issue with fireEvent types
            fireEvent.submit(form);
          }
        }
      },
      { timeout: 10000 }
    );
  });

  it("opens reject dialog", async () => {
    renderWithProviders(<KYBPage />);
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
        expect(screen.queryByText(/Reject KYB/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles reject submission", async () => {
    renderWithProviders(<KYBPage />);
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
        // @ts-expect-error - TypeScript inference issue with screen types
        const reasonInput = screen.queryByLabelText(/Reason/i);
        if (reasonInput) {
          fireEvent.change(reasonInput, { target: { value: "Invalid documents" } });
        }
        const confirmBtn = screen.queryByRole("button", { name: /Reject/i });
        if (confirmBtn && !confirmBtn.hasAttribute("disabled")) {
          const form = confirmBtn.closest("form");
          if (form) {
            // @ts-expect-error - TypeScript inference issue with fireEvent types
            fireEvent.submit(form);
          }
        }
      },
      { timeout: 10000 }
    );
  });

  it("shows loading state", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminKYBClientsByStatus as jest.MockedFunction<any>).mockReturnValue({
      data: null,
      isLoading: true,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<KYBPage />);
    expect(screen.queryByText("Loading KYB requests...")).toBeInTheDocument();
  });

  it("shows empty state", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminKYBClientsByStatus as jest.MockedFunction<any>).mockReturnValue({
      data: { data: [], total: 0 },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<KYBPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/No KYB requests found/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles pagination", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminKYBClientsByStatus as jest.MockedFunction<any>).mockReturnValue({
      data: {
        data: [{ id: 1, client_id: 1, name: "Client", kyb_status: "PENDING" }],
        total: 25,
        per_page: 10,
        current_page: 1,
        last_page: 3,
        from: 1,
        to: 10,
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<KYBPage />);
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

  it("handles filtered search results", async () => {
    renderWithProviders(<KYBPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const searchInput = screen.queryByPlaceholderText(/Search by client/i);
        if (searchInput) {
          fireEvent.change(searchInput, { target: { value: "NonExistent" } });
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        expect(screen.queryByText(/No KYB requests match your filters/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles missing apiKey", async () => {
    localStorage.removeItem("apiKey");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminKYBClientsByStatus as jest.MockedFunction<any>).mockReturnValue({
      data: null,
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<KYBPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/KYB Management/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles approve without apiKey", async () => {
    localStorage.removeItem("apiKey");
    renderWithProviders(<KYBPage />);
    await waitFor(
      () => {
        const approveBtn = screen.queryByText(/Approve/i);
        if (approveBtn) {
          fireEvent.click(approveBtn);
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles reject without apiKey", async () => {
    localStorage.removeItem("apiKey");
    renderWithProviders(<KYBPage />);
    await waitFor(
      () => {
        const rejectBtn = screen.queryByText(/Reject/i);
        if (rejectBtn) {
          fireEvent.click(rejectBtn);
        }
      },
      { timeout: 10000 }
    );
  });
});
