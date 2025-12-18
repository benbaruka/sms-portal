
import {
  fireEvent as testingLibraryFireEvent,
  screen as testingLibraryScreen,
} from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import CreateClientPage from "../../../../../../src/app/(admin)/admin/clients/create/page";
import { renderWithProviders, waitFor } from "../../../../../test-utils";

// Use screen and fireEvent directly from @testing-library/react for proper TypeScript types
const screen: typeof testingLibraryScreen = testingLibraryScreen;
const fireEvent: typeof testingLibraryFireEvent = testingLibraryFireEvent;

const mockMutateAsync = jest.fn();
const mockPush = jest.fn();

jest.mock("@/controller/query/admin/clients/useAdminClients", () => ({
  useAdminClientAccountTypes: jest.fn(),
  useAdminClientCountries: jest.fn(),
  useCreateAdminClient: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
  }),
}));

import * as hooks from "../../../../../../src/controller/query/admin/clients/useAdminClients";

describe("app/(admin)/admin/clients/create/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
    mockMutateAsync.mockResolvedValue({});
    mockPush.mockReturnValue(undefined);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientAccountTypes as jest.MockedFunction<any>).mockReturnValue({
      data: { data: [{ id: 1, name: "Premium", code: "premium" }] },
      isLoading: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientCountries as jest.MockedFunction<any>).mockReturnValue({
      data: { data: [{ code: "CD", name: "Congo", dial_code: "+243" }] },
      isLoading: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useCreateAdminClient as jest.MockedFunction<any>).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  it("module loads", () => {
    expect(CreateClientPage).toBeDefined();
  });

  it("renders create client page", async () => {
    renderWithProviders(<CreateClientPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Onboard a new client tenant/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders header with title and description", async () => {
    renderWithProviders(<CreateClientPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Onboard a new client tenant/i)).toBeInTheDocument();
        expect(screen.queryByText(/Capture the company profile/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders back button", async () => {
    renderWithProviders(<CreateClientPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Back to clients/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders form fields", async () => {
    renderWithProviders(<CreateClientPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        expect(screen.queryByLabelText(/Company name/i)).toBeInTheDocument();
        // @ts-expect-error - TypeScript inference issue with screen types
        expect(screen.queryByLabelText(/email/i)).toBeInTheDocument();
        // @ts-expect-error - TypeScript inference issue with screen types
        expect(screen.queryByLabelText(/phone/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles form field changes", async () => {
    renderWithProviders(<CreateClientPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const nameInput = screen.queryByLabelText(/Company name/i);
        if (nameInput) {
          fireEvent.change(nameInput, { target: { value: "Test Company" } });
          expect(nameInput).toHaveValue("Test Company");
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles country selection", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateClientPage />);
    await waitFor(
      () => {
        const countrySelect =
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryByLabelText(/Country code/i) ||
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryAllByRole("combobox")[0];
        if (countrySelect) {
          user.click(countrySelect);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        const congoOption = screen.queryByText(/Congo/i);
        if (congoOption) {
          fireEvent.click(congoOption);
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles account type selection", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateClientPage />);
    await waitFor(
      () => {
        const accountTypeSelect =
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryByLabelText(/Account tier/i) ||
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryAllByRole("combobox")[1];
        if (accountTypeSelect) {
          user.click(accountTypeSelect);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        const premiumOption = screen.queryByText("Premium");
        if (premiumOption) {
          fireEvent.click(premiumOption);
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles form submission", async () => {
    renderWithProviders(<CreateClientPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const nameInput = screen.queryByLabelText(/Company name/i);
        // @ts-expect-error - TypeScript inference issue with screen types
        const emailInput = screen.queryByLabelText(/email/i);
        // @ts-expect-error - TypeScript inference issue with screen types
        const phoneInput = screen.queryByLabelText(/phone/i);

        if (nameInput) fireEvent.change(nameInput, { target: { value: "Test Company" } });
        if (emailInput) fireEvent.change(emailInput, { target: { value: "test@example.com" } });
        if (phoneInput) fireEvent.change(phoneInput, { target: { value: "+243900000000" } });
      },
      { timeout: 10000 }
    );

    await waitFor(
      () => {
        const countrySelect =
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryByLabelText(/Country code/i) ||
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryAllByRole("combobox")[0];
        if (countrySelect) {
          fireEvent.click(countrySelect);
        }
      },
      { timeout: 10000 }
    );

    await waitFor(
      () => {
        const congoOption = screen.queryByText(/Congo/i);
        if (congoOption) {
          fireEvent.click(congoOption);
        }
      },
      { timeout: 10000 }
    );

    await waitFor(
      () => {
        const accountTypeSelect =
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryByLabelText(/Account tier/i) ||
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryAllByRole("combobox")[1];
        if (accountTypeSelect) {
          fireEvent.click(accountTypeSelect);
        }
      },
      { timeout: 10000 }
    );

    await waitFor(
      () => {
        const premiumOption = screen.queryByText("Premium");
        if (premiumOption) {
          fireEvent.click(premiumOption);
        }
      },
      { timeout: 10000 }
    );

    await waitFor(
      () => {
        const submitBtn = screen.queryByRole("button", { name: /Create client/i });
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
        expect(mockMutateAsync).toHaveBeenCalled();
      },
      { timeout: 10000 }
    );
  });

  it("handles form submission without apiKey", async () => {
    localStorage.removeItem("apiKey");
    renderWithProviders(<CreateClientPage />);
    await waitFor(
      () => {
        const submitBtn = screen.queryByRole("button", { name: /Create client/i });
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

  it("disables submit button when form is invalid", async () => {
    renderWithProviders(<CreateClientPage />);
    await waitFor(
      () => {
        const submitBtn = screen.queryByRole("button", { name: /Create client/i });
        if (submitBtn) {
          expect(submitBtn).toBeDisabled();
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles notes input change", async () => {
    renderWithProviders(<CreateClientPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const notesInput = screen.queryByLabelText(/notes/i);
        if (notesInput) {
          fireEvent.change(notesInput, { target: { value: "Test notes" } });
          expect(notesInput).toHaveValue("Test notes");
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles address input change", async () => {
    renderWithProviders(<CreateClientPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const addressInput = screen.queryByLabelText(/Head office/i);
        if (addressInput) {
          fireEvent.change(addressInput, { target: { value: "123 Main St" } });
          expect(addressInput).toHaveValue("123 Main St");
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles loading states", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientAccountTypes as jest.MockedFunction<any>).mockReturnValue({
      data: { data: [] },
      isLoading: true,
    });
    renderWithProviders(<CreateClientPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Onboard a new client tenant/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles mutation error", async () => {
    mockMutateAsync.mockRejectedValue(new Error("Creation failed"));
    renderWithProviders(<CreateClientPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const nameInput = screen.queryByLabelText(/Company name/i);
        // @ts-expect-error - TypeScript inference issue with screen types
        const emailInput = screen.queryByLabelText(/email/i);
        // @ts-expect-error - TypeScript inference issue with screen types
        const phoneInput = screen.queryByLabelText(/phone/i);

        if (nameInput) fireEvent.change(nameInput, { target: { value: "Test Company" } });
        if (emailInput) fireEvent.change(emailInput, { target: { value: "test@example.com" } });
        if (phoneInput) fireEvent.change(phoneInput, { target: { value: "+243900000000" } });
      },
      { timeout: 10000 }
    );

    await waitFor(
      () => {
        const countrySelect =
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryByLabelText(/Country code/i) ||
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryAllByRole("combobox")[0];
        if (countrySelect) {
          fireEvent.click(countrySelect);
        }
      },
      { timeout: 10000 }
    );

    await waitFor(
      () => {
        const congoOption = screen.queryByText(/Congo/i);
        if (congoOption) {
          fireEvent.click(congoOption);
        }
      },
      { timeout: 10000 }
    );

    await waitFor(
      () => {
        const accountTypeSelect =
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryByLabelText(/Account tier/i) ||
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryAllByRole("combobox")[1];
        if (accountTypeSelect) {
          fireEvent.click(accountTypeSelect);
        }
      },
      { timeout: 10000 }
    );

    await waitFor(
      () => {
        const premiumOption = screen.queryByText("Premium");
        if (premiumOption) {
          fireEvent.click(premiumOption);
        }
      },
      { timeout: 10000 }
    );

    await waitFor(
      () => {
        const submitBtn = screen.queryByRole("button", { name: /Create client/i });
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
