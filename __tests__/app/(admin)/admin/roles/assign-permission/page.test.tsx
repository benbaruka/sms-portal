import AssignPermissionPage from "../../../../../../src/app/(admin)/admin/roles/assign-permission/page";

import { renderWithProviders, waitFor } from "../../../../../test-utils";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams("id=test-id"),
  usePathname: () => "/admin/roles/assign-permission",
}));

describe("app/(admin)/admin/roles/assign-permission/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
  });

  it("module loads", () => {
    expect(AssignPermissionPage).toBeDefined();
  });

  it("renders assign permission page", async () => {
    renderWithProviders(<AssignPermissionPage />);
    await waitFor(
      () => {
        const { container } = renderWithProviders(<AssignPermissionPage />);
        expect(container.firstChild).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });
});
