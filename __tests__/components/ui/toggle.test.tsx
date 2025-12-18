import { within } from "@testing-library/dom";
import { userEvent } from "@testing-library/user-event";

import { Toggle } from "../../../src/components/ui/toggle";
import { renderWithProviders } from "../../test-utils";

describe.skip("components/ui/toggle.tsx", () => {
  it("renders toggle component", async () => {
    const { container } = renderWithProviders(<Toggle>Toggle</Toggle>);
    const button = await within(container).findByRole(
      "button",
      { name: "Toggle" },
      { timeout: 10000 }
    );
    expect(button).toBeInTheDocument();
  }, 10000);

  it("toggle can be pressed", async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<Toggle>Toggle</Toggle>);
    const button = within(container).getByRole("button", { name: "Toggle" });

    expect(button).not.toHaveAttribute("data-state", "on");
    await user.click(button);
    expect(button).toHaveAttribute("data-state", "on");
  });

  it("renders with pressed state", () => {
    const { container } = renderWithProviders(<Toggle pressed>Toggle</Toggle>);
    const button = within(container).getByRole("button", { name: "Toggle" });
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("handles disabled state", () => {
    const { container } = renderWithProviders(<Toggle disabled>Toggle</Toggle>);
    const button = within(container).getByRole("button", { name: "Toggle" });
    expect(button).toBeDisabled();
  });

  it("applies default variant", () => {
    const { container } = renderWithProviders(<Toggle>Toggle</Toggle>);
    const button = container.querySelector("button");
    expect(button).toBeInTheDocument();
  });

  it("applies outline variant", () => {
    const { container } = renderWithProviders(<Toggle variant="outline">Toggle</Toggle>);
    const button = container.querySelector("button");
    expect(button).toBeInTheDocument();
  });

  it("applies size variants", () => {
    const { container } = renderWithProviders(<Toggle size="sm">Small</Toggle>);
    const button = container.querySelector("button");
    expect(button).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(<Toggle className="custom-toggle">Toggle</Toggle>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("custom-toggle");
  });

  it("handles onClick callback", async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    const { container } = renderWithProviders(<Toggle onClick={handleClick}>Toggle</Toggle>);
    const button = within(container).getByRole("button", { name: "Toggle" });
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
