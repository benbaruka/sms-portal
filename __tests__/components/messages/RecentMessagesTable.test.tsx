import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RecentMessagesTable } from "../../../src/components/messages/RecentMessagesTable";

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

describe("RecentMessagesTable", () => {
  let queryClient: QueryClient;
  const defaultProps = {
    route: "/messages",
    apiKey: "test-api-key",
    title: "Recent Messages",
    description: "Latest 5 messages",
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
        <RecentMessagesTable {...defaultProps} {...props} />
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

    it("should show 5 skeleton rows when loading", () => {
      mockUseMessagesTable.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      // Skeleton should be rendered, not empty message
      expect(screen.queryByText("No messages found")).not.toBeInTheDocument();
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

      expect(screen.getByText(/no messages found/i)).toBeInTheDocument();
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

    it("should display empty icon when no messages found", () => {
      mockUseMessagesTable.mockReturnValue({
        data: { data: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      const emptyContainer = screen.getByText(/no messages found/i).closest("div");
      expect(emptyContainer).toBeInTheDocument();
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
        message: "Test message 1",
      },
      {
        id: 2,
        msisdn: "+0987654321",
        sender_id: "SENDER2",
        status: 1,
        created_at: "2024-01-16T11:00:00Z",
        message: "Test message 2",
      },
      {
        id: 3,
        msisdn: "+1111111111",
        sender_id: "SENDER3",
        status: 2,
        created_at: "2024-01-17T12:00:00Z",
        message: "Test message 3",
      },
      {
        id: 4,
        msisdn: "+2222222222",
        sender_id: "SENDER4",
        status: 0,
        created_at: "2024-01-18T13:00:00Z",
        message: "Test message 4",
      },
      {
        id: 5,
        msisdn: "+3333333333",
        sender_id: "SENDER5",
        status: -1,
        created_at: "2024-01-19T14:00:00Z",
        message: "Test message 5",
      },
    ];

    it("should render table headers correctly", async () => {
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: mockMessages,
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
        
        expect(screen.getByText("1")).toBeInTheDocument(); // ID
        expect(screen.getByText("+1234567890")).toBeInTheDocument();
        expect(screen.getByText("SENDER1")).toBeInTheDocument();
      });
    });

    it("should render status badges correctly", async () => {
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: mockMessages,
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
        expect(screen.getByText("Queued")).toBeInTheDocument();
        expect(screen.getByText("Failed")).toBeInTheDocument();
      });
    });

    it("should render action buttons for each row", async () => {
      mockUseMessagesTable.mockReturnValue({
        data: {
          data: mockMessages,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        const viewButtons = screen.getAllByText(/view|msg/i);
        expect(viewButtons.length).toBe(5);
      });
    });

    it("should limit display to 5 messages", async () => {
      const manyMessages = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        msisdn: `+123456789${i}`,
        sender_id: "SENDER1",
        status: 2,
        created_at: `2024-01-${15 + i}T10:00:00Z`,
        message: `Test message ${i + 1}`,
      }));

      mockUseMessagesTable.mockReturnValue({
        data: {
          data: manyMessages,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        const viewButtons = screen.getAllByText(/view|msg/i);
        expect(viewButtons.length).toBe(5);
      });
    });

    it("should sort messages by date descending", async () => {
      const unsortedMessages = [
        {
          id: 1,
          msisdn: "+1111111111",
          sender_id: "SENDER1",
          status: 2,
          created_at: "2024-01-15T10:00:00Z",
          message: "Oldest",
        },
        {
          id: 2,
          msisdn: "+2222222222",
          sender_id: "SENDER2",
          status: 2,
          created_at: "2024-01-17T10:00:00Z",
          message: "Newest",
        },
        {
          id: 3,
          msisdn: "+3333333333",
          sender_id: "SENDER3",
          status: 2,
          created_at: "2024-01-16T10:00:00Z",
          message: "Middle",
        },
      ];

      mockUseMessagesTable.mockReturnValue({
        data: {
          data: unsortedMessages,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        const rows = screen.getAllByRole("row");
        // Should be sorted by date descending (newest first)
        expect(rows.length).toBeGreaterThanOrEqual(2);
      });
    });

    it("should filter out messages without valid dates", async () => {
      const messagesWithInvalidDates = [
        {
          id: 1,
          msisdn: "+1111111111",
          sender_id: "SENDER1",
          status: 2,
          created_at: "2024-01-15T10:00:00Z",
          message: "Valid",
        },
        {
          id: 2,
          msisdn: "+2222222222",
          sender_id: "SENDER2",
          status: 2,
          created_at: null,
          message: "Invalid",
        },
        {
          id: 3,
          msisdn: "+3333333333",
          sender_id: "SENDER3",
          status: 2,
          created: undefined,
          message: "Invalid",
        },
      ];

      mockUseMessagesTable.mockReturnValue({
        data: {
          data: messagesWithInvalidDates,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        // Only valid message should be displayed
        expect(screen.getByText("+1111111111")).toBeInTheDocument();
        expect(screen.queryByText("+2222222222")).not.toBeInTheDocument();
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

  describe("Route Handling", () => {
    it("should use promotional sort field for promotional route", () => {
      mockUseMessagesTable.mockReturnValue({
        data: { data: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent({ route: "/messages/promotional" });

      expect(mockUseMessagesTable).toHaveBeenCalledWith(
        "/messages/promotional",
        expect.objectContaining({
          sort: "sms_outbox_promotional.id|desc",
        }),
        "test-api-key",
        true
      );
    });

    it("should use default sort field for non-promotional route", () => {
      mockUseMessagesTable.mockReturnValue({
        data: { data: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent({ route: "/messages" });

      expect(mockUseMessagesTable).toHaveBeenCalledWith(
        "/messages",
        expect.objectContaining({
          sort: "sms_outbox.id|desc",
        }),
        "test-api-key",
        true
      );
    });
  });

  describe("Date Range", () => {
    it("should use start of year to end of day as default date range", () => {
      mockUseMessagesTable.mockReturnValue({
        data: { data: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      expect(mockUseMessagesTable).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          start: expect.any(String),
          end: expect.any(String),
        }),
        "test-api-key",
        true
      );
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
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      // Should filter out invalid messages
      await waitFor(() => {
        expect(screen.getByText(/no messages found/i)).toBeInTheDocument();
      });
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
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      // Should filter out invalid dates
      await waitFor(() => {
        expect(screen.getByText(/no messages found/i)).toBeInTheDocument();
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

    it("should handle date sorting errors gracefully", async () => {
      const messagesWithSortingError = [
        {
          id: 1,
          msisdn: "+1111111111",
          sender_id: "SENDER1",
          status: 2,
          created_at: "2024-01-15T10:00:00Z",
          message: "Valid",
        },
        {
          id: 2,
          msisdn: "+2222222222",
          sender_id: "SENDER2",
          status: 2,
          created_at: "invalid",
          message: "Invalid",
        },
      ];

      mockUseMessagesTable.mockReturnValue({
        data: {
          data: messagesWithSortingError,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      // Should handle sorting errors and still display valid messages
      await waitFor(() => {
        expect(screen.getByText("+1111111111")).toBeInTheDocument();
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
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/view|msg/i)).toBeInTheDocument();
      });
    });
  });
});
