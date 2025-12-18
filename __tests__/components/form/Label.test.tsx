import { renderWithProviders, screen } from "../../test-utils";

import Label from "../../../src/components/form/Label";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

describe("components/form/Label", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(Label).toBeDefined();
    expect(typeof Label).toBe("function");
  });

  it("renders label with text", () => {
    renderWithProviders(<Label>Test Label</Label>);
    expect(screen.queryByText("Test Label")).toBeInTheDocument();
  });

  it("renders label element", () => {
    const { container } = renderWithProviders(<Label>My Label</Label>);
    const label = container.querySelector("label");
    expect(label).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(<Label className="custom-class">Label</Label>);
    const label = container.querySelector("label");
    expect(label).toHaveClass("custom-class");
  });

  it("renders label with htmlFor attribute", () => {
    const { container } = renderWithProviders(<Label htmlFor="input-id">Label Text</Label>);
    const label = container.querySelector("label");
    expect(label).toHaveAttribute("htmlFor", "input-id");
  });

  it("renders label without htmlFor when not provided", () => {
    const { container } = renderWithProviders(<Label>Label Text</Label>);
    const label = container.querySelector("label");
    expect(label).not.toHaveAttribute("htmlFor");
  });

  it("merges className with twMerge", () => {
    const { container } = renderWithProviders(<Label className="additional-class">Label</Label>);
    const label = container.querySelector("label");
    expect(label).toHaveClass("additional-class");
  });
});
