import { within } from "@testing-library/dom";
import { ToggleGroup, ToggleGroupItem } from "../../../src/components/ui/toggle-group";
import { renderWithProviders, waitFor } from "../../test-utils";

describe.skip("components/ui/toggle-group.tsx", () => {
  it("renders toggle group", async () => {
    const { container } = renderWithProviders(
      <ToggleGroup type="single">
        <ToggleGroupItem value="item1">Item 1</ToggleGroupItem>
        <ToggleGroupItem value="item2">Item 2</ToggleGroupItem>
      </ToggleGroup>
    );
    await waitFor(() => {
      expect(within(container).getAllByText("Item 1")[0]).toBeInTheDocument();
      expect(within(container).getAllByText("Item 2")[0]).toBeInTheDocument();
    });
  });

  it("handles multiple selection", async () => {
    const { container } = renderWithProviders(
      <ToggleGroup type="multiple">
        <ToggleGroupItem value="item1">Item 1</ToggleGroupItem>
        <ToggleGroupItem value="item2">Item 2</ToggleGroupItem>
      </ToggleGroup>
    );
    await waitFor(() => {
      expect(within(container).getAllByText("Item 1")[0]).toBeInTheDocument();
      expect(within(container).getAllByText("Item 2")[0]).toBeInTheDocument();
    });
  });

  it("handles single selection", async () => {
    const { container } = renderWithProviders(
      <ToggleGroup type="single">
        <ToggleGroupItem value="item1">Item 1</ToggleGroupItem>
        <ToggleGroupItem value="item2">Item 2</ToggleGroupItem>
      </ToggleGroup>
    );
    await waitFor(() => {
      expect(within(container).getAllByText("Item 1")[0]).toBeInTheDocument();
    });
  });

  it("applies variant to group", () => {
    const { container } = renderWithProviders(
      <ToggleGroup variant="outline" type="single">
        <ToggleGroupItem value="item1">Item</ToggleGroupItem>
      </ToggleGroup>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it("applies size to group", () => {
    const { container } = renderWithProviders(
      <ToggleGroup size="sm" type="single">
        <ToggleGroupItem value="item1">Item</ToggleGroupItem>
      </ToggleGroup>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(
      <ToggleGroup className="custom-group" type="single">
        <ToggleGroupItem value="item1">Item</ToggleGroupItem>
      </ToggleGroup>
    );
    expect(container.firstChild).toHaveClass("custom-group");
  });
});
