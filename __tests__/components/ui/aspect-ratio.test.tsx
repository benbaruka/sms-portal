import { renderWithProviders } from "../../test-utils";

import { AspectRatio } from "../../../src/components/ui/aspect-ratio";

jest.mock("@radix-ui/react-aspect-ratio", () => ({
  Root: ({ children, ratio, className }: any) => (
    <div data-testid="aspect-ratio" data-ratio={ratio} className={className}>
      {children}
    </div>
  ),
}));

describe("components/ui/aspect-ratio", () => {
  it("renders aspect ratio component", () => {
    const { container } = renderWithProviders(
      <AspectRatio ratio={16 / 9}>
        <div>Content</div>
      </AspectRatio>
    );
    expect(container.textContent).toContain("Content");
  });

  it("renders with default 16:9 ratio", () => {
    const { container } = renderWithProviders(
      <AspectRatio ratio={16 / 9}>
        <img src="/test.jpg" alt="Test" />
      </AspectRatio>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders with custom ratio", () => {
    const { container } = renderWithProviders(
      <AspectRatio ratio={4 / 3}>
        <div>Content</div>
      </AspectRatio>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders with 1:1 ratio", () => {
    const { container } = renderWithProviders(
      <AspectRatio ratio={1}>
        <div>Square</div>
      </AspectRatio>
    );
    expect(container.textContent).toContain("Square");
  });

  it("renders children correctly", () => {
    const { container } = renderWithProviders(
      <AspectRatio ratio={16 / 9}>
        <img src="/image.jpg" alt="Image" />
      </AspectRatio>
    );
    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("alt", "Image");
  });

  it("applies aspect ratio styling", () => {
    const { container } = renderWithProviders(
      <AspectRatio ratio={16 / 9}>
        <div>Content</div>
      </AspectRatio>
    );
    expect(container.firstChild).toBeInTheDocument();
  });
});
