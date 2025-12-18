import { within } from "@testing-library/dom";
import { userEvent } from "@testing-library/user-event";

import { DropdownItem } from "../../../../src/components/ui/dropdown/DropdownItem";
import { render } from "../../../test-utils";

describe.skip("components/ui/dropdown/DropdownItem.tsx", () => {
  it("renders dropdown item as button by default", () => {
    const { container } = render(<DropdownItem>Item</DropdownItem>);
    const button = within(container).getByTestId("dropdown-item");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Item");
  });

  it("renders dropdown item as link when tag is 'a'", () => {
    const { container } = render(
      <DropdownItem tag="a" href="/test">
        Link Item
      </DropdownItem>
    );
    const link = within(container).getByTestId("dropdown-item");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    const { container } = render(<DropdownItem onClick={onClick}>Item</DropdownItem>);

    const button = within(container).getByTestId("dropdown-item");
    await user.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("calls onItemClick when clicked", async () => {
    const user = userEvent.setup();
    const onItemClick = jest.fn();
    const { container } = render(<DropdownItem onItemClick={onItemClick}>Item</DropdownItem>);

    const button = within(container).getByTestId("dropdown-item");
    await user.click(button);

    expect(onItemClick).toHaveBeenCalledTimes(1);
  });

  it("calls both onClick and onItemClick when both are provided", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    const onItemClick = jest.fn();
    const { container } = render(
      <DropdownItem onClick={onClick} onItemClick={onItemClick}>
        Item
      </DropdownItem>
    );

    const button = within(container).getByTestId("dropdown-item");
    await user.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onItemClick).toHaveBeenCalledTimes(1);
  });

  it("applies custom className", () => {
    const { container } = render(<DropdownItem className="custom-item">Item</DropdownItem>);
    const button = within(container).getByTestId("dropdown-item");
    expect(button).toHaveClass("custom-item");
  });

  it("uses default baseClassName when not provided", () => {
    const { container } = render(<DropdownItem>Item</DropdownItem>);
    const button = within(container).getByTestId("dropdown-item");
    expect(button).toHaveClass("block");
    expect(button).toHaveClass("w-full");
  });

  it("applies custom baseClassName", () => {
    const { container } = render(<DropdownItem baseClassName="custom-base">Item</DropdownItem>);
    const button = within(container).getByTestId("dropdown-item");
    expect(button).toHaveClass("custom-base");
  });

  it("renders children correctly", () => {
    const { container } = render(
      <DropdownItem>
        <span>Custom Content</span>
      </DropdownItem>
    );
    const button = within(container).getByTestId("dropdown-item");
    expect(button).toHaveTextContent("Custom Content");
  });
});
