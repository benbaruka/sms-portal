import { renderWithProviders, screen } from "../../../test-utils";

import { userEvent } from "@testing-library/user-event";
import TextAreaInput from "../../../../src/components/form/form-elements/TextAreaInput";

jest.mock("../../../../src/components/common/ComponentCard", () => ({
  default: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div data-testid="component-card">
      <h2>{title}</h2>
      {children}
    </div>
  ),
}));

describe("components/form/form-elements/TextAreaInput", () => {
  it("renders TextAreaInput component", () => {
    renderWithProviders(<TextAreaInput />);
    expect(screen.queryByTestId("component-card")).toBeInTheDocument();
    expect(screen.queryByText("Textarea input field")).toBeInTheDocument();
  });

  it("renders all three textarea variants", () => {
    renderWithProviders(<TextAreaInput />);
    const textareas = screen.getAllByPlaceholderText("Enter your message");
    expect(textareas).toHaveLength(3);
  });

  it("renders default textarea", () => {
    renderWithProviders(<TextAreaInput />);
    const textareas = screen.getAllByPlaceholderText("Enter your message");
    expect(textareas[0]).toBeInTheDocument();
    expect(textareas[0]).not.toBeDisabled();
  });

  it("renders disabled textarea", () => {
    renderWithProviders(<TextAreaInput />);
    const textareas = screen.getAllByPlaceholderText("Enter your message");
    expect(textareas[1]).toBeDisabled();
  });

  it("renders error textarea with hint", () => {
    renderWithProviders(<TextAreaInput />);
    expect(screen.queryByText("Please enter a valid message.")).toBeInTheDocument();
    const textareas = screen.getAllByPlaceholderText("Enter your message");
    const errorTextarea = textareas[2];
    expect(errorTextarea).toBeInTheDocument();
  });

  it("handles input changes in default textarea", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TextAreaInput />);

    const textareas = screen.getAllByPlaceholderText("Enter your message");
    await user.type(textareas[0], "Test message");

    expect(textareas[0]).toHaveValue("Test message");
  });

  it("handles input changes in error textarea", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TextAreaInput />);

    const textareas = screen.getAllByPlaceholderText("Enter your message");
    await user.type(textareas[2], "Error message");

    expect(textareas[2]).toHaveValue("Error message");
  });

  it("renders labels for each textarea", () => {
    renderWithProviders(<TextAreaInput />);
    const labels = screen.queryAllByText("Description");
    expect(labels).toHaveLength(3);
  });
});
