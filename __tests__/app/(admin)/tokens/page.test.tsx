import { renderWithProviders } from "../../../test-utils";

import TokensPage from "../../../../src/app/(admin)/tokens/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: replace: jest.fn() }),
}));

describe("app/(admin)/tokens/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
  });

  it("module loads", () => {
    expect(TokensPage).toBeDefined();
    expect(typeof TokensPage).toBe("function");
  });

  it("renders tokens page successfully", () => {
    const { container } = renderWithProviders(<TokensPage />);
    expect(container).toBeDefined();
  });
});
