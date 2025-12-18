import CreateRolePage from "../../../../../../src/app/(admin)/admin/roles/create/page";

import { renderWithProviders, waitFor } from "../../../../../test-utils";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

describe("app/(admin)/admin/roles/create/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
  });

  it("module loads", () => {
    expect(CreateRolePage).toBeDefined();
  });

  it("renders create role page", async () => {
    renderWithProviders(<CreateRolePage />);
    await waitFor(
      () => {
        const { container } = renderWithProviders(<CreateRolePage />);
        expect(container.firstChild).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });
});
