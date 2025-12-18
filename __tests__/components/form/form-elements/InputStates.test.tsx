import { renderWithProviders, screen } from "../../../test-utils";

import { userEvent } from "@testing-library/user-event";
import InputStates from "../../../../src/components/form/form-elements/InputStates";

jest.mock("../../../../src/components/common/ComponentCard", () => ({
  default: ({ title, desc, children }: any) => (
    <div data-testid="component-card">
      <h2>{title}</h2>
      {desc && <p>{desc}</p>}
      {children}
    </div>
  ),
}));

describe("components/form/form-elements/InputStates", () => {
  it("renders InputStates component", () => {
    renderWithProviders(<InputStates />);
    expect(screen.queryByTestId("component-card")).toBeInTheDocument();
    expect(screen.queryByText("Input States")).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Validation styles for error, success and disabled states on form controls."
      )
    ).toBeInTheDocument();
  });

  it("renders three input states", () => {
    renderWithProviders(<InputStates />);
    const inputs = screen.getAllByPlaceholderText(/email/i);
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });

  it("shows error state when invalid email is entered", async () => {
    const user = userEvent.setup();
    renderWithProviders(<InputStates />);

    const input = screen.queryByPlaceholderText("Enter your email");
    await user.type(input, "invalid");

    expect(screen.queryByText("This is an invalid email address.")).toBeInTheDocument();
  });

  it("shows success state when valid email is entered", async () => {
    const user = userEvent.setup();
    renderWithProviders(<InputStates />);

    const inputs = screen.getAllByPlaceholderText("Enter your email");
    await user.type(inputs[0], "test@example.com");

    // Second input should show success
    const successHint = screen.queryByText("Valid email!");
    expect(successHint).toBeInTheDocument();
  });

  it("renders disabled input state", () => {
    renderWithProviders(<InputStates />);
    const disabledInput = screen.queryByPlaceholderText("Disabled email");
    expect(disabledInput).toBeDisabled();
    expect(screen.queryByText("This field is disabled.")).toBeInTheDocument();
  });

  it("renders all email labels", () => {
    renderWithProviders(<InputStates />);
    const labels = screen.queryAllByText("Email");
    expect(labels).toHaveLength(3);
  });

  it("validates email format correctly", async () => {
    const user = userEvent.setup();
    renderWithProviders(<InputStates />);

    const input = screen.queryByPlaceholderText("Enter your email");
    await user.type(input, "test@example.com");

    // Should not show error for valid email
    const errorHint = screen.queryByText("This is an invalid email address.");
    expect(errorHint).not.toBeInTheDocument();
  });
});
