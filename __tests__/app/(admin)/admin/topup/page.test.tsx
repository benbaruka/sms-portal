import { screen as testingLibraryScreen } from "@testing-library/react";

import { userEvent } from "@testing-library/user-event";
import TopupPage from "../../../../../src/app/(admin)/admin/topup/page";
import { renderWithProviders, waitFor } from "../../../../test-utils";

// Use screen directly from @testing-library/react for proper TypeScript types
const screen: typeof testingLibraryScreen = testingLibraryScreen;

const mockGet = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  useSearchParams: () => ({
    get: mockGet,
  }),
  usePathname: () => "/admin/topup",
}));

describe("app/(admin)/admin/topup/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
    mockGet.mockReturnValue(null);
  });

  it("module loads", () => {
    expect(TopupPage).toBeDefined();
  });

  it("renders topup page", async () => {
    renderWithProviders(<TopupPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Manual Top-up/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders header with title and description", async () => {
    renderWithProviders(<TopupPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Manual Top-up/i)).toBeInTheDocument();
        expect(screen.queryByText(/Create and manage manual top-up requests/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders all tabs", async () => {
    renderWithProviders(<TopupPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Create/i)).toBeInTheDocument();
        expect(screen.queryByText(/Requests/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("defaults to create tab", async () => {
    mockGet.mockReturnValue(null);
    renderWithProviders(<TopupPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Create Request/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("switches to requests tab", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TopupPage />);
    await waitFor(
      () => {
        const requestsTab = screen.queryByText(/Requests/i);
        if (requestsTab) {
          user.click(requestsTab);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        expect(screen.queryByText(/All Requests/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles tab from URL params", async () => {
    mockGet.mockReturnValue("requests");
    renderWithProviders(<TopupPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/All Requests/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles invalid tab from URL params", async () => {
    mockGet.mockReturnValue("invalid-tab");
    renderWithProviders(<TopupPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Create Request/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("updates tab when URL params change", async () => {
    mockGet.mockReturnValue("create");
    const { rerender } = renderWithProviders(<TopupPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Create Request/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    mockGet.mockReturnValue("requests");
    rerender(<TopupPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/All Requests/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });
});
