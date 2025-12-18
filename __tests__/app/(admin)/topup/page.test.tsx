import { renderWithProviders } from "../../../test-utils";

import TopupPage from "../../../../src/app/(admin)/topup/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: replace: jest.fn() }),
}));

describe("app/(admin)/topup/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
  });

  it("module loads", () => {
    expect(TopupPage).toBeDefined();
    expect(typeof TopupPage).toBe("function");
  });

  it("renders topup page successfully", () => {
    const { container } = renderWithProviders(<TopupPage />);
    expect(container).toBeDefined();
  });
});
