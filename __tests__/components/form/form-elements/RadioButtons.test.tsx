import { renderWithProviders, screen } from "../../../test-utils";

import { userEvent } from "@testing-library/user-event";
import RadioButtons from "../../../../src/components/form/form-elements/RadioButtons";

jest.mock("../../../../src/components/common/ComponentCard", () => ({
  default: ({ title, children }: any) => (
    <div data-testid="component-card">
      <h2>{title}</h2>
      {children}
    </div>
  ),
}));

describe("components/form/form-elements/RadioButtons", () => {
  it("renders RadioButtons component", () => {
    renderWithProviders(<RadioButtons />);
    expect(screen.queryByTestId("component-card")).toBeInTheDocument();
    expect(screen.queryByText("Radio Buttons")).toBeInTheDocument();
  });

  it("renders three radio buttons", () => {
    renderWithProviders(<RadioButtons />);
    expect(screen.queryByLabelText("Default")).toBeInTheDocument();
    expect(screen.queryByLabelText("Selected")).toBeInTheDocument();
    expect(screen.queryByLabelText("Disabled")).toBeInTheDocument();
  });

  it("renders with option2 selected by default", () => {
    renderWithProviders(<RadioButtons />);
    const selectedRadio = screen.queryByLabelText("Selected");
    expect(selectedRadio).toBeChecked();
  });

  it("allows changing selection", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RadioButtons />);

    const defaultRadio = screen.queryByLabelText("Default");
    await user.click(defaultRadio);

    expect(defaultRadio).toBeChecked();
    expect(screen.queryByLabelText("Selected")).not.toBeChecked();
  });

  it("renders disabled radio button", () => {
    renderWithProviders(<RadioButtons />);
    const disabledRadio = screen.queryByLabelText("Disabled");
    expect(disabledRadio).toBeDisabled();
  });

  it("renders radio buttons in a flex layout", () => {
    const { container } = renderWithProviders(<RadioButtons />);
    const flexContainer = container.querySelector("div.flex.flex-wrap");
    expect(flexContainer).toBeInTheDocument();
  });

  it("handles radio button group interactions", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RadioButtons />);

    // Click on Default
    const defaultRadio = screen.queryByLabelText("Default");
    await user.click(defaultRadio);
    expect(defaultRadio).toBeChecked();

    // Click on Selected
    const selectedRadio = screen.queryByLabelText("Selected");
    await user.click(selectedRadio);
    expect(selectedRadio).toBeChecked();
    expect(defaultRadio).not.toBeChecked();
  });
});
