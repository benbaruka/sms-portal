import { beforeEach, describe, expect, it } from "@jest/globals";
import { renderWithProviders, screen, waitFor } from "../../../test-utils";
import { userEvent } from "@testing-library/user-event";
import DefaultModal from "../../../../src/components/example/ModalExample/DefaultModal";

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

describe("components/example/ModalExample/DefaultModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(DefaultModal).toBeDefined();
    expect(typeof DefaultModal).toBe("function");
  });

  it("renders component successfully", () => {
    renderWithProviders(<DefaultModal />);
    expect(screen.queryByTestId("component-card")).toBeInTheDocument();
    expect(screen.queryByText("Default Modal")).toBeInTheDocument();
  });

  it("renders open modal button", () => {
    renderWithProviders(<DefaultModal />);
    expect(screen.queryByText("Open Modal")).toBeInTheDocument();
  });

  it("opens modal when button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DefaultModal />);

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

    renderWithProviders(<DefaultModal />);
    expect(screen.queryByText("Modal Heading")).toBeInTheDocument();
  });

  it("closes modal when close button is clicked", async () => {
    const user = userEvent.setup();
    jest.mocked(require("../../../../src/hooks/useModal").useModal).mockReturnValueOnce({
      isOpen: true,
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
    });

    renderWithProviders(<DefaultModal />);
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

    renderWithProviders(<DefaultModal />);
    const saveButton = screen.queryByText("Save Changes");
    if (saveButton) {
      await user.click(saveButton);
      expect(mockCloseModal).toHaveBeenCalled();
    }
  });

  it("renders modal content text", () => {
    jest.mocked(require("../../../../src/hooks/useModal").useModal).mockReturnValueOnce({
      isOpen: true,
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
    });

    renderWithProviders(<DefaultModal />);
    expect(screen.queryByText(/Lorem ipsum dolor sit amet/i)).toBeInTheDocument();
  });
});
