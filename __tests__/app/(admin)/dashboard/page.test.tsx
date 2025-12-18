import { renderWithProviders, screen, waitFor } from "../../../test-utils";

import DashboardPage from "../../../../src/app/(admin)/dashboard/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

describe("app/(admin)/dashboard/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
  });

  it("module loads", () => {
    expect(DashboardPage).toBeDefined();
  });

  it("renders dashboard page", async () => {
    renderWithProviders(<DashboardPage />);
    await waitFor(
      () => {
        const { container } = renderWithProviders(<DashboardPage />);
        expect(container.firstChild).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });
});
