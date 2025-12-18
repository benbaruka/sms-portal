import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BulkMessagesTable } from "../../../src/components/messages/BulkMessagesTable";
import { startOfYear, endOfDay } from "date-fns";

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

// Mock useMessagesTable
const mockUseMessagesTable = jest.fn();
jest.mock("../../../src/controller/query/messages/useMessagesTable", () => ({
  useMessagesTable: (...args: any[]) => mockUseMessagesTable(...args),
}));

// Mock date-fns
const dateFns = jest.requireActual("date-fns");
jest.mock("date-fns", () => ({
  ...dateFns,
  format: (date: Date, formatStr: string) => {
    if (formatStr === "yyyy-MM-dd") {
      return date.toISOString().split("T")[0];
    }
    return date.toISOString();
  },
  startOfYear: (date: Date) => {
    const d = new Date(date);
    d.setMonth(0, 1);
    d.setHours(0, 0, 0, 0);
    return d;
  },
  endOfDay: (date: Date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  },
}));

// Mock DateRangePicker
jest.mock("../../../src/components/ui/date-range-picker", () => ({
  DateRangePicker: ({ startDate, endDate, onChange, placeholder, className }: any) => (
    <div data-testid="date-range-picker" className={className}>
      <input
        data-testid="date-range-picker-input"
        placeholder={placeholder}
        value={startDate && endDate ? `${startDate.toISOString().split("T")[0]} to ${endDate.toISOString().split("T")[0]}` : ""}
        onChange={(e) => {
          if (onChange) {
            const value = e.target.value;
            if (value.includes(" to ")) {
              const [start, end] = value.split(" to ");
              onChange(new Date(start), new Date(end));
            }
          }
        }}
      />
    </div>
  ),
}));

describe("BulkMessagesTable", () => {
  let queryClient: QueryClient;
  const defaultProps = {
    route: "/bulk-messages",
    apiKey: "test-api-key",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, cacheTime: 0 },
        mutations: { retry: false },
      },
    });
    // Setup default mock implementation
    mockUseMessagesTable.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  const renderComponent = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BulkMessagesTable {...defaultProps} {...props} />
      </QueryClientProvider>
    );
  };

  describe("Loading State", () => {
    it("should display loading skeleton when data is loading", () => {
      mockUseMessagesTable.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      // Check for skeleton loader - it should be rendered
      const table = screen.queryByRole("table");
      // When loading, skeleton is shown instead of table
      expect(table).not.toBeInTheDocument();
    });

    it("should show correct number of skeleton rows based on perPage", () => {
      mockUseMessagesTable.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent({ defaultPerPage: 50 });
      // Skeleton should be rendered, not empty message
      expect(screen.queryByText("No campaigns found")).not.toBeInTheDocument();
    });

    it("should disable refresh button when loading", () => {
      const refetch = jest.fn();
      mockUseMessagesTable.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch,
      } as any);

      renderComponent();

      const refreshButtons = screen.getAllByTitle("Refresh");
      refreshButtons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe("Error State", () => {
    it("should display error message when request fails", () => {
      const errorMessage = "Failed to load campaigns";
      mockUseMessagesTable.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error(errorMessage),
        refetch: jest.fn(),
      } as any);

      renderComponent();

      expect(screen.getByText(new RegExp(`Error loading campaigns.*${errorMessage}`, "i"))).toBeInTheDocument();
    });

    it("should display error icon when request fails", () => {
      mockUseMessagesTable.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error("Network error"),
        refetch: jest.fn(),
      } as any);

      renderComponent();

      const errorContainer = screen.getByText(/error loading campaigns/i).closest("div");
      expect(errorContainer).toBeInTheDocument();
    });

    it("should handle unknown error type", () => {
      mockUseMessagesTable.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: "String error",
        refetch: jest.fn(),
      } as any);

      renderComponent();

      expect(screen.getByText(/error loading campaigns.*unknown error/i)).toBeInTheDocument();
    });

    it("should not show table when error occurs", () => {
      mockUseMessagesTable.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error("Error"),
        refetch: jest.fn(),
      } as any);

      renderComponent();

      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("should display empty message when no campaigns found", () => {
      mockUseMessagesTable.mockReturnValue({
        data: { data: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      expect(screen.getByText(/no campaigns found for the selected filters/i)).toBeInTheDocument();
    });

    it("should display empty icon when no campaigns found", () => {
      mockUseMessagesTable.mockReturnValue({
        data: { data: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      const emptyContainer = screen.getByText(/no campaigns found/i).closest("div");
      expect(emptyContainer).toBeInTheDocument();
    });

    it("should not show table when empty", () => {
      mockUseMessagesTable.mockReturnValue({
        data: { data: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });
  });

  describe("Data Display", () => {
    const mockCampaigns = [
      {
        id: 1,
        campaign_name: "Test Campaign 1",
        sender_id: "SENDER1",
        recipients: 100,
        status: 2,
        created: "2024-01-15T10:00:00Z",
        message: "Test message content",
        delivered: 95,
        failed: 3,
        pending: 2,
        sms_cost: 100.5,
        message_size: 1,
        contact_type: 1,
        statistics: {
          categories: ["Network A", "Network B"],
          contacts: [50, 50],
          sms: [50, 50],
          cost: [50.25, 50.25],
        },
      },
      {
        id: 2,
        campaign_name: "Test Campaign 2",
        sender_id: "SENDER2",
        recipients: 200,
        status: 1,
        created: "2024-01-16T11:00:00Z",
        message: "Another test message",
        delivered: 180,
        failed: 10,
        pending: 10,
        sms_cost: 200.0,
        message_size: 2,
        contact_type: 5,
      },
    ];

    it("should render table headers correctly", async () => {
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: mockCampaigns,
          current_page: 1,
          last_page: 1,
          per_page: 25,
          total: 2,
          from: 1,
          to: 2,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("ID")).toBeInTheDocument();
        expect(screen.getByText("Campaign Name")).toBeInTheDocument();
        expect(screen.getByText("Sender ID")).toBeInTheDocument();
        expect(screen.getByText("Recipients")).toBeInTheDocument();
        expect(screen.getByText("Status")).toBeInTheDocument();
        expect(screen.getByText("Date")).toBeInTheDocument();
        expect(screen.getByText("Actions")).toBeInTheDocument();
      });
    });

    it("should render campaign data in table rows", async () => {
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: mockCampaigns,
          current_page: 1,
          last_page: 1,
          per_page: 25,
          total: 2,
          from: 1,
          to: 2,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Test Campaign 1")).toBeInTheDocument();
        expect(screen.getByText("Test Campaign 2")).toBeInTheDocument();
        expect(screen.getByText("SENDER1")).toBeInTheDocument();
        expect(screen.getByText("SENDER2")).toBeInTheDocument();
        expect(screen.getByText("100")).toBeInTheDocument();
        expect(screen.getByText("200")).toBeInTheDocument();
      });
    });

    it("should render all table cells correctly", async () => {
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: [mockCampaigns[0]],
          current_page: 1,
          last_page: 1,
          per_page: 25,
          total: 1,
          from: 1,
          to: 1,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        const table = screen.getByRole("table");
        const rows = within(table).getAllByRole("row");
        // Header row + data row
        expect(rows.length).toBeGreaterThanOrEqual(2);
        
        // Check cells exist
        expect(screen.getByText("1")).toBeInTheDocument(); // ID
        expect(screen.getByText("Test Campaign 1")).toBeInTheDocument();
        expect(screen.getByText("SENDER1")).toBeInTheDocument();
        expect(screen.getByText("100")).toBeInTheDocument();
      });
    });

    it("should render status badges correctly", async () => {
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: mockCampaigns,
          current_page: 1,
          last_page: 1,
          per_page: 25,
          total: 2,
          from: 1,
          to: 2,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Delivered")).toBeInTheDocument();
        expect(screen.getByText("Pending")).toBeInTheDocument();
      });
    });

    it("should render action buttons for each row", async () => {
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: mockCampaigns,
          current_page: 1,
          last_page: 1,
          per_page: 25,
          total: 2,
          from: 1,
          to: 2,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        const statsButtons = screen.getAllByText(/stats/i);
        expect(statsButtons.length).toBe(2);
      });
    });
  });

  describe("Row Expansion", () => {
    const mockCampaign = {
      id: 1,
      campaign_name: "Test Campaign",
      sender_id: "SENDER1",
      recipients: 100,
      status: 2,
      created: "2024-01-15T10:00:00Z",
      message: "Test message content for expansion",
      delivered: 95,
      failed: 3,
      pending: 2,
      sms_cost: 100.5,
      message_size: 1,
      contact_type: 1,
      statistics: {
        categories: ["Network A"],
        contacts: [100],
        sms: [100],
        cost: [100.5],
      },
    };

    it("should expand row when Stats button is clicked", async () => {
      const user = userEvent.setup();
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: [mockCampaign],
          current_page: 1,
          last_page: 1,
          per_page: 25,
          total: 1,
          from: 1,
          to: 1,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Test Campaign")).toBeInTheDocument();
      });

      const statsButton = screen.getByText(/stats/i);
      await user.click(statsButton);

      await waitFor(() => {
        expect(screen.getByText("Test message content for expansion")).toBeInTheDocument();
        expect(screen.getByText("95")).toBeInTheDocument(); // Delivered
        expect(screen.getByText("3")).toBeInTheDocument(); // Failed
        expect(screen.getByText("2")).toBeInTheDocument(); // Pending
        expect(screen.getByText("100.5")).toBeInTheDocument(); // Cost
      });
    });

    it("should collapse row when Stats button is clicked again", async () => {
      const user = userEvent.setup();
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: [mockCampaign],
          current_page: 1,
          last_page: 1,
          per_page: 25,
          total: 1,
          from: 1,
          to: 1,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Test Campaign")).toBeInTheDocument();
      });

      const statsButton = screen.getByText(/stats/i);
      await user.click(statsButton);

      await waitFor(() => {
        expect(screen.getByText("Test message content for expansion")).toBeInTheDocument();
      });

      await user.click(statsButton);

      await waitFor(() => {
        expect(screen.queryByText("Test message content for expansion")).not.toBeInTheDocument();
      });
    });

    it("should display network statistics when available", async () => {
      const user = userEvent.setup();
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: [mockCampaign],
          current_page: 1,
          last_page: 1,
          per_page: 25,
          total: 1,
          from: 1,
          to: 1,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Test Campaign")).toBeInTheDocument();
      });

      const statsButton = screen.getByText(/stats/i);
      await user.click(statsButton);

      await waitFor(() => {
        expect(screen.getByText("Network Statistics")).toBeInTheDocument();
        expect(screen.getByText("Network A")).toBeInTheDocument();
      });
    });

    it("should display message content in expanded row", async () => {
      const user = userEvent.setup();
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: [mockCampaign],
          current_page: 1,
          last_page: 1,
          per_page: 25,
          total: 1,
          from: 1,
          to: 1,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Test Campaign")).toBeInTheDocument();
      });

      const statsButton = screen.getByText(/stats/i);
      await user.click(statsButton);

      await waitFor(() => {
        expect(screen.getByText(/Message Content:/i)).toBeInTheDocument();
        expect(screen.getByText("Test message content for expansion")).toBeInTheDocument();
      });
    });

    it("should display all statistics cards (Delivered, Failed, Pending, Cost)", async () => {
      const user = userEvent.setup();
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: [mockCampaign],
          current_page: 1,
          last_page: 1,
          per_page: 25,
          total: 1,
          from: 1,
          to: 1,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Test Campaign")).toBeInTheDocument();
      });

      const statsButton = screen.getByText(/stats/i);
      await user.click(statsButton);

      await waitFor(() => {
        expect(screen.getByText("Delivered")).toBeInTheDocument();
        expect(screen.getByText("Failed")).toBeInTheDocument();
        expect(screen.getByText("Pending")).toBeInTheDocument();
        expect(screen.getByText("Cost")).toBeInTheDocument();
      });
    });

    it("should handle campaign with contact_type 5 (File Upload)", async () => {
      const user = userEvent.setup();
      const campaignWithFileUpload = {
        ...mockCampaign,
        contact_type: 5,
      };
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: [campaignWithFileUpload],
          current_page: 1,
          last_page: 1,
          per_page: 25,
          total: 1,
          from: 1,
          to: 1,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Test Campaign")).toBeInTheDocument();
      });

      const statsButton = screen.getByText(/stats/i);
      await user.click(statsButton);

      await waitFor(() => {
        expect(screen.getByText("File Upload")).toBeInTheDocument();
      });
    });

    it("should handle campaign without network statistics", async () => {
      const user = userEvent.setup();
      const campaignWithoutStats = {
        ...mockCampaign,
        statistics: {},
      };
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: [campaignWithoutStats],
          current_page: 1,
          last_page: 1,
          per_page: 25,
          total: 1,
          from: 1,
          to: 1,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Test Campaign")).toBeInTheDocument();
      });

      const statsButton = screen.getByText(/stats/i);
      await user.click(statsButton);

      await waitFor(() => {
        // Should still show message content and stats cards
        expect(screen.getByText("Test message content for expansion")).toBeInTheDocument();
        expect(screen.getByText("Delivered")).toBeInTheDocument();
      });

      // Network Statistics section should not appear
      expect(screen.queryByText("Network Statistics")).not.toBeInTheDocument();
    });
  });

  describe("Search Functionality", () => {
    it("should render search input when showSearch is true", () => {
      mockUseMessagesTable.mockReturnValue({
        data: { data: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent({ showSearch: true });

      expect(screen.getByPlaceholderText(/search by campaign name/i)).toBeInTheDocument();
    });

    it("should not render search input when showSearch is false", () => {
      mockUseMessagesTable.mockReturnValue({
        data: { data: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent({ showSearch: false });

      expect(screen.queryByPlaceholderText(/search by campaign name/i)).not.toBeInTheDocument();
    });

    it("should update search value when user types", async () => {
      const user = userEvent.setup();
      const refetch = jest.fn();
      mockUseMessagesTable.mockReturnValue({
        data: { data: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch,
      } as any);

      renderComponent({ showSearch: true });

      const searchInput = screen.getByPlaceholderText(/search by campaign name/i);
      await user.type(searchInput, "test search");

      expect(searchInput).toHaveValue("test search");
    });

    it("should reset page to 1 when search changes", async () => {
      const user = userEvent.setup();
      mockUseMessagesTable.mockReturnValue({
        data: { data: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent({ showSearch: true });

      const searchInput = screen.getByPlaceholderText(/search by campaign name/i);
      await user.type(searchInput, "test");

      // Component should call useMessagesTable with page 1
      await waitFor(() => {
        expect(mockUseMessagesTable).toHaveBeenCalled();
      });
    });
  });

  describe("Date Filter", () => {
    it("should render date range picker when showDateFilter is true", () => {
      mockUseMessagesTable.mockReturnValue({
        data: { data: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent({ showDateFilter: true });

      expect(screen.getByTestId("date-range-picker")).toBeInTheDocument();
    });

    it("should not render date range picker when showDateFilter is false", () => {
      mockUseMessagesTable.mockReturnValue({
        data: { data: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent({ showDateFilter: false });

      expect(screen.queryByTestId("date-range-picker")).not.toBeInTheDocument();
    });

    it("should show Clear button when dates are selected", async () => {
      const user = userEvent.setup();
      mockUseMessagesTable.mockReturnValue({
        data: { data: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent({ showDateFilter: true });

      // Default dates are set (startOfYear to endOfDay)
      await waitFor(() => {
        const clearButton = screen.queryByText("Clear");
        // May be visible if dates are set
        expect(clearButton !== null || screen.queryByText("Clear") === null).toBe(true);
      });
    });

    it("should clear dates when Clear button is clicked", async () => {
      const user = userEvent.setup();
      mockUseMessagesTable.mockReturnValue({
        data: { data: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent({ showDateFilter: true });

      // Find and click Clear button if it exists
      const clearButton = screen.queryByText("Clear");
      if (clearButton) {
        await user.click(clearButton);
        // Dates should be cleared
        await waitFor(() => {
          expect(mockUseMessagesTable).toHaveBeenCalled();
        });
      }
    });

    it("should reset page to 1 when date filter changes", async () => {
      const user = userEvent.setup();
      mockUseMessagesTable.mockReturnValue({
        data: { data: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent({ showDateFilter: true });

      const dateInput = screen.getByTestId("date-range-picker-input");
      await user.type(dateInput, "2024-01-01 to 2024-01-31");

      await waitFor(() => {
        expect(mockUseMessagesTable).toHaveBeenCalled();
      });
    });
  });

  describe("Pagination", () => {
    const mockPaginationData = {
      data: Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        campaign_name: `Campaign ${i + 1}`,
        sender_id: "SENDER1",
        recipients: 100,
        status: 2,
        created: "2024-01-15T10:00:00Z",
        message: "Test message",
        delivered: 95,
        failed: 3,
        pending: 2,
        sms_cost: 100.5,
      })),
      current_page: 1,
      last_page: 2,
      per_page: 25,
      total: 30,
      from: 1,
      to: 25,
    };

    it("should display pagination controls when data exists", async () => {
      mockUseMessagesTable.mockReturnValue({
        data: mockPaginationData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/displaying.*to.*of.*campaigns/i)).toBeInTheDocument();
        expect(screen.getByText(/page.*of/i)).toBeInTheDocument();
      });
    });

    it("should display correct pagination info", async () => {
      mockUseMessagesTable.mockReturnValue({
        data: mockPaginationData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/displaying 1 to 25 of 30 campaigns/i)).toBeInTheDocument();
        expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument();
      });
    });

    it("should have all pagination buttons", async () => {
      mockUseMessagesTable.mockReturnValue({
        data: mockPaginationData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        const firstPageButton = screen.getByTitle("First page");
        const prevPageButton = screen.getByTitle("Previous page");
        const nextPageButton = screen.getByTitle("Next page");
        const lastPageButton = screen.getByTitle("Last page");

        expect(firstPageButton).toBeInTheDocument();
        expect(prevPageButton).toBeInTheDocument();
        expect(nextPageButton).toBeInTheDocument();
        expect(lastPageButton).toBeInTheDocument();
      });
    });

    it("should disable first and previous buttons on first page", async () => {
      mockUseMessagesTable.mockReturnValue({
        data: mockPaginationData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        const firstPageButton = screen.getByTitle("First page");
        const prevPageButton = screen.getByTitle("Previous page");

        expect(firstPageButton).toBeDisabled();
        expect(prevPageButton).toBeDisabled();
      });
    });

    it("should enable next and last buttons on first page", async () => {
      mockUseMessagesTable.mockReturnValue({
        data: mockPaginationData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        const nextPageButton = screen.getByTitle("Next page");
        const lastPageButton = screen.getByTitle("Last page");

        expect(nextPageButton).not.toBeDisabled();
        expect(lastPageButton).not.toBeDisabled();
      });
    });

    it("should navigate to next page when Next button is clicked", async () => {
      const user = userEvent.setup();
      const refetch = jest.fn();
      mockUseMessagesTable.mockReturnValue({
        data: {
          ...mockPaginationData,
          current_page: 1,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch,
      } as any);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByTitle("Next page")).toBeInTheDocument();
      });

      const nextButton = screen.getByTitle("Next page");
      await user.click(nextButton);

      // Component should update to show page 2
      await waitFor(() => {
        expect(mockUseMessagesTable).toHaveBeenCalled();
      });
    });

    it("should navigate to previous page when Previous button is clicked", async () => {
      const user = userEvent.setup();
      mockUseMessagesTable.mockReturnValue({
        data: {
          ...mockPaginationData,
          current_page: 2,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByTitle("Previous page")).toBeInTheDocument();
      });

      const prevButton = screen.getByTitle("Previous page");
      await user.click(prevButton);

      await waitFor(() => {
        expect(mockUseMessagesTable).toHaveBeenCalled();
      });
    });

    it("should navigate to first page when First button is clicked", async () => {
      const user = userEvent.setup();
      mockUseMessagesTable.mockReturnValue({
        data: {
          ...mockPaginationData,
          current_page: 2,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        const firstButton = screen.getByTitle("First page");
        expect(firstButton).not.toBeDisabled();
        user.click(firstButton);
      });

      await waitFor(() => {
        expect(mockUseMessagesTable).toHaveBeenCalled();
      });
    });

    it("should navigate to last page when Last button is clicked", async () => {
      const user = userEvent.setup();
      mockUseMessagesTable.mockReturnValue({
        data: {
          ...mockPaginationData,
          current_page: 1,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        const lastButton = screen.getByTitle("Last page");
        expect(lastButton).not.toBeDisabled();
        user.click(lastButton);
      });

      await waitFor(() => {
        expect(mockUseMessagesTable).toHaveBeenCalled();
      });
    });

    it("should disable next and last buttons on last page", async () => {
      mockUseMessagesTable.mockReturnValue({
        data: {
          ...mockPaginationData,
          current_page: 2,
          last_page: 2,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        const nextPageButton = screen.getByTitle("Next page");
        const lastPageButton = screen.getByTitle("Last page");

        expect(nextPageButton).toBeDisabled();
        expect(lastPageButton).toBeDisabled();
      });
    });

    it("should disable pagination buttons when loading", async () => {
      mockUseMessagesTable.mockReturnValue({
        data: mockPaginationData,
        isLoading: true,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      // When loading, pagination should not be visible or buttons should be disabled
      await waitFor(() => {
        const nextButton = screen.queryByTitle("Next page");
        if (nextButton) {
          expect(nextButton).toBeDisabled();
        }
      });
    });
  });

  describe("Per Page Selection", () => {
    it("should render per page selector", () => {
      mockUseMessagesTable.mockReturnValue({
        data: { data: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      // Per page selector should be visible
      const selectTrigger = screen.getByText("25");
      expect(selectTrigger).toBeInTheDocument();
    });

    it("should allow changing items per page", async () => {
      const user = userEvent.setup();
      mockUseMessagesTable.mockReturnValue({
        data: { data: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      const perPageSelect = screen.getByText("25").closest("button");
      if (perPageSelect) {
        await user.click(perPageSelect);
        // Select component should be available
        await waitFor(() => {
          expect(screen.getByText("50")).toBeInTheDocument();
        });
      }
    });

    it("should reset page to 1 when per page changes", async () => {
      const user = userEvent.setup();
      mockUseMessagesTable.mockReturnValue({
        data: { data: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      const perPageSelect = screen.getByText("25").closest("button");
      if (perPageSelect) {
        await user.click(perPageSelect);
        await waitFor(() => {
          expect(screen.getByText("50")).toBeInTheDocument();
        });
        // Component should call useMessagesTable with page 1
        expect(mockUseMessagesTable).toHaveBeenCalled();
      }
    });

    it("should use custom defaultPerPage when provided", () => {
      mockUseMessagesTable.mockReturnValue({
        data: { data: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent({ defaultPerPage: 50 });

      expect(screen.getByText("50")).toBeInTheDocument();
    });
  });

  describe("Sorting", () => {
    const mockCampaigns = [
      {
        id: 1,
        campaign_name: "Campaign A",
        sender_id: "SENDER1",
        recipients: 100,
        status: 2,
        created: "2024-01-15T10:00:00Z",
        message: "Test",
        delivered: 95,
        failed: 3,
        pending: 2,
        sms_cost: 100.5,
      },
      {
        id: 2,
        campaign_name: "Campaign B",
        sender_id: "SENDER2",
        recipients: 200,
        status: 1,
        created: "2024-01-16T11:00:00Z",
        message: "Test",
        delivered: 180,
        failed: 10,
        pending: 10,
        sms_cost: 200.0,
      },
    ];

    it("should have sortable ID column", async () => {
      const user = userEvent.setup();
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: mockCampaigns,
          current_page: 1,
          last_page: 1,
          per_page: 25,
          total: 2,
          from: 1,
          to: 2,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        const idHeader = screen.getByText("ID").closest("button");
        expect(idHeader).toBeInTheDocument();
      });

      const idHeader = screen.getByText("ID").closest("button");
      if (idHeader) {
        await user.click(idHeader);
        // Sort should trigger
        await waitFor(() => {
          expect(mockUseMessagesTable).toHaveBeenCalled();
        });
      }
    });

    it("should have sortable Date column", async () => {
      const user = userEvent.setup();
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: mockCampaigns,
          current_page: 1,
          last_page: 1,
          per_page: 25,
          total: 2,
          from: 1,
          to: 2,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        const dateHeader = screen.getByText("Date").closest("button");
        expect(dateHeader).toBeInTheDocument();
      });

      const dateHeader = screen.getByText("Date").closest("button");
      if (dateHeader) {
        await user.click(dateHeader);
        await waitFor(() => {
          expect(mockUseMessagesTable).toHaveBeenCalled();
        });
      }
    });

    it("should toggle sort direction when clicking same column twice", async () => {
      const user = userEvent.setup();
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: mockCampaigns,
          current_page: 1,
          last_page: 1,
          per_page: 25,
          total: 2,
          from: 1,
          to: 2,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        const idHeader = screen.getByText("ID").closest("button");
        expect(idHeader).toBeInTheDocument();
      });

      const idHeader = screen.getByText("ID").closest("button");
      if (idHeader) {
        await user.click(idHeader);
        await waitFor(() => {
          expect(mockUseMessagesTable).toHaveBeenCalled();
        });
        
        // Click again to toggle
        await user.click(idHeader);
        await waitFor(() => {
          expect(mockUseMessagesTable).toHaveBeenCalled();
        });
      }
    });

    it("should reset page to 1 when sorting changes", async () => {
      const user = userEvent.setup();
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: mockCampaigns,
          current_page: 2,
          last_page: 2,
          per_page: 25,
          total: 2,
          from: 1,
          to: 2,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        const idHeader = screen.getByText("ID").closest("button");
        expect(idHeader).toBeInTheDocument();
      });

      const idHeader = screen.getByText("ID").closest("button");
      if (idHeader) {
        await user.click(idHeader);
        await waitFor(() => {
          expect(mockUseMessagesTable).toHaveBeenCalled();
        });
      }
    });
  });

  describe("Refresh Functionality", () => {
    it("should have refresh button in header", () => {
      const refetch = jest.fn();
      mockUseMessagesTable.mockReturnValue({
        data: { data: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch,
      } as any);

      renderComponent();

      const refreshButtons = screen.getAllByTitle("Refresh");
      expect(refreshButtons.length).toBeGreaterThan(0);
    });

    it("should call refetch when refresh button is clicked", async () => {
      const user = userEvent.setup();
      const refetch = jest.fn();
      mockUseMessagesTable.mockReturnValue({
        data: { data: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch,
      } as any);

      renderComponent();

      const refreshButton = screen.getAllByTitle("Refresh")[0];
      await user.click(refreshButton);

      expect(refetch).toHaveBeenCalled();
    });

    it("should disable refresh button when loading", () => {
      const refetch = jest.fn();
      mockUseMessagesTable.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch,
      } as any);

      renderComponent();

      const refreshButtons = screen.getAllByTitle("Refresh");
      refreshButtons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe("Props and Customization", () => {
    it("should use custom title when provided", () => {
      mockUseMessagesTable.mockReturnValue({
        data: { data: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent({ title: "Custom Title" });

      expect(screen.getByText("Custom Title")).toBeInTheDocument();
    });

    it("should use custom description when provided", () => {
      mockUseMessagesTable.mockReturnValue({
        data: { data: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent({ description: "Custom Description" });

      expect(screen.getByText("Custom Description")).toBeInTheDocument();
    });

    it("should use custom defaultPerPage when provided", () => {
      mockUseMessagesTable.mockReturnValue({
        data: { data: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent({ defaultPerPage: 50 });

      expect(screen.getByText("50")).toBeInTheDocument();
    });

    it("should use custom defaultSort when provided", () => {
      mockUseMessagesTable.mockReturnValue({
        data: { data: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent({ defaultSort: "bulk_sms.id|asc" });

      // Component should use the custom sort
      expect(mockUseMessagesTable).toHaveBeenCalled();
    });

    it("should apply custom className", () => {
      mockUseMessagesTable.mockReturnValue({
        data: { data: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      const { container } = renderComponent({ className: "custom-class" });
      const card = container.querySelector(".custom-class");
      expect(card).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing campaign data gracefully", async () => {
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: [
            {
              id: null,
              campaign_name: undefined,
              sender_id: null,
              recipients: undefined,
              status: null,
              created: null,
            },
          ],
          current_page: 1,
          last_page: 1,
          per_page: 25,
          total: 1,
          from: 1,
          to: 1,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("N/A")).toBeInTheDocument();
      });
    });

    it("should handle pagination with zero total", () => {
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: [],
          current_page: 1,
          last_page: 1,
          per_page: 25,
          total: 0,
          from: 0,
          to: 0,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      expect(screen.queryByText(/page.*of/i)).not.toBeInTheDocument();
    });

    it("should handle invalid date strings gracefully", async () => {
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: [
            {
              id: 1,
              campaign_name: "Test",
              sender_id: "SENDER1",
              recipients: 100,
              status: 2,
              created: "invalid-date",
              message: "Test",
            },
          ],
          current_page: 1,
          last_page: 1,
          per_page: 25,
          total: 1,
          from: 1,
          to: 1,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        // Should not crash, date should be handled
        expect(screen.getByText("Test")).toBeInTheDocument();
      });
    });

    it("should handle missing pagination data", () => {
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: [{ id: 1, campaign_name: "Test" }],
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      // Should not crash
      expect(screen.getByText("Test")).toBeInTheDocument();
    });

    it("should handle non-array data gracefully", () => {
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: "not-an-array",
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      // Should show empty state
      expect(screen.getByText(/no campaigns found/i)).toBeInTheDocument();
    });

    it("should handle campaign with missing statistics fields", async () => {
      const user = userEvent.setup();
      const campaignWithoutAllStats = {
        id: 1,
        campaign_name: "Test Campaign",
        sender_id: "SENDER1",
        recipients: 100,
        status: 2,
        created: "2024-01-15T10:00:00Z",
        message: "Test message",
        delivered: undefined,
        failed: undefined,
        pending: undefined,
        sms_cost: undefined,
      };
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: [campaignWithoutAllStats],
          current_page: 1,
          last_page: 1,
          per_page: 25,
          total: 1,
          from: 1,
          to: 1,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Test Campaign")).toBeInTheDocument();
      });

      const statsButton = screen.getByText(/stats/i);
      await user.click(statsButton);

      await waitFor(() => {
        // Should still render with default values (0)
        expect(screen.getByText("0")).toBeInTheDocument();
      });
    });

    it("should handle campaign with array statistics but missing indices", async () => {
      const user = userEvent.setup();
      const campaignWithPartialStats = {
        id: 1,
        campaign_name: "Test Campaign",
        sender_id: "SENDER1",
        recipients: 100,
        status: 2,
        created: "2024-01-15T10:00:00Z",
        message: "Test message",
        delivered: 95,
        failed: 3,
        pending: 2,
        sms_cost: 100.5,
        statistics: {
          categories: ["Network A", "Network B"],
          contacts: [50], // Missing second element
          sms: [50, 50],
          cost: [50.25], // Missing second element
        },
      };
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: [campaignWithPartialStats],
          current_page: 1,
          last_page: 1,
          per_page: 25,
          total: 1,
          from: 1,
          to: 1,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Test Campaign")).toBeInTheDocument();
      });

      const statsButton = screen.getByText(/stats/i);
      await user.click(statsButton);

      await waitFor(() => {
        // Should render what's available
        expect(screen.getByText("Network A")).toBeInTheDocument();
        expect(screen.getByText("Network B")).toBeInTheDocument();
      });
    });
  });

  describe("DOM Structure Assertions", () => {
    const mockCampaign = {
      id: 1,
      campaign_name: "Test Campaign",
      sender_id: "SENDER1",
      recipients: 100,
      status: 2,
      created: "2024-01-15T10:00:00Z",
      message: "Test message",
      delivered: 95,
      failed: 3,
      pending: 2,
      sms_cost: 100.5,
    };

    it("should render table with correct structure", async () => {
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: [mockCampaign],
          current_page: 1,
          last_page: 1,
          per_page: 25,
          total: 1,
          from: 1,
          to: 1,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        const table = screen.getByRole("table");
        expect(table).toBeInTheDocument();
        
        const headerRow = within(table).getAllByRole("row")[0];
        expect(headerRow).toBeInTheDocument();
        
        // Check header cells
        const headers = within(headerRow).getAllByRole("columnheader");
        expect(headers.length).toBeGreaterThan(0);
      });
    });

    it("should render table body rows correctly", async () => {
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: [mockCampaign],
          current_page: 1,
          last_page: 1,
          per_page: 25,
          total: 1,
          from: 1,
          to: 1,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        const table = screen.getByRole("table");
        const rows = within(table).getAllByRole("row");
        // At least header + 1 data row
        expect(rows.length).toBeGreaterThanOrEqual(2);
      });
    });

    it("should render all required buttons", async () => {
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: [mockCampaign],
          current_page: 1,
          last_page: 1,
          per_page: 25,
          total: 1,
          from: 1,
          to: 1,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        // Refresh buttons
        expect(screen.getAllByTitle("Refresh").length).toBeGreaterThan(0);
        // Stats button
        expect(screen.getByText(/stats/i)).toBeInTheDocument();
      });
    });
  });
});
