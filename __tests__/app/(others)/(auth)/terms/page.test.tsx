import { renderWithProviders, screen } from "../../../../test-utils";

import TermsPage from "../../../../../src/app/(others)/(auth)/terms/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

describe("app/(others)/(auth)/terms/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(TermsPage).toBeDefined();
    expect(typeof TermsPage).toBe("function");
  });

  it("renders terms page successfully", () => {
    const { container } = renderWithProviders(<TermsPage />);
    // Should render terms content
    expect(container).toBeDefined();
  });
});
