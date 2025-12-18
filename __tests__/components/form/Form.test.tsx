import { renderWithProviders, screen } from "../../test-utils";

import Form from "../../../src/components/form/Form";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

describe("components/form/Form", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(Form).toBeDefined();
    expect(typeof Form).toBe("function");
  });

  it("renders component successfully", () => {
    renderWithProviders(
      <Form onSubmit={() => {}}>
        <div>Test</div>
      </Form>
    );
    expect(screen.queryByText("Test")).toBeInTheDocument();
  });

  it("renders form element", () => {
    const { container } = renderWithProviders(
      <Form onSubmit={() => {}}>
        <div>Content</div>
      </Form>
    );
    const form = container.querySelector("form");
    expect(form).toBeInTheDocument();
  });

  it("calls onSubmit when form is submitted", async () => {
    const handleSubmit = jest.fn((e) => {
      e.preventDefault();
    });
    const { container } = renderWithProviders(
      <Form onSubmit={handleSubmit}>
        <button type="submit">Submit</button>
      </Form>
    );
    const form = container.querySelector("form");
    const submitButton = screen.getByText("Submit");

    await submitButton.click();

    expect(handleSubmit).toHaveBeenCalled();
  });

  it("prevents default form submission", async () => {
    const handleSubmit = jest.fn((e) => {
      expect(e.defaultPrevented).toBe(true);
    });
    const { container } = renderWithProviders(
      <Form onSubmit={handleSubmit}>
        <button type="submit">Submit</button>
      </Form>
    );
    const submitButton = screen.getByText("Submit");

    await submitButton.click();

    expect(handleSubmit).toHaveBeenCalled();
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(
      <Form onSubmit={() => {}} className="custom-form-class">
        <div>Content</div>
      </Form>
    );
    const form = container.querySelector("form");
    expect(form).toHaveClass("custom-form-class");
  });

  it("renders children correctly", () => {
    renderWithProviders(
      <Form onSubmit={() => {}}>
        <input type="text" placeholder="Name" />
        <button type="submit">Submit</button>
      </Form>
    );
    expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
    expect(screen.getByText("Submit")).toBeInTheDocument();
  });
});
