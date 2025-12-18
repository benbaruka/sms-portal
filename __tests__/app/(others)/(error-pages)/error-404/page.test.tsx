import { renderWithProviders, screen } from "../../../../test-utils";

import Error404Page from "../../../../../src/app/(others)/(error-pages)/error-404/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

describe("app/(others)/(error-pages)/error-404/page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(Error404Page).toBeDefined();
    expect(typeof Error404Page).toBe("function");
  });

  it("renders 404 page successfully", () => {
    const { container } = renderWithProviders(<Error404Page />);
    // Should render 404 error message or heading
    expect(container).toBeDefined();
  });
});
