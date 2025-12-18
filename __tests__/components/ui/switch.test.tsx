import { within } from "@testing-library/dom";
import { userEvent } from "@testing-library/user-event";

import { Switch } from "../../../src/components/ui/switch";
import { renderWithProviders } from "../../test-utils";

describe("components/ui/switch.tsx", () => {
  it("renders switch component", async () => {
    const { container } = renderWithProviders(<Switch />);
    const switchElement = await within(container).findByRole("switch", {}, { timeout: 10000 });
    expect(switchElement).toBeInTheDocument();
  }, 10000);

  it("switch is unchecked by default", () => {
    const { container } = renderWithProviders(<Switch />);
    const switchElement = within(container).getByRole("switch");
    expect(switchElement).not.toBeChecked();
  });

  it("switch can be checked", async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<Switch />);
    const switchElement = within(container).getByRole("switch");
    await user.click(switchElement);
    expect(switchElement).toBeChecked();
  });

  it("switch can be checked by default", () => {
    const { container } = renderWithProviders(<Switch defaultChecked />);
    const switchElement = within(container).getByRole("switch");
    expect(switchElement).toBeChecked();
  });

  it("switch can be disabled", () => {
    const { container } = renderWithProviders(<Switch disabled />);
    const switchElement = within(container).getByRole("switch");
    expect(switchElement).toBeDisabled();
  });

  it("handles controlled state", () => {
    const { container } = renderWithProviders(<Switch checked={true} />);
    const switchElement = within(container).getByRole("switch");
    expect(switchElement).toBeChecked();
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(<Switch className="custom-switch" />);
    const switchElement = container.querySelector("button");
    expect(switchElement).toHaveClass("custom-switch");
  });

  it("handles onChange callback", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    const { container } = renderWithProviders(<Switch onCheckedChange={handleChange} />);
    const switchElement = within(container).getByRole("switch");
    await user.click(switchElement);

    expect(handleChange).toHaveBeenCalledWith(true);
  });
});
