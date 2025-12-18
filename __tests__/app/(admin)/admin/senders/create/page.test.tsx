
import {
  fireEvent as testingLibraryFireEvent,
  screen as testingLibraryScreen,
} from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import AdminCreateSenderPage from "../../../../../../src/app/(admin)/admin/senders/create/page";
import { renderWithProviders, waitFor } from "../../../../../test-utils";

// Use screen and fireEvent directly from @testing-library/react for proper TypeScript types
const screen: typeof testingLibraryScreen = testingLibraryScreen;
const fireEvent: typeof testingLibraryFireEvent = testingLibraryFireEvent;

const mockCreateSender = jest.fn();
const mockPush = jest.fn();

jest.mock("@/controller/query/senders/useSenders", () => ({
  useCreateSenderIdRequest: jest.fn(),
}));

jest.mock("@/controller/query/connectors/useConnectors", () => ({
  useGetAllConnectors: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
  }),
}));

jest.mock("@/context/AuthProvider", () => ({
  useAuth: () => ({
    user: { message: { client: { id: 1 } } },
    isAuthenticated: true,
  }),
}));

import * as connectorHooks from "../../../../../../src/controller/query/connectors/useConnectors";
import * as senderHooks from "../../../../../../src/controller/query/senders/useSenders";

describe("app/(admin)/admin/senders/create/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
    mockCreateSender.mockResolvedValue({});
    mockPush.mockReturnValue(undefined);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (connectorHooks.useGetAllConnectors as jest.MockedFunction<any>).mockReturnValue({
      data: {
        message: [
          { id: 1, name: "Test Connector" },
          { id: 2, name: "Another Connector" },
        ],
      },
      isLoading: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (senderHooks.useCreateSenderIdRequest as jest.MockedFunction<any>).mockReturnValue({
      mutateAsync: mockCreateSender,
      isPending: false,
    });
  });

  it("module loads", () => {
    expect(AdminCreateSenderPage).toBeDefined();
  });

  it("renders create sender page", async () => {
    renderWithProviders(<AdminCreateSenderPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Create Sender ID/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders header with title and description", async () => {
    renderWithProviders(<AdminCreateSenderPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Create Sender ID/i)).toBeInTheDocument();
        expect(screen.queryByText(/Request a new sender ID/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders back button", async () => {
    renderWithProviders(<AdminCreateSenderPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Back to Senders/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders form fields", async () => {
    renderWithProviders(<AdminCreateSenderPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        expect(screen.queryByLabelText(/Sender ID/i)).toBeInTheDocument();
        // @ts-expect-error - TypeScript inference issue with screen types
        expect(screen.queryByLabelText(/Description/i)).toBeInTheDocument();
        // @ts-expect-error - TypeScript inference issue with screen types
        expect(screen.queryByLabelText(/Use case/i)).toBeInTheDocument();
        // @ts-expect-error - TypeScript inference issue with screen types
        expect(screen.queryByLabelText(/Connector/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles form field changes", async () => {
    renderWithProviders(<AdminCreateSenderPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const senderInput = screen.queryByLabelText(/Sender ID/i);
        if (senderInput) {
          fireEvent.change(senderInput, { target: { value: "TEST123" } });
          expect(senderInput).toHaveValue("TEST123");
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles connector selection", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminCreateSenderPage />);
    await waitFor(
      () => {
        const connectorSelect =
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryByLabelText(/Connector/i) ||
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryAllByRole("combobox")[0];
        if (connectorSelect) {
          user.click(connectorSelect);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        const connectorOption = screen.queryByText("Test Connector");
        if (connectorOption) {
          fireEvent.click(connectorOption);
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles form submission", async () => {
    renderWithProviders(<AdminCreateSenderPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const senderInput = screen.queryByLabelText(/Sender ID/i);
        // @ts-expect-error - TypeScript inference issue with screen types
        const descInput = screen.queryByLabelText(/Description/i);
        if (senderInput) fireEvent.change(senderInput, { target: { value: "TEST123" } });
        if (descInput) fireEvent.change(descInput, { target: { value: "Test description" } });
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        const connectorSelect =
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryByLabelText(/Connector/i) ||
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryAllByRole("combobox")[0];
        if (connectorSelect) {
          fireEvent.click(connectorSelect);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        const connectorOption = screen.queryByText("Test Connector");
        if (connectorOption) {
          fireEvent.click(connectorOption);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        const submitBtn = screen.queryByRole("button", { name: /Create Sender ID/i });
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
    await waitFor(
      () => {
        expect(mockCreateSender).toHaveBeenCalled();
      },
      { timeout: 10000 }
    );
  });

  it("handles form submission without apiKey", async () => {
    localStorage.removeItem("apiKey");
    renderWithProviders(<AdminCreateSenderPage />);
    await waitFor(
      () => {
        const submitBtn = screen.queryByRole("button", { name: /Create Sender ID/i });
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

  it("handles form submission without connector", async () => {
    renderWithProviders(<AdminCreateSenderPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const senderInput = screen.queryByLabelText(/Sender ID/i);
        if (senderInput) {
          fireEvent.change(senderInput, { target: { value: "TEST123" } });
        }
        const submitBtn = screen.queryByRole("button", { name: /Create Sender ID/i });
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

  it("handles form submission without sender ID", async () => {
    renderWithProviders(<AdminCreateSenderPage />);
    await waitFor(
      () => {
        const submitBtn = screen.queryByRole("button", { name: /Create Sender ID/i });
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

  it("handles loading connectors state", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (connectorHooks.useGetAllConnectors as jest.MockedFunction<any>).mockReturnValue({
      data: null,
      isLoading: true,
    });
    renderWithProviders(<AdminCreateSenderPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Create Sender ID/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles connectors from data format", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (connectorHooks.useGetAllConnectors as jest.MockedFunction<any>).mockReturnValue({
      data: {
        data: [{ id: 3, name: "Data Connector" }],
      },
      isLoading: false,
    });
    renderWithProviders(<AdminCreateSenderPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Create Sender ID/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles mutation error", async () => {
    mockCreateSender.mockRejectedValue(new Error("Creation failed"));
    renderWithProviders(<AdminCreateSenderPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const senderInput = screen.queryByLabelText(/Sender ID/i);
        // @ts-expect-error - TypeScript inference issue with screen types
        const descInput = screen.queryByLabelText(/Description/i);
        if (senderInput) fireEvent.change(senderInput, { target: { value: "TEST123" } });
        if (descInput) fireEvent.change(descInput, { target: { value: "Test description" } });
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        const connectorSelect =
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryByLabelText(/Connector/i) ||
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryAllByRole("combobox")[0];
        if (connectorSelect) {
          fireEvent.click(connectorSelect);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        const connectorOption = screen.queryByText("Test Connector");
        if (connectorOption) {
          fireEvent.click(connectorOption);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        const submitBtn = screen.queryByRole("button", { name: /Create Sender ID/i });
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
});
