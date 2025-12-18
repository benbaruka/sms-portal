import React from "react";
import { renderWithProviders, screen, waitFor } from "../../test-utils";
import { Label } from "../../../src/components/ui/label";

describe("components/ui/label.tsx", () => {
  it("renders label component", async () => {
    renderWithProviders(<Label>Label Text</Label>);
    await waitFor(() => {
      expect(screen.queryByText("Label Text")).toBeInTheDocument();
    });
  });

  it("associates label with input via htmlFor", () => {
    renderWithProviders(
      <>
        <Label htmlFor="test-input">Test Label</Label>
        <input id="test-input" />
      </>
    );
    const label = screen.queryByText("Test Label");
    expect(label).toHaveAttribute("for", "test-input");
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(<Label className="custom-label">Label</Label>);
    const label = container.querySelector("label");
    expect(label).toHaveClass("custom-label");
  });

  it("handles disabled state styling", async () => {
    renderWithProviders(
      <>
        <Label htmlFor="disabled-input">Disabled Label</Label>
        <input id="disabled-input" disabled />
      </>
    );
    const label = screen.queryByText("Disabled Label");
    await waitFor(() => {
      expect(label).toBeInTheDocument();
    });
  });

  it("forwards ref correctly", async () => {
    const ref = React.createRef<HTMLLabelElement>();
    renderWithProviders(<Label ref={ref}>Label</Label>);
    await waitFor(() => {
      expect(ref.current).toBeInstanceOf(HTMLLabelElement);
    });
  });
});
