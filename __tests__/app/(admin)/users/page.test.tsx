import { renderWithProviders } from "../../../test-utils";

import UsersPage from "../../../../src/app/(admin)/users/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: replace: jest.fn() }),
}));

describe("app/(admin)/users/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
  });

  it("module loads", () => {
    expect(UsersPage).toBeDefined();
    expect(typeof UsersPage).toBe("function");
  });

  it("renders users page successfully", () => {
    const { container } = renderWithProviders(<UsersPage />);
    expect(container).toBeDefined();
  });
});
