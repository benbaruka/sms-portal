
import {
  fireEvent as testingLibraryFireEvent,
  screen as testingLibraryScreen,
} from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import DocumentTypesPage from "../../../../../../src/app/(admin)/admin/documents/types/page";
import { renderWithProviders, waitFor } from "../../../../../test-utils";

// Use screen and fireEvent directly from @testing-library/react for proper TypeScript types
const screen: typeof testingLibraryScreen = testingLibraryScreen;
const fireEvent: typeof testingLibraryFireEvent = testingLibraryFireEvent;

const mockRefetch = jest.fn();
const mockCreateType = jest.fn();
const mockUpdateType = jest.fn();
const mockDeleteType = jest.fn();
const mockChangeStatus = jest.fn();

jest.mock("@/controller/query/admin/documents/useAdminDocuments", () => ({
  useAdminDocumentTypes: jest.fn(),
  useCreateAdminDocumentType: jest.fn(),
  useUpdateAdminDocumentType: jest.fn(),
  useDeleteAdminDocumentType: jest.fn(),
  useChangeAdminDocumentTypeStatus: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

import * as hooks from "../../../../../../src/controller/query/admin/documents/useAdminDocuments";

describe("app/(admin)/admin/documents/types/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
    mockRefetch.mockResolvedValue({});
    mockCreateType.mockResolvedValue({});
    mockUpdateType.mockResolvedValue({});
    mockDeleteType.mockResolvedValue({});
    mockChangeStatus.mockResolvedValue({});

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminDocumentTypes as jest.MockedFunction<any>).mockReturnValue({
      data: {
        data: [
          {
            id: 1,
            type_id: 1,
            name: "Passport",
            description: "Valid passport document",
            status: 1,
            is_required: true,
            required: true,
            created: "2024-01-15T10:00:00Z",
            updated: "2024-01-15T10:00:00Z",
          },
          {
            id: 2,
            type_id: 2,
            name: "ID Card",
            description: "National ID card",
            status: 0,
            is_required: false,
            required: false,
            created: "2024-01-16T10:00:00Z",
            updated: "2024-01-16T10:00:00Z",
          },
        ],
      },
      isLoading: false,
      refetch: mockRefetch,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useCreateAdminDocumentType as jest.MockedFunction<any>).mockReturnValue({
      mutateAsync: mockCreateType,
      isPending: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useUpdateAdminDocumentType as jest.MockedFunction<any>).mockReturnValue({
      mutateAsync: mockUpdateType,
      isPending: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useDeleteAdminDocumentType as jest.MockedFunction<any>).mockReturnValue({
      mutateAsync: mockDeleteType,
      isPending: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useChangeAdminDocumentTypeStatus as jest.MockedFunction<any>).mockReturnValue({
      mutateAsync: mockChangeStatus,
      isPending: false,
    });
  });

  it("module loads", () => {
    expect(DocumentTypesPage).toBeDefined();
  });

  it("renders document types page", async () => {
    renderWithProviders(<DocumentTypesPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Document Types Management/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("displays stats cards", async () => {
    renderWithProviders(<DocumentTypesPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("Total Types")).toBeInTheDocument();
        expect(screen.queryByText("Active Types")).toBeInTheDocument();
        expect(screen.queryByText("Required Types")).toBeInTheDocument();
        expect(screen.queryByText("Inactive Types")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders search input", async () => {
    renderWithProviders(<DocumentTypesPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const searchInput = screen.queryByPlaceholderText(/Search by name/i);
        expect(searchInput).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles search input change", async () => {
    renderWithProviders(<DocumentTypesPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const searchInput = screen.queryByPlaceholderText(/Search by name/i);
        if (searchInput) {
          fireEvent.change(searchInput, { target: { value: "Passport" } });
          expect(searchInput).toHaveValue("Passport");
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles refresh button", async () => {
    renderWithProviders(<DocumentTypesPage />);
    await waitFor(
      () => {
        const refreshBtn = screen.queryByText(/Refresh/i);
        expect(refreshBtn).toBeInTheDocument();
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

  it("opens create dialog", async () => {
    renderWithProviders(<DocumentTypesPage />);
    await waitFor(
      () => {
        const createBtn = screen.queryByText(/Create Type/i);
        if (createBtn) {
          fireEvent.click(createBtn);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        expect(screen.queryByText(/Create Document Type/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("closes create dialog", async () => {
    renderWithProviders(<DocumentTypesPage />);
    await waitFor(
      () => {
        const createBtn = screen.queryByText(/Create Type/i);
        if (createBtn) {
          fireEvent.click(createBtn);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        const cancelBtn = screen.queryByText(/Cancel/i);
        if (cancelBtn) {
          fireEvent.click(cancelBtn);
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles create form submission", async () => {
    renderWithProviders(<DocumentTypesPage />);
    await waitFor(
      () => {
        const createBtn = screen.queryByText(/Create Type/i);
        if (createBtn) {
          fireEvent.click(createBtn);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const nameInput = screen.queryByLabelText(/Document Name/i);
        // @ts-expect-error - TypeScript inference issue with screen types
        const descInput = screen.queryByLabelText(/Description/i);
        if (nameInput) fireEvent.change(nameInput, { target: { value: "New Document" } });
        if (descInput) fireEvent.change(descInput, { target: { value: "New description" } });
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        const submitBtn = screen.queryByRole("button", { name: /Create Document Type/i });
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
        expect(mockCreateType).toHaveBeenCalled();
      },
      { timeout: 10000 }
    );
  });

  it("handles create form with required switch", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DocumentTypesPage />);
    await waitFor(
      () => {
        const createBtn = screen.queryByText(/Create Type/i);
        if (createBtn) {
          fireEvent.click(createBtn);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const requiredSwitch = screen.queryByLabelText(/Required Document/i);
        if (requiredSwitch) {
          user.click(requiredSwitch);
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles create form with active switch", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DocumentTypesPage />);
    await waitFor(
      () => {
        const createBtn = screen.queryByText(/Create Type/i);
        if (createBtn) {
          fireEvent.click(createBtn);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const activeSwitch = screen.queryByLabelText(/Active Status/i);
        if (activeSwitch) {
          user.click(activeSwitch);
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles create without apiKey", async () => {
    localStorage.removeItem("apiKey");
    renderWithProviders(<DocumentTypesPage />);
    await waitFor(
      () => {
        const createBtn = screen.queryByText(/Create Type/i);
        if (createBtn) {
          fireEvent.click(createBtn);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        const submitBtn = screen.queryByRole("button", { name: /Create Document Type/i });
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

  it("renders document types table", async () => {
    renderWithProviders(<DocumentTypesPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("Passport")).toBeInTheDocument();
        expect(screen.queryByText("ID Card")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("opens edit dialog", async () => {
    renderWithProviders(<DocumentTypesPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const editBtns = screen.queryAllByRole("button", { name: "" });
        const editBtn = editBtns.find((btn: HTMLElement) => btn.querySelector("svg"));
        if (editBtn) {
          fireEvent.click(editBtn);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        expect(screen.queryByText(/Edit Document Type/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles edit form submission", async () => {
    renderWithProviders(<DocumentTypesPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const editBtns = screen.queryAllByRole("button", { name: "" });
        const editBtn = editBtns.find((btn: HTMLElement) => btn.querySelector("svg"));
        if (editBtn) {
          fireEvent.click(editBtn);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        const saveBtn = screen.queryByText(/Save Changes/i);
        if (saveBtn && !saveBtn.hasAttribute("disabled")) {
          fireEvent.click(saveBtn);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        expect(mockUpdateType).toHaveBeenCalled();
      },
      { timeout: 10000 }
    );
  });

  it("opens delete dialog", async () => {
    renderWithProviders(<DocumentTypesPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const deleteBtns = screen.queryAllByRole("button");
        const deleteBtn = deleteBtns.find(
          (btn: HTMLElement) => btn.textContent?.includes("Delete") || btn.querySelector("svg")
        );
        if (deleteBtn) {
          fireEvent.click(deleteBtn);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        expect(screen.queryByText(/Delete Document Type/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles delete confirmation", async () => {
    renderWithProviders(<DocumentTypesPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const deleteBtns = screen.queryAllByRole("button");
        const deleteBtn = deleteBtns.find(
          (btn: HTMLElement) => btn.textContent?.includes("Delete") || btn.querySelector("svg")
        );
        if (deleteBtn) {
          fireEvent.click(deleteBtn);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        const confirmBtn = screen.queryByRole("button", { name: /Delete$/i });
        if (confirmBtn) {
          fireEvent.click(confirmBtn);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        expect(mockDeleteType).toHaveBeenCalled();
      },
      { timeout: 10000 }
    );
  });

  it("handles status toggle - activate", async () => {
    renderWithProviders(<DocumentTypesPage />);
    await waitFor(
      () => {
        const activateBtn = screen.queryByText(/Activate/i);
        if (activateBtn) {
          fireEvent.click(activateBtn);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        expect(mockChangeStatus).toHaveBeenCalled();
      },
      { timeout: 10000 }
    );
  });

  it("handles status toggle - deactivate", async () => {
    renderWithProviders(<DocumentTypesPage />);
    await waitFor(
      () => {
        const deactivateBtn = screen.queryByText(/Deactivate/i);
        if (deactivateBtn) {
          fireEvent.click(deactivateBtn);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        expect(mockChangeStatus).toHaveBeenCalled();
      },
      { timeout: 10000 }
    );
  });

  it("handles status toggle without apiKey", async () => {
    localStorage.removeItem("apiKey");
    renderWithProviders(<DocumentTypesPage />);
    await waitFor(
      () => {
        const deactivateBtn = screen.queryByText(/Deactivate/i);
        if (deactivateBtn) {
          fireEvent.click(deactivateBtn);
        }
      },
      { timeout: 10000 }
    );
  });

  it("shows loading state", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminDocumentTypes as jest.MockedFunction<any>).mockReturnValue({
      data: null,
      isLoading: true,
      refetch: mockRefetch,
    });
    renderWithProviders(<DocumentTypesPage />);
    expect(screen.queryByText("Loading document types...")).toBeInTheDocument();
  });

  it("shows empty state", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminDocumentTypes as jest.MockedFunction<any>).mockReturnValue({
      data: { data: [] },
      isLoading: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<DocumentTypesPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/No document types found/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles different response formats - types array", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminDocumentTypes as jest.MockedFunction<any>).mockReturnValue({
      data: {
        types: [
          {
            id: 3,
            name: "License",
            status: 1,
            is_required: false,
          },
        ],
      },
      isLoading: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<DocumentTypesPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("License")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles different response formats - message.data", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminDocumentTypes as jest.MockedFunction<any>).mockReturnValue({
      data: {
        message: {
          data: [
            {
              id: 4,
              name: "Certificate",
              status: 1,
            },
          ],
        },
      },
      isLoading: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<DocumentTypesPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("Certificate")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles different response formats - message array", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminDocumentTypes as jest.MockedFunction<any>).mockReturnValue({
      data: {
        message: [
          {
            id: 5,
            name: "Permit",
            status: 0,
          },
        ],
      },
      isLoading: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<DocumentTypesPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("Permit")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles document type with status as string", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminDocumentTypes as jest.MockedFunction<any>).mockReturnValue({
      data: {
        data: [
          {
            id: 6,
            name: "String Status",
            status: "1",
            is_required: true,
          },
        ],
      },
      isLoading: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<DocumentTypesPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("String Status")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles document type with status as ACTIVE", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminDocumentTypes as jest.MockedFunction<any>).mockReturnValue({
      data: {
        data: [
          {
            id: 7,
            name: "Active Status",
            status: "ACTIVE",
            is_required: false,
          },
        ],
      },
      isLoading: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<DocumentTypesPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("Active Status")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles document type with type_id instead of id", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hooks.useAdminDocumentTypes as jest.MockedFunction<any>).mockReturnValue({
      data: {
        data: [
          {
            type_id: 8,
            name: "Type ID Doc",
            status: 1,
          },
        ],
      },
      isLoading: false,
      refetch: mockRefetch,
    });
    renderWithProviders(<DocumentTypesPage />);
    await waitFor(
      () => {
        expect(screen.queryByText("Type ID Doc")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles filtered search results", async () => {
    renderWithProviders(<DocumentTypesPage />);
    await waitFor(
      () => {
        // @ts-expect-error - TypeScript inference issue with screen types
        const searchInput = screen.queryByPlaceholderText(/Search by name/i);
        if (searchInput) {
          fireEvent.change(searchInput, { target: { value: "NonExistent" } });
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        expect(screen.queryByText(/No matching document types/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("handles create form validation", async () => {
    renderWithProviders(<DocumentTypesPage />);
    await waitFor(
      () => {
        const createBtn = screen.queryByText(/Create Type/i);
        if (createBtn) {
          fireEvent.click(createBtn);
        }
      },
      { timeout: 10000 }
    );
    await waitFor(
      () => {
        const submitBtn = screen.queryByRole("button", { name: /Create Document Type/i });
        if (submitBtn) {
          expect(submitBtn).toBeDisabled();
        }
      },
      { timeout: 10000 }
    );
  });

  it("handles refresh error", async () => {
    mockRefetch.mockRejectedValue(new Error("Network error"));
    renderWithProviders(<DocumentTypesPage />);
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
