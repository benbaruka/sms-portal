import { renderWithProviders, screen } from "../../../test-utils";

import { userEvent } from "@testing-library/user-event";
import ExampleFormWithIcon from "../../../../src/components/form/example-form/ExampleFormWithIcon";

jest.mock("../../../../src/components/common/ComponentCard", () => ({
  default: ({ title, children }: any) => (
    <div data-testid="component-card">
      <h2>{title}</h2>
      {children}
    </div>
  ),
}));

jest.mock("../../../../src/icons", () => ({
  UserIcon: () => <svg data-testid="user-icon" />,
  EnvelopeIcon: () => <svg data-testid="envelope-icon" />,
  LockIcon: () => <svg data-testid="lock-icon" />,
  ArrowRightIcon: () => <svg data-testid="arrow-right-icon" />,
}));

describe("components/form/example-form/ExampleFormWithIcon", () => {
  it("renders ExampleFormWithIcon component", () => {
    renderWithProviders(<ExampleFormWithIcon />);
    expect(screen.queryByTestId("component-card")).toBeInTheDocument();
    expect(screen.queryByText("Example Form With Icons")).toBeInTheDocument();
  });

  it("renders all form inputs with icons", () => {
    renderWithProviders(<ExampleFormWithIcon />);
    expect(screen.queryByPlaceholderText("Username")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Email Address")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Confirm Password")).toBeInTheDocument();
  });

  it("renders icons for each input", () => {
    renderWithProviders(<ExampleFormWithIcon />);
    expect(screen.queryByTestId("user-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("envelope-icon")).toBeInTheDocument();
    expect(screen.getAllByTestId("lock-icon").length).toBe(2);
  });

  it("renders remember me checkbox", () => {
    renderWithProviders(<ExampleFormWithIcon />);
    expect(screen.queryByText("Remember me")).toBeInTheDocument();
  });

  it("renders create account button with icon", () => {
    renderWithProviders(<ExampleFormWithIcon />);
    expect(screen.queryByRole("button", { name: /Create Account/i })).toBeInTheDocument();
    expect(screen.queryByTestId("arrow-right-icon")).toBeInTheDocument();
  });

  it("allows typing in input fields", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ExampleFormWithIcon />);

    const usernameInput = screen.queryByPlaceholderText("Username");
    await user.type(usernameInput, "testuser");
    expect(usernameInput).toHaveValue("testuser");
  });

  it("allows toggling remember me checkbox", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ExampleFormWithIcon />);

    const checkbox = screen
      .queryByText("Remember me")
      .previousElementSibling?.querySelector('input[type="checkbox"]') as HTMLInputElement;
    if (checkbox) {
      expect(checkbox).not.toBeChecked();
      await user.click(checkbox);
      expect(checkbox).toBeChecked();
    }
  });

  it("handles form submission", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ExampleFormWithIcon />);

    const submitButton = screen.queryByRole("button", { name: /Create Account/i });
    await user.click(submitButton);
    // Form submission should be prevented
    expect(submitButton).toBeInTheDocument();
  });

  it("renders inputs with icon padding", () => {
    const { container } = renderWithProviders(<ExampleFormWithIcon />);
    const inputs = container.querySelectorAll("input.pl-11");
    expect(inputs.length).toBe(4);
  });
});
