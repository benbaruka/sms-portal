import { renderWithProviders, waitFor } from "../../../test-utils";

import ProfilePage from "../../../../src/app/(admin)/profile/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

describe("app/(admin)/profile/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
  });

  it("module loads", () => {
    expect(ProfilePage).toBeDefined();
  });

  it("renders profile page", async () => {
    renderWithProviders(<ProfilePage />);
    await waitFor(
      () => {
        const { container } = renderWithProviders(<ProfilePage />);
        expect(container.firstChild).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });
});
