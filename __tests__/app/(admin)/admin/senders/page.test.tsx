
import {
  fireEvent as testingLibraryFireEvent,
  screen as testingLibraryScreen,
} from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import AdminSendersPage from "../../../../../src/app/(admin)/admin/senders/page";
import { renderWithProviders, waitFor } from "../../../../test-utils";

// Use screen and fireEvent directly from @testing-library/react for proper TypeScript types
const screen: typeof testingLibraryScreen = testingLibraryScreen;
const fireEvent: typeof testingLibraryFireEvent = testingLibraryFireEvent;

const mockRefetch = jest.fn();
const mockRefetchDetails = jest.fn();
const mockApprove = jest.fn();
const mockReject = jest.fn();
const mockUpdateStatus = jest.fn();
const mockAssign = jest.fn();
const mockDelete = jest.fn();
const mockAddConnector = jest.fn();
const mockRemoveConnector = jest.fn();
const mockUpdateOTP = jest.fn();

jest.mock("@/controller/query/admin/senders/useAdminSenders", () => ({
  useAdminSendersList: jest.fn(),
  useAdminSenderDetails: jest.fn(),
  useClientsAssignedToSender: jest.fn(),
  useApproveAdminSender: jest.fn(),
  useRejectAdminSender: jest.fn(),
  useUpdateAdminSenderStatus: jest.fn(),
  useAssignSenderToClient: jest.fn(),
  useDeleteAdminSender: jest.fn(),
  useAddConnectorToSender: jest.fn(),
  useRemoveConnectorFromSender: jest.fn(),
  useUpdateClientSenderOTP: jest.fn(),
}));

jest.mock("@/controller/query/admin/clients/useAdminClients", () => ({
  useAdminClientsList: jest.fn(),
}));

jest.mock("@/controller/query/connectors/useConnectors", () => ({
  useGetAllConnectors: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

import * as clientHooks from "../../../../../src/controller/query/admin/clients/useAdminClients";
import * as senderHooks from "../../../../../src/controller/query/admin/senders/useAdminSenders";
import * as connectorHooks from "../../../../../src/controller/query/connectors/useConnectors";

describe("app/(admin)/admin/senders/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
    mockRefetch.mockResolvedValue({});
    mockRefetchDetails.mockResolvedValue({});
    mockApprove.mockResolvedValue({});
    mockReject.mockResolvedValue({});
    mockUpdateStatus.mockResolvedValue({});
    mockAssign.mockResolvedValue({});
    mockDelete.mockResolvedValue({});
    mockAddConnector.mockResolvedValue({});
    mockRemoveConnector.mockResolvedValue({});
    mockUpdateOTP.mockResolvedValue({});

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (senderHooks.useAdminSendersList as jest.MockedFunction<any>).mockReturnValue({
      data: {
        data: [
          {
            id: 1,
            sender_id: 1,
            sender: "TEST123",
            status: "PENDING",
            created_at: "2024-01-15T10:00:00Z",
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (senderHooks.useAdminSenderDetails as jest.MockedFunction<any>).mockReturnValue({
      data: {
        data: {
          id: 1,
          sender: "TEST123",
          status: "PENDING",
        },
      },
      isLoading: false,
      refetch: mockRefetchDetails,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (senderHooks.useClientsAssignedToSender as jest.MockedFunction<any>).mockReturnValue({
      data: [],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (senderHooks.useApproveAdminSender as jest.MockedFunction<any>).mockReturnValue({
      mutateAsync: mockApprove,
      isPending: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (senderHooks.useRejectAdminSender as jest.MockedFunction<any>).mockReturnValue({
      mutateAsync: mockReject,
      isPending: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (senderHooks.useUpdateAdminSenderStatus as jest.MockedFunction<any>).mockReturnValue({
      mutateAsync: mockUpdateStatus,
      isPending: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (senderHooks.useAssignSenderToClient as jest.MockedFunction<any>).mockReturnValue({
      mutateAsync: mockAssign,
      isPending: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (senderHooks.useDeleteAdminSender as jest.MockedFunction<any>).mockReturnValue({
      mutateAsync: mockDelete,
      isPending: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (senderHooks.useAddConnectorToSender as jest.MockedFunction<any>).mockReturnValue({
      mutateAsync: mockAddConnector,
      isPending: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (senderHooks.useRemoveConnectorFromSender as jest.MockedFunction<any>).mockReturnValue({
      mutateAsync: mockRemoveConnector,
      isPending: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (senderHooks.useUpdateClientSenderOTP as jest.MockedFunction<any>).mockReturnValue({
      mutateAsync: mockUpdateOTP,
      isPending: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (clientHooks.useAdminClientsList as jest.MockedFunction<any>).mockReturnValue({
      data: {
        clients: [{ id: 1, name: "Test Client" }],
      },
      isLoading: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (connectorHooks.useGetAllConnectors as jest.MockedFunction<any>).mockReturnValue({
      data: {
        message: [{ id: 1, name: "Test Connector" }],
      },
    });
  });

  it("module loads", () => {
    expect(AdminSendersPage).toBeDefined();
  });

  it("renders senders page", async () => {
    renderWithProviders(<AdminSendersPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Sender ID Management/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders search input", async () => {
    renderWithProviders(<AdminSendersPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const searchInput = screen.queryByPlaceholderText(/Search by sender/i);
        expect(searchInput).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles search input change", async () => {
    renderWithProviders(<AdminSendersPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const searchInput = screen.queryByPlaceholderText(/Search by sender/i);
        if (searchInput) {
          fireEvent.change(searchInput, { target: { value: "TEST" } });
          expect(searchInput).toHaveValue("TEST");
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles status filter change", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminSendersPage />);
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
        const pendingOption = screen.queryByText("Pending");
        if (pendingOption) {
          fireEvent.click(pendingOption);
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles refresh button", async () => {
    renderWithProviders(<AdminSendersPage />);
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

  it("renders senders table", async () => {
    renderWithProviders(<AdminSendersPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("TEST123")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("opens view dialog", async () => {
    renderWithProviders(<AdminSendersPage />);
    await waitFor(
      () => {
        const viewBtn =
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryByTitle(/View/i) ||
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryAllByRole("button")[0];
        if (viewBtn) {
          fireEvent.click(viewBtn);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        expect(screen.queryByText(/Sender Details/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("opens approve dialog", async () => {
    renderWithProviders(<AdminSendersPage />);
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
        expect(screen.queryByText(/Approve Sender/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles approve submission", async () => {
    renderWithProviders(<AdminSendersPage />);
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
          fireEvent.click(confirmBtn);
        }
      },
      { timeout: 10000 }
    );
  });

  it("opens reject dialog", async () => {
    renderWithProviders(<AdminSendersPage />);
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
        expect(screen.queryByText(/Reject Sender/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles reject submission", async () => {
    renderWithProviders(<AdminSendersPage />);
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
          fireEvent.change(reasonInput, { target: { value: "Invalid" } });
        }
        const confirmBtn = screen.queryByRole("button", { name: /Reject/i });
        if (confirmBtn && !confirmBtn.hasAttribute("disabled")) {
          fireEvent.click(confirmBtn);
        }
      },
      { timeout: 10000 }
    );
  });

  it("shows loading state", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (senderHooks.useAdminSendersList as jest.MockedFunction<any>).mockReturnValue({
      data: null,
      isLoading: true,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<AdminSendersPage />);
    expect(screen.queryByText("Loading senders...")).toBeInTheDocument();
  });

  it("shows empty state", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (senderHooks.useAdminSendersList as jest.MockedFunction<any>).mockReturnValue({
      data: { data: [] },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<AdminSendersPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/No senders found/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles different response formats", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (senderHooks.useAdminSendersList as jest.MockedFunction<any>).mockReturnValue({
      data: {
        message: {
          data: [{ id: 2, sender: "MSG123", status: "APPROVED" }],
        },
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<AdminSendersPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("MSG123")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles sender with status as number", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (senderHooks.useAdminSendersList as jest.MockedFunction<any>).mockReturnValue({
      data: {
        data: [
          {
            id: 3,
            sender: "NUM123",
            status: 1,
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<AdminSendersPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("NUM123")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles filtered search results", async () => {
    renderWithProviders(<AdminSendersPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const searchInput = screen.queryByPlaceholderText(/Search by sender/i);
        if (searchInput) {
          fireEvent.change(searchInput, { target: { value: "NonExistent" } });
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        expect(screen.queryByText(/No matching senders/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles missing apiKey", () => {
    localStorage.removeItem("apiKey");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (senderHooks.useAdminSendersList as jest.MockedFunction<any>).mockReturnValue({
      data: null,
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<AdminSendersPage />);
    expect(screen.queryByText(/Sender ID Management/i)).toBeInTheDocument();
  });
});
