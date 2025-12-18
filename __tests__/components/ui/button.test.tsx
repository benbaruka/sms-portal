import React from "react";

import { renderWithProviders, screen, waitFor } from "../../test-utils";
import { userEvent } from "@testing-library/user-event";
import { Button } from "../../../src/components/ui/button";

describe("components/ui/button.tsx", () => {
  it("renders button component", async () => {
    renderWithProviders(<Button>Click me</Button>);
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Click me" })).toBeInTheDocument();
    });
  });

  it("renders button with default variant", () => {
    const { container } = renderWithProviders(<Button>Button</Button>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("bg-primary");
  });

  it("renders button with different variants", () => {
    renderWithProviders(<Button variant="outline">Outline</Button>);
    renderWithProviders(<Button variant="ghost">Ghost</Button>);
    renderWithProviders(<Button variant="secondary">Secondary</Button>);
    renderWithProviders(<Button variant="destructive">Destructive</Button>);
    renderWithProviders(<Button variant="link">Link</Button>);
  });

  it("renders button with different sizes", () => {
    renderWithProviders(<Button size="sm">Small</Button>);
    renderWithProviders(<Button size="lg">Large</Button>);
    renderWithProviders(<Button size="icon">Icon</Button>);
  });

  it("handles click events", async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    renderWithProviders(<Button onClick={handleClick}>Click</Button>);

    const button = screen.queryByRole("button");
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders disabled button", () => {
    renderWithProviders(<Button disabled>Disabled</Button>);
    const button = screen.queryByRole("button");
    expect(button).toBeDisabled();
  });

  it("renders button as child component", async () => {
    renderWithProviders(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    const link = screen.queryByRole("link");
    await waitFor(() => {
      expect(link).toBeInTheDocument();
    });
    expect(link).toHaveAttribute("href", "/test");
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(<Button className="custom-btn">Button</Button>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("custom-btn");
  });

  it("forwards ref correctly", async () => {
    const ref = React.createRef<HTMLButtonElement>();
    renderWithProviders(<Button ref={ref}>Button</Button>);
    await waitFor(() => {
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });
});
