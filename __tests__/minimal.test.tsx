import { renderWithProviders, screen } from "./test-utils";

describe("Minimal test", () => {
  it("renders with providers", () => {
    renderWithProviders(<div>Hello World</div>);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });
});
