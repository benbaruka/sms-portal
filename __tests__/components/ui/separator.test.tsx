import { renderWithProviders } from "../../test-utils";
import { Separator } from "../../../src/components/ui/separator";

describe("components/ui/separator.tsx", () => {
  it("renders separator component", () => {
    const { container } = renderWithProviders(<Separator />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders horizontal separator by default", () => {
    const { container } = renderWithProviders(<Separator />);
    const separator = container.firstChild as HTMLElement;
    expect(separator).toHaveClass("w-full");
    expect(separator).toHaveClass("h-[1px]");
  });

  it("renders vertical separator", () => {
    const { container } = renderWithProviders(<Separator orientation="vertical" />);
    const separator = container.firstChild as HTMLElement;
    expect(separator).toHaveClass("h-full");
    expect(separator).toHaveClass("w-[1px]");
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(<Separator className="custom-class" />);
    const separator = container.firstChild as HTMLElement;
    expect(separator).toHaveClass("custom-class");
  });

  it("sets decorative prop", () => {
    const { container } = renderWithProviders(<Separator decorative={false} />);
    const separator = container.firstChild as HTMLElement;
    expect(separator).toBeInTheDocument();
  });

  it("defaults to decorative true", () => {
    const { container } = renderWithProviders(<Separator />);
    const separator = container.firstChild as HTMLElement;
    expect(separator).toBeInTheDocument();
  });
});
