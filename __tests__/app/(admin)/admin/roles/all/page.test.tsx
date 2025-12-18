import AllRolesPage from "../../../../../../src/app/(admin)/admin/roles/all/page";

import { renderWithProviders, waitFor } from "../../../../../test-utils";

const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: jest.fn(),
  }),
}));

describe("app/(admin)/admin/roles/all/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
    mockReplace.mockReturnValue(undefined);
  });

  it("module loads", () => {
    expect(AllRolesPage).toBeDefined();
  });

  it("calls router.replace on mount with correct URL", async () => {
    renderWithProviders(<AllRolesPage />);
    await waitFor(
      () => {
        expect(mockReplace).toHaveBeenCalledWith("/admin/roles?tab=roles");
      },
      { timeout: 10000 }
    );
  });

  it("renders null (redirect component)", () => {
    const { container } = renderWithProviders(<AllRolesPage />);
    // Component returns null, so we just verify it renders without error
    expect(container).toBeDefined();
  });
});
