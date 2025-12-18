import { renderWithProviders, screen, waitFor } from "../../test-utils";
import { Badge } from "../../../src/components/ui/badge";

describe("components/ui/badge.tsx", () => {
  it("renders badge component", async () => {
    renderWithProviders(<Badge>Badge Text</Badge>);
    await waitFor(() => {
      expect(screen.queryByText("Badge Text")).toBeInTheDocument();
    });
  });

  it("renders badge with default variant", () => {
    const { container } = renderWithProviders(<Badge>Default</Badge>);
    const badge = container.querySelector("div");
    expect(badge).toHaveClass("bg-primary");
  });

  it("renders badge with secondary variant", () => {
    const { container } = renderWithProviders(<Badge variant="secondary">Secondary</Badge>);
    const badge = container.querySelector("div");
    expect(badge).toHaveClass("bg-gray-200");
  });

  it("renders badge with destructive variant", () => {
    const { container } = renderWithProviders(<Badge variant="destructive">Error</Badge>);
    const badge = container.querySelector("div");
    expect(badge).toHaveClass("bg-error-500");
  });

  it("renders badge with success variant", () => {
    const { container } = renderWithProviders(<Badge variant="success">Success</Badge>);
    const badge = container.querySelector("div");
    expect(badge).toHaveClass("bg-success");
  });

  it("renders badge with warning variant", () => {
    const { container } = renderWithProviders(<Badge variant="warning">Warning</Badge>);
    const badge = container.querySelector("div");
    expect(badge).toHaveClass("bg-warning");
  });

  it("renders badge with outline variant", () => {
    const { container } = renderWithProviders(<Badge variant="outline">Outline</Badge>);
    const badge = container.querySelector("div");
    expect(badge).toHaveClass("border-gray-300");
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(<Badge className="custom-badge">Badge</Badge>);
    const badge = container.querySelector("div");
    expect(badge).toHaveClass("custom-badge");
  });

  it("renders badge with children", async () => {
    renderWithProviders(
      <Badge>
        <span>Custom Content</span>
      </Badge>
    );
    await waitFor(() => {
      expect(screen.queryByText("Custom Content")).toBeInTheDocument();
    });
  });
});
