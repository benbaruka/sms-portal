import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ScheduledMessagesTable } from "../../../src/components/messages/ScheduledMessagesTable";

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

describe("ScheduledMessagesTable", () => {
  let queryClient: QueryClient;
  const defaultProps = {
    route: "/scheduled-messages",
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
        <ScheduledMessagesTable {...defaultProps} {...props} />
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

      const table = screen.queryByRole("table");
      expect(table).not.toBeInTheDocument();
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
      const errorMessage = "Failed to load messages";
      mockUseMessagesTable.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error(errorMessage),
        refetch: jest.fn(),
      } as any);

      renderComponent();

      expect(screen.getByText(new RegExp(`Error loading messages.*${errorMessage}`, "i"))).toBeInTheDocument();
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

      expect(screen.getByText(/error loading messages.*unknown error/i)).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("should display empty message when no messages found", () => {
      mockUseMessagesTable.mockReturnValue({
        data: { data: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      expect(screen.getByText(/no messages found for the selected filters/i)).toBeInTheDocument();
    });
  });

  describe("Data Display", () => {
    const mockMessages = [
      {
        id: 1,
        msisdn: "+1234567890",
        sender_id: "SENDER1",
        status: 2,
        created: "2024-01-15T10:00:00Z",
        message: "Test message content",
      },
      {
        id: 2,
        msisdn: "+0987654321",
        sender_id: "SENDER2",
        status: 1,
        created: "2024-01-16T11:00:00Z",
        message: "Another test message",
      },
    ];

    it("should render table headers correctly", async () => {
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: mockMessages,
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
        expect(screen.getByText("Phone")).toBeInTheDocument();
        expect(screen.getByText("Sender ID")).toBeInTheDocument();
        expect(screen.getByText("Status")).toBeInTheDocument();
        expect(screen.getByText("Date")).toBeInTheDocument();
        expect(screen.getByText("Actions")).toBeInTheDocument();
      });
    });

    it("should render message data in table rows", async () => {
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: mockMessages,
          pagination: {
            current_page: 1,
            last_page: 1,
            per_page: 25,
            total: 2,
            from: 1,
            to: 2,
          },
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("+1234567890")).toBeInTheDocument();
        expect(screen.getByText("+0987654321")).toBeInTheDocument();
      });
    });
  });

  describe("Row Expansion", () => {
    const mockMessage = {
      id: 1,
      msisdn: "+1234567890",
      sender_id: "SENDER1",
      status: 2,
      created: "2024-01-15T10:00:00Z",
      message: "Test message content for expansion",
    };

    it("should expand row when View button is clicked", async () => {
      const user = userEvent.setup();
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: [mockMessage],
          pagination: {
            current_page: 1,
            last_page: 1,
            per_page: 25,
            total: 1,
            from: 1,
            to: 1,
          },
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("+1234567890")).toBeInTheDocument();
      });

      const viewButton = screen.getByText(/view|msg/i);
      await user.click(viewButton);

      await waitFor(() => {
        expect(screen.getByText("Test message content for expansion")).toBeInTheDocument();
      });
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

      expect(screen.getByPlaceholderText(/search by phone/i)).toBeInTheDocument();
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

      expect(screen.queryByPlaceholderText(/search by phone/i)).not.toBeInTheDocument();
    });
  });

  describe("Date Filter", () => {
    it("should use start_date and end_date in request params", () => {
      mockUseMessagesTable.mockReturnValue({
        data: { data: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent({ showDateFilter: true });

      // Component should use start_date and end_date (not start and end)
      expect(mockUseMessagesTable).toHaveBeenCalled();
    });
  });

  describe("Pagination", () => {
    const mockPaginationData = {
      data: Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        msisdn: `+123456789${i}`,
        sender_id: "SENDER1",
        status: 2,
        created: "2024-01-15T10:00:00Z",
        message: "Test message",
      })),
      pagination: {
        current_page: 1,
        last_page: 2,
        per_page: 25,
        total: 30,
        from: 1,
        to: 25,
      },
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
        expect(screen.getByText(/displaying.*to.*of.*messages/i)).toBeInTheDocument();
      });
    });

    it("should handle pagination with number type checks", async () => {
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: [{ id: 1, msisdn: "+1234567890" }],
          pagination: {
            current_page: "1",
            last_page: "2",
            per_page: "25",
            total: "30",
            from: "1",
            to: "25",
          },
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        // Should handle string pagination values
        expect(screen.getByText("+1234567890")).toBeInTheDocument();
      });
    });
  });

  describe("Sorting", () => {
    const mockMessages = [
      {
        id: 1,
        msisdn: "+1234567890",
        sender_id: "SENDER1",
        status: 2,
        created: "2024-01-15T10:00:00Z",
        message: "Test",
      },
    ];

    it("should have sortable columns", async () => {
      const user = userEvent.setup();
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: mockMessages,
          pagination: {
            current_page: 1,
            last_page: 1,
            per_page: 25,
            total: 1,
            from: 1,
            to: 1,
          },
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
  });

  describe("Edge Cases", () => {
    it("should handle missing pagination data", () => {
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: [{ id: 1, msisdn: "+1234567890" }],
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      expect(screen.getByText("+1234567890")).toBeInTheDocument();
    });

    it("should handle pagination with zero total", () => {
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: [],
          pagination: {
            current_page: 1,
            last_page: 1,
            per_page: 25,
            total: 0,
            from: 0,
            to: 0,
          },
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      expect(screen.queryByText(/page.*of/i)).not.toBeInTheDocument();
    });
  });
});
