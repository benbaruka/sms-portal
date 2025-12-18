import React from "react";
import { renderWithProviders, screen, waitFor } from "../../test-utils";
import { userEvent } from "@testing-library/user-event";
import { Input } from "../../../src/components/ui/input";
import { within } from "@testing-library/dom";

describe("components/ui/input.tsx", () => {
  it("renders input component", async () => {
    const { container } = renderWithProviders(<Input />);
    const input = within(container).getByRole("textbox");
    await waitFor(() => {
      expect(input).toBeInTheDocument();
    });
  });

  it("handles value changes", async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<Input />);
    const input = within(container).getByRole("textbox");
    await user.type(input, "test value");
    expect(input).toHaveValue("test value");
  });

  it("renders with placeholder", async () => {
    renderWithProviders(<Input placeholder="Enter text" />);
    const input = screen.queryByPlaceholderText("Enter text");
    await waitFor(() => {
      expect(input).toBeInTheDocument();
    });
  });

  it("renders disabled input", () => {
    const { container } = renderWithProviders(<Input disabled />);
    const input = within(container).getByRole("textbox");
    expect(input).toBeDisabled();
  });

  it("renders with type", () => {
    const { container } = renderWithProviders(<Input type="email" />);
    const input = within(container).getByRole("textbox");
    expect(input).toHaveAttribute("type", "email");
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(<Input className="custom-input" />);
    const input = container.querySelector("input");
    expect(input).toHaveClass("custom-input");
  });

  it("forwards ref correctly", async () => {
    const ref = React.createRef<HTMLInputElement>();
    renderWithProviders(<Input ref={ref} />);
    await waitFor(() => {
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });
});
