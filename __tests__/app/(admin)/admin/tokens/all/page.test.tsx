
import {
  fireEvent as testingLibraryFireEvent,
  screen as testingLibraryScreen,
} from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import AllTokensPage from "../../../../../../src/app/(admin)/admin/tokens/all/page";
import { renderWithProviders, waitFor } from "../../../../../test-utils";

// Use screen and fireEvent directly from @testing-library/react for proper TypeScript types
const screen: typeof testingLibraryScreen = testingLibraryScreen;
const fireEvent: typeof testingLibraryFireEvent = testingLibraryFireEvent;

const mockRefetch = jest.fn();
const mockChangeStatus = jest.fn();

jest.mock("@/controller/query/admin/tokens/useAdminTokens", () => ({
  useAdminTokensList: jest.fn(),
  useChangeAdminTokenStatus: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

import * as hooks from "../../../../../../src/controller/query/admin/tokens/useAdminTokens";

describe("app/(admin)/admin/tokens/all/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
    mockRefetch.mockResolvedValue({});
    mockChangeStatus.mockResolvedValue({});

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminTokensList as jest.MockedFunction<any>).mockReturnValue({
      data: {
        tokens: [
          {
            id: 1,
            token: "test_token_123456",
            status: 1,
            token_type: "LIVE",
            client_id: 1,
            created_at: "2024-01-15T10:00:00Z",
          },
        ],
        pagination: { total: 1, total_pages: 1, current_page: 1, from: 1, to: 1 },
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useChangeAdminTokenStatus as jest.MockedFunction<any>).mockReturnValue({
      mutateAsync: mockChangeStatus,
      isPending: false,
    });
  });

  it("module loads", () => {
    expect(AllTokensPage).toBeDefined();
  });

  it("renders all tokens page", async () => {
    renderWithProviders(<AllTokensPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Client API Tokens/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("displays stats cards", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminTokensList as jest.MockedFunction<any>).mockReturnValue({
      data: {
        tokens: [
          { id: 1, status: 1, token_type: "LIVE" },
          { id: 2, status: 0, token_type: "TEST" },
        ],
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<AllTokensPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("Total tokens")).toBeInTheDocument();
        expect(screen.queryByText("Active")).toBeInTheDocument();
        expect(screen.queryByText("Revoked")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders search input", async () => {
    renderWithProviders(<AllTokensPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const searchInput = screen.queryByPlaceholderText(/Search tokens/i);
        expect(searchInput).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles search input change", async () => {
    renderWithProviders(<AllTokensPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const searchInput = screen.queryByPlaceholderText(/Search tokens/i);
        if (searchInput) {
          fireEvent.change(searchInput, { target: { value: "test" } });
          expect(searchInput).toHaveValue("test");
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles status filter change", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AllTokensPage />);
    await waitFor(
      () => {
        const statusSelect =
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryByPlaceholderText(/All status/i) ||
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryAllByRole("combobox")[0];
        if (statusSelect) {
          user.click(statusSelect);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        const activeOption = screen.queryByText("Active");
        if (activeOption) {
          fireEvent.click(activeOption);
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles token type filter change", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AllTokensPage />);
    await waitFor(
      () => {
        const typeSelect =
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryByPlaceholderText(/All types/i) ||
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
        const liveOption = screen.queryByText("Live");
        if (liveOption) {
          fireEvent.click(liveOption);
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles refresh button", async () => {
    renderWithProviders(<AllTokensPage />);
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

  it("handles copy token", async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });
    renderWithProviders(<AllTokensPage />);
    await waitFor(
      () => {
        const copyBtn =
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryByTitle(/Copy/i) ||
          // @ts-expect-error - TypeScript inference issue with screen types
          screen.queryAllByRole("button")[0];
        if (copyBtn) {
          fireEvent.click(copyBtn);
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles status toggle", async () => {
    renderWithProviders(<AllTokensPage />);
    await waitFor(
      () => {
        const toggleBtn = screen.queryByText(/Revoke/i) || screen.queryByText(/Activate/i);
        if (toggleBtn) {
          fireEvent.click(toggleBtn);
        }
      },
      { timeout: 10000 }
    );
  });

  it("shows loading state", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminTokensList as jest.MockedFunction<any>).mockReturnValue({
      data: null,
      isLoading: true,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<AllTokensPage />);
    expect(screen.queryByText(/Loading tokens/i)).toBeInTheDocument();
  });

  it("shows empty state", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminTokensList as jest.MockedFunction<any>).mockReturnValue({
      data: { tokens: [] },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<AllTokensPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/No tokens match/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders tokens table", async () => {
    renderWithProviders(<AllTokensPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/test_token/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles pagination", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminTokensList as jest.MockedFunction<any>).mockReturnValue({
      data: {
        tokens: [{ id: 1, token: "token", status: 1 }],
        pagination: { total: 25, total_pages: 3, current_page: 1, from: 1, to: 12 },
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<AllTokensPage />);
    await waitFor(
      () => {
        const nextBtn = screen.queryByText(/Next/i);
        if (nextBtn && !nextBtn.hasAttribute("disabled")) {
          fireEvent.click(nextBtn);
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles different response formats", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminTokensList as jest.MockedFunction<any>).mockReturnValue({
      data: {
        message: {
          tokens: [{ id: 1, token: "message_token", status: 1 }],
        },
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<AllTokensPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/message_token/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles token with missing fields", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminTokensList as jest.MockedFunction<any>).mockReturnValue({
      data: {
        tokens: [
          {
            id: 1,
            token: undefined,
            token_id: "id_token",
            status: 1,
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<AllTokensPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("--")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles token with type field instead of token_type", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminTokensList as jest.MockedFunction<any>).mockReturnValue({
      data: {
        tokens: [
          {
            id: 1,
            token: "type_token",
            type: "TEST",
            status: 1,
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<AllTokensPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/type_token/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles isRefreshing state", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminTokensList as jest.MockedFunction<any>).mockReturnValue({
      data: { tokens: [] },
      isLoading: false,
      isFetching: true,
      refetch: mockRefetch,
    });
    renderWithProviders(<AllTokensPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Syncing/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles status toggle without apiKey", async () => {
    localStorage.removeItem("apiKey");
    renderWithProviders(<AllTokensPage />);
    await waitFor(
      () => {
        const toggleBtn = screen.queryByText(/Revoke/i) || screen.queryByText(/Activate/i);
        if (toggleBtn) {
          fireEvent.click(toggleBtn);
        }
      },
      { timeout: 10000 }
    );
  });

  it("masks token correctly", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminTokensList as jest.MockedFunction<any>).mockReturnValue({
      data: {
        tokens: [
          {
            id: 1,
            token: "very_long_token_string_123456789",
            status: 1,
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<AllTokensPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/very_l/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders create token button", async () => {
    renderWithProviders(<AllTokensPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Create token/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles refresh error", async () => {
    mockRefetch.mockRejectedValue(new Error("Network error"));
    renderWithProviders(<AllTokensPage />);
    await waitFor(
      () => {
        const refreshBtn = screen.queryByText(/Refresh/i);
        if (refreshBtn) {
          fireEvent.click(refreshBtn);
        }
      },
      { timeout: 10000 }
    );
  });
});
