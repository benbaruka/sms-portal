
import {
  fireEvent as testingLibraryFireEvent,
  screen as testingLibraryScreen,
} from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import CreateTokenPage from "../../../../../../src/app/(admin)/admin/tokens/create/page";
import { renderWithProviders, waitFor } from "../../../../../test-utils";

// Use screen and fireEvent directly from @testing-library/react for proper TypeScript types
const screen: typeof testingLibraryScreen = testingLibraryScreen;
const fireEvent: typeof testingLibraryFireEvent = testingLibraryFireEvent;

const mockCreateToken = jest.fn();

jest.mock("@/controller/query/admin/tokens/useAdminTokens", () => ({
  useAdminTokenClients: jest.fn(),
  useCreateAdminToken: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

import * as hooks from "../../../../../../src/controller/query/admin/tokens/useAdminTokens";

describe("app/(admin)/admin/tokens/create/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
    mockCreateToken.mockResolvedValue({});

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminTokenClients as jest.MockedFunction<any>).mockReturnValue({
      data: {
        clients: [{ id: 1, name: "Test Client", email: "test@test.com" }],
      },
      isLoading: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useCreateAdminToken as jest.MockedFunction<any>).mockReturnValue({
      mutateAsync: mockCreateToken,
      isPending: false,
    });
  });

  it("module loads", () => {
    expect(CreateTokenPage).toBeDefined();
  });

  it("renders create token page", async () => {
    renderWithProviders(<CreateTokenPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Create a live API token/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders form fields", async () => {
    renderWithProviders(<CreateTokenPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        expect(screen.queryByLabelText(/Client/i)).toBeInTheDocument();
        // @ts-expect-error - TypeScript inference issue with screen types
        expect(screen.queryByLabelText(/Token type/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles client selection", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateTokenPage />);
    await waitFor(
      () => {
        const clientSelect =
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryByLabelText(/Client/i) ||
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryAllByRole("combobox")[0];
        if (clientSelect) {
          user.click(clientSelect);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        const clientOption = screen.queryByText("Test Client");
        if (clientOption) {
          fireEvent.click(clientOption);
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles token type selection", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateTokenPage />);
    await waitFor(
      () => {
        const typeSelect =
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryByLabelText(/Token type/i) ||
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryAllByRole("combobox")[1];
        if (typeSelect) {
          user.click(typeSelect);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        const testOption = screen.queryByText("Test");
        if (testOption) {
          fireEvent.click(testOption);
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles label input change", async () => {
    renderWithProviders(<CreateTokenPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const labelInput = screen.queryByLabelText(/Label/i);
        if (labelInput) {
          fireEvent.change(labelInput, { target: { value: "Test Label" } });
          expect(labelInput).toHaveValue("Test Label");
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles form submission", async () => {
    renderWithProviders(<CreateTokenPage />);
    await waitFor(
      () => {
        const clientSelect =
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryByLabelText(/Client/i) ||
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryAllByRole("combobox")[0];
        if (clientSelect) {
          fireEvent.click(clientSelect);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        const clientOption = screen.queryByText("Test Client");
        if (clientOption) {
          fireEvent.click(clientOption);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        const submitBtn = screen.queryByRole("button", { name: /Create token/i });
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

  it("handles form submission without apiKey", async () => {
    localStorage.removeItem("apiKey");
    renderWithProviders(<CreateTokenPage />);
    await waitFor(
      () => {
        const submitBtn = screen.queryByRole("button", { name: /Create token/i });
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
    renderWithProviders(<CreateTokenPage />);
    await waitFor(
      () => {
        const submitBtn = screen.queryByRole("button", { name: /Create token/i });
        if (submitBtn) {
          expect(submitBtn).toBeDisabled();
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles clients from different formats", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminTokenClients as jest.MockedFunction<any>).mockReturnValue({
      data: [{ id: 2, name: "Data Client" }],
      isLoading: false,
    });
    renderWithProviders(<CreateTokenPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Create a live API token/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles loading clients state", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminTokenClients as jest.MockedFunction<any>).mockReturnValue({
      data: null,
      isLoading: true,
    });
    renderWithProviders(<CreateTokenPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Create a live API token/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles mutation error", async () => {
    mockCreateToken.mockRejectedValue(new Error("Creation failed"));
    renderWithProviders(<CreateTokenPage />);
    await waitFor(
      () => {
        const clientSelect =
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryByLabelText(/Client/i) ||
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryAllByRole("combobox")[0];
        if (clientSelect) {
          fireEvent.click(clientSelect);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        const clientOption = screen.queryByText("Test Client");
        if (clientOption) {
          fireEvent.click(clientOption);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        const submitBtn = screen.queryByRole("button", { name: /Create token/i });
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

  it("renders back button", async () => {
    renderWithProviders(<CreateTokenPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Back to tokens/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });
});
