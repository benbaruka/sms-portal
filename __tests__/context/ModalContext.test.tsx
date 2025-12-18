import { describe, it, expect, beforeEach } from "@jest/globals";
import { render, screen, act } from "@testing-library/react";
import { ModalProvider, useModal } from "../../src/context/ModalContext";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

describe("ModalContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("provides context correctly", () => {
    const TestComponent = () => {
      return <div>Test</div>;
    };

    render(
      <ModalProvider>
        <TestComponent />
      </ModalProvider>
    );

    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("initializes with closed modal", () => {
    const TestComponent = () => {
      const { isOpen } = useModal();
      return <div>{isOpen ? "Open" : "Closed"}</div>;
    };

    render(
      <ModalProvider>
        <TestComponent />
      </ModalProvider>
    );

    expect(screen.getByText("Closed")).toBeInTheDocument();
  });

  it("opens modal with content", () => {
    const TestComponent = () => {
      const { isOpen, openModal, modalContent } = useModal();
      return (
        <div>
          <div>{isOpen ? "Open" : "Closed"}</div>
          <div>{modalContent?.title || "No content"}</div>
          <button onClick={() => openModal({ title: "Test Title", content: "Test Content" })}>
            Open Modal
          </button>
        </div>
      );
    };

    render(
      <ModalProvider>
        <TestComponent />
      </ModalProvider>
    );

    expect(screen.getByText("Closed")).toBeInTheDocument();

    act(() => {
      screen.getByText("Open Modal").click();
    });

    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("closes modal", () => {
    const TestComponent = () => {
      const { isOpen, openModal, closeModal } = useModal();
      return (
        <div>
          <div>{isOpen ? "Open" : "Closed"}</div>
          <button onClick={() => openModal({ title: "Test", content: "Content" })}>Open</button>
          <button onClick={closeModal}>Close</button>
        </div>
      );
    };

    render(
      <ModalProvider>
        <TestComponent />
      </ModalProvider>
    );

    act(() => {
      screen.getByText("Open").click();
    });

    expect(screen.getByText("Open")).toBeInTheDocument();

    act(() => {
      screen.getByText("Close").click();
    });

    expect(screen.getByText("Closed")).toBeInTheDocument();
  });

  it("opens modal with all properties", () => {
    const TestComponent = () => {
      const { openModal, modalContent } = useModal();
      return (
        <div>
          <div>Title: {modalContent?.title || "None"}</div>
          <div>Size: {modalContent?.size || "None"}</div>
          <div>FullHeight: {modalContent?.fullHeight ? "Yes" : "No"}</div>
          <button
            onClick={() =>
              openModal({
                title: "Full Modal",
                content: <div>Content</div>,
                size: "large",
                fullHeight: true,
                footer: <div>Footer</div>,
                customClasses: "custom",
                customWidth: "800px",
              })
            }
          >
            Open Full Modal
          </button>
        </div>
      );
    };

    render(
      <ModalProvider>
        <TestComponent />
      </ModalProvider>
    );

    act(() => {
      screen.getByText("Open Full Modal").click();
    });

    expect(screen.getByText("Title: Full Modal")).toBeInTheDocument();
    expect(screen.getByText("Size: large")).toBeInTheDocument();
    expect(screen.getByText("FullHeight: Yes")).toBeInTheDocument();
  });

  it("clears content when modal is closed", () => {
    const TestComponent = () => {
      const { openModal, closeModal, modalContent } = useModal();
      return (
        <div>
          <div>{modalContent ? "Has Content" : "No Content"}</div>
          <button onClick={() => openModal({ title: "Test", content: "Content" })}>Open</button>
          <button onClick={closeModal}>Close</button>
        </div>
      );
    };

    render(
      <ModalProvider>
        <TestComponent />
      </ModalProvider>
    );

    act(() => {
      screen.getByText("Open").click();
    });

    expect(screen.getByText("Has Content")).toBeInTheDocument();

    act(() => {
      screen.getByText("Close").click();
    });

    expect(screen.getByText("No Content")).toBeInTheDocument();
  });

  it("throws error when useModal is used outside provider", () => {
    const TestComponent = () => {
      useModal();
      return <div>Test</div>;
    };

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useModal must be used within a ModalProvider");
  });
});
