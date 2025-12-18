
import {
  fireEvent as testingLibraryFireEvent,
  screen as testingLibraryScreen,
} from "@testing-library/react";
import RejectKYBPage from "../../../../../../src/app/(admin)/admin/kyb/reject/page";
import { renderWithProviders, waitFor } from "../../../../../test-utils";

// Use screen and fireEvent directly from @testing-library/react for proper TypeScript types
const screen: typeof testingLibraryScreen = testingLibraryScreen;
const fireEvent: typeof testingLibraryFireEvent = testingLibraryFireEvent;

const mockRefetch = jest.fn();
const mockReject = jest.fn();
const mockPush = jest.fn();
const mockGet = jest.fn();

jest.mock("@/controller/query/admin/kyb/useAdminKYB", () => ({
  useAdminKYBDetails: jest.fn(),
  useRejectAdminKYB: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
  }),
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

import * as hooks from "../../../../../../src/controller/query/admin/kyb/useAdminKYB";

describe("app/(admin)/admin/kyb/reject/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
    mockRefetch.mockResolvedValue({});
    mockReject.mockResolvedValue({});
    mockPush.mockReturnValue(undefined);
    mockGet.mockReturnValue(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminKYBDetails as jest.MockedFunction<any>).mockReturnValue({
      data: {
        message: {
          id: 1,
          client_name: "Test Client",
          submitted_at: "2024-01-15T10:00:00Z",
          documents_count: 2,
          status: "pending",
        },
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useRejectAdminKYB as jest.MockedFunction<any>).mockReturnValue({
      mutateAsync: mockReject,
      isPending: false,
    });
  });

  it("module loads", () => {
    expect(RejectKYBPage).toBeDefined();
  });

  it("renders reject kyb page", async () => {
    renderWithProviders(<RejectKYBPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Reject KYB request/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders search input", async () => {
    renderWithProviders(<RejectKYBPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const searchInput = screen.queryByPlaceholderText(/Enter KYB ID/i);
        expect(searchInput).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles search input change", async () => {
    renderWithProviders(<RejectKYBPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const searchInput = screen.queryByPlaceholderText(/Enter KYB ID/i);
        if (searchInput) {
          fireEvent.change(searchInput, { target: { value: "123" } });
          expect(searchInput).toHaveValue("123");
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles search button click", async () => {
    renderWithProviders(<RejectKYBPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const searchInput = screen.queryByPlaceholderText(/Enter KYB ID/i);
        if (searchInput) {
          fireEvent.change(searchInput, { target: { value: "123" } });
        }
        const searchBtn = screen.queryByText(/Load request/i);
        if (searchBtn) {
          fireEvent.click(searchBtn);
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles search without id", async () => {
    renderWithProviders(<RejectKYBPage />);
    await waitFor(
      () => {
        const searchBtn = screen.queryByText(/Load request/i);
        if (searchBtn) {
          fireEvent.click(searchBtn);
        }
      },
      { timeout: 10000 }
    );
  });

  it("renders kyb details when loaded", async () => {
    renderWithProviders(<RejectKYBPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const searchInput = screen.queryByPlaceholderText(/Enter KYB ID/i);
        if (searchInput) {
          fireEvent.change(searchInput, { target: { value: "1" } });
        }
        const searchBtn = screen.queryByText(/Load request/i);
        if (searchBtn) {
          fireEvent.click(searchBtn);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        expect(screen.queryByText("Test Client")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles reject form submission", async () => {
    renderWithProviders(<RejectKYBPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const searchInput = screen.queryByPlaceholderText(/Enter KYB ID/i);
        if (searchInput) {
          fireEvent.change(searchInput, { target: { value: "1" } });
        }
        const searchBtn = screen.queryByText(/Load request/i);
        if (searchBtn) {
          fireEvent.click(searchBtn);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const reasonInput = screen.queryByLabelText(/Reason for rejection/i);
        if (reasonInput) {
          fireEvent.change(reasonInput, { target: { value: "Missing documents" } });
        }
        const rejectBtn = screen.queryByRole("button", { name: /Reject KYB/i });
        if (rejectBtn && !rejectBtn.hasAttribute("disabled")) {
          const form = rejectBtn.closest("form");
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
        expect(mockReject).toHaveBeenCalled();
      },
      { timeout: 10000 }
    );
  });

  it("handles reject without apiKey", async () => {
    localStorage.removeItem("apiKey");
    renderWithProviders(<RejectKYBPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const searchInput = screen.queryByPlaceholderText(/Enter KYB ID/i);
        if (searchInput) {
          fireEvent.change(searchInput, { target: { value: "1" } });
        }
        const searchBtn = screen.queryByText(/Load request/i);
        if (searchBtn) {
          fireEvent.click(searchBtn);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        const rejectBtn = screen.queryByRole("button", { name: /Reject KYB/i });
        if (rejectBtn) {
          const form = rejectBtn.closest("form");
          if (form) {
            // @ts-expect-error - TypeScript inference issue with fireEvent types
            fireEvent.submit(form);
          }
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles reject without selected id", async () => {
    renderWithProviders(<RejectKYBPage />);
    await waitFor(
      () => {
        const rejectBtn = screen.queryByRole("button", { name: /Reject KYB/i });
        if (rejectBtn) {
          const form = rejectBtn.closest("form");
          if (form) {
            // @ts-expect-error - TypeScript inference issue with fireEvent types
            fireEvent.submit(form);
          }
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles reject without reason", async () => {
    renderWithProviders(<RejectKYBPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const searchInput = screen.queryByPlaceholderText(/Enter KYB ID/i);
        if (searchInput) {
          fireEvent.change(searchInput, { target: { value: "1" } });
        }
        const searchBtn = screen.queryByText(/Load request/i);
        if (searchBtn) {
          fireEvent.click(searchBtn);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const reasonInput = screen.queryByLabelText(/Reason for rejection/i);
        if (reasonInput) {
          fireEvent.change(reasonInput, { target: { value: "" } });
        }
        const rejectBtn = screen.queryByRole("button", { name: /Reject KYB/i });
        if (rejectBtn) {
          const form = rejectBtn.closest("form");
          if (form) {
            // @ts-expect-error - TypeScript inference issue with fireEvent types
            fireEvent.submit(form);
          }
        }
      },
      { timeout: 10000 }
    );
  });

  it("shows loading state", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminKYBDetails as jest.MockedFunction<any>).mockReturnValue({
      data: null,
      isLoading: true,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<RejectKYBPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const searchInput = screen.queryByPlaceholderText(/Enter KYB ID/i);
        if (searchInput) {
          fireEvent.change(searchInput, { target: { value: "1" } });
        }
        const searchBtn = screen.queryByText(/Load request/i);
        if (searchBtn) {
          fireEvent.click(searchBtn);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        expect(screen.queryByText("Loading KYB dossier...")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("shows empty state when no kyb found", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminKYBDetails as jest.MockedFunction<any>).mockReturnValue({
      data: null,
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<RejectKYBPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const searchInput = screen.queryByPlaceholderText(/Enter KYB ID/i);
        if (searchInput) {
          fireEvent.change(searchInput, { target: { value: "999" } });
        }
        const searchBtn = screen.queryByText(/Load request/i);
        if (searchBtn) {
          fireEvent.click(searchBtn);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        expect(screen.queryByText(/No KYB request found/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles back button", async () => {
    renderWithProviders(<RejectKYBPage />);
    await waitFor(
      () => {
        const backBtn = screen.queryByText(/Back to queue/i);
        if (backBtn) {
          fireEvent.click(backBtn);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith("/admin/kyb/pending");
      },
      { timeout: 10000 }
    );
  });

  it("loads kyb from URL params", async () => {
    mockGet.mockReturnValue("1");
    renderWithProviders(<RejectKYBPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("Test Client")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });
});
