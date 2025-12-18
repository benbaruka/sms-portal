import { renderWithProviders } from "../../../../test-utils";

import HistoryPage from "../../../../../src/app/(admin)/topup/history/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: replace: jest.fn() }),
}));

describe("app/(admin)/topup/history/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
  });

  it("module loads", () => {
    expect(HistoryPage).toBeDefined();
    expect(typeof HistoryPage).toBe("function");
  });

  it("renders history page successfully", () => {
    const { container } = renderWithProviders(<HistoryPage />);
    expect(container).toBeDefined();
  });
});
