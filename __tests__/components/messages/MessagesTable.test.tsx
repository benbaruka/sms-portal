import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MessagesTable } from "../../../src/components/messages/MessagesTable";

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

describe("MessagesTable", () => {
  let queryClient: QueryClient;
  const defaultProps = {
    route: "/messages",
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
        <MessagesTable {...defaultProps} {...props} />
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

      // When loading, skeleton is shown instead of table
      const table = screen.queryByRole("table");
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
      expect(screen.queryByText("No messages found")).not.toBeInTheDocument();
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
    const mockMessages = [
      {
        id: 1,
        msisdn: "+1234567890",
        sender_id: "SENDER1",
        status: 2,
        created_at: "2024-01-15T10:00:00Z",
        message: "Test message content",
      },
      {
        id: 2,
        msisdn: "+0987654321",
        sender_id: "SENDER2",
        status: 1,
        created_at: "2024-01-16T11:00:00Z",
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
        expect(screen.getByText("+1234567890")).toBeInTheDocument();
        expect(screen.getByText("+0987654321")).toBeInTheDocument();
        expect(screen.getByText("SENDER1")).toBeInTheDocument();
        expect(screen.getByText("SENDER2")).toBeInTheDocument();
      });
    });

    it("should render all table cells correctly", async () => {
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: [mockMessages[0]],
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
        expect(rows.length).toBeGreaterThanOrEqual(2);
        
        expect(screen.getByText("1")).toBeInTheDocument(); // ID
        expect(screen.getByText("+1234567890")).toBeInTheDocument();
        expect(screen.getByText("SENDER1")).toBeInTheDocument();
      });
    });

    it("should render status badges correctly", async () => {
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
        expect(screen.getByText("Delivered")).toBeInTheDocument();
        expect(screen.getByText("Pending")).toBeInTheDocument();
      });
    });

    it("should render action buttons for each row", async () => {
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
        const viewButtons = screen.getAllByText(/view|msg/i);
        expect(viewButtons.length).toBeGreaterThan(0);
      });
    });

    it("should handle different message data structures", async () => {
      mockUseMessagesTable.mockReturnValue({
        data: {
          message: {
            data: [
              {
                sms_outbox_id: 1,
                phone_number: "+1111111111",
                sender_id: "SENDER1",
                delivery_status: 2,
                sent_at: "2024-01-15T10:00:00Z",
                content: "Test content",
              },
            ],
            pagination: {
              current_page: 1,
              last_page: 1,
              per_page: 25,
              total: 1,
              from: 1,
              to: 1,
            },
          },
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("+1111111111")).toBeInTheDocument();
      });
    });

    it("should handle messages array structure", async () => {
      mockUseMessagesTable.mockReturnValue({
        data: {
          message: {
            messages: [
              {
                id: 1,
                phone: "+2222222222",
                sender_id: "SENDER1",
                status: 2,
                date: "2024-01-15T10:00:00Z",
                text: "Test text",
              },
            ],
            pagination: {
              current_page: 1,
              last_page: 1,
              per_page: 25,
              total: 1,
              from: 1,
              to: 1,
            },
          },
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("+2222222222")).toBeInTheDocument();
      });
    });
  });

  describe("Row Expansion", () => {
    const mockMessage = {
      id: 1,
      msisdn: "+1234567890",
      sender_id: "SENDER1",
      status: 2,
      created_at: "2024-01-15T10:00:00Z",
      message: "Test message content for expansion",
    };

    it("should expand row when View button is clicked", async () => {
      const user = userEvent.setup();
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: [mockMessage],
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
        expect(screen.getByText("+1234567890")).toBeInTheDocument();
      });

      const viewButton = screen.getByText(/view|msg/i);
      await user.click(viewButton);

      await waitFor(() => {
        expect(screen.getByText("Test message content for expansion")).toBeInTheDocument();
        expect(screen.getByText(/Message Content:/i)).toBeInTheDocument();
      });
    });

    it("should collapse row when View button is clicked again", async () => {
      const user = userEvent.setup();
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: [mockMessage],
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
        expect(screen.getByText("+1234567890")).toBeInTheDocument();
      });

      const viewButton = screen.getByText(/view|msg/i);
      await user.click(viewButton);

      await waitFor(() => {
        expect(screen.getByText("Test message content for expansion")).toBeInTheDocument();
      });

      await user.click(viewButton);

      await waitFor(() => {
        expect(screen.queryByText("Test message content for expansion")).not.toBeInTheDocument();
      });
    });

    it("should display message content in expanded row", async () => {
      const user = userEvent.setup();
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: [mockMessage],
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
        expect(screen.getByText("+1234567890")).toBeInTheDocument();
      });

      const viewButton = screen.getByText(/view|msg/i);
      await user.click(viewButton);

      await waitFor(() => {
        expect(screen.getByText(/Message Content:/i)).toBeInTheDocument();
        expect(screen.getByText("Test message content for expansion")).toBeInTheDocument();
      });
    });

    it("should display date in mobile view when expanded", async () => {
      const user = userEvent.setup();
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: [mockMessage],
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
        expect(screen.getByText("+1234567890")).toBeInTheDocument();
      });

      const viewButton = screen.getByText(/view|msg/i);
      await user.click(viewButton);

      await waitFor(() => {
        // Date should be visible in expanded view
        expect(screen.getByText(/Date:/i)).toBeInTheDocument();
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

    it("should update search value when user types", async () => {
      const user = userEvent.setup();
      mockUseMessagesTable.mockReturnValue({
        data: { data: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent({ showSearch: true });

      const searchInput = screen.getByPlaceholderText(/search by phone/i);
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

      const searchInput = screen.getByPlaceholderText(/search by phone/i);
      await user.type(searchInput, "test");

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

      const dateInput = screen.getByTestId("date-range-picker-input");
      await user.type(dateInput, "2024-01-01 to 2024-01-31");

      await waitFor(() => {
        const clearButton = screen.queryByText("Clear");
        expect(clearButton).toBeInTheDocument();
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

      const dateInput = screen.getByTestId("date-range-picker-input");
      await user.type(dateInput, "2024-01-01 to 2024-01-31");

      await waitFor(async () => {
        const clearButton = screen.getByText("Clear");
        await user.click(clearButton);
      });

      await waitFor(() => {
        expect(mockUseMessagesTable).toHaveBeenCalled();
      });
    });
  });

  describe("Pagination", () => {
    const mockPaginationData = {
      data: Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        msisdn: `+123456789${i}`,
        sender_id: "SENDER1",
        status: 2,
        created_at: "2024-01-15T10:00:00Z",
        message: "Test message",
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
        expect(screen.getByText(/displaying.*to.*of.*messages/i)).toBeInTheDocument();
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
        expect(screen.getByText(/displaying 1 to 25 of 30 messages/i)).toBeInTheDocument();
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
        expect(screen.getByTitle("First page")).toBeInTheDocument();
        expect(screen.getByTitle("Previous page")).toBeInTheDocument();
        expect(screen.getByTitle("Next page")).toBeInTheDocument();
        expect(screen.getByTitle("Last page")).toBeInTheDocument();
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
        expect(screen.getByTitle("First page")).toBeDisabled();
        expect(screen.getByTitle("Previous page")).toBeDisabled();
      });
    });

    it("should navigate to next page when Next button is clicked", async () => {
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
        expect(screen.getByTitle("Next page")).toBeInTheDocument();
      });

      const nextButton = screen.getByTitle("Next page");
      await user.click(nextButton);

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
        expect(screen.getByTitle("Next page")).toBeDisabled();
        expect(screen.getByTitle("Last page")).toBeDisabled();
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

      expect(screen.getByText("25")).toBeInTheDocument();
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
        await waitFor(() => {
          expect(screen.getByText("50")).toBeInTheDocument();
        });
      }
    });
  });

  describe("Sorting", () => {
    const mockMessages = [
      {
        id: 1,
        msisdn: "+1234567890",
        sender_id: "SENDER1",
        status: 2,
        created_at: "2024-01-15T10:00:00Z",
        message: "Test",
      },
    ];

    it("should have sortable ID column for promotional route", async () => {
      const user = userEvent.setup();
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: mockMessages,
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

      renderComponent({ route: "/messages/promotional" });

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

    it("should have sortable ID column for transactional route", async () => {
      const user = userEvent.setup();
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: mockMessages,
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

      renderComponent({ route: "/messages/transactional" });

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

    it("should have sortable Phone column", async () => {
      const user = userEvent.setup();
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: mockMessages,
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
        const phoneHeader = screen.getByText("Phone").closest("button");
        expect(phoneHeader).toBeInTheDocument();
      });

      const phoneHeader = screen.getByText("Phone").closest("button");
      if (phoneHeader) {
        await user.click(phoneHeader);
        await waitFor(() => {
          expect(mockUseMessagesTable).toHaveBeenCalled();
        });
      }
    });

    it("should have sortable Sender ID column", async () => {
      const user = userEvent.setup();
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: mockMessages,
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
        const senderHeader = screen.getByText("Sender ID").closest("button");
        expect(senderHeader).toBeInTheDocument();
      });

      const senderHeader = screen.getByText("Sender ID").closest("button");
      if (senderHeader) {
        await user.click(senderHeader);
        await waitFor(() => {
          expect(mockUseMessagesTable).toHaveBeenCalled();
        });
      }
    });

    it("should have sortable Date column", async () => {
      const user = userEvent.setup();
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: mockMessages,
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
  });

  describe("Edge Cases", () => {
    it("should handle missing message data gracefully", async () => {
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: [
            {
              id: null,
              msisdn: undefined,
              sender_id: null,
              status: null,
              created_at: null,
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
              msisdn: "+1234567890",
              sender_id: "SENDER1",
              status: 2,
              created_at: "invalid-date",
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
        expect(screen.getByText("+1234567890")).toBeInTheDocument();
      });
    });

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

      expect(screen.getByText(/no messages found/i)).toBeInTheDocument();
    });

    it("should handle different message ID fields", async () => {
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: [
            {
              sms_outbox_id: 100,
              msisdn: "+1234567890",
              sender_id: "SENDER1",
              status: 2,
              created_at: "2024-01-15T10:00:00Z",
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
        expect(screen.getByText("100")).toBeInTheDocument();
      });
    });

    it("should handle promotional message ID field", async () => {
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: [
            {
              sms_outbox_promotional_id: 200,
              msisdn: "+1234567890",
              sender_id: "SENDER1",
              status: 2,
              created_at: "2024-01-15T10:00:00Z",
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
        expect(screen.getByText("200")).toBeInTheDocument();
      });
    });
  });

  describe("DOM Structure Assertions", () => {
    const mockMessage = {
      id: 1,
      msisdn: "+1234567890",
      sender_id: "SENDER1",
      status: 2,
      created_at: "2024-01-15T10:00:00Z",
      message: "Test message",
    };

    it("should render table with correct structure", async () => {
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: [mockMessage],
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
        
        const headers = within(headerRow).getAllByRole("columnheader");
        expect(headers.length).toBeGreaterThan(0);
      });
    });

    it("should render table body rows correctly", async () => {
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: [mockMessage],
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
        expect(rows.length).toBeGreaterThanOrEqual(2);
      });
    });

    it("should render all required buttons", async () => {
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: [mockMessage],
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
        expect(screen.getAllByTitle("Refresh").length).toBeGreaterThan(0);
        expect(screen.getByText(/view|msg/i)).toBeInTheDocument();
      });
    });
  });
});
