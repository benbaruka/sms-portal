import { renderWithProviders, screen } from "../../../test-utils";

import ToggleSwitch from "../../../../src/components/form/form-elements/ToggleSwitch";

jest.mock("../../../../src/components/common/ComponentCard", () => ({
  default: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div data-testid="component-card">
      <h2>{title}</h2>
      {children}
    </div>
  ),
}));

jest.mock("../../../../src/components/form/switch/Switch", () => ({
  default: ({ label, defaultChecked, disabled, color, onChange }: any) => (
    <div data-testid={`switch-${label}`}>
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        disabled={disabled}
        data-color={color}
        onChange={onChange}
      />
      <label>{label}</label>
    </div>
  ),
}));

describe("components/form/form-elements/ToggleSwitch", () => {
  it("renders ToggleSwitch component", () => {
    renderWithProviders(<ToggleSwitch />);
    expect(screen.queryByTestId("component-card")).toBeInTheDocument();
    expect(screen.queryByText("Toggle switch input")).toBeInTheDocument();
  });

  it("renders all switch variants", () => {
    renderWithProviders(<ToggleSwitch />);
    // Il y a deux rangées, donc utiliser getAllByTestId
    const defaultSwitches = screen.getAllByTestId("switch-Default");
    const checkedSwitches = screen.getAllByTestId("switch-Checked");
    const disabledSwitches = screen.getAllByTestId("switch-Disabled");

    expect(defaultSwitches.length).toBeGreaterThan(0);
    expect(checkedSwitches.length).toBeGreaterThan(0);
    expect(disabledSwitches.length).toBeGreaterThan(0);
  });

  it("renders switches with default checked state", () => {
    renderWithProviders(<ToggleSwitch />);
    // Prendre le premier de chaque type
    const defaultSwitch = screen.getAllByTestId("switch-Default")[0].querySelector("input");
    const checkedSwitch = screen.getAllByTestId("switch-Checked")[0].querySelector("input");

    expect(defaultSwitch).toBeChecked();
    expect(checkedSwitch).toBeChecked();
  });

  it("renders disabled switch", () => {
    renderWithProviders(<ToggleSwitch />);
    // Prendre le premier switch disabled
    const disabledSwitch = screen.getAllByTestId("switch-Disabled")[0].querySelector("input");
    expect(disabledSwitch).toBeDisabled();
  });

  it("renders switches with brand color by default", () => {
    renderWithProviders(<ToggleSwitch />);
    // Le premier switch Default n'a pas de couleur gray
    const defaultSwitch = screen.getAllByTestId("switch-Default")[0].querySelector("input");
    expect(defaultSwitch).not.toHaveAttribute("data-color", "gray");
  });

  it("renders switches with gray color variant", () => {
    renderWithProviders(<ToggleSwitch />);
    // Second row should have gray switches
    const switches = screen.getAllByTestId(/^switch-/);
    expect(switches.length).toBeGreaterThan(3);
  });

  it("renders two rows of switches", () => {
    const { container } = renderWithProviders(<ToggleSwitch />);
    const rows = container.querySelectorAll("div.flex.gap-4");
    expect(rows).toHaveLength(2);
  });

  it("renders labels for all switches", () => {
    renderWithProviders(<ToggleSwitch />);
    // Il y a deux rangées avec les mêmes labels, utiliser getAllByText
    const defaultLabels = screen.queryAllByText("Default");
    const checkedLabels = screen.queryAllByText("Checked");
    const disabledLabels = screen.queryAllByText("Disabled");

    expect(defaultLabels.length).toBeGreaterThan(0);
    expect(checkedLabels.length).toBeGreaterThan(0);
    expect(disabledLabels.length).toBeGreaterThan(0);
  });
});
