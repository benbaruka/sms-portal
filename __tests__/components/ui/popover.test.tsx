import { Button } from "../../../src/components/ui/button";

import { Popover, PopoverContent, PopoverTrigger } from "../../../src/components/ui/popover";
import { renderWithProviders, screen, waitFor } from "../../test-utils";

jest.mock("@radix-ui/react-popover", () => ({
  Root: ({ children, ...props }: any) => (
    <div data-testid="popover-root" {...props}>
      {children}
    </div>
  ),
  Trigger: ({ children, ...props }: any) => (
    <div data-testid="popover-trigger" {...props}>
      {children}
    </div>
  ),
  Portal: ({ children, ...props }: any) => (
    <div data-testid="popover-portal" {...props}>
      {children}
    </div>
  ),
  Content: ({ children, ...props }: any) => (
    <div data-testid="popover-content" {...props}>
      {children}
    </div>
  ),
  Anchor: ({ children, ...props }: any) => (
    <div data-testid="popover-anchor" {...props}>
      {children}
    </div>
  ),
}));

describe("components/ui/popover.tsx", () => {
  it("renders popover component", async () => {
    renderWithProviders(
      <Popover>
        <PopoverTrigger asChild>
          <Button>Open</Button>
        </PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>
    );
    await waitFor(() => {
      const buttons = screen.getAllByText("Open");
      expect(buttons[0]).toBeInTheDocument();
    });
  });

  it("renders popover with content", async () => {
    renderWithProviders(
      <Popover open>
        <PopoverTrigger asChild>
          <Button>Trigger</Button>
        </PopoverTrigger>
        <PopoverContent>Popover Content</PopoverContent>
      </Popover>
    );
    await waitFor(() => {
      expect(screen.queryByText("Popover Content")).toBeInTheDocument();
    });
  });

  it("applies custom className to content", async () => {
    const { container } = renderWithProviders(
      <Popover open>
        <PopoverContent className="custom-class">Content</PopoverContent>
      </Popover>
    );
    await waitFor(() => {
      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });
  });
});
