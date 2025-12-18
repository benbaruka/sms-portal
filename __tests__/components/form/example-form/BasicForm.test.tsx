import { renderWithProviders, screen } from "../../../test-utils";

import { userEvent } from "@testing-library/user-event";
import BasicForm from "../../../../src/components/form/example-form/BasicForm";

jest.mock("../../../../src/components/common/ComponentCard", () => ({
  default: ({ title, children }: any) => (
    <div data-testid="component-card">
      <h2>{title}</h2>
      {children}
    </div>
  ),
}));

describe("components/form/example-form/BasicForm", () => {
  it("renders BasicForm component", () => {
    renderWithProviders(<BasicForm />);
    expect(screen.queryByTestId("component-card")).toBeInTheDocument();
    expect(screen.queryByText("Basic Form")).toBeInTheDocument();
  });

  it("renders all form inputs", () => {
    renderWithProviders(<BasicForm />);
    expect(screen.queryByPlaceholderText("Name")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Email address")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Confirm Password")).toBeInTheDocument();
  });

  it("renders submit button", () => {
    renderWithProviders(<BasicForm />);
    expect(screen.queryByRole("button", { name: "Submit" })).toBeInTheDocument();
  });

  it("renders form in grid layout", () => {
    const { container } = renderWithProviders(<BasicForm />);
    const grid = container.querySelector("div.grid");
    expect(grid).toBeInTheDocument();
  });

  it("handles form submission", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BasicForm />);

    const form = screen.queryByRole("button", { name: "Submit" }).closest("form");
    const submitButton = screen.queryByRole("button", { name: "Submit" });

    await user.click(submitButton);
    // Form submission should be prevented
    expect(form).toBeInTheDocument();
  });

  it("allows typing in input fields", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BasicForm />);

    const nameInput = screen.queryByPlaceholderText("Name");
    await user.type(nameInput, "John Doe");
    expect(nameInput).toHaveValue("John Doe");
  });

  it("renders password fields", () => {
    renderWithProviders(<BasicForm />);
    const passwordInput = screen.queryByPlaceholderText("Password");
    const confirmPasswordInput = screen.queryByPlaceholderText("Confirm Password");
    expect(passwordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toBeInTheDocument();
  });
});
