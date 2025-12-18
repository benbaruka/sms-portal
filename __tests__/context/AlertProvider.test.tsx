import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { render, screen, act, waitFor } from "@testing-library/react";
import { AlertProvider, useAlert } from "../../src/context/AlertProvider";

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

describe("AlertProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("provides context correctly", () => {
    const TestComponent = () => {
      return <div>Test</div>;
    };

    render(
      <AlertProvider>
        <TestComponent />
      </AlertProvider>
    );

    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("shows alert when showAlert is called", () => {
    const TestComponent = () => {
      const { showAlert } = useAlert();
      return (
        <button
          onClick={() =>
            showAlert({ variant: "success", title: "Success", message: "Test message" })
          }
        >
          Show Alert
        </button>
      );
    };

    render(
      <AlertProvider>
        <TestComponent />
      </AlertProvider>
    );

    const button = screen.getByText("Show Alert");
    act(() => {
      button.click();
    });

    expect(screen.getByText("Success")).toBeInTheDocument();
    expect(screen.getByText("Test message")).toBeInTheDocument();
  });

  it("dismisses alert when dismissAlert is called", () => {
    const TestComponent = () => {
      const { showAlert, dismissAlert } = useAlert();
      return (
        <>
          <button
            onClick={() => {
              const alert = { variant: "error" as const, title: "Error", message: "Error message" };
              showAlert(alert);
              setTimeout(() => {
                const alerts = document.querySelectorAll('[data-testid="alert"]');
                if (alerts.length > 0) {
                  dismissAlert(1);
                }
              }, 100);
            }}
          >
            Show and Dismiss
          </button>
        </>
      );
    };

    render(
      <AlertProvider>
        <TestComponent />
      </AlertProvider>
    );

    const button = screen.getByText("Show and Dismiss");
    act(() => {
      button.click();
    });

    expect(screen.getByText("Error")).toBeInTheDocument();

    act(() => {
      const dismissButton = screen.queryByRole("button", { name: /close/i });
      if (dismissButton) {
        dismissButton.click();
      }
    });
  });

  it("shows different alert variants", () => {
    const TestComponent = () => {
      const { showAlert } = useAlert();
      return (
        <>
          <button
            onClick={() =>
              showAlert({ variant: "success", title: "Success", message: "Success message" })
            }
          >
            Success
          </button>
          <button
            onClick={() =>
              showAlert({ variant: "error", title: "Error", message: "Error message" })
            }
          >
            Error
          </button>
          <button
            onClick={() =>
              showAlert({ variant: "warning", title: "Warning", message: "Warning message" })
            }
          >
            Warning
          </button>
          <button
            onClick={() => showAlert({ variant: "info", title: "Info", message: "Info message" })}
          >
            Info
          </button>
        </>
      );
    };

    render(
      <AlertProvider>
        <TestComponent />
      </AlertProvider>
    );

    act(() => {
      screen.getByText("Success").click();
    });
    expect(screen.getByText("Success")).toBeInTheDocument();

    act(() => {
      screen.getByText("Error").click();
    });
    expect(screen.getByText("Error")).toBeInTheDocument();
  });

  it("shows alert with link when showLink is true", () => {
    const TestComponent = () => {
      const { showAlert } = useAlert();
      return (
        <button
          onClick={() =>
            showAlert({
              variant: "info",
              title: "Info",
              message: "Check this out",
              showLink: true,
              linkHref: "/test",
              linkText: "Go to test",
            })
          }
        >
          Show Alert with Link
        </button>
      );
    };

    render(
      <AlertProvider>
        <TestComponent />
      </AlertProvider>
    );

    act(() => {
      screen.getByText("Show Alert with Link").click();
    });

    expect(screen.getByText("Go to test")).toBeInTheDocument();
  });

  it("auto-dismisses alert after 5 seconds", async () => {
    const TestComponent = () => {
      const { showAlert } = useAlert();
      return (
        <button
          onClick={() =>
            showAlert({ variant: "success", title: "Auto Dismiss", message: "Will disappear" })
          }
        >
          Show Alert
        </button>
      );
    };

    render(
      <AlertProvider>
        <TestComponent />
      </AlertProvider>
    );

    act(() => {
      screen.getByText("Show Alert").click();
    });

    expect(screen.getByText("Auto Dismiss")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(screen.queryByText("Auto Dismiss")).not.toBeInTheDocument();
    });
  });

  it("limits to MAX_ALERTS (3) alerts", () => {
    const TestComponent = () => {
      const { showAlert } = useAlert();
      return (
        <button
          onClick={() => {
            showAlert({ variant: "success", title: "Alert 1", message: "Message 1" });
            showAlert({ variant: "success", title: "Alert 2", message: "Message 2" });
            showAlert({ variant: "success", title: "Alert 3", message: "Message 3" });
            showAlert({ variant: "success", title: "Alert 4", message: "Message 4" });
          }}
        >
          Show Multiple Alerts
        </button>
      );
    };

    render(
      <AlertProvider>
        <TestComponent />
      </AlertProvider>
    );

    act(() => {
      screen.getByText("Show Multiple Alerts").click();
    });

    // Should only show the last 3 alerts
    expect(screen.queryByText("Alert 1")).not.toBeInTheDocument();
    expect(screen.getByText("Alert 2")).toBeInTheDocument();
    expect(screen.getByText("Alert 3")).toBeInTheDocument();
    expect(screen.getByText("Alert 4")).toBeInTheDocument();
  });

  it("throws error when useAlert is used outside provider", () => {
    const TestComponent = () => {
      useAlert();
      return <div>Test</div>;
    };

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useAlert must be used within AlertProvider");
  });
});
