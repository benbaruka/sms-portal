import ClientDocumentsRedirect from "../../../../../../src/app/(admin)/admin/documents/client/page";

import { renderWithProviders, waitFor } from "../../../../../test-utils";

const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: jest.fn(),
  }),
}));

describe("app/(admin)/admin/documents/client/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
    mockReplace.mockReturnValue(undefined);
  });

  it("module loads", () => {
    expect(ClientDocumentsRedirect).toBeDefined();
  });

  it("renders redirect component", async () => {
    renderWithProviders(<ClientDocumentsRedirect />);
    await waitFor(
      () => {
        expect(mockReplace).toHaveBeenCalledWith("/documents?tab=client-documents");
      },
      { timeout: 10000 }
    );
  });

  it("calls router.replace on mount", async () => {
    renderWithProviders(<ClientDocumentsRedirect />);
    await waitFor(
      () => {
        expect(mockReplace).toHaveBeenCalled();
      },
      { timeout: 10000 }
    );
  });

  it("redirects to correct URL", async () => {
    renderWithProviders(<ClientDocumentsRedirect />);
    await waitFor(
      () => {
        expect(mockReplace).toHaveBeenCalledWith("/documents?tab=client-documents");
      },
      { timeout: 10000 }
    );
  });
});
