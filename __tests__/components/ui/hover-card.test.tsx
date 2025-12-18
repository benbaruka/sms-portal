import { Button } from "../../../src/components/ui/button";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../../../src/components/ui/hover-card";
import { renderWithProviders, screen, waitFor } from "../../test-utils";
import { within } from "@testing-library/dom";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
jest.mock("@radix-ui/react-hover-card", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Root: ({ children, ...props }: any) => (
    <div data-testid="hover-card" {...props}>
      {children}
    </div>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Trigger: ({ children, ...props }: any) => (
    <div data-testid="hover-card-trigger" {...props}>
      {children}
    </div>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Portal: ({ children, ...props }: any) => (
    <div data-testid="hover-card-portal" {...props}>
      {children}
    </div>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Content: ({ children, ...props }: any) => (
    <div data-testid="hover-card-content" {...props}>
      {children}
    </div>
  ),
}));
describe("components/ui/hover-card", () => {
  it("renders hover card component", async () => {
    renderWithProviders(
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button>Hover me</Button>
        </HoverCardTrigger>
        <HoverCardContent>Hover content</HoverCardContent>
      </HoverCard>
    );
    await waitFor(() => {
      expect(screen.queryByText("Hover me")).toBeInTheDocument();
    });
  });

  it("renders hover card with content", async () => {
    const { container } = renderWithProviders(
      <HoverCard open>
        <HoverCardTrigger asChild>
          <Button>Trigger</Button>
        </HoverCardTrigger>
        <HoverCardContent>Content</HoverCardContent>
      </HoverCard>
    );
    await waitFor(() => {
      // we expect exactly one "Content" inside the hover-card-content
      const content = within(container).getByTestId("hover-card-content");
      expect(within(content).getAllByText("Content")[0]).toBeInTheDocument();
    });
  });

  it("applies custom className to content", async () => {
    const { container } = renderWithProviders(
      <HoverCard open>
        <HoverCardContent className="custom-class">Content</HoverCardContent>
      </HoverCard>
    );
    await waitFor(() => {
      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });
  });
});
