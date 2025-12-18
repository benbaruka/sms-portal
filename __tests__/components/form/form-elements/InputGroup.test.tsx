import { renderWithProviders, screen } from "../../../test-utils";

import InputGroup from "../../../../src/components/form/form-elements/InputGroup";

jest.mock("../../../../src/components/common/ComponentCard", () => ({
  default: ({ title, children }: any) => (
    <div data-testid="component-card">
      <h2>{title}</h2>
      {children}
    </div>
  ),
}));

jest.mock("../../../../src/icons", () => ({
  EnvelopeIcon: () => <svg data-testid="envelope-icon" />,
}));

describe("components/form/form-elements/InputGroup", () => {
  it("renders InputGroup component", () => {
    renderWithProviders(<InputGroup />);
    expect(screen.queryByTestId("component-card")).toBeInTheDocument();
    expect(screen.queryByText("Input Group")).toBeInTheDocument();
  });

  it("renders email input with icon", () => {
    renderWithProviders(<InputGroup />);
    expect(screen.queryByText("Email")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("info@gmail.com")).toBeInTheDocument();
    expect(screen.queryByTestId("envelope-icon")).toBeInTheDocument();
  });

  it("renders phone input with country selector at start", () => {
    renderWithProviders(<InputGroup />);
    const phoneLabels = screen.queryAllByText("Phone");
    expect(phoneLabels.length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByPlaceholderText("+1 (555) 000-0000")).toBeInTheDocument();
  });

  it("renders two phone inputs with different selector positions", () => {
    const { container } = renderWithProviders(<InputGroup />);
    const phoneInputs = screen.getAllByPlaceholderText("+1 (555) 000-0000");
    expect(phoneInputs.length).toBe(2);
  });

  it("renders all labels correctly", () => {
    renderWithProviders(<InputGroup />);
    expect(screen.queryByText("Email")).toBeInTheDocument();
    const phoneLabels = screen.queryAllByText("Phone");
    expect(phoneLabels.length).toBe(2);
  });

  it("displays envelope icon in email input group", () => {
    renderWithProviders(<InputGroup />);
    expect(screen.queryByTestId("envelope-icon")).toBeInTheDocument();
  });

  it("renders input groups in a vertical layout", () => {
    const { container } = renderWithProviders(<InputGroup />);
    const mainDiv = container.querySelector("div.space-y-6");
    expect(mainDiv).toBeInTheDocument();
  });
});
