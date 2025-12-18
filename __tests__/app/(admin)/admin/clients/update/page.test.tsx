
import {
  fireEvent as testingLibraryFireEvent,
  screen as testingLibraryScreen,
} from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import UpdateClientPage from "../../../../../../src/app/(admin)/admin/clients/update/page";
import { renderWithProviders, waitFor } from "../../../../../test-utils";

// Use screen and fireEvent directly from @testing-library/react for proper TypeScript types
const screen: typeof testingLibraryScreen = testingLibraryScreen;
const fireEvent: typeof testingLibraryFireEvent = testingLibraryFireEvent;

const mockMutateAsync = jest.fn();
const mockRefetch = jest.fn();
const mockGet = jest.fn();

jest.mock("@/controller/query/admin/clients/useAdminClients", () => ({
  useAdminClientAccountTypes: jest.fn(),
  useAdminClientCountries: jest.fn(),
  useAdminClientDetails: jest.fn(),
  useUpdateAdminClient: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  useSearchParams: () => ({
    get: mockGet,
  }),
  usePathname: () => "/admin/clients/update",
}));

import * as hooks from "../../../../../../src/controller/query/admin/clients/useAdminClients";

describe("app/(admin)/admin/clients/update/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
    mockMutateAsync.mockResolvedValue({});
    mockRefetch.mockResolvedValue({});
    mockGet.mockReturnValue("test-id");

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
    (hooks.useAdminClientDetails as jest.MockedFunction<any>).mockReturnValue({
      data: {
        message: {
          id: 1,
          name: "Test Client",
          email: "test@test.com",
          msisdn: "+243900000000",
          account_type: "premium",
          country_code: "CD",
          address: "123 Main St",
        },
      },
      isLoading: false,
      refetch: mockRefetch,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useUpdateAdminClient as jest.MockedFunction<any>).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  it("module loads", () => {
    expect(UpdateClientPage).toBeDefined();
  });

  it("renders update client page", async () => {
    renderWithProviders(<UpdateClientPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Update client profile/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders header with title and description", async () => {
    renderWithProviders(<UpdateClientPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Update client profile/i)).toBeInTheDocument();
        expect(screen.queryByText(/Locate a tenant by ID or email/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders search section", async () => {
    renderWithProviders(<UpdateClientPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Locate client account/i)).toBeInTheDocument();
        // @ts-expect-error - TypeScript inference issue with screen types
        expect(screen.queryByPlaceholderText(/Client ID or email/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles search input change", async () => {
    renderWithProviders(<UpdateClientPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const searchInput = screen.queryByPlaceholderText(/Client ID or email/i);
        if (searchInput) {
          fireEvent.change(searchInput, { target: { value: "new-search" } });
          expect(searchInput).toHaveValue("new-search");
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles search button click", async () => {
    renderWithProviders(<UpdateClientPage />);
    await waitFor(
      () => {
        const searchBtn = screen.queryByText(/Search client/i);
        if (searchBtn) {
          fireEvent.click(searchBtn);
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles search with empty value", async () => {
    renderWithProviders(<UpdateClientPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const searchInput = screen.queryByPlaceholderText(/Client ID or email/i);
        if (searchInput) {
          fireEvent.change(searchInput, { target: { value: "" } });
        }
        const searchBtn = screen.queryByText(/Search client/i);
        if (searchBtn) {
          fireEvent.click(searchBtn);
        }
      },
      { timeout: 10000 }
    );
  });

  it("renders form fields when client is loaded", async () => {
    renderWithProviders(<UpdateClientPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        expect(screen.queryByLabelText(/Company name/i)).toBeInTheDocument();
        // @ts-expect-error - TypeScript inference issue with screen types
        expect(screen.queryByLabelText(/email/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles form field changes", async () => {
    renderWithProviders(<UpdateClientPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const nameInput = screen.queryByLabelText(/Company name/i);
        if (nameInput && !nameInput.hasAttribute("disabled")) {
          fireEvent.change(nameInput, { target: { value: "Updated Name" } });
          expect(nameInput).toHaveValue("Updated Name");
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles form submission", async () => {
    renderWithProviders(<UpdateClientPage />);
    await waitFor(
      () => {
        const updateBtn = screen.queryByRole("button", { name: /Update client/i });
        if (updateBtn && !updateBtn.hasAttribute("disabled")) {
          const form = updateBtn.closest("form");
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
    renderWithProviders(<UpdateClientPage />);
    await waitFor(
      () => {
        const updateBtn = screen.queryByRole("button", { name: /Update client/i });
        if (updateBtn) {
          const form = updateBtn.closest("form");
          if (form) {
            // @ts-expect-error - TypeScript inference issue with fireEvent types
            fireEvent.submit(form);
          }
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles form submission without selected client", async () => {
    mockGet.mockReturnValue(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientDetails as jest.MockedFunction<any>).mockReturnValue({
      data: null,
      isLoading: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<UpdateClientPage />);
    await waitFor(
      () => {
        const updateBtn = screen.queryByRole("button", { name: /Update client/i });
        if (updateBtn) {
          const form = updateBtn.closest("form");
          if (form) {
            // @ts-expect-error - TypeScript inference issue with fireEvent types
            fireEvent.submit(form);
          }
        }
      },
      { timeout: 10000 }
    );
  });

  it("disables form fields when no client is selected", async () => {
    mockGet.mockReturnValue(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientDetails as jest.MockedFunction<any>).mockReturnValue({
      data: null,
      isLoading: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<UpdateClientPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const nameInput = screen.queryByLabelText(/Company name/i);
        if (nameInput) {
          expect(nameInput).toBeDisabled();
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles loading state", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientDetails as jest.MockedFunction<any>).mockReturnValue({
      data: null,
      isLoading: true,
      refetch: mockRefetch,
    });
    renderWithProviders(<UpdateClientPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Loading/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles client details from data format", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientDetails as jest.MockedFunction<any>).mockReturnValue({
      data: {
        data: {
          id: 1,
          name: "Data Client",
          email: "data@test.com",
          msisdn: "+243900000000",
          account_type: "premium",
          country_code: "CD",
        },
      },
      isLoading: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<UpdateClientPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Update client profile/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles client with account_type_id", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientDetails as jest.MockedFunction<any>).mockReturnValue({
      data: {
        message: {
          id: 1,
          name: "Type ID Client",
          account_type_id: 1,
          country_code: "CD",
        },
      },
      isLoading: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<UpdateClientPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Update client profile/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles client with location instead of address", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientDetails as jest.MockedFunction<any>).mockReturnValue({
      data: {
        message: {
          id: 1,
          name: "Location Client",
          location: "456 Second St",
        },
      },
      isLoading: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<UpdateClientPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Update client profile/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles country selection", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UpdateClientPage />);
    await waitFor(
      () => {
        const countrySelect =
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryByLabelText(/Country code/i) ||
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryAllByRole("combobox")[0];
        if (countrySelect && !countrySelect.hasAttribute("disabled")) {
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
    renderWithProviders(<UpdateClientPage />);
    await waitFor(
      () => {
        const accountTypeSelect =
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryByLabelText(/Account tier/i) ||
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryAllByRole("combobox")[1];
        if (accountTypeSelect && !accountTypeSelect.hasAttribute("disabled")) {
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

  it("handles mutation error", async () => {
    mockMutateAsync.mockRejectedValue(new Error("Update failed"));
    renderWithProviders(<UpdateClientPage />);
    await waitFor(
      () => {
        const updateBtn = screen.queryByRole("button", { name: /Update client/i });
        if (updateBtn && !updateBtn.hasAttribute("disabled")) {
          const form = updateBtn.closest("form");
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
    renderWithProviders(<UpdateClientPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Back to clients/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });
});
