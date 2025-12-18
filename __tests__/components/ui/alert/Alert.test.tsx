import { within } from "@testing-library/dom";

import Alert from "../../../../src/components/ui/alert/Alert";
import { fireEvent, renderWithProviders, waitFor } from "../../../test-utils";

// Mock next/link
jest.mock("next/link", () => ({
  __esModule: true,
  default: (props: { href: string; children: React.ReactNode }) => (
    <a href={props.href}>{props.children}</a>
  ),
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  X: () => <svg data-testid="x-icon" />,
}));

describe("components/ui/alert/Alert.tsx", () => {
  beforeEach(() => {
    jest.useRealTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it("renders alert component", async () => {
    const { container } = renderWithProviders(
      <Alert id={1} variant="success" title="Success" message="Operation successful" />
    );
    await waitFor(() => {
      expect(within(container).queryByText("Success")).toBeInTheDocument();
      expect(within(container).queryByText("Operation successful")).toBeInTheDocument();
    });
  });

  it("renders success variant", async () => {
    const { container } = renderWithProviders(
      <Alert id={1} variant="success" title="Success" message="Message" />
    );
    await waitFor(() => {
      const alertElement = container.querySelector(".border-success-500");
      expect(alertElement).toBeInTheDocument();
    });
  });

  it("renders error variant", async () => {
    const { container } = renderWithProviders(
      <Alert id={1} variant="error" title="Error" message="Message" />
    );
    await waitFor(() => {
      const alertElement = container.querySelector(".border-error-500");
      expect(alertElement).toBeInTheDocument();
    });
  });

  it("renders warning variant", async () => {
    const { container } = renderWithProviders(
      <Alert id={1} variant="warning" title="Warning" message="Message" />
    );
    await waitFor(() => {
      const alertElement = container.querySelector(".border-warning-500");
      expect(alertElement).toBeInTheDocument();
    });
  });

  it("renders info variant", async () => {
    const { container } = renderWithProviders(
      <Alert id={1} variant="info" title="Info" message="Message" />
    );
    await waitFor(() => {
      const alertElement = container.querySelector(".border-blue-light-500");
      expect(alertElement).toBeInTheDocument();
    });
  });

  it("renders dismiss button when onDismiss is provided", async () => {
    const onDismiss = jest.fn();
    const { container } = renderWithProviders(
      <Alert id={1} variant="success" title="Title" message="Message" onDismiss={onDismiss} />
    );
    await waitFor(
      () => {
        expect(within(container).getByLabelText("Fermer")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("does not render dismiss button when onDismiss is not provided", async () => {
    const { container } = renderWithProviders(
      <Alert id={1} variant="success" title="Title" message="Message" />
    );
    await waitFor(() => {
      expect(within(container).queryByLabelText("Fermer")).not.toBeInTheDocument();
    });
  });

  it("calls onDismiss when dismiss button is clicked", async () => {
    const onDismiss = jest.fn();
    const { container } = renderWithProviders(
      <Alert id={1} variant="success" title="Title" message="Message" onDismiss={onDismiss} />
    );

    await waitFor(
      () => {
        expect(within(container).queryByLabelText("Fermer")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    jest.useFakeTimers();
    const dismissButton = within(container).getByLabelText("Fermer");
    fireEvent.click(dismissButton);

    // Avancer les timers pour déclencher l'animation
    jest.advanceTimersByTime(300);

    expect(onDismiss).toHaveBeenCalledWith(1);
    jest.useRealTimers();
  });

  it("renders link when showLink is true", async () => {
    const { container } = renderWithProviders(
      <Alert
        id={1}
        variant="info"
        title="Title"
        message="Message"
        showLink={true}
        linkHref="/learn-more"
        linkText="Learn more"
      />
    );
    await waitFor(
      () => {
        const link = within(container).getByRole("link", { name: "Learn more" });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute("href", "/learn-more");
      },
      { timeout: 3000 }
    );
  });

  it("uses default link text when not provided", async () => {
    const { container } = renderWithProviders(
      <Alert id={1} variant="info" title="Title" message="Message" showLink={true} />
    );
    await waitFor(
      () => {
        expect(within(container).getByText("Learn more")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("hides alert after dismiss with animation", async () => {
    const onDismiss = jest.fn();
    const { container } = renderWithProviders(
      <Alert id={1} variant="success" title="Title" message="Message" onDismiss={onDismiss} />
    );

    await waitFor(() => {
      expect(within(container).queryByLabelText("Fermer")).toBeInTheDocument();
    });

    jest.useFakeTimers();
    const dismissButton = within(container).getByLabelText("Fermer");

    fireEvent.click(dismissButton);

    // Avancer les timers pour déclencher le callback onDismiss
    jest.advanceTimersByTime(300);
    expect(onDismiss).toHaveBeenCalledWith(1);

    // Vérifier que l'alerte existe toujours dans le DOM (même si elle est cachée)
    const alert = container.firstChild as HTMLElement;
    expect(alert).toBeInTheDocument();
    jest.useRealTimers();
  });

  it("renders with all props", async () => {
    const onDismiss = jest.fn();
    const { container } = renderWithProviders(
      <Alert
        id={2}
        variant="warning"
        title="Warning Title"
        message="Warning message"
        showLink={true}
        linkHref="/warning-link"
        linkText="Warning link"
        onDismiss={onDismiss}
      />
    );

    await waitFor(
      () => {
        expect(within(container).getByText("Warning Title")).toBeInTheDocument();
        expect(within(container).getByText("Warning message")).toBeInTheDocument();
        expect(within(container).getByRole("link", { name: "Warning link" })).toBeInTheDocument();
        expect(within(container).getByLabelText("Fermer")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("handles dismiss without onDismiss callback", async () => {
    const { container } = renderWithProviders(
      <Alert id={1} variant="success" title="Title" message="Message" />
    );

    await waitFor(() => {
      // Should not have dismiss button
      expect(within(container).queryByLabelText("Fermer")).not.toBeInTheDocument();
      // Component should still render
      expect(within(container).queryByText("Title")).toBeInTheDocument();
      expect(within(container).queryByText("Message")).toBeInTheDocument();
    });
  });

  it("renders with default link href when not provided", async () => {
    const { container } = renderWithProviders(
      <Alert id={1} variant="info" title="Title" message="Message" showLink={true} />
    );
    await waitFor(() => {
      const link = within(container).queryByRole("link", { name: "Learn more" });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "#");
    });
  });
});
