import { renderWithProviders } from "../../../../test-utils";

import PrivacyPage from "../../../../../src/app/(others)/(auth)/privacy/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: replace: jest.fn() }),
}));

describe("app/(others)/(auth)/privacy/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(PrivacyPage).toBeDefined();
    expect(typeof PrivacyPage).toBe("function");
  });

  it("renders privacy page successfully", () => {
    const { container } = renderWithProviders(<PrivacyPage />);
    expect(container).toBeDefined();
  });
});
