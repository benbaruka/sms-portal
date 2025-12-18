import { screen as testingLibraryScreen } from "@testing-library/react";

import { userEvent } from "@testing-library/user-event";
import RolesPage from "../../../../../src/app/(admin)/admin/roles/page";
import { renderWithProviders, waitFor } from "../../../../test-utils";

// Use screen directly from @testing-library/react for proper TypeScript types
const screen: typeof testingLibraryScreen = testingLibraryScreen;

const mockGet = jest.fn();
const mockPushState = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  useSearchParams: () => ({
    get: mockGet,
  }),
  usePathname: () => "/admin/roles",
}));

// Mock child components to prevent their full rendering logic from interfering
jest.mock("../../../../../src/app/(admin)/admin/roles/components/RolesTab", () => ({
  __esModule: true,
  default: jest.fn(() => <div>Roles Tab Content</div>),
}));

jest.mock("../../../../../src/app/(admin)/admin/roles/components/ModulesTab", () => ({
  __esModule: true,
  default: jest.fn(() => <div>Modules Tab Content</div>),
}));

jest.mock("../../../../../src/app/(admin)/admin/roles/components/ActionsTab", () => ({
  __esModule: true,
  default: jest.fn(() => <div>Actions Tab Content</div>),
}));

describe("app/(admin)/admin/roles/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
    mockGet.mockReturnValue(null);
    // Mock window.history.pushState
    jest.spyOn(window.history, "pushState").mockImplementation(mockPushState);
  });

  it("module loads", () => {
    expect(RolesPage).toBeDefined();
  });

  it("renders roles page", async () => {
    renderWithProviders(<RolesPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Roles & Permissions/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders header with title and description", async () => {
    renderWithProviders(<RolesPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Roles & Permissions/i)).toBeInTheDocument();
        expect(screen.queryByText(/Manage user roles, modules, and actions/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders all tabs", async () => {
    renderWithProviders(<RolesPage />);
    await waitFor(
      () => {
        expect(screen.queryByRole("tab", { name: /Roles/i })).toBeInTheDocument();
        expect(screen.queryByRole("tab", { name: /Modules/i })).toBeInTheDocument();
        expect(screen.queryByRole("tab", { name: /Actions/i })).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("defaults to roles tab", async () => {
    mockGet.mockReturnValue(null);
    renderWithProviders(<RolesPage />);
    await waitFor(
      () => {
        expect(screen.queryByRole("tab", { name: /Roles/i })).toHaveAttribute(
          "data-state",
          "active"
        );
        expect(screen.queryByText(/Roles Tab Content/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("switches to modules tab", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RolesPage />);
    await waitFor(
      () => {
        const modulesTab = screen.queryByRole("tab", { name: /Modules/i });
        if (modulesTab) {
          user.click(modulesTab);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        expect(screen.queryByRole("tab", { name: /Modules/i })).toHaveAttribute(
          "data-state",
          "active"
        );
        expect(screen.queryByText(/Modules Tab Content/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("switches to actions tab", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RolesPage />);
    await waitFor(
      () => {
        const actionsTab = screen.queryByRole("tab", { name: /Actions/i });
        if (actionsTab) {
          user.click(actionsTab);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        expect(screen.queryByRole("tab", { name: /Actions/i })).toHaveAttribute(
          "data-state",
          "active"
        );
        expect(screen.queryByText(/Actions Tab Content/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles tab from URL params", async () => {
    mockGet.mockReturnValue("modules");
    renderWithProviders(<RolesPage />);
    await waitFor(
      () => {
        expect(screen.queryByRole("tab", { name: /Modules/i })).toHaveAttribute(
          "data-state",
          "active"
        );
        expect(screen.queryByText(/Modules Tab Content/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles invalid tab from URL params", async () => {
    mockGet.mockReturnValue("invalid-tab");
    renderWithProviders(<RolesPage />);
    await waitFor(
      () => {
        expect(screen.queryByRole("tab", { name: /Roles/i })).toHaveAttribute(
          "data-state",
          "active"
        );
        expect(screen.queryByText(/Roles Tab Content/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });
});
