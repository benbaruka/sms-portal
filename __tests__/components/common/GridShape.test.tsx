// Coverage target: 100% lines, branches, functions

import { render } from "@testing-library/react";
import GridShape from "../../../src/components/common/GridShape";

// Use the global mock from jest.setup.ts
// The global mock already converts Image to img

describe("GridShape", () => {
  it("renders two grid images", () => {
    const { container } = render(<GridShape />);
    // GridShape returns a fragment with two divs, each containing an Image
    const images = container.querySelectorAll("img");
    expect(images).toHaveLength(2);
  });

  it("renders first grid image with correct props", () => {
    const { container } = render(<GridShape />);
    const images = container.querySelectorAll("img");
    const firstImage = images[0] as HTMLImageElement;
    
    expect(firstImage).toHaveAttribute("src", "/images/shape/grid-01.svg");
    expect(firstImage).toHaveAttribute("alt", "grid");
    expect(firstImage).toHaveAttribute("width", "540");
    expect(firstImage).toHaveAttribute("height", "254");
  });

  it("renders second grid image with correct props", () => {
    const { container } = render(<GridShape />);
    const images = container.querySelectorAll("img");
    const secondImage = images[1] as HTMLImageElement;
    
    expect(secondImage).toHaveAttribute("src", "/images/shape/grid-01.svg");
    expect(secondImage).toHaveAttribute("alt", "grid");
    expect(secondImage).toHaveAttribute("width", "540");
    expect(secondImage).toHaveAttribute("height", "254");
  });

  it("applies correct CSS classes to first grid", () => {
    const { container } = render(<GridShape />);
    // GridShape returns a fragment, so firstChild is the first div
    const firstDiv = container.firstChild as HTMLElement;
    
    expect(firstDiv).toHaveClass(
      "absolute",
      "right-0",
      "top-0",
      "-z-1",
      "w-full",
      "max-w-[250px]",
      "xl:max-w-[450px]"
    );
  });

  it("applies correct CSS classes to second grid", () => {
    const { container } = render(<GridShape />);
    // GridShape returns a fragment, so we need to get the second child
    const children = Array.from(container.children);
    const secondDiv = children[1] as HTMLElement;
    
    expect(secondDiv).toHaveClass(
      "absolute",
      "bottom-0",
      "left-0",
      "-z-1",
      "w-full",
      "max-w-[250px]",
      "rotate-180",
      "xl:max-w-[450px]"
    );
  });
});
