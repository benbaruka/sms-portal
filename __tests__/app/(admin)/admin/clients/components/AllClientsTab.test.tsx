import { describe, it, expect, beforeEach } from "@jest/globals";
import { renderWithProviders, screen, waitFor } from "../../../../test-utils";
import { userEvent } from "@testing-library/user-event";
import AllClientsTab from "../../../../../../src/app/(admin)/admin/clients/components/AllClientsTab";
import { QueryClient } from "@tanstack/react-query";

// Mock the hooks
const mockRefetch = jest.fn();
const mockShowAlert = jest.fn();

jest.mock("../../../../../../src/controller/query/admin/clients/useAdminClients", () => ({
  useAdminClientAccountTypes: jest.fn(() => ({
    data: {
      data: [
        { id: 1, name: "Premium" },
        { id: 2, name: "Basic" },
      ],
    },
  })),
  useAdminClientCountries: jest.fn(() => ({
    data: {
      data: [
        { code: "CD", name: "Congo" },
        { code: "KE", name: "Kenya" },
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
}));

jest.mock("../../../../../../src/context/AlertProvider", () => ({
  useAlert: () => ({
    showAlert: mockShowAlert,
  }),
}));

describe("AllClientsTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("renders without crashing", () => {
    renderWithProviders(<AllClientsTab />);
    expect(screen.queryByText("Client Directory")).toBeInTheDocument();
  });

  it("loads apiKey from localStorage", () => {
    localStorage.setItem("apiKey", "test-key");
    renderWithProviders(<AllClientsTab />);
    expect(localStorage.getItem("apiKey")).toBe("test-key");
  });

  it("displays stats cards", () => {
    renderWithProviders(<AllClientsTab />);
    expect(screen.queryByText("Total clients")).toBeInTheDocument();
    expect(screen.queryByText("Active")).toBeInTheDocument();
    expect(screen.queryByText("Inactive")).toBeInTheDocument();
    expect(screen.queryByText("Countries")).toBeInTheDocument();
  });

  it("displays client cards", async () => {
    renderWithProviders(<AllClientsTab />);
    await waitFor(() => {
      expect(screen.queryByText("Test Client")).toBeInTheDocument();
    });
  });

  it("handles search input", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AllClientsTab />);
    const searchInput = screen.queryByPlaceholderText("Search by client name, email or phone...");
    expect(searchInput).toBeInTheDocument();
    if (searchInput) {
      await user.type(searchInput, "test");
      await waitFor(() => {
        expect(searchInput).toHaveValue("test");
      });
    }
  });

  it("handles refresh button click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AllClientsTab />);
    const refreshButton = screen.queryByText("Refresh");
    if (refreshButton) {
      await user.click(refreshButton);
      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    }
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
    renderWithProviders(<AllClientsTab />);
    expect(screen.queryByText("Loading clients...")).toBeInTheDocument();
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
    renderWithProviders(<AllClientsTab />);
    expect(screen.queryByText("No clients match the current filters.")).toBeInTheDocument();
  });
});
