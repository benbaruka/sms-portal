import { within } from "@testing-library/dom";
import { userEvent } from "@testing-library/user-event";
import React from "react";
import { Textarea } from "../../../src/components/ui/textarea";
import { renderWithProviders, waitFor } from "../../test-utils";

describe("components/ui/textarea.tsx", () => {
  it("renders textarea component", async () => {
    const { container } = renderWithProviders(<Textarea />);
    const textarea = within(container).getByRole("textbox");
    await waitFor(() => {
      expect(textarea).toBeInTheDocument();
    });
    expect(textarea.tagName).toBe("TEXTAREA");
  });

  it("handles value changes", async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<Textarea />);
    const textarea = within(container).getByRole("textbox");
    await user.type(textarea, "test text");
    expect(textarea).toHaveValue("test text");
  });

  it("renders with placeholder", async () => {
    const { container } = renderWithProviders(<Textarea placeholder="Enter description" />);
    const textarea = within(container).getByPlaceholderText("Enter description");
    await waitFor(() => {
      expect(textarea).toBeInTheDocument();
    });
  });

  it("renders disabled textarea", () => {
    const { container } = renderWithProviders(<Textarea disabled />);
    const textarea = within(container).getByRole("textbox");
    expect(textarea).toBeDisabled();
  });

  it("renders with rows attribute", () => {
    const { container } = renderWithProviders(<Textarea rows={5} />);
    const textarea = within(container).getByRole("textbox");
    expect(textarea).toHaveAttribute("rows", "5");
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(<Textarea className="custom-textarea" />);
    const textarea = container.querySelector("textarea");
    expect(textarea).toHaveClass("custom-textarea");
  });

  it("forwards ref correctly", async () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    renderWithProviders(<Textarea ref={ref} />);
    await waitFor(() => {
      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    });
  });
});
