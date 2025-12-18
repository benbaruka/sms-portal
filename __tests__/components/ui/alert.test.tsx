import { renderWithProviders, screen, waitFor } from "../../test-utils";
import { Alert, AlertTitle, AlertDescription } from "../../../src/components/ui/alert";

describe("components/ui/alert.tsx", () => {
  it("renders alert component", () => {
    const { container } = renderWithProviders(
      <Alert>
        <AlertTitle>Alert Title</AlertTitle>
        <AlertDescription>Alert Description</AlertDescription>
      </Alert>
    );
    expect(container.textContent).toContain("Alert Title");
    expect(container.textContent).toContain("Alert Description");
  });

  it("renders with default variant", () => {
    const { container } = renderWithProviders(
      <Alert>
        <AlertTitle>Title</AlertTitle>
      </Alert>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders with destructive variant", () => {
    const { container } = renderWithProviders(
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
      </Alert>
    );
    expect(container.firstChild?.className).toContain("border-destructive");
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(
      <Alert className="custom-alert">
        <AlertTitle>Title</AlertTitle>
      </Alert>
    );
    expect(container.firstChild).toHaveClass("custom-alert");
  });

  it("renders alert with only title", async () => {
    renderWithProviders(
      <Alert>
        <AlertTitle>Just Title</AlertTitle>
      </Alert>
    );
    await waitFor(() => {
      expect(screen.queryByText("Just Title")).toBeInTheDocument();
    });
  });

  it("renders alert with only description", async () => {
    renderWithProviders(
      <Alert>
        <AlertDescription>Just Description</AlertDescription>
      </Alert>
    );
    await waitFor(() => {
      expect(screen.queryByText("Just Description")).toBeInTheDocument();
    });
  });
});
