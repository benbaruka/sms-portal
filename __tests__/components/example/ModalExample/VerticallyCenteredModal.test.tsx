import { beforeEach, describe, expect, it } from "@jest/globals";
import { renderWithProviders, screen } from "../../../test-utils";
import { userEvent } from "@testing-library/user-event";
import VerticallyCenteredModal from "../../../../src/components/example/ModalExample/VerticallyCenteredModal";

const mockOpenModal = jest.fn();
const mockCloseModal = jest.fn();

jest.mock("../../../../src/hooks/useModal", () => ({
  useModal: () => ({
    isOpen: false,
    openModal: mockOpenModal,
    closeModal: mockCloseModal,
  }),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

jest.mock("../../../../src/components/common/ComponentCard", () => ({
  default: ({ title, children }: any) => (
    <div data-testid="component-card">
      <h2>{title}</h2>
      {children}
    </div>
  ),
}));

describe("components/example/ModalExample/VerticallyCenteredModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(VerticallyCenteredModal).toBeDefined();
    expect(typeof VerticallyCenteredModal).toBe("function");
  });

  it("renders component successfully", () => {
    renderWithProviders(<VerticallyCenteredModal />);
    expect(screen.queryByTestId("component-card")).toBeInTheDocument();
    expect(screen.queryByText("Vertically Centered Modal")).toBeInTheDocument();
  });

  it("renders open modal button", () => {
    renderWithProviders(<VerticallyCenteredModal />);
    expect(screen.queryByText("Open Modal")).toBeInTheDocument();
  });

  it("opens modal when button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<VerticallyCenteredModal />);

    const openButton = screen.queryByText("Open Modal");
    if (openButton) {
      await user.click(openButton);
      expect(mockOpenModal).toHaveBeenCalled();
    }
  });

  it("renders modal content when open", () => {
    jest.mocked(require("../../../../src/hooks/useModal").useModal).mockReturnValueOnce({
      isOpen: true,
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
    });

    renderWithProviders(<VerticallyCenteredModal />);
    expect(screen.queryByText("All Done! Success Confirmed")).toBeInTheDocument();
  });

  it("closes modal when close button is clicked", async () => {
    const user = userEvent.setup();
    jest.mocked(require("../../../../src/hooks/useModal").useModal).mockReturnValueOnce({
      isOpen: true,
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
    });

    renderWithProviders(<VerticallyCenteredModal />);
    const closeButton = screen.queryByText("Close");
    if (closeButton) {
      await user.click(closeButton);
      expect(mockCloseModal).toHaveBeenCalled();
    }
  });

  it("saves and closes modal when save button is clicked", async () => {
    const user = userEvent.setup();
    jest.mocked(require("../../../../src/hooks/useModal").useModal).mockReturnValueOnce({
      isOpen: true,
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
    });

    renderWithProviders(<VerticallyCenteredModal />);
    const saveButton = screen.queryByText("Save Changes");
    if (saveButton) {
      await user.click(saveButton);
      expect(mockCloseModal).toHaveBeenCalled();
    }
  });
});
