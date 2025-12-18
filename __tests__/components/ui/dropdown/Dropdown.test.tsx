import { renderWithProviders, screen, waitFor } from "../../../test-utils";
import { within } from "@testing-library/dom";

import userEvent from "@testing-library/user-event";
import { Dropdown } from "../../../../src/components/ui/dropdown/Dropdown";

describe.skip("components/ui/dropdown/Dropdown.tsx", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders dropdown when isOpen is true", async () => {
    const { container } = renderWithProviders(
      <Dropdown isOpen={true} onClose={jest.fn()}>
        <div>Dropdown Content</div>
      </Dropdown>
    );
    await waitFor(() => {
      expect(within(container).queryByText("Dropdown Content")).toBeInTheDocument();
    });
  });

  it("does not render dropdown when isOpen is false", () => {
    const { container } = renderWithProviders(
      <Dropdown isOpen={false} onClose={jest.fn()}>
        <div>Dropdown Content</div>
      </Dropdown>
    );
    expect(within(container).queryByText("Dropdown Content")).not.toBeInTheDocument();
  });

  it("calls onClose when clicking outside", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    const { container } = renderWithProviders(
      <div>
        <div className="dropdown-toggle">Trigger</div>
        <Dropdown isOpen={true} onClose={onClose}>
          <div>Content</div>
        </Dropdown>
      </div>
    );

    // Click outside the dropdown (but not on the toggle)
    const outsideElement = document.createElement("div");
    document.body.appendChild(outsideElement);

    await user.click(outsideElement);

    // Cleanup
    document.body.removeChild(outsideElement);

    expect(onClose).toHaveBeenCalled();
  });

  it("does not call onClose when clicking inside dropdown", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    const { container } = renderWithProviders(
      <Dropdown isOpen={true} onClose={onClose}>
        <button>Inside Button</button>
      </Dropdown>
    );

    const button = within(container).getByText("Inside Button");
    await user.click(button);

    expect(onClose).not.toHaveBeenCalled();
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(
      <Dropdown isOpen={true} onClose={jest.fn()} className="custom-dropdown">
        <div>Content</div>
      </Dropdown>
    );
    expect(container.firstChild).toHaveClass("custom-dropdown");
  });

  it("renders children correctly", async () => {
    renderWithProviders(
      <Dropdown isOpen={true} onClose={jest.fn()}>
        <div>Child 1</div>
        <div>Child 2</div>
      </Dropdown>
    );
    await waitFor(() => {
      expect(screen.queryByText("Child 1")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.queryByText("Child 2")).toBeInTheDocument();
    });
  });
});
