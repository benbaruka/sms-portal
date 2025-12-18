import { beforeEach, describe, expect, it } from "@jest/globals";
import { renderWithProviders, screen } from "../../../test-utils";
import { userEvent } from "@testing-library/user-event";
import ModalBasedAlerts from "../../../../src/components/example/ModalExample/ModalBasedAlerts";

const mockUseModal = jest.fn(() => ({
  isOpen: false,
  openModal: jest.fn(),
  closeModal: jest.fn(),
}));

jest.mock("../../../../src/hooks/useModal", () => ({
  useModal: () => mockUseModal(),
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

describe("components/example/ModalExample/ModalBasedAlerts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(ModalBasedAlerts).toBeDefined();
    expect(typeof ModalBasedAlerts).toBe("function");
  });

  it("renders component successfully", () => {
    renderWithProviders(<ModalBasedAlerts />);
    expect(screen.queryByTestId("component-card")).toBeInTheDocument();
    expect(screen.queryByText("Modal Based Alerts")).toBeInTheDocument();
  });

  it("renders all alert buttons", () => {
    renderWithProviders(<ModalBasedAlerts />);
    expect(screen.queryByText("Success Alert")).toBeInTheDocument();
    expect(screen.queryByText("Info Alert")).toBeInTheDocument();
    expect(screen.queryByText("Warning Alert")).toBeInTheDocument();
    expect(screen.queryByText("Danger Alert")).toBeInTheDocument();
  });

  it("opens success modal when success button is clicked", async () => {
    const user = userEvent.setup();
    const mockOpenSuccess = jest.fn();
    mockUseModal.mockReturnValueOnce({
      isOpen: false,
      openModal: mockOpenSuccess,
      closeModal: jest.fn(),
    });
    mockUseModal.mockReturnValueOnce({
      isOpen: false,
      openModal: jest.fn(),
      closeModal: jest.fn(),
    });
    mockUseModal.mockReturnValueOnce({
      isOpen: false,
      openModal: jest.fn(),
      closeModal: jest.fn(),
    });
    mockUseModal.mockReturnValueOnce({
      isOpen: false,
      openModal: jest.fn(),
      closeModal: jest.fn(),
    });

    renderWithProviders(<ModalBasedAlerts />);
    const successButton = screen.queryByText("Success Alert");
    if (successButton) {
      await user.click(successButton);
      expect(mockOpenSuccess).toHaveBeenCalled();
    }
  });

  it("renders success modal content when open", () => {
    mockUseModal.mockReturnValueOnce({
      isOpen: true,
      openModal: jest.fn(),
      closeModal: jest.fn(),
    });
    mockUseModal.mockReturnValueOnce({
      isOpen: false,
      openModal: jest.fn(),
      closeModal: jest.fn(),
    });
    mockUseModal.mockReturnValueOnce({
      isOpen: false,
      openModal: jest.fn(),
      closeModal: jest.fn(),
    });
    mockUseModal.mockReturnValueOnce({
      isOpen: false,
      openModal: jest.fn(),
      closeModal: jest.fn(),
    });

    renderWithProviders(<ModalBasedAlerts />);
    expect(screen.queryByText("Well Done!")).toBeInTheDocument();
  });

  it("renders info modal content when open", () => {
    mockUseModal.mockReturnValueOnce({
      isOpen: false,
      openModal: jest.fn(),
      closeModal: jest.fn(),
    });
    mockUseModal.mockReturnValueOnce({
      isOpen: true,
      openModal: jest.fn(),
      closeModal: jest.fn(),
    });
    mockUseModal.mockReturnValueOnce({
      isOpen: false,
      openModal: jest.fn(),
      closeModal: jest.fn(),
    });
    mockUseModal.mockReturnValueOnce({
      isOpen: false,
      openModal: jest.fn(),
      closeModal: jest.fn(),
    });

    renderWithProviders(<ModalBasedAlerts />);
    expect(screen.queryByText("Information Alert!")).toBeInTheDocument();
  });

  it("renders warning modal content when open", () => {
    mockUseModal.mockReturnValueOnce({
      isOpen: false,
      openModal: jest.fn(),
      closeModal: jest.fn(),
    });
    mockUseModal.mockReturnValueOnce({
      isOpen: false,
      openModal: jest.fn(),
      closeModal: jest.fn(),
    });
    mockUseModal.mockReturnValueOnce({
      isOpen: true,
      openModal: jest.fn(),
      closeModal: jest.fn(),
    });
    mockUseModal.mockReturnValueOnce({
      isOpen: false,
      openModal: jest.fn(),
      closeModal: jest.fn(),
    });

    renderWithProviders(<ModalBasedAlerts />);
    expect(screen.queryByText("Warning Alert!")).toBeInTheDocument();
  });

  it("renders error modal content when open", () => {
    mockUseModal.mockReturnValueOnce({
      isOpen: false,
      openModal: jest.fn(),
      closeModal: jest.fn(),
    });
    mockUseModal.mockReturnValueOnce({
      isOpen: false,
      openModal: jest.fn(),
      closeModal: jest.fn(),
    });
    mockUseModal.mockReturnValueOnce({
      isOpen: false,
      openModal: jest.fn(),
      closeModal: jest.fn(),
    });
    mockUseModal.mockReturnValueOnce({
      isOpen: true,
      openModal: jest.fn(),
      closeModal: jest.fn(),
    });

    renderWithProviders(<ModalBasedAlerts />);
    expect(screen.queryByText("Danger Alert!")).toBeInTheDocument();
  });
});
