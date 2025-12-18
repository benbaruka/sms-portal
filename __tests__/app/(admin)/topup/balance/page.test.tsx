import { renderWithProviders } from "../../../../test-utils";

import BalancePage from "../../../../../src/app/(admin)/topup/balance/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: replace: jest.fn() }),
}));

describe("app/(admin)/topup/balance/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
  });

  it("module loads", () => {
    expect(BalancePage).toBeDefined();
    expect(typeof BalancePage).toBe("function");
  });

  it("renders balance page successfully", () => {
    const { container } = renderWithProviders(<BalancePage />);
    expect(container).toBeDefined();
  });
});
