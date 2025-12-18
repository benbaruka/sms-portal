import { renderWithProviders } from "../../../test-utils";
import SpinLoader from "../../../src/global/spinLoader/SpinLoader";

describe("global/spinLoader/SpinLoader.tsx", () => {
  it("renders spin loader component", () => {
    const { container } = renderWithProviders(<SpinLoader />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("has _loader class", () => {
    const { container } = renderWithProviders(<SpinLoader />);
    const loader = container.querySelector("._loader");
    expect(loader).toBeInTheDocument();
  });

  it("renders as span element", () => {
    const { container } = renderWithProviders(<SpinLoader />);
    const span = container.querySelector("span");
    expect(span).toBeInTheDocument();
    expect(span).toHaveClass("_loader");
  });
});
