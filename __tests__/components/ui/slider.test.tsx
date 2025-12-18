import { renderWithProviders } from "../../test-utils";
import { Slider } from "../../../src/components/ui/slider";

describe("components/ui/slider.tsx", () => {
  it("renders slider component", () => {
    const { container } = renderWithProviders(<Slider defaultValue={[50]} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders slider with value", () => {
    const { container } = renderWithProviders(<Slider value={[75]} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders slider with min and max", () => {
    const { container } = renderWithProviders(<Slider defaultValue={[50]} min={0} max={100} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders slider with step", () => {
    const { container } = renderWithProviders(<Slider defaultValue={[50]} step={10} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders disabled slider", () => {
    const { container } = renderWithProviders(<Slider defaultValue={[50]} disabled />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(
      <Slider defaultValue={[50]} className="custom-slider" />
    );
    expect(container.firstChild).toHaveClass("custom-slider");
  });

  it("renders slider with multiple values", () => {
    const { container } = renderWithProviders(<Slider defaultValue={[25, 75]} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
