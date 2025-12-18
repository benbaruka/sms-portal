import { renderWithProviders } from "../../../../test-utils";

import SigninPage from "../../../../../src/app/(others)/(auth)/signin/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: replace: jest.fn() }),
}));

describe("app/(others)/(auth)/signin/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(SigninPage).toBeDefined();
    expect(typeof SigninPage).toBe("function");
  });

  it("renders signin page successfully", () => {
    const { container } = renderWithProviders(<SigninPage />);
    expect(container).toBeDefined();
  });
});
