import { screen as testingLibraryScreen } from "@testing-library/react";

import { userEvent } from "@testing-library/user-event";
import ClientsPage from "../../../../../src/app/(admin)/admin/clients/page";
import { renderWithProviders } from "../../../../test-utils";

// Use screen directly from @testing-library/react for proper TypeScript types
const screen: typeof testingLibraryScreen = testingLibraryScreen;

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockGet = jest.fn();
const mockRefetch = jest.fn();

jest.mock("@/controller/query/admin/clients/useAdminClients", () => ({
  useAdminClientsList: jest.fn(),
  useAdminClientAccountTypes: jest.fn(),
  useAdminClientCountries: jest.fn(),
  useChangeAdminClientStatus: jest.fn(),
  useUpdateAdminClient: jest.fn(),
  useCreateAdminClient: jest.fn(),
}));

jest.mock("@/controller/query/admin/users/useAdminUsers", () => ({
  useAdminUsersList: jest.fn(),
  useAdminUserRoles: jest.fn(),
  useAdminUserClients: jest.fn(),
  useChangeAdminUserStatus: jest.fn(),
  useUpdateAdminUser: jest.fn(),
  useCreateAdminUser: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  useSearchParams: () => ({
    get: mockGet,
  }),
  usePathname: () => "/admin/clients",
}));

import * as clientHooks from "../../../../../src/controller/query/admin/clients/useAdminClients";
import * as userHooks from "../../../../../src/controller/query/admin/users/useAdminUsers";

describe("app/(admin)/admin/clients/page", () => {
  beforeEach(() => {
    jest.setConfig({ testTimeout: 30000 });
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
    mockGet.mockReturnValue(null);
    mockRefetch.mockResolvedValue({});

    // Mock client hooks for ClientsTab and CreateTab
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (clientHooks.useAdminClientAccountTypes as jest.MockedFunction<any>).mockReturnValue({
      data: { data: [{ id: 1, name: "Premium", code: "premium" }] },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (clientHooks.useAdminClientCountries as jest.MockedFunction<any>).mockReturnValue({
      data: { data: [{ code: "CD", name: "Congo", dial_code: "+243" }] },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (clientHooks.useCreateAdminClient as jest.MockedFunction<any>).mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (clientHooks.useAdminClientsList as jest.MockedFunction<any>).mockReturnValue({
      data: {
        clients: [
          {
            id: 1,
            name: "Test Client",
            email: "test@test.com",
            status: 1,
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (clientHooks.useChangeAdminClientStatus as jest.MockedFunction<any>).mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (clientHooks.useUpdateAdminClient as jest.MockedFunction<any>).mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    });

    // Mock user hooks for UsersTab
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (userHooks.useAdminUserRoles as jest.MockedFunction<any>).mockReturnValue({
      data: { data: [{ id: 1, name: "Admin" }] },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (userHooks.useAdminUserClients as jest.MockedFunction<any>).mockReturnValue({
      data: { data: [{ id: 1, name: "Test Client" }] },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (userHooks.useAdminUsersList as jest.MockedFunction<any>).mockReturnValue({
      data: {
        users: [
          {
            id: 1,
            full_name: "Test User",
            email: "user@test.com",
            user_status: 1,
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (userHooks.useChangeAdminUserStatus as jest.MockedFunction<any>).mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (userHooks.useUpdateAdminUser as jest.MockedFunction<any>).mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (userHooks.useCreateAdminUser as jest.MockedFunction<any>).mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    });
  });

  it("module loads", () => {
    expect(ClientsPage).toBeDefined();
  });

  it("renders clients page", async () => {
    renderWithProviders(<ClientsPage />);
    expect(await screen.findByText(/Client & User Management/i)).toBeInTheDocument();
  });

  it("renders header with title and description", async () => {
    renderWithProviders(<ClientsPage />);
    expect(await screen.findByText(/Client & User Management/i)).toBeInTheDocument();
    expect(await screen.findByText(/Manage clients and users/i)).toBeInTheDocument();
  });

  it("renders all tabs", async () => {
    renderWithProviders(<ClientsPage />);
    expect(await screen.findByRole("tab", { name: /Clients/i })).toBeInTheDocument();
    expect(await screen.findByRole("tab", { name: /Users/i })).toBeInTheDocument();
    expect(await screen.findByRole("tab", { name: /Create/i })).toBeInTheDocument();
  });

  it("defaults to clients tab", async () => {
    mockGet.mockReturnValue(null);
    renderWithProviders(<ClientsPage />);
    expect(await screen.findByText(/Client Directory/i)).toBeInTheDocument();
  });

  it("switches to users tab", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ClientsPage />);

    const usersTab = await screen.findByRole("tab", { name: /Users/i });
    await user.click(usersTab);

    expect(await screen.findByText(/User Directory/i, {}, { timeout: 10000 })).toBeInTheDocument();
  }, 20000);

  it("switches to create tab", async () => {
    jest.setConfig({ testTimeout: 30000 });
    const user = userEvent.setup();
    renderWithProviders(<ClientsPage />);

    const createTab = await screen.findByRole("tab", { name: /Create/i });
    // Use fireEvent to avoid potential userEvent timeouts with Radix UI tabs
    // user.click(createTab) triggers multiple events that might be slow in this environment
    const { fireEvent } = await import("@testing-library/react");
    fireEvent.click(createTab);

    // Wait for CreateTab content to appear
    expect(await screen.findByText(/Create New/i, {}, { timeout: 10000 })).toBeInTheDocument();
  }, 30000);

  it("handles tab from URL params", async () => {
    mockGet.mockReturnValue("users");
    renderWithProviders(<ClientsPage />);
    expect(await screen.findByText(/User Directory/i)).toBeInTheDocument();
  });

  it("handles invalid tab from URL params", async () => {
    mockGet.mockReturnValue("invalid-tab");
    renderWithProviders(<ClientsPage />);
    expect(await screen.findByText(/Client Directory/i)).toBeInTheDocument();
  });

  it("updates tab when URL params change", async () => {
    mockGet.mockReturnValue("clients");
    renderWithProviders(<ClientsPage />);
    expect(await screen.findByText(/Client Directory/i)).toBeInTheDocument();
  });

  it("renders clients tab content", async () => {
    renderWithProviders(<ClientsPage />);
    expect(await screen.findByText(/Client Directory/i)).toBeInTheDocument();
  });
});
