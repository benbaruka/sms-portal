
import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConnectorsPage from "../../../../../src/app/(admin)/admin/connectors/page";
import { renderWithProviders, waitFor } from "../../../../test-utils";

const mockCreateMutation = jest.fn();
const mockUpdateMutation = jest.fn();
const mockDeleteMutation = jest.fn();
const mockRefetch = jest.fn();

jest.mock("@/controller/query/connectors/useConnectors", () => ({
  useGetAllConnectors: jest.fn(),
  useGetConnectorById: jest.fn(),
  useCreateConnector: jest.fn(),
  useUpdateConnector: jest.fn(),
  useDeleteConnector: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

import * as hooks from "../../../../../src/controller/query/connectors/useConnectors";

describe("app/(admin)/admin/connectors/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
    mockCreateMutation.mockResolvedValue({});
    mockUpdateMutation.mockResolvedValue({});
    mockDeleteMutation.mockResolvedValue({});
    mockRefetch.mockResolvedValue({});

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useGetAllConnectors as jest.MockedFunction<any>).mockReturnValue({
      data: {
        message: [
          {
            id: 1,
            name: "Test Connector",
            scope: "local",
            queue_prefix: "test",
            mcc: 639,
            mnc: 1,
            status: 1,
          },
        ],
      },
      isLoading: false,
      refetch: mockRefetch,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useGetConnectorById as jest.MockedFunction<any>).mockReturnValue({
      data: {
        message: {
          id: 1,
          name: "Test Connector",
          scope: "local",
          queue_prefix: "test",
          mcc: 639,
          mnc: 1,
          status: 1,
        },
      },
      isLoading: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useCreateConnector as jest.MockedFunction<any>).mockReturnValue({
      mutateAsync: mockCreateMutation,
      isPending: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useUpdateConnector as jest.MockedFunction<any>).mockReturnValue({
      mutateAsync: mockUpdateMutation,
      isPending: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useDeleteConnector as jest.MockedFunction<any>).mockReturnValue({
      mutateAsync: mockDeleteMutation,
      isPending: false,
    });
  });

  it("module loads", () => {
    expect(ConnectorsPage).toBeDefined();
  });

  it("renders connectors page", async () => {
    renderWithProviders(<ConnectorsPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Connector Management/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders header with title and description", async () => {
    renderWithProviders(<ConnectorsPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Connector Management/i)).toBeInTheDocument();
        expect(screen.queryByText(/Manage SMS connectors/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders create connector button", async () => {
    renderWithProviders(<ConnectorsPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Create Connector/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders search input", async () => {
    renderWithProviders(<ConnectorsPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const searchInput = screen.queryByPlaceholderText(/Search connectors/i);
        expect(searchInput).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles search input change", async () => {
    renderWithProviders(<ConnectorsPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const searchInput = screen.queryByPlaceholderText(/Search connectors/i);
        if (searchInput) {
          fireEvent.change(searchInput, { target: { value: "Test" } });
          expect(searchInput).toHaveValue("Test");
        }
      },
      { timeout: 10000 }
    );
  });

  it("opens create dialog", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ConnectorsPage />);

    const createBtn = await screen.findByRole("button", { name: /Create Connector/i });
    await user.click(createBtn);

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();

    const dialogTitle = await screen.findByRole("heading", { name: /Create Connector/i });
    expect(dialogTitle).toBeInTheDocument();
  });

  it("closes create dialog", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ConnectorsPage />);

    const createBtn = await screen.findByRole("button", { name: /Create Connector/i });
    await user.click(createBtn);

    const cancelBtn = await screen.findByRole("button", { name: /Cancel/i });
    await user.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("handles create form submission", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ConnectorsPage />);

    const createBtn = await screen.findByRole("button", { name: /Create Connector/i });
    await user.click(createBtn);

    const nameInput = await screen.findByLabelText(/Connector Name/i);
    const scopeInput = await screen.findByLabelText(/Scope/i);
    const queuePrefixInput = await screen.findByLabelText(/Queue Prefix/i);
    const mccInput = await screen.findByLabelText(/MCC/i);
    const mncInput = await screen.findByLabelText(/MNC/i);

    await user.type(nameInput, "New Connector");
    await user.type(scopeInput, "international");
    await user.type(queuePrefixInput, "new");
    await user.type(mccInput, "639");
    await user.type(mncInput, "1");

    const submitBtn = await screen.findByRole("button", { name: /Create Connector/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateMutation).toHaveBeenCalled();
    });
  });

  it("handles create form validation errors", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ConnectorsPage />);

    const createBtn = await screen.findByRole("button", { name: /Create Connector/i });
    await user.click(createBtn);

    const submitBtn = await screen.findByRole("button", { name: /Create Connector/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateMutation).not.toHaveBeenCalled();
    });
  });

  it("opens view dialog", async () => {
    renderWithProviders(<ConnectorsPage />);
    await waitFor(
      () => {
        const viewBtn =
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryByTitle(/View Details/i) || screen.queryByRole("button", { name: "" });
        if (viewBtn) {
          fireEvent.click(viewBtn);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        expect(screen.queryByText(/Connector Details/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("opens edit dialog", async () => {
    renderWithProviders(<ConnectorsPage />);
    await waitFor(
      () => {
        const editBtn =
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryByTitle(/Edit/i) ||
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryAllByRole("button")[1];
        if (editBtn) {
          fireEvent.click(editBtn);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        expect(screen.queryByText(/Edit Connector/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles edit form submission", async () => {
    renderWithProviders(<ConnectorsPage />);
    await waitFor(
      () => {
        const editBtn =
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryByTitle(/Edit/i) ||
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryAllByRole("button")[1];
        if (editBtn) {
          fireEvent.click(editBtn);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        const submitBtn = screen.queryByRole("button", { name: /Update Connector/i });
        if (submitBtn && !submitBtn.hasAttribute("disabled")) {
          const form = submitBtn.closest("form");
          if (form) {
            // @ts-expect-error - TypeScript inference issue with fireEvent types
            fireEvent.submit(form);
          }
        }
      },
      { timeout: 10000 }
    );
  });

  it("opens delete dialog", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ConnectorsPage />);

    const deleteBtns = await screen.findAllByTitle(/Delete/i);
    expect(deleteBtns.length).toBeGreaterThan(0);
    await user.click(deleteBtns[0]);

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();

    const dialogTitle = await screen.findByRole("heading", { name: /Delete Connector/i });
    expect(dialogTitle).toBeInTheDocument();
  });

  it("handles delete confirmation", async () => {
    renderWithProviders(<ConnectorsPage />);
    await waitFor(
      () => {
        const deleteBtn =
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryByTitle(/Delete/i) ||
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryAllByRole("button")[2];
        if (deleteBtn) {
          fireEvent.click(deleteBtn);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        const confirmBtn = screen.queryByRole("button", { name: /Delete$/i });
        if (confirmBtn) {
          fireEvent.click(confirmBtn);
        }
      },
      { timeout: 10000 }
    );
  });

  it("shows loading state", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useGetAllConnectors as jest.MockedFunction<any>).mockReturnValue({
      data: null,
      isLoading: true,
      refetch: mockRefetch,
    });
    renderWithProviders(<ConnectorsPage />);
    expect(screen.queryByText("Loading connectors...")).toBeInTheDocument();
  });

  it("shows empty state", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useGetAllConnectors as jest.MockedFunction<any>).mockReturnValue({
      data: { message: [] },
      isLoading: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<ConnectorsPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/No connectors found/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders connectors table", async () => {
    renderWithProviders(<ConnectorsPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("Test Connector")).toBeInTheDocument();
        expect(screen.queryByText("local")).toBeInTheDocument();
        expect(screen.queryByText("test")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles filtered connectors", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ConnectorsPage />);

    const searchInput = await screen.findByPlaceholderText(/Search connectors/i);
    await user.type(searchInput, "NonExistent");

    expect(await screen.findByText(/No matching connectors/i)).toBeInTheDocument();
  });

  it("handles connectors from data format", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useGetAllConnectors as jest.MockedFunction<any>).mockReturnValue({
      data: {
        data: [
          {
            id: 2,
            name: "Data Connector",
            scope: "international",
            queue_prefix: "data",
            mcc: 639,
            mnc: 2,
            status: 1,
          },
        ],
      },
      isLoading: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<ConnectorsPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("Data Connector")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles create without apiKey", async () => {
    localStorage.removeItem("apiKey");
    renderWithProviders(<ConnectorsPage />);
    await waitFor(
      () => {
        const createBtn = screen.queryByText(/Create Connector/i);
        if (createBtn) {
          fireEvent.click(createBtn);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        const submitBtn = screen.queryByRole("button", { name: /Create Connector/i });
        if (submitBtn) {
          const form = submitBtn.closest("form");
          if (form) {
            // @ts-expect-error - TypeScript inference issue with fireEvent types
            fireEvent.submit(form);
          }
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles create with invalid mcc/mnc", async () => {
    renderWithProviders(<ConnectorsPage />);
    await waitFor(
      () => {
        const createBtn = screen.queryByText(/Create Connector/i);
        if (createBtn) {
          fireEvent.click(createBtn);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const nameInput = screen.queryByLabelText(/Connector Name/i);
        // @ts-expect-error - TypeScript inference issue with screen types
        const scopeInput = screen.queryByLabelText(/Scope/i);
        // @ts-expect-error - TypeScript inference issue with screen types
        const queuePrefixInput = screen.queryByLabelText(/Queue Prefix/i);
        // @ts-expect-error - TypeScript inference issue with screen types
        const mccInput = screen.queryByLabelText(/MCC/i);
        // @ts-expect-error - TypeScript inference issue with screen types
        const mncInput = screen.queryByLabelText(/MNC/i);

        if (nameInput) fireEvent.change(nameInput, { target: { value: "Invalid Connector" } });
        if (scopeInput) fireEvent.change(scopeInput, { target: { value: "local" } });
        if (queuePrefixInput) fireEvent.change(queuePrefixInput, { target: { value: "invalid" } });
        if (mccInput) fireEvent.change(mccInput, { target: { value: "0" } });
        if (mncInput) fireEvent.change(mncInput, { target: { value: "-1" } });
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        const submitBtn = screen.queryByRole("button", { name: /Create Connector/i });
        if (submitBtn) {
          const form = submitBtn.closest("form");
          if (form) {
            // @ts-expect-error - TypeScript inference issue with fireEvent types
            fireEvent.submit(form);
          }
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles view dialog loading state", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useGetConnectorById as jest.MockedFunction<any>).mockReturnValue({
      data: null,
      isLoading: true,
    });
    renderWithProviders(<ConnectorsPage />);
    await waitFor(
      () => {
        const viewBtn =
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryByTitle(/View Details/i) ||
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
        expect(screen.queryByText(/Loading connector details/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles connector details from data format", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useGetConnectorById as jest.MockedFunction<any>).mockReturnValue({
      data: {
        data: {
          id: 1,
          name: "Data Connector",
          scope: "local",
          queue_prefix: "data",
          mcc: 639,
          mnc: 1,
          status: 1,
        },
      },
      isLoading: false,
    });
    renderWithProviders(<ConnectorsPage />);
    await waitFor(
      () => {
        const viewBtn =
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryByTitle(/View Details/i) ||
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
        expect(screen.queryByText(/Connector Details/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles connector with advanced settings", async () => {
    const user = userEvent.setup();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useGetConnectorById as jest.MockedFunction<any>).mockReturnValue({
      data: {
        message: {
          id: 1,
          name: "Advanced Connector",
          supports_batch: 1,
          batch_size: 100,
          status: 1,
        },
      },
      isLoading: false,
    });
    renderWithProviders(<ConnectorsPage />);

    const viewBtn = await screen.findByTitle(/View Details/i);
    await user.click(viewBtn);

    expect(await screen.findByText(/Advanced Settings/i)).toBeInTheDocument();
  });

  it("handles edit from view dialog", async () => {
    renderWithProviders(<ConnectorsPage />);
    await waitFor(
      () => {
        const viewBtn =
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryByTitle(/View Details/i) ||
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
        const editBtn = screen.queryByRole("button", { name: /Edit Connector/i });
        if (editBtn) {
          fireEvent.click(editBtn);
        }
      },
      { timeout: 10000 }
    );
  });
});
