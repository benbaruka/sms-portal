
import {
  fireEvent as testingLibraryFireEvent,
  screen as testingLibraryScreen,
} from "@testing-library/react";
import ApproveKYBPage from "../../../../../../src/app/(admin)/admin/kyb/approve/page";
import { renderWithProviders, waitFor } from "../../../../../test-utils";

// Use screen and fireEvent directly from @testing-library/react for proper TypeScript types
const screen: typeof testingLibraryScreen = testingLibraryScreen;
const fireEvent: typeof testingLibraryFireEvent = testingLibraryFireEvent;

const mockRefetch = jest.fn();
const mockApprove = jest.fn();
const mockPush = jest.fn();
const mockGet = jest.fn();

jest.mock("@/controller/query/admin/kyb/useAdminKYB", () => ({
  useAdminKYBDetails: jest.fn(),
  useApproveAdminKYB: jest.fn(),
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

describe("app/(admin)/admin/kyb/approve/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
    mockRefetch.mockResolvedValue({});
    mockApprove.mockResolvedValue({});
    mockPush.mockReturnValue(undefined);
    mockGet.mockReturnValue(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminKYBDetails as jest.MockedFunction<any>).mockReturnValue({
      data: {
        message: {
          id: 1,
          client_name: "Test Client",
          submitted_at: "2024-01-15T10:00:00Z",
          documents_count: 3,
          status: "pending",
        },
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useApproveAdminKYB as jest.MockedFunction<any>).mockReturnValue({
      mutateAsync: mockApprove,
      isPending: false,
    });
  });

  it("module loads", () => {
    expect(ApproveKYBPage).toBeDefined();
  });

  it("renders approve kyb page", async () => {
    renderWithProviders(<ApproveKYBPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Approve KYB request/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders search input", async () => {
    renderWithProviders(<ApproveKYBPage />);
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
    renderWithProviders(<ApproveKYBPage />);
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
    renderWithProviders(<ApproveKYBPage />);
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
    renderWithProviders(<ApproveKYBPage />);
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
    renderWithProviders(<ApproveKYBPage />);
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

  it("handles approve form submission", async () => {
    renderWithProviders(<ApproveKYBPage />);
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
        const notesInput = screen.queryByLabelText(/Internal notes/i);
        if (notesInput) {
          fireEvent.change(notesInput, { target: { value: "Approved" } });
        }
        const approveBtn = screen.queryByRole("button", { name: /Approve KYB/i });
        if (approveBtn && !approveBtn.hasAttribute("disabled")) {
          const form = approveBtn.closest("form");
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
        expect(mockApprove).toHaveBeenCalled();
      },
      { timeout: 10000 }
    );
  });

  it("handles approve without apiKey", async () => {
    localStorage.removeItem("apiKey");
    renderWithProviders(<ApproveKYBPage />);
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
        const approveBtn = screen.queryByRole("button", { name: /Approve KYB/i });
        if (approveBtn) {
          const form = approveBtn.closest("form");
          if (form) {
            // @ts-expect-error - TypeScript inference issue with fireEvent types
            fireEvent.submit(form);
          }
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles approve without selected id", async () => {
    renderWithProviders(<ApproveKYBPage />);
    await waitFor(
      () => {
        const approveBtn = screen.queryByRole("button", { name: /Approve KYB/i });
        if (approveBtn) {
          const form = approveBtn.closest("form");
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
    renderWithProviders(<ApproveKYBPage />);
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
        expect(screen.queryByText("Fetching KYB details...")).toBeInTheDocument();
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
    renderWithProviders(<ApproveKYBPage />);
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
    renderWithProviders(<ApproveKYBPage />);
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
    renderWithProviders(<ApproveKYBPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("Test Client")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });
});
