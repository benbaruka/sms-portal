import RevokePermissionPage from "../../../../../../src/app/(admin)/admin/roles/revoke-permission/page";

import { renderWithProviders, waitFor } from "../../../../../test-utils";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams("id=test-id"),
  usePathname: () => "/admin/roles/revoke-permission",
}));

describe("app/(admin)/admin/roles/revoke-permission/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
  });

  it("module loads", () => {
    expect(RevokePermissionPage).toBeDefined();
  });

  it("renders revoke permission page", async () => {
    renderWithProviders(<RevokePermissionPage />);
    await waitFor(
      () => {
        const { container } = renderWithProviders(<RevokePermissionPage />);
        expect(container.firstChild).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });
});
