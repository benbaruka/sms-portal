import { renderWithProviders } from "../../test-utils";
import { Skeleton } from "../../../src/components/ui/skeleton";

describe("components/ui/skeleton.tsx", () => {
  it("renders skeleton component", () => {
    const { container } = renderWithProviders(<Skeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("has correct animation classes", () => {
    const { container } = renderWithProviders(<Skeleton />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass("animate-pulse");
    expect(skeleton).toHaveClass("rounded-md");
    expect(skeleton).toHaveClass("bg-muted");
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(<Skeleton className="custom-skeleton" />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass("custom-skeleton");
  });

  it("renders with custom dimensions", () => {
    const { container } = renderWithProviders(<Skeleton className="h-12 w-24" />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass("h-12");
    expect(skeleton).toHaveClass("w-24");
  });

  it("renders circular skeleton", () => {
    const { container } = renderWithProviders(<Skeleton className="h-10 w-10 rounded-full" />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass("rounded-full");
  });

  it("can be used as wrapper", () => {
    const { container } = renderWithProviders(
      <Skeleton>
        <div>Content</div>
      </Skeleton>
    );
    expect(container.textContent).toContain("Content");
  });
});
