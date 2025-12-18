
import {
  fireEvent as testingLibraryFireEvent,
  screen as testingLibraryScreen,
} from "@testing-library/react";
import ClientStatusPage from "../../../../../../src/app/(admin)/admin/clients/status/page";
import { renderWithProviders, waitFor } from "../../../../../test-utils";

// Use screen and fireEvent directly from @testing-library/react for proper TypeScript types
const screen: typeof testingLibraryScreen = testingLibraryScreen;
const fireEvent: typeof testingLibraryFireEvent = testingLibraryFireEvent;

const mockRefetch = jest.fn();
const mockChangeStatus = jest.fn();

jest.mock("@/controller/query/admin/clients/useAdminClients", () => ({
  useAdminClientsList: jest.fn(),
  useChangeAdminClientStatus: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams("id=test-id"),
  usePathname: () => "/admin/clients/status",
}));

import * as hooks from "../../../../../../src/controller/query/admin/clients/useAdminClients";

describe("app/(admin)/admin/clients/status/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
    mockRefetch.mockResolvedValue({});
    mockChangeStatus.mockResolvedValue({});

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientsList as jest.MockedFunction<any>).mockReturnValue({
      data: {
        clients: [
          {
            id: 1,
            name: "Test Client",
            email: "test@test.com",
            msisdn: "+243900000000",
            status: 1,
            created_at: "2024-01-15T10:00:00Z",
          },
        ],
        pagination: { total: 1, total_pages: 1, current_page: 1, from: 1, to: 1 },
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useChangeAdminClientStatus as jest.MockedFunction<any>).mockReturnValue({
      mutateAsync: mockChangeStatus,
      isPending: false,
    });
  });

  it("module loads", () => {
    expect(ClientStatusPage).toBeDefined();
  });

  it("renders client status page", async () => {
    renderWithProviders(<ClientStatusPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Control client access status/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders header with title and description", async () => {
    renderWithProviders(<ClientStatusPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Control client access status/i)).toBeInTheDocument();
        expect(screen.queryByText(/Quickly activate or suspend tenants/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders refresh button", async () => {
    renderWithProviders(<ClientStatusPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Refresh list/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("displays stats cards", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientsList as jest.MockedFunction<any>).mockReturnValue({
      data: {
        clients: [
          { id: 1, status: 1 },
          { id: 2, status: 0 },
        ],
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<ClientStatusPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("Total monitored")).toBeInTheDocument();
        expect(screen.queryByText("Active")).toBeInTheDocument();
        expect(screen.queryByText("Inactive")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders search input", async () => {
    renderWithProviders(<ClientStatusPage />);
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
    renderWithProviders(<ClientStatusPage />);
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

  it("handles status filter buttons", async () => {
    renderWithProviders(<ClientStatusPage />);
    await waitFor(
      () => {
        const allBtn = screen.queryByText(/^All$/i);
        const activeBtn = screen.queryByText(/^Active$/i);
        const inactiveBtn = screen.queryByText(/^Inactive$/i);

        if (allBtn) fireEvent.click(allBtn);
        if (activeBtn) fireEvent.click(activeBtn);
        if (inactiveBtn) fireEvent.click(inactiveBtn);
      },
      { timeout: 10000 }
    );
  });

  it("handles refresh button", async () => {
    renderWithProviders(<ClientStatusPage />);
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

  it("shows loading state", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientsList as jest.MockedFunction<any>).mockReturnValue({
      data: null,
      isLoading: true,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<ClientStatusPage />);
    expect(screen.queryByText("Loading client statuses...")).toBeInTheDocument();
  });

  it("shows empty state", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientsList as jest.MockedFunction<any>).mockReturnValue({
      data: { clients: [] },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<ClientStatusPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/No clients match/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders clients table", async () => {
    renderWithProviders(<ClientStatusPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("Test Client")).toBeInTheDocument();
        expect(screen.queryByText("test@test.com")).toBeInTheDocument();
        expect(screen.queryByText("+243900000000")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles status toggle - suspend", async () => {
    renderWithProviders(<ClientStatusPage />);
    await waitFor(
      () => {
        const suspendBtn = screen.queryByText(/Suspend/i);
        if (suspendBtn) {
          fireEvent.click(suspendBtn);
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles status toggle - activate", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientsList as jest.MockedFunction<any>).mockReturnValue({
      data: {
        clients: [
          {
            id: 1,
            name: "Inactive Client",
            status: 0,
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<ClientStatusPage />);
    await waitFor(
      () => {
        const activateBtn = screen.queryByText(/Activate/i);
        if (activateBtn) {
          fireEvent.click(activateBtn);
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles status toggle without apiKey", async () => {
    localStorage.removeItem("apiKey");
    renderWithProviders(<ClientStatusPage />);
    await waitFor(
      () => {
        const suspendBtn = screen.queryByText(/Suspend/i);
        if (suspendBtn) {
          fireEvent.click(suspendBtn);
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles pagination", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientsList as jest.MockedFunction<any>).mockReturnValue({
      data: {
        clients: [{ id: 1, name: "Client", status: 1 }],
        pagination: { total: 25, total_pages: 3, current_page: 1, from: 1, to: 12 },
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<ClientStatusPage />);
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

  it("handles refresh error", async () => {
    mockRefetch.mockRejectedValue(new Error("Network error"));
    renderWithProviders(<ClientStatusPage />);
    await waitFor(
      () => {
        const refreshBtn = screen.queryByText(/Refresh/i);
        if (refreshBtn) {
          fireEvent.click(refreshBtn);
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles different response formats", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientsList as jest.MockedFunction<any>).mockReturnValue({
      data: {
        message: {
          clients: [{ id: 1, name: "Client Message", status: 1 }],
        },
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<ClientStatusPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("Client Message")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles client with missing fields", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientsList as jest.MockedFunction<any>).mockReturnValue({
      data: {
        clients: [
          {
            id: 1,
            name: undefined,
            email: undefined,
            msisdn: undefined,
            status: 1,
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<ClientStatusPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("--")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles client with company_name instead of name", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientsList as jest.MockedFunction<any>).mockReturnValue({
      data: {
        clients: [
          {
            id: 1,
            company_name: "Company Client",
            status: 1,
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<ClientStatusPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("Company Client")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles client with phone instead of msisdn", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientsList as jest.MockedFunction<any>).mockReturnValue({
      data: {
        clients: [
          {
            id: 1,
            name: "Phone Client",
            phone: "+243900000001",
            status: 1,
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<ClientStatusPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("Phone Client")).toBeInTheDocument();
        expect(screen.queryByText("+243900000001")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles isRefreshing state", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientsList as jest.MockedFunction<any>).mockReturnValue({
      data: { clients: [] },
      isLoading: false,
      isFetching: true,
      refetch: mockRefetch,
    });
    renderWithProviders(<ClientStatusPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Syncing/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles pagination with last_page", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientsList as jest.MockedFunction<any>).mockReturnValue({
      data: {
        clients: [{ id: 1, name: "Client", status: 1 }],
        pagination: { total: 25, last_page: 3, current_page: 1, from: 1, to: 12 },
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<ClientStatusPage />);
    await waitFor(
      () => {
        // The pagination text format is "Page {page} of {total_pages || last_page || 1}"
        expect(screen.queryByText(/Page \d+ of \d+/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles client with created date", async () => {
    renderWithProviders(<ClientStatusPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("Test Client")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles client with createdOn instead of created_at", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientsList as jest.MockedFunction<any>).mockReturnValue({
      data: {
        clients: [
          {
            id: 1,
            name: "CreatedOn Client",
            createdOn: "2024-01-15T10:00:00Z",
            status: 1,
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<ClientStatusPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("CreatedOn Client")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles missing apiKey", () => {
    localStorage.removeItem("apiKey");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientsList as jest.MockedFunction<any>).mockReturnValue({
      data: null,
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<ClientStatusPage />);
    expect(screen.queryByText(/Control client access status/i)).toBeInTheDocument();
  });
});
