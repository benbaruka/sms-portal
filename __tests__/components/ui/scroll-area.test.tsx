import { renderWithProviders } from "../../test-utils";
import { ScrollArea, ScrollBar } from "../../../src/components/ui/scroll-area";

describe("components/ui/scroll-area.tsx", () => {
  it("renders scroll area component", () => {
    const { container } = renderWithProviders(
      <ScrollArea>
        <div>Content</div>
      </ScrollArea>
    );
    expect(container.textContent).toContain("Content");
  });

  it("renders scroll bar", () => {
    const { container } = renderWithProviders(
      <ScrollArea>
        <div>Content</div>
        <ScrollBar />
      </ScrollArea>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders scroll bar with vertical orientation", () => {
    const { container } = renderWithProviders(
      <ScrollArea>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders scroll bar with horizontal orientation", () => {
    const { container } = renderWithProviders(
      <ScrollArea>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(
      <ScrollArea className="custom-scroll">
        <div>Content</div>
      </ScrollArea>
    );
    expect(container.firstChild).toHaveClass("custom-scroll");
  });

  it("renders multiple children", () => {
    const { container } = renderWithProviders(
      <ScrollArea>
        <div>Item 1</div>
        <div>Item 2</div>
      </ScrollArea>
    );
    expect(container.textContent).toContain("Item 1");
    expect(container.textContent).toContain("Item 2");
  });
});
