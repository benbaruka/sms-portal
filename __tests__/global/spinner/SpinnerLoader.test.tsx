import { renderWithProviders } from "../../../test-utils";
import SpinnerLoader from "../../../src/global/spinner/SpinnerLoader";

describe("global/spinner/SpinnerLoader.tsx", () => {
  it("renders spinner loader component", () => {
    const { container } = renderWithProviders(<SpinnerLoader />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("has loader class", () => {
    const { container } = renderWithProviders(<SpinnerLoader />);
    const loader = container.querySelector(".loader");
    expect(loader).toBeInTheDocument();
  });

  it("renders as span element", () => {
    const { container } = renderWithProviders(<SpinnerLoader />);
    const span = container.querySelector("span");
    expect(span).toBeInTheDocument();
    expect(span).toHaveClass("loader");
  });
});
