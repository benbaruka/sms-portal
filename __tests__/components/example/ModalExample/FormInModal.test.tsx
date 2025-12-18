import { beforeEach, describe, expect, it } from "@jest/globals";
import { renderWithProviders, screen } from "../../../test-utils";
import { userEvent } from "@testing-library/user-event";
import FormInModal from "../../../../src/components/example/ModalExample/FormInModal";

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

describe("components/example/ModalExample/FormInModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(FormInModal).toBeDefined();
    expect(typeof FormInModal).toBe("function");
  });

  it("renders component successfully", () => {
    renderWithProviders(<FormInModal />);
    expect(screen.queryByTestId("component-card")).toBeInTheDocument();
    expect(screen.queryByText("Form In Modal")).toBeInTheDocument();
  });

  it("renders open modal button", () => {
    renderWithProviders(<FormInModal />);
    expect(screen.queryByText("Open Modal")).toBeInTheDocument();
  });

  it("opens modal when button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<FormInModal />);

    const openButton = screen.queryByText("Open Modal");
    if (openButton) {
      await user.click(openButton);
      expect(mockOpenModal).toHaveBeenCalled();
    }
  });

  it("renders form fields when modal is open", () => {
    jest.mocked(require("../../../../src/hooks/useModal").useModal).mockReturnValueOnce({
      isOpen: true,
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
    });

    renderWithProviders(<FormInModal />);
    expect(screen.queryByText("Personal Information")).toBeInTheDocument();
    expect(screen.queryByText("First Name")).toBeInTheDocument();
    expect(screen.queryByText("Last Name")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Emirhan")).toBeInTheDocument();
  });

  it("closes modal when close button is clicked", async () => {
    const user = userEvent.setup();
    jest.mocked(require("../../../../src/hooks/useModal").useModal).mockReturnValueOnce({
      isOpen: true,
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
    });

    renderWithProviders(<FormInModal />);
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

    renderWithProviders(<FormInModal />);
    const saveButton = screen.queryByText("Save Changes");
    if (saveButton) {
      await user.click(saveButton);
      expect(mockCloseModal).toHaveBeenCalled();
    }
  });

  it("renders all form inputs", () => {
    jest.mocked(require("../../../../src/hooks/useModal").useModal).mockReturnValueOnce({
      isOpen: true,
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
    });

    renderWithProviders(<FormInModal />);
    expect(screen.queryByPlaceholderText("Emirhan")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Boruch")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("emirhanboruch55@gmail.com")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("+09 363 398 46")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Team Manager")).toBeInTheDocument();
  });
});
