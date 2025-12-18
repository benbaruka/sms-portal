import { renderWithProviders } from "../../../../test-utils";

import MnoPage from "../../../../../src/app/(admin)/topup/mno/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: replace: jest.fn() }),
}));

describe("app/(admin)/topup/mno/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
  });

  it("module loads", () => {
    expect(MnoPage).toBeDefined();
    expect(typeof MnoPage).toBe("function");
  });

  it("renders MNO page successfully", () => {
    const { container } = renderWithProviders(<MnoPage />);
    expect(container).toBeDefined();
  });
});
