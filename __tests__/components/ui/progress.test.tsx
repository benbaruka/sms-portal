import { renderWithProviders } from "../../test-utils";
import { Progress } from "../../../src/components/ui/progress";

describe("components/ui/progress.tsx", () => {
  it("renders progress component", () => {
    const { container } = renderWithProviders(<Progress value={50} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders progress with 0 value", () => {
    const { container } = renderWithProviders(<Progress value={0} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders progress with 100 value", () => {
    const { container } = renderWithProviders(<Progress value={100} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(<Progress value={50} className="custom-progress" />);
    expect(container.firstChild).toHaveClass("custom-progress");
  });

  it("handles undefined value", () => {
    const { container } = renderWithProviders(<Progress value={undefined} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders progress indicator", () => {
    const { container } = renderWithProviders(<Progress value={75} />);
    const indicator = container.querySelector('[role="progressbar"]');
    expect(indicator).toBeInTheDocument();
  });
});
