import { renderWithProviders } from "../../../../test-utils";

import VerifyOtpPage from "../../../../../src/app/(others)/(auth)/verify-otp/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: replace: jest.fn() }),
}));

describe("app/(others)/(auth)/verify-otp/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(VerifyOtpPage).toBeDefined();
    expect(typeof VerifyOtpPage).toBe("function");
  });

  it("renders verify-otp page successfully", () => {
    const { container } = renderWithProviders(<VerifyOtpPage />);
    expect(container).toBeDefined();
  });
});
