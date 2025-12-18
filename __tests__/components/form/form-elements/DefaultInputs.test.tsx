import { renderWithProviders, screen } from "../../../test-utils";

import DefaultInputs from "../../../../src/components/form/form-elements/DefaultInputs";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

describe("components/form/form-elements/DefaultInputs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(DefaultInputs).toBeDefined();
    expect(typeof DefaultInputs).toBe("function");
  });

  it("renders component successfully", () => {
    renderWithProviders(<DefaultInputs />);
    // Component should render without errors
    expect(screen.container).toBeDefined();
  });

  it("default export exists", () => {
    const Module = require("../../../../src/components/form/form-elements/DefaultInputs");
    expect(Module.default).toBeDefined();
  });
});
