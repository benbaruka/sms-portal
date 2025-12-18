import { renderWithProviders } from "../../../test-utils";

import ForgotPasswordPage from "../../../../src/app/(auth)/forgot-password/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: replace: jest.fn() }),
}));

describe("app/(auth)/forgot-password/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(ForgotPasswordPage).toBeDefined();
    expect(typeof ForgotPasswordPage).toBe("function");
  });

  it("renders forgot-password page successfully", () => {
    const { container } = renderWithProviders(<ForgotPasswordPage />);
    expect(container).toBeDefined();
  });
});
