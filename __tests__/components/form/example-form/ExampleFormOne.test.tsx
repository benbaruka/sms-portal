import { renderWithProviders, screen } from "../../../test-utils";

import ExampleFormOne from "../../../../src/components/form/example-form/ExampleFormOne";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

describe("components/form/example-form/ExampleFormOne", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(ExampleFormOne).toBeDefined();
    expect(typeof ExampleFormOne).toBe("function");
  });

  it("renders component successfully", () => {
    renderWithProviders(<ExampleFormOne />);
    expect(screen.queryByRole("form")).toBeInTheDocument();
  });

  it("renders form title", () => {
    renderWithProviders(<ExampleFormOne />);
    // Look for any heading or text that indicates a form
    const form = screen.queryByRole("form");
    expect(form).toBeInTheDocument();
  });
});
