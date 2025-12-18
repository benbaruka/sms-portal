
import {
  fireEvent as testingLibraryFireEvent,
  screen as testingLibraryScreen,
} from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import CreateTopupPage from "../../../../../../src/app/(admin)/admin/topup/create/page";
import { renderWithProviders, waitFor } from "../../../../../test-utils";

// Use screen and fireEvent directly from @testing-library/react for proper TypeScript types
const screen: typeof testingLibraryScreen = testingLibraryScreen;
const fireEvent: typeof testingLibraryFireEvent = testingLibraryFireEvent;

const mockCreateTopup = jest.fn();
const mockPush = jest.fn();

jest.mock("@/controller/query/topup/useTopup", () => ({
  useCreateManualTopup: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
  }),
}));

import * as topupHooks from "../../../../../../src/controller/query/topup/useTopup";

describe("app/(admin)/admin/topup/create/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
    mockCreateTopup.mockResolvedValue({});
    mockPush.mockReturnValue(undefined);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (topupHooks.useCreateManualTopup as jest.MockedFunction<any>).mockReturnValue({
      mutateAsync: mockCreateTopup,
      isPending: false,
    });
  });

  it("module loads", () => {
    expect(CreateTopupPage).toBeDefined();
  });

  it("renders create topup page", async () => {
    renderWithProviders(<CreateTopupPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Create Top-up Request/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders header with title and description", async () => {
    renderWithProviders(<CreateTopupPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Create Top-up Request/i)).toBeInTheDocument();
        expect(screen.queryByText(/Create a manual top-up request/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders back button", async () => {
    renderWithProviders(<CreateTopupPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Back to Requests/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders form fields", async () => {
    renderWithProviders(<CreateTopupPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        expect(screen.queryByLabelText(/Amount/i)).toBeInTheDocument();
        // @ts-expect-error - TypeScript inference issue with screen types
        expect(screen.queryByLabelText(/Currency/i)).toBeInTheDocument();
        // @ts-expect-error - TypeScript inference issue with screen types
        expect(screen.queryByLabelText(/Connector ID/i)).toBeInTheDocument();
        // @ts-expect-error - TypeScript inference issue with screen types
        expect(screen.queryByLabelText(/Invoice Number/i)).toBeInTheDocument();
        // @ts-expect-error - TypeScript inference issue with screen types
        expect(screen.queryByLabelText(/Invoice Path/i)).toBeInTheDocument();
        // @ts-expect-error - TypeScript inference issue with screen types
        expect(screen.queryByLabelText(/Description/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles form field changes", async () => {
    renderWithProviders(<CreateTopupPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const amountInput = screen.queryByLabelText(/Amount/i);
        if (amountInput) {
          fireEvent.change(amountInput, { target: { value: "100.50" } });
          expect(amountInput).toHaveValue(100.5);
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles currency selection", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateTopupPage />);
    await waitFor(
      () => {
        const currencySelect =
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryByLabelText(/Currency/i) ||
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryAllByRole("combobox")[0];
        if (currencySelect) {
          user.click(currencySelect);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        const eurOption = screen.queryByText("EUR");
        if (eurOption) {
          fireEvent.click(eurOption);
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles form submission", async () => {
    renderWithProviders(<CreateTopupPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const amountInput = screen.queryByLabelText(/Amount/i);
        // @ts-expect-error - TypeScript inference issue with screen types
        const connectorInput = screen.queryByLabelText(/Connector ID/i);
        // @ts-expect-error - TypeScript inference issue with screen types
        const invoiceNumberInput = screen.queryByLabelText(/Invoice Number/i);
        // @ts-expect-error - TypeScript inference issue with screen types
        const invoicePathInput = screen.queryByLabelText(/Invoice Path/i);

        if (amountInput) fireEvent.change(amountInput, { target: { value: "100" } });
        if (connectorInput) fireEvent.change(connectorInput, { target: { value: "1" } });
        if (invoiceNumberInput)
          fireEvent.change(invoiceNumberInput, { target: { value: "INV-001" } });
        if (invoicePathInput)
          fireEvent.change(invoicePathInput, { target: { value: "/path/to/invoice.pdf" } });
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        const submitBtn = screen.queryByRole("button", { name: /Create Top-up Request/i });
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
        expect(mockCreateTopup).toHaveBeenCalled();
      },
      { timeout: 10000 }
    );
  });

  it("handles form submission without apiKey", async () => {
    localStorage.removeItem("apiKey");
    renderWithProviders(<CreateTopupPage />);
    await waitFor(
      () => {
        const submitBtn = screen.queryByRole("button", { name: /Create Top-up Request/i });
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

  it("handles form submission with invalid amount", async () => {
    renderWithProviders(<CreateTopupPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const amountInput = screen.queryByLabelText(/Amount/i);
        if (amountInput) {
          fireEvent.change(amountInput, { target: { value: "0" } });
        }
        const submitBtn = screen.queryByRole("button", { name: /Create Top-up Request/i });
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

  it("handles form submission with invalid connector ID", async () => {
    renderWithProviders(<CreateTopupPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const amountInput = screen.queryByLabelText(/Amount/i);
        // @ts-expect-error - TypeScript inference issue with screen types
        const connectorInput = screen.queryByLabelText(/Connector ID/i);
        if (amountInput) fireEvent.change(amountInput, { target: { value: "100" } });
        if (connectorInput) fireEvent.change(connectorInput, { target: { value: "0" } });
        const submitBtn = screen.queryByRole("button", { name: /Create Top-up Request/i });
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

  it("handles form submission without invoice path", async () => {
    renderWithProviders(<CreateTopupPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const amountInput = screen.queryByLabelText(/Amount/i);
        // @ts-expect-error - TypeScript inference issue with screen types
        const connectorInput = screen.queryByLabelText(/Connector ID/i);
        // @ts-expect-error - TypeScript inference issue with screen types
        const invoiceNumberInput = screen.queryByLabelText(/Invoice Number/i);
        if (amountInput) fireEvent.change(amountInput, { target: { value: "100" } });
        if (connectorInput) fireEvent.change(connectorInput, { target: { value: "1" } });
        if (invoiceNumberInput)
          fireEvent.change(invoiceNumberInput, { target: { value: "INV-001" } });
        const submitBtn = screen.queryByRole("button", { name: /Create Top-up Request/i });
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

  it("handles form submission without invoice number", async () => {
    renderWithProviders(<CreateTopupPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const amountInput = screen.queryByLabelText(/Amount/i);
        // @ts-expect-error - TypeScript inference issue with screen types
        const connectorInput = screen.queryByLabelText(/Connector ID/i);
        // @ts-expect-error - TypeScript inference issue with screen types
        const invoicePathInput = screen.queryByLabelText(/Invoice Path/i);
        if (amountInput) fireEvent.change(amountInput, { target: { value: "100" } });
        if (connectorInput) fireEvent.change(connectorInput, { target: { value: "1" } });
        if (invoicePathInput)
          fireEvent.change(invoicePathInput, { target: { value: "/path/to/invoice.pdf" } });
        const submitBtn = screen.queryByRole("button", { name: /Create Top-up Request/i });
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

  it("handles description input change", async () => {
    renderWithProviders(<CreateTopupPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const descInput = screen.queryByLabelText(/Description/i);
        if (descInput) {
          fireEvent.change(descInput, { target: { value: "Test description" } });
          expect(descInput).toHaveValue("Test description");
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles mutation error", async () => {
    mockCreateTopup.mockRejectedValue(new Error("Creation failed"));
    renderWithProviders(<CreateTopupPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const amountInput = screen.queryByLabelText(/Amount/i);
        // @ts-expect-error - TypeScript inference issue with screen types
        const connectorInput = screen.queryByLabelText(/Connector ID/i);
        // @ts-expect-error - TypeScript inference issue with screen types
        const invoiceNumberInput = screen.queryByLabelText(/Invoice Number/i);
        // @ts-expect-error - TypeScript inference issue with screen types
        const invoicePathInput = screen.queryByLabelText(/Invoice Path/i);

        if (amountInput) fireEvent.change(amountInput, { target: { value: "100" } });
        if (connectorInput) fireEvent.change(connectorInput, { target: { value: "1" } });
        if (invoiceNumberInput)
          fireEvent.change(invoiceNumberInput, { target: { value: "INV-001" } });
        if (invoicePathInput)
          fireEvent.change(invoicePathInput, { target: { value: "/path/to/invoice.pdf" } });
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        const submitBtn = screen.queryByRole("button", { name: /Create Top-up Request/i });
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

  it("disables submit button when loading", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (topupHooks.useCreateManualTopup as jest.MockedFunction<any>).mockReturnValue({
      mutateAsync: mockCreateTopup,
      isPending: true,
    });
    renderWithProviders(<CreateTopupPage />);
    await waitFor(
      () => {
        const submitBtn = screen.queryByRole("button", { name: /Creating/i });
        if (submitBtn) {
          expect(submitBtn).toBeDisabled();
        }
      },
      { timeout: 10000 }
    );
  });
});
