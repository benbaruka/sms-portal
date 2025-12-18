import { within } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/react";

import { Modal } from "../../../../src/components/ui/modal/index";

describe("components/ui/modal/index.tsx", () => {
  beforeEach(() => {
    document.body.style.overflow = "";
  });

  it("renders modal when isOpen is true", async () => {
    const { container } = render(
      <Modal isOpen={true} onClose={jest.fn()}>
        <div>Modal Content</div>
      </Modal>
    );
    await waitFor(() => {
      expect(within(container).queryByText("Modal Content")).toBeInTheDocument();
    });
  });

  it("does not render modal when isOpen is false", () => {
    const { container } = render(
      <Modal isOpen={false} onClose={jest.fn()}>
        <div>Modal Content</div>
      </Modal>
    );
    expect(within(container).queryByText("Modal Content")).not.toBeInTheDocument();
  });

  it("calls onClose when Escape key is pressed", async () => {
    const onClose = jest.fn();

    const { container } = render(
      <Modal isOpen={true} onClose={onClose}>
        <div>Content</div>
      </Modal>
    );

    await within(container).findByTestId("modal-content");
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it("disables body scroll when modal is open", async () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()}>
        <div>Content</div>
      </Modal>
    );

    await waitFor(() => {
      expect(document.body.style.overflow).toBe("hidden");
    });
  });

  it("renders close button by default", async () => {
    const onClose = jest.fn();
    const { container } = render(
      <Modal isOpen={true} onClose={onClose}>
        <div>Content</div>
      </Modal>
    );

    const closeButton = await within(container).findByLabelText(/close modal/i);
    expect(closeButton).toBeInTheDocument();
  });

  it("does not render close button when showCloseButton is false", () => {
    const { container } = render(
      <Modal isOpen={true} onClose={jest.fn()} showCloseButton={false}>
        <div>Content</div>
      </Modal>
    );

    const closeButton = within(container).queryByRole("button", { name: /close/i });
    expect(closeButton).not.toBeInTheDocument();
  });

  it("renders fullscreen modal when isFullscreen is true", async () => {
    const { container } = render(
      <Modal isOpen={true} onClose={jest.fn()} isFullscreen={true}>
        <div>Content</div>
      </Modal>
    );

    const modalContent = await within(container).findByTestId("modal-content");
    expect(modalContent).toBeInTheDocument();
    expect(modalContent.className).toContain("w-full");
    expect(modalContent.className).toContain("h-full");
  });

  it("applies custom className", async () => {
    const { container } = render(
      <Modal isOpen={true} onClose={jest.fn()} className="custom-modal">
        <div>Content</div>
      </Modal>
    );

    await waitFor(() => {
      expect(container.querySelector(".custom-modal")).toBeInTheDocument();
    });
  });

  it("restores body scroll when modal is closed", async () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={jest.fn()}>
        <div>Content</div>
      </Modal>
    );

    await waitFor(() => {
      expect(document.body.style.overflow).toBe("hidden");
    });

    rerender(
      <Modal isOpen={false} onClose={jest.fn()}>
        <div>Content</div>
      </Modal>
    );

    await waitFor(() => {
      expect(document.body.style.overflow).toBe("unset");
    });
  });
});
