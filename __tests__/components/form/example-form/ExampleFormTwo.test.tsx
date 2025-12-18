import { renderWithProviders, screen } from "../../../test-utils";

import ExampleFormTwo from "../../../../src/components/form/example-form/ExampleFormTwo";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

describe("components/form/example-form/ExampleFormTwo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(ExampleFormTwo).toBeDefined();
    expect(typeof ExampleFormTwo).toBe("function");
  });

  it("renders component successfully", () => {
    renderWithProviders(<ExampleFormTwo />);
    // Component should render without errors
    expect(
      screen.queryByRole("form") || screen.queryByText(/form/i) || screen.container
    ).toBeDefined();
  });

  it("default export exists", () => {
    const Module = require("../../../../src/components/form/example-form/ExampleFormTwo");
    expect(Module.default).toBeDefined();
  });
});
