import { renderWithProviders, screen } from "../../../test-utils";

import { userEvent } from "@testing-library/user-event";
import CheckboxComponents from "../../../../src/components/form/form-elements/CheckboxComponents";

jest.mock("../../../../src/components/common/ComponentCard", () => ({
  default: ({ title, children }: any) => (
    <div data-testid="component-card">
      <h2>{title}</h2>
      {children}
    </div>
  ),
}));

describe("components/form/form-elements/CheckboxComponents", () => {
  it("renders CheckboxComponents component", () => {
    renderWithProviders(<CheckboxComponents />);
    expect(screen.queryByTestId("component-card")).toBeInTheDocument();
    expect(screen.queryByText("Checkbox")).toBeInTheDocument();
  });

  it("renders three checkbox variants", () => {
    renderWithProviders(<CheckboxComponents />);
    expect(screen.queryByText("Default")).toBeInTheDocument();
    expect(screen.queryByText("Checked")).toBeInTheDocument();
    expect(screen.queryByText("Disabled")).toBeInTheDocument();
  });

  it("renders default checkbox unchecked", () => {
    renderWithProviders(<CheckboxComponents />);
    const defaultCheckbox = screen
      .queryByText("Default")
      .previousElementSibling?.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(defaultCheckbox).not.toBeChecked();
  });

  it("renders checked checkbox", () => {
    renderWithProviders(<CheckboxComponents />);
    const checkedCheckbox = screen
      .queryByText("Checked")
      .parentElement?.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(checkedCheckbox).toBeChecked();
  });

  it("renders disabled checkbox", () => {
    renderWithProviders(<CheckboxComponents />);
    const disabledCheckbox = screen
      .queryByText("Disabled")
      .parentElement?.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(disabledCheckbox).toBeDisabled();
    expect(disabledCheckbox).toBeChecked();
  });

  it("allows toggling default checkbox", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CheckboxComponents />);

    const defaultLabel = screen.queryByText("Default");
    const checkbox = defaultLabel.previousElementSibling?.querySelector(
      'input[type="checkbox"]'
    ) as HTMLInputElement;

    if (checkbox) {
      await user.click(checkbox);
      expect(checkbox).toBeChecked();
    }
  });

  it("renders checkboxes in flex layout", () => {
    const { container } = renderWithProviders(<CheckboxComponents />);
    const flexContainer = container.querySelector("div.flex.items-center.gap-4");
    expect(flexContainer).toBeInTheDocument();
  });
});
