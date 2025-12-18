import { renderWithProviders } from "../../../test-utils";
import PageLoader from "../../../src/global/loader/PageLoader";

describe("global/loader/PageLoader.tsx", () => {
  it("renders page loader component", () => {
    const { container } = renderWithProviders(<PageLoader />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("has honeycomb class", () => {
    const { container } = renderWithProviders(<PageLoader />);
    const loader = container.querySelector(".honeycomb");
    expect(loader).toBeInTheDocument();
  });

  it("renders multiple divs for honeycomb effect", () => {
    const { container } = renderWithProviders(<PageLoader />);
    const honeycomb = container.querySelector(".honeycomb");
    const divs = honeycomb?.querySelectorAll("div");
    expect(divs?.length).toBe(7);
  });
});
