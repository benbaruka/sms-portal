import { renderWithProviders, screen } from "../../test-utils";

import userEvent from "@testing-library/user-event";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../../../src/components/ui/select";

describe("components/ui/select.tsx", () => {
  it("renders select component with default value", () => {
    renderWithProviders(
      <Select defaultValue="option1">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    // The custom Select displays the raw value when no label is set
    expect(screen.getByText("option1")).toBeInTheDocument();
  });

  it("renders select items on click", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getAllByRole("combobox")[0];
    await user.click(trigger);

    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
  });

  it("renders select with group and label", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Group 1</SelectLabel>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getAllByRole("combobox")[0];
    await user.click(trigger);

    expect(screen.getByText("Group 1")).toBeInTheDocument();
  });

  it("renders select with separator", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectSeparator />
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getAllByRole("combobox")[0];
    await user.click(trigger);

    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
  });

  it("handles disabled select trigger", () => {
    renderWithProviders(
      <Select>
        <SelectTrigger disabled>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getAllByRole("combobox")[0];
    expect(trigger).toBeDisabled();
  });

  it("applies custom className to trigger", () => {
    const { container } = renderWithProviders(
      <Select>
        <SelectTrigger className="custom-trigger">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    expect(container.querySelector(".custom-trigger")).toBeInTheDocument();
  });
});
