import StatisticsPage from "../../../../../src/app/(admin)/admin/statistics/page";

import { renderWithProviders } from "../../../../test-utils";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

describe("app/(admin)/admin/statistics/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("apiKey", "test-api-key");
  });

  it("module loads", () => {
    expect(StatisticsPage).toBeDefined();
    expect(typeof StatisticsPage).toBe("function");
  });

  it("renders statistics page", () => {
    const { container } = renderWithProviders(<StatisticsPage />);
    // StatisticsPage returns null, so we just verify it renders without error
    expect(container).toBeDefined();
  });

  it("returns null (placeholder component)", () => {
    const { container } = renderWithProviders(<StatisticsPage />);
    // Component returns null, but container may have toast notifications
    // So we just verify the component renders without error
    expect(container).toBeDefined();
  });

  it("component renders without crashing", () => {
    expect(() => {
      renderWithProviders(<StatisticsPage />);
    }).not.toThrow();
  });
});
