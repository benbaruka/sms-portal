import { renderWithProviders, screen, waitFor } from "../../test-utils";

import userEvent from "@testing-library/user-event";
import { RadioGroup, RadioGroupItem } from "../../../src/components/ui/radio-group";

describe("components/ui/radio-group.tsx", () => {
  it("renders radio group", async () => {
    renderWithProviders(
      <RadioGroup>
        <RadioGroupItem value="option1" id="r1" />
        <label htmlFor="r1">Option 1</label>
      </RadioGroup>
    );
    const radios = screen.getAllByRole("radio");
    await waitFor(() => {
      expect(radios[0]).toBeInTheDocument();
    });
  });

  it("renders multiple radio items", () => {
    renderWithProviders(
      <RadioGroup>
        <RadioGroupItem value="option1" id="r1" />
        <label htmlFor="r1">Option 1</label>
        <RadioGroupItem value="option2" id="r2" />
        <label htmlFor="r2">Option 2</label>
      </RadioGroup>
    );
    const radios = screen.getAllByRole("radio");
    // Radix may render extra internal radios, so we filter by our option values
    const optionRadios = radios.filter(
      (r) => (r as HTMLButtonElement).getAttribute("value")?.startsWith("option"),
    );
    expect(optionRadios).toHaveLength(2);
  });

  it("selects radio item", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <RadioGroup>
        <RadioGroupItem value="option1" id="r1" />
        <label htmlFor="r1">Option 1</label>
        <RadioGroupItem value="option2" id="r2" />
        <label htmlFor="r2">Option 2</label>
      </RadioGroup>
    );

    const radios = screen.queryAllByRole("radio");
    await user.click(radios[0]);

    expect(radios[0]).toBeChecked();
    expect(radios[1]).not.toBeChecked();
  });

  it("handles defaultValue", () => {
    renderWithProviders(
      <RadioGroup defaultValue="option2">
        <RadioGroupItem value="option1" id="r1" />
        <label htmlFor="r1">Option 1</label>
        <RadioGroupItem value="option2" id="r2" />
        <label htmlFor="r2">Option 2</label>
      </RadioGroup>
    );

    const radios = screen.getAllByRole("radio");
    const option2 = radios.find(
      (r) => (r as HTMLButtonElement).getAttribute("value") === "option2",
    ) as HTMLButtonElement | undefined;
    expect(option2).toBeDefined();
    expect(option2).toBeChecked();
  });

  it("handles disabled radio item", () => {
    renderWithProviders(
      <RadioGroup>
        <RadioGroupItem value="option1" id="r1" disabled />
        <label htmlFor="r1">Option 1</label>
      </RadioGroup>
    );

    const radios = screen.getAllByRole("radio");
    const option1 = radios.find(
      (r) => (r as HTMLButtonElement).getAttribute("value") === "option1",
    ) as HTMLButtonElement | undefined;
    expect(option1).toBeDefined();
    expect(option1).toBeDisabled();
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(
      <RadioGroup className="custom-group">
        <RadioGroupItem value="option1" id="r1" />
      </RadioGroup>
    );
    expect(container.firstChild).toHaveClass("custom-group");
  });

  it("handles onValueChange callback", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    renderWithProviders(
      <RadioGroup onValueChange={handleChange}>
        <RadioGroupItem value="option1" id="r1" />
        <label htmlFor="r1">Option 1</label>
      </RadioGroup>
    );

    const radios = screen.getAllByRole("radio");
    await user.click(radios[0]);
    expect(handleChange).toHaveBeenCalledWith("option1");
  });
});
