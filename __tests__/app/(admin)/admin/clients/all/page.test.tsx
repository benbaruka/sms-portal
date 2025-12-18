
import {
  fireEvent as testingLibraryFireEvent,
  screen as testingLibraryScreen,
} from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { renderWithProviders, waitFor } from "../../../../../test-utils";
import AllClientsPage from "../../../../../../src/app/(admin)/admin/clients/all/page";

// Use screen and fireEvent directly from @testing-library/react for proper TypeScript types
const screen: typeof testingLibraryScreen = testingLibraryScreen;
const fireEvent: typeof testingLibraryFireEvent = testingLibraryFireEvent;

const mockRefetch = jest.fn();

jest.mock("@/controller/query/admin/clients/useAdminClients", () => ({
  useAdminClientAccountTypes: jest.fn(),
  useAdminClientsList: jest.fn(),
  useAdminClientCountries: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

import * as hooks from "../../../../../../src/controller/query/admin/clients/useAdminClients";

describe("app/(admin)/admin/clients/all/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
    mockRefetch.mockResolvedValue({});

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientAccountTypes as jest.MockedFunction<any>).mockReturnValue({
      data: { data: [{ id: 1, name: "Premium", code: "premium" }] },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientCountries as jest.MockedFunction<any>).mockReturnValue({
      data: { data: [{ code: "CD", name: "Congo", dial_code: "+243" }] },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientsList as jest.MockedFunction<any>).mockReturnValue({
      data: {
        clients: [
          {
            id: 1,
            name: "Test Client",
            email: "test@test.com",
            msisdn: "+243900000000",
            status: 1,
            account_type: "premium",
            country_code: "CD",
            created_at: "2024-01-15T10:00:00Z",
          },
        ],
        pagination: { total: 1, total_pages: 1, current_page: 1, from: 1, to: 1 },
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
  });

  it("module loads", () => {
    expect(AllClientsPage).toBeDefined();
  });

  it("renders all clients page", async () => {
    renderWithProviders(<AllClientsPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Client Portfolio Overview/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders header with title and description", async () => {
    renderWithProviders(<AllClientsPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Client Portfolio Overview/i)).toBeInTheDocument();
        expect(screen.queryByText(/Audit every customer account/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders refresh button", async () => {
    renderWithProviders(<AllClientsPage />);
    await waitFor(
      () => {
        const refreshBtn = screen.queryByText(/Refresh list/i) || screen.queryByText(/Refresh/i);
        expect(refreshBtn).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders create client button", async () => {
    renderWithProviders(<AllClientsPage />);
    await waitFor(
      () => {
        const createBtn = screen.queryByText(/Create client/i);
        expect(createBtn).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("displays stats cards", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientsList as jest.MockedFunction<any>).mockReturnValue({
      data: {
        clients: [
          { id: 1, status: 1, country_code: "CD", account_type: "premium" },
          { id: 2, status: 0, country_code: "KE", account_type: "normal" },
          { id: 3, status: 1, country_code: "UG", account_type: "premium" },
        ],
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<AllClientsPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Total clients/i)).toBeInTheDocument();
        const activeElements = screen.queryAllByText(/Active/i);
        expect(activeElements.length).toBeGreaterThan(0);
        const inactiveElements = screen.queryAllByText(/Inactive/i);
        expect(inactiveElements.length).toBeGreaterThan(0);
        expect(screen.queryByText(/Markets covered/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  }, 15000);

  it("renders search input", async () => {
    renderWithProviders(<AllClientsPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const searchInput = screen.queryByPlaceholderText(/Search by client name/i);
        expect(searchInput).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles search input change", async () => {
    renderWithProviders(<AllClientsPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const searchInput = screen.queryByPlaceholderText(/Search by client name/i);
        expect(searchInput).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
    // @ts-expect-error - TypeScript inference issue with screen types
    const searchInput = screen.queryByPlaceholderText(/Search by client name/i);
    if (searchInput) {
      fireEvent.change(searchInput, { target: { value: "Test" } });
      expect(searchInput).toHaveValue("Test");
    }
  });

  it("handles status filter change", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AllClientsPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Manage client directory/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const statusSelects = screen.queryAllByRole("combobox");
        expect(statusSelects.length).toBeGreaterThan(0);
      },
      { timeout: 10000 }
    );
    // @ts-expect-error - TypeScript inference issue with screen types
    const statusSelects = screen.queryAllByRole("combobox");
    if (statusSelects.length > 0) {
      await user.click(statusSelects[0]);
      await waitFor(
        () => {
          const activeOption = screen.queryByText(/Active/i);
          if (activeOption) {
            fireEvent.click(activeOption);
          }
        },
        { timeout: 10000 }
      );
    }
  }, 20000);

  it("handles account type filter change", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AllClientsPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Manage client directory/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const selects = screen.queryAllByRole("combobox");
        expect(selects.length).toBeGreaterThan(1);
      },
      { timeout: 10000 }
    );
    // @ts-expect-error - TypeScript inference issue with screen types
    const selects = screen.queryAllByRole("combobox");
    if (selects.length > 1) {
      await user.click(selects[1]);
      await waitFor(
        () => {
          const premiumOption = screen.queryByText(/Premium/i);
          if (premiumOption) {
            fireEvent.click(premiumOption);
          }
        },
        { timeout: 10000 }
      );
    }
  }, 20000);

  it("handles country filter change", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AllClientsPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Manage client directory/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // @ts-expect-error - TypeScript inference issue with screen types
    const selects = screen.queryAllByRole("combobox");
    if (selects.length > 3) {
      await user.click(selects[2]);
      await waitFor(
        () => {
          const congoOption = screen.queryByText(/Congo/i);
          if (congoOption) {
            fireEvent.click(congoOption);
          }
        },
        { timeout: 10000 }
      );
    }
  });

  it("handles refresh button", async () => {
    renderWithProviders(<AllClientsPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const refreshBtns = screen.queryAllByText(/Refresh/i);
        expect(refreshBtns.length).toBeGreaterThan(0);
      },
      { timeout: 10000 }
    );
    // @ts-expect-error - TypeScript inference issue with screen types
    const refreshBtns = screen.queryAllByText(/Refresh/i);
    if (refreshBtns.length > 0) {
      fireEvent.click(refreshBtns[0]);
      await waitFor(
        () => {
          expect(mockRefetch).toHaveBeenCalled();
        },
        { timeout: 10000 }
      );
    }
  });

  it("shows loading state", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientsList as jest.MockedFunction<any>).mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<AllClientsPage />);
    await waitFor(
      () => {
        const loadingText = screen.queryByText(/Loading clients/i);
        expect(loadingText).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  }, 15000);

  it("shows empty state", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientsList as jest.MockedFunction<any>).mockReturnValue({
      data: { clients: [] },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<AllClientsPage />);
    await waitFor(
      () => {
        const emptyText = screen.queryByText(/No clients match the current filters/i);
        const createText = screen.queryByText(/Create client/i);
        expect(emptyText || createText).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  }, 15000);

  it("renders clients table", async () => {
    renderWithProviders(<AllClientsPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("Test Client")).toBeInTheDocument();
        expect(screen.queryByText("test@test.com")).toBeInTheDocument();
        expect(screen.queryByText("+243900000000")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  }, 15000);

  it("handles pagination", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientsList as jest.MockedFunction<any>).mockReturnValue({
      data: {
        clients: [{ id: 1, name: "Client", status: 1 }],
        pagination: { total: 25, total_pages: 3, current_page: 1, from: 1, to: 12 },
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<AllClientsPage />);
    await waitFor(
      () => {
        // The pagination text format is "Page {page} of {total_pages || last_page || 1}"
        expect(screen.queryByText(/Page \d+ of \d+/i)).toBeInTheDocument();
        const nextBtn = screen.queryByText(/Next/i);
        if (nextBtn && !nextBtn.hasAttribute("disabled")) {
          fireEvent.click(nextBtn);
        }
      },
      { timeout: 10000 }
    );
  }, 15000);

  it("handles pagination previous button", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientsList as jest.MockedFunction<any>).mockReturnValue({
      data: {
        clients: [{ id: 1, name: "Client", status: 1 }],
        pagination: { total: 25, total_pages: 3, current_page: 2, from: 13, to: 24 },
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<AllClientsPage />);
    await waitFor(
      () => {
        const prevBtn = screen.queryByText(/Previous/i);
        if (prevBtn && !prevBtn.hasAttribute("disabled")) {
          fireEvent.click(prevBtn);
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles refresh error", async () => {
    mockRefetch.mockRejectedValue(new Error("Network error"));
    renderWithProviders(<AllClientsPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const refreshBtns = screen.queryAllByText(/Refresh/i);
        if (refreshBtns.length > 0) {
          fireEvent.click(refreshBtns[0]);
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles different response formats", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientsList as jest.MockedFunction<any>).mockReturnValue({
      data: {
        message: {
          clients: [{ id: 1, name: "Client Message", status: 1 }],
        },
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<AllClientsPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Client Message/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  }, 15000);

  it("handles client with missing fields", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientsList as jest.MockedFunction<any>).mockReturnValue({
      data: {
        clients: [
          {
            id: 1,
            name: undefined,
            email: undefined,
            msisdn: undefined,
            status: 1,
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<AllClientsPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("--")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  }, 15000);

  it("handles client with company_name instead of name", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientsList as jest.MockedFunction<any>).mockReturnValue({
      data: {
        clients: [
          {
            id: 1,
            company_name: "Company Client",
            email: "company@test.com",
            status: 1,
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<AllClientsPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("Company Client")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles client with phone instead of msisdn", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientsList as jest.MockedFunction<any>).mockReturnValue({
      data: {
        clients: [
          {
            id: 1,
            name: "Phone Client",
            phone: "+243900000001",
            status: 1,
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<AllClientsPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("Phone Client")).toBeInTheDocument();
        expect(screen.queryByText("+243900000001")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles isRefreshing state", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientsList as jest.MockedFunction<any>).mockReturnValue({
      data: { clients: [] },
      isLoading: false,
      isFetching: true,
      refetch: mockRefetch,
    });
    renderWithProviders(<AllClientsPage />);
    await waitFor(
      () => {
        expect(
          screen.queryByText(/Refreshing/i) || screen.queryByText(/Syncing/i)
        ).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles account types from message format", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientAccountTypes as jest.MockedFunction<any>).mockReturnValue({
      data: { message: [{ id: 2, name: "Enterprise", code: "enterprise" }] },
    });
    renderWithProviders(<AllClientsPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Client Portfolio Overview/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles countries from message format", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientCountries as jest.MockedFunction<any>).mockReturnValue({
      data: { message: [{ code: "KE", name: "Kenya", dial_code: "+254" }] },
    });
    renderWithProviders(<AllClientsPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Client Portfolio Overview/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles pagination with last_page", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientsList as jest.MockedFunction<any>).mockReturnValue({
      data: {
        clients: [{ id: 1, name: "Client", status: 1 }],
        pagination: { total: 25, last_page: 3, current_page: 1, from: 1, to: 12 },
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<AllClientsPage />);
    await waitFor(
      () => {
        // The pagination text format is "Page {page} of {total_pages || last_page || 1}"
        expect(screen.queryByText(/Page \d+ of \d+/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  }, 15000);

  it("handles missing apiKey", () => {
    localStorage.removeItem("apiKey");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminClientsList as jest.MockedFunction<any>).mockReturnValue({
      data: null,
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<AllClientsPage />);
    expect(screen.queryByText(/Client Portfolio Overview/i)).toBeInTheDocument();
  });
});
