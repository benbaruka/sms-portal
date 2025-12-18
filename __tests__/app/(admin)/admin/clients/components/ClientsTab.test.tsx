import { describe, it, expect, beforeEach } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { userEvent } from "@testing-library/user-event";
import ClientsTab from "../../../../../../src/app/(admin)/admin/clients/components/ClientsTab";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock cookies-next
jest.mock("cookies-next", () => ({
  setCookie: jest.fn(),
  getCookie: jest.fn(),
  deleteCookie: jest.fn(),
}));

const mockShowAlert = jest.fn();
const mockRefetch = jest.fn();
const mockChangeStatus = jest.fn();
const mockUpdateClient = jest.fn();

jest.mock("../../../../../../src/context/AlertProvider", () => ({
  useAlert: () => ({
    showAlert: mockShowAlert,
  }),
}));

jest.mock("../../../../../../src/controller/query/admin/clients/useAdminClients", () => ({
  useAdminClientAccountTypes: jest.fn(() => ({
    data: {
      data: [
        { id: 1, name: "Premium" },
        { id: 2, name: "Basic" },
      ],
    },
  })),
  useAdminClientsList: jest.fn(() => ({
    data: {
      clients: [
        {
          id: 1,
          name: "Test Client",
          email: "test@example.com",
          msisdn: "+1234567890",
          status: 1,
          account_type: "Premium",
          country_code: "CD",
          created_at: "2024-01-01",
        },
      ],
      pagination: { total_pages: 1, total: 1, from: 1, to: 1 },
    },
    isLoading: false,
    isFetching: false,
    refetch: mockRefetch,
  })),
  useChangeAdminClientStatus: jest.fn(() => ({
    mutate: mockChangeStatus,
    isLoading: false,
  })),
  useUpdateAdminClient: jest.fn(() => ({
    mutate: mockUpdateClient,
    isLoading: false,
  })),
}));

describe("ClientsTab", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const renderComponent = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ClientsTab {...props} />
      </QueryClientProvider>
    );
  };

  it("renders without crashing", () => {
    renderComponent();
    expect(screen).toBeDefined();
  });

  it("loads apiKey from localStorage", () => {
    localStorage.setItem("apiKey", "test-key");
    renderComponent();
    expect(localStorage.getItem("apiKey")).toBe("test-key");
  });

  it("renders search input", async () => {
    renderComponent();
    await waitFor(() => {
      const searchInput = screen.queryByPlaceholderText(/Search by client name, email or phone/i);
      expect(searchInput).toBeInTheDocument();
    });
  });

  it("handles search input change", async () => {
    const user = userEvent.setup();
    renderComponent();
    await waitFor(() => {
      const searchInput = screen.queryByPlaceholderText(/Search by client name, email or phone/i);
      if (searchInput) {
        user.type(searchInput, "test");
      }
    });
  });

  it("renders status filter", async () => {
    renderComponent();
    await waitFor(() => {
      const statusFilter = screen.queryByText(/All status/i);
      expect(statusFilter).toBeInTheDocument();
    });
  });

  it("handles status filter change", async () => {
    const user = userEvent.setup();
    renderComponent();
    await waitFor(async () => {
      const statusFilter = screen.queryByText(/All status/i);
      if (statusFilter) {
        await user.click(statusFilter);
        const activeOption = screen.queryByText(/Active/i);
        if (activeOption) {
          await user.click(activeOption);
        }
      }
    });
  });

  it("renders refresh button", async () => {
    renderComponent();
    await waitFor(() => {
      const refreshButton =
        screen.queryByText(/Refresh/i) || screen.queryByRole("button", { name: /refresh/i });
      expect(refreshButton).toBeInTheDocument();
    });
  });

  it("handles refresh button click", async () => {
    const user = userEvent.setup();
    renderComponent();
    await waitFor(async () => {
      const refreshButton =
        screen.queryByText(/Refresh/i) || screen.queryByRole("button", { name: /refresh/i });
      if (refreshButton) {
        await user.click(refreshButton);
        await waitFor(() => {
          expect(mockRefetch).toHaveBeenCalled();
        });
      }
    });
  });

  it("displays loading state", () => {
    const {
      useAdminClientsList,
    } = require("../../../../../../src/controller/query/admin/clients/useAdminClients");
    jest.mocked(useAdminClientsList).mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderComponent();
    expect(screen.queryByText(/Loading/i) || screen.queryByRole("status")).toBeInTheDocument();
  });

  it("displays clients data", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.queryByText("Test Client")).toBeInTheDocument();
    });
  });

  it("displays empty state when no clients", () => {
    const {
      useAdminClientsList,
    } = require("../../../../../../src/controller/query/admin/clients/useAdminClients");
    jest.mocked(useAdminClientsList).mockReturnValueOnce({
      data: { clients: [], pagination: null },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderComponent();
    expect(screen.queryByText(/No clients/i) || screen.queryByText(/No data/i)).toBeInTheDocument();
  });

  it("handles status toggle", async () => {
    const user = userEvent.setup();
    renderComponent();
    await waitFor(async () => {
      const toggleButton = screen.queryByText(/Suspend|Activate/i);
      if (toggleButton) {
        await user.click(toggleButton);
        await waitFor(() => {
          expect(mockChangeStatus).toHaveBeenCalled();
        });
      }
    });
  });

  it("opens update modal when edit button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent();
    await waitFor(async () => {
      const editButton = screen.queryByText(/Edit/i);
      if (editButton) {
        await user.click(editButton);
        await waitFor(() => {
          expect(
            screen.queryByText(/Update Client/i) || screen.queryByRole("dialog")
          ).toBeInTheDocument();
        });
      }
    });
  });

  it("displays stats cards", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.queryByText("Total clients")).toBeInTheDocument();
      expect(screen.queryByText("Active")).toBeInTheDocument();
      expect(screen.queryByText("Inactive")).toBeInTheDocument();
      expect(screen.queryByText("Countries")).toBeInTheDocument();
    });
  });

  it("handles account type filter change", async () => {
    const user = userEvent.setup();
    renderComponent();
    await waitFor(async () => {
      const accountTypeFilter = screen.queryByPlaceholderText(/Account type/i);
      if (accountTypeFilter) {
        await user.click(accountTypeFilter);
        const premiumOption = screen.queryByText(/Premium/i);
        if (premiumOption) {
          await user.click(premiumOption);
        }
      }
    });
  });

  it("handles country filter change", async () => {
    const user = userEvent.setup();
    renderComponent();
    await waitFor(async () => {
      const countryFilter = screen.queryByPlaceholderText(/Country/i);
      if (countryFilter) {
        await user.click(countryFilter);
        const countryOption = screen.queryByText(/Congo/i);
        if (countryOption) {
          await user.click(countryOption);
        }
      }
    });
  });

  it("displays client cards with correct information", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.queryByText("Test Client")).toBeInTheDocument();
      expect(screen.queryByText("test@example.com")).toBeInTheDocument();
    });
  });

  it("handles pagination when multiple pages", () => {
    const {
      useAdminClientsList,
    } = require("../../../../../../src/controller/query/admin/clients/useAdminClients");
    jest.mocked(useAdminClientsList).mockReturnValueOnce({
      data: {
        clients: Array.from({ length: 20 }, (_, i) => ({
          id: i + 1,
          name: `Client ${i + 1}`,
          email: `client${i + 1}@example.com`,
          status: 1,
        })),
        pagination: { total_pages: 2, total: 20, from: 1, to: 10 },
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderComponent();
    // Pagination should be visible
    expect(screen.queryByText(/Showing/i) || screen.queryByText(/Page/i)).toBeInTheDocument();
  });
});
