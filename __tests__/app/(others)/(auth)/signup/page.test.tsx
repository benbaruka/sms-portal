import { renderWithProviders } from "../../../../test-utils";

import SignupPage from "../../../../../src/app/(others)/(auth)/signup/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: replace: jest.fn() }),
}));

describe("app/(others)/(auth)/signup/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(SignupPage).toBeDefined();
    expect(typeof SignupPage).toBe("function");
  });

  it("renders signup page successfully", () => {
    const { container } = renderWithProviders(<SignupPage />);
    expect(container).toBeDefined();
  });
});
